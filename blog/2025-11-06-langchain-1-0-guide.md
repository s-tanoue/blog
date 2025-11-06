---
slug: langchain-1-0-guide
title: LangChain 1.0リリース完全ガイド：AIエージェント開発の新時代
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://github.com/s-tanoue
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [LangChain, AI, LLM, Agent, Python, LangGraph]
---

2025年10月22日、LangChainがついに1.0の正式版をリリースしました。これは2022年のローンチ以来、初の安定版メジャーリリースであり、2.0まで破壊的変更がないことが約束されています。本記事では、LangChain 1.0の主要な変更点、新機能、そしてLangGraph 1.0との使い分けについて徹底解説します。

<!--truncate-->

## LangChain 1.0とは何が変わったのか

### リリースの背景

LangChain 1.0は、AIエージェント開発のベストプラクティスを集約した初の安定版です。同時期にLangChainは$125Mの資金調達を完了し、評価額$1.25Bに到達。エンタープライズグレードのエージェント開発基盤としての地位を確立しました。

### 主要な3つの新機能

#### 1. **create_agent抽象化**

最速でエージェントを構築できる新しいAPI。LangGraphランタイム上に構築され、信頼性と拡張性を両立しています。

```python
from langchain import create_agent
from langchain_openai import ChatOpenAI
from langchain_community.tools import DuckDuckGoSearchRun

# モデルとツールを定義
model = ChatOpenAI(model="gpt-4")
tools = [DuckDuckGoSearchRun()]

# わずか3行でエージェント作成
agent = create_agent(
    model=model,
    tools=tools,
    system_message="あなたは親切なアシスタントです"
)

# 実行
result = agent.invoke(\{"input": "今日の天気は？"\})
```

#### 2. **Middleware システム**

エージェントのライフサイクル全体を細かく制御できる新しいアーキテクチャ。3つのフックポイントで介入可能：

- **before_model**: モデル呼び出し前に実行（状態更新、別ノードへのジャンプ）
- **after_model**: モデル呼び出し後に実行（レスポンス加工）
- **modify_model_request**: モデルリクエストの内容を変更（ツール、プロンプト、パラメータなど）

**組み込みMiddleware**:

```python
from langchain.middleware import (
    PIIMiddleware,           # 個人情報の自動マスキング
    SummarizationMiddleware, # 会話履歴の要約
    HumanInTheLoopMiddleware # 重要な操作に人間の承認を要求
)

agent = create_agent(
    model=model,
    tools=tools,
    middleware=[
        PIIMiddleware(),
        HumanInTheLoopMiddleware(
            tools_requiring_approval=["delete_database", "send_email"]
        )
    ]
)
```

**カスタムMiddlewareの例**:

```python
from langchain.middleware import BaseMiddleware

class LoggingMiddleware(BaseMiddleware):
    def before_model(self, state):
        print(f"モデル呼び出し前の状態: \{state\}")
        return state

    def after_model(self, state):
        print(f"モデルのレスポンス: \{state['messages'][-1]\}")
        return state
```

#### 3. **改善されたStructured Output**

構造化出力がメインのエージェントループに統合され、余分なLLM呼び出しを削減。レイテンシとコストの両方が改善されました。

```python
from pydantic import BaseModel
from langchain import create_agent

class SearchResult(BaseModel):
    title: str
    summary: str
    relevance_score: float

agent = create_agent(
    model=model,
    tools=tools,
    response_format=SearchResult
)

# 型安全な構造化レスポンスを取得
result: SearchResult = agent.invoke(\{"input": "量子コンピューティングについて調べて"\})
print(f"タイトル: \{result.title\}")
print(f"要約: \{result.summary\}")
print(f"関連度: \{result.relevance_score\}")
```

## LangChain vs LangGraph：どちらを選ぶべきか

LangChain 1.0と同時にLangGraph 1.0もリリースされました。両者は補完的な関係にあり、用途に応じて使い分けることが重要です。

### LangChain 1.0を選ぶべき場面

- **標準的なツール呼び出しパターン**のエージェントを素早く構築したい
- **プロトタイピング**を重視し、迅速に動作を確認したい
- **シンプルで直線的なワークフロー**（テキスト要約、チャットボット、ドキュメント検索など）
- **プロバイダー非依存**の設計が必要

```python
# LangChainの例：シンプルな質問応答エージェント
agent = create_agent(
    model=ChatOpenAI(),
    tools=[search_tool, calculator_tool],
    system_message="質問に正確に答えてください"
)
```

### LangGraph 1.0を選ぶべき場面

- **複雑な意思決定ツリー**や条件分岐が必要
- **長時間実行されるエージェント**で永続的な状態管理が必要
- **Human-in-the-Loop**パターンを本格的に実装したい
- **マルチエージェントシステム**の構築

```python
# LangGraphの例：複雑な承認フロー
from langgraph.graph import StateGraph

workflow = StateGraph()
workflow.add_node("analyze", analyze_request)
workflow.add_node("risk_check", check_risk_level)
workflow.add_node("human_review", human_approval)
workflow.add_node("execute", execute_action)

workflow.add_edge("analyze", "risk_check")
workflow.add_conditional_edges(
    "risk_check",
    route_by_risk,
    \{
        "high": "human_review",
        "low": "execute"
    \}
)
```

### 両者の関係

重要なポイント：**LangChainエージェントはLangGraph上に構築されています**。つまり、LangChainで始めて、必要に応じてLangGraphにシームレスに移行できます。

## 破壊的変更と移行ガイド

### 1. パッケージ構造の大幅変更

**v1で削除された機能**は`langchain-classic`パッケージに移動：

```bash
pip install langchain-classic
```

影響を受ける主要コンポーネント：
- Retrievers（`MultiQueryRetriever`など）
- Embeddings（`CacheBackedEmbeddings`など）
- Chains、Indexing、Hub modules

**移行例**:

```python
# 旧（v0.x）
from langchain.retrievers import MultiQueryRetriever

# 新（v1.0）
from langchain_classic.retrievers import MultiQueryRetriever
```

### 2. メッセージオブジェクトの変更

```python
# 旧: .text()はメソッド
message.text()

# 新: .textはプロパティ
message.text

# AIMessageのexampleパラメータは削除
# additional_kwargsを使用
message = AIMessage(
    content="こんにちは",
    additional_kwargs=\{"example_key": "example_value"\}
)
```

### 3. エージェント作成の変更

```python
# 旧: create_react_agent + AgentExecutor
from langchain.agents import create_react_agent, AgentExecutor

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# 新: create_agent（推奨）
from langchain import create_agent

agent = create_agent(
    model=llm,
    tools=tools,
    system_message="システムメッセージ"
)
```

### 4. 状態スキーマの変更

**重要**: `create_agent`は`TypedDict`のみをサポート。PydanticモデルとDataclassは非推奨です。

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_info: dict

agent = create_agent(model=model, tools=tools, state_schema=AgentState)
```

## 実践例：プロダクション対応のエージェント構築

以下は、LangChain 1.0の新機能を活用した本格的なエージェントの例です：

```python
from langchain import create_agent
from langchain_openai import ChatOpenAI
from langchain.middleware import (
    PIIMiddleware,
    HumanInTheLoopMiddleware,
    BaseMiddleware
)
from langchain_community.tools import DuckDuckGoSearchRun
from pydantic import BaseModel
import logging

# ロギング用カスタムMiddleware
class AuditLogMiddleware(BaseMiddleware):
    def before_model(self, state):
        logging.info(f"User query: \{state['messages'][-1].content\}")
        return state

    def after_model(self, state):
        logging.info(f"Agent response: \{state['messages'][-1].content\}")
        return state

# レスポンスフォーマット定義
class AgentResponse(BaseModel):
    answer: str
    confidence: float
    sources: list[str]

# ツール定義
search_tool = DuckDuckGoSearchRun()

# エージェント作成
agent = create_agent(
    model=ChatOpenAI(model="gpt-4", temperature=0),
    tools=[search_tool],
    system_message="""
    あなたは正確で信頼できる情報を提供するリサーチアシスタントです。
    必ず検索結果に基づいて回答し、不確かな情報には注意を促してください。
    """,
    middleware=[
        PIIMiddleware(),  # 個人情報の自動マスキング
        AuditLogMiddleware(),  # 監査ログ記録
        HumanInTheLoopMiddleware(
            tools_requiring_approval=["send_email"]
        )
    ],
    response_format=AgentResponse
)

# 実行
response: AgentResponse = agent.invoke(\{
    "input": "最新のAI技術トレンドについて教えて"
\})

print(f"回答: \{response.answer\}")
print(f"信頼度: \{response.confidence\}")
print(f"情報源: \{', '.join(response.sources)\}")
```

## LangChain 1.0のエコシステム

### 新しいドキュメントサイト

LangChain 1.0のリリースと同時に、完全に再設計されたドキュメントサイトが公開されました：
- **python.langchain.com** - Python公式ドキュメント
- **docs.langchain.com** - 統合ドキュメントハブ

### LangSmithとの統合

LangSmithはLangChainアプリケーションの開発、モニタリング、デバッグのためのプラットフォームです。1.0では統合がさらに強化されました：

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"

# これだけで全てのエージェント実行が自動的にトレースされる
agent = create_agent(model=model, tools=tools)
```

### 主要な統合パートナー

- **OpenAI**: GPT-4、GPT-4 Turbo
- **Anthropic**: Claude 3シリーズ
- **Google**: Gemini Pro
- **Microsoft**: Azure OpenAI Service
- **AWS**: Amazon Bedrock

## パフォーマンスとコスト最適化

### Structured Outputによるコスト削減

LangChain 1.0では、Structured Outputがメインループに統合されたことで、従来2回必要だったLLM呼び出しが1回に削減されました。

**コスト比較例**（GPT-4使用時）：

| 実装方法 | LLM呼び出し回数 | 推定コスト |
|---------|------------|----------|
| v0.x (後処理パーサー) | 2回 | $0.06/リクエスト |
| v1.0 (統合型) | 1回 | $0.03/リクエスト |

**50%のコスト削減** + レイテンシ改善

### Middlewareによる効率化

SummarizationMiddlewareを使用することで、長い会話履歴を圧縮し、コンテキストウィンドウを効率的に使用できます：

```python
from langchain.middleware import SummarizationMiddleware

agent = create_agent(
    model=model,
    tools=tools,
    middleware=[
        SummarizationMiddleware(
            max_tokens=1000,  # 履歴が1000トークンを超えたら要約
            summarizer_model=ChatOpenAI(model="gpt-3.5-turbo")  # 安価なモデルで要約
        )
    ]
)
```

## ベストプラクティス

### 1. プロバイダー非依存の設計

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# 環境変数でモデルを切り替え
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "openai")

model = {
    "openai": ChatOpenAI(model="gpt-4"),
    "anthropic": ChatAnthropic(model="claude-3-opus-20240229")
\}[MODEL_PROVIDER]

agent = create_agent(model=model, tools=tools)
```

### 2. 段階的なエラーハンドリング

```python
try:
    response = agent.invoke(\{"input": user_query\})
except TimeoutError:
    # タイムアウト時のフォールバック
    response = simple_fallback_response(user_query)
except Exception as e:
    logging.error(f"Agent error: \{e\}")
    response = error_response()
```

### 3. 適切なMiddlewareの組み合わせ

```python
# 開発環境
dev_middleware = [LoggingMiddleware()]

# 本番環境
prod_middleware = [
    PIIMiddleware(),  # セキュリティ
    AuditLogMiddleware(),  # コンプライアンス
    SummarizationMiddleware(),  # コスト最適化
    HumanInTheLoopMiddleware()  # リスク管理
]

middleware = prod_middleware if is_production else dev_middleware
```

## まとめ

LangChain 1.0は、AIエージェント開発における重要なマイルストーンです。主なポイントをまとめます：

### 主要な改善点

1. **create_agent**: 最速でエージェントを構築
2. **Middleware**: 細かな制御とカスタマイズ
3. **Structured Output**: コストとレイテンシの大幅削減
4. **安定性**: 2.0まで破壊的変更なし

### 移行の推奨

- **新規プロジェクト**: 迷わずLangChain 1.0を採用
- **既存プロジェクト**: 公式移行ガイドに従って段階的に移行
- **レガシーコード**: `langchain-classic`で当面は動作可能

### LangChain vs LangGraph

- **LangChain 1.0**: 標準的なエージェントを迅速に構築
- **LangGraph 1.0**: 複雑なワークフローと永続状態が必要な場合
- 両者はシームレスに連携可能

LangChain 1.0は、プロダクションレベルのAIエージェント開発を民主化する大きな一歩です。新しいAPIとMiddlewareシステムにより、開発速度とコントロールのバランスが大幅に改善されました。

まずは`create_agent`でシンプルに始めて、必要に応じてMiddlewareを追加し、複雑な要件が出てきたらLangGraphに移行する――このアプローチが、LangChain 1.0時代のベストプラクティスと言えるでしょう。

## 参考リンク

- [LangChain公式ドキュメント](https://python.langchain.com/docs/)
- [LangChain 1.0移行ガイド](https://docs.langchain.com/oss/python/migrate/langchain-v1)
- [LangGraph 1.0ドキュメント](https://langchain-ai.github.io/langgraph/)
- [LangSmith](https://smith.langchain.com/)
