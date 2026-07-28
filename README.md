# thingino-verify

Browser-based verifier for raptor-signed media. Drop a recorded `.mp4`
(or `.jpg` snapshot) from a thingino camera running the Raptor
Streaming System and check its Ed25519 provenance chain, entirely in
the browser. Nothing is uploaded.

Every file written by raptor's recorder carries a chain of signature
boxes (`rmr/rmr_sign.h`): each box holds the SHA-512 of all bytes
since the previous box, signed together with the previous signature.
Any cut, splice, reorder, or edit breaks the chain at that point, and
the report says where.

## How it works

The page runs the real verifier. `rverify.c`, `rss_jpeg.c` and
monocypher are compiled unmodified to WebAssembly, so the page and the
`rverify` CLI can never disagree about a file:

- file -> `ArrayBuffer` -> WASM memory, inside a Web Worker
- `rverify [-k <pubkey>] -t <file>` runs to completion
- verbatim output becomes the report; the exit code becomes the verdict
  (0 verified/consistent, 1 tampered, 2 unsigned or unreadable)

Without a public key only chain integrity is checked; paste the
camera's Ed25519 public key (64 hex chars) to verify the signer. The
page shows the key's fingerprint (first 8 bytes of SHA-512, same as
the report prints) for out-of-band comparison.

## Building

```
./build-wasm.sh          # needs emsdk; RAPTOR/COMMON env override paths
```

## Testing

```
./test/parity.sh
```

Builds a native `rverify` from the same sources, generates fixtures
(a test-signed clip via `test/sign-fixture.c`, plus a tampered copy),
and asserts the WASM and native builds produce identical output and
exit codes on: unsigned, consistent (keyless), verified, tampered, and
wrong-key cases.

`web/samples/` holds the same fixtures for the page's "try a sample"
buttons. The sample key is a fixed, public TEST key.

## Serving

Static files only, no backend:

```
python3 -m http.server 8611 --directory web
```
