---
slug: claude-agent-sdk-guide
title: Claude Agent SDKで始めるAIエージェント開発：実践ガイドと具体的ユースケース
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://github.com/s-tanoue
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [AI, Claude, Agent, SDK, Python, TypeScript, 自動化]
---

Anthropicが提供するClaude Agent SDKを使えば、Claude Codeと同じインフラストラクチャを活用して、強力なAIエージェントをプログラマティックに構築できます。本記事では、Claude Agent SDKの基本から実践的なユースケースまでを詳しく解説します。

<!--truncate-->

## Claude Agent SDKとは

Claude Agent SDKは、2025年9月にAnthropicがリリースした、カスタムAIエージェント構築のためのフレームワークです。Claude Codeを支えるインフラストラクチャを基盤としており、開発者は自律的なエージェントを作成できます。

### 主な特徴

- **ファイルシステムアクセス**: ファイルの読み書き、ディレクトリ操作
- **ターミナル実行**: Bashコマンドの実行、スクリプト実行
- **カスタムツール作成**: 独自の機能を持つツールの定義
- **MCP統合**: Model Context Protocol (MCP)サーバーとのシームレスな連携
- **サブエージェント**: 並列処理と独立したコンテキストウィンドウ
- **フック機能**: エージェントループの各ポイントでの決定論的処理

## SDK の選択肢

Claude Agent SDKは2つの言語で提供されています：

### Python SDK
```bash
pip install claude-agent-sdk
```

**必要要件:**
- Python 3.10以上
- Node.js
- Claude Code 2.0.0以上

### TypeScript SDK
```bash
npm install @anthropic-ai/claude-agent-sdk
```

## 基本的な使い方

### シンプルなクエリ実行

最もシンプルな使い方は、`query()`関数を使用することです：

```python
import anyio
from claude_agent_sdk import query

async def main():
    async for message in query(prompt="What is 2 + 2?"):
        print(message)

anyio.run(main)
```

この例では、Claudeに質問を投げかけ、ストリーミングで応答を受け取ります。

### カスタムツールの作成

Claude Agent SDKの真価は、カスタムツールを定義できる点にあります。以下は、挨拶ツールの例です：

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeAgentOptions, ClaudeSDKClient

# @toolデコレーターでツールを定義
@tool("greet", "ユーザーに挨拶する", \{"name": str\})
async def greet_user(args):
    return \{
        "content": [
            \{"type": "text", "text": f"こんにちは、\{args['name']\}さん!"\}
        ]
    \}

# SDK MCPサーバーを作成
server = create_sdk_mcp_server(
    name="my-tools",
    version="1.0.0",
    tools=[greet_user]
)

# Claudeで使用
async def main():
    options = ClaudeAgentOptions(
        mcp_servers=\{"tools": server\},
        allowed_tools=["mcp__tools__greet"]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Aliceに挨拶して")
        async for msg in client.receive_response():
            print(msg)

anyio.run(main)
```

### TypeScriptでの実装

TypeScriptでも同様にカスタムツールを使用できます：

```typescript
import \{ query \} from "@anthropic-ai/claude-agent-sdk";

for await (const message of query(\{
  prompt: "プロジェクト内のファイル一覧を表示して",
  options: \{
    mcpServers: \{
      "filesystem": \{
        command: "npx",
        args: ["@modelcontextprotocol/server-filesystem"],
        env: \{ ALLOWED_PATHS: "/Users/me/projects" \}
      \}
    \},
    allowedTools: ["mcp__filesystem__list_files"]
  \}
\})) \{
  if (message.type === "result" && message.subtype === "success") \{
    console.log(message.result);
  \}
\}
```

## 実践的なユースケース

### 1. メールアシスタントエージェント

IMAPプロトコルと連携して、メールの管理を自動化するエージェントを構築できます。

**主な機能:**
- 受信トレイの表示
- エージェント検索による特定メールの検索
- AI支援によるメール作成・返信

**実装のポイント:**
```python
# カスタムツールでIMAP接続を定義
@tool("fetch_inbox", "受信トレイを取得", \{\})
async def fetch_inbox(args):
    # IMAPサーバーに接続して受信トレイを取得
    emails = fetch_emails_from_imap()
    return format_email_list(emails)

@tool("search_emails", "メールを検索", \{"query": str\})
async def search_emails(args):
    # キーワードでメールを検索
    results = search_imap(args['query'])
    return format_search_results(results)
```

### 2. 財務分析エージェント

投資評価やポートフォリオ管理を支援するエージェントです。

**主な機能:**
- 外部APIから株価データを取得
- ポートフォリオの分析と評価
- レポート生成

**実装例:**
```python
@tool("get_stock_price", "株価を取得", \{"ticker": str\})
async def get_stock_price(args):
    # 外部API呼び出し（例: Alpha Vantage）
    price_data = await fetch_stock_data(args['ticker'])
    return \{
        "content": [
            \{"type": "text", "text": f"Ticker: \{args['ticker']\}, Price: $\{price_data['price']\}"\}
        ]
    \}

@tool("analyze_portfolio", "ポートフォリオ分析", \{"holdings": list\})
async def analyze_portfolio(args):
    # ポートフォリオのリスク分析
    analysis = perform_portfolio_analysis(args['holdings'])
    return format_analysis_report(analysis)
```

### 3. カスタマーサポートエージェント

複雑なサポートリクエストを処理し、必要に応じてエスカレーションを行います。

**主な機能:**
- ユーザーデータの収集
- 外部CRMシステムとの連携
- チケット管理と優先度付け

**エージェントの動作フロー:**
1. **コンテキスト収集**: ユーザー情報とチケット履歴を取得
2. **アクション実行**: 問題解決のための自動対応
3. **検証**: 対応が適切だったか確認し、必要に応じて人間にエスカレーション

### 4. リサーチアシスタントエージェント

Web情報の収集、ドキュメントの要約、ノート管理を行います。

**実装例:**
```python
@tool("save_note", "ノートを保存", \{"title": str, "content": str\})
async def save_note(args):
    # ローカルファイルシステムに保存
    file_path = f"./notes/\{args['title']\}.md"
    with open(file_path, 'w') as f:
        f.write(args['content'])
    return \{"content": [\{"type": "text", "text": f"ノートを保存しました: \{file_path\}"\}]\}

@tool("search_notes", "ノートを検索", \{"query": str\})
async def search_notes(args):
    # grepでノート内を検索
    results = grep_notes_directory(args['query'])
    return format_search_results(results)

@tool("summarize_webpage", "Webページを要約", \{"url": str\})
async def summarize_webpage(args):
    # Webページを取得して要約
    content = fetch_webpage(args['url'])
    summary = await summarize_with_claude(content)
    return \{"content": [\{"type": "text", "text": summary\}]\}
```

### 5. Excelデータ処理エージェント

スプレッドシートデータの分析、変換、レポート作成を自動化します。

**活用シーン:**
- 月次レポートの自動生成
- データクレンジングと正規化
- 複数シートの統合と分析

## エージェント設計のベストプラクティス

### 1. 三段階ループの実装

Anthropicが推奨するエージェントの基本ループ：

```
コンテキスト収集 → アクション実行 → 検証 → 繰り返し
```

**コンテキスト収集のコツ:**
- セマンティック検索よりもエージェント的な検索を優先
- サブエージェントで並列化
- 自動コンパクション機能でコンテキストオーバーフローを防止

**検証方法:**
- ルールベースのフィードバック（コードリンティングなど）
- スクリーンショットによる視覚的確認
- LLM-as-judge評価（計算コストが高いため注意）

### 2. カスタムツールの設計指針

```python
@tool(
    name="descriptive_name",  # 説明的な名前
    description="明確な目的の説明",  # Claudeが理解しやすい説明
    input_schema=\{"param": type\}  # 型安全なスキーマ
)
async def tool_function(args):
    # シンプルで焦点を絞った機能
    # エラーハンドリングを適切に実装
    try:
        result = perform_action(args)
        return format_response(result)
    except Exception as e:
        return \{"error": str(e)\}
```

### 3. MCPサーバーの活用

MCPサーバーを使うことで、外部サービスとの統合が容易になります：

```python
# 複数のMCPサーバーを同時に使用
options = ClaudeAgentOptions(
    mcp_servers=\{
        "filesystem": external_filesystem_server,
        "slack": external_slack_server,
        "custom": create_sdk_mcp_server(
            name="custom-tools",
            tools=[my_tool_1, my_tool_2]
        )
    \},
    allowed_tools=[
        "mcp__filesystem__read_file",
        "mcp__slack__send_message",
        "mcp__custom__my_tool_1"
    ]
)
```

## まとめ

Claude Agent SDKは、Claude Codeと同じ強力なインフラストラクチャを活用して、様々な領域でAIエージェントを構築できる汎用的なフレームワークです。

**主なメリット:**
- コーディングタスクに限定されない幅広い用途
- カスタムツールによる柔軟な拡張性
- MCPプロトコルによる外部サービス統合
- サブエージェントとフックによる高度な制御

**始め方:**
1. [公式ドキュメント](https://docs.claude.com/en/api/agent-sdk/overview)を確認
2. [GitHub リポジトリ](https://github.com/anthropics/claude-agent-sdk-python)のサンプルを試す
3. 小さなユースケースから始めて、段階的に拡張

Claude Agent SDKを活用して、業務自動化や新しいアプリケーション開発に挑戦してみてください！

## 参考リンク

- [公式ドキュメント](https://docs.claude.com/en/api/agent-sdk/overview)
- [Python SDK](https://github.com/anthropics/claude-agent-sdk-python)
- [TypeScript SDK](https://github.com/anthropics/claude-agent-sdk-typescript)
- [デモリポジトリ](https://github.com/anthropics/claude-agent-sdk-demos)
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
