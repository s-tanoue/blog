---
slug: langchain-rag-implementation-guide
title: LangChain で社内ドキュメント検索システムを構築する：RAG の完全実装ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - AI・LLM
---

社内ドキュメントやナレッジベースから正確な情報を検索し、自然言語で回答を生成するRAG（Retrieval-Augmented Generation）システムは、現代の企業にとって必須のツールとなっています。この記事では、LangChainを使って本格的なRAGシステムを構築する方法を、**ベクトルストア**、**チャンク戦略**、**プロンプト設計**の3つの重要な要素に焦点を当てて解説します。

<!--truncate-->

## RAGシステムとは

RAG（Retrieval-Augmented Generation）は、大規模言語モデル（LLM）の能力を拡張し、特定のドメイン知識や最新情報に基づいた回答を生成するための技術です。

### RAGの仕組み

```
1. ドキュメントの準備
   ↓
2. テキストをチャンクに分割
   ↓
3. ベクトル化（エンベディング）
   ↓
4. ベクトルストアに保存
   ↓
5. ユーザーの質問をベクトル化
   ↓
6. 関連ドキュメントを検索
   ↓
7. 検索結果をコンテキストとしてLLMに渡す
   ↓
8. 回答を生成
```

### RAGの利点

- **ハルシネーション（幻覚）の削減**: 信頼できるソースに基づいた回答
- **最新情報の提供**: 学習データの期限を超えた情報にアクセス
- **カスタマイズ可能**: 企業固有の知識ベースに対応
- **出典の明示**: どの文書から情報を取得したか追跡可能

---

## システムアーキテクチャ

今回構築するRAGシステムの全体像：

```
┌─────────────────────────────────────────────────────────┐
│  1. データ準備フェーズ                                    │
├─────────────────────────────────────────────────────────┤
│  ドキュメント → ローダー → チャンク分割 → エンベディング  │
│  (PDF/MD/TXT)   (Loaders)   (Splitters)   (Embeddings)  │
│                                    ↓                     │
│                            ベクトルストア                 │
│                            (FAISS/Chroma)                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  2. 検索・回答生成フェーズ                                │
├─────────────────────────────────────────────────────────┤
│  ユーザー質問 → エンベディング → 類似度検索              │
│       ↓                              ↓                  │
│   プロンプト ← 関連ドキュメント                          │
│       ↓                                                 │
│     LLM → 回答生成                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 環境のセットアップ

### 必要なパッケージのインストール

```bash
# LangChainのコアパッケージ
pip install langchain langchain-openai langchain-community

# ドキュメントローダー
pip install pypdf python-docx

# ベクトルストア
pip install faiss-cpu chromadb

# その他のユーティリティ
pip install tiktoken
```

### 環境変数の設定

```python
import os

# OpenAI APIキー
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

# オプション: LangSmithでトレーシングを有効化
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-api-key"
os.environ["LANGCHAIN_PROJECT"] = "rag-system"
```

---

## 1. ドキュメントのロードと準備

### 各種ドキュメントフォーマットの読み込み

```python
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    DirectoryLoader,
    UnstructuredMarkdownLoader
)

# テキストファイルの読み込み
def load_text_documents(file_path):
    loader = TextLoader(file_path, encoding='utf-8')
    return loader.load()

# PDFファイルの読み込み
def load_pdf_documents(file_path):
    loader = PyPDFLoader(file_path)
    return loader.load()

# ディレクトリ内の全Markdownファイルを読み込み
def load_markdown_directory(directory_path):
    loader = DirectoryLoader(
        directory_path,
        glob="**/*.md",
        loader_cls=UnstructuredMarkdownLoader
    )
    return loader.load()

# 実際の使用例
documents = []
documents.extend(load_markdown_directory("./knowledge_base"))
documents.extend(load_pdf_documents("./manuals/user_guide.pdf"))

print(f"読み込んだドキュメント数: {len(documents)}")
```

### ドキュメントのメタデータ管理

メタデータは検索結果のフィルタリングや出典の特定に重要です：

```python
from langchain.schema import Document

# メタデータを持つドキュメントの作成
doc = Document(
    page_content="製品の保証期間は購入日から1年間です。",
    metadata={
        "source": "user_manual.pdf",
        "page": 15,
        "category": "warranty",
        "last_updated": "2024-01-15"
    }
)
```

---

## 2. チャンク戦略：テキストの分割

チャンク戦略はRAGシステムの品質に大きく影響します。適切なチャンクサイズと分割方法を選ぶことが重要です。

### チャンクサイズの選択基準

| チャンクサイズ | 用途 | メリット | デメリット |
|---------------|------|---------|-----------|
| 100-200トークン | 短い定義、FAQ | 検索精度が高い | 文脈が不足しがち |
| 500-1000トークン | 一般的な文書 | バランスが良い | 標準的な選択 |
| 1500-2000トークン | 技術文書、レポート | 文脈が豊富 | 検索精度が下がる |

### CharacterTextSplitter：シンプルな分割

```python
from langchain.text_splitter import CharacterTextSplitter

# 基本的な文字数ベースの分割
text_splitter = CharacterTextSplitter(
    separator="\n\n",           # 段落で分割
    chunk_size=1000,            # チャンクサイズ（文字数）
    chunk_overlap=200,          # オーバーラップ（文字数）
    length_function=len,
)

texts = text_splitter.split_documents(documents)
print(f"分割後のチャンク数: {len(texts)}")
```

### RecursiveCharacterTextSplitter：推奨される方法

階層的に区切り文字を試みるため、より自然な分割が可能です：

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 階層的に分割を試みる
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=[
        "\n\n",      # まず段落で分割を試みる
        "\n",        # 次に行で分割
        " ",         # それでもダメなら単語で分割
        ""           # 最後の手段として文字で分割
    ]
)

texts = text_splitter.split_documents(documents)
```

**推奨設定（日本語の場合）**:
```python
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,           # 日本語の場合、文字数ベース
    chunk_overlap=200,         # 20%のオーバーラップ
    separators=[
        "\n\n",
        "\n",
        "。",                   # 日本語の句点
        "、",                   # 日本語の読点
        " ",
        ""
    ]
)
```

### TokenTextSplitter：トークンベースの分割

LLMのコンテキスト長を正確に制御したい場合に使用：

```python
from langchain.text_splitter import TokenTextSplitter

# トークン数ベースで分割
text_splitter = TokenTextSplitter(
    chunk_size=500,            # トークン数
    chunk_overlap=50
)

texts = text_splitter.split_documents(documents)
```

### チャンクオーバーラップの重要性

オーバーラップがないと、重要な情報がチャンクの境界で分断される可能性があります：

```
オーバーラップなし:
Chunk 1: "...製品の保証期間は"
Chunk 2: "購入日から1年間です..."
→ どちらのチャンクも不完全

オーバーラップあり:
Chunk 1: "...製品の保証期間は購入日から1年間です..."
Chunk 2: "...保証期間は購入日から1年間です。修理依頼は..."
→ 両方のチャンクで完全な情報が得られる
```

**推奨オーバーラップ率**: チャンクサイズの10-20%

### セマンティックチャンキング（高度な手法）

意味的なまとまりでチャンクを分割する手法：

```python
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

# セマンティックな境界で分割
semantic_splitter = SemanticChunker(
    OpenAIEmbeddings(),
    breakpoint_threshold_type="percentile",  # 分割の閾値タイプ
    breakpoint_threshold_amount=95           # 意味的な変化の閾値
)

texts = semantic_splitter.split_documents(documents)
```

---

## 3. ベクトルストア：検索エンジンの選択

### ベクトルストアの比較

| ベクトルストア | 種類 | 用途 | メリット | デメリット |
|--------------|------|------|---------|-----------|
| **FAISS** | ローカル | 開発、小〜中規模 | 高速、無料、簡単 | スケールに限界 |
| **Chroma** | ローカル/サーバー | 開発、中規模 | メタデータ検索が強力 | 大規模には不向き |
| **Pinecone** | クラウド | 本番環境、大規模 | スケーラブル、マネージド | 有料 |
| **Weaviate** | オンプレ/クラウド | エンタープライズ | 高機能、柔軟 | セットアップが複雑 |

### FAISS：ローカル開発に最適

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

# エンベディングモデルの初期化
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small"  # コスパの良いモデル
)

# ベクトルストアの作成
vectorstore = FAISS.from_documents(
    documents=texts,
    embedding=embeddings
)

# ローカルに保存
vectorstore.save_local("./faiss_index")

# 後で読み込む
vectorstore = FAISS.load_local(
    "./faiss_index",
    embeddings,
    allow_dangerous_deserialization=True  # 信頼できるソースの場合のみ
)
```

### Chroma：永続化とメタデータ検索に強い

```python
from langchain_community.vectorstores import Chroma

# Chromaベクトルストアの作成
vectorstore = Chroma.from_documents(
    documents=texts,
    embedding=embeddings,
    persist_directory="./chroma_db"  # 永続化ディレクトリ
)

# メタデータでフィルタリング
results = vectorstore.similarity_search(
    "保証期間について教えてください",
    k=4,
    filter={"category": "warranty"}  # メタデータフィルタ
)
```

### エンベディングモデルの選択

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings

# OpenAI Embeddings（推奨）
embeddings_openai = OpenAIEmbeddings(
    model="text-embedding-3-small",  # 小規模: 速度重視
    # model="text-embedding-3-large"  # 大規模: 精度重視
)

# ローカルモデル（無料、日本語対応）
embeddings_local = HuggingFaceEmbeddings(
    model_name="intfloat/multilingual-e5-large",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)
```

**エンベディングモデルの比較**:

| モデル | 次元数 | 用途 | コスト |
|--------|-------|------|--------|
| text-embedding-3-small | 1536 | 一般的な用途 | $0.02/1M tokens |
| text-embedding-3-large | 3072 | 高精度が必要 | $0.13/1M tokens |
| multilingual-e5-large | 1024 | ローカル、日本語 | 無料（要GPU） |

### 検索戦略の選択

#### 1. Similarity Search（類似度検索）

```python
# 最も類似度の高いk個のドキュメントを取得
results = vectorstore.similarity_search(
    query="製品の保証期間は？",
    k=4
)

for doc in results:
    print(f"Score: {doc.metadata.get('score', 'N/A')}")
    print(f"Content: {doc.page_content}\n")
```

#### 2. Similarity Search with Score（スコア付き）

```python
# スコア付きで検索（類似度を確認できる）
results_with_scores = vectorstore.similarity_search_with_score(
    query="製品の保証期間は？",
    k=4
)

for doc, score in results_with_scores:
    print(f"類似度スコア: {score:.3f}")
    print(f"内容: {doc.page_content[:100]}...\n")
```

#### 3. MMR（Maximal Marginal Relevance）

多様性を考慮した検索：

```python
# MMR: 類似度と多様性のバランス
results = vectorstore.max_marginal_relevance_search(
    query="製品の保証期間は？",
    k=4,
    fetch_k=20,              # まず20個の候補を取得
    lambda_mult=0.5          # 多様性の重み（0=多様性重視、1=類似度重視）
)
```

#### 4. 類似度閾値による絞り込み

```python
# 一定以上の類似度のドキュメントのみ取得
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={
        "score_threshold": 0.8,  # 類似度の閾値
        "k": 4
    }
)

results = retriever.get_relevant_documents("製品の保証期間は？")
```

---

## 4. プロンプト設計：RAGの精度を高める

プロンプト設計はRAGシステムの品質に直接影響します。

### 基本的なRAGプロンプト

```python
from langchain.prompts import ChatPromptTemplate

# RAG用の基本プロンプトテンプレート
rag_template = """あなたは社内ドキュメント検索システムのアシスタントです。
以下のコンテキストを使用して、ユーザーの質問に正確に答えてください。

重要なルール:
1. コンテキストに基づいてのみ回答してください
2. コンテキストに情報がない場合は「提供された情報では回答できません」と答えてください
3. 推測や一般知識で回答しないでください
4. 回答には出典（ドキュメント名）を明記してください

コンテキスト:
{context}

質問: {question}

回答:"""

prompt = ChatPromptTemplate.from_template(rag_template)
```

### 出典引用を含むプロンプト

```python
rag_template_with_sources = """あなたは社内ドキュメント検索システムのアシスタントです。
以下のコンテキストを使用して、ユーザーの質問に正確に答えてください。

コンテキスト:
{context}

質問: {question}

回答する際は、以下の形式に従ってください:

【回答】
ここに質問への回答を記述

【出典】
- ドキュメント名1（該当箇所）
- ドキュメント名2（該当箇所）

コンテキストに情報がない場合は、「提供された情報では回答できません」と答えてください。
"""

prompt = ChatPromptTemplate.from_template(rag_template_with_sources)
```

### Few-shotプロンプト

良い回答の例を示すことで、品質を向上させます：

```python
few_shot_template = """あなたは社内ドキュメント検索システムのアシスタントです。
以下の例を参考に、コンテキストに基づいて質問に答えてください。

【例1】
コンテキスト: 年次有給休暇は、入社日から6ヶ月経過後に10日間付与されます。
質問: 有給休暇はいつもらえますか？
回答: 入社日から6ヶ月経過後に10日間の年次有給休暇が付与されます。
出典: 就業規則第15条

【例2】
コンテキスト: プロジェクトAの納期は2024年3月31日です。
質問: システムのセキュリティ要件は？
回答: 提供された情報では、セキュリティ要件については回答できません。

---

コンテキスト:
{context}

質問: {question}

回答:"""

prompt = ChatPromptTemplate.from_template(few_shot_template)
```

### 段階的推論を促すプロンプト（Chain-of-Thought）

```python
cot_template = """あなたは社内ドキュメント検索システムのアシスタントです。

以下のステップで回答を構築してください:

1. まず、コンテキストから質問に関連する情報を特定
2. その情報を整理して論理的に組み立てる
3. 最終的な回答を生成

コンテキスト:
{context}

質問: {question}

【ステップ1: 関連情報の特定】
（ここにコンテキストから抽出した関連情報を記述）

【ステップ2: 情報の整理】
（ここに情報を論理的に整理）

【ステップ3: 最終回答】
（ここに最終的な回答）

【出典】
（参照したドキュメント）
"""

prompt = ChatPromptTemplate.from_template(cot_template)
```

### 質問の曖昧さを解消するプロンプト

```python
clarification_template = """あなたは社内ドキュメント検索システムのアシスタントです。

ユーザーの質問が曖昧な場合は、明確化のための質問を返してください。
質問が明確な場合は、コンテキストに基づいて回答してください。

コンテキスト:
{context}

質問: {question}

質問が曖昧な場合の対応例:
- 「製品」と言及されているが、複数の製品がある → どの製品について知りたいか確認
- 時期が不明確 → いつの時点の情報が必要か確認
- 複数の解釈が可能 → 具体的に何を知りたいか確認

回答:"""

prompt = ChatPromptTemplate.from_template(clarification_template)
```

---

## 5. 完全な実装：エンドツーエンド

すべてを統合したRAGシステムの完全実装：

```python
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import RetrievalQA
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
import os

class DocumentSearchSystem:
    """社内ドキュメント検索システム"""

    def __init__(self, documents_path, index_path="./faiss_index"):
        self.documents_path = documents_path
        self.index_path = index_path
        self.vectorstore = None
        self.qa_chain = None

        # エンベディングモデルの初期化
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small"
        )

        # LLMの初期化
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0,  # 再現性のため0に設定
        )

    def load_documents(self):
        """ドキュメントの読み込み"""
        print("📄 ドキュメントを読み込んでいます...")

        loader = DirectoryLoader(
            self.documents_path,
            glob="**/*.md",
            loader_cls=TextLoader,
            loader_kwargs={'encoding': 'utf-8'}
        )
        documents = loader.load()

        print(f"✅ {len(documents)}件のドキュメントを読み込みました")
        return documents

    def split_documents(self, documents):
        """ドキュメントのチャンク分割"""
        print("✂️  ドキュメントを分割しています...")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", "。", "、", " ", ""]
        )

        texts = text_splitter.split_documents(documents)
        print(f"✅ {len(texts)}個のチャンクに分割しました")
        return texts

    def create_vectorstore(self, texts, force_rebuild=False):
        """ベクトルストアの作成"""
        if os.path.exists(self.index_path) and not force_rebuild:
            print("📦 既存のインデックスを読み込んでいます...")
            self.vectorstore = FAISS.load_local(
                self.index_path,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            print("✅ インデックスを読み込みました")
        else:
            print("🔨 ベクトルストアを作成しています...")
            self.vectorstore = FAISS.from_documents(
                texts,
                self.embeddings
            )
            self.vectorstore.save_local(self.index_path)
            print("✅ ベクトルストアを作成・保存しました")

        return self.vectorstore

    def setup_qa_chain(self):
        """QAチェーンのセットアップ"""
        print("⚙️  QAチェーンをセットアップしています...")

        # プロンプトテンプレートの定義
        template = """あなたは社内ドキュメント検索システムのアシスタントです。
以下のコンテキストを使用して、ユーザーの質問に正確に答えてください。

重要なルール:
1. コンテキストに基づいてのみ回答してください
2. コンテキストに情報がない場合は「提供された情報では回答できません」と明確に答えてください
3. 推測や一般知識で回答しないでください
4. 回答には必ず出典（ドキュメント名やページ）を明記してください
5. 回答は簡潔かつ正確に

コンテキスト:
{context}

質問: {input}

回答:"""

        prompt = ChatPromptTemplate.from_template(template)

        # Retrieverの設定（MMRで多様性を考慮）
        retriever = self.vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 4,           # 取得するドキュメント数
                "fetch_k": 20,    # MMR用の候補数
                "lambda_mult": 0.7  # 類似度vs多様性のバランス
            }
        )

        # ドキュメント結合チェーンの作成
        document_chain = create_stuff_documents_chain(
            self.llm,
            prompt
        )

        # Retrievalチェーンの作成
        self.qa_chain = create_retrieval_chain(
            retriever,
            document_chain
        )

        print("✅ QAチェーンのセットアップが完了しました")
        return self.qa_chain

    def initialize(self, force_rebuild=False):
        """システムの初期化"""
        documents = self.load_documents()
        texts = self.split_documents(documents)
        self.create_vectorstore(texts, force_rebuild)
        self.setup_qa_chain()
        print("🚀 システムの初期化が完了しました\n")

    def query(self, question):
        """質問に対する回答を生成"""
        if not self.qa_chain:
            raise ValueError("システムが初期化されていません。initialize()を実行してください。")

        print(f"🔍 質問: {question}")
        print("💭 回答を生成しています...\n")

        result = self.qa_chain.invoke({"input": question})

        print("📝 回答:")
        print(result['answer'])
        print("\n📚 参照したドキュメント:")
        for i, doc in enumerate(result['context'], 1):
            source = doc.metadata.get('source', '不明')
            print(f"  {i}. {source}")
            print(f"     内容: {doc.page_content[:100]}...")
        print()

        return result

    def search_similar_documents(self, query, k=5):
        """類似ドキュメントの検索"""
        if not self.vectorstore:
            raise ValueError("ベクトルストアが作成されていません。")

        docs_with_scores = self.vectorstore.similarity_search_with_score(
            query, k=k
        )

        print(f"🔍 「{query}」に関連するドキュメント:\n")
        for i, (doc, score) in enumerate(docs_with_scores, 1):
            print(f"{i}. スコア: {score:.3f}")
            print(f"   ソース: {doc.metadata.get('source', '不明')}")
            print(f"   内容: {doc.page_content[:150]}...")
            print()

        return docs_with_scores


# ===========================
# 使用例
# ===========================

if __name__ == "__main__":
    # システムの初期化
    system = DocumentSearchSystem(
        documents_path="./knowledge_base",
        index_path="./faiss_index"
    )

    # 初回実行時はforce_rebuild=Trueを指定
    system.initialize(force_rebuild=False)

    # 質問応答
    questions = [
        "製品の保証期間について教えてください",
        "年次有給休暇は何日付与されますか？",
        "セキュリティポリシーの主な内容は何ですか？"
    ]

    for question in questions:
        result = system.query(question)
        print("-" * 80)
```

---

## 6. パフォーマンス最適化

### チャンクサイズのチューニング

```python
from langchain.evaluation import load_evaluator
from langchain_openai import ChatOpenAI

def evaluate_chunk_size(documents, chunk_sizes=[500, 1000, 1500, 2000]):
    """異なるチャンクサイズでの性能評価"""
    results = {}

    test_questions = [
        "製品の保証期間は？",
        "返品ポリシーについて教えてください",
        # ... more test questions
    ]

    for chunk_size in chunk_sizes:
        print(f"\n📊 チャンクサイズ: {chunk_size}")

        # Text Splitterの作成
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=int(chunk_size * 0.2)
        )

        texts = text_splitter.split_documents(documents)

        # ベクトルストアの作成
        vectorstore = FAISS.from_documents(texts, embeddings)

        # 検索性能の評価
        # ... evaluation logic

        results[chunk_size] = {
            'num_chunks': len(texts),
            'avg_chunk_length': sum(len(t.page_content) for t in texts) / len(texts),
            # ... other metrics
        }

    return results
```

### 検索結果の再ランキング

検索結果の品質を向上させるため、再ランキングを実施：

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

def create_reranking_retriever(vectorstore, llm):
    """再ランキングを行うRetrieverを作成"""

    # ベースのRetriever
    base_retriever = vectorstore.as_retriever(
        search_kwargs={"k": 10}  # 多めに取得
    )

    # LLMを使った圧縮・再ランキング
    compressor = LLMChainExtractor.from_llm(llm)

    compression_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=base_retriever
    )

    return compression_retriever

# 使用例
reranking_retriever = create_reranking_retriever(vectorstore, llm)
docs = reranking_retriever.get_relevant_documents("製品の保証期間は？")
```

### キャッシングの実装

```python
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

# インメモリキャッシュの有効化
set_llm_cache(InMemoryCache())

# これにより、同じ質問に対してはキャッシュから結果を返す
result1 = qa_chain.invoke({"input": "製品の保証期間は？"})  # LLM呼び出し
result2 = qa_chain.invoke({"input": "製品の保証期間は？"})  # キャッシュから取得
```

### バッチ処理による効率化

```python
async def batch_query(system, questions):
    """複数の質問を並列処理"""
    import asyncio

    async def query_async(question):
        return await system.qa_chain.ainvoke({"input": question})

    tasks = [query_async(q) for q in questions]
    results = await asyncio.gather(*tasks)

    return results

# 使用例
import asyncio

questions = [
    "製品の保証期間は？",
    "返品ポリシーは？",
    "営業時間は？"
]

results = asyncio.run(batch_query(system, questions))
```

---

## 7. 実運用のベストプラクティス

### エラーハンドリング

```python
def safe_query(system, question, max_retries=3):
    """エラーハンドリング付きの質問処理"""
    import time

    for attempt in range(max_retries):
        try:
            result = system.query(question)
            return result
        except Exception as e:
            print(f"❌ エラーが発生しました（試行 {attempt + 1}/{max_retries}）: {e}")

            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 指数バックオフ
                print(f"⏳ {wait_time}秒待機してリトライします...")
                time.sleep(wait_time)
            else:
                print("❌ 最大リトライ回数に達しました")
                return {
                    'answer': 'エラーが発生したため回答を生成できませんでした。',
                    'context': [],
                    'error': str(e)
                }
```

### 回答品質の監視

```python
from langsmith import Client

def log_query_to_langsmith(question, answer, context, feedback=None):
    """LangSmithに質問と回答をログ"""
    client = Client()

    # フィードバックの記録
    run_id = client.create_run(
        name="qa-query",
        inputs={"question": question},
        outputs={"answer": answer, "context": context},
        project_name="rag-system"
    )

    if feedback:
        client.create_feedback(
            run_id=run_id,
            key="user-rating",
            score=feedback['score'],
            comment=feedback.get('comment', '')
        )
```

### ドキュメントの増分更新

```python
def update_vectorstore(system, new_documents):
    """ベクトルストアに新しいドキュメントを追加"""

    # 新しいドキュメントの分割
    texts = system.split_documents(new_documents)

    # 既存のベクトルストアに追加
    system.vectorstore.add_documents(texts)

    # 永続化
    system.vectorstore.save_local(system.index_path)

    print(f"✅ {len(texts)}個の新しいチャンクを追加しました")
```

### メタデータフィルタの活用

```python
# カテゴリでフィルタリング
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 4,
        "filter": {"category": "warranty"}  # 保証関連のみ
    }
)

# 日付でフィルタリング
from datetime import datetime, timedelta

recent_date = (datetime.now() - timedelta(days=30)).isoformat()
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 4,
        "filter": {
            "last_updated": {"$gte": recent_date}  # 30日以内の文書のみ
        }
    }
)
```

---

## 8. トラブルシューティング

### 回答が不正確な場合

**原因と対策**:

1. **チャンクサイズが不適切**
   - 小さすぎる → 文脈が不足
   - 大きすぎる → ノイズが多い
   - 対策: chunk_sizeを500-1500の範囲で調整

2. **検索結果が関連性が低い**
   - エンベディングモデルを変更（text-embedding-3-large）
   - MMRでkとfetch_kを調整
   - メタデータフィルタを活用

3. **プロンプトが不適切**
   - Few-shotの例を追加
   - 回答形式を明確に指定
   - 「コンテキストに基づいてのみ」を強調

### メモリ使用量が多い場合

```python
# FAISSインデックスを最適化
vectorstore.index.add_with_ids()  # IDを使った効率的な追加

# または、より小さいエンベディングモデルを使用
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # largeの代わりにsmall
    dimensions=512  # 次元数を削減
)
```

### 応答が遅い場合

1. **キャッシングの有効化**: 上記のキャッシング実装を参照
2. **検索結果の数を削減**: kを4以下に設定
3. **より小さいLLMを使用**: gpt-4の代わりにgpt-3.5-turbo
4. **並列処理の実装**: batch_query関数を使用

---

## まとめ

この記事では、LangChainを使った社内ドキュメント検索システム（RAG）の構築方法を、実装の詳細まで踏み込んで解説しました。

### 重要なポイント

**チャンク戦略**:
- RecursiveCharacterTextSplitterを使用
- chunk_size=1000、chunk_overlap=200が標準的
- 日本語では句点（。）を区切り文字に追加

**ベクトルストア**:
- 開発/小規模: FAISS
- 本番/大規模: Pinecone
- text-embedding-3-smallがコスパ良好

**プロンプト設計**:
- 「コンテキストに基づいてのみ回答」を明記
- 出典の引用を必須化
- Few-shotで良い回答例を提示

**パフォーマンス**:
- キャッシングを有効化
- MMRで検索品質を向上
- LangSmithで継続的な品質監視

### 次のステップ

1. **エージェント機能の追加**: 複数のツールを組み合わせた高度な検索
2. **マルチモーダル対応**: 画像や表を含むドキュメントの処理
3. **ハイブリッド検索**: ベクトル検索とキーワード検索の組み合わせ
4. **ファインチューニング**: 特定ドメインに最適化したエンベディングモデル

RAGシステムの品質は、データの品質、チャンク戦略、検索アルゴリズム、プロンプト設計の組み合わせで決まります。この記事で紹介したベストプラクティスを基に、自社のユースケースに最適化していきましょう！

---

## 参考リンク

- [LangChain公式ドキュメント](https://python.langchain.com/)
- [LangChain RAGチュートリアル](https://python.langchain.com/docs/use_cases/question_answering/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [FAISS Documentation](https://github.com/facebookresearch/faiss)
- [LangSmith](https://smith.langchain.com/)
