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
 * usage: sign-fixture in.mp4 out.mp4
 * Prints the test public key (hex) on stdout.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <monocypher-ed25519.h>

#define BOX_SIZE 164
#define FLAG_FINAL 0x01

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
	if (argc != 3) {
		fprintf(stderr, "usage: %s in.mp4 out.mp4\n", argv[0]);
		return 2;
	}

	FILE *f = fopen(argv[1], "rb");
	if (!f) {
		perror(argv[1]);
		return 2;
	}
	fseek(f, 0, SEEK_END);
	long len = ftell(f);
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
		/* The genesis box lands between the head boxes and mdat, so every
		 * sample offset in moov shifts by its size. Patch stco/co64 before
		 * hashing, or the fixture verifies but will not decode -- and this
		 * clip is also the page's playable sample. A plain scan is enough
		 * for a generated single-track testsrc clip. */
		for (size_t i = 0; i + 16 <= cut; i++) {
			int is_co64 = !memcmp(data + i, "co64", 4);
			if (!is_co64 && memcmp(data + i, "stco", 4))
				continue;
			uint32_t n = ((uint32_t)data[i + 8] << 24) | ((uint32_t)data[i + 9] << 16) |
				     ((uint32_t)data[i + 10] << 8) | (uint32_t)data[i + 11];
			size_t w = is_co64 ? 8 : 4, off = i + 12;
			if (n > (cut - off) / w)
				continue;
			for (uint32_t e = 0; e < n; e++) {
				uint8_t *p = data + off + (size_t)e * w;
				uint64_t v = 0;
				for (size_t b = 0; b < w; b++)
					v = (v << 8) | p[b];
				v += BOX_SIZE;
				for (size_t b = 0; b < w; b++)
					p[w - 1 - b] = (uint8_t)(v >> (8 * b));
			}
		}
		fwrite(data, 1, cut, out);
		emit_box(out, data, cut, 0, sk, pk, prev_sig); /* genesis */
		fwrite(data + cut, 1, len - cut, out);
		emit_box(out, data + cut, len - cut, FLAG_FINAL, sk, pk, prev_sig);
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
