#!/usr/bin/env node
/* Run the rverify WASM build under node, mirroring the CLI exactly.
 * usage: run-wasm.cjs <file> [rverify args...]
 * Exits with rverify's exit code; stdout/stderr pass through. */
const fs = require("fs");
const path = require("path");

const createRVerify = require(path.join(__dirname, "..", "web", "wasm", "rverify.js"));

const file = process.argv[2];
const extra = process.argv.slice(3);
if (!file) {
	console.error("usage: run-wasm.cjs <file> [rverify args...]");
	process.exit(2);
}

let code = null;
createRVerify({
	print: (s) => console.log(s),
	printErr: (s) => console.error(s),
	onExit: (c) => {
		code = c;
	},
}).then((mod) => {
	const name = "/" + path.basename(file).replace(/[^\w.-]/g, "_");
	mod.FS.writeFile(name, fs.readFileSync(file));
	try {
		mod.callMain([...extra, name]);
	} catch (e) {
		/* ExitStatus is routed through onExit */
	}
	process.exit(code === null ? 3 : code);
});
