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
  preview_title: "Preview",
  preview_note: "played locally, never uploaded",
  preview_unplayable: "No preview: the browser cannot decode this file. Verification is unaffected.",
  preview_blocked: "Playback withheld: this file failed verification, so what it shows is not what the camera recorded.",
  btn_play_anyway: "Play anyway",
  report_title: "Report",
  report_note: "verbatim <code>rverify</code> output",
  log_intro: "Pick a file to verify. Every recording written by raptor's recorder carries an Ed25519 hash chain: each signature box covers all bytes since the previous box, chained to the previous signature, so any cut, splice, or edit breaks the chain at that point.",
  footer_link: "thingino-verify",
  settings_lang: "Language",
  settings_title: "Settings",
  gear_title: "Settings",
  btn_close: "Close",

  // about dialog (the info button in the header)
  about_title: "About",
  about_what: "This page checks whether a recording is the one the camera signed. Every video and snapshot written by raptor's recorder carries an Ed25519 hash chain: each signature covers all the bytes since the one before it, so any cut, splice or re-encode breaks the chain at exactly that point.",
  about_local: "The file never leaves your device. It is read and checked here in the browser by the same rverify engine the camera ships, compiled to WebAssembly, so there is nothing to upload and no account to create.",
  about_project: "thingino is free, open-source firmware for Ingenic-based IP cameras, built by a community of volunteers.",
  about_hints: "Hover hints for every control can be switched on in Settings.",
  about_links: "Project links",
  about_site: "thingino project site",
  about_wiki: "Documentation and camera wiki",
  about_firmware: "thingino firmware source",
  about_telegram: "Telegram group",
  about_discord: "Discord server",
  about_source: "This verifier's source",
  about_version: "Verifier version",
  setting_preview_label: "Preview the picked file: play it here in the browser",
  setting_help_label: "Show help hints: hover any control for a tip.",

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
  help_about: "About this verifier, what it checks and where the project lives.",
  help_lang: "Switch the interface language (auto-detected from your browser).",
  help_local: "The file is read and verified entirely in your browser. Nothing is uploaded anywhere.",
  help_engine: "The raptor commit the verification engine (rverify, compiled to WebAssembly) was built from.",
  help_drop: "Drop a raptor-signed .mp4 recording or .jpg snapshot here, or click to pick one. The file stays on your machine.",
  help_key: "The camera's Ed25519 public key, 64 hex characters. With it the report proves WHO signed the file; without it only that the file is internally consistent.",
  help_keyfile: "Load the public key from a file instead of pasting it: a text file containing the hex key, or a raw 32-byte key file.",
  help_verify: "Run rverify on the selected file. Exit verdicts: verified / consistent (no key) / tampered / unsigned.",
  help_sample_good: "A bundled test clip signed with the public TEST key. Shows what a clean verification looks like.",
  help_sample_bad: "The same test clip with one byte of video flipped. Shows how the hash chain pinpoints tampering.",
  help_settings: "Settings: interface language and help hints.",
  help_preview: "Plays the selected file straight from your browser's memory, so you can watch what you just verified. Nothing is uploaded.",
  help_report: "The verbatim rverify output: one line per signature box with its span size and verdict, plus embedded timecodes.",
});
