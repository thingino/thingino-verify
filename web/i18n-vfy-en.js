// English strings for the verifier: the source of truth the other
// i18n-vfy-<lang>.js files mirror. Keep keys in this order.
I18N.add("en", {
  // header
  page_title: "thingino · Media Verifier",
  header_full: " Thingino Media Verifier",
  header_short: " Media Verifier",
  badge_local: "100% local",
  local_title: "The file is read and verified locally; nothing is uploaded.",
  engine_title: "rverify build",
  help_title: "Toggle help balloons",

  // file picker
  drop_aria: "Choose a file to verify",
  drop_title: "Drop a recording here, or click to choose",
  drop_text: "Drop a raptor-signed <strong>.mp4</strong> recording or <strong>.jpg</strong> snapshot here,<br>or click to choose a file",

  // public key
  key_label: "Camera public key",
  key_optional: "(optional)",
  key_ph: "Ed25519 public key, 64 hex characters",
  keyfile_title: "Load the key from a file",
  key_note: "Without a key, only hash-chain integrity is checked, not who signed it.",
  key_fp: "key fp",

  // actions
  verify_btn: "Verify",
  try_sample: "Try a sample:",
  sample_good: "signed",
  sample_good_title: "A test clip signed with the bundled test key",
  sample_bad: "tampered",
  sample_bad_title: "The same clip with one byte of video flipped",

  // report
  report_title: "Report",
  report_note: "verbatim <code>rverify</code> output",
  log_intro: "Pick a file to verify. Every recording written by raptor's recorder carries an Ed25519 hash chain: each signature box covers all bytes since the previous box, chained to the previous signature, so any cut, splice, or edit breaks the chain at that point.",
  footer_link: "thingino-verify",
  lang_label: "Language",

  // verdicts
  v_verifying: "verifying {name} ...",
  v_key_wrong: "Key looks wrong",
  v_key_wrong_d: "An Ed25519 public key is 64 hex characters.",
  v_signed: "Signed and verified",
  v_signed_closed: "Signed and verified, cleanly closed",
  v_consistent: "Hash chain intact - signer not verified",
  v_consistent_d: "Every span hashes correctly, but no key was supplied. Paste the camera's public key to verify who signed it.",
  v_clean: "Verified clean",
  v_tampered: "TAMPERED - verification failed",
  v_unsigned: "No signatures in this file",
  v_unsigned_d: "This file was not written by raptor's signing recorder (or the signature boxes were stripped).",
  v_unknown: "Could not verify",
  v_unreadable: "Unreadable file.",
  v_fp: "Signing key fingerprint:",
  v_sample_fail: "Could not load the sample",
  v_keyfile_fail: "Could not read a key from that file",
  v_keyfile_fail_d: "Expected 64 hex characters or a raw 32-byte Ed25519 public key.",

  // help balloons (data-help keys)
  help_help: "Toggle help mode: hover any control to see what it does.",
  help_lang: "Switch the interface language (auto-detected from your browser).",
  help_local: "The file is read and verified entirely in your browser. Nothing is uploaded anywhere.",
  help_engine: "The raptor commit the verification engine (rverify, compiled to WebAssembly) was built from.",
  help_drop: "Drop a raptor-signed .mp4 recording or .jpg snapshot here, or click to pick one. The file stays on your machine.",
  help_key: "The camera's Ed25519 public key, 64 hex characters. With it the report proves WHO signed the file; without it only that the file is internally consistent.",
  help_keyfile: "Load the public key from a file instead of pasting it: a text file containing the hex key, or a raw 32-byte key file.",
  help_verify: "Run rverify on the selected file. Exit verdicts: verified / consistent (no key) / tampered / unsigned.",
  help_sample_good: "A bundled test clip signed with the public TEST key. Shows what a clean verification looks like.",
  help_sample_bad: "The same test clip with one byte of video flipped. Shows how the hash chain pinpoints tampering.",
  help_report: "The verbatim rverify output: one line per signature box with its span size and verdict, plus embedded timecodes.",
});
