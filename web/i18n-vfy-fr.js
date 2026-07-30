// French strings for the verifier: keys mirror i18n-vfy-en.js.
I18N.add("fr", {
  // header
  page_title: "thingino · Vérificateur de médias",
  header_full: " Vérificateur de médias Thingino",
  header_short: " Vérificateur de médias",
  badge_local: "100% local",
  local_title: "Le fichier est lu et vérifié localement ; rien n'est envoyé.",
  engine_title: "compilation de rverify",
  help_title: "Afficher ou masquer les bulles d'aide",

  // file picker
  drop_aria: "Choisir un fichier à vérifier",
  drop_title: "Déposez un enregistrement ici, ou cliquez pour le choisir",
  drop_text: "Déposez ici un enregistrement <strong>.mp4</strong> ou une capture <strong>.jpg</strong> signés par raptor,<br>ou cliquez pour choisir un fichier",

  // public key
  key_label: "Clé publique de la caméra",
  key_optional: "(facultatif)",
  key_ph: "Clé publique Ed25519, 64 caractères hex",
  keyfile_title: "Charger la clé depuis un fichier",
  key_note: "Sans clé, seule l'intégrité de la chaîne de hachage est vérifiée, pas l'identité du signataire.",
  key_fp: "empreinte de clé",

  // actions
  verify_btn: "Vérifier",
  try_sample: "Essayez un exemple :",
  sample_good: "signé",
  sample_good_title: "Un clip de test signé avec la clé de test incluse",
  sample_bad: "falsifié",
  sample_bad_title: "Le même clip avec un octet de vidéo modifié",

  // report
  report_title: "Rapport",
  report_note: "sortie brute de <code>rverify</code>",
  log_intro: "Choisissez un fichier à vérifier. Chaque enregistrement écrit par l'enregistreur de raptor porte une chaîne de hachage Ed25519 : chaque bloc de signature couvre tous les octets depuis le bloc précédent et est chaîné à la signature précédente, si bien que toute coupe, tout montage ou toute modification rompt la chaîne à cet endroit.",
  footer_link: "thingino-verify",
  lang_label: "Langue",

  // verdicts
  v_verifying: "vérification de {name} ...",
  v_key_wrong: "La clé semble incorrecte",
  v_key_wrong_d: "Une clé publique Ed25519 comporte 64 caractères hex.",
  v_signed: "Signé et vérifié",
  v_signed_closed: "Signé et vérifié, correctement clôturé",
  v_consistent: "Chaîne de hachage intacte : signataire non vérifié",
  v_consistent_d: "Chaque plage a un hachage correct, mais aucune clé n'a été fournie. Collez la clé publique de la caméra pour vérifier qui a signé.",
  v_clean: "Vérifié, intact",
  v_tampered: "FALSIFIÉ : la vérification a échoué",
  v_unsigned: "Aucune signature dans ce fichier",
  v_unsigned_d: "Ce fichier n'a pas été écrit par l'enregistreur signant de raptor (ou ses blocs de signature ont été retirés).",
  v_unknown: "Vérification impossible",
  v_unreadable: "Fichier illisible.",
  v_fp: "Empreinte de la clé de signature :",
  v_sample_fail: "Impossible de charger l'exemple",
  v_keyfile_fail: "Impossible de lire une clé dans ce fichier",
  v_keyfile_fail_d: "64 caractères hex ou une clé publique Ed25519 brute de 32 octets étaient attendus.",

  // help balloons (data-help keys)
  help_help: "Active le mode aide : survolez n'importe quel contrôle pour voir ce qu'il fait.",
  help_lang: "Changez la langue de l'interface (détectée automatiquement depuis votre navigateur).",
  help_local: "Le fichier est lu et vérifié entièrement dans votre navigateur. Rien n'est envoyé où que ce soit.",
  help_engine: "Le commit raptor à partir duquel le moteur de vérification (rverify, compilé en WebAssembly) a été construit.",
  help_drop: "Déposez ici un enregistrement .mp4 ou une capture .jpg signés par raptor, ou cliquez pour en choisir un. Le fichier reste sur votre machine.",
  help_key: "La clé publique Ed25519 de la caméra, 64 caractères hex. Avec elle, le rapport prouve QUI a signé le fichier ; sans elle, seulement que le fichier est cohérent en interne.",
  help_keyfile: "Chargez la clé publique depuis un fichier au lieu de la coller : un fichier texte contenant la clé en hex, ou un fichier de clé brute de 32 octets.",
  help_verify: "Exécute rverify sur le fichier sélectionné. Verdicts possibles : vérifié / cohérent (sans clé) / falsifié / non signé.",
  help_sample_good: "Un clip de test inclus, signé avec la clé TEST publique. Montre à quoi ressemble une vérification réussie.",
  help_sample_bad: "Le même clip de test avec un octet de vidéo modifié. Montre comment la chaîne de hachage localise précisément la falsification.",
  help_report: "La sortie brute de rverify : une ligne par bloc de signature avec la taille de sa plage et son verdict, ainsi que les codes temporels intégrés.",
});
