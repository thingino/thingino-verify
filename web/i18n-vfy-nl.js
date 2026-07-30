// Dutch strings for the verifier: keys mirror i18n-vfy-en.js.
I18N.add("nl", {
  // header
  page_title: "thingino · Mediaverificatie",
  header_full: " Thingino Mediaverificatie",
  header_short: " Mediaverificatie",
  badge_local: "100% lokaal",
  local_title: "Het bestand wordt lokaal gelezen en gecontroleerd; er wordt niets geüpload.",
  engine_title: "rverify-build",
  help_title: "Hulpballonnen aan- of uitzetten",

  // file picker
  drop_aria: "Kies een bestand om te verifiëren",
  drop_title: "Sleep hier een opname, of klik om te kiezen",
  drop_text: "Sleep hier een door raptor ondertekende <strong>.mp4</strong>-opname of <strong>.jpg</strong>-momentopname,<br>of klik om een bestand te kiezen",

  // public key
  key_label: "Publieke sleutel van de camera",
  key_optional: "(optioneel)",
  key_ph: "Publieke Ed25519-sleutel, 64 hex-tekens",
  keyfile_title: "De sleutel uit een bestand laden",
  key_note: "Zonder sleutel wordt alleen de integriteit van de hashketen gecontroleerd, niet wie het heeft ondertekend.",
  key_fp: "sleutelvingerafdruk",

  // actions
  verify_btn: "Verifiëren",
  try_sample: "Probeer een voorbeeld:",
  sample_good: "ondertekend",
  sample_good_title: "Een testclip die is ondertekend met de meegeleverde testsleutel",
  sample_bad: "gemanipuleerd",
  sample_bad_title: "Dezelfde clip met één byte video gewijzigd",

  // report
  report_title: "Rapport",
  report_note: "onbewerkte uitvoer van <code>rverify</code>",
  log_intro: "Kies een bestand om te verifiëren. Elke opname die de recorder van raptor schrijft, bevat een Ed25519-hashketen: elke signatuurbox dekt alle bytes sinds de vorige box en is geketend aan de vorige signatuur, dus elke knip, montage of wijziging verbreekt de keten op dat punt.",
  footer_link: "thingino-verify",
  lang_label: "Taal",

  // verdicts
  v_verifying: "{name} wordt geverifieerd ...",
  v_key_wrong: "De sleutel lijkt onjuist",
  v_key_wrong_d: "Een publieke Ed25519-sleutel bestaat uit 64 hex-tekens.",
  v_signed: "Ondertekend en geverifieerd",
  v_signed_closed: "Ondertekend en geverifieerd, netjes afgesloten",
  v_consistent: "Hashketen intact: ondertekenaar niet geverifieerd",
  v_consistent_d: "Elk bereik heeft de juiste hash, maar er is geen sleutel opgegeven. Plak de publieke sleutel van de camera om te verifiëren wie het heeft ondertekend.",
  v_clean: "Geverifieerd, ongewijzigd",
  v_tampered: "GEMANIPULEERD: verificatie mislukt",
  v_unsigned: "Geen signaturen in dit bestand",
  v_unsigned_d: "Dit bestand is niet geschreven door de ondertekenende recorder van raptor (of de signatuurboxen zijn verwijderd).",
  v_unknown: "Kon niet verifiëren",
  v_unreadable: "Onleesbaar bestand.",
  v_fp: "Vingerafdruk van de ondertekeningssleutel:",
  v_sample_fail: "Kon het voorbeeld niet laden",
  v_keyfile_fail: "Kon geen sleutel uit dat bestand lezen",
  v_keyfile_fail_d: "Verwacht: 64 hex-tekens of een ruwe publieke Ed25519-sleutel van 32 bytes.",

  // help balloons (data-help keys)
  help_help: "Zet de hulpmodus aan: beweeg over een besturingselement om te zien wat het doet.",
  help_lang: "Wijzig de taal van de interface (automatisch gedetecteerd uit je browser).",
  help_local: "Het bestand wordt volledig in je browser gelezen en gecontroleerd. Er wordt niets geüpload.",
  help_engine: "De raptor-commit waaruit de verificatie-engine (rverify, gecompileerd naar WebAssembly) is gebouwd.",
  help_drop: "Sleep hier een door raptor ondertekende .mp4-opname of .jpg-momentopname, of klik om er een te kiezen. Het bestand blijft op je eigen machine.",
  help_key: "De publieke Ed25519-sleutel van de camera, 64 hex-tekens. Daarmee bewijst het rapport WIE het bestand heeft ondertekend; zonder de sleutel alleen dat het bestand intern consistent is.",
  help_keyfile: "Laad de publieke sleutel uit een bestand in plaats van hem te plakken: een tekstbestand met de sleutel in hex, of een ruw sleutelbestand van 32 bytes.",
  help_verify: "Voert rverify uit op het geselecteerde bestand. Mogelijke uitkomsten: geverifieerd / consistent (zonder sleutel) / gemanipuleerd / niet ondertekend.",
  help_sample_good: "Een meegeleverde testclip, ondertekend met de publieke TEST-sleutel. Laat zien hoe een geslaagde verificatie eruitziet.",
  help_sample_bad: "Dezelfde testclip met één byte video gewijzigd. Laat zien hoe de hashketen de manipulatie precies aanwijst.",
  help_report: "De onbewerkte uitvoer van rverify: één regel per signatuurbox met de grootte van het bereik en de uitkomst, plus de ingebedde timecodes.",
});
