#!/bin/bash
# Build rverify (raptor's signed-media verifier) to WebAssembly.
#
# The web page runs the SAME sources as the on-device/CLI verifier:
# rverify.c + rss_jpeg.c + monocypher. The page and `rverify` can
# never disagree about a file.
set -e
cd "$(dirname "$0")"

RAPTOR=${RAPTOR:-$HOME/projects/thingino/raptor}
COMMON=${COMMON:-$HOME/projects/thingino/raptor-common}
EMSDK=${EMSDK:-$HOME/emsdk}

# shellcheck disable=SC1091
source "$EMSDK/emsdk_env.sh" >/dev/null 2>&1

mkdir -p web/wasm
emcc -O2 \
    "$RAPTOR/rverify/rverify.c" \
    "$COMMON/src/rss_jpeg.c" \
    "$COMMON/third_party/monocypher/monocypher.c" \
    "$COMMON/third_party/monocypher/monocypher-ed25519.c" \
    -I"$COMMON/include" \
    -I"$COMMON/third_party/monocypher" \
    -sMODULARIZE=1 \
    -sEXPORT_NAME=createRVerify \
    -sALLOW_MEMORY_GROWTH=1 \
    -sINVOKE_RUN=0 \
    -sEXIT_RUNTIME=1 \
    -sEXPORTED_RUNTIME_METHODS=callMain,FS \
    -sENVIRONMENT=worker,node \
    -o web/wasm/rverify.js

REV=$(git -C "$RAPTOR" rev-parse --short HEAD 2>/dev/null || echo unknown)
printf '{"raptor":"%s","built":"%s"}\n' "$REV" "$(date -u +%FT%TZ)" > web/wasm/build-info.json
echo "built web/wasm/rverify.{js,wasm} from raptor @ $REV"
