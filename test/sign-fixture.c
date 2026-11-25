/*
 * sign-fixture.c -- produce a raptor-signed mp4 test fixture
 *
 * Signs an ordinary mp4 with the rmr_sign.h box format (see raptor/
 * rmr/rmr_sign.h) using a fixed, deterministic TEST key, so the repo
 * has reproducible VERIFIED / CONSISTENT / TAMPERED cases without
 * needing a camera. Spans follow the recorder's convention: a genesis
 * box after the head boxes (ftyp+moov when present), then one final
 * box over the remaining bytes.
 *
 * -g N adds N GPS records as rmr writes them (raptor rmr/rmr_gps.h): a
 * 'gps ' index in moov right after mvhd, signed while zeroed and filled
 * in afterwards, and the 256-byte 'freeGPS ' record boxes after mdat,
 * inside the final span. -B points the first index entry off its record.
 *
 * usage: sign-fixture [-g N [-B]] in.mp4 out.mp4
 * Prints the test public key (hex) on stdout.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <monocypher-ed25519.h>

#define BOX_SIZE 164
#define FLAG_FINAL 0x01
#define GPS_BOX 256

static void be32w(uint8_t *p, uint32_t v)
{
	p[0] = v >> 24;
	p[1] = v >> 16;
	p[2] = v >> 8;
	p[3] = v;
}

static void le32w(uint8_t *p, uint32_t v)
{
	p[0] = v;
	p[1] = v >> 8;
	p[2] = v >> 16;
	p[3] = v >> 24;
}

static void lef32w(uint8_t *p, float f)
{
	uint32_t v;
	memcpy(&v, &f, sizeof(v));
	le32w(p, v);
}

static uint32_t be32r(const uint8_t *p)
{
	return (uint32_t)p[0] << 24 | (uint32_t)p[1] << 16 | (uint32_t)p[2] << 8 | p[3];
}

/* A stock-layout record (no RTDx extension): a fix near the Greenwich
 * meridian, one second and a little faster each time. */
static void gps_record(uint8_t b[GPS_BOX], int i)
{
	memset(b, 0, GPS_BOX);
	be32w(b, GPS_BOX);
	memcpy(b + 4, "freeGPS ", 8);
	le32w(b + 0x0c, 0x2c);
	le32w(b + 0x10, 12);	 /* hour */
	le32w(b + 0x14, 0);	 /* minute */
	le32w(b + 0x18, i);	 /* second */
	le32w(b + 0x1c, 26);	 /* year - 2000 */
	le32w(b + 0x20, 1);	 /* month */
	le32w(b + 0x24, 1);	 /* day */
	memcpy(b + 0x28, "ANW", 3);
	lef32w(b + 0x2c, 5128.6740f);			/* 51 28.674' N */
	lef32w(b + 0x30, 0.0900f + 0.0300f * (float)i); /* 0 00.09' W, heading west */
	lef32w(b + 0x34, 10.0f + (float)i);		/* knots */
	lef32w(b + 0x38, 270.0f);
	le32w(b + 0x44, 256); /* 1 g down */
}

static const uint8_t sign_uuid[16] = {0xb0, 0x50, 0xbf, 0x07, 0x88, 0x56, 0x45, 0x98,
				      0x86, 0x9e, 0x44, 0xc4, 0xdc, 0x20, 0x8f, 0x26};

static void emit_box(FILE *out, const uint8_t *span, size_t span_len, uint8_t flags,
		     const uint8_t sk[64], const uint8_t pk[32], uint8_t prev_sig[64])
{
	uint8_t box[BOX_SIZE] = {0};
	box[3] = BOX_SIZE; /* 32-bit size, big-endian; 164 fits in one byte */
	memcpy(box + 4, "uuid", 4);
	memcpy(box + 8, sign_uuid, 16);
	box[24] = 1; /* version */
	box[25] = flags;

	uint8_t key_hash[64];
	crypto_sha512(key_hash, pk, 32);
	memcpy(box + 28, key_hash, 8); /* fingerprint */

	uint8_t span_hash[64];
	crypto_sha512(span_hash, span, span_len);
	memcpy(box + 36, span_hash, 64);

	uint8_t chain[128];
	memcpy(chain, span_hash, 64);
	memcpy(chain + 64, prev_sig, 64);
	crypto_ed25519_sign(box + 100, sk, chain, sizeof(chain));

	memcpy(prev_sig, box + 100, 64);
	fwrite(box, 1, BOX_SIZE, out);
}

int main(int argc, char **argv)
{
	int gps = 0, bad_index = 0, a = 1;
	while (a < argc && argv[a][0] == '-') {
		if (!strcmp(argv[a], "-g") && a + 1 < argc)
			gps = atoi(argv[a + 1]), a += 2;
		else if (!strcmp(argv[a], "-B"))
			bad_index = 1, a++;
		else
			break;
	}
	if (argc - a != 2 || gps < 0 || gps > 1000) {
		fprintf(stderr, "usage: %s [-g N [-B]] in.mp4 out.mp4\n", argv[0]);
		return 2;
	}
	argv += a - 1;

	FILE *f = fopen(argv[1], "rb");
	if (!f) {
		perror(argv[1]);
		return 2;
	}
	fseek(f, 0, SEEK_END);
	long len = ftell(f);
	if (len <= 0) {
		fprintf(stderr, "%s: empty or unreadable\n", argv[1]);
		return 2;
	}
	fseek(f, 0, SEEK_SET);
	uint8_t *data = malloc(len);
	if (fread(data, 1, len, f) != (size_t)len) {
		perror("read");
		return 2;
	}
	fclose(f);

	/* Deterministic test keypair (seed is public; NOT a real device key) */
	uint8_t seed[32], sk[64], pk[32];
	memset(seed, 0x42, sizeof(seed));
	crypto_ed25519_key_pair(sk, pk, seed);

	/* Split after the head boxes: walk top-level boxes, cut once the
	 * first box following ftyp/moov/free is something else (mdat). */
	size_t cut = 0, pos = 0;
	while (pos + 8 <= (size_t)len) {
		uint64_t sz = ((uint64_t)data[pos] << 24) | ((uint64_t)data[pos + 1] << 16) |
			      ((uint64_t)data[pos + 2] << 8) | (uint64_t)data[pos + 3];
		const uint8_t *t = data + pos + 4;
		if (sz < 8 || pos + sz > (size_t)len)
			break;
		if (memcmp(t, "ftyp", 4) && memcmp(t, "moov", 4) && memcmp(t, "free", 4))
			break;
		pos += sz;
		cut = pos;
	}

	FILE *out = fopen(argv[2], "wb");
	if (!out) {
		perror(argv[2]);
		return 2;
	}

	uint8_t prev_sig[64] = {0};
	if (cut > 0 && cut < (size_t)len) {
		/* The 'gps ' index goes inside moov right after mvhd: moov grows
		 * by its size and every sample offset shifts by it too. */
		size_t idx_len = gps ? 16 + 8 * (size_t)gps : 0, idx_at = 0;
		uint8_t *head = malloc(cut + idx_len);
		size_t hlen = cut;
		memcpy(head, data, cut);
		if (gps) {
			for (size_t p = 0; p + 8 <= cut;) {
				uint32_t sz = be32r(head + p);
				if (sz < 8 || p + sz > cut)
					break;
				if (!memcmp(head + p + 4, "moov", 4) && sz >= 16 &&
				    !memcmp(head + p + 12, "mvhd", 4)) {
					idx_at = p + 8 + be32r(head + p + 8);
					be32w(head + p, sz + (uint32_t)idx_len);
					break;
				}
				p += sz;
			}
			if (!idx_at) {
				fprintf(stderr, "no moov/mvhd in the head boxes\n");
				return 2;
			}
			memmove(head + idx_at + idx_len, head + idx_at, cut - idx_at);
			memset(head + idx_at, 0, idx_len);
			/* signed with the payload zeroed, as rverify hashes it */
			be32w(head + idx_at, (uint32_t)idx_len);
			memcpy(head + idx_at + 4, "gps ", 4);
			hlen = cut + idx_len;
		}
		/* The genesis box (and any index) lands before mdat, so every
		 * sample offset in moov shifts. Patch stco/co64 before hashing,
		 * or the fixture verifies but will not decode -- and this clip is
		 * also the page's playable sample. A plain scan is enough for a
		 * generated single-track testsrc clip. */
		for (size_t i = 0; i + 16 <= hlen; i++) {
			int is_co64 = !memcmp(head + i, "co64", 4);
			if (!is_co64 && memcmp(head + i, "stco", 4))
				continue;
			uint32_t n = be32r(head + i + 8);
			size_t w = is_co64 ? 8 : 4, off = i + 12;
			if (n > (hlen - off) / w)
				continue;
			for (uint32_t e = 0; e < n; e++) {
				uint8_t *p = head + off + (size_t)e * w;
				uint64_t v = 0;
				for (size_t b = 0; b < w; b++)
					v = (v << 8) | p[b];
				v += BOX_SIZE + idx_len;
				for (size_t b = 0; b < w; b++)
					p[w - 1 - b] = (uint8_t)(v >> (8 * b));
			}
		}
		fwrite(head, 1, hlen, out);
		emit_box(out, head, hlen, 0, sk, pk, prev_sig); /* genesis */

		size_t mdat_len = (size_t)len - cut;
		size_t tail_len = mdat_len + (size_t)gps * GPS_BOX;
		uint8_t *tail = malloc(tail_len);
		memcpy(tail, data + cut, mdat_len);
		for (int i = 0; i < gps; i++)
			gps_record(tail + mdat_len + (size_t)i * GPS_BOX, i);
		fwrite(tail, 1, tail_len, out);
		emit_box(out, tail, tail_len, FLAG_FINAL, sk, pk, prev_sig);

		/* rmr fills the index once the records are written: after
		 * signing, outside every hash */
		if (gps) {
			uint8_t h[8];
			be32w(h, 0x101);
			be32w(h + 4, (uint32_t)gps);
			fseek(out, (long)(idx_at + 8), SEEK_SET);
			fwrite(h, 1, 8, out);
		}
		for (int i = 0; i < gps; i++) {
			uint8_t e[8];
			uint32_t off =
				(uint32_t)(hlen + BOX_SIZE + mdat_len + (size_t)i * GPS_BOX);
			if (bad_index && i == 0)
				off = (uint32_t)(hlen + BOX_SIZE); /* mdat, not a record */
			be32w(e, off);
			be32w(e + 4, GPS_BOX);
			fseek(out, (long)(idx_at + 16 + 8 * (size_t)i), SEEK_SET);
			fwrite(e, 1, 8, out);
		}
		free(tail);
		free(head);
	} else {
		fwrite(data, 1, len, out);
		emit_box(out, data, len, FLAG_FINAL, sk, pk, prev_sig);
	}
	fclose(out);
	free(data);

	for (int i = 0; i < 32; i++)
		printf("%02x", pk[i]);
	printf("\n");
	return 0;
}
