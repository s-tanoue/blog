---
slug: aws-agentcore-guide
title: Amazon Bedrock AgentCore完全ガイド：本番環境でAIエージェントを安全にスケールする方法
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - AI・LLM
---

AI エージェントを開発することは容易になりましたが、**本番環境で安全にスケールさせる**ことは依然として大きな課題です。セキュリティ、パフォーマンス、可観測性、メモリ管理など、エンタープライズグレードのシステムには多くの要件があります。この記事では、AWS が 2025年に正式リリースした **Amazon Bedrock AgentCore** を徹底解説し、本番環境で AI エージェントを運用するための完全ガイドを提供します。

<!--truncate-->

## なぜ AI エージェントの本番運用は難しいのか

AI エージェントを開発フェーズから本番環境に移行する際、以下のような課題に直面します：

- **長時間実行の制限**: 複雑なタスクには時間がかかるが、多くのプラットフォームは短いタイムアウトしか提供しない
- **セキュリティリスク**: エージェントが外部 API やサービスにアクセスする際の認証情報管理が困難
- **メモリの管理**: 会話履歴や長期記憶を正確に維持することが難しい
- **可観測性の欠如**: エージェントの内部動作が見えず、デバッグやトラブルシューティングが困難
- **インフラの複雑さ**: スケーラブルなインフラを構築・管理するコストが高い
- **フレームワーク依存**: 特定のフレームワークに縛られ、柔軟性が失われる

これらの課題を解決するために、AWS は **Amazon Bedrock AgentCore** を開発しました。

---

## Amazon Bedrock AgentCore とは何か

**Amazon Bedrock AgentCore** は、AI エージェントを構築、デプロイ、運用するための**統合プラットフォーム**です。任意のフレームワーク、モデル、プロトコルを使用して、エンタープライズグレードのエージェントを安全かつスケーラブルに展開できます。

公式サイト: https://aws.amazon.com/bedrock/agentcore/

### リリースタイムライン

- **2025年7月16日**: AWS Summit New York でプレビュー発表
- **2025年10月13日**: 一般提供（GA）開始

### AgentCore の設計思想

AgentCore は以下の3つの柱に基づいて設計されています：

1. **エージェントをより効果的に**: メモリ、ブラウザ、コードインタプリタなどの高度な機能を提供
2. **安全にスケール**: 本番環境に必要なインフラとセキュリティを提供
3. **信頼できる運用**: 可観測性と制御機能で、信頼性の高いエージェントを実現

---

## AgentCore の 7 つのコアサービス

AgentCore は、エージェントの本番運用に必要な機能を 7 つの統合サービスとして提供します。

### 1. Runtime（ランタイム）

**最長 8 時間の実行時間**を提供し、複雑な非同期ワークフローに対応します。これは業界最長の実行時間です。

**特徴**:
- 低レイテンシのインタラクティブな体験をサポート
- 高速なコールドスタート
- 真のセッション分離
- マルチモーダルペイロードのサポート（テキスト、画像、音声など）
- 組み込みの ID 管理

**ユースケース**:
- 複雑なデータ分析タスク
- 長時間のワークフロー自動化
- バックグラウンド処理を伴うエージェント

### 2. Memory（メモリ）

業界をリードする**メモリ精度**を提供し、短期記憶と長期記憶の両方をサポートします。

**特徴**:
- **短期記憶**: マルチターン会話の履歴を保持
- **長期記憶**: エージェント間やセッション間で共有可能な永続的な記憶
- 高精度な情報検索
- 自動的なメモリ管理

**ユースケース**:
- カスタマーサポートエージェント（過去の会話を記憶）
- パーソナライズされた推奨システム
- 継続的な学習が必要なエージェント

### 3. Identity（アイデンティティ）

エージェントが AWS サービスやサードパーティのツール（GitHub、Salesforce、Slack など）に**安全にアクセス**できるようにします。

**特徴**:
- エージェント専用の IAM ロール
- セキュアな認証情報管理
- きめ細かいアクセス制御
- サードパーティサービスとの OAuth 連携

**ユースケース**:
- 社内システムにアクセスするエージェント
- GitHub や Slack を操作するエージェント
- データベースやストレージに安全にアクセス

### 4. Gateway（ゲートウェイ）

既存の API やサービスを **Model Context Protocol (MCP) 互換のツール**に変換します。

**特徴**:
- ツールの統合と検出を簡素化
- 既存の API を MCP 形式に自動変換
- ツールのバージョニングと管理
- 複数のツールを一元管理

**ユースケース**:
- レガシー API をエージェントで利用
- REST API を MCP ツールとして公開
- 社内サービスをエージェントに統合

### 5. Observability（可観測性）

**Amazon CloudWatch** と統合し、エージェントの実行状況を完全に可視化します。

**特徴**:
- エンドツーエンドのエージェント実行トレース
- 運用メトリクスのダッシュボード
- エラーとパフォーマンスの監視
- カスタムアラートの設定

**監視できる指標**:
- 実行時間（レイテンシ）
- 成功率・エラー率
- トークン使用量
- メモリ使用量
- ツール呼び出しの頻度

**ユースケース**:
- 本番環境のパフォーマンス監視
- デバッグとトラブルシューティング
- SLA の遵守状況の確認

### 6. Browser（ブラウザ）

エージェントが Web ブラウザを操作するための**マネージド Web ブラウザインスタンス**を提供します。

**特徴**:
- スケーラブルなブラウザインスタンス
- JavaScript の実行サポート
- スクリーンショットとページキャプチャ
- フォーム入力とクリック操作

**ユースケース**:
- Web スクレイピング
- Web アプリケーションの自動テスト
- データ収集と監視
- 自動化されたフォーム送信

### 7. Code Interpreter（コードインタプリタ）

エージェントが生成したコードを**隔離された安全な環境**で実行します。

**特徴**:
- Python、JavaScript などのコード実行
- サンドボックス環境で安全に実行
- ファイルの読み書きサポート
- データ分析とビジュアライゼーション

**ユースケース**:
- データ分析エージェント
- レポート生成
- 数値計算とシミュレーション
- グラフやチャートの生成

---

## AgentCore の主な利点

### 1. フレームワーク非依存

AgentCore は以下のような主要なオープンソースフレームワークをすべてサポートします：

- **CrewAI**
- **LangGraph**
- **LlamaIndex**
- **Google ADK**
- **OpenAI Agents SDK**
- カスタムフレームワーク

これにより、既存のコードをそのまま AgentCore にデプロイできます。

### 2. Model Context Protocol (MCP) サポート

AgentCore は **MCP**（Anthropic と共同で開発されたオープンソースプロトコル）をネイティブサポートします。これにより、ツールの統合が標準化され、エージェント間でツールを共有できます。

### 3. エンタープライズグレードのセキュリティ

- **VPC サポート**: プライベートネットワーク内でエージェントを実行
- **AWS PrivateLink**: インターネットを経由せずに AWS サービスにアクセス
- **IAM 統合**: きめ細かいアクセス制御
- **監査ログ**: すべてのアクション記録

### 4. 柔軟な料金体系

- 従量課金制（使った分だけ支払う）
- 初期費用や最低料金なし
- 各サービスごとに独立した料金設定
- コストを最適化しやすい

### 5. AWS CloudFormation サポート

Infrastructure as Code (IaC) でエージェントのインフラを管理できます。

### 6. リソースタグ

AWS のリソースタグをサポートし、コスト配分や管理が容易になります。

---

## AgentCore の使い方：ステップバイステップガイド

### 前提条件

- AWS アカウント
- AWS CLI または AWS SDK のインストール
- Python 3.9 以上（例では Python を使用）
- Bedrock のモデルアクセスが有効化されていること

### ステップ 1: AWS CLI のインストールと設定

```bash
# AWS CLI のインストール
pip install awscli

# 認証情報の設定
aws configure
```

### ステップ 2: Bedrock AgentCore Starter Toolkit のインストール

AWS が提供する公式ツールキットを使用します：

```bash
pip install bedrock-agentcore-toolkit
```

### ステップ 3: エージェントの定義

シンプルなエージェントを作成します。ここでは LangGraph を使用した例を示します：

```python
# agent.py
from langgraph.graph import StateGraph, END
from langchain_aws import ChatBedrock
from typing import TypedDict

# 状態の定義
class State(TypedDict):
    messages: list
    current_step: str

# LLM の初期化
llm = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    region_name="us-east-1"
)

# エージェントグラフの構築
workflow = StateGraph(State)

def process_input(state: State) -> State:
    """ユーザー入力を処理"""
    messages = state["messages"]
    response = llm.invoke(messages)
    messages.append(response)
    return {"messages": messages, "current_step": "completed"}

# ノードの追加
workflow.add_node("process", process_input)

# エントリーポイントの設定
workflow.set_entry_point("process")
workflow.add_edge("process", END)

# グラフのコンパイル
app = workflow.compile()

# AgentCore用のハンドラー
def handler(event, context):
    """AgentCore Runtimeから呼び出されるエントリーポイント"""
    messages = event.get("messages", [])
    initial_state = {"messages": messages, "current_step": "start"}
    result = app.invoke(initial_state)
    return {"messages": result["messages"]}
```

### ステップ 4: AgentCore へのデプロイ

Starter Toolkit を使用してデプロイします：

```bash
# エージェントのパッケージング
agentcore package agent.py

# AgentCore へのデプロイ
agentcore deploy \
  --name my-agent \
  --handler agent.handler \
  --runtime python3.11 \
  --memory 1024 \
  --timeout 300
```

デプロイが完了すると、エージェントの ARN が返されます。

### ステップ 5: エージェントの呼び出し

Python SDK を使用してエージェントを呼び出します：

```python
import boto3
import json

client = boto3.client('bedrock-agentcore', region_name='us-east-1')

response = client.invoke_agent(
    agentId='my-agent',
    sessionId='session-123',
    inputText='Amazon Bedrock AgentCore について教えてください'
)

# レスポンスの処理
for event in response['completion']:
    if 'chunk' in event:
        chunk = event['chunk']
        print(chunk['bytes'].decode('utf-8'), end='')
```

### ステップ 6: メモリの有効化

長期記憶を使用する場合：

```python
# メモリストアの作成
memory_response = client.create_memory_store(
    memoryStoreName='my-agent-memory',
    description='エージェントの長期記憶'
)

memory_store_id = memory_response['memoryStoreId']

# エージェント呼び出し時にメモリを指定
response = client.invoke_agent(
    agentId='my-agent',
    sessionId='session-123',
    inputText='前回の会話を覚えていますか？',
    memoryStoreId=memory_store_id
)
```

### ステップ 7: Gateway でツールを追加

既存の API を MCP ツールとして登録します：

```python
# ツールの定義
tool_definition = {
    "name": "get_weather",
    "description": "指定された都市の天気を取得",
    "inputSchema": {
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "都市名"
            }
        },
        "required": ["city"]
    }
}

# Gateway にツールを登録
gateway_response = client.register_tool(
    toolName='get_weather',
    toolDefinition=tool_definition,
    apiEndpoint='https://api.weather.com/v1/forecast',
    authConfig={
        "type": "API_KEY",
        "apiKeyName": "X-API-Key",
        "apiKeyValue": "your-api-key"
    }
)

# エージェントにツールを関連付け
client.associate_tool_with_agent(
    agentId='my-agent',
    toolId=gateway_response['toolId']
)
```

---

## 実践的なユースケース

### 1. カスタマーサポートエージェント

**要件**:
- 顧客との過去の会話を記憶
- 社内 FAQ データベースを検索
- チケット管理システムと連携
- 8 時間以上の長時間セッション

**AgentCore の活用**:
- **Memory**: 顧客ごとの会話履歴を保存
- **Gateway**: FAQ システムと CRM を MCP ツールとして統合
- **Runtime**: 長時間セッションをサポート
- **Observability**: 応答品質と顧客満足度を監視

### 2. データ分析エージェント

**要件**:
- データベースからデータを抽出
- Python でデータ分析を実行
- レポートとグラフを生成
- 分析結果を Slack に通知

**AgentCore の活用**:
- **Code Interpreter**: Python コードを安全に実行
- **Identity**: データベースに安全にアクセス
- **Gateway**: Slack API を統合
- **Runtime**: 長時間の分析ジョブをサポート

### 3. Web 自動化エージェント

**要件**:
- 定期的に Web サイトを巡回
- フォームに自動入力
- データを収集してレポート化
- エラー時にアラート

**AgentCore の活用**:
- **Browser**: マネージドブラウザで Web 操作
- **Memory**: 巡回履歴を記憶
- **Observability**: エラーとパフォーマンスを監視
- **Runtime**: バックグラウンドジョブとして実行

---

## CloudFormation によるインフラ管理

AgentCore は CloudFormation をサポートしており、Infrastructure as Code で管理できます。

### CloudFormation テンプレート例

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Bedrock AgentCore Stack'

Resources:
  MyAgentRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: bedrock.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/AmazonBedrockFullAccess

  MyMemoryStore:
    Type: AWS::BedrockAgentCore::MemoryStore
    Properties:
      MemoryStoreName: my-agent-memory
      Description: 'Long-term memory for my agent'

  MyAgent:
    Type: AWS::BedrockAgentCore::Agent
    Properties:
      AgentName: my-agent
      AgentResourceRoleArn: !GetAtt MyAgentRole.Arn
      RuntimeConfig:
        Handler: agent.handler
        Runtime: python3.11
        Timeout: 300
        MemorySize: 1024
      MemoryStoreId: !Ref MyMemoryStore

Outputs:
  AgentId:
    Value: !Ref MyAgent
    Description: 'Agent ID'
```

デプロイ：

```bash
aws cloudformation create-stack \
  --stack-name my-agent-stack \
  --template-body file://agent-template.yaml \
  --capabilities CAPABILITY_IAM
```

---

## セキュリティのベストプラクティス

### 1. VPC 内でエージェントを実行

プライベートサブネット内でエージェントを実行し、インターネットからの直接アクセスを防ぎます：

```python
client.create_agent(
    agentName='secure-agent',
    vpcConfig={
        'subnetIds': ['subnet-123', 'subnet-456'],
        'securityGroupIds': ['sg-789']
    }
)
```

### 2. 最小権限の原則

エージェントの IAM ロールには、必要最小限の権限のみを付与します：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/public/*"
    }
  ]
}
```

### 3. 監査ログの有効化

CloudTrail を有効化し、すべてのエージェントアクションをログに記録します：

```bash
aws cloudtrail create-trail \
  --name agentcore-trail \
  --s3-bucket-name my-logs-bucket \
  --is-multi-region-trail
```

### 4. 機密情報の管理

API キーやパスワードは AWS Secrets Manager に保存します：

```python
import boto3
import json

secrets_client = boto3.client('secretsmanager')

# シークレットの作成
secrets_client.create_secret(
    Name='my-agent/api-keys',
    SecretString=json.dumps({
        'weather_api_key': 'abc123',
        'slack_token': 'xoxb-456'
    })
)

# エージェントからシークレットを取得
def get_secret(secret_name):
    response = secrets_client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])
```

---

## 料金体系

AgentCore は従量課金制で、各サービスごとに料金が設定されています。

### 料金の構成要素

1. **Runtime**:
   - リクエストごとの料金
   - 実行時間に基づく料金（GB-秒単位）

2. **Memory**:
   - ストレージ容量に基づく料金（GB-月単位）
   - クエリ回数に基づく料金

3. **Browser**:
   - ブラウザセッションの実行時間（分単位）

4. **Code Interpreter**:
   - コード実行時間（秒単位）

5. **Gateway**:
   - ツール呼び出し回数

6. **Observability**:
   - CloudWatch メトリクスとログの料金

### コスト最適化のヒント

- **不要なメモリストレージを削除**: 古いセッションデータを定期的にクリーンアップ
- **適切なタイムアウト設定**: 必要以上に長いタイムアウトを設定しない
- **バッチ処理**: 複数のリクエストをまとめて処理
- **キャッシュの活用**: 同じクエリの結果をキャッシュして再利用

---

## 利用可能なリージョン

AgentCore は以下の AWS リージョンで利用可能です（2025年10月時点）：

- **米国**: US East (N. Virginia)、US East (Ohio)、US West (Oregon)
- **アジア太平洋**: Mumbai、Singapore、Sydney、Tokyo
- **ヨーロッパ**: Frankfurt、Ireland

今後、さらに多くのリージョンに拡大予定です。

---

## トラブルシューティング

### Q: エージェントが起動しない

A: 以下を確認してください：

1. IAM ロールに適切な権限があるか
2. Bedrock のモデルアクセスが有効化されているか
3. コードに構文エラーがないか
4. デプロイパッケージのサイズが制限を超えていないか

### Q: メモリが正しく保存されない

A: メモリストアの設定を確認してください：

```python
# メモリストアの状態確認
response = client.describe_memory_store(
    memoryStoreId='your-memory-store-id'
)
print(response)
```

### Q: ツールが呼び出されない

A: ツールの定義とエージェントへの関連付けを確認してください：

```python
# ツールの一覧表示
tools = client.list_tools_for_agent(agentId='my-agent')
print(tools)
```

### Q: コストが予想以上に高い

A: CloudWatch でメトリクスを確認し、以下をチェックしてください：

- 不要な長時間実行がないか
- メモリストレージが適切にクリーンアップされているか
- ブラウザセッションが正しく終了しているか

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/BedrockAgentCore \
  --metric-name InvocationCount \
  --dimensions Name=AgentName,Value=my-agent \
  --start-time 2025-10-01T00:00:00Z \
  --end-time 2025-10-31T23:59:59Z \
  --period 86400 \
  --statistics Sum
```

---

## まとめ

Amazon Bedrock AgentCore は、AI エージェントを本番環境で運用するための包括的なソリューションです：

**主な機能**:
- **7 つのコアサービス**: Runtime、Memory、Identity、Gateway、Observability、Browser、Code Interpreter
- **フレームワーク非依存**: LangGraph、CrewAI、LlamaIndex など、任意のフレームワークをサポート
- **業界最長の実行時間**: 最大 8 時間の長時間実行
- **高精度なメモリ**: 短期・長期記憶の両方をサポート
- **エンタープライズセキュリティ**: VPC、PrivateLink、IAM 統合

**主な利点**:
- **スケーラビリティ**: AWS のインフラで自動スケール
- **セキュリティ**: エンタープライズグレードのセキュリティ機能
- **可観測性**: CloudWatch と統合した完全な可視化
- **柔軟性**: 任意のフレームワークとモデルを使用可能
- **コスト効率**: 従量課金制で、使った分だけ支払う

**導入ステップ**:
1. **AWS アカウントのセットアップ**: Bedrock のモデルアクセスを有効化
2. **Starter Toolkit のインストール**: `pip install bedrock-agentcore-toolkit`
3. **エージェントの開発**: 好みのフレームワークで開発
4. **AgentCore へのデプロイ**: `agentcore deploy` コマンドでデプロイ
5. **監視と最適化**: CloudWatch でパフォーマンスを監視

**利用可能なリージョン**: 米国、アジア太平洋、ヨーロッパの 9 リージョン

AI エージェントの本番運用において、AgentCore は開発者が**ビジネスロジックに集中**できるよう、インフラ、セキュリティ、運用の複雑さを抽象化します。エンタープライズグレードの AI エージェントを構築するなら、Amazon Bedrock AgentCore を活用しましょう！
