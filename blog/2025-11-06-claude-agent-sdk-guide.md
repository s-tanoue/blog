---
slug: claude-agent-sdk-usage-guide
title: Claude Agent SDK完全ガイド：セットアップから実行まで実践的に学ぶ
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://github.com/s-tanoue
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [AI, Claude, Agent, SDK, Python, TypeScript, 自動化, 開発ガイド]
---

Claude Agent SDKは、Claude Codeと同じインフラストラクチャを使ってカスタムAIエージェントを構築できるフレームワークです。本記事では、セットアップから基本的な使い方、プロンプトの記述方法、エージェントの実行方法まで、実践的に解説します。

<!--truncate-->

## Claude Agent SDKとは

Claude Agent SDKは、Claude Codeを支えるインフラストラクチャを活用して、カスタムAIエージェントを構築できるフレームワークです。ファイル操作、コマンド実行、外部サービス連携など、強力な機能を持つエージェントをプログラマティックに作成できます。

### 主な機能

- **ファイルシステムアクセス**: ファイルの読み書き、検索
- **ターミナル実行**: Bashコマンド、スクリプトの実行
- **カスタムツール**: 独自機能を持つツールの定義
- **MCP統合**: 外部サービスとのシームレスな連携
- **サブエージェント**: タスクの並列処理

## セットアップ

### Python SDK のインストール

```bash
# SDKのインストール
pip install claude-agent-sdk

# 必要要件
# - Python 3.10以上
# - Node.js 18以上
# - Claude Code 2.0.0以上
```

### TypeScript SDK のインストール

```bash
# SDKのインストール
npm install @anthropic-ai/claude-agent-sdk

# または yarn
yarn add @anthropic-ai/claude-agent-sdk
```

### API キーの設定

Claude Agent SDKを使用するには、Anthropic API キーが必要です：

```bash
# 環境変数に設定
export ANTHROPIC_API_KEY="your-api-key"
```

または、プログラム内で直接指定することもできます（後述）。

## エージェントの実行方法

Claude Agent SDKでエージェントを実行する方法は主に2つあります。

### 方法1: query()関数（シンプル）

最もシンプルな方法は、`query()`関数を使用することです：

```python
import anyio
from claude_agent_sdk import query

async def main():
    # プロンプトを指定してエージェントを実行
    async for message in query(prompt="What is 2 + 2?"):
        print(message)

anyio.run(main)
```

**プロンプトの記述場所**: `query(prompt="ここにプロンプトを書く")`

**実行の流れ**:
1. `query()`関数にプロンプトを渡す
2. エージェントがプロンプトを処理
3. ストリーミングで応答を受け取る（`async for`で逐次取得）

### 方法2: ClaudeSDKClient（詳細制御）

より詳細な制御が必要な場合は、`ClaudeSDKClient`を使用します：

```python
import anyio
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

async def main():
    # オプションを設定
    options = ClaudeAgentOptions(
        api_key="your-api-key",  # 環境変数がない場合
        model="claude-opus-4-20250514",  # モデルを指定
        max_tokens=4096
    )

    # クライアントを初期化
    async with ClaudeSDKClient(options=options) as client:
        # プロンプトを送信
        await client.query("Pythonでフィボナッチ数列を実装して")

        # レスポンスを受信
        async for message in client.receive_response():
            if message.type == "text":
                print(message.text)
            elif message.type == "result":
                print(f"完了: \{message.subtype\}")

anyio.run(main)
```

**プロンプトの記述場所**: `await client.query("ここにプロンプトを書く")`

**実行の流れ**:
1. `ClaudeAgentOptions`でエージェントの設定を行う
2. `ClaudeSDKClient`を初期化
3. `client.query()`でプロンプトを送信
4. `client.receive_response()`でストリーミング応答を受信

### 会話の継続

`ClaudeSDKClient`を使うと、会話を継続できます：

```python
async def main():
    async with ClaudeSDKClient() as client:
        # 最初の質問
        await client.query("Pythonで素数判定関数を書いて")
        async for message in client.receive_response():
            print(message)

        # 追加の質問（コンテキストが維持される）
        await client.query("その関数をテストするコードも追加して")
        async for message in client.receive_response():
            print(message)

anyio.run(main)
```

### TypeScript での実行

TypeScriptでも同様の方法で実行できます：

```typescript
import \{ query, ClaudeSDKClient, ClaudeAgentOptions \} from "@anthropic-ai/claude-agent-sdk";

// 方法1: query()関数
for await (const message of query(\{ prompt: "2 + 2は？" \})) \{
  console.log(message);
\}

// 方法2: ClaudeSDKClient
const options: ClaudeAgentOptions = \{
  model: "claude-opus-4-20250514",
  maxTokens: 4096
\};

const client = new ClaudeSDKClient(options);
await client.query("TypeScriptで配列をソートして");

for await (const message of client.receiveResponse()) \{
  if (message.type === "text") \{
    console.log(message.text);
  \}
\}

await client.close();
```

### レスポンスの種類

エージェントからのレスポンスには、以下のような種類があります：

```python
async for message in client.receive_response():
    match message.type:
        case "text":
            # テキスト出力
            print(f"出力: \{message.text\}")

        case "tool_use":
            # ツールが使用された
            print(f"ツール使用: \{message.tool_name\}")

        case "result":
            # 実行結果
            if message.subtype == "success":
                print("成功")
            elif message.subtype == "error":
                print(f"エラー: \{message.error\}")
```

## カスタムツールの作成

Claude Agent SDKの最大の特徴は、独自のツールを作成してエージェントに機能を追加できることです。

### ステップ1: @toolデコレーターでツールを定義

```python
from claude_agent_sdk import tool

@tool(
    name="get_weather",
    description="指定された都市の天気を取得する",
    input_schema=\{"city": str\}
)
async def get_weather(args):
    city = args["city"]
    # 実際にはAPIを呼び出す
    weather_data = \{
        "Tokyo": "晴れ、気温25度",
        "Osaka": "曇り、気温22度"
    \}

    return \{
        "content": [
            \{
                "type": "text",
                "text": f"\{city\}の天気: \{weather_data.get(city, '情報なし')\}"
            \}
        ]
    \}
```

**ポイント**:
- `name`: ツールの名前（Claudeが使用する際の識別子）
- `description`: ツールの説明（Claudeがツールを選択する際の判断材料）
- `input_schema`: 入力パラメータの型定義
- 戻り値は `\{"content": [...]\}` 形式

### ステップ2: MCPサーバーにツールを登録

```python
from claude_agent_sdk import create_sdk_mcp_server

# 複数のツールをまとめてMCPサーバーを作成
server = create_sdk_mcp_server(
    name="my-tools",
    version="1.0.0",
    tools=[get_weather]  # ツールのリストを渡す
)
```

### ステップ3: エージェントでツールを使用

```python
import anyio
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

async def main():
    options = ClaudeAgentOptions(
        # MCPサーバーを登録
        mcp_servers=\{"tools": server\},
        # 使用を許可するツールを指定
        allowed_tools=["mcp__tools__get_weather"]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("東京の天気を教えて")

        async for message in client.receive_response():
            if message.type == "text":
                print(message.text)

anyio.run(main)
```

**実行の流れ**:
1. Claudeが「東京の天気」というリクエストを受け取る
2. `get_weather`ツールを使用すると判断
3. ツールを実行して結果を取得
4. 結果をユーザーに返す

### 実践例: ファイル操作ツール

複数のツールを組み合わせた実践的な例：

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeSDKClient, ClaudeAgentOptions
import os
import anyio

@tool("list_files", "ディレクトリ内のファイル一覧を取得", \{"path": str\})
async def list_files(args):
    files = os.listdir(args["path"])
    file_list = "\\n".join(files)
    return \{"content": [\{"type": "text", "text": f"ファイル一覧:\\n\{file_list\}"\}]\}

@tool("read_file", "ファイルの内容を読み込む", \{"path": str\})
async def read_file(args):
    with open(args["path"], "r") as f:
        content = f.read()
    return \{"content": [\{"type": "text", "text": f"内容:\\n\{content\}"\}]\}

@tool("write_file", "ファイルに内容を書き込む", \{"path": str, "content": str\})
async def write_file(args):
    with open(args["path"], "w") as f:
        f.write(args["content"])
    return \{"content": [\{"type": "text", "text": f"\{args['path']\}に書き込みました"\}]\}

# MCPサーバーを作成
file_server = create_sdk_mcp_server(
    name="file-tools",
    version="1.0.0",
    tools=[list_files, read_file, write_file]
)

# エージェントで使用
async def main():
    options = ClaudeAgentOptions(
        mcp_servers=\{"files": file_server\},
        allowed_tools=[
            "mcp__files__list_files",
            "mcp__files__read_file",
            "mcp__files__write_file"
        ]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("./dataディレクトリのファイル一覧を表示して、README.mdがあれば内容を表示して")

        async for message in client.receive_response():
            print(message)

anyio.run(main)
```

### TypeScriptでのカスタムツール

TypeScriptでも同様にカスタムツールを作成できます：

```typescript
import \{ tool, createSdkMcpServer, ClaudeSDKClient, ClaudeAgentOptions \} from "@anthropic-ai/claude-agent-sdk";

// ツールを定義
const calculateTool = tool(
  "calculate",
  "数式を計算する",
  \{ expression: "string" \},
  async (args: \{ expression: string \}) => \{
    const result = eval(args.expression); // 本番環境では安全な評価を使用
    return \{
      content: [
        \{ type: "text", text: `計算結果: $\{result\}` \}
      ]
    \};
  \}
);

// MCPサーバーを作成
const server = createSdkMcpServer(\{
  name: "calc-tools",
  version: "1.0.0",
  tools: [calculateTool]
\});

// エージェントで使用
const options: ClaudeAgentOptions = \{
  mcpServers: \{ calc: server \},
  allowedTools: ["mcp__calc__calculate"]
\};

const client = new ClaudeSDKClient(options);
await client.query("123 + 456を計算して");

for await (const message of client.receiveResponse()) \{
  console.log(message);
\}

await client.close();
```

## MCP統合：外部サービスとの連携

MCPサーバーを使うと、外部サービスとの統合が簡単にできます。

### 既存のMCPサーバーを使用

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

async def main():
    options = ClaudeAgentOptions(
        mcp_servers=\{
            # ファイルシステムMCPサーバー（外部）
            "filesystem": \{
                "command": "npx",
                "args": ["@modelcontextprotocol/server-filesystem", "/path/to/allowed"],
            \},
            # Slack MCPサーバー（外部）
            "slack": \{
                "command": "npx",
                "args": ["@modelcontextprotocol/server-slack"],
                "env": \{
                    "SLACK_BOT_TOKEN": "xoxb-your-token",
                    "SLACK_TEAM_ID": "your-team-id"
                \}
            \}
        \},
        allowed_tools=[
            "mcp__filesystem__read_file",
            "mcp__filesystem__write_file",
            "mcp__slack__post_message"
        ]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("./report.txtの内容を読んで、Slackの#generalチャンネルに要約を投稿して")

        async for message in client.receive_response():
            print(message)

anyio.run(main)
```

### カスタムツールと外部MCPサーバーの併用

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeSDKClient, ClaudeAgentOptions

# カスタムツール
@tool("summarize", "テキストを要約する", \{"text": str\})
async def summarize(args):
    text = args["text"]
    # 実際には要約処理を実装
    summary = text[:100] + "..."
    return \{"content": [\{"type": "text", "text": f"要約: \{summary\}"\}]\}

custom_server = create_sdk_mcp_server(
    name="custom-tools",
    tools=[summarize]
)

async def main():
    options = ClaudeAgentOptions(
        mcp_servers=\{
            "custom": custom_server,  # カスタムツール
            "filesystem": \{           # 外部MCPサーバー
                "command": "npx",
                "args": ["@modelcontextprotocol/server-filesystem", "/docs"]
            \}
        \},
        allowed_tools=[
            "mcp__custom__summarize",
            "mcp__filesystem__read_file"
        ]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("/docs/report.mdを読んで要約して")
        async for message in client.receive_response():
            print(message)

anyio.run(main)
```

## 実践的なユースケース

### ユースケース1: データ分析エージェント

CSVファイルを読み込んで分析し、レポートを生成するエージェント。

```python
import pandas as pd
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeSDKClient, ClaudeAgentOptions
import anyio

@tool("load_csv", "CSVファイルを読み込む", \{"path": str\})
async def load_csv(args):
    df = pd.read_csv(args["path"])
    summary = f"行数: \{len(df)\}, 列: \{', '.join(df.columns)\}"
    return \{"content": [\{"type": "text", "text": f"データ読み込み完了\\n\{summary\}"\}]\}

@tool("analyze_data", "データ統計を計算", \{"path": str, "column": str\})
async def analyze_data(args):
    df = pd.read_csv(args["path"])
    stats = df[args["column"]].describe().to_dict()
    return \{"content": [\{"type": "text", "text": f"統計情報: \{stats\}"\}]\}

@tool("create_chart", "グラフを生成", \{"path": str, "x_col": str, "y_col": str\})
async def create_chart(args):
    import matplotlib.pyplot as plt
    df = pd.read_csv(args["path"])
    plt.figure(figsize=(10, 6))
    plt.plot(df[args["x_col"]], df[args["y_col"]])
    plt.savefig("chart.png")
    return \{"content": [\{"type": "text", "text": "chart.pngにグラフを保存しました"\}]\}

# エージェント実行
async def main():
    server = create_sdk_mcp_server(
        name="data-tools",
        tools=[load_csv, analyze_data, create_chart]
    )

    options = ClaudeAgentOptions(
        mcp_servers=\{"data": server\},
        allowed_tools=[
            "mcp__data__load_csv",
            "mcp__data__analyze_data",
            "mcp__data__create_chart"
        ]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("sales.csvを読み込んで、売上データを分析し、グラフを作成して")
        async for message in client.receive_response():
            print(message)

anyio.run(main)
```

### ユースケース2: レポート生成エージェント

複数のデータソースから情報を収集し、Markdownレポートを生成するエージェント。

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeSDKClient, ClaudeAgentOptions
import anyio
import requests

@tool("fetch_api_data", "APIからデータを取得", \{"url": str\})
async def fetch_api_data(args):
    response = requests.get(args["url"])
    return \{"content": [\{"type": "text", "text": f"データ: \{response.json()\}"\}]\}

@tool("read_local_file", "ローカルファイルを読む", \{"path": str\})
async def read_local_file(args):
    with open(args["path"], "r") as f:
        content = f.read()
    return \{"content": [\{"type": "text", "text": content\}]\}

@tool("write_report", "レポートを保存", \{"filename": str, "content": str\})
async def write_report(args):
    with open(args["filename"], "w") as f:
        f.write(args["content"])
    return \{"content": [\{"type": "text", "text": f"\{args['filename']\}に保存しました"\}]\}

async def main():
    server = create_sdk_mcp_server(
        name="report-tools",
        tools=[fetch_api_data, read_local_file, write_report]
    )

    options = ClaudeAgentOptions(
        mcp_servers=\{"report": server\},
        allowed_tools=[
            "mcp__report__fetch_api_data",
            "mcp__report__read_local_file",
            "mcp__report__write_report"
        ]
    )

    async with ClaudeSDKClient(options=options) as client:
        prompt = """
        以下のタスクを実行してください:
        1. https://api.example.com/statsからデータを取得
        2. ./data/summary.txtのローカルファイルを読み込む
        3. 収集した情報を基に、Markdown形式のレポートを作成
        4. report.mdとして保存
        """
        await client.query(prompt)
        async for message in client.receive_response():
            print(message)

anyio.run(main)
```

### ユースケース3: 自動化ワークフロー

GitHubリポジトリのissueを分析し、関連するファイルを更新するエージェント。

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeSDKClient, ClaudeAgentOptions
import subprocess
import anyio

@tool("run_git_command", "Gitコマンドを実行", \{"command": str\})
async def run_git_command(args):
    result = subprocess.run(args["command"].split(), capture_output=True, text=True)
    return \{"content": [\{"type": "text", "text": f"出力:\\n\{result.stdout\}"\}]\}

@tool("read_issue", "GitHubのissue情報を取得", \{"issue_number": int\})
async def read_issue(args):
    # GitHub APIを使用（要: PyGithub）
    # from github import Github
    # g = Github("token")
    # repo = g.get_repo("owner/repo")
    # issue = repo.get_issue(args["issue_number"])
    # return issue詳細

    return \{"content": [\{"type": "text", "text": "Issue詳細情報"\}]\}

@tool("update_file", "ファイルを更新", \{"path": str, "content": str\})
async def update_file(args):
    with open(args["path"], "w") as f:
        f.write(args["content"])
    return \{"content": [\{"type": "text", "text": f"\{args['path']\}を更新しました"\}]\}

async def main():
    server = create_sdk_mcp_server(
        name="workflow-tools",
        tools=[run_git_command, read_issue, update_file]
    )

    options = ClaudeAgentOptions(
        mcp_servers=\{"workflow": server\},
        allowed_tools=[
            "mcp__workflow__run_git_command",
            "mcp__workflow__read_issue",
            "mcp__workflow__update_file"
        ]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Issue #42の内容を読んで、必要なファイルの変更を提案して")
        async for message in client.receive_response():
            print(message)

anyio.run(main)
```

## ベストプラクティス

### 1. ツールの設計指針

**明確な名前と説明**:
```python
# 良い例
@tool("calculate_tax", "税金を計算する（消費税10%）", \{"amount": float\})

# 悪い例
@tool("calc", "計算", \{"x": float\})
```

**エラーハンドリング**:
```python
@tool("read_api", "外部APIからデータを取得", \{"url": str\})
async def read_api(args):
    try:
        response = requests.get(args["url"], timeout=10)
        response.raise_for_status()
        return \{"content": [\{"type": "text", "text": response.text\}]\}
    except requests.RequestException as e:
        return \{"content": [\{"type": "text", "text": f"エラー: \{str(e)\}"\}]\}
```

**シンプルで焦点を絞った機能**:
```python
# 良い例：1つのツールが1つの機能
@tool("read_file", "ファイルを読む", \{"path": str\})
@tool("write_file", "ファイルに書く", \{"path": str, "content": str\})

# 悪い例：1つのツールで複数の機能
@tool("file_operation", "ファイル操作", \{"op": str, "path": str, "content": str\})
```

### 2. プロンプトの書き方

**具体的な指示**:
```python
# 良い例
await client.query("sales.csvを読み込んで、売上列の平均値を計算し、結果をresult.txtに保存して")

# 悪い例
await client.query("データを処理して")
```

**ステップバイステップ**:
```python
prompt = """
以下のタスクを順番に実行してください:
1. data.csvを読み込む
2. "price"列の合計を計算
3. 結果をJSONフォーマットでsummary.jsonに保存
"""
await client.query(prompt)
```

### 3. エージェントの動作確認

**レスポンスの監視**:
```python
async with ClaudeSDKClient(options=options) as client:
    await client.query("タスクを実行")

    async for message in client.receive_response():
        # デバッグ用にすべてのメッセージを記録
        print(f"[DEBUG] \{message.type\}: \{message\}")

        if message.type == "error":
            # エラー時の処理
            logging.error(f"エージェントエラー: \{message.error\}")
```

### 4. セキュリティ考慮事項

**ツールの権限制御**:
```python
# allowed_toolsで明示的に許可
options = ClaudeAgentOptions(
    mcp_servers=\{"tools": server\},
    allowed_tools=[
        "mcp__tools__read_file",  # 読み取りのみ許可
        # "mcp__tools__delete_file"  # 削除は許可しない
    ]
)
```

**入力検証**:
```python
@tool("execute_command", "コマンドを実行", \{"command": str\})
async def execute_command(args):
    # 危険なコマンドをブロック
    dangerous_commands = ["rm -rf", "dd if=", ":()\{:\|:&\};:"]
    if any(cmd in args["command"] for cmd in dangerous_commands):
        return \{"content": [\{"type": "text", "text": "危険なコマンドは実行できません"\}]\}

    # 安全なコマンドのみ実行
    result = subprocess.run(args["command"].split(), capture_output=True, text=True)
    return \{"content": [\{"type": "text", "text": result.stdout\}]\}
```

## まとめ

Claude Agent SDKを使うと、以下のような強力なAIエージェントを構築できます：

**SDKの主な機能**:
- ✅ `query()`または`ClaudeSDKClient`でエージェントを実行
- ✅ `@tool`デコレーターでカスタムツールを作成
- ✅ MCPサーバーで外部サービスと統合
- ✅ プロンプトでタスクを指示

**学習の流れ**:
1. **まずは`query()`で動作確認** → シンプルなプロンプトから試す
2. **カスタムツールを1つ作成** → 天気取得やファイル操作など
3. **複数のツールを組み合わせ** → データ分析やレポート生成など
4. **外部MCPサーバーを統合** → Slack、GitHub、データベースなど

**次のステップ**:
- [公式ドキュメント](https://docs.claude.com/en/api/agent-sdk/overview)で詳細を確認
- [デモリポジトリ](https://github.com/anthropics/claude-agent-sdk-demos)のサンプルコードを試す
- 自分のユースケースに合わせてカスタマイズ

Claude Agent SDKを活用して、業務自動化や新しいアプリケーション開発に挑戦してみてください！

## 参考リンク

- [公式ドキュメント](https://docs.claude.com/en/api/agent-sdk/overview)
- [Python SDK リポジトリ](https://github.com/anthropics/claude-agent-sdk-python)
- [TypeScript SDK リポジトリ](https://github.com/anthropics/claude-agent-sdk-typescript)
- [デモとサンプル](https://github.com/anthropics/claude-agent-sdk-demos)
- [Anthropic Blog: Building Agents](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
