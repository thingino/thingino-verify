// Turkish strings for the verifier: keys mirror i18n-vfy-en.js.
I18N.add("tr", {
  // header
  page_title: "thingino · Medya Doğrulayıcı",
  header_full: " Thingino Medya Doğrulayıcı",
  header_short: " Medya Doğrulayıcı",
  badge_local: "%100 yerel",
  local_title: "Dosya yerel olarak okunur ve doğrulanır; hiçbir şey yüklenmez.",
  engine_title: "rverify sürümü",
  help_title: "Yardım balonlarını aç/kapat",

  // file picker
  drop_aria: "Doğrulanacak bir dosya seçin",
  drop_title: "Bir kaydı buraya bırakın veya seçmek için tıklayın",
  drop_text: "raptor ile imzalanmış bir <strong>.mp4</strong> kaydını ya da <strong>.jpg</strong> anlık görüntüsünü buraya bırakın,<br>veya dosya seçmek için tıklayın",

  // public key
  key_label: "Kamera açık anahtarı",
  key_optional: "(isteğe bağlı)",
  key_ph: "Ed25519 açık anahtarı, 64 hex karakter",
  keyfile_title: "Anahtarı bir dosyadan yükle",
  key_note: "Anahtar olmadan yalnızca hash zincirinin bütünlüğü denetlenir, kimin imzaladığı denetlenmez.",
  key_fp: "anahtar parmak izi",

  // actions
  verify_btn: "Doğrula",
  try_sample: "Bir örnek deneyin:",
  sample_good: "imzalı",
  sample_good_title: "Birlikte gelen test anahtarıyla imzalanmış bir test klibi",
  sample_bad: "değiştirilmiş",
  sample_bad_title: "Aynı klibin video verisinde bir baytı değiştirilmiş hali",

  // report
  report_title: "Rapor",
  report_note: "birebir <code>rverify</code> çıktısı",
  log_intro: "Doğrulanacak bir dosya seçin. raptor'un kaydedicisi tarafından yazılan her kayıt bir Ed25519 hash zinciri taşır: her imza kutusu önceki kutudan bu yana gelen tüm baytları kapsar ve önceki imzaya zincirlenir, bu yüzden herhangi bir kesme, ekleme veya düzenleme zinciri o noktada kırar.",
  footer_link: "thingino-verify",
  lang_label: "Dil",

  // verdicts
  v_verifying: "{name} doğrulanıyor ...",
  v_key_wrong: "Anahtar hatalı görünüyor",
  v_key_wrong_d: "Bir Ed25519 açık anahtarı 64 hex karakterdir.",
  v_signed: "İmzalı ve doğrulandı",
  v_signed_closed: "İmzalı ve doğrulandı, düzgün şekilde kapatılmış",
  v_consistent: "Hash zinciri sağlam - imzalayan doğrulanmadı",
  v_consistent_d: "Her aralığın hash'i doğru, ancak hiçbir anahtar verilmedi. Kimin imzaladığını doğrulamak için kameranın açık anahtarını yapıştırın.",
  v_clean: "Doğrulandı, sorun yok",
  v_tampered: "DEĞİŞTİRİLMİŞ - doğrulama başarısız",
  v_unsigned: "Bu dosyada imza yok",
  v_unsigned_d: "Bu dosya raptor'un imzalayan kaydedicisi tarafından yazılmamış (veya imza kutuları çıkarılmış).",
  v_unknown: "Doğrulanamadı",
  v_unreadable: "Okunamayan dosya.",
  v_fp: "İmzalama anahtarının parmak izi:",
  v_sample_fail: "Örnek yüklenemedi",
  v_keyfile_fail: "Bu dosyadan bir anahtar okunamadı",
  v_keyfile_fail_d: "64 hex karakter veya 32 baytlık ham bir Ed25519 açık anahtarı bekleniyordu.",

  // help balloons (data-help keys)
  help_help: "Yardım modunu aç/kapat: ne yaptığını görmek için herhangi bir kontrolün üzerine gelin.",
  help_lang: "Arayüz dilini değiştirir (tarayıcınızdan otomatik algılanır).",
  help_local: "Dosya tamamen tarayıcınızda okunur ve doğrulanır. Hiçbir yere hiçbir şey yüklenmez.",
  help_engine: "Doğrulama motorunun (WebAssembly'ye derlenmiş rverify) derlendiği raptor commit'i.",
  help_drop: "raptor ile imzalanmış bir .mp4 kaydını ya da .jpg anlık görüntüsünü buraya bırakın veya seçmek için tıklayın. Dosya sizin makinenizde kalır.",
  help_key: "Kameranın Ed25519 açık anahtarı, 64 hex karakter. Bununla rapor dosyayı KİMİN imzaladığını kanıtlar; onsuz yalnızca dosyanın kendi içinde tutarlı olduğunu.",
  help_keyfile: "Açık anahtarı yapıştırmak yerine bir dosyadan yükleyin: hex anahtarı içeren bir metin dosyası ya da 32 baytlık ham bir anahtar dosyası.",
  help_verify: "Seçili dosyada rverify'ı çalıştırır. Olası sonuçlar: doğrulandı / tutarlı (anahtarsız) / değiştirilmiş / imzasız.",
  help_sample_good: "Herkese açık TEST anahtarıyla imzalanmış, birlikte gelen bir test klibi. Sorunsuz bir doğrulamanın nasıl göründüğünü gösterir.",
  help_sample_bad: "Aynı test klibinin video verisinde bir baytı değiştirilmiş hali. Hash zincirinin kurcalamayı nasıl tam olarak saptadığını gösterir.",
  help_report: "Birebir rverify çıktısı: her imza kutusu için kapsadığı aralığın boyutunu ve sonucunu içeren birer satır, ayrıca gömülü zaman kodları.",
});
