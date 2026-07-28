# thingino-verify

Verify raptor-signed camera recordings and snapshots in the browser.
Drop a `.mp4` recording or `.jpg` snapshot from a thingino camera
running the [Raptor Streaming System](https://github.com/gtxaspec/raptor)
and check its Ed25519 provenance chain. Everything runs locally in the
page; nothing is uploaded.

Sibling of the other thingino web tools:
[webflash](https://github.com/wltechblog/thingino-dfu) and the
[image builder](https://github.com/thingino/thingino-image-builder).

## The provenance model

Every file written by raptor's recorder (rmr) carries a chain of
164-byte signature boxes (`rmr/rmr_sign.h`):

- each box holds the SHA-512 of all file bytes since the previous box
  (the span), signed together with the previous signature
- spans follow the recording structure: the init segment, each
  fragment group, and a flagged final box that proves clean close
- the genesis box chains from 64 zero bytes

Removing, reordering, or altering any byte of any span breaks the
chain at that box, and the report says where. A recording cut by power
loss verifies up to the last complete box and is reported as not
cleanly closed. Snapshots carry a single signature in a JPEG APP15
segment.

## Verdicts

The page runs `rverify` and maps its exit code:

| Verdict | Meaning |
|---|---|
| Signed and verified | Every span hashes correctly and every signature checks against the supplied public key |
| Hash chain intact, signer not verified | Internally consistent, but no key was supplied, so anyone could have written it |
| TAMPERED | A span hash or signature fails; the report pinpoints the box |
| No signatures in this file | Not written by raptor's signing recorder, or the boxes were stripped |

The signing key's fingerprint (first 8 bytes of the SHA-512 of the
public key) is shown in both the report and next to the key input, for
out-of-band comparison with what the camera displays.

## Your camera's public key

raptor signs recordings by default (`[recording] sign = true`). The
device generates its keypair on first use at
`/etc/raptor/sign_ed25519.key` and exports the public half next to it:

```
cat /etc/raptor/sign_ed25519.key.pub
```

Paste the 64 hex characters into the page (remembered locally), or
copy the `.pub` file over and use the file button. The private key
never needs to leave the camera.

## How it works

The page runs the real verifier, not a reimplementation. `rverify.c`,
`rss_jpeg.c` and monocypher are compiled unmodified to WebAssembly, so
the page and the `rverify` CLI can never disagree about a file:

- file, `ArrayBuffer`, WASM memory, inside a Web Worker
- `rverify [-k <pubkey>] -t <file>` runs to completion
- the verbatim output becomes the report, the exit code the verdict
  (0 verified/consistent, 1 tampered, 2 unsigned or unreadable)

`web/wasm/build-info.json` records the raptor commit the engine was
built from; the footer shows it.

Practical size limit: the file is held in WASM memory about twice
over (filesystem copy plus the verifier's read buffer), and wasm32
tops out at 4 GiB, so keep files under roughly 1 GiB. Typical camera
clips are tens of megabytes.

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
exit codes on five cases: unsigned, consistent (keyless), verified,
tampered, and wrong key.

`web/samples/` holds the same fixtures for the page's "try a sample"
buttons. The sample key is a fixed, public TEST key; nothing signed
with it proves anything.

## Serving

Static files only, no backend:

```
python3 -m http.server 8611 --directory web
```

The fingerprint chip uses SubtleCrypto, which browsers only expose on
HTTPS or localhost; over plain HTTP it hides itself and everything
else still works.

## License

GPL-3.0, following the raptor engine this tool embeds. Monocypher is
BSD-2-Clause / CC0.
