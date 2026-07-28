/* verify.worker.js -- run the rverify WASM build off the main thread.
 *
 * One fresh module instance per job: rverify is a run-to-completion
 * CLI (main() -> exit()), so a clean instance per file gives the same
 * semantics as invoking the binary, with no leaked state between runs. */
importScripts("wasm/rverify.js");

self.onmessage = async (e) => {
	const { buf, name, key, timecodes } = e.data;
	const lines = [];
	let code = null;

	let mod;
	try {
		mod = await createRVerify({
			/* importScripts resolves the .wasm against the WORKER's URL
			 * (site root), not the glue's directory; point it back. */
			locateFile: (f) => "wasm/" + f,
			print: (s) => lines.push({ t: "out", s }),
			printErr: (s) => lines.push({ t: "err", s }),
			onExit: (c) => {
				code = c;
			},
		});
	} catch (err) {
		self.postMessage({ code: null, lines: [{ t: "err", s: "wasm init failed: " + err }] });
		return;
	}

	const path = "/" + (name || "input.bin").replace(/[^\w.-]/g, "_");
	mod.FS.writeFile(path, new Uint8Array(buf));

	const argv = [];
	if (key) argv.push("-k", key);
	if (timecodes) argv.push("-t");
	argv.push(path);

	try {
		mod.callMain(argv);
	} catch (err) {
		/* main()'s exit() surfaces as a caught ExitStatus; anything
		 * else is a real crash worth reporting. */
		if (code === null) lines.push({ t: "err", s: "verifier crashed: " + err });
	}

	self.postMessage({ code, lines });
};
