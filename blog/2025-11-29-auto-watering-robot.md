---
slug: auto-watering-robot
title: 【週末DIY】Arduino で作る自動水やりロボット - 3時間で完成！
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [Arduino, IoT, DIY, ロボット, 電子工作]
---

植物の水やり、忘れがちですよね。出張や旅行中に枯らしてしまった経験はありませんか？

この記事では、Arduino を使って **3時間で作れる自動水やりロボット** の作り方を紹介します。土の乾き具合を検知して、自動で水をあげてくれる便利なガジェットです。

<!--truncate-->

## 🎯 このプロジェクトで解決できる課題

- 水やりを忘れて植物を枯らしてしまう
- 出張や旅行中の水やりが心配
- 水のあげすぎで根腐れを起こしてしまう

## 📦 必要なもの

### ハードウェア

| 部品 | 数量 | 参考価格 |
|------|------|----------|
| Arduino Uno (または互換機) | 1 | ¥500〜2,000 |
| 土壌湿度センサー | 1 | ¥200〜500 |
| 5V リレーモジュール | 1 | ¥200〜400 |
| 小型水中ポンプ (3-6V) | 1 | ¥300〜600 |
| シリコンチューブ (内径6mm) | 1m | ¥200 |
| ジャンパーワイヤー | 適量 | ¥300 |
| ブレッドボード | 1 | ¥200 |
| USB電源またはACアダプター | 1 | - |

**合計: 約2,000〜4,000円**

### ソフトウェア

- Arduino IDE（無料）

## 🔧 システム構成図

```
┌─────────────────┐
│   Arduino Uno   │
│                 │
│  A0 ←──────────── 土壌湿度センサー（土に刺す）
│                 │
│  D7 ──────────→ リレーモジュール ──→ 水中ポンプ
│                 │                      ↓
│  5V ──→ 各部品   │                    水タンク
│  GND ──→ 各部品  │                      ↓
└─────────────────┘                    チューブで植物へ
```

## 📝 ステップ1: 配線する（30分）

### 土壌湿度センサーの接続

```
センサー    →    Arduino
─────────────────────────
VCC         →    5V
GND         →    GND
A0          →    A0
```

### リレーモジュールの接続

```
リレー      →    Arduino
─────────────────────────
VCC         →    5V
GND         →    GND
IN          →    D7
```

### ポンプの接続

```
ポンプ      →    リレー
─────────────────────────
+（赤）     →    NO（ノーマルオープン）
-（黒）     →    COM（コモン、電源のGND経由）
```

:::tip ポイント
リレーを使うことで、Arduino の弱い電流でポンプをON/OFF制御できます。ポンプには別途5V電源を供給してください。
:::

## 📝 ステップ2: コードを書く（30分）

Arduino IDE で以下のコードを書き込みます：

```cpp
// 自動水やりロボット
// 土壌の湿度を監視して、乾いたら自動で水をあげる

const int SOIL_SENSOR_PIN = A0;  // 土壌センサーのピン
const int PUMP_RELAY_PIN = 7;    // リレーのピン

// 設定値（環境に合わせて調整してください）
const int DRY_THRESHOLD = 400;   // これより低いと「乾いている」
const int WET_THRESHOLD = 600;   // これより高いと「湿っている」
const int WATERING_TIME = 3000;  // 水やり時間（ミリ秒）
const int CHECK_INTERVAL = 60000; // チェック間隔（ミリ秒）= 1分

void setup() {
  Serial.begin(9600);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW); // ポンプOFF

  Serial.println("=== 自動水やりロボット起動 ===");
}

void loop() {
  // 土壌の湿度を読み取る
  int soilMoisture = analogRead(SOIL_SENSOR_PIN);

  Serial.print("土壌湿度: ");
  Serial.print(soilMoisture);

  // 状態を判定
  if (soilMoisture < DRY_THRESHOLD) {
    Serial.println(" → 乾燥！水やりします");
    waterPlant();
  } else if (soilMoisture > WET_THRESHOLD) {
    Serial.println(" → 十分湿っています");
  } else {
    Serial.println(" → 適度な湿度です");
  }

  // 次のチェックまで待機
  delay(CHECK_INTERVAL);
}

void waterPlant() {
  // ポンプをON
  digitalWrite(PUMP_RELAY_PIN, HIGH);
  Serial.println("ポンプON - 水やり中...");

  // 指定時間だけ水を出す
  delay(WATERING_TIME);

  // ポンプをOFF
  digitalWrite(PUMP_RELAY_PIN, LOW);
  Serial.println("ポンプOFF - 水やり完了！");

  // 水が土に浸透するまで少し待つ
  Serial.println("浸透待ち（30秒）...");
  delay(30000);
}
```

## 📝 ステップ3: 組み立てる（1時間）

### 3-1. 水タンクの準備

ペットボトル（500ml〜2L）を水タンクとして使います。

1. ペットボトルに水を入れる
2. ポンプを底に沈める
3. チューブをポンプに接続

### 3-2. センサーの設置

1. 土壌センサーを植木鉢の土に刺す
2. 深さは2〜3cm程度がベスト
3. 根を傷つけないよう注意

### 3-3. チューブの配置

1. チューブを植物の根元に向ける
2. 固定テープで軽く固定
3. 水が飛び散らないよう先端を調整

## 📝 ステップ4: キャリブレーション（30分）

土壌センサーの値は環境によって異なります。まずは実測しましょう。

### 測定方法

1. **乾いた土の値を測定**: 数日水をあげていない土にセンサーを刺す
2. **湿った土の値を測定**: 水をたっぷりあげた直後に測定
3. **コードの閾値を調整**: 測定した値をもとに `DRY_THRESHOLD` と `WET_THRESHOLD` を設定

```cpp
// 例: 乾いた土が300、湿った土が700の場合
const int DRY_THRESHOLD = 350;  // 乾燥判定
const int WET_THRESHOLD = 600;  // 十分湿っている判定
```

## 📝 ステップ5: テスト運転（30分）

1. Arduino IDE のシリアルモニタを開く（9600baud）
2. 動作ログを確認
3. 手動で土を乾かして（ドライヤーなど）動作テスト
4. 水やり量が適切か確認

## 🚀 発展アイデア

基本形ができたら、こんな機能を追加してみましょう：

### LED表示を追加
```cpp
const int LED_RED = 8;    // 乾燥
const int LED_GREEN = 9;  // 適度
const int LED_BLUE = 10;  // 湿りすぎ
```

### Wi-Fi対応（ESP32版）
ESP32を使えば、スマホに通知を送ったり、外出先から状態確認ができます。

### 複数の植物に対応
センサーとポンプを増やせば、複数の鉢を管理できます。

## ⚠️ 注意事項

- **防水対策**: 電子部品に水がかからないよう配置に注意
- **電源**: 長期運用にはACアダプターがおすすめ
- **水タンク補充**: 定期的に水を補充してください
- **センサー寿命**: 土壌センサーは数ヶ月で劣化することがあります

## 🎉 まとめ

| 項目 | 内容 |
|------|------|
| 制作時間 | 約3時間 |
| 難易度 | ★☆☆（初心者OK） |
| 費用 | 約2,000〜4,000円 |
| メンテナンス | 水タンク補充のみ |

Arduino 初心者でも作れるシンプルな構成ながら、実際の課題（水やり忘れ）を解決できる実用的なプロジェクトです。

週末のDIYプロジェクトとして、ぜひチャレンジしてみてください！

## 📚 参考リンク

- [Arduino 公式サイト](https://www.arduino.cc/)
- [土壌湿度センサーのデータシート](https://www.arduino.cc/en/Tutorial/BuiltInExamples)
