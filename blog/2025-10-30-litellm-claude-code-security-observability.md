---
slug: litellm-claude-code-security-observability
title: LiteLLM で Claude Code のセキュリティとオブザーバビリティを強化する完全ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

AI エージェントツールの Claude Code を本格的に業務で活用する際、**API の安全な管理**と**利用状況の可視化**は避けて通れない課題です。個人利用ならシンプルでも、チーム全体で使う場合は、予算管理、アクセス制御、監査ログなどのエンタープライズ機能が必要になります。この記事では、**LiteLLM** を Claude Code と組み合わせて、セキュリティとオブザーバビリティを実現する方法を解説します。

<!--truncate-->

## Claude Code とは

**Claude Code** は、Anthropic 社が提供する公式の AI コーディングアシスタント CLI ツールです。ターミナルから直接 Claude AI と対話しながら、コードの生成、リファクタリング、デバッグ、レビューなどを実行できます。

### Claude Code の特徴

- **コードベース全体を理解**: プロジェクト全体のコンテキストを把握し、適切な提案を行う
- **ファイル操作の自動化**: ファイルの読み書き、編集を AI が自律的に実行
- **ツール統合**: Bash コマンド、Git 操作、Web 検索などを組み合わせてタスクを完遂
- **マルチステップタスク**: 複雑な開発タスクを複数のステップに分解して実行

### チーム利用での課題

しかし、Claude Code をチームで使う際には以下の課題があります：

- **API キーの管理**: メンバー全員が個別に API キーを持つと、管理が煩雑でセキュリティリスクが高まる
- **コスト管理**: メンバーごと、プロジェクトごとの利用状況が見えず、予算超過のリスクがある
- **監査要件**: コンプライアンスのため、誰がいつ何のリクエストを送ったか記録が必要
- **レート制限**: 誤った使い方や無限ループで大量のリクエストが発生するリスク
- **可視化の欠如**: リアルタイムでの利用状況、エラー率、レイテンシなどが見えない

これらの課題を解決するのが **LiteLLM** です。

---

## LiteLLM で何が解決するのか

**LiteLLM** は、100 以上の LLM API を統一されたインターフェースで呼び出せる、オープンソースのプロキシサーバー（LLM ゲートウェイ）です。

公式サイト: https://www.litellm.ai/

### LiteLLM を Claude Code と組み合わせるメリット

1. **統一された認証管理**
   - チームメンバーには LiteLLM の仮想キーを配布し、実際の Anthropic API キーは LiteLLM サーバーが管理
   - キーの無効化や権限変更が即座に反映される

2. **リアルタイムのコスト追跡**
   - メンバーごと、プロジェクトごとの支出をダッシュボードで可視化
   - 予算上限を設定し、超過時に自動的にアクセスを制限

3. **細かいアクセス制御**
   - 使用できるモデルを制限（例: Claude Sonnet のみ許可）
   - レート制限（1 分あたりのリクエスト数、トークン数）を設定
   - 特定のメタデータ（チーム名、プロジェクト名）をタグ付けして追跡

4. **包括的なオブザーバビリティ**
   - すべてのリクエストとレスポンスをログに記録
   - Arize、Helicone、Langfuse などの監視ツールと統合
   - エラー率、レイテンシ、トークン消費量をリアルタイムで監視

5. **高可用性とフォールバック**
   - プロバイダー障害時に自動的に別のプロバイダーにフォールバック
   - ロードバランシングで複数のエンドポイントに負荷を分散

---

## Claude Code と LiteLLM の統合手順

ここでは、LiteLLM プロキシサーバーをセットアップし、Claude Code から利用する具体的な手順を解説します。

### 前提条件

- Python 3.8 以上がインストールされていること
- Anthropic API キーを取得していること（https://console.anthropic.com/）
- Claude Code がインストールされていること（`npm install -g @anthropic-ai/claude-code` または公式インストーラー）

### ステップ 1: LiteLLM のインストール

```bash
pip install 'litellm[proxy]'
```

プロキシサーバー機能を含む LiteLLM をインストールします。

### ステップ 2: データベースのセットアップ

LiteLLM は利用状況の追跡やユーザー管理のためにデータベースを使用します。

**PostgreSQL を使用する場合**（本番環境推奨）:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/litellm"
```

**SQLite を使用する場合**（開発環境向け）:

```bash
export DATABASE_URL="sqlite:///litellm.db"
```

### ステップ 3: 設定ファイルの作成

`config.yaml` を作成し、Claude モデルと認証設定を定義します：

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-opus
    litellm_params:
      model: anthropic/claude-opus-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-haiku
    litellm_params:
      model: anthropic/claude-3-5-haiku-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  success_callback: ["langfuse"]  # オプション: ログ記録
  drop_params: True

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL

  # セキュリティ設定
  enforce_budget: true  # 予算超過時にリクエストをブロック

  # アラート設定
  alerting:
    - slack_webhook_url: os.environ/SLACK_WEBHOOK_URL
      budget_threshold: 80  # 予算の 80% でアラート
```

### ステップ 4: 環境変数の設定

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export LITELLM_MASTER_KEY="sk-master-1234"  # 管理用マスターキー
export DATABASE_URL="postgresql://user:password@localhost:5432/litellm"
```

### ステップ 5: プロキシサーバーの起動

```bash
litellm --config config.yaml --port 4000
```

デフォルトでは `http://0.0.0.0:4000` でプロキシサーバーが起動します。

### ステップ 6: 仮想キーの作成

チームメンバーやプロジェクトごとに仮想キーを発行します：

```bash
# 開発チーム用のキー（月 100 ドルまで）
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-master-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "key_alias": "dev-team",
    "duration": "30d",
    "max_budget": 100.0,
    "models": ["claude-sonnet", "claude-haiku"],
    "metadata": {"team": "development", "department": "engineering"},
    "rpm_limit": 100,
    "tpm_limit": 100000
  }'
```

レスポンスで返される仮想キー（例: `sk-litellm-abc123...`）をメンバーに配布します。

### ステップ 7: Claude Code の設定

Claude Code が LiteLLM プロキシを使うように環境変数を設定します：

```bash
export ANTHROPIC_BASE_URL="http://localhost:4000"
export ANTHROPIC_API_KEY="sk-litellm-abc123..."  # LiteLLM から発行された仮想キー
```

または、Claude Code の設定ファイル `~/.claude/settings.json` を編集します：

```json
{
  "anthropicBaseURL": "http://localhost:4000",
  "anthropicAPIKey": "sk-litellm-abc123..."
}
```

### ステップ 8: 動作確認

Claude Code を起動し、`/status` コマンドで設定を確認します：

```bash
claude
```

Claude Code のプロンプトで：

```
/status
```

出力に以下のような情報が表示されれば成功です：

```
Authentication: API Key (via environment)
Base URL: http://localhost:4000
Proxy: Enabled (LiteLLM)
```

---

## セキュリティのベストプラクティス

### 1. 仮想キーの最小権限設定

各メンバーには必要最小限の権限のみを付与します：

```bash
# インターン用のキー（Haiku モデルのみ、月 10 ドルまで）
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-master-1234' \
  -d '{
    "key_alias": "intern-john",
    "models": ["claude-haiku"],
    "max_budget": 10.0,
    "rpm_limit": 20,
    "metadata": {"role": "intern"}
  }'
```

### 2. マスターキーの厳重管理

`master_key` は絶対に公開リポジトリにコミットしないでください。環境変数または秘密管理サービス（AWS Secrets Manager、HashiCorp Vault など）から読み込みます。

### 3. HTTPS の使用

本番環境では、必ず HTTPS で LiteLLM プロキシにアクセスします。Nginx や ALB でリバースプロキシを設定：

**Nginx の設定例**:

```nginx
server {
    listen 443 ssl;
    server_name litellm.example.com;

    ssl_certificate /etc/ssl/certs/litellm.crt;
    ssl_certificate_key /etc/ssl/private/litellm.key;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Claude Code の設定を HTTPS に更新：

```bash
export ANTHROPIC_BASE_URL="https://litellm.example.com"
```

### 4. ネットワーク分離

LiteLLM プロキシは VPN やプライベートネットワーク内に配置し、外部からの直接アクセスを防ぎます。

### 5. 監査ログの有効化

すべてのリクエストをログに記録し、異常なアクセスパターンを検出します：

```yaml
litellm_settings:
  success_callback: ["s3"]  # S3 にログを保存

general_settings:
  s3_callback_params:
    s3_bucket_name: "my-litellm-audit-logs"
    s3_region_name: "us-east-1"
    s3_path: "claude-code-logs/"
```

### 6. IP アドレス制限

特定の IP アドレスからのみアクセスを許可する設定も可能です：

```yaml
general_settings:
  allowed_ips: ["192.168.1.0/24", "10.0.0.0/8"]
```

---

## オブザーバビリティの実装

### 1. LiteLLM ダッシュボードの活用

LiteLLM は組み込みの Web ダッシュボードを提供しています：

```bash
litellm --config config.yaml --detailed_debug
```

ブラウザで `http://localhost:4000/ui` にアクセスすると、以下の情報が確認できます：

- **リアルタイム支出**: プロジェクトごと、モデルごとの累積コスト
- **リクエスト数**: 成功・失敗したリクエストの統計
- **レイテンシ**: 平均応答時間、P50/P95/P99 パーセンタイル
- **エラー率**: モデル別、エンドポイント別のエラー発生率
- **トークン消費量**: 入力・出力トークンの詳細

### 2. Arize との統合（Dev-Agent-Lens）

**Arize** は、AI アプリケーションの可観測性プラットフォームで、Claude Code のリクエストをトレースし、詳細な分析を提供します。

**Dev-Agent-Lens** を使用して、Claude Code のリクエストを LiteLLM 経由で Arize に送信できます：

GitHub: https://github.com/Teraflop-Inc/dev-agent-lens

**セットアップ**:

```bash
# Dev-Agent-Lens のクローン
git clone https://github.com/Teraflop-Inc/dev-agent-lens.git
cd dev-agent-lens

# 環境変数の設定
export ARIZE_SPACE_ID="your-space-id"
export ARIZE_API_KEY="your-arize-api-key"
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# LiteLLM プロキシの起動（Arize コールバック有効）
litellm --config config.yaml
```

**config.yaml に Arize を追加**:

```yaml
litellm_settings:
  success_callback: ["arize"]

general_settings:
  arize_callback_params:
    space_id: os.environ/ARIZE_SPACE_ID
    api_key: os.environ/ARIZE_API_KEY
```

Arize ダッシュボードで以下を監視できます：

- **ツール呼び出しのトレース**: Claude Code がどのツール（Read, Write, Bash など）を使用したか
- **エラー検出**: 無効な JSON レスポンス、必須フィールドの欠落、レイテンシ SLA 違反
- **パフォーマンス評価**: ツール出力の完全性や関連性をスコアリング

### 3. Helicone との統合

**Helicone** は、オープンソースの LLM 可観測性プラットフォームです。

**設定方法**:

```yaml
litellm_settings:
  success_callback: ["helicone"]

general_settings:
  helicone_callback_params:
    api_key: os.environ/HELICONE_API_KEY
```

Helicone で確認できる情報：

- **利用状況**: リクエスト数、トークン消費量
- **支出**: モデル別、プロジェクト別のコスト
- **レイテンシ**: リクエストごとの応答時間
- **カスタムプロパティ**: メタデータを使ったフィルタリング

### 4. Langfuse との統合

**Langfuse** は、LLM アプリケーションのオブザーバビリティとプロンプトエンジニアリングを支援するツールです。

**設定方法**:

```yaml
litellm_settings:
  success_callback: ["langfuse"]

general_settings:
  langfuse_callback_params:
    public_key: os.environ/LANGFUSE_PUBLIC_KEY
    secret_key: os.environ/LANGFUSE_SECRET_KEY
    host: "https://cloud.langfuse.com"
```

Langfuse の特徴：

- **トレース**: Claude Code のマルチステップタスクを可視化
- **プロンプト管理**: 使用されたプロンプトのバージョン管理
- **コスト分析**: セッションごと、ユーザーごとの詳細なコスト内訳

---

## 実践的なユースケース

### ユースケース 1: チームごとの予算管理

大規模な開発組織で、各チームに月次予算を割り当てる場合：

```bash
# フロントエンドチーム（月 200 ドル）
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-master-1234' \
  -d '{
    "key_alias": "frontend-team",
    "max_budget": 200.0,
    "budget_duration": "30d",
    "models": ["claude-sonnet", "claude-haiku"],
    "metadata": {"team": "frontend", "cost_center": "engineering"}
  }'

# バックエンドチーム（月 300 ドル）
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-master-1234' \
  -d '{
    "key_alias": "backend-team",
    "max_budget": 300.0,
    "budget_duration": "30d",
    "models": ["claude-sonnet", "claude-opus"],
    "metadata": {"team": "backend", "cost_center": "engineering"}
  }'
```

LiteLLM ダッシュボードで、各チームの支出をリアルタイムで確認し、予算の 80% に達したら Slack でアラートを受け取ります。

### ユースケース 2: 外部コントラクターへの一時的なアクセス

短期プロジェクトで外部コントラクターに制限付きアクセスを提供：

```bash
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-master-1234' \
  -d '{
    "key_alias": "contractor-alice",
    "duration": "7d",  # 7 日間で自動失効
    "max_budget": 50.0,
    "models": ["claude-haiku"],  # コスト効率の良いモデルのみ
    "rpm_limit": 30,
    "metadata": {"type": "contractor", "project": "widget-redesign"}
  }'
```

プロジェクト終了後、キーは自動的に無効化されます。

### ユースケース 3: 本番環境と開発環境の分離

本番環境と開発環境で異なるプロキシを使用し、コストと利用状況を分離：

**本番環境の Claude Code 設定**:

```bash
export ANTHROPIC_BASE_URL="https://litellm-prod.example.com"
export ANTHROPIC_API_KEY="sk-litellm-prod-..."
```

**開発環境の Claude Code 設定**:

```bash
export ANTHROPIC_BASE_URL="https://litellm-dev.example.com"
export ANTHROPIC_API_KEY="sk-litellm-dev-..."
```

これにより、本番環境のコストと開発環境のコストを明確に分離できます。

### ユースケース 4: コンプライアンス監査

金融機関やヘルスケア業界では、すべての AI リクエストを監査する必要があります：

```yaml
litellm_settings:
  success_callback: ["s3", "langfuse"]

general_settings:
  s3_callback_params:
    s3_bucket_name: "audit-logs-litellm"
    s3_region_name: "us-east-1"
    s3_path: "claude-code/{year}/{month}/{day}/"

  # すべてのリクエストとレスポンスを記録
  log_requests: true
  log_responses: true
```

S3 に保存されたログは、後から検索・分析でき、コンプライアンス要件を満たします。

---

## 高可用性とフォールバック設定

### フォールバック設定

Anthropic API が一時的に利用できない場合、自動的に別のプロバイダーにフォールバック：

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-sonnet-4-5-v1:0
      aws_region_name: us-east-1

router_settings:
  routing_strategy: usage-based-routing-v2
  fallbacks:
    - model_name: claude-sonnet
      fallback_models: ["bedrock/anthropic.claude-sonnet-4-5-v1:0"]
```

### ロードバランシング

複数のリージョンやエンドポイントにリクエストを分散してレート制限を回避：

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY_1

  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY_2

router_settings:
  routing_strategy: simple-shuffle  # ランダムに分散
```

---

## トラブルシューティング

### Q: Claude Code が LiteLLM プロキシに接続できない

A: 以下を確認してください：

1. **環境変数が正しく設定されているか**:
   ```bash
   echo $ANTHROPIC_BASE_URL
   echo $ANTHROPIC_API_KEY
   ```

2. **LiteLLM プロキシが起動しているか**:
   ```bash
   curl http://localhost:4000/health
   ```

3. **Claude Code の設定を確認**:
   ```bash
   claude
   /status
   ```

4. **ファイアウォールやネットワーク設定**:
   Claude Code が LiteLLM プロキシのポートにアクセスできるか確認

### Q: 仮想キーが無効と表示される

A: 以下を確認してください：

1. **キーの有効期限**:
   ```bash
   curl -X GET 'http://localhost:4000/key/info?key=sk-litellm-abc123...' \
     -H 'Authorization: Bearer sk-master-1234'
   ```

2. **予算超過**:
   ダッシュボードで当該キーの支出を確認

3. **モデル制限**:
   使用しようとしているモデルがキーで許可されているか確認

### Q: レスポンスが遅い

A: LiteLLM プロキシがボトルネックになっている可能性があります：

1. **複数インスタンスの起動**:
   ロードバランサーで複数の LiteLLM インスタンスに分散

2. **データベースの最適化**:
   PostgreSQL のインデックス追加、接続プール設定

3. **キャッシュの有効化**:
   ```yaml
   litellm_settings:
     cache: true
     cache_params:
       type: "redis"
       host: "localhost"
       port: 6379
   ```

### Q: ログが記録されない

A: コールバック設定を確認：

```yaml
litellm_settings:
  success_callback: ["langfuse", "s3"]
  failure_callback: ["langfuse", "s3"]  # 失敗も記録
```

環境変数が正しく設定されているか確認：

```bash
echo $LANGFUSE_PUBLIC_KEY
echo $LANGFUSE_SECRET_KEY
```

---

## まとめ

LiteLLM を Claude Code と組み合わせることで、エンタープライズレベルのセキュリティとオブザーバビリティを実現できます：

### セキュリティ面のメリット

- **統一された認証管理**: 仮想キーで実際の API キーを保護
- **細かいアクセス制御**: モデル、レート制限、予算をキーごとに設定
- **監査ログ**: すべてのリクエストを記録し、コンプライアンス要件に対応
- **ネットワーク分離**: プロキシを VPN 内に配置し、外部アクセスを制限

### オブザーバビリティ面のメリット

- **リアルタイム可視化**: ダッシュボードでコスト、利用状況、エラー率を監視
- **詳細なトレース**: Arize、Helicone、Langfuse で個別リクエストを追跡
- **アラート**: 予算超過、エラー急増時に Slack で通知
- **分析**: メタデータを使ってチーム別、プロジェクト別に利用状況を分析

### 導入ステップ

1. **LiteLLM をインストール**: `pip install 'litellm[proxy]'`
2. **設定ファイルを作成**: Claude モデルと認証設定を定義
3. **プロキシを起動**: `litellm --config config.yaml`
4. **仮想キーを発行**: チームメンバーごとに API キーを生成
5. **Claude Code を設定**: `ANTHROPIC_BASE_URL` で LiteLLM プロキシを指定
6. **オブザーバビリティツールを統合**: Arize、Helicone、Langfuse などを有効化
7. **監視とアラートを設定**: ダッシュボードで利用状況を追跡

### 本番環境へのデプロイ

- **HTTPS を使用**: Nginx や ALB でリバースプロキシを設定
- **高可用性**: 複数の LiteLLM インスタンスをロードバランサーで分散
- **データベース**: PostgreSQL を使用し、定期的にバックアップ
- **秘密管理**: AWS Secrets Manager や Vault でマスターキーを管理
- **モニタリング**: Prometheus、Grafana で LiteLLM の健全性を監視

Claude Code は強力な AI コーディングアシスタントですが、LiteLLM と組み合わせることで、セキュアでスケーラブル、かつ可観測性の高いエンタープライズグレードのシステムを構築できます。チーム全体で安心して AI を活用し、開発生産性を向上させましょう！
