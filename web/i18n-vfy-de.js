// German strings for the verifier: keys mirror i18n-vfy-en.js.
I18N.add("de", {
  // header
  page_title: "thingino · Medien-Verifizierer",
  header_full: " Thingino Medien-Verifizierer",
  header_short: " Medien-Verifizierer",
  badge_local: "100% lokal",
  local_title: "Die Datei wird lokal gelesen und geprüft; nichts wird hochgeladen.",
  engine_title: "rverify-Build",
  help_title: "Hilfeblasen ein- oder ausschalten",

  // file picker
  drop_aria: "Datei zum Verifizieren auswählen",
  drop_title: "Aufnahme hierher ziehen oder zum Auswählen klicken",
  drop_text: "Zieh eine von raptor signierte <strong>.mp4</strong>-Aufnahme oder einen <strong>.jpg</strong>-Schnappschuss hierher,<br>oder klicke, um eine Datei auszuwählen",

  // public key
  key_label: "Öffentlicher Schlüssel der Kamera",
  key_optional: "(optional)",
  key_ph: "Öffentlicher Ed25519-Schlüssel, 64 Hex-Zeichen",
  keyfile_title: "Schlüssel aus einer Datei laden",
  key_note: "Ohne Schlüssel wird nur die Integrität der Hash-Kette geprüft, nicht, wer signiert hat.",
  key_fp: "Schlüssel-Fingerprint",

  // actions
  verify_btn: "Verifizieren",
  try_sample: "Beispiel ausprobieren:",
  sample_good: "signiert",
  sample_good_title: "Ein Testclip, signiert mit dem mitgelieferten Testschlüssel",
  sample_bad: "manipuliert",
  sample_bad_title: "Derselbe Clip, bei dem ein Video-Byte verändert wurde",

  // report
  preview_title: "Vorschau",
  preview_note: "wird lokal abgespielt, nie hochgeladen",
  preview_unplayable: "Keine Vorschau: der Browser kann diese Datei nicht dekodieren. Die Verifizierung ist davon nicht betroffen.",
  preview_blocked: "Wiedergabe zurückgehalten: diese Datei hat die Verifizierung nicht bestanden, deshalb ist das, was sie zeigt, nicht das, was die Kamera aufgenommen hat.",
  btn_play_anyway: "Trotzdem abspielen",
  report_title: "Bericht",
  report_note: "unveränderte <code>rverify</code>-Ausgabe",
  log_intro: "Wähle eine Datei zum Verifizieren. Jede Aufnahme, die der Recorder von raptor schreibt, trägt eine Ed25519-Hash-Kette: jede Signatur-Box deckt alle Bytes seit der vorherigen Box ab und ist mit der vorherigen Signatur verkettet, sodass jeder Schnitt, jede Einfügung und jede Bearbeitung die Kette an dieser Stelle bricht.",
  footer_link: "thingino-verify",
  settings_lang: "Sprache",
  settings_title: "Einstellungen",
  gear_title: "Einstellungen",
  btn_close: "Schließen",
  setting_preview_label: "Vorschau der ausgewählten Datei: hier im Browser abspielen",
  setting_help_label: "Hilfehinweise anzeigen: fahre über ein beliebiges Element für einen Tipp (oder nutze die Schaltfläche ?).",

  // verdicts
  v_verifying: "verifiziere {name} ...",
  v_key_wrong: "Der Schlüssel sieht falsch aus",
  v_key_wrong_d: "Ein öffentlicher Ed25519-Schlüssel hat 64 Hex-Zeichen.",
  v_signed: "Signiert und verifiziert",
  v_signed_closed: "Signiert und verifiziert, sauber abgeschlossen",
  v_consistent: "Hash-Kette intakt: Signierer nicht verifiziert",
  v_consistent_d: "Jeder Abschnitt hat den richtigen Hash, aber es wurde kein Schlüssel angegeben. Füge den öffentlichen Schlüssel der Kamera ein, um zu prüfen, wer signiert hat.",
  v_clean: "Verifiziert, unverändert",
  v_tampered: "MANIPULIERT: Verifizierung fehlgeschlagen",
  v_unsigned: "Keine Signaturen in dieser Datei",
  v_unsigned_d: "Diese Datei wurde nicht vom signierenden Recorder von raptor geschrieben (oder die Signatur-Boxen wurden entfernt).",
  v_unknown: "Verifizierung nicht möglich",
  v_unreadable: "Datei nicht lesbar.",
  v_fp: "Fingerprint des Signaturschlüssels:",
  v_sample_fail: "Beispiel konnte nicht geladen werden",
  v_keyfile_fail: "Aus dieser Datei konnte kein Schlüssel gelesen werden",
  v_keyfile_fail_d: "Erwartet wurden 64 Hex-Zeichen oder ein roher öffentlicher 32-Byte-Ed25519-Schlüssel.",

  // help balloons (data-help keys)
  help_help: "Hilfemodus umschalten: fahre über ein beliebiges Element, um zu sehen, was es tut.",
  help_lang: "Wechsle die Sprache der Oberfläche (automatisch aus deinem Browser erkannt).",
  help_local: "Die Datei wird vollständig in deinem Browser gelesen und geprüft. Nichts wird irgendwohin hochgeladen.",
  help_engine: "Der raptor-Commit, aus dem die Verifizierungs-Engine (rverify, zu WebAssembly kompiliert) gebaut wurde.",
  help_drop: "Zieh eine von raptor signierte .mp4-Aufnahme oder einen .jpg-Schnappschuss hierher, oder klicke, um eine Datei auszuwählen. Die Datei bleibt auf deinem Rechner.",
  help_key: "Der öffentliche Ed25519-Schlüssel der Kamera, 64 Hex-Zeichen. Mit ihm belegt der Bericht, WER die Datei signiert hat; ohne ihn nur, dass die Datei in sich konsistent ist.",
  help_keyfile: "Lade den öffentlichen Schlüssel aus einer Datei, anstatt ihn einzufügen: eine Textdatei mit dem Hex-Schlüssel oder eine rohe 32-Byte-Schlüsseldatei.",
  help_verify: "Führt rverify auf der ausgewählten Datei aus. Mögliche Ergebnisse: verifiziert / konsistent (ohne Schlüssel) / manipuliert / unsigniert.",
  help_sample_good: "Ein mitgelieferter Testclip, signiert mit dem öffentlichen TEST-Schlüssel. Zeigt, wie eine erfolgreiche Verifizierung aussieht.",
  help_sample_bad: "Derselbe Testclip mit einem veränderten Video-Byte. Zeigt, wie die Hash-Kette die Manipulation genau lokalisiert.",
  help_settings: "Einstellungen: Sprache der Oberfläche und Hilfehinweise.",
  help_preview: "Spielt die ausgewählte Datei direkt aus dem Speicher deines Browsers ab, damit du sehen kannst, was du gerade verifiziert hast. Nichts wird hochgeladen.",
  help_report: "Die unveränderte rverify-Ausgabe: eine Zeile pro Signatur-Box mit ihrer Abschnittsgröße und ihrem Ergebnis, dazu die eingebetteten Timecodes.",
});
