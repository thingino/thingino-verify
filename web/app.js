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
	if (/RESULT: (VERIFIED|CONSISTENT)|: OK$|hash ok/.test(s)) return "ok";
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
	const [file, pub] = await Promise.all([
		fetch(path).then((r) => r.arrayBuffer()),
		fetch("samples/fixture.pub").then((r) => r.text()),
	]);
	pubkeyEl.value = pub.trim();
	localStorage.setItem("verify.pubkey", pubkeyEl.value);
	updateKeyFp();
	setFile({ name, buffer: file, size: file.byteLength });
	verify();
}

$("btn-sample-good").addEventListener("click", () => loadSample("samples/signed.mp4", "sample-signed.mp4"));
$("btn-sample-bad").addEventListener("click", () => loadSample("samples/tampered.mp4", "sample-tampered.mp4"));

/* ---------- engine badge ---------- */

fetch("wasm/build-info.json")
	.then((r) => r.json())
	.then((i) => {
		$("engine-rev").textContent = " @ " + i.raptor;
		const b = $("engine-badge");
		b.textContent = "raptor " + i.raptor;
		b.classList.remove("d-none");
	})
	.catch(() => {});
