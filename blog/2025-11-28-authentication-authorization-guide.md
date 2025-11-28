---
slug: authentication-authorization-guide
title: 【2時間で理解】認証・認可からOIDC・トークンまで完全ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [セキュリティ, 認証, 認可, OIDC, OAuth]
---

セキュリティの世界は専門用語だらけで、最初は「暗号化」「署名」「トークン」と聞いただけで頭が痛くなりますよね。この記事では、**たとえ話をふんだんに使って**、認証・認可の基本から現代のOIDC・トークン認証まで、2時間で理解できるように解説します。

<!--truncate-->

## この記事で学べること

```mermaid
mindmap
  root((認証・認可の世界))
    認証と認可
      認証 = 本人確認
      認可 = 権限付与
    セキュリティの脅威
      中間者攻撃
    対策技術
      公開鍵暗号
      デジタル署名
    現代の認証
      OIDC
      アクセストークン
      IDトークン
      リフレッシュトークン
```

## 第1章：認証と認可 - ホテルの例で理解する

### 認証（Authentication）とは

**認証**とは、「あなたは本当にあなたですか？」を確認することです。

:::tip ホテルでたとえると
ホテルのフロントでチェックインするとき、**身分証明書を見せる**のが認証です。

「田中太郎さんですね。予約を確認しました」

これで、あなたが「田中太郎」本人であることが証明されました。
:::

```mermaid
sequenceDiagram
    participant Guest as 宿泊客
    participant Front as フロント
    participant System as 予約システム

    Guest->>Front: チェックインしたいです
    Front->>Guest: 身分証明書を見せてください
    Guest->>Front: 運転免許証を提示
    Front->>System: 田中太郎の予約を確認
    System->>Front: 予約あり！
    Front->>Guest: 本人確認完了！<br>（認証成功）
```

### 認可（Authorization）とは

**認可**とは、「あなたは何ができますか？」を決めることです。

:::tip ホテルでたとえると
チェックイン後に**ルームキー**をもらいます。このキーで開けられる部屋が「あなたに許可された権限」です。

- 302号室のドアは開けられる（許可あり）
- 301号室のドアは開けられない（許可なし）
- プレミアムラウンジには入れない（許可なし）
:::

```mermaid
sequenceDiagram
    participant Guest as 宿泊客
    participant Front as フロント
    participant Key as ルームキー

    Front->>Guest: 302号室のキーです
    Note over Key: 許可された権限<br>・302号室✓<br>・301号室✗<br>・ラウンジ✗
    Guest->>Key: 302号室を開けたい
    Key->>Guest: どうぞ（認可成功）
    Guest->>Key: 301号室を開けたい
    Key->>Guest: 拒否！（認可失敗）
```

### 認証と認可の違いまとめ

| 項目 | 認証（Authentication） | 認可（Authorization） |
|------|------------------------|----------------------|
| 質問 | 「あなたは誰？」 | 「あなたは何ができる？」 |
| ホテルの例 | 身分証明書を見せる | ルームキーをもらう |
| Webの例 | ログイン画面でパスワード入力 | 管理者ページへのアクセス権 |
| 先にやる？ | **先** | 後 |

```mermaid
flowchart LR
    A[認証] -->|成功| B[認可]
    A -->|失敗| C[アクセス拒否]
    B -->|権限あり| D[許可された操作]
    B -->|権限なし| E[操作拒否]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style D fill:#e8f5e9
    style C fill:#ffebee
    style E fill:#ffebee
```

## 第2章：中間者攻撃 - 悪意ある郵便配達人

### 中間者攻撃（Man-in-the-Middle Attack）とは

インターネット上でやり取りされるデータは、途中で誰かに**盗み見られたり、改ざんされる**危険があります。これが「中間者攻撃」です。

:::danger 悪意ある郵便配達人のたとえ
あなたが友人に手紙を送るとします。

普通なら：
あなた → 郵便配達人 → 友人

でも、配達人が悪い人だったら...

1. **盗み見**：封筒を開けて手紙を読む
2. **改ざん**：手紙の内容を書き換える
3. **なりすまし**：偽の返事を書いて届ける

これが中間者攻撃です！
:::

```mermaid
sequenceDiagram
    participant Alice as あなた
    participant Attacker as 悪意ある配達人
    participant Bob as 友人

    Alice->>Attacker: 手紙「明日10時に駅前で」
    Note over Attacker: 手紙を開封して読む
    Attacker->>Attacker: 内容を改ざん
    Attacker->>Bob: 手紙「明日10時に公園で」

    Bob->>Attacker: 返事「了解！公園で待ってる」
    Note over Attacker: 返事も盗み見
    Attacker->>Alice: 返事「了解！駅前で待ってる」

    Note over Alice,Bob: 二人は別々の場所で待つことに...
```

### Webでの中間者攻撃

実際のWebサービスでは、以下のような攻撃が起こります：

```mermaid
flowchart TB
    subgraph 正常な通信
    A1[あなた] -->|パスワード送信| B1[銀行サイト]
    end

    subgraph 中間者攻撃
    A2[あなた] -->|パスワード送信| C2[攻撃者]
    C2 -->|パスワードを盗む| C2
    C2 -->|そのままパスワードを転送| B2[銀行サイト]
    end

    style C2 fill:#ff6b6b,color:#fff
```

**具体的な被害例：**

- 公共Wi-Fiでの通信傍受
- 偽のWebサイトへの誘導（フィッシング）
- ログイン情報の窃取

## 第3章：公開鍵暗号と署名 - 南京錠と封蝋

中間者攻撃を防ぐために生まれたのが「**公開鍵暗号**」と「**デジタル署名**」です。

### 公開鍵暗号 - 南京錠のたとえ

:::tip 南京錠システム
友人に秘密の手紙を安全に送りたいとします。

**友人がやること：**
1. **開いた南京錠**を、たくさんの人に配る（これが「公開鍵」）
2. **鍵**は自分だけが持っておく（これが「秘密鍵」）

**あなたがやること：**
1. 友人からもらった**南京錠で箱を閉じる**
2. 鍵がなくても、南京錠をカチッと閉めることはできる！
3. 閉じた箱を友人に送る

**結果：**
- 配達人は箱を開けられない（鍵がないから）
- 友人だけが鍵で箱を開けられる
:::

```mermaid
sequenceDiagram
    participant Alice as あなた
    participant Attacker as 配達人
    participant Bob as 友人

    Note over Bob: 南京錠と鍵を準備
    Bob->>Alice: 開いた南京錠を渡す（公開鍵）
    Note over Bob: 鍵は自分だけ持っておく（秘密鍵）

    Alice->>Alice: 手紙を箱に入れて<br>南京錠を閉める
    Alice->>Attacker: 閉じた箱を送る

    Note over Attacker: 箱を開けようとするが<br>鍵がないので開けられない！

    Attacker->>Bob: 仕方なくそのまま配達
    Bob->>Bob: 自分だけが持つ鍵で<br>箱を開ける
    Note over Bob: 手紙を安全に受け取れた！
```

### 公開鍵と秘密鍵のポイント

```mermaid
flowchart LR
    subgraph 公開鍵
    A[誰でも持てる]
    B[データを暗号化できる]
    C[南京錠を閉める役割]
    end

    subgraph 秘密鍵
    D[本人だけが持つ]
    E[データを復号できる]
    F[南京錠を開ける役割]
    end

    B --> E

    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style D fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#fff3e0
```

### デジタル署名 - 封蝋と印璽のたとえ

暗号化だけでは「**誰が送ったのか**」がわかりません。そこで使うのが「デジタル署名」です。

:::tip 封蝋（シーリングワックス）のたとえ
昔の王様は手紙を送るとき、封蝋に**印璽（いんじ）**を押しました。

- **印璽**：王様だけが持っている特別なハンコ（＝秘密鍵）
- **封蝋の印影**：誰でも見られる（＝公開鍵で検証可能）

受け取った人は封蝋の模様を見て「これは確かに王様からの手紙だ」と確認できます。
:::

```mermaid
sequenceDiagram
    participant King as 王様（送信者）
    participant Messenger as 使者
    participant Minister as 大臣（受信者）

    King->>King: 手紙を書く
    King->>King: 秘密鍵（印璽）で署名
    Note over King: 封蝋にハンコを押す

    King->>Messenger: 封印された手紙
    Messenger->>Minister: 手紙を届ける

    Minister->>Minister: 公開鍵（印影の見本）と比較
    Note over Minister: 封蝋の模様が<br>王様のものと一致！
    Minister->>Minister: 本物の手紙だと確認！
```

### 署名の仕組みまとめ

| 操作 | 使う鍵 | 目的 |
|------|--------|------|
| 署名する | 秘密鍵 | 「自分が書いた」証明 |
| 署名を検証する | 公開鍵 | 「本人が書いた」確認 |

```mermaid
flowchart TB
    subgraph 署名作成
    A[メッセージ] --> B[ハッシュ化]
    B --> C[秘密鍵で暗号化]
    C --> D[署名]
    end

    subgraph 署名検証
    E[署名] --> F[公開鍵で復号]
    F --> G[ハッシュ値]
    H[メッセージ] --> I[ハッシュ化]
    I --> J[ハッシュ値]
    G --> K{一致？}
    J --> K
    K -->|Yes| L[本物！]
    K -->|No| M[偽物！]
    end

    style L fill:#c8e6c9
    style M fill:#ffcdd2
```

## 第4章：OIDC - 現代の身分証明システム

公開鍵暗号と署名を理解したところで、いよいよ現代の認証システム「**OIDC（OpenID Connect）**」を見ていきましょう。

### OIDCとは

OIDC は「信頼できる第三者（Googleなど）に本人確認をお願いする」仕組みです。

:::tip デジタル身分証明センターのたとえ
新しい会社に入社する場面を想像してください。

**昔のやり方（各社で本人確認）：**
- A社「身分証見せて」→ あなた「運転免許証」
- B社「身分証見せて」→ あなた「運転免許証」
- C社「身分証見せて」→ あなた「運転免許証」

**OIDCのやり方（信頼できる機関に委託）：**
- 政府の身分証明センター「私があなたの身元を保証します」
- A社「政府のお墨付きがあるならOK」
- B社「政府のお墨付きがあるならOK」
- C社「政府のお墨付きがあるならOK」
:::

```mermaid
sequenceDiagram
    participant User as あなた
    participant App as Webサービス
    participant IDP as 認証プロバイダ<br>（Google等）

    User->>App: ログインしたい
    App->>User: Googleでログインしますか？
    User->>IDP: Googleにログイン
    IDP->>User: メール・パスワードを入力
    User->>IDP: 入力完了
    IDP->>IDP: 本人確認OK
    IDP->>App: この人は確かに〇〇さんです<br>（IDトークン発行）
    App->>User: ログイン成功！
```

### OIDCの登場人物

```mermaid
flowchart TB
    subgraph 登場人物
    A[エンドユーザー<br>あなた]
    B[クライアント<br>Webサービス/アプリ]
    C[認証プロバイダ IdP<br>Google, Microsoft等]
    end

    A -->|1. ログイン要求| B
    B -->|2. 認証を委託| C
    A -->|3. 認証情報入力| C
    C -->|4. トークン発行| B
    B -->|5. ログイン完了| A

    style C fill:#4285f4,color:#fff
```

| 役割 | 説明 | 例 |
|------|------|-----|
| エンドユーザー | サービスを使いたい人 | あなた |
| クライアント | ユーザーが使いたいサービス | Webアプリ |
| 認証プロバイダ（IdP） | 本人確認を行う信頼できる機関 | Google, Microsoft |

## 第5章：3つのトークン - デジタル通行証

OIDCでは、認証成功後に「**トークン**」という通行証が発行されます。3種類のトークンがあり、それぞれ役割が違います。

### トークンの全体像

```mermaid
flowchart TB
    subgraph トークンの種類
    A[IDトークン<br>身分証明書]
    B[アクセストークン<br>入館証]
    C[リフレッシュトークン<br>再発行チケット]
    end

    D[認証プロバイダ] -->|発行| A
    D -->|発行| B
    D -->|発行| C

    style A fill:#e8f5e9
    style B fill:#e3f2fd
    style C fill:#fff3e0
```

### IDトークン - 「あなたは誰？」の証明

:::tip 社員証のたとえ
**IDトークン**は「あなたが誰であるか」を証明するデジタル社員証です。

社員証には以下が書かれています：
- 名前：田中太郎
- 社員番号：12345
- 所属：開発部
- 発行日：2024年1月1日
- 有効期限：2024年12月31日
:::

```mermaid
flowchart LR
    subgraph IDトークンの中身
    A[sub: ユーザーID]
    B[name: 田中太郎]
    C[email: tanaka@example.com]
    D[iat: 発行日時]
    E[exp: 有効期限]
    end

    style A fill:#e8f5e9
    style B fill:#e8f5e9
    style C fill:#e8f5e9
    style D fill:#e8f5e9
    style E fill:#e8f5e9
```

**IDトークンの特徴：**
- 短い有効期限（通常1時間程度）
- JWTという形式で、署名付き
- クライアント側でユーザー情報を確認するために使用

### アクセストークン - 「何ができる？」の証明

:::tip 入館証のたとえ
**アクセストークン**は「どのエリアに入れるか」を示す入館証です。

入館証には以下が書かれています：
- アクセス可能：1階オフィス、会議室A
- アクセス不可：サーバールーム、役員室
- 有効期限：本日17時まで
:::

```mermaid
flowchart LR
    subgraph アクセストークンの中身
    A[scope: profile email]
    B[client_id: アプリID]
    C[exp: 有効期限]
    end

    D[トークン] -->|APIリクエスト| E[リソースサーバー]
    E -->|スコープ確認| F{権限あり？}
    F -->|Yes| G[データ返却]
    F -->|No| H[拒否]

    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e3f2fd
```

**アクセストークンの特徴：**
- 短い有効期限（通常1時間程度）
- APIにアクセスするときに使用
- scopeで「何にアクセスできるか」を制限

### リフレッシュトークン - 再発行のためのチケット

:::tip 再発行チケットのたとえ
入館証（アクセストークン）の有効期限が切れたとき、毎回受付に行って身分証を見せるのは面倒ですよね。

**リフレッシュトークン**は「新しい入館証をすぐに再発行してもらえるチケット」です。

- このチケットを見せれば、身分証明なしで新しい入館証がもらえる
- ただし、このチケット自体にも有効期限がある（1週間〜数ヶ月）
- 盗まれると危険なので、厳重に管理！
:::

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as アプリ
    participant Auth as 認証サーバー
    participant API as APIサーバー

    Note over App: アクセストークン期限切れ
    App->>API: APIリクエスト
    API->>App: 401 Unauthorized<br>（トークン期限切れ）

    App->>Auth: リフレッシュトークンで<br>新しいトークンを要求
    Auth->>Auth: リフレッシュトークン検証
    Auth->>App: 新しいアクセストークン発行

    App->>API: 新しいトークンでリクエスト
    API->>App: データ返却

    Note over User: ユーザーは再ログイン不要！
```

### 3つのトークン比較表

| 項目 | IDトークン | アクセストークン | リフレッシュトークン |
|------|-----------|-----------------|---------------------|
| 役割 | 本人確認 | APIアクセス権 | トークン再発行 |
| たとえ | 社員証 | 入館証 | 再発行チケット |
| 有効期限 | 短い（〜1時間） | 短い（〜1時間） | 長い（1週間〜数ヶ月） |
| 保管場所 | クライアント | クライアント | 安全な場所 |
| 送信先 | クライアントアプリ | リソースサーバー | 認証サーバー |

## 第6章：全体の流れ - ログインからAPI利用まで

すべてを組み合わせた、実際のログインフローを見てみましょう。

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as Webアプリ
    participant Auth as 認証サーバー<br>（Google等）
    participant API as APIサーバー

    Note over User,API: 1. ログイン開始
    User->>App: ログインボタンをクリック
    App->>Auth: 認証リクエスト<br>（認可コードフロー）

    Note over User,API: 2. 認証（Authentication）
    Auth->>User: ログイン画面を表示
    User->>Auth: メール・パスワードを入力
    Auth->>Auth: 本人確認

    Note over User,API: 3. トークン発行
    Auth->>App: 認可コードを返却
    App->>Auth: 認可コードでトークンを要求
    Auth->>App: IDトークン + アクセストークン<br>+ リフレッシュトークン

    Note over User,API: 4. ユーザー情報取得
    App->>App: IDトークンからユーザー情報取得
    App->>User: ようこそ、田中太郎さん！

    Note over User,API: 5. API利用（Authorization）
    User->>App: プロフィールを見たい
    App->>API: アクセストークン付きでリクエスト
    API->>API: トークン検証 + 権限確認
    API->>App: プロフィールデータ
    App->>User: プロフィール画面を表示

    Note over User,API: 6. トークン更新
    Note over App: 1時間後、アクセストークン期限切れ
    App->>Auth: リフレッシュトークンで更新
    Auth->>App: 新しいアクセストークン
    Note over User: ユーザーは何もしなくてOK！
```

## 第7章：JWTの中身を覗いてみよう

IDトークンやアクセストークンは、**JWT（JSON Web Token）**という形式で作られています。

### JWTの構造

JWTは3つのパートで構成されています：

```mermaid
flowchart LR
    subgraph JWT
    A[ヘッダー<br>Header] --- B[ペイロード<br>Payload] --- C[署名<br>Signature]
    end

    D[アルゴリズム情報] --> A
    E[ユーザー情報・クレーム] --> B
    F[改ざん検知用] --> C

    style A fill:#ffcdd2
    style B fill:#c8e6c9
    style C fill:#bbdefb
```

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IueUsOS4rOWkqumDjiIsImVtYWlsIjoidGFuYWthQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

この文字列は「.」で3つに区切られています：

| パート | 内容（Base64デコード後） |
|--------|-------------------------|
| ヘッダー | `{"alg":"RS256","typ":"JWT"}` |
| ペイロード | `{"sub":"1234567890","name":"田中太郎",...}` |
| 署名 | ヘッダー+ペイロードを秘密鍵で署名したもの |

### 署名による改ざん検知

```mermaid
flowchart TB
    subgraph 署名検証
    A[受け取ったJWT] --> B[ヘッダー+ペイロード]
    A --> C[署名]

    D[認証サーバーの公開鍵] --> E[署名を検証]
    B --> E
    C --> E

    E --> F{一致？}
    F -->|Yes| G[改ざんなし！信頼できる]
    F -->|No| H[改ざんされている！拒否]
    end

    style G fill:#c8e6c9
    style H fill:#ffcdd2
```

:::info なぜ署名が重要？
ペイロード（ユーザー情報）はBase64でエンコードされているだけで、**暗号化されていません**。誰でも読めます。

しかし、署名があるおかげで：
- 内容が改ざんされていないことを確認できる
- 信頼できる認証サーバーが発行したことを確認できる

攻撃者が「自分は管理者だ」と書き換えても、署名が合わなくなるので検出できます！
:::

## まとめ：全体像の復習

```mermaid
flowchart TB
    subgraph 基礎概念
    A[認証<br>あなたは誰？] --> B[認可<br>何ができる？]
    end

    subgraph 脅威と対策
    C[中間者攻撃] --> D[公開鍵暗号]
    C --> E[デジタル署名]
    end

    subgraph 現代の認証
    F[OIDC] --> G[IDトークン]
    F --> H[アクセストークン]
    F --> I[リフレッシュトークン]
    end

    A -.-> F
    D -.-> G
    E -.-> G
    B -.-> H

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#ffebee
    style D fill:#e8f5e9
    style E fill:#e8f5e9
    style F fill:#f3e5f5
    style G fill:#e8f5e9
    style H fill:#e3f2fd
    style I fill:#fff3e0
```

### 学んだことの整理

| トピック | 一言まとめ |
|----------|-----------|
| 認証 | 「あなたは誰？」の確認 |
| 認可 | 「何ができる？」の決定 |
| 中間者攻撃 | 通信途中で盗み見・改ざん |
| 公開鍵暗号 | 南京錠を配って、鍵は自分だけ持つ |
| デジタル署名 | ハンコを押して「自分が書いた」証明 |
| OIDC | 信頼できる第三者に本人確認を委託 |
| IDトークン | 「私は〇〇です」の証明書 |
| アクセストークン | 「〇〇にアクセスできる」入館証 |
| リフレッシュトークン | 入館証を再発行するためのチケット |

## 次のステップ

この記事で基礎を理解したら、次は以下のトピックに挑戦してみましょう：

1. **OAuth 2.0の各種フロー**（認可コードフロー、PKCEなど）
2. **実際のOIDC実装**（Auth0, Keycloak, AWS Cognitoなど）
3. **セキュリティベストプラクティス**（トークンの安全な保管方法）

セキュリティは奥が深いですが、基礎さえ押さえれば怖くありません。この記事があなたの学習の第一歩になれば幸いです！
