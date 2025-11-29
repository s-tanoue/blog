---
slug: access-token-refresh-token-guide
title: 【図解】アクセストークンとリフレッシュトークンの違い - なぜ2つ必要なの？
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [セキュリティ, 認証, トークン, OAuth, JWT]
---

「アクセストークンだけでいいじゃん、なんでリフレッシュトークンが必要なの？」

この疑問、実はとても良い質問です。この記事では、**レストランの食券システム**をたとえに、2つのトークンが必要な理由を図解でわかりやすく解説します。

<!--truncate-->

## この記事で学べること

```mermaid
mindmap
  root((トークンの世界))
    アクセストークン
      短命
      APIアクセス用
      頻繁に使う
    リフレッシュトークン
      長命
      トークン再発行用
      厳重に保管
    なぜ2つ必要？
      セキュリティ
      ユーザー体験
      バランスが大事
```

## 第1章：レストランで理解するトークンの仕組み

まず、**レストランの食券システム**でトークンの役割を理解しましょう。

### 登場人物

```mermaid
flowchart LR
    subgraph レストラン
    A[お客さん<br>= ユーザー]
    B[受付<br>= 認証サーバー]
    C[キッチン<br>= APIサーバー]
    end

    A -->|メンバーズカード提示| B
    B -->|食券を発行| A
    A -->|食券で注文| C
    C -->|料理を提供| A

    style B fill:#4285f4,color:#fff
    style C fill:#34a853,color:#fff
```

| レストラン | システム | 役割 |
|-----------|----------|------|
| お客さん | ユーザー | サービスを使いたい人 |
| 受付 | 認証サーバー | 本人確認・トークン発行 |
| キッチン | APIサーバー | 実際のサービス提供 |
| メンバーズカード | リフレッシュトークン | 長期的な会員証明 |
| 食券 | アクセストークン | その場限りの利用権 |

## 第2章：アクセストークン - 「食券」のたとえ

### アクセストークンとは

:::tip 食券のたとえ
レストランで**食券**を買ったことはありますか？

食券の特徴：
- **その日限り有効**（翌日は使えない）
- **特定の料理専用**（ラーメン食券でカレーは食べられない）
- **誰でも使える**（落としたら他人に使われる可能性）
- **安い**（なくしても大損害ではない）

これが**アクセストークン**のイメージです！
:::

```mermaid
flowchart TB
    subgraph アクセストークン = 食券
    A[有効期限: 短い<br>通常15分〜1時間]
    B[用途: APIへのアクセス]
    C[特徴: 頻繁に使う]
    D[リスク: 盗まれる可能性あり]
    end

    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style D fill:#ffcdd2
```

### 食券（アクセストークン）の使い方

```mermaid
sequenceDiagram
    participant User as お客さん
    participant Kitchen as キッチン

    User->>Kitchen: 食券を渡す<br>「ラーメンください」
    Kitchen->>Kitchen: 食券を確認<br>・有効期限OK？<br>・ラーメン用？
    Kitchen->>User: はい、ラーメンです！

    Note over User,Kitchen: 食券1枚につき1回の注文
```

### なぜ食券は短命なのか

```mermaid
flowchart TB
    subgraph 食券が盗まれた場合
    A[悪い人が食券を拾う] --> B[ラーメンを注文]
    B --> C[被害: ラーメン1杯分]
    end

    subgraph もし食券が永久に使えたら
    D[悪い人が食券を拾う] --> E[何度も注文し放題]
    E --> F[被害: 無限大！]
    end

    style C fill:#fff9c4
    style F fill:#ffcdd2
```

:::warning ポイント
アクセストークンが短命なのは、**盗まれたときの被害を最小限にするため**です。

15分で期限切れなら、攻撃者が悪用できる時間も15分だけ！
:::

## 第3章：リフレッシュトークン - 「メンバーズカード」のたとえ

### リフレッシュトークンとは

:::tip メンバーズカードのたとえ
レストランの**メンバーズカード**を想像してください。

メンバーズカードの特徴：
- **長期間有効**（年会員など）
- **本人しか使えない**（顔写真付き）
- **新しい食券を発行できる**
- **なくしたら大変**（再発行に手間がかかる）
- **財布の奥に大切に保管**

これが**リフレッシュトークン**のイメージです！
:::

```mermaid
flowchart TB
    subgraph refresh[リフレッシュトークン = メンバーズカード]
    A[有効期限: 長い<br>数日〜数ヶ月]
    B[用途: 新しいアクセストークン取得]
    C[特徴: たまにしか使わない]
    D[リスク: 盗まれたら危険！]
    E[保管: 厳重に管理]
    end

    style A fill:#fff3e0
    style B fill:#fff3e0
    style C fill:#fff3e0
    style D fill:#ffcdd2
    style E fill:#c8e6c9
```

### メンバーズカード（リフレッシュトークン）の使い方

```mermaid
sequenceDiagram
    participant User as お客さん
    participant Front as 受付
    participant Kitchen as キッチン

    Note over User: 食券の期限が切れた！

    User->>Kitchen: 古い食券で注文
    Kitchen->>User: この食券は期限切れです

    User->>Front: メンバーズカードを提示<br>「新しい食券ください」
    Front->>Front: カードを確認<br>・有効期限OK？<br>・本人確認
    Front->>User: 新しい食券をどうぞ！

    User->>Kitchen: 新しい食券で注文
    Kitchen->>User: はい、ラーメンです！

    Note over User: ログインし直す必要なし！
```

## 第4章：なぜアクセストークンだけでは足りないのか

ここが本記事の核心です。「食券だけでいいじゃん」と思うかもしれませんが、それでは困る理由があります。

### パターン1：アクセストークンだけ（有効期限が短い場合）

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as アプリ
    participant Auth as 認証サーバー
    participant API as API

    User->>Auth: ログイン
    Auth->>App: アクセストークン（15分有効）

    Note over User: 15分後...

    User->>App: データを見たい
    App->>API: APIリクエスト
    API->>App: トークン期限切れ！
    App->>User: ログインし直してください

    Note over User: えっ、また!? 😫

    User->>Auth: 再ログイン（面倒...）
```

:::danger 問題点
15分ごとにログインし直し？ユーザーは逃げていきます！

**ユーザー体験が最悪**です。
:::

### パターン2：アクセストークンだけ（有効期限が長い場合）

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as アプリ
    participant Auth as 認証サーバー
    participant Attacker as 攻撃者
    participant API as API

    User->>Auth: ログイン
    Auth->>App: アクセストークン（1年有効）

    Note over Attacker: トークンを盗む！

    Attacker->>API: 盗んだトークンで不正アクセス
    API->>Attacker: データを返却

    Note over Attacker: 1年間やりたい放題！🔓

    Note over User: 被害に気づくのは<br>ずっと後...
```

:::danger 問題点
トークンが盗まれたら1年間も悪用され放題！

**セキュリティリスクが致命的**です。
:::

### 2つのトークンで解決！

```mermaid
flowchart TB
    subgraph 問題
    A[短いトークン<br>だけ] --> B[ユーザー体験<br>最悪 😫]
    C[長いトークン<br>だけ] --> D[セキュリティ<br>リスク 🔓]
    end

    subgraph 解決策
    E[短いアクセストークン<br>+ 長いリフレッシュトークン] --> F[両方のいいとこ取り！🎉]
    end

    style B fill:#ffcdd2
    style D fill:#ffcdd2
    style F fill:#c8e6c9
```

## 第5章：2つのトークンの連携プレー

### 実際のフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as アプリ
    participant Auth as 認証サーバー
    participant API as APIサーバー

    Note over User,API: 1. 初回ログイン
    User->>Auth: ログイン（ID/パスワード）
    Auth->>App: アクセストークン（15分）<br>+ リフレッシュトークン（30日）

    Note over User,API: 2. 通常のAPI利用
    User->>App: データを見たい
    App->>API: アクセストークンで要求
    API->>App: データ返却
    App->>User: 画面表示

    Note over User,API: 3. アクセストークン期限切れ（15分後）
    User->>App: また別のデータを見たい
    App->>API: アクセストークンで要求
    API->>App: 401 期限切れ

    Note over User,API: 4. 自動更新（ユーザーは気づかない）
    App->>Auth: リフレッシュトークンで更新
    Auth->>App: 新しいアクセストークン
    App->>API: 新しいトークンで再要求
    API->>App: データ返却
    App->>User: 画面表示

    Note over User: ログインし直し不要！🎉
```

### 連携のポイント

```mermaid
flowchart TB
    subgraph アクセストークン
    A1[有効期限: 15分]
    A2[送信先: APIサーバー]
    A3[頻度: 毎回のリクエスト]
    A4[盗まれても: 15分で無効化]
    end

    subgraph リフレッシュトークン
    B1[有効期限: 30日]
    B2[送信先: 認証サーバーのみ]
    B3[頻度: 15分に1回程度]
    B4[盗まれたら: すぐに無効化できる]
    end

    C[認証サーバー] -->|発行| A1
    C -->|発行| B1

    B1 -->|使って取得| A1

    style A1 fill:#e3f2fd
    style A2 fill:#e3f2fd
    style A3 fill:#e3f2fd
    style A4 fill:#e3f2fd
    style B1 fill:#fff3e0
    style B2 fill:#fff3e0
    style B3 fill:#fff3e0
    style B4 fill:#fff3e0
```

## 第6章：セキュリティの観点から深掘り

### なぜリフレッシュトークンは盗まれにくいのか

```mermaid
flowchart TB
    subgraph アクセストークンの露出リスク
    A1[毎回のAPIリクエストに含まれる]
    A2[多くのサーバーに送信される]
    A3[ログに残りやすい]
    A4[ネットワーク上を頻繁に流れる]
    end

    subgraph リフレッシュトークンの保護
    B1[認証サーバーにのみ送信]
    B2[送信頻度が少ない]
    B3[HTTPOnly Cookieで保管可能]
    B4[ネットワーク露出が限定的]
    end

    A1 --> C[盗まれやすい 😰]
    B1 --> D[盗まれにくい 🔒]

    style C fill:#ffcdd2
    style D fill:#c8e6c9
```

### トークンが盗まれたときの比較

| シナリオ | アクセストークンが盗まれた | リフレッシュトークンが盗まれた |
|----------|--------------------------|------------------------------|
| 被害期間 | 最大15分 | 発覚までの期間 |
| 対処法 | 放置でも期限切れ | 即座に無効化が必要 |
| 検知 | 難しい | 異常なIP/デバイスで検知可能 |
| 被害範囲 | 限定的 | 新しいアクセストークンを発行され続ける |

### リフレッシュトークンの安全対策

```mermaid
flowchart TB
    subgraph 安全対策
    A[1. ローテーション] --> A1[使用するたびに<br>新しいトークンに更新]
    B[2. デバイスバインド] --> B1[特定デバイスでのみ有効]
    C[3. 異常検知] --> C1[違うIPからの使用を検知]
    D[4. 即時無効化] --> D1[ログアウト時に削除]
    end

    style A fill:#e8f5e9
    style B fill:#e8f5e9
    style C fill:#e8f5e9
    style D fill:#e8f5e9
```

#### リフレッシュトークンのローテーション

```mermaid
sequenceDiagram
    participant App as アプリ
    participant Auth as 認証サーバー

    App->>Auth: リフレッシュトークンA で更新要求
    Auth->>Auth: トークンA を無効化
    Auth->>App: 新アクセストークン<br>+ 新リフレッシュトークンB

    Note over App,Auth: 次回の更新

    App->>Auth: リフレッシュトークンB で更新要求
    Auth->>Auth: トークンB を無効化
    Auth->>App: 新アクセストークン<br>+ 新リフレッシュトークンC

    Note over Auth: もし古いトークンAが使われたら<br>= 盗まれた可能性！<br>全トークンを無効化
```

## 第7章：実装パターン

### Webアプリケーション

```mermaid
flowchart TB
    subgraph ブラウザ
    A[アクセストークン<br>メモリに保持]
    B[リフレッシュトークン<br>HttpOnly Cookie]
    end

    subgraph サーバー
    C[APIサーバー]
    D[認証サーバー]
    end

    A -->|Authorization Header| C
    B -->|Cookie 自動送信| D

    style A fill:#e3f2fd
    style B fill:#fff3e0
```

:::info ベストプラクティス
- **アクセストークン**: JavaScriptのメモリに保持（localStorageは危険）
- **リフレッシュトークン**: HttpOnly Cookie（JavaScriptからアクセス不可）
:::

### モバイルアプリ

```mermaid
flowchart TB
    subgraph モバイルアプリ
    A[アクセストークン<br>メモリに保持]
    B[リフレッシュトークン<br>Secure Storage]
    end

    subgraph サーバー
    C[APIサーバー]
    D[認証サーバー]
    end

    A -->|Authorization Header| C
    B -->|更新リクエスト時のみ| D

    style A fill:#e3f2fd
    style B fill:#fff3e0
```

:::info ベストプラクティス
- **iOS**: Keychain
- **Android**: Encrypted SharedPreferences または Keystore
:::

## 第8章：よくある質問（FAQ）

### Q1: リフレッシュトークンも盗まれたらどうするの？

```mermaid
flowchart TB
    A[リフレッシュトークン<br>盗難発覚] --> B[サーバー側で<br>トークンを無効化]
    B --> C[攻撃者は<br>もう使えない]
    B --> D[正規ユーザーは<br>再ログイン]

    style A fill:#ffcdd2
    style C fill:#c8e6c9
    style D fill:#fff9c4
```

アクセストークンは「サーバーに問い合わせずに検証できる」設計のため、発行後に無効化が難しいです。一方、リフレッシュトークンはサーバーで管理されているため、即座に無効化できます。

### Q2: なぜアクセストークンをサーバーで管理しないの？

```mermaid
flowchart LR
    subgraph 毎回DB確認
    A[リクエスト] --> B[DB問い合わせ]
    B --> C[遅い 🐢]
    end

    subgraph JWT検証のみ
    D[リクエスト] --> E[署名検証]
    E --> F[速い 🚀]
    end

    style C fill:#ffcdd2
    style F fill:#c8e6c9
```

毎回のAPIリクエストでデータベースに問い合わせると、パフォーマンスが大幅に低下します。JWTなら署名を検証するだけで済むため、高速です。

### Q3: 有効期限はどのくらいが適切？

| トークン | 推奨有効期限 | 理由 |
|----------|-------------|------|
| アクセストークン | 15分〜1時間 | 盗まれても被害を最小限に |
| リフレッシュトークン | 7日〜30日 | ユーザー体験を損なわない |

:::tip 業界の例
- **Auth0**: アクセストークン 24時間、リフレッシュトークン 30日
- **Google**: アクセストークン 1時間、リフレッシュトークン 無期限（取り消しまで）
- **GitHub**: アクセストークン 8時間、リフレッシュトークン 6ヶ月
:::

### Q4: アクセストークンを更新するたびにリフレッシュトークンも変える？

```mermaid
flowchart TB
    subgraph ローテーションあり（推奨）
    A1[より安全]
    A2[盗難検知が可能]
    A3[実装がやや複雑]
    end

    subgraph ローテーションなし
    B1[リスクが高い]
    B2[実装は簡単]
    end

    style A1 fill:#c8e6c9
    style A2 fill:#c8e6c9
    style B1 fill:#ffcdd2
```

**ローテーションを推奨**します。OAuth 2.0のセキュリティベストプラクティスでも推奨されています。

## まとめ：2つのトークンの役割

```mermaid
flowchart TB
    subgraph セキュリティとUXのバランス
    A[アクセストークン<br>短命・頻繁に使用] --> C[セキュリティ確保<br>盗まれても15分で無効]
    B[リフレッシュトークン<br>長命・たまに使用] --> D[ユーザー体験確保<br>再ログイン不要]
    C --> E[両立！🎉]
    D --> E
    end

    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#c8e6c9
    style D fill:#c8e6c9
    style E fill:#e8f5e9
```

### 最終比較表

| 項目 | アクセストークン | リフレッシュトークン |
|------|-----------------|---------------------|
| **たとえ** | 食券 | メンバーズカード |
| **有効期限** | 短い（15分〜1時間） | 長い（7日〜30日） |
| **送信先** | APIサーバー（毎回） | 認証サーバーのみ |
| **使用頻度** | 高い | 低い |
| **盗難リスク** | 高いが被害は限定的 | 低いが被害は大きい |
| **無効化** | 難しい（期限切れ待ち） | 即座に可能 |
| **保管場所** | メモリ | 安全なストレージ |

### 覚えておくべき3つのポイント

:::info 重要ポイント
1. **アクセストークンは「使い捨て」** - 短命で頻繁に更新される
2. **リフレッシュトークンは「更新用」** - 長命だが厳重に管理
3. **2つ組み合わせて「いいとこ取り」** - セキュリティとUXを両立
:::

## 関連記事

この記事で基礎を理解したら、以下の記事もおすすめです：

- [認証・認可からOIDC・トークンまで完全ガイド](/blog/authentication-authorization-guide) - 認証・認可の基礎から学びたい方へ

セキュリティは奥が深いですが、「なぜ2つ必要なのか」を理解すれば、実装時の判断に迷わなくなります。この記事があなたの理解の助けになれば幸いです！
