#!/bin/bash
# Build rverify (raptor's signed-media verifier) to WebAssembly.
#
# Standalone: fetches its own pinned inputs (raptor, raptor-common,
# emsdk) into build-deps/, so the same invocation works on a dev box
# and in CI:
#
#     ./build-wasm.sh
#
# The web page runs the SAME sources as the on-device/CLI verifier;
# CI rebuilds from the pins below and re-proves native/WASM parity on
# every deploy, so the page and `rverify` can never disagree.
#
# Local overrides: RAPTOR=/path COMMON=/path build against existing
# trees as-is (build-info.json then records their actual HEADs).
set -e
cd "$(dirname "$0")"

# Engine provenance pins. Bump deliberately, in their own commit.
RAPTOR_REV=06ddbc28d775beb64d5a38993290a46d44280571
COMMON_REV=ab1f9fd40dc917388449c201a0945c051587f4fb
EMSDK_VER=5.0.4

DEPS=$PWD/build-deps

fetch_pinned() { # url rev dest
	local url=$1 rev=$2 dest=$3
	if [ ! -e "$dest/.git" ]; then
		git init -q "$dest"
		git -C "$dest" remote add origin "$url"
	fi
	if [ "$(git -C "$dest" rev-parse HEAD 2>/dev/null)" != "$rev" ]; then
		echo "fetching $(basename "$dest") @ $rev"
		git -C "$dest" fetch -q --depth 1 origin "$rev"
		git -C "$dest" checkout -q "$rev"
	fi
}

if [ -z "$RAPTOR" ]; then
	RAPTOR=$DEPS/raptor
	fetch_pinned https://github.com/gtxaspec/raptor "$RAPTOR_REV" "$RAPTOR"
fi
if [ -z "$COMMON" ]; then
	COMMON=$DEPS/raptor-common
	fetch_pinned https://github.com/gtxaspec/raptor-common "$COMMON_REV" "$COMMON"
fi

# Toolchain: PATH first, then an existing ~/emsdk, else a pinned
# install into build-deps/ (the CI path).
if ! command -v emcc >/dev/null 2>&1; then
	if [ -f "$HOME/emsdk/emsdk_env.sh" ]; then
		# shellcheck disable=SC1091
		source "$HOME/emsdk/emsdk_env.sh" >/dev/null 2>&1
	else
		if [ ! -d "$DEPS/emsdk" ]; then
			git clone -q --depth 1 https://github.com/emscripten-core/emsdk "$DEPS/emsdk"
		fi
		"$DEPS/emsdk/emsdk" install "$EMSDK_VER"
		"$DEPS/emsdk/emsdk" activate "$EMSDK_VER"
		# shellcheck disable=SC1091
		source "$DEPS/emsdk/emsdk_env.sh"
	fi
fi

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

SITE=$(git rev-parse HEAD 2>/dev/null || echo unknown)
RREV=$(git -C "$RAPTOR" rev-parse HEAD 2>/dev/null || echo unknown)
CREV=$(git -C "$COMMON" rev-parse HEAD 2>/dev/null || echo unknown)
EMCC=$(emcc --version | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
printf '{"site":"%s","raptor":"%s","raptor_common":"%s","emcc":"%s","built":"%s"}\n' \
	"$SITE" "$RREV" "$CREV" "$EMCC" "$(date -u +%FT%TZ)" > web/wasm/build-info.json
echo "built web/wasm/rverify.{js,wasm}"
echo "  raptor        $RREV"
echo "  raptor-common $CREV"
echo "  emcc          $EMCC"
