#!/bin/bash
# Parity matrix: the WASM build must agree with a native build of the
# same sources on every case (stdout and exit code).
set -e
cd "$(dirname "$0")"

RAPTOR=${RAPTOR:-$HOME/projects/thingino/raptor}
COMMON=${COMMON:-$HOME/projects/thingino/raptor-common}

cc -O2 -o rverify-native \
    "$RAPTOR/rverify/rverify.c" \
    "$COMMON/src/rss_jpeg.c" \
    "$COMMON/third_party/monocypher/monocypher.c" \
    "$COMMON/third_party/monocypher/monocypher-ed25519.c" \
    -I"$COMMON/include" -I"$COMMON/third_party/monocypher"

cc -O2 -o sign-fixture sign-fixture.c \
    "$COMMON/third_party/monocypher/monocypher.c" \
    "$COMMON/third_party/monocypher/monocypher-ed25519.c" \
    -I"$COMMON/third_party/monocypher"

# Base clip: +faststart puts moov before mdat so the fixture gets a
# proper genesis span (ftyp+moov) like the recorder writes.
[ -f base.mp4 ] || ffmpeg -nostdin -v error -f lavfi -i testsrc=size=320x180:rate=10 \
    -t 1 -pix_fmt yuv420p -movflags +faststart -y base.mp4

PUB=$(./sign-fixture base.mp4 signed.mp4)
echo "$PUB" > fixture.pub
cp signed.mp4 tampered.mp4
# Flip one byte deep in the mdat payload.
SZ=$(stat -c%s tampered.mp4)
OFF=$((SZ * 3 / 5))
printf '\xff' | dd of=tampered.mp4 bs=1 seek=$OFF conv=notrunc status=none

fail=0
check() { # name expected-exit file args...
	local name=$1 want=$2 f=$3
	shift 3
	local n_out n_rc w_out w_rc
	n_out=$(./rverify-native "$@" "$f" 2>&1) && n_rc=0 || n_rc=$?
	w_out=$(node run-wasm.cjs "$f" "$@" 2>&1) && w_rc=0 || w_rc=$?
	# The wasm run sees a MEMFS path; strip both paths before diffing.
	local n_clean w_clean
	n_clean=$(printf '%s' "$n_out" | sed "s|$f|FILE|g")
	w_clean=$(printf '%s' "$w_out" | sed "s|/$(basename "$f")|FILE|g")
	if [ "$n_rc" != "$want" ] || [ "$w_rc" != "$want" ] || [ "$n_clean" != "$w_clean" ]; then
		echo "FAIL  $name (native rc=$n_rc wasm rc=$w_rc want=$want)"
		diff <(printf '%s\n' "$n_clean") <(printf '%s\n' "$w_clean") | head -6
		fail=1
	else
		echo "PASS  $name (rc=$want, outputs identical)"
	fi
}

check "unsigned mp4 -> no boxes"        2 base.mp4
check "signed, keyless -> CONSISTENT"   0 signed.mp4
check "signed + key -> VERIFIED"        0 signed.mp4 -k "$PUB"
check "tampered + key -> TAMPERED"      1 tampered.mp4 -k "$PUB"
check "signed + WRONG key -> TAMPERED"  1 signed.mp4 -k "$(printf '0%.0s' {1..64})"

[ $fail -eq 0 ] && echo "parity: all cases identical" || exit 1
