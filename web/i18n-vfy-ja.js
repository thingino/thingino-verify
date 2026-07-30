// Japanese (ja) strings for the verifier: keys mirror i18n-vfy-en.js.
I18N.add("ja", {
  // header
  page_title: "thingino · メディア検証ツール",
  header_full: " Thingino メディア検証ツール",
  header_short: " メディア検証ツール",
  badge_local: "100% ローカル",
  local_title: "ファイルはローカルで読み込まれ、検証されます。何もアップロードされません。",
  engine_title: "rverify のビルド",
  help_title: "ヘルプの吹き出しを切り替え",

  // file picker
  drop_aria: "検証するファイルを選択",
  drop_title: "録画をここにドロップ、またはクリックして選択",
  drop_text: "raptor で署名された <strong>.mp4</strong> 録画または <strong>.jpg</strong> スナップショットをここにドロップ、<br>またはクリックしてファイルを選択",

  // public key
  key_label: "カメラの公開鍵",
  key_optional: "（任意）",
  key_ph: "Ed25519 公開鍵、hex 64 文字",
  keyfile_title: "ファイルから鍵を読み込む",
  key_note: "鍵がない場合はハッシュチェーンの整合性のみを検証し、誰が署名したかは分かりません。",
  key_fp: "鍵の指紋",

  // actions
  verify_btn: "検証",
  try_sample: "サンプルを試す:",
  sample_good: "署名済み",
  sample_good_title: "同梱のテスト鍵で署名されたテストクリップ",
  sample_bad: "改ざん",
  sample_bad_title: "同じクリップで映像の 1 バイトを書き換えたもの",

  // report
  preview_title: "プレビュー",
  preview_note: "ローカルで再生され、アップロードはされません",
  preview_unplayable: "プレビューなし: ブラウザがこのファイルをデコードできません。検証には影響しません。",
  preview_blocked: "再生を保留しました: このファイルは検証に失敗しているため、映っている内容はカメラが実際に記録したものではありません。",
  btn_play_anyway: "それでも再生",
  report_title: "レポート",
  report_note: "<code>rverify</code> の出力そのまま",
  log_intro: "検証するファイルを選んでください。raptor のレコーダーが書き出す録画には Ed25519 のハッシュチェーンが含まれます。各署名ボックスは直前のボックス以降の全バイトを対象とし、直前の署名につながっているため、カット・つなぎ替え・編集を行うとその位置でチェーンが壊れます。",
  footer_link: "thingino-verify",
  settings_lang: "言語",
  settings_title: "設定",
  gear_title: "設定",
  btn_close: "閉じる",
  setting_help_label: "ヘルプヒントを表示：任意のコントロールにカーソルを合わせるとヒントが表示されます（または ? ボタンを使用）。",

  // verdicts
  v_verifying: "{name} を検証中 …",
  v_key_wrong: "鍵が正しくないようです",
  v_key_wrong_d: "Ed25519 公開鍵は hex 64 文字です。",
  v_signed: "署名を確認、検証に成功",
  v_signed_closed: "署名を確認、検証に成功。ファイルも正常に閉じられています",
  v_consistent: "ハッシュチェーンは無傷 - 署名者は未検証",
  v_consistent_d: "すべての範囲のハッシュは正しいものの、鍵が指定されていません。カメラの公開鍵を貼り付けると、誰が署名したかを検証できます。",
  v_clean: "検証済み、問題なし",
  v_tampered: "改ざんあり - 検証に失敗しました",
  v_unsigned: "このファイルに署名はありません",
  v_unsigned_d: "このファイルは raptor の署名付きレコーダーで書き出されたものではありません（または署名ボックスが取り除かれています）。",
  v_unknown: "検証できませんでした",
  v_unreadable: "読み取れないファイルです。",
  v_fp: "署名鍵のフィンガープリント:",
  v_sample_fail: "サンプルを読み込めませんでした",
  v_keyfile_fail: "そのファイルから鍵を読み取れませんでした",
  v_keyfile_fail_d: "hex 64 文字、または 32 バイトの生の Ed25519 公開鍵ファイルが必要です。",

  // help balloons (data-help keys)
  help_help: "ヘルプモードの切り替え: 任意のコントロールにカーソルを合わせると、その機能が表示されます。",
  help_lang: "インターフェースの言語を切り替えます（ブラウザから自動検出）。",
  help_local: "ファイルの読み込みと検証はすべてブラウザ内で行われます。どこにも何もアップロードされません。",
  help_engine: "検証エンジン（rverify、WebAssembly にコンパイル済み）のビルド元となった raptor のコミット。",
  help_drop: "raptor で署名された .mp4 録画または .jpg スナップショットをここにドロップするか、クリックして選択します。ファイルはお使いのマシンに留まります。",
  help_key: "カメラの Ed25519 公開鍵、hex 64 文字。これがあればレポートは誰が署名したかを証明できます。ない場合は、ファイルが内部的に整合していることだけが分かります。",
  help_keyfile: "公開鍵を貼り付ける代わりにファイルから読み込みます: hex 形式の鍵を含むテキストファイル、または 32 バイトの生の鍵ファイル。",
  help_verify: "選択したファイルに対して rverify を実行します。判定結果: 検証成功 / 整合（鍵なし）/ 改ざん / 未署名。",
  help_sample_good: "公開 TEST 鍵で署名された同梱のテストクリップ。検証が正常に通ったときの表示を確認できます。",
  help_sample_bad: "同じテストクリップで映像の 1 バイトを書き換えたもの。ハッシュチェーンが改ざん箇所を特定する仕組みを示します。",
  help_settings: "設定: インターフェースの言語とヘルプヒント。",
  help_preview: "選択したファイルをブラウザのメモリから直接再生するので、検証したばかりの内容をその場で確認できます。何もアップロードされません。",
  help_report: "rverify の出力そのまま: 署名ボックスごとに 1 行で、その範囲のサイズと判定、さらに埋め込みタイムコードが表示されます。",
});
