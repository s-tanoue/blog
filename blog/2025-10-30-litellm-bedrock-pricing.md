---
slug: litellm-bedrock-pricing
title: LiteLLMでClaudeのBedrock APIの料金を管理する方法
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [LiteLLM, AWS Bedrock, Claude, API, コスト管理]
---

LiteLLMを使ってAWS Bedrock上のClaude APIの料金を効率的に管理する方法を解説します。トークン使用量の追跡から予算設定まで、実践的な手法を紹介します。

<!--truncate-->

## LiteLLMとは

LiteLLMは、複数のLLMプロバイダー（OpenAI、Anthropic、AWS Bedrock、Azure OpenAIなど）を統一されたインターフェースで利用できるPythonライブラリです。料金追跡やコスト管理の機能が組み込まれており、特にAWS Bedrock上のClaudeモデルの利用において強力なツールとなります。

## AWS Bedrockのセットアップ

### 認証設定

AWS Bedrockを使用するには、適切なAWS認証情報が必要です。以下のいずれかの方法で設定できます：

```bash
# 環境変数による設定
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION_NAME="us-east-1"
```

### 基本的な使用方法

LiteLLMでBedrockのClaudeモデルを使用する基本的なコードは以下の通りです：

```python
import litellm

# Bedrock上のClaudeモデルを呼び出し
response = litellm.completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[
        {"role": "user", "content": "こんにちは"}
    ]
)

print(response.choices[0].message.content)
```

## トークン使用量とコストの追跡

### 基本的なコスト計算

LiteLLMは、レスポンスから自動的にトークン使用量とコストを計算します：

```python
import litellm

response = litellm.completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[
        {"role": "user", "content": "AIについて簡単に説明してください"}
    ]
)

# トークン使用量の取得
print(f"プロンプトトークン: {response.usage.prompt_tokens}")
print(f"完了トークン: {response.usage.completion_tokens}")
print(f"合計トークン: {response.usage.total_tokens}")

# コストの計算
cost = litellm.completion_cost(completion_response=response)
print(f"APIコール費用: ${cost:.6f}")
```

### completion_cost関数の活用

`completion_cost()`関数は、より柔軟なコスト計算を提供します：

```python
# レスポンスオブジェクトからコスト計算
cost = litellm.completion_cost(completion_response=response)

# または、手動でトークン数を指定
cost = litellm.completion_cost(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    prompt_tokens=100,
    completion_tokens=200
)

print(f"推定コスト: ${cost:.6f}")
```

## グローバル予算の設定

LiteLLMでは、アプリケーション全体の予算上限を設定できます：

```python
import litellm
from litellm import BudgetExceededError

# グローバル予算を$10に設定
litellm.max_budget = 10.0

try:
    response = litellm.completion(
        model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
        messages=[
            {"role": "user", "content": "長い文章を生成してください"}
        ]
    )
except BudgetExceededError as e:
    print(f"予算超過: {e}")
    # 適切なエラーハンドリング処理
```

## LiteLLM Proxyを使った高度な料金管理

LiteLLM Proxyを使用すると、より詳細な料金追跡とチーム別の予算管理が可能になります。

### Proxyのセットアップ

```yaml
# config.yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      aws_region_name: us-east-1

# データベース接続（PostgreSQL）
database_url: "postgresql://user:password@localhost:5432/litellm"

# コスト追跡の有効化
success_callback: ["langfuse"]
failure_callback: ["langfuse"]
```

### Proxyの起動

```bash
litellm --config config.yaml --port 4000
```

### チーム別の予算管理

```python
import requests

# チームの作成と予算設定
team_data = {
    "team_id": "engineering-team",
    "max_budget": 500.0,  # $500の予算
    "budget_duration": "monthly"
}

response = requests.post(
    "http://localhost:4000/team/new",
    json=team_data,
    headers={"Authorization": "Bearer your-master-key"}
)
```

## Application Inference Profilesの活用

AWS Bedrockの「Application Inference Profiles」を使用すると、プロジェクト単位でコストを追跡できます：

```python
import litellm

# Inference Profileを使用
response = litellm.completion(
    model="bedrock/us.anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[
        {"role": "user", "content": "質問内容"}
    ],
    # Inference Profile IDを指定
    model_id="arn:aws:bedrock:us-east-1:123456789012:inference-profile/my-project-profile"
)
```

これにより、AWS Cost Explorerでプロジェクト別のコストを詳細に分析できます。

## カスタム価格設定

独自の価格体系を設定することも可能です：

```yaml
# config.yaml
litellm_settings:
  custom_pricing:
    bedrock/anthropic.claude-3-sonnet-20240229-v1:0:
      input_cost_per_token: 0.000003
      output_cost_per_token: 0.000015
      cache_creation_input_token_cost: 0.00000375
      cache_read_input_token_cost: 0.0000003
```

## コスト追跡のベストプラクティス

### 1. リクエストタグの活用

各APIコールにタグを付けて、詳細な分析を可能にします：

```python
response = litellm.completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[
        {"role": "user", "content": "質問"}
    ],
    metadata={
        "tags": ["production", "chat-feature", "user-123"],
        "project": "customer-support"
    }
)
```

### 2. 定期的なコストレビュー

データベースに保存された使用状況データを定期的に分析：

```python
import psycopg2
from datetime import datetime, timedelta

# 過去30日間のコストを集計
conn = psycopg2.connect("postgresql://user:password@localhost:5432/litellm")
cursor = conn.cursor()

cursor.execute("""
    SELECT
        DATE(created_at) as date,
        model,
        SUM(spend) as daily_cost,
        SUM(total_tokens) as total_tokens
    FROM spend_logs
    WHERE created_at >= %s
    GROUP BY DATE(created_at), model
    ORDER BY date DESC
""", (datetime.now() - timedelta(days=30),))

for row in cursor.fetchall():
    print(f"日付: {row[0]}, モデル: {row[1]}, コスト: ${row[2]:.2f}, トークン数: {row[3]}")
```

### 3. アラート設定

予算の閾値を超えた場合の通知システムを実装：

```python
import litellm

def check_budget_threshold(current_spend, budget, threshold=0.8):
    """予算の80%を超えたら警告"""
    if current_spend >= budget * threshold:
        # Slack、メールなどで通知
        send_alert(f"警告: 予算の{threshold*100}%を使用しました")

# 定期的にチェック
litellm.success_callback = ["custom_budget_check"]
```

## Claude Sonnet 4.5の注意点

2025年現在、Claude Sonnet 4.5モデルの料金追跡において、LiteLLMに以下の既知の問題があります：

- 価格が公式のAWS Bedrock料金より10%高く設定されていた問題（修正済み）
- コストと使用量情報の不一致が報告されている

これらの問題に対処するため、以下を推奨します：

```python
# 最新バージョンのLiteLLMを使用
# pip install --upgrade litellm

# カスタム価格設定で正確な料金を指定
import litellm

litellm.register_model({
    "bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0": {
        "input_cost_per_token": 0.000003,  # AWS公式料金を確認
        "output_cost_per_token": 0.000015,
        "max_tokens": 200000
    }
})
```

## Langfuseとの統合

より高度な可観測性のために、Langfuseと統合できます：

```python
import litellm

# Langfuseの設定
litellm.success_callback = ["langfuse"]
litellm.failure_callback = ["langfuse"]

# 環境変数で認証情報を設定
import os
os.environ["LANGFUSE_PUBLIC_KEY"] = "your-public-key"
os.environ["LANGFUSE_SECRET_KEY"] = "your-secret-key"
os.environ["LANGFUSE_HOST"] = "https://cloud.langfuse.com"

# 通常通り使用すると、自動的にLangfuseに記録される
response = litellm.completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[
        {"role": "user", "content": "テスト"}
    ]
)
```

## まとめ

LiteLLMを使用することで、AWS Bedrock上のClaude APIの料金を効果的に管理できます：

1. **自動コスト追跡**: `completion_cost()`関数で簡単にコスト計算
2. **予算管理**: グローバル予算やチーム別予算の設定が可能
3. **詳細な分析**: データベース統合で長期的なコスト分析
4. **柔軟な設定**: カスタム価格設定やInference Profilesの活用
5. **可観測性**: Langfuseなどのツールとの統合

コスト管理を適切に行うことで、安心してClaude APIを本番環境で利用できます。定期的なコストレビューとアラート設定を組み合わせることで、予期しない高額請求を防ぐことができます。

## 参考リンク

- [LiteLLM公式ドキュメント](https://docs.litellm.ai/)
- [AWS Bedrock料金](https://aws.amazon.com/bedrock/pricing/)
- [LiteLLM GitHub](https://github.com/BerriAI/litellm)
