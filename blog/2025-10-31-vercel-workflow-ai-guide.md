---
slug: vercel-workflow-ai-guide
title: Vercel Workflowで始めるAIアプリケーション開発：マルチエージェントとRAGの完全実装ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - AI・LLM
---

AIアプリケーションの開発において、**耐久性（Durability）**、**信頼性（Reliability）**、**可観測性（Observability）**は非常に重要です。Vercelが2025年10月に公開ベータとしてリリースした**Workflow Development Kit（WDK）**は、これらの課題を解決する革新的なフレームワークです。この記事では、Vercel Workflowの基本から、マルチエージェントとRAGの実装方法まで、実践的に解説します。

<!--truncate-->

## Vercel Workflowとは

**Vercel Workflow**（正式名称：Workflow Development Kit）は、長時間実行されるプロセスやAIエージェントを構築するための**オープンソースのTypeScriptフレームワーク**です。2025年10月23日に公開ベータとしてリリースされました。

公式サイト: https://useworkflow.dev
GitHubリポジトリ: https://github.com/vercel/workflow

### Vercel Workflowの特徴

#### 1. 耐久性（Durability）

通常のJavaScript関数は、サーバーの再起動やデプロイで処理が中断されますが、Workflow DevKitは**処理の中断と再開を自動的に管理**します。

```
通常の関数:
サーバー起動 → 処理開始 → デプロイ発生 → 処理中断 → ❌ データ損失

Workflow:
サーバー起動 → 処理開始 → デプロイ発生 → 処理中断 → 再起動 → ✅ 処理再開
```

#### 2. 信頼性（Reliability）

失敗したオペレーションに対して**自動的にリトライ**を実行します。ネットワークエラーやAPI制限など、一時的な問題を自動的に処理します。

#### 3. 可観測性（Observability）

ワークフローの実行状態を**リアルタイムで追跡**できます。どのステップで何が起きているのか、エラーが発生した場所を簡単に特定できます。

#### 4. プラットフォーム非依存

Vercel以外のプラットフォームでも動作します：
- AWS Lambda
- Google Cloud Functions
- Azure Functions
- 独自のNode.jsサーバー

---

## なぜWorkflow DevKitが必要なのか

### 従来の課題

AIアプリケーションやバックグラウンドジョブを構築する際、以下のような課題がありました：

**課題1: 長時間処理の中断**
```typescript
// 従来の実装（問題あり）
async function processDocuments(docs: Document[]) {
  for (const doc of docs) {
    await embedDocument(doc);  // サーバー再起動で中断される
    await saveToVectorDB(doc);
  }
}
```

**課題2: リトライロジックの実装**
```typescript
// 手動でリトライを実装する必要があった
async function callAPIWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await api.call(data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

**課題3: 実行状態の追跡**

どこで処理が止まったのか、なぜ失敗したのかを追跡するのが困難でした。

### Workflow DevKitによる解決

```typescript
import { step, workflow } from "@upstash/workflow";

// Workflow DevKitを使った実装（自動的に耐久性を持つ）
export const processDocuments = workflow(
  "process-documents",
  async (docs: Document[]) => {
    for (const doc of docs) {
      // stepでラップすることで自動的にチェックポイントが作られる
      await step.run("embed-document", async () => {
        return await embedDocument(doc);
      });

      await step.run("save-to-vectordb", async () => {
        return await saveToVectorDB(doc);
      });
    }
  }
);
```

**自動的に以下が提供される**:
- ✅ 各ステップ後に実行状態を保存
- ✅ 失敗時の自動リトライ
- ✅ 実行ログの自動記録
- ✅ サーバー再起動後の処理再開

---

## セットアップとインストール

### 前提条件

- Node.js 18以上
- TypeScript（推奨）

### インストール

```bash
# プロジェクトの作成
npm create next-app@latest my-workflow-app
cd my-workflow-app

# Workflow DevKitのインストール
npm install @upstash/workflow

# Upstash QStash（ワークフローのバックエンド）
# 無料枠: 500リクエスト/日
```

### Upstash QStashのセットアップ

1. [Upstash Console](https://console.upstash.com/)にアクセス
2. QStashプロジェクトを作成
3. 以下の環境変数を取得：
   - `QSTASH_TOKEN`
   - `QSTASH_CURRENT_SIGNING_KEY`
   - `QSTASH_NEXT_SIGNING_KEY`

### 環境変数の設定

`.env.local`ファイルを作成：

```bash
# Upstash QStash
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key

# Vercel AI SDK
OPENAI_API_KEY=your_openai_api_key

# アプリケーションURL（本番環境）
UPSTASH_WORKFLOW_URL=https://your-app.vercel.app
```

---

## 基本的な使い方

### 1. シンプルなワークフローの作成

```typescript
// app/api/hello-workflow/route.ts
import { serve } from "@upstash/workflow/nextjs";

export const { POST } = serve(async (context) => {
  // ステップ1: データを取得
  const data = await context.run("fetch-data", async () => {
    console.log("Fetching data...");
    return { message: "Hello from Workflow!" };
  });

  // ステップ2: データを処理
  const processed = await context.run("process-data", async () => {
    console.log("Processing:", data.message);
    return data.message.toUpperCase();
  });

  // ステップ3: 結果を保存
  await context.run("save-result", async () => {
    console.log("Saving:", processed);
    // データベースへの保存処理など
  });

  return processed;
});
```

### 2. ワークフローの実行

```typescript
// クライアントサイドまたは別のAPIから実行
const response = await fetch("/api/hello-workflow", {
  method: "POST",
});

const result = await response.json();
console.log(result);
```

### 3. エラーハンドリングとリトライ

```typescript
import { serve } from "@upstash/workflow/nextjs";

export const { POST } = serve(async (context) => {
  // 自動リトライ（デフォルト: 3回）
  const data = await context.run("fetch-with-retry", async () => {
    const response = await fetch("https://api.example.com/data");
    if (!response.ok) {
      throw new Error("API request failed");
    }
    return response.json();
  });

  // カスタムリトライ設定
  await context.run(
    "custom-retry",
    async () => {
      // リスクの高い処理
      return await riskyOperation();
    },
    {
      retries: 5, // 最大5回リトライ
    }
  );

  return data;
});
```

### 4. スリープ（遅延実行）

```typescript
export const { POST } = serve(async (context) => {
  console.log("Step 1: Start");

  // 10秒待機
  await context.sleep("wait-10-seconds", 10);

  console.log("Step 2: After 10 seconds");

  // さらに1時間待機
  await context.sleep("wait-1-hour", 60 * 60);

  console.log("Step 3: After 1 hour");

  return "Completed!";
});
```

---

## マルチエージェントの実装

マルチエージェントシステムは、複数のAIエージェントが協調して複雑なタスクを実行する仕組みです。Workflow DevKitとVercel AI SDK 6を組み合わせることで、簡単に実装できます。

### マルチエージェントのアーキテクチャパターン

#### パターン1: 順次実行（Sequential）

エージェントが順番にタスクを実行します。

```
ユーザー → Agent1 → Agent2 → Agent3 → 結果
```

#### パターン2: 並列実行（Parallel）

複数のエージェントが同時にタスクを実行します。

```
        ┌─ Agent1 ─┐
ユーザー ┤─ Agent2 ─┤→ 結果統合 → 結果
        └─ Agent3 ─┘
```

#### パターン3: ルーティング（Routing）

コーディネーターエージェントがタスクを適切なエージェントに振り分けます。

```
ユーザー → Coordinator → Agent1/Agent2/Agent3 → 結果
```

### 実装例1: リサーチ＆ライティングシステム

```typescript
// app/api/research-writer/route.ts
import { serve } from "@upstash/workflow/nextjs";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// エージェント1: リサーチエージェント
async function researchAgent(topic: string) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system: `あなたは優秀なリサーチャーです。
与えられたトピックについて、重要な情報を箇条書きで調査してください。`,
    prompt: `トピック: ${topic}`,
  });

  return text;
}

// エージェント2: ライティングエージェント
async function writerAgent(research: string, topic: string) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system: `あなたは優秀なライターです。
リサーチ結果を基に、読みやすい記事を作成してください。`,
    prompt: `
トピック: ${topic}
リサーチ結果:
${research}

上記を基に記事を作成してください。`,
  });

  return text;
}

// エージェント3: 校正エージェント
async function editorAgent(article: string) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system: `あなたは優秀な編集者です。
記事の文法、構成、明確さをチェックして改善してください。`,
    prompt: `
以下の記事を校正してください:
${article}`,
  });

  return text;
}

// マルチエージェントワークフロー
export const { POST } = serve<{ topic: string }>(async (context) => {
  const { topic } = context.requestPayload;

  // ステップ1: リサーチ
  const research = await context.run("research-agent", async () => {
    console.log("🔍 リサーチエージェントが調査中...");
    return await researchAgent(topic);
  });

  // ステップ2: ライティング
  const draft = await context.run("writer-agent", async () => {
    console.log("✍️ ライティングエージェントが執筆中...");
    return await writerAgent(research, topic);
  });

  // ステップ3: 校正
  const final = await context.run("editor-agent", async () => {
    console.log("📝 校正エージェントがチェック中...");
    return await editorAgent(draft);
  });

  return {
    topic,
    research,
    draft,
    finalArticle: final,
  };
});
```

### 実装例2: 並列エージェント（データ分析）

```typescript
// app/api/parallel-analysis/route.ts
import { serve } from "@upstash/workflow/nextjs";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export const { POST } = serve<{ data: string }>(async (context) => {
  const { data } = context.requestPayload;

  // 3つのエージェントを並列実行
  const [sentimentAnalysis, keywordExtraction, summaryGeneration] =
    await Promise.all([
      // エージェント1: 感情分析
      context.run("sentiment-agent", async () => {
        const { text } = await generateText({
          model: openai("gpt-4-turbo"),
          system:
            "データの感情（ポジティブ/ネガティブ/ニュートラル）を分析してください。",
          prompt: data,
        });
        return text;
      }),

      // エージェント2: キーワード抽出
      context.run("keyword-agent", async () => {
        const { text } = await generateText({
          model: openai("gpt-4-turbo"),
          system: "重要なキーワードを10個抽出してください。",
          prompt: data,
        });
        return text;
      }),

      // エージェント3: 要約生成
      context.run("summary-agent", async () => {
        const { text } = await generateText({
          model: openai("gpt-4-turbo"),
          system: "データを3文で要約してください。",
          prompt: data,
        });
        return text;
      }),
    ]);

  // ステップ4: 結果を統合
  const finalReport = await context.run("aggregator-agent", async () => {
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      system: "分析結果を統合して、包括的なレポートを作成してください。",
      prompt: `
感情分析: ${sentimentAnalysis}
キーワード: ${keywordExtraction}
要約: ${summaryGeneration}

上記を統合したレポートを作成してください。`,
    });
    return text;
  });

  return {
    sentimentAnalysis,
    keywordExtraction,
    summaryGeneration,
    finalReport,
  };
});
```

### 実装例3: ルーティングエージェント（カスタマーサポート）

```typescript
// app/api/customer-support/route.ts
import { serve } from "@upstash/workflow/nextjs";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export const { POST } = serve<{ question: string }>(async (context) => {
  const { question } = context.requestPayload;

  // ステップ1: コーディネーターが質問を分類
  const category = await context.run("coordinator-agent", async () => {
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      system: `質問を以下のカテゴリに分類してください:
- billing: 請求・支払いに関する質問
- technical: 技術的な問題
- general: 一般的な質問

カテゴリ名のみを返してください。`,
      prompt: question,
    });
    return text.trim().toLowerCase();
  });

  console.log(`📋 質問カテゴリ: ${category}`);

  // ステップ2: 適切な専門エージェントにルーティング
  let answer: string;

  if (category === "billing") {
    answer = await context.run("billing-agent", async () => {
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        system: `あなたは請求・支払いの専門家です。
料金プラン、請求書、返金ポリシーに関する質問に答えてください。`,
        prompt: question,
      });
      return text;
    });
  } else if (category === "technical") {
    answer = await context.run("technical-agent", async () => {
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        system: `あなたは技術サポートの専門家です。
API、統合、トラブルシューティングに関する質問に答えてください。`,
        prompt: question,
      });
      return text;
    });
  } else {
    answer = await context.run("general-agent", async () => {
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        system: `あなたは親切なカスタマーサポート担当者です。
一般的な質問に丁寧に答えてください。`,
        prompt: question,
      });
      return text;
    });
  }

  return {
    question,
    category,
    answer,
  };
});
```

---

## RAG（Retrieval-Augmented Generation）の実装

RAGシステムは、ドキュメントを検索して関連情報を取得し、それを基にLLMが回答を生成する仕組みです。Workflow DevKitを使うことで、**ドキュメントの埋め込み処理が途中で中断されても安全に再開**できます。

### RAGシステムのアーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│  1. インデックス構築フェーズ（バッチ処理）            │
├─────────────────────────────────────────────────────┤
│  ドキュメント読み込み                                 │
│         ↓                                           │
│  チャンク分割（Workflow Step）                       │
│         ↓                                           │
│  エンベディング生成（Workflow Step）                 │
│         ↓                                           │
│  ベクトルDBに保存（Workflow Step）                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  2. クエリフェーズ（リアルタイム）                    │
├─────────────────────────────────────────────────────┤
│  ユーザー質問                                        │
│         ↓                                           │
│  質問をエンベディング化                              │
│         ↓                                           │
│  ベクトル検索（類似ドキュメントを取得）               │
│         ↓                                           │
│  LLMで回答生成                                       │
└─────────────────────────────────────────────────────┘
```

### 必要なパッケージ

```bash
npm install @upstash/vector @upstash/workflow @ai-sdk/openai ai
```

### Upstash Vectorのセットアップ

1. [Upstash Console](https://console.upstash.com/)でVector Databaseを作成
2. 環境変数を取得：

```bash
# .env.local
UPSTASH_VECTOR_REST_URL=your_vector_db_url
UPSTASH_VECTOR_REST_TOKEN=your_vector_db_token
```

### 実装例: 社内ドキュメント検索RAGシステム

#### 1. ドキュメントのインデックス化（バッチ処理）

```typescript
// app/api/index-documents/route.ts
import { serve } from "@upstash/workflow/nextjs";
import { Index } from "@upstash/vector";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    category: string;
    url?: string;
  };
}

// ベクトルDBの初期化
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// チャンク分割関数
function splitIntoChunks(text: string, chunkSize = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[。\n]/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + "。";
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// ワークフロー: ドキュメントのインデックス化
export const { POST } = serve<{ documents: Document[] }>(async (context) => {
  const { documents } = context.requestPayload;

  console.log(`📚 ${documents.length}件のドキュメントを処理します`);

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    // ステップ1: チャンク分割
    const chunks = await context.run(`split-doc-${doc.id}`, async () => {
      console.log(`✂️  ドキュメント ${doc.id} を分割中...`);
      return splitIntoChunks(doc.content);
    });

    console.log(`📄 ${chunks.length}個のチャンクに分割されました`);

    // ステップ2: 各チャンクの埋め込みとベクトルDB保存
    for (let j = 0; j < chunks.length; j++) {
      const chunk = chunks[j];

      await context.run(`embed-chunk-${doc.id}-${j}`, async () => {
        console.log(`🔢 チャンク ${j + 1}/${chunks.length} を処理中...`);

        // エンベディング生成
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: chunk,
        });

        // ベクトルDBに保存
        await vectorIndex.upsert({
          id: `${doc.id}-chunk-${j}`,
          vector: embedding,
          metadata: {
            documentId: doc.id,
            chunkIndex: j,
            content: chunk,
            title: doc.metadata.title,
            category: doc.metadata.category,
            url: doc.metadata.url || "",
          },
        });

        return { success: true };
      });
    }

    console.log(`✅ ドキュメント ${doc.id} の処理が完了`);
  }

  return {
    success: true,
    processedDocuments: documents.length,
    message: "すべてのドキュメントのインデックス化が完了しました",
  };
});
```

#### 2. RAG検索エンドポイント

```typescript
// app/api/rag-query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Index } from "@upstash/vector";
import { generateText, embed } from "ai";
import { openai } from "@ai-sdk/openai";

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    // ステップ1: 質問をエンベディング化
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: question,
    });

    // ステップ2: 類似ドキュメントを検索
    const searchResults = await vectorIndex.query({
      vector: embedding,
      topK: 5, // 上位5件を取得
      includeMetadata: true,
    });

    // ステップ3: 検索結果からコンテキストを構築
    const context = searchResults
      .map((result, i) => {
        const metadata = result.metadata as {
          content: string;
          title: string;
          category: string;
        };
        return `
【ドキュメント ${i + 1}: ${metadata.title}】
カテゴリ: ${metadata.category}
内容: ${metadata.content}
`;
      })
      .join("\n---\n");

    // ステップ4: LLMで回答生成
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      system: `あなたは社内ドキュメント検索システムのアシスタントです。

重要なルール:
1. 提供されたコンテキストのみを使用して回答してください
2. コンテキストに情報がない場合は「提供された情報では回答できません」と答えてください
3. 推測や一般知識で回答しないでください
4. 回答には必ず参照元のドキュメント名を明記してください`,
      prompt: `
コンテキスト:
${context}

質問: ${question}

上記のコンテキストを基に、質問に回答してください。`,
    });

    // ステップ5: 参照元の情報を整形
    const sources = searchResults.map((result) => {
      const metadata = result.metadata as {
        title: string;
        category: string;
        url?: string;
      };
      return {
        title: metadata.title,
        category: metadata.category,
        url: metadata.url || null,
        score: result.score,
      };
    });

    return NextResponse.json({
      question,
      answer: text,
      sources,
    });
  } catch (error) {
    console.error("RAG Query Error:", error);
    return NextResponse.json(
      { error: "回答の生成に失敗しました" },
      { status: 500 }
    );
  }
}
```

#### 3. 使用例

```typescript
// インデックス化の実行
const documents = [
  {
    id: "doc-1",
    content: "当社の製品保証期間は購入日から1年間です。保証期間内は無料で修理を承ります。",
    metadata: {
      title: "製品保証ポリシー",
      category: "warranty",
      url: "https://example.com/warranty",
    },
  },
  {
    id: "doc-2",
    content:
      "年次有給休暇は入社6ヶ月後に10日間付与されます。その後は1年ごとに日数が増加します。",
    metadata: {
      title: "就業規則",
      category: "hr",
      url: "https://example.com/hr-policy",
    },
  },
  // ... more documents
];

// ドキュメントのインデックス化
await fetch("/api/index-documents", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ documents }),
});

// RAG検索の実行
const response = await fetch("/api/rag-query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: "製品の保証期間について教えてください",
  }),
});

const result = await response.json();
console.log("回答:", result.answer);
console.log("参照元:", result.sources);
```

### RAGシステムの高度な実装

#### ハイブリッド検索（ベクトル + キーワード）

```typescript
// app/api/hybrid-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Index } from "@upstash/vector";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  const { question, category } = await req.json();

  // ベクトル検索
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: question,
  });

  // メタデータフィルタを使用した検索
  const searchResults = await vectorIndex.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
    filter: category
      ? `category = '${category}'` // カテゴリでフィルタリング
      : undefined,
  });

  // ... 以降は同じ
}
```

---

## 実践的な例：メール自動応答システム

マルチエージェントとRAGを組み合わせた実用的なシステムの例です。

```typescript
// app/api/email-responder/route.ts
import { serve } from "@upstash/workflow/nextjs";
import { Index } from "@upstash/vector";
import { generateText, embed } from "ai";
import { openai } from "@ai-sdk/openai";

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export const { POST } = serve<{ email: string; sender: string }>(
  async (context) => {
    const { email, sender } = context.requestPayload;

    // ステップ1: 分類エージェント（メールのカテゴリを判定）
    const category = await context.run("classify-email", async () => {
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        system: `メールを以下のカテゴリに分類してください:
- support: サポート依頼
- sales: 営業・商談
- inquiry: 一般的な問い合わせ
- urgent: 緊急対応が必要

カテゴリ名のみを返してください。`,
        prompt: email,
      });
      return text.trim().toLowerCase();
    });

    console.log(`📧 メールカテゴリ: ${category}`);

    // ステップ2: RAG検索（関連情報を取得）
    const relevantDocs = await context.run("search-knowledge-base", async () => {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: email,
      });

      const results = await vectorIndex.query({
        vector: embedding,
        topK: 3,
        includeMetadata: true,
        filter: `category = '${category}'`,
      });

      return results.map((r) => {
        const metadata = r.metadata as { content: string; title: string };
        return {
          title: metadata.title,
          content: metadata.content,
        };
      });
    });

    // ステップ3: 返信草案生成エージェント
    const draftReply = await context.run("generate-draft", async () => {
      const context = relevantDocs
        .map((doc) => `【${doc.title}】\n${doc.content}`)
        .join("\n\n");

      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        system: `あなたは親切なカスタマーサポート担当者です。
以下の情報を基に、丁寧で正確なメール返信を作成してください。`,
        prompt: `
受信メール:
${email}

参考情報:
${context}

上記を基に、${sender}様への返信メールを作成してください。`,
      });

      return text;
    });

    // ステップ4: 校正エージェント
    const finalReply = await context.run("review-draft", async () => {
      const { text } = await generateText({
        model: openai("gpt-4-turbo"),
        system: `返信メールの文法、トーン、正確性をチェックして改善してください。`,
        prompt: draftReply,
      });
      return text;
    });

    // ステップ5: 緊急の場合は通知を送信
    if (category === "urgent") {
      await context.run("send-notification", async () => {
        console.log("🚨 緊急メールを管理者に通知");
        // Slack、メールなどで通知
        return { notified: true };
      });
    }

    return {
      sender,
      category,
      relevantDocs: relevantDocs.map((d) => d.title),
      draftReply,
      finalReply,
      isUrgent: category === "urgent",
    };
  }
);
```

---

## ベストプラクティス

### 1. ステップの粒度

```typescript
// ❌ 悪い例: ステップが大きすぎる
await context.run("process-everything", async () => {
  const data = await fetchData();
  const processed = await processData(data);
  await saveData(processed);
  return processed;
});

// ✅ 良い例: ステップを適切に分割
const data = await context.run("fetch-data", async () => {
  return await fetchData();
});

const processed = await context.run("process-data", async () => {
  return await processData(data);
});

await context.run("save-data", async () => {
  await saveData(processed);
});
```

**理由**: ステップを細かく分割することで、どの段階で失敗したかを特定しやすくなります。

### 2. べき等性の確保

```typescript
// ✅ 良い例: べき等性のある操作
await context.run("save-user", async () => {
  // upsert（存在すれば更新、なければ挿入）
  await db.users.upsert({
    where: { id: userId },
    create: { id: userId, name: "John" },
    update: { name: "John" },
  });
});
```

**理由**: リトライ時に同じ操作を何度実行しても問題ないようにします。

### 3. エラーハンドリング

```typescript
await context.run("risky-operation", async () => {
  try {
    return await riskyAPI();
  } catch (error) {
    // エラーをログに記録
    console.error("API Error:", error);

    // カスタムエラーをスロー（リトライされる）
    throw new Error(`Failed to call API: ${error.message}`);
  }
});
```

### 4. タイムアウトの設定

```typescript
// 長時間かかる処理には明示的なタイムアウトを設定
await context.run(
  "long-running-task",
  async () => {
    return await longRunningOperation();
  },
  {
    timeout: 300, // 5分でタイムアウト
  }
);
```

### 5. 並列実行の活用

```typescript
// ✅ 良い例: 独立した処理は並列実行
const [result1, result2, result3] = await Promise.all([
  context.run("task-1", async () => await task1()),
  context.run("task-2", async () => await task2()),
  context.run("task-3", async () => await task3()),
]);
```

---

## モニタリングと可観測性

### Workflow実行状態の確認

Upstash Consoleで以下を確認できます：

- ワークフローの実行履歴
- 各ステップの実行時間
- エラーログ
- リトライ回数

### カスタムログの追加

```typescript
export const { POST } = serve(async (context) => {
  await context.run("step-1", async () => {
    console.log("ステップ1開始", {
      timestamp: new Date().toISOString(),
      metadata: { userId: "123" },
    });

    const result = await doSomething();

    console.log("ステップ1完了", {
      result,
      duration: "2.5s",
    });

    return result;
  });
});
```

### LangSmithとの統合

```typescript
// Vercel AI SDKとLangSmithを統合
import { wrapLanguageModel } from "langsmith/wrappers";

const model = wrapLanguageModel(openai("gpt-4-turbo"), {
  project_name: "my-workflow-project",
});

await generateText({
  model,
  prompt: "...",
});
```

---

## トラブルシューティング

### 問題1: ワークフローが再開されない

**原因**: 環境変数が正しく設定されていない

**解決策**:
```bash
# .env.localを確認
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx
UPSTASH_WORKFLOW_URL=https://your-app.vercel.app
```

### 問題2: リトライが多すぎる

**原因**: ステップ内で永続的なエラーが発生している

**解決策**:
```typescript
await context.run(
  "api-call",
  async () => {
    const response = await fetch(url);
    if (!response.ok) {
      // リトライすべきかどうかを判断
      if (response.status >= 500) {
        throw new Error("Server error, will retry");
      } else {
        // 4xxエラーはリトライしても無駄
        console.error("Client error, not retrying");
        return { error: true, status: response.status };
      }
    }
    return response.json();
  },
  { retries: 3 }
);
```

### 問題3: エンベディング処理が遅い

**解決策**: バッチ処理を活用

```typescript
// ❌ 悪い例: 1つずつ処理
for (const chunk of chunks) {
  await context.run(`embed-${chunk.id}`, async () => {
    return await embed({ value: chunk.content });
  });
}

// ✅ 良い例: バッチで処理
const BATCH_SIZE = 10;
for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE);

  await context.run(`embed-batch-${i}`, async () => {
    return await Promise.all(
      batch.map((chunk) =>
        embed({
          model: openai.embedding("text-embedding-3-small"),
          value: chunk.content,
        })
      )
    );
  });
}
```

---

## まとめ

Vercel Workflow Development Kitは、AIアプリケーション開発に革新をもたらすフレームワークです。

### 主な利点

**耐久性**:
- サーバー再起動やデプロイ時も処理を継続
- 長時間実行されるタスクを安全に実行

**信頼性**:
- 自動リトライで一時的なエラーを処理
- べき等性のある設計を推奨

**可観測性**:
- 各ステップの実行状態を追跡
- エラー発生箇所を簡単に特定

**柔軟性**:
- Vercel以外のプラットフォームでも動作
- オープンソースで無料

### マルチエージェント

- **順次実行**: 複雑なタスクをステップ分けして実行
- **並列実行**: 独立したタスクを同時実行して高速化
- **ルーティング**: コーディネーターが適切なエージェントに振り分け

### RAG

- **インデックス化**: ドキュメントを埋め込んでベクトルDBに保存
- **検索**: ユーザーの質問に関連するドキュメントを取得
- **生成**: 検索結果を基にLLMが回答を生成
- **Workflowの利点**: 大量のドキュメント処理が途中で中断されても安全

### 次のステップ

1. **公式ドキュメント**: https://useworkflow.dev
2. **サンプルコード**: https://github.com/vercel/workflow-examples
3. **Upstash Console**: https://console.upstash.com/
4. **Vercel AI SDK**: https://sdk.vercel.ai/

Vercel Workflowを活用して、耐久性と信頼性の高いAIアプリケーションを構築しましょう！

---

## 参考リンク

- [Vercel Workflow公式サイト](https://useworkflow.dev)
- [GitHub: vercel/workflow](https://github.com/vercel/workflow)
- [GitHub: vercel/workflow-examples](https://github.com/vercel/workflow-examples)
- [Upstash QStash](https://upstash.com/docs/qstash)
- [Upstash Vector](https://upstash.com/docs/vector)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Vercel Ship AI 2025 Recap](https://vercel.com/blog/ship-ai-2025-recap)
