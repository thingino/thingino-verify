/* thingino-verify -- browser front end for raptor's rverify.
 * All work happens locally: the file goes File -> ArrayBuffer ->
 * WASM heap in a worker; nothing leaves the machine. */
"use strict";

const $ = (id) => document.getElementById(id);
const dropzone = $("dropzone");
const fileInput = $("file-input");
const btnVerify = $("btn-verify");
const pubkeyEl = $("pubkey");
const logEl = $("log");
const verdictEl = $("verdict");

let currentFile = null; // File or {name, buffer} for samples
let running = false;

const worker = new Worker("verify.worker.js");

/* ---------- file selection ---------- */

function setFile(f) {
	currentFile = f;
	$("file-info").classList.remove("d-none");
	$("file-name").textContent = f.name;
	$("file-size").textContent = "(" + fmtSize(f.size ?? f.buffer.byteLength) + ")";
	btnVerify.disabled = false;
	clearVerdict();
}

function fmtSize(n) {
	if (n >= 1 << 30) return (n / (1 << 30)).toFixed(2) + " GiB";
	if (n >= 1 << 20) return (n / (1 << 20)).toFixed(1) + " MiB";
	if (n >= 1 << 10) return (n / (1 << 10)).toFixed(1) + " KiB";
	return n + " B";
}

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fileInput.click();
	}
});
fileInput.addEventListener("change", () => {
	if (fileInput.files.length) setFile(fileInput.files[0]);
});
["dragover", "dragenter"].forEach((ev) =>
	dropzone.addEventListener(ev, (e) => {
		e.preventDefault();
		dropzone.classList.add("drag");
	})
);
["dragleave", "drop"].forEach((ev) =>
	dropzone.addEventListener(ev, (e) => {
		e.preventDefault();
		dropzone.classList.remove("drag");
	})
);
dropzone.addEventListener("drop", (e) => {
	if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
});

/* ---------- public key ---------- */

pubkeyEl.value = localStorage.getItem("verify.pubkey") || "";
pubkeyEl.addEventListener("input", () => {
	localStorage.setItem("verify.pubkey", pubkeyEl.value.trim());
	updateKeyFp();
});

function keyHex() {
	const k = pubkeyEl.value.trim().toLowerCase();
	if (!k) return "";
	if (!/^[0-9a-f]{64}$/.test(k)) return null; // invalid
	return k;
}

/* Same fingerprint rverify prints: first 8 bytes of SHA-512(pubkey).
 * Shown so the user can eyeball it against the report's line. */
async function updateKeyFp() {
	const k = keyHex();
	const chip = $("key-fp");
	if (!k) {
		chip.classList.add("d-none");
		pubkeyEl.classList.toggle("is-invalid", k === null);
		return;
	}
	pubkeyEl.classList.remove("is-invalid");
	if (!crypto.subtle) {
		// Plain-HTTP context: SubtleCrypto is unavailable. The chip is a
		// convenience only; verification hashes inside the WASM engine.
		chip.classList.add("d-none");
		return;
	}
	const bytes = Uint8Array.from(k.match(/../g), (b) => parseInt(b, 16));
	const digest = new Uint8Array(await crypto.subtle.digest("SHA-512", bytes));
	chip.querySelector("b").textContent = [...digest.slice(0, 8)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	chip.classList.remove("d-none");
}
updateKeyFp();

/* ---------- verify ---------- */

btnVerify.addEventListener("click", () => verify());

async function verify() {
	if (!currentFile || running) return;
	const k = keyHex();
	if (k === null) {
		showVerdict("warning", "Key looks wrong", "An Ed25519 public key is 64 hex characters.");
		return;
	}
	running = true;
	btnVerify.disabled = true;
	$("busy").classList.remove("d-none");
	clearVerdict();
	setLog([{ t: "dim", s: "verifying " + currentFile.name + " ..." }]);

	const buf = currentFile.buffer ?? (await currentFile.arrayBuffer());
	worker.postMessage({ buf, name: currentFile.name, key: k, timecodes: true }, [buf]);
	if (currentFile.buffer) currentFile = null; // sample buffers are one-shot
}

worker.onmessage = (e) => {
	running = false;
	btnVerify.disabled = currentFile === null;
	$("busy").classList.add("d-none");
	render(e.data.code, e.data.lines);
};

/* ---------- rendering ---------- */

function classify(l) {
	const s = l.s;
	if (l.t === "err") return "error";
	if (/RESULT: TAMPERED|FAIL/.test(s)) return "error";
	if (/RESULT: (VERIFIED|CONSISTENT)| OK$|hash ok/.test(s)) return "ok";
	if (/^note:|no raptor signature/.test(s)) return "warn";
	return "info";
}

function setLog(lines) {
	logEl.innerHTML = "";
	for (const l of lines) {
		const div = document.createElement("div");
		div.className = l.t === "dim" ? "dim" : classify(l);
		div.textContent = l.s;
		logEl.appendChild(div);
	}
	logEl.scrollTop = logEl.scrollHeight;
}

function clearVerdict() {
	verdictEl.innerHTML = "";
}

function showVerdict(kind, title, detail) {
	const icons = { success: "bi-shield-check", warning: "bi-exclamation-triangle", danger: "bi-shield-x", secondary: "bi-question-circle" };
	verdictEl.innerHTML =
		'<div class="alert alert-' + kind + ' py-2">' +
		'<i class="bi ' + (icons[kind] || icons.secondary) + ' me-1"></i>' +
		'<span class="verdict-title">' + title + "</span>" +
		(detail ? '<div class="small mt-1">' + detail + "</div>" : "") +
		"</div>";
}

function esc(s) {
	return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function render(code, lines) {
	setLog(lines);
	const text = lines.map((l) => l.s).join("\n");
	const fp = (text.match(/key fingerprint: ([0-9a-f]+)/) || [])[1];
	const fpNote = fp ? "Signing key fingerprint: <code>" + esc(fp) + "</code>" : "";

	if (code === 0 && /RESULT: VERIFIED/.test(text)) {
		const closed = /cleanly closed/.test(text) ? " and cleanly closed" : "";
		showVerdict("success", "Signed and verified" + closed, fpNote);
	} else if (code === 0 && /RESULT: CONSISTENT/.test(text)) {
		showVerdict("success", "Hash chain intact - signer not verified",
			"Every span hashes correctly, but no key was supplied. Paste the camera's public key to verify who signed it. " + fpNote);
	} else if (code === 0) {
		showVerdict("success", "Verified clean", fpNote);
	} else if (code === 1) {
		const fail = (text.match(/^.*(FAIL[^\n]*)$/m) || [])[1] || "";
		showVerdict("danger", "TAMPERED - verification failed",
			esc(fail) + (fpNote ? "<br>" + fpNote : ""));
	} else if (/no raptor signature boxes/.test(text)) {
		showVerdict("warning", "No signatures in this file",
			"This file was not written by raptor's signing recorder (or the signature boxes were stripped).");
	} else {
		showVerdict("secondary", "Could not verify", esc(lines.filter((l) => l.t === "err").map((l) => l.s).join(" ") || "Unreadable file."));
	}
}

/* ---------- samples ---------- */

async function loadSample(path, name) {
	if (running) return;
	try {
		const [file, pub] = await Promise.all([
			fetch(path).then((r) => r.arrayBuffer()),
			fetch("samples/fixture.pub").then((r) => r.text()),
		]);
		pubkeyEl.value = pub.trim();
		localStorage.setItem("verify.pubkey", pubkeyEl.value);
		updateKeyFp();
		setFile({ name, buffer: file, size: file.byteLength });
		verify();
	} catch (e) {
		showVerdict("warning", "Could not load the sample", esc(String(e)));
	}
}

$("btn-sample-good").addEventListener("click", () => loadSample("samples/signed.mp4", "sample-signed.mp4"));
$("btn-sample-bad").addEventListener("click", () => loadSample("samples/tampered.mp4", "sample-tampered.mp4"));

/* ---------- key file ---------- */

const keyFileInput = $("key-file-input");
$("btn-keyfile").addEventListener("click", () => keyFileInput.click());
keyFileInput.addEventListener("change", async () => {
	if (!keyFileInput.files.length) return;
	const f = keyFileInput.files[0];
	keyFileInput.value = "";
	let hex = null;
	if (f.size <= 4096) {
		const text = await f.text();
		const m = text.match(/[0-9a-fA-F]{64}/); // hex form, whatever surrounds it
		if (m) hex = m[0].toLowerCase();
	}
	if (!hex && f.size === 32) {
		// raw 32-byte public key
		const bytes = new Uint8Array(await f.arrayBuffer());
		hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
	}
	if (!hex) {
		showVerdict("warning", "Could not read a key from that file",
			"Expected 64 hex characters or a raw 32-byte Ed25519 public key.");
		return;
	}
	pubkeyEl.value = hex;
	localStorage.setItem("verify.pubkey", hex);
	updateKeyFp();
	clearVerdict();
});

/* ---------- help balloons (matches webflash / image builder) ---------- */

const HELP = {
	help_help: "Toggle help mode: hover any control to see what it does.",
	help_local: "The file is read and verified entirely in your browser. Nothing is uploaded anywhere.",
	help_engine: "The raptor commit the verification engine (rverify, compiled to WebAssembly) was built from.",
	help_drop: "Drop a raptor-signed .mp4 recording or .jpg snapshot here, or click to pick one. The file stays on your machine.",
	help_key: "The camera's Ed25519 public key, 64 hex characters. With it the report proves WHO signed the file; without it only that the file is internally consistent.",
	help_keyfile: "Load the public key from a file instead of pasting it: a text file containing the hex key, or a raw 32-byte key file.",
	help_verify: "Run rverify on the selected file. Exit verdicts: verified / consistent (no key) / tampered / unsigned.",
	help_sample_good: "A bundled test clip signed with the public TEST key. Shows what a clean verification looks like.",
	help_sample_bad: "The same test clip with one byte of video flipped. Shows how the hash chain pinpoints tampering.",
	help_report: "The verbatim rverify output: one line per signature box with its span size and verdict, plus embedded timecodes.",
};

let helpMode = localStorage.getItem("verify.help") === "1";
let _helpBalloon = null;
let _helpHover = null;

function hideHelpBalloon() {
	_helpHover = null;
	if (_helpBalloon) _helpBalloon.classList.remove("show");
}

function showHelpBalloon(el) {
	if (!_helpBalloon) {
		_helpBalloon = document.createElement("div");
		_helpBalloon.className = "help-balloon";
		document.body.appendChild(_helpBalloon);
	}
	const key = el.getAttribute("data-help");
	_helpBalloon.textContent = HELP[key] || key;
	_helpBalloon.classList.add("show");
	const r = el.getBoundingClientRect();
	const bw = _helpBalloon.offsetWidth, bh = _helpBalloon.offsetHeight;
	const left = Math.min(Math.max(8, r.left), window.innerWidth - bw - 8);
	let top = r.bottom + 9, above = false;
	if (top + bh > window.innerHeight - 8) { top = r.top - bh - 9; above = true; }
	if (top < 8) top = 8;
	_helpBalloon.classList.toggle("above", above);
	_helpBalloon.style.left = left + "px";
	_helpBalloon.style.top = top + "px";
}

function applyHelpMode() {
	document.body.classList.toggle("help-on", helpMode);
	$("btn-help").classList.toggle("help-active", helpMode);
	// Suppress native title tooltips while help mode is on so they don't
	// double up with the balloons; restore them when it's off.
	for (const el of document.querySelectorAll("[data-help]")) {
		if (helpMode && el.hasAttribute("title")) {
			el.setAttribute("data-saved-title", el.getAttribute("title"));
			el.removeAttribute("title");
		} else if (!helpMode && el.hasAttribute("data-saved-title")) {
			el.setAttribute("title", el.getAttribute("data-saved-title"));
			el.removeAttribute("data-saved-title");
		}
	}
	if (!helpMode) hideHelpBalloon();
}

$("btn-help").addEventListener("click", () => {
	helpMode = !helpMode;
	localStorage.setItem("verify.help", helpMode ? "1" : "0");
	applyHelpMode();
});
applyHelpMode();

/* Track the topmost helpable element under the cursor; elementFromPoint
 * respects z-order and resolves disabled buttons. */
document.addEventListener("mousemove", (e) => {
	if (!helpMode) return;
	const top = document.elementFromPoint(e.clientX, e.clientY);
	const el = top && top.closest ? top.closest("[data-help]") : null;
	if (el) {
		if (el !== _helpHover) {
			_helpHover = el;
			showHelpBalloon(el);
		}
	} else if (_helpHover) {
		hideHelpBalloon();
	}
});

/* ---------- engine badge ---------- */

fetch("wasm/build-info.json")
	.then((r) => r.json())
	.then((i) => {
		$("version-num").textContent = "v0.1.0-" + i.raptor;
		const b = $("engine-badge");
		b.textContent = "raptor " + i.raptor;
		b.classList.remove("d-none");
	})
	.catch(() => {});
