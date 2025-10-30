---
slug: langchain-langsmith-guide
title: LangChainとLangSmithの違いを理解する：LLMアプリケーション開発と運用の完全ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

LLM（大規模言語モデル）を活用したアプリケーション開発において、**LangChain**と**LangSmith**は欠かせないツールです。しかし、この2つのツールの違いや使い分けが分からないという声をよく聞きます。この記事では、LangChainとLangSmithの違い、それぞれの機能、そして実践的な使い方を徹底解説します。

<!--truncate-->

## LangChainとLangSmithの基本的な違い

結論から言うと、**LangChainはLLMアプリケーションを「開発」するためのフレームワーク**であり、**LangSmithはそのアプリケーションを「運用・管理・評価」するためのプラットフォーム**です。

どちらも**LangChain社**が開発・提供しており、互いに補完し合う関係にあります。

### 比較表

| 項目 | LangChain | LangSmith |
|------|-----------|-----------|
| **提供元** | LangChain社 | LangChain社 |
| **目的** | LLMアプリケーションの開発 | LLMアプリケーションの運用・管理 |
| **種類** | オープンソースフレームワーク | SaaSプラットフォーム |
| **主な機能** | RAG、エージェント、チェーン構築 | デバッグ、テスト、評価、監視 |
| **対応言語** | Python、JavaScript/TypeScript | 言語非依存（API経由） |
| **利用料金** | 無料（OSS） | 無料枠あり、有料プランあり |
| **使用タイミング** | 開発時 | 開発時〜本番運用時 |

---

## LangChainとは何か

**LangChain**は、GPT-4、Claude、Geminiなどの大規模言語モデル（LLM）を活用したアプリケーションを効率的に開発するための**オープンソースフレームワーク**です。

公式サイト: https://www.langchain.com/

### LangChainの特徴

#### 1. 統一されたインターフェース

複数のLLMプロバイダー（OpenAI、Anthropic、Google、AWSなど）を同じコードで扱えます。プロバイダーを切り替える際も、設定を変更するだけでアプリケーションコードの変更は不要です。

#### 2. RAG（Retrieval Augmented Generation）の実装

LangChainを使えば、社内文書やナレッジベースを検索して回答を生成する「RAG」システムを簡単に構築できます。

**RAGの仕組み**:
1. ユーザーの質問に関連する文書を検索（Retrieval）
2. 検索結果をLLMに渡してコンテキストとして利用
3. 正確な回答を生成（Generation）

#### 3. エージェント機能

LLMが自律的に外部ツールを呼び出し、複雑なタスクを実行する「エージェント」を構築できます。

**エージェントの例**:
- Web検索を行って最新情報を取得
- APIを呼び出してデータを取得
- 計算機ツールを使って数値計算
- データベースからデータを抽出

#### 4. チェーン（Chain）による処理の連結

複数の処理ステップを連結し、複雑なワークフローを構築できます。

**チェーンの例**:
```
質問の受付 → 文書検索 → 要約 → 回答生成 → 出力
```

### LangChainの主なコンポーネント

LangChainは以下のコンポーネントで構成されています：

- **Models**: OpenAI、Anthropic、Googleなどのモデルとの統合
- **Prompts**: プロンプトテンプレートの管理
- **Chains**: 複数の処理を連結するワークフロー
- **Agents**: 自律的にツールを使用する機能
- **Memory**: 会話履歴の管理
- **Document Loaders**: PDF、CSV、Webページなどのデータ読み込み
- **Text Splitters**: 長文を分割する機能
- **Vector Stores**: ベクトルデータベースとの統合（FAISS、Pinecone、Chroma等）
- **Retrievers**: 情報検索機能

---

## LangSmithとは何か

**LangSmith**は、LangChainで構築したLLMアプリケーションを**デバッグ、テスト、評価、監視**するための統合プラットフォームです。LangChain社が提供するSaaSサービスとして利用できます。

公式サイト: https://smith.langchain.com/

### LangSmithの特徴

#### 1. トレーシング（追跡）機能

LLMアプリケーションの実行を**ステップごとに可視化**できます。どのプロンプトが送信され、どんな応答が返ってきたのか、処理時間はどれくらいかかったのかを詳細に確認できます。

**トレーシングで分かること**:
- 各ステップの入出力
- 処理時間（レイテンシ）
- トークン使用量
- エラー発生箇所
- チェーンやエージェントの実行フロー

#### 2. デバッグ支援

LLMアプリケーションのデバッグは難しいことで知られています。LangSmithを使えば、以下のような問題を簡単に特定できます：

- プロンプトが期待通りに構築されているか
- どのステップでエラーが発生したか
- なぜ意図しない結果が返されたか
- どの文書が検索されたか（RAGの場合）

#### 3. プロンプトの評価とテスト

複数のプロンプトバージョンを比較し、どれが最も良い結果を生成するかをテストできます。

**評価方法**:
- テストデータセットを作成
- 複数のプロンプトバージョンで実行
- 結果を比較して最適なバージョンを選択

#### 4. 本番環境の監視

本番環境で動作しているLLMアプリケーションの**パフォーマンスを監視**できます。

**監視できる指標**:
- リクエスト数
- 成功率・エラー率
- レイテンシ（応答時間）
- トークン消費量
- コスト

#### 5. データセット管理

テストや評価に使用するデータセットを管理し、継続的な品質改善をサポートします。

---

## LangChainとLangSmithの関係性

LangChainとLangSmithは、以下のように連携します：

### 開発フロー

```
1. LangChainでアプリケーションを開発
   ↓
2. LangSmithでトレーシングを有効化
   ↓
3. LangSmithで実行ログを確認しながらデバッグ
   ↓
4. LangSmithでプロンプトやチェーンを評価
   ↓
5. LangChainのコードを改善
   ↓
6. 本番環境にデプロイ
   ↓
7. LangSmithで本番環境を監視
```

### 具体例：RAGシステムの開発

**LangChainでの実装**:
```python
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# ドキュメントの読み込み
loader = TextLoader('company_docs.txt')
documents = loader.load()

# テキストの分割
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# ベクトルストアの作成
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(docs, embeddings)

# RAGチェーンの構築
llm = ChatOpenAI(model="gpt-4")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever()
)

# 質問に回答
result = qa_chain.run("製品の保証期間は何年ですか？")
print(result)
```

**LangSmithでの監視**:
```python
import os
from langsmith import Client

# LangSmithの設定
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"
os.environ["LANGCHAIN_PROJECT"] = "company-qa-bot"

# 上記のLangChainコードを実行すると、自動的にLangSmithにトレースが送信される
```

LangSmithのダッシュボードで以下を確認できます：

- どの文書が検索されたか
- LLMに送信されたプロンプトの内容
- 生成された回答
- 処理時間とトークン使用量

---

## LangChainの実践的な使い方

### インストール

```bash
pip install langchain langchain-openai
```

### 基本的なチェーンの作成

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain

# モデルの初期化
llm = ChatOpenAI(model="gpt-4", temperature=0.7)

# プロンプトテンプレートの作成
prompt = ChatPromptTemplate.from_messages([
    ("system", "あなたは親切なアシスタントです。"),
    ("user", "{question}")
])

# チェーンの構築
chain = LLMChain(llm=llm, prompt=prompt)

# 実行
result = chain.run(question="Python の特徴を3つ教えてください")
print(result)
```

### エージェントの作成

```python
from langchain.agents import load_tools, initialize_agent, AgentType
from langchain.chat_models import ChatOpenAI

# モデルの初期化
llm = ChatOpenAI(model="gpt-4", temperature=0)

# ツールの読み込み（検索、計算機など）
tools = load_tools(["serpapi", "llm-math"], llm=llm)

# エージェントの初期化
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 実行
result = agent.run("日本の人口は何人で、そのうち65歳以上は何パーセントですか？")
print(result)
```

---

## LangSmithの実践的な使い方

### セットアップ

1. LangSmithアカウントを作成: https://smith.langchain.com/
2. APIキーを取得
3. 環境変数を設定

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
export LANGCHAIN_API_KEY=your-api-key
export LANGCHAIN_PROJECT=my-project
```

### トレーシングの有効化

上記の環境変数を設定するだけで、LangChainアプリケーションの実行が自動的にLangSmithに記録されます。

### データセットの作成と評価

```python
from langsmith import Client

client = Client()

# データセットの作成
dataset = client.create_dataset(
    dataset_name="qa-test-set",
    description="質問応答システムのテストデータ"
)

# テストケースの追加
client.create_examples(
    dataset_id=dataset.id,
    inputs=[
        {"question": "製品の保証期間は？"},
        {"question": "返品ポリシーは？"},
        {"question": "営業時間は？"}
    ],
    outputs=[
        {"answer": "1年間です"},
        {"answer": "30日以内は無条件返品可能"},
        {"answer": "平日9:00-18:00"}
    ]
)
```

### プロンプトの評価

LangSmithのUIで以下の操作が可能です：

1. **Playground**: プロンプトを対話的にテスト
2. **Comparison**: 複数のモデルやプロンプトを比較
3. **Datasets**: テストデータセットで自動評価
4. **Annotate**: 人間による評価を記録

---

## LangChainとLangSmithを使うべきケース

### LangChainを使うべきケース

- **RAGシステムの構築**: 社内文書やナレッジベースを検索して回答するシステム
- **複雑なワークフロー**: 複数のLLM呼び出しや外部ツール連携が必要
- **マルチモデル対応**: 複数のLLMプロバイダーを切り替えたい
- **エージェントの実装**: LLMが自律的にツールを使用する仕組みが必要

### LangSmithを使うべきケース

- **デバッグ**: LLMアプリケーションが期待通りに動作しない
- **プロンプト最適化**: 複数のプロンプトバージョンを比較したい
- **品質評価**: テストデータセットで継続的に品質をチェック
- **本番監視**: 本番環境でのパフォーマンスとコストを追跡
- **チーム開発**: 複数の開発者で実行ログを共有し、問題を特定

---

## よくある質問

### Q1: LangSmithは必須ですか？

A: 必須ではありません。LangChainだけでもアプリケーションは構築できます。ただし、デバッグや品質改善を効率化したい場合、LangSmithは非常に有用です。

### Q2: LangSmithは無料で使えますか？

A: 無料枠が提供されています。小規模なプロジェクトや開発環境では無料枠で十分です。本番環境や大規模利用では有料プランが必要になります。

### Q3: LangChain以外のフレームワークでもLangSmithは使えますか？

A: はい、LangSmithはLangChain以外のLLMアプリケーションでも使用できます。SDKを使って手動でトレースを送信できます。

### Q4: LangChainとLlamaIndexの違いは？

A: どちらもLLMアプリケーション開発フレームワークですが、LlamaIndexは特にRAG（文書検索と生成）に特化しています。LangChainはより汎用的で、エージェントやチェーンなど幅広い機能を提供します。

### Q5: 日本語のドキュメントはありますか？

A: 公式の日本語ドキュメントは限定的ですが、日本のコミュニティによる解説記事やチュートリアルが多数公開されています。

---

## まとめ

LangChainとLangSmithは、LLMアプリケーション開発において強力な組み合わせです：

**LangChain**:
- LLMアプリケーション開発のフレームワーク
- RAG、エージェント、チェーンを簡単に構築
- Python、JavaScript/TypeScriptに対応
- オープンソースで無料

**LangSmith**:
- LLMアプリケーションの運用・管理プラットフォーム
- デバッグ、テスト、評価、監視を一元管理
- プロンプト最適化を支援
- 無料枠あり、本番利用は有料

**提供元**: 両方ともLangChain社が開発

**使い分け**:
- **開発**: LangChainでアプリケーションを構築
- **運用**: LangSmithでデバッグ・評価・監視

### 導入ステップ

1. **LangChainをインストール**: `pip install langchain`
2. **RAGやエージェントを実装**: LangChainのドキュメントを参照
3. **LangSmithアカウントを作成**: https://smith.langchain.com/
4. **トレーシングを有効化**: 環境変数を設定
5. **デバッグと改善**: LangSmithで実行ログを確認しながら最適化

LLMアプリケーションの開発と運用を成功させるために、LangChainとLangSmithを活用しましょう！
