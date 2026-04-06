/**
 * 【設定エリア】
 * 送信先を増やしたい場合は、ダブルクォーテーションで囲ってカンマで区切ってください。
 */
const RECIPIENTS = [
  "arcadia.cx@gmail.com", // ★自分のアドレスに書き換えてください
  "honeypotbear@gmail.com", // ★自分のアドレスに書き換えてください
  // "other-address@example.com", // ★追加したい場合はここを増やす
];

const SHEET_NAME = "シート1"; // スプレッドシートのシート名を確認してください

/**
 * フォームからデータを受け取った時のメイン処理
 */
function doPost(e) {
  try {
    const params = e.parameter;
    const now = new Date();
    const timestamp = Utilities.formatDate(now, "JST", "yyyy/MM/dd HH:mm:ss");

    // 項目名のリスト（連番付き・最新版）
    const itemLabels = [
      "1.受電電圧ST", "2.二次電圧１ST", "3.主ポンプ電圧２ST", "4.主ポンプ電流２R", "5.800φ運転時間", "6.ランプテスト",
      "7.空気圧縮機１電流", "8.運転状態", "9.燃料移送１電流", "10.運転状態", "11.燃料移送２電流", "12.運転状態", "13.ランプテスト", "14.小出槽残量",
      "15.エンジンオイル量", "16.冷却水量", "17.E初期潤滑１", "18.運転状態", "19.G初期潤滑１", "20.運転状態", "21.減速機CLF", "22.運転状態", "23.逆転機CLF", "24.運転状態",
      "25.回転数", "26.油圧", "27.水圧", "28.600φ運転時間", "29.運転状態", "30.ランプテスト",
      "31.バッテリー液", "32.建物東西ファン", "33.室内灯", "34.外灯",
      "35.除塵機１電流", "36.運転状態", "37.照明", "38.スクリーン清掃",
      "39.南外灯",
      "40.電力使用量", "41.水道使用量", "42.重油残量",
      "43.燃料防油堤排水",
      "44.燃料配管漏れ", "45.吐出弁600φ", "46.吐出弁800φ"
    ];

    let dataRow = [timestamp]; // スプレッドシート用（最初の列は日時）
    let mailBody = "【設備点検レポート】\n";
    mailBody += "報告日時: " + timestamp + "\n";
    mailBody += "----------------------------------\n\n";

    // item1 ～ item46 をループで処理してスプレッドシート用配列とメール本文を生成
    for (let i = 1; i <= 46; i++) {
      let val = params["item" + i] || "-"; // 入力がない場合はハイフン
      dataRow.push(val);
      
      // メール本文に「連番.項目名：値」を追加
      mailBody += itemLabels[i-1] + "：" + val + "\n";
      
      // 改行区切り（セクションごとに見やすく）
      if ([6, 14, 24, 30, 34, 38, 39, 42, 43].includes(i)) {
        mailBody += "\n"; 
      }
    }

    // 1. メール送信（最優先）
    const recipientString = RECIPIENTS.join(",");
    MailApp.sendEmail({
      to: recipientString,
      subject: "【点検完了】設備点検データ (" + timestamp + ")",
      body: mailBody
    });

    // 2. スプレッドシートへの記録
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    sheet.appendRow(dataRow);

    return ContentService.createTextOutput("Success");

  } catch (error) {
    console.error(error);
    return ContentService.createTextOutput("Error: " + error.message);
  }
}