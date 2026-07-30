// Korean (ko) strings for the verifier: keys mirror i18n-vfy-en.js.
I18N.add("ko", {
  // header
  page_title: "thingino · 미디어 검증기",
  header_full: " Thingino 미디어 검증기",
  header_short: " 미디어 검증기",
  badge_local: "100% 로컬",
  local_title: "파일은 로컬에서 읽고 검증되며, 아무것도 업로드되지 않습니다.",
  engine_title: "rverify 빌드",
  help_title: "도움말 풍선 켜기/끄기",

  // file picker
  drop_aria: "검증할 파일 선택",
  drop_title: "녹화 파일을 여기에 놓거나 클릭해 선택하세요",
  drop_text: "raptor로 서명된 <strong>.mp4</strong> 녹화 또는 <strong>.jpg</strong> 스냅샷을 여기에 놓거나,<br>클릭해서 파일을 선택하세요",

  // public key
  key_label: "카메라 공개 키",
  key_optional: "(선택 사항)",
  key_ph: "Ed25519 공개 키, hex 64자",
  keyfile_title: "파일에서 키 불러오기",
  key_note: "키가 없으면 해시 체인의 무결성만 확인하며, 누가 서명했는지는 알 수 없습니다.",
  key_fp: "키 지문",

  // actions
  verify_btn: "검증",
  try_sample: "샘플 사용해 보기:",
  sample_good: "서명됨",
  sample_good_title: "번들된 테스트 키로 서명한 테스트 클립",
  sample_bad: "변조됨",
  sample_bad_title: "같은 클립에서 영상 1바이트를 바꾼 것",

  // report
  preview_title: "미리 보기",
  preview_note: "로컬에서 재생되며 업로드되지 않음",
  preview_unplayable: "미리 보기 없음: 브라우저가 이 파일을 디코딩할 수 없습니다. 검증에는 영향이 없습니다.",
  report_title: "보고서",
  report_note: "<code>rverify</code> 출력 원문",
  log_intro: "검증할 파일을 선택하세요. raptor 레코더가 기록한 모든 녹화에는 Ed25519 해시 체인이 들어 있습니다. 각 서명 박스는 이전 박스 이후의 모든 바이트를 포함하며 이전 서명에 연결되어 있으므로, 잘라내기나 이어붙이기, 편집이 있으면 그 지점에서 체인이 끊어집니다.",
  footer_link: "thingino-verify",
  settings_lang: "언어",
  settings_title: "설정",
  gear_title: "설정",
  btn_close: "닫기",
  setting_help_label: "도움말 힌트 표시: 아무 컨트롤에나 마우스를 올리면 힌트가 표시됩니다(또는 ? 버튼 사용).",

  // verdicts
  v_verifying: "{name} 검증 중 …",
  v_key_wrong: "키가 올바르지 않은 것 같습니다",
  v_key_wrong_d: "Ed25519 공개 키는 hex 64자입니다.",
  v_signed: "서명 확인, 검증 성공",
  v_signed_closed: "서명 확인, 검증 성공. 파일도 정상적으로 마무리되었습니다",
  v_consistent: "해시 체인 온전함 - 서명자 미확인",
  v_consistent_d: "모든 구간의 해시가 올바르지만 키가 제공되지 않았습니다. 카메라의 공개 키를 붙여 넣으면 누가 서명했는지 검증할 수 있습니다.",
  v_clean: "검증 완료, 이상 없음",
  v_tampered: "변조됨 - 검증 실패",
  v_unsigned: "이 파일에는 서명이 없습니다",
  v_unsigned_d: "이 파일은 raptor의 서명 레코더로 기록된 것이 아닙니다(또는 서명 박스가 제거되었습니다).",
  v_unknown: "검증할 수 없습니다",
  v_unreadable: "읽을 수 없는 파일입니다.",
  v_fp: "서명 키 지문:",
  v_sample_fail: "샘플을 불러올 수 없습니다",
  v_keyfile_fail: "그 파일에서 키를 읽을 수 없습니다",
  v_keyfile_fail_d: "hex 64자 또는 32바이트 원시 Ed25519 공개 키 파일이 필요합니다.",

  // help balloons (data-help keys)
  help_help: "도움말 모드 전환: 아무 컨트롤에나 마우스를 올리면 어떤 기능인지 표시됩니다.",
  help_lang: "인터페이스 언어를 전환합니다(브라우저에서 자동 감지).",
  help_local: "파일은 전부 브라우저 안에서 읽고 검증됩니다. 어디에도 아무것도 업로드되지 않습니다.",
  help_engine: "검증 엔진(rverify, WebAssembly로 컴파일됨)이 빌드된 raptor 커밋입니다.",
  help_drop: "raptor로 서명된 .mp4 녹화나 .jpg 스냅샷을 여기에 놓거나 클릭해서 선택하세요. 파일은 사용자 컴퓨터에 그대로 남습니다.",
  help_key: "카메라의 Ed25519 공개 키, hex 64자. 키가 있으면 보고서가 누가 서명했는지 증명하며, 없으면 파일이 내부적으로 일관된다는 사실만 알 수 있습니다.",
  help_keyfile: "공개 키를 붙여 넣는 대신 파일에서 불러옵니다: hex 키가 담긴 텍스트 파일이나 32바이트 원시 키 파일.",
  help_verify: "선택한 파일에 rverify를 실행합니다. 판정 결과: 검증됨 / 일관됨(키 없음) / 변조됨 / 서명 없음.",
  help_sample_good: "공개 TEST 키로 서명된 번들 테스트 클립입니다. 정상 검증이 어떻게 보이는지 보여줍니다.",
  help_sample_bad: "같은 테스트 클립에서 영상 1바이트를 바꾼 것입니다. 해시 체인이 변조 지점을 어떻게 짚어내는지 보여줍니다.",
  help_settings: "설정: 인터페이스 언어와 도움말 힌트.",
  help_preview: "선택한 파일을 브라우저 메모리에서 바로 재생하여 방금 검증한 내용을 확인할 수 있습니다. 아무것도 업로드되지 않습니다.",
  help_report: "rverify 출력 원문: 서명 박스마다 한 줄씩 구간 크기와 판정이 표시되고, 내장된 타임코드도 함께 나옵니다.",
});
