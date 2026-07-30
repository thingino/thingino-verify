// Polish strings for the verifier: keys mirror i18n-vfy-en.js.
I18N.add("pl", {
  // header
  page_title: "thingino · Weryfikator multimediów",
  header_full: " Thingino Weryfikator multimediów",
  header_short: " Weryfikator multimediów",
  badge_local: "100% lokalnie",
  local_title: "Plik jest odczytywany i weryfikowany lokalnie; nic nie jest wysyłane.",
  engine_title: "wersja rverify",
  help_title: "Przełącz dymki pomocy",

  // file picker
  drop_aria: "Wybierz plik do weryfikacji",
  drop_title: "Przeciągnij tu nagranie lub kliknij, aby wybrać",
  drop_text: "Przeciągnij tu nagranie <strong>.mp4</strong> lub zdjęcie <strong>.jpg</strong> podpisane przez raptor,<br>albo kliknij, aby wybrać plik",

  // public key
  key_label: "Klucz publiczny kamery",
  key_optional: "(opcjonalnie)",
  key_ph: "Klucz publiczny Ed25519, 64 znaki hex",
  keyfile_title: "Wczytaj klucz z pliku",
  key_note: "Bez klucza sprawdzana jest tylko spójność łańcucha skrótów, a nie to, kto podpisał plik.",
  key_fp: "odcisk klucza",

  // actions
  verify_btn: "Weryfikuj",
  try_sample: "Wypróbuj próbkę:",
  sample_good: "podpisany",
  sample_good_title: "Testowy klip podpisany dołączonym kluczem testowym",
  sample_bad: "zmanipulowany",
  sample_bad_title: "Ten sam klip z jednym zmienionym bajtem obrazu",

  // report
  report_title: "Raport",
  report_note: "dosłowne wyjście <code>rverify</code>",
  log_intro: "Wybierz plik do weryfikacji. Każde nagranie zapisane przez rejestrator raptor zawiera łańcuch skrótów Ed25519: każdy blok podpisu obejmuje wszystkie bajty od poprzedniego bloku i jest powiązany z poprzednim podpisem, więc każde wycięcie, wklejenie lub edycja przerywa łańcuch w tym miejscu.",
  footer_link: "thingino-verify",
  lang_label: "Język",

  // verdicts
  v_verifying: "weryfikowanie {name} ...",
  v_key_wrong: "Klucz wygląda niepoprawnie",
  v_key_wrong_d: "Klucz publiczny Ed25519 ma 64 znaki hex.",
  v_signed: "Podpisany i zweryfikowany",
  v_signed_closed: "Podpisany i zweryfikowany, poprawnie zamknięty",
  v_consistent: "Łańcuch skrótów nienaruszony - podpisujący niezweryfikowany",
  v_consistent_d: "Każdy zakres ma poprawny skrót, ale nie podano klucza. Wklej klucz publiczny kamery, aby sprawdzić, kto podpisał plik.",
  v_clean: "Zweryfikowano, bez zastrzeżeń",
  v_tampered: "ZMANIPULOWANY - weryfikacja nie powiodła się",
  v_unsigned: "Brak podpisów w tym pliku",
  v_unsigned_d: "Ten plik nie został zapisany przez podpisujący rejestrator raptor (albo bloki podpisu zostały usunięte).",
  v_unknown: "Nie udało się zweryfikować",
  v_unreadable: "Nieczytelny plik.",
  v_fp: "Odcisk klucza podpisującego:",
  v_sample_fail: "Nie udało się wczytać próbki",
  v_keyfile_fail: "Nie udało się odczytać klucza z tego pliku",
  v_keyfile_fail_d: "Oczekiwano 64 znaków hex albo surowego 32-bajtowego klucza publicznego Ed25519.",

  // help balloons (data-help keys)
  help_help: "Przełącz tryb pomocy: najedź na dowolny element, aby zobaczyć, co robi.",
  help_lang: "Zmień język interfejsu (wykrywany automatycznie z przeglądarki).",
  help_local: "Plik jest odczytywany i weryfikowany w całości w twojej przeglądarce. Nic nie jest nigdzie wysyłane.",
  help_engine: "Commit raptor, z którego zbudowano silnik weryfikacji (rverify skompilowany do WebAssembly).",
  help_drop: "Przeciągnij tu nagranie .mp4 lub zdjęcie .jpg podpisane przez raptor, albo kliknij, aby wybrać plik. Plik pozostaje na twoim urządzeniu.",
  help_key: "Klucz publiczny Ed25519 kamery, 64 znaki hex. Z nim raport dowodzi, KTO podpisał plik; bez niego tylko tego, że plik jest wewnętrznie spójny.",
  help_keyfile: "Wczytaj klucz publiczny z pliku, zamiast go wklejać: plik tekstowy z kluczem w hex albo surowy 32-bajtowy plik klucza.",
  help_verify: "Uruchom rverify na wybranym pliku. Możliwe wyniki: zweryfikowany / spójny (bez klucza) / zmanipulowany / niepodpisany.",
  help_sample_good: "Dołączony klip testowy podpisany publicznym kluczem TEST. Pokazuje, jak wygląda poprawna weryfikacja.",
  help_sample_bad: "Ten sam klip testowy z jednym zmienionym bajtem obrazu. Pokazuje, jak łańcuch skrótów wskazuje miejsce manipulacji.",
  help_report: "Dosłowne wyjście rverify: jedna linia na blok podpisu z rozmiarem jego zakresu i wynikiem, plus wbudowane kody czasowe.",
});
