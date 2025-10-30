---
slug: litellm-bedrock-cost-management
title: LiteLLM ゲートウェイで Amazon Bedrock の API 料金を管理する完全ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

生成 AI サービスを本格的に活用する上で、**API 利用料金の管理**は避けて通れない課題です。特に Amazon Bedrock のような従量課金制のサービスでは、予期せぬコストの増加や、チームごとの利用状況の可視化が重要になります。この記事では、**LiteLLM** をゲートウェイとして活用し、Bedrock の API 料金を効率的に管理する方法を解説します。

<!--truncate-->

## なぜ API 料金管理が重要なのか

生成 AI を本番環境で運用する際、以下のような課題に直面します：

- **予算オーバーのリスク**: 想定以上のトラフィックや、非効率なプロンプト設計により、予算を超過してしまう
- **チーム間の利用状況が不透明**: 複数のプロジェクトやチームが同じ API を使用していると、どこでコストが発生しているか把握しづらい
- **レート制限の管理**: API の呼び出し回数を制限しないと、意図しないループや攻撃により大量のリクエストが発生する可能性がある
- **マルチプロバイダー対応の煩雑さ**: OpenAI、Anthropic、AWS Bedrock など、複数の LLM プロバイダーを使う場合、それぞれ異なる API 形式と料金体系に対応する必要がある

これらの問題を放置すると、コスト管理が困難になり、ビジネスの成長を阻害してしまいます。

---

## LiteLLM とは何か

**LiteLLM** は、100 以上の LLM API を統一されたインターフェースで呼び出せる、オープンソースの Python SDK およびプロキシサーバー（LLM ゲートウェイ）です。

公式サイト: https://www.litellm.ai/

### LiteLLM の特徴

1. **統一されたインターフェース**
   - OpenAI、Anthropic、AWS Bedrock、Google Vertex AI など、100 以上の LLM API を同じ形式で呼び出せる
   - OpenAI の API 形式に統一されているため、既存のコードを変更せずに別のプロバイダーに切り替え可能

2. **コスト管理機能**
   - プロジェクト、API キー、モデルごとの予算設定とレート制限
   - リアルタイムの支出追跡と分析
   - チームやプロジェクトごとの月次予算管理

3. **エンタープライズ機能**
   - ロードバランシング: 複数のエンドポイント間でリクエストを分散
   - フォールバック: 一つのプロバイダーが失敗した場合、自動的に別のプロバイダーにリクエスト
   - 監査ログ: すべてのリクエストを記録し、コンプライアンス要件に対応

---

## LiteLLM で何が解決するのか

LiteLLM を導入することで、以下の課題が解決できます：

### 1. 一元化されたコスト管理

すべての LLM API 呼び出しを LiteLLM プロキシ経由にすることで、リアルタイムで支出を追跡できます。プロジェクトごと、チームごと、API キーごとに予算を設定し、上限に達したら自動的にアクセスを制限できます。

**解決前**: 各プロジェクトが直接 Bedrock API を呼び出し、月末に請求書を見て初めて使いすぎに気づく

**解決後**: LiteLLM のダッシュボードで、リアルタイムに各プロジェクトの支出を確認し、予算に達する前にアラートを受け取れる

### 2. API キーの集中管理

LiteLLM は仮想キーを発行し、アプリケーションには実際の Bedrock 認証情報を渡す必要がありません。仮想キーごとに権限やレート制限を設定でき、セキュリティと管理性が向上します。

**解決前**: チームメンバーがそれぞれ AWS 認証情報を持ち、管理が煩雑で漏洩リスクがある

**解決後**: LiteLLM が発行する仮想キーを配布し、いつでも無効化や制限変更が可能

### 3. マルチプロバイダー対応の簡素化

同じコードで複数の LLM プロバイダーを使用できるため、プロバイダーの切り替えやフォールバック設定が簡単に実装できます。

**解決前**: OpenAI から Bedrock に移行する際、API 呼び出しコードを全面的に書き換える必要がある

**解決後**: LiteLLM の設定ファイルでモデル名を変更するだけで、アプリケーションコードはそのまま動作

### 4. レート制限の柔軟な設定

API キーごと、ユーザーごとに細かくレート制限を設定し、過度なリクエストを防ぎます。

---

## LiteLLM と Bedrock の統合手順

ここでは、LiteLLM プロキシサーバーをセットアップし、Amazon Bedrock と統合する具体的な手順を解説します。

### 前提条件

- Python 3.8 以上がインストールされていること
- AWS アカウントを持ち、Bedrock のモデルアクセスが有効化されていること
- AWS 認証情報（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`）を取得していること

### ステップ 1: LiteLLM のインストール

```bash
pip install 'litellm[proxy]'
```

プロキシサーバー機能を含む LiteLLM をインストールします。

### ステップ 2: データベースのセットアップ

LiteLLM は支出追跡やユーザー管理のためにデータベースを使用します。開発環境では SQLite、本番環境では PostgreSQL を推奨します。

**PostgreSQL を使用する場合**:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/litellm"
```

**SQLite を使用する場合**（開発環境向け）:

```bash
export DATABASE_URL="sqlite:///litellm.db"
```

### ステップ 3: AWS 認証情報の設定

LiteLLM が Bedrock にアクセスするため、AWS 認証情報を環境変数に設定します：

```bash
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_REGION_NAME="us-east-1"
```

**IAM ロールを使用する場合**（推奨）:

EC2 や ECS で実行する場合、IAM ロールにアタッチされた権限を使用できます。以下の権限が必要です：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    }
  ]
}
```

### ステップ 4: 設定ファイルの作成

`config.yaml` を作成し、使用する Bedrock モデルを定義します：

```yaml
model_list:
  - model_name: claude-3-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      aws_region_name: us-east-1

  - model_name: claude-3-haiku
    litellm_params:
      model: bedrock/anthropic.claude-3-haiku-20240307-v1:0
      aws_region_name: us-east-1

litellm_settings:
  success_callback: ["langfuse"]  # オプション: ログ記録
  drop_params: True  # Bedrock でサポートされないパラメータを自動的に除外

general_settings:
  master_key: "sk-1234"  # マスターキー（管理用）
  database_url: "postgresql://user:password@localhost:5432/litellm"
```

### ステップ 5: プロキシサーバーの起動

```bash
litellm --config config.yaml
```

デフォルトでは `http://0.0.0.0:4000` でプロキシサーバーが起動します。

### ステップ 6: API キーの作成

LiteLLM プロキシにリクエストを送るための仮想キーを作成します：

```bash
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "key_alias": "team-a-key",
    "duration": "30d",
    "max_budget": 100.0,
    "models": ["claude-3-sonnet", "claude-3-haiku"],
    "metadata": {"team": "team-a"}
  }'
```

レスポンスで返される仮想キー（例: `sk-litellm-abc123...`）をアプリケーションで使用します。

### ステップ 7: アプリケーションからの呼び出し

アプリケーションコードでは、OpenAI SDK を使用して LiteLLM プロキシ経由で Bedrock にアクセスできます：

**Python の場合**:

```python
import openai

client = openai.OpenAI(
    api_key="sk-litellm-abc123...",  # LiteLLM から発行された仮想キー
    base_url="http://localhost:4000"  # LiteLLM プロキシのエンドポイント
)

response = client.chat.completions.create(
    model="claude-3-sonnet",
    messages=[
        {"role": "user", "content": "こんにちは、元気ですか？"}
    ]
)

print(response.choices[0].message.content)
```

**Node.js の場合**:

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-litellm-abc123...',
  baseURL: 'http://localhost:4000'
});

const response = await client.chat.completions.create({
  model: 'claude-3-sonnet',
  messages: [
    { role: 'user', content: 'こんにちは、元気ですか?' }
  ]
});

console.log(response.choices[0].message.content);
```

アプリケーションは OpenAI の API 形式で呼び出していますが、裏側では LiteLLM が Bedrock にリクエストを変換しています。

---

## 実践的なコスト管理の設定

### 1. プロジェクトごとの予算設定

各プロジェクトに仮想キーを発行し、予算を設定します：

```bash
# プロジェクト A: 月 100 ドルまで
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "key_alias": "project-a",
    "max_budget": 100.0,
    "budget_duration": "30d"
  }'

# プロジェクト B: 月 50 ドルまで
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "key_alias": "project-b",
    "max_budget": 50.0,
    "budget_duration": "30d"
  }'
```

予算に達すると、自動的にリクエストが拒否されます。

### 2. レート制限の設定

API キーごとに 1 分あたりのリクエスト数を制限します：

```bash
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "key_alias": "limited-key",
    "rpm_limit": 100,  # 1 分あたり 100 リクエスト
    "tpm_limit": 100000  # 1 分あたり 100,000 トークン
  }'
```

これにより、意図しないループや攻撃から保護できます。

### 3. ダッシュボードでの可視化

LiteLLM は Web ダッシュボードを提供しており、リアルタイムでコストを確認できます：

```bash
litellm --config config.yaml --detailed_debug
```

ブラウザで `http://localhost:4000/ui` にアクセスすると、以下の情報が確認できます：

- プロジェクトごとの支出
- モデルごとの利用状況
- トークン消費量
- エラー率

### 4. アラート設定

予算の 80% に達したらアラートを送信する設定も可能です。`config.yaml` に Slack や Email の通知設定を追加します：

```yaml
general_settings:
  alerting:
    - slack_webhook_url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
      budget_threshold: 80  # 予算の 80% でアラート
```

---

## フォールバックとロードバランシング

LiteLLM は高可用性を実現するため、フォールバックとロードバランシング機能を提供しています。

### フォールバック設定

Bedrock が利用できない場合、自動的に OpenAI にフォールバックする設定：

```yaml
model_list:
  - model_name: claude-3-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      aws_region_name: us-east-1

  - model_name: claude-3-sonnet
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  routing_strategy: usage-based-routing-v2
  fallbacks:
    - model_name: claude-3-sonnet
      fallback_models: ["openai/gpt-4"]
```

### ロードバランシング

複数リージョンの Bedrock エンドポイントにリクエストを分散：

```yaml
model_list:
  - model_name: claude-3-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      aws_region_name: us-east-1

  - model_name: claude-3-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      aws_region_name: us-west-2

router_settings:
  routing_strategy: simple-shuffle  # ランダムに分散
```

---

## セキュリティのベストプラクティス

### 1. 仮想キーの最小権限設定

各 API キーには必要最小限の権限のみを付与します：

```bash
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "key_alias": "readonly-key",
    "models": ["claude-3-haiku"],  # Haiku モデルのみ
    "permissions": {
      "allow_model_changes": false
    }
  }'
```

### 2. マスターキーの管理

`config.yaml` の `master_key` は、絶対に公開リポジトリにコミットしないでください。環境変数から読み込むようにします：

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 3. HTTPS の使用

本番環境では、必ず HTTPS で LiteLLM プロキシにアクセスします。Nginx や ALB を使ってリバースプロキシを設定しましょう。

### 4. 監査ログの有効化

すべてのリクエストをログに記録し、異常なアクセスパターンを検出します：

```yaml
litellm_settings:
  success_callback: ["s3"]  # S3 にログを保存

general_settings:
  s3_callback_params:
    s3_bucket_name: "my-litellm-logs"
    s3_region_name: "us-east-1"
```

---

## トラブルシューティング

### Q: プロキシが Bedrock に接続できない

A: 以下を確認してください：

1. AWS 認証情報が正しく設定されているか
2. IAM ロールまたはユーザーに `bedrock:InvokeModel` 権限があるか
3. Bedrock のモデルアクセスが有効化されているか（AWS コンソールで確認）
4. リージョンが正しいか（Bedrock は一部のリージョンでのみ利用可能）

### Q: 予算が設定されているのに課金が続く

A: LiteLLM は予算をソフトリミットとして扱います。予算超過後にリクエストをブロックするには、`config.yaml` で以下を設定します：

```yaml
general_settings:
  enforce_budget: true
```

### Q: レスポンスが遅い

A: LiteLLM プロキシがボトルネックになっている可能性があります。以下を試してください：

- 複数の LiteLLM インスタンスを起動し、ロードバランサーで分散
- データベースを高速化（PostgreSQL のインデックス追加など）
- キャッシュ機能を有効化して、同じリクエストの結果を再利用

---

## まとめ

LiteLLM をゲートウェイとして活用することで、Amazon Bedrock の API 料金管理が劇的に改善されます：

- **コストの可視化**: リアルタイムでプロジェクトごと、モデルごとの支出を追跡
- **予算管理**: 自動的に上限を設定し、予算超過を防止
- **セキュリティ向上**: 仮想キーで認証情報を保護し、細かい権限制御が可能
- **マルチプロバイダー対応**: 統一されたインターフェースで、簡単にプロバイダーを切り替え
- **高可用性**: フォールバックとロードバランシングで、安定したサービスを提供

導入ステップ：

1. **LiteLLM をインストール**: `pip install 'litellm[proxy]'`
2. **設定ファイルを作成**: Bedrock モデルと予算を定義
3. **プロキシを起動**: `litellm --config config.yaml`
4. **仮想キーを発行**: プロジェクトごとに API キーを生成
5. **アプリケーションを接続**: OpenAI SDK で LiteLLM プロキシを呼び出す

生成 AI の利用が拡大する中、コスト管理は成功の鍵となります。LiteLLM を活用して、効率的でスケーラブルな LLM 基盤を構築しましょう！
