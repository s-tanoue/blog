---
slug: multiple-claude-code-workflows
title: 複数のClaude Codeを並列実行する4つの実践テクニック：Anthropicエンジニアから学ぶ効率的ワークフロー
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - AI・LLM
  - 開発ツール
---

Anthropicのエンジニアが実践している**複数のClaude Codeインスタンスを並列で動かす**ワークフローが話題になっています。1つのタスクを待つ間に別のタスクを進める、複数のブランチで同時に作業する、といった効率化が可能になります。この記事では、4つの実践的な方法を詳しく解説します。

<!--truncate-->

## なぜ複数のClaude Codeを並列実行するのか

Claude Codeは強力なAIコーディングアシスタントですが、1つのインスタンスで作業していると以下のような課題があります：

### 待ち時間の問題

**課題1: ビルド・テスト待ち**
```
Claude Code: ビルド実行中...（5分）
開発者: 待つしかない 😴
```

**課題2: 複雑なリファクタリング**
```
Claude Code: 大規模なリファクタリングを実行中...（20分）
開発者: 他の簡単な修正もしたいのに...
```

**課題3: 複数ブランチでの作業**
```
Claude Code: feature/auth ブランチで作業中
開発者: feature/ui も並行して進めたい
```

### 並列実行のメリット

**メリット1: 時間効率の向上**
- ビルド・テスト実行中に別の作業を進められる
- 複数のタスクを同時進行

**メリット2: コンテキストの保持**
- 各Claude Codeインスタンスが独立したコンテキストを保持
- タスク切り替えのコストが低い

**メリット3: 実験的な試行**
- 安全な環境で複数のアプローチを試せる
- 失敗してもメインの作業に影響しない

---

## 方法1: 複数のgit checkout（ディレクトリ複製）

最もシンプルな方法は、**同じリポジトリを複数のディレクトリにクローンする**ことです。

### 仕組み

```
~/projects/
├── myapp/           # Claude Code #1
├── myapp-feature2/  # Claude Code #2
└── myapp-hotfix/    # Claude Code #3
```

各ディレクトリは独立したgitリポジトリとして動作し、それぞれで別のブランチにチェックアウトできます。

### セットアップ手順

#### 1. リポジトリを複数回クローン

```bash
# メインのリポジトリ
git clone git@github.com:user/myapp.git myapp
cd myapp

# 2つ目のコピー（feature/auth ブランチ用）
cd ..
git clone git@github.com:user/myapp.git myapp-auth
cd myapp-auth
git checkout feature/auth

# 3つ目のコピー（feature/ui ブランチ用）
cd ..
git clone git@github.com:user/myapp.git myapp-ui
cd myapp-ui
git checkout feature/ui
```

#### 2. 各ディレクトリでClaude Codeを起動

```bash
# ターミナル1
cd ~/projects/myapp
claude

# ターミナル2
cd ~/projects/myapp-auth
claude

# ターミナル3
cd ~/projects/myapp-ui
claude
```

### 実践例

```bash
# シナリオ: UIとバックエンドの機能を並行開発

# ディレクトリ1: feature/api-endpoint
cd myapp-api
claude
# → Claude Code #1: API エンドポイントの実装とテスト

# ディレクトリ2: feature/ui-components
cd myapp-ui
claude
# → Claude Code #2: UI コンポーネントの作成とスタイリング

# ディレクトリ3: main（緊急の修正用）
cd myapp
claude
# → Claude Code #3: 緊急のバグ修正
```

### メリット・デメリット

**メリット**:
- ✅ シンプルで理解しやすい
- ✅ 完全に独立した環境
- ✅ 依存関係の競合リスクがない
- ✅ 各ディレクトリで異なる`.env`ファイルを使える

**デメリット**:
- ❌ ディスク容量を大量に消費（特に`node_modules`など）
- ❌ リポジトリのクローンに時間がかかる
- ❌ 設定ファイルの同期が必要
- ❌ ビルドキャッシュが共有されない

### ベストプラクティス

**1. `.gitignore`を活用**
```bash
# 不要なファイルは除外してディスク容量を節約
node_modules/
.next/
dist/
build/
```

**2. シンボリックリンクで設定を共有**
```bash
# 共通の設定ファイルを共有
cd myapp-auth
rm .prettierrc .eslintrc.js
ln -s ../myapp/.prettierrc .prettierrc
ln -s ../myapp/.eslintrc.js .eslintrc.js
```

**3. クリーンアップスクリプト**
```bash
#!/bin/bash
# cleanup.sh - 不要なディレクトリを削除

read -p "myapp-auth を削除しますか？ (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf myapp-auth
    echo "削除完了"
fi
```

---

## 方法2: git-worktree（推奨）

**git worktree**は、Gitの公式機能で、**1つのリポジトリから複数の作業ツリーを作成**できます。ディスク容量を節約しながら並列作業が可能です。

### 仕組み

```
~/projects/myapp/
├── .git/              # 共有のGitデータベース（1つのみ）
├── main/              # mainブランチの作業ツリー
├── feature-auth/      # feature/authブランチの作業ツリー
└── feature-ui/        # feature/uiブランチの作業ツリー
```

すべての作業ツリーが**同じ`.git`ディレクトリを共有**するため、ディスク容量が大幅に節約されます。

### セットアップ手順

#### 1. メインリポジトリのクローン

```bash
git clone git@github.com:user/myapp.git myapp
cd myapp
```

#### 2. worktreeを追加

```bash
# feature/authブランチ用のworktreeを作成
git worktree add ../myapp-auth feature/auth

# feature/uiブランチ用のworktreeを作成
git worktree add ../myapp-ui feature/ui

# 新しいブランチを作成しながらworktreeを追加
git worktree add -b feature/new-api ../myapp-api
```

#### 3. worktreeの一覧を確認

```bash
git worktree list
# 出力:
# /Users/you/projects/myapp              abc1234 [main]
# /Users/you/projects/myapp-auth         def5678 [feature/auth]
# /Users/you/projects/myapp-ui           ghi9012 [feature/ui]
```

#### 4. 各worktreeでClaude Codeを起動

```bash
# ターミナル1
cd ~/projects/myapp
claude

# ターミナル2
cd ~/projects/myapp-auth
claude

# ターミナル3
cd ~/projects/myapp-ui
claude
```

### 実践例

```bash
# シナリオ: 複数の機能を並行開発

# 1. メインブランチでレビュー対応
cd myapp
claude
# → Claude Code #1: PRのレビューコメントに対応

# 2. 新機能の開発
git worktree add ../myapp-feature feature/user-profile
cd ../myapp-feature
claude
# → Claude Code #2: ユーザープロフィール機能を実装

# 3. バグ修正
git worktree add -b hotfix/login-issue ../myapp-hotfix
cd ../myapp-hotfix
claude
# → Claude Code #3: ログインのバグを修正
```

### worktreeの管理

#### worktreeの削除

```bash
# 作業が完了したworktreeを削除
git worktree remove myapp-feature

# または、ディレクトリを削除してから整理
rm -rf ../myapp-feature
git worktree prune  # 不要なworktree参照を削除
```

#### worktreeの移動

```bash
# worktreeを別の場所に移動
git worktree move myapp-auth ~/Desktop/myapp-auth
```

### メリット・デメリット

**メリット**:
- ✅ **ディスク容量を大幅に節約**（`.git`を共有）
- ✅ ブランチの切り替えが不要
- ✅ Gitの公式機能で安定している
- ✅ コミットやブランチが全worktreeで即座に共有される
- ✅ ビルドキャッシュを共有できる（設定次第）

**デメリット**:
- ❌ 同じブランチを複数のworktreeで使えない
- ❌ `node_modules`などは各worktreeに必要
- ❌ 環境変数やポート番号の競合に注意

### ベストプラクティス

**1. worktreeの命名規則**
```bash
# ブランチ名と一致させる
git worktree add ../myapp-feature/auth feature/auth
git worktree add ../myapp-hotfix/login hotfix/login

# または、チケット番号を含める
git worktree add ../myapp-JIRA-123 feature/JIRA-123
```

**2. ポート番号の管理**
```bash
# 各worktreeで異なるポートを使用
# myapp/.env
PORT=3000

# myapp-auth/.env
PORT=3001

# myapp-ui/.env
PORT=3002
```

**3. 依存関係のインストールを自動化**
```bash
#!/bin/bash
# setup-worktree.sh

BRANCH=$1
WORKTREE_PATH="../myapp-${BRANCH//\//-}"

git worktree add "$WORKTREE_PATH" "$BRANCH"
cd "$WORKTREE_PATH"

# 依存関係を自動インストール
npm install
# または
pnpm install

echo "Worktree準備完了: $WORKTREE_PATH"
```

**4. worktreeの一括削除**
```bash
#!/bin/bash
# cleanup-worktrees.sh

# マージ済みのブランチのworktreeを削除
git worktree list | grep -v "main" | while read -r worktree; do
    BRANCH=$(echo "$worktree" | awk '{print $3}' | tr -d '[]')
    if git branch --merged main | grep -q "$BRANCH"; then
        WORKTREE_PATH=$(echo "$worktree" | awk '{print $1}')
        echo "削除: $WORKTREE_PATH ($BRANCH)"
        git worktree remove "$WORKTREE_PATH"
    fi
done
```

---

## 方法3: SSH + TMUX（リモートサーバー活用）

**リモートサーバーにSSH接続し、TMUX**（ターミナルマルチプレクサ）を使って複数のClaude Codeセッションを管理する方法です。特に**リソース不足のローカルマシン**や**クラウド開発環境**で有効です。

### 仕組み

```
ローカルPC
    ↓ SSH
リモートサーバー（AWS EC2 / GCP Compute Engine など）
    ├── TMUX Session 1: Claude Code #1（feature/auth）
    ├── TMUX Session 2: Claude Code #2（feature/ui）
    └── TMUX Session 3: Claude Code #3（ビルド実行）
```

TMUXは**セッションが永続化**されるため、SSH接続が切れても作業が継続されます。

### セットアップ手順

#### 1. リモートサーバーのセットアップ

```bash
# AWS EC2やGCP Compute Engineのインスタンスを作成
# 推奨スペック:
# - CPU: 4コア以上
# - RAM: 16GB以上
# - ストレージ: 100GB以上

# SSHでログイン
ssh user@remote-server.example.com

# TMUXのインストール（Ubuntu/Debian）
sudo apt update
sudo apt install tmux

# TMUXのインストール（macOS）
brew install tmux

# Claude Codeのインストール
npm install -g @anthropic-ai/claude-code
```

#### 2. TMUXセッションの作成

```bash
# セッション1: feature/auth
tmux new-session -s auth -d
tmux send-keys -t auth "cd ~/myapp && git checkout feature/auth" C-m
tmux send-keys -t auth "claude" C-m

# セッション2: feature/ui
tmux new-session -s ui -d
tmux send-keys -t ui "cd ~/myapp && git worktree add ../myapp-ui feature/ui && cd ../myapp-ui" C-m
tmux send-keys -t ui "claude" C-m

# セッション3: ビルド・テスト用
tmux new-session -s build -d
tmux send-keys -t build "cd ~/myapp" C-m
```

#### 3. セッションへのアタッチ/デタッチ

```bash
# セッション一覧を表示
tmux ls
# 出力:
# auth: 1 windows (created Fri Oct 31 10:00:00 2025)
# ui: 1 windows (created Fri Oct 31 10:01:00 2025)
# build: 1 windows (created Fri Oct 31 10:02:00 2025)

# セッションにアタッチ
tmux attach -t auth

# セッションからデタッチ（Ctrl+b → d）
# セッションはバックグラウンドで継続

# 別のセッションに切り替え
tmux switch-client -t ui
```

### TMUX基本操作

**プレフィックスキー**: `Ctrl+b`（デフォルト）

| 操作 | コマンド |
|------|---------|
| セッションからデタッチ | `Ctrl+b` → `d` |
| 新しいウィンドウを作成 | `Ctrl+b` → `c` |
| ウィンドウを切り替え | `Ctrl+b` → `0-9` |
| ウィンドウを分割（横） | `Ctrl+b` → `"` |
| ウィンドウを分割（縦） | `Ctrl+b` → `%` |
| ペイン間を移動 | `Ctrl+b` → 矢印キー |
| セッション一覧を表示 | `Ctrl+b` → `s` |

### 実践例

```bash
# シナリオ: リモートサーバーで複数タスクを並行実行

# 1. SSHでリモートサーバーにログイン
ssh developer@my-dev-server.com

# 2. TMUXセッションを起動
tmux new -s workspace

# 3. ウィンドウを分割して複数のClaude Codeを起動
# Ctrl+b → " （横分割）
# Ctrl+b → % （縦分割）

# ペイン1（左上）: メイン開発
cd ~/myapp
git checkout main
claude

# ペイン2（右上）: 新機能開発
cd ~/myapp-feature
claude

# ペイン3（下部）: ビルド・テスト監視
npm run build:watch
npm run test:watch

# 4. SSH接続を切断してもセッションは継続
# Ctrl+b → d でデタッチ
exit

# 5. 後で再接続
ssh developer@my-dev-server.com
tmux attach -t workspace
```

### TMUXの設定カスタマイズ

```bash
# ~/.tmux.conf
# プレフィックスキーをCtrl+aに変更（Ctrl+bより押しやすい）
unbind C-b
set-option -g prefix C-a
bind-key C-a send-prefix

# マウス操作を有効化
set -g mouse on

# ペイン番号を1から始める
set -g base-index 1
setw -g pane-base-index 1

# ウィンドウ分割のキーバインドを直感的に
bind | split-window -h
bind - split-window -v

# ペインのリサイズをVimライクに
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# ステータスバーのカスタマイズ
set -g status-bg colour235
set -g status-fg colour136
set -g status-left '#[fg=green]#S '
set -g status-right '#[fg=yellow]%Y-%m-%d %H:%M'
```

### メリット・デメリット

**メリット**:
- ✅ ローカルマシンのリソースを節約
- ✅ 高性能なサーバーで快適に作業
- ✅ SSH切断してもセッションが継続
- ✅ チーム間でセッションを共有できる（ペアプログラミング）
- ✅ ローカルネットワーク環境に依存しない

**デメリット**:
- ❌ ネットワーク遅延の影響を受ける
- ❌ TMUXの学習コストがかかる
- ❌ サーバーのコスト（AWS EC2など）
- ❌ ローカルファイルとの同期が必要

### ベストプラクティス

**1. SSH接続の設定を簡素化**
```bash
# ~/.ssh/config
Host devserver
    HostName my-dev-server.com
    User developer
    Port 22
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
    ServerAliveCountMax 3

# 接続が簡単に
ssh devserver
```

**2. TMUXセッション自動復元**
```bash
# tmux-resurrectプラグインをインストール
git clone https://github.com/tmux-plugins/tmux-resurrect ~/.tmux/plugins/tmux-resurrect

# ~/.tmux.confに追加
run-shell ~/.tmux/plugins/tmux-resurrect/resurrect.tmux

# セッションを保存: Ctrl+b → Ctrl+s
# セッションを復元: Ctrl+b → Ctrl+r
```

**3. VS Code Remote-SSH + TMUX**
```bash
# VS CodeのRemote-SSH拡張機能と組み合わせる
# 1. VS CodeでRemote-SSHをインストール
# 2. リモートサーバーに接続
# 3. VS Codeの統合ターミナルでTMUXを起動
# 4. Claude Codeを実行

# VS Codeで統合ターミナルを開く
tmux new -s vscode-claude
claude
```

---

## 方法4: GitHub Actionsを並列起動

**GitHub Actions**を使って、Claude Codeのワークフローを**CI/CD環境で並列実行**する方法です。ローカル環境のリソースを使わずに、クラウド上で複数のタスクを同時実行できます。

### 仕組み

```
GitHub Repository
    ↓ Push / PR作成
GitHub Actions（複数のジョブを並列実行）
    ├── Job 1: Claude Code でコードレビュー
    ├── Job 2: Claude Code で自動テスト生成
    ├── Job 3: Claude Code でドキュメント生成
    └── Job 4: Claude Code でリファクタリング提案
```

各ジョブは**独立したランナー**で実行されるため、完全な並列化が可能です。

### セットアップ手順

#### 1. GitHub Personal Access Tokenの作成

```bash
# GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
# 必要な権限:
# - Contents: Read and write
# - Pull requests: Read and write
# - Workflows: Read and write
```

#### 2. リポジトリシークレットの設定

```bash
# GitHub Repository → Settings → Secrets and variables → Actions
# 以下のシークレットを追加:
# - ANTHROPIC_API_KEY: AnthropicのAPIキー
# - GITHUB_TOKEN: 自動的に提供される（設定不要）
```

#### 3. ワークフローファイルの作成

```yaml
# .github/workflows/parallel-claude-code.yml
name: Parallel Claude Code Workflows

on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches:
      - main
      - develop

jobs:
  # ジョブ1: コードレビュー
  code-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --non-interactive "このPRのコードレビューをしてください。特に以下の点を確認してください：
          1. セキュリティ上の問題
          2. パフォーマンスの問題
          3. コーディング規約違反
          4. エッジケースの処理
          レビュー結果をreview-report.mdに出力してください。"

      - name: Upload Review Report
        uses: actions/upload-artifact@v4
        with:
          name: code-review-report
          path: review-report.md

  # ジョブ2: 自動テスト生成
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Generate Unit Tests
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --non-interactive "変更されたファイルに対するユニットテストを生成してください。
          - カバレッジは80%以上を目指す
          - エッジケースを網羅する
          - Jest/Vitestの構文を使用
          生成されたテストは__tests__ディレクトリに保存してください。"

      - name: Commit Generated Tests
        run: |
          git config user.name "Claude Code Bot"
          git config user.email "bot@claude-code.ai"
          git add __tests__/
          git commit -m "test: Claude Codeが生成したユニットテスト" || echo "No tests to commit"
          git push origin HEAD

  # ジョブ3: ドキュメント生成
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Generate Documentation
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --non-interactive "変更されたコードに対する以下のドキュメントを生成してください：
          1. README.md: 概要と使い方
          2. API.md: API仕様書
          3. ARCHITECTURE.md: アーキテクチャ図
          docsディレクトリに保存してください。"

      - name: Commit Documentation
        run: |
          git config user.name "Claude Code Bot"
          git config user.email "bot@claude-code.ai"
          git add docs/
          git commit -m "docs: Claude Codeが生成したドキュメント" || echo "No docs to commit"
          git push origin HEAD

  # ジョブ4: リファクタリング提案
  suggest-refactoring:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Analyze Code Quality
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --non-interactive "コードベース全体を分析し、リファクタリング提案をしてください：
          1. コードの重複
          2. 複雑度が高い関数
          3. 改善可能な設計パターン
          4. パフォーマンス最適化の機会
          提案はrefactoring-suggestions.mdに出力してください。"

      - name: Create Issue for Refactoring
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const suggestions = fs.readFileSync('refactoring-suggestions.md', 'utf8');

            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Claude Codeによるリファクタリング提案',
              body: suggestions,
              labels: ['refactoring', 'claude-code']
            });

  # すべてのジョブが完了したら通知
  notify-completion:
    runs-on: ubuntu-latest
    needs: [code-review, generate-tests, generate-docs, suggest-refactoring]
    steps:
      - name: Send Notification
        run: |
          echo "すべてのClaude Codeワークフローが完了しました"
          # Slack/Discord通知などを追加可能
```

### 実践例：PR自動レビューシステム

```yaml
# .github/workflows/pr-review.yml
name: PR Auto Review with Claude Code

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  # 並列ジョブ1: セキュリティチェック
  security-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Security Scan
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --non-interactive "セキュリティの観点でコードをレビューしてください。
          - SQLインジェクション
          - XSS脆弱性
          - 認証・認可の問題
          - 機密情報の漏洩"

  # 並列ジョブ2: パフォーマンスチェック
  performance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Performance Analysis
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --non-interactive "パフォーマンスの観点でコードをレビューしてください。
          - N+1クエリ
          - 不要なループ
          - メモリリーク
          - 非効率なアルゴリズム"

  # 並列ジョブ3: コーディング規約チェック
  style-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Style Guide Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --non-interactive "コーディング規約に従っているかレビューしてください。
          - 命名規則
          - コメントの適切さ
          - ファイル構成
          - 型定義の完全性"
```

### マトリックス戦略で複数バージョンをテスト

```yaml
# .github/workflows/multi-version-test.yml
name: Multi-Version Testing

on: [push, pull_request]

jobs:
  test-matrix:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Test with Claude Code
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --non-interactive "Node.js ${{ matrix.node-version }} on ${{ matrix.os }} でテストを実行し、問題があれば修正してください"
```

### メリット・デメリット

**メリット**:
- ✅ **ローカルリソースを一切使わない**
- ✅ GitHub提供のランナーで無制限の並列化
- ✅ CI/CDパイプラインとの統合
- ✅ PR作成時に自動実行
- ✅ チーム全体で共有できる

**デメリット**:
- ❌ GitHub Actionsの実行時間制限（無料プランは月2,000分）
- ❌ プライベートリポジトリでは課金が必要
- ❌ リアルタイムのインタラクションができない
- ❌ デバッグが難しい

### ベストプラクティス

**1. ジョブの依存関係を定義**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Build
        run: npm run build

  test:
    needs: build  # buildが成功してから実行
    runs-on: ubuntu-latest
    steps:
      - name: Test
        run: npm test

  deploy:
    needs: [build, test]  # buildとtestの両方が成功してから実行
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: npm run deploy
```

**2. キャッシュを活用して高速化**
```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**3. 失敗時の通知**
```yaml
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Claude Codeワークフローが失敗しました: ${{ github.event.pull_request.html_url }}"
      }
```

---

## 各方法の比較

| 方法 | ディスク容量 | セットアップ | コスト | 並列度 | おすすめ度 |
|------|------------|------------|--------|--------|----------|
| **複数git checkout** | ❌ 大量 | ⭐⭐⭐ 簡単 | 無料 | 高 | ⭐⭐⭐ |
| **git-worktree** | ✅ 節約 | ⭐⭐ 中程度 | 無料 | 高 | ⭐⭐⭐⭐⭐ |
| **SSH + TMUX** | ✅ サーバー側 | ⭐ 難しい | サーバー代 | 最高 | ⭐⭐⭐⭐ |
| **GitHub Actions** | ✅ ゼロ | ⭐⭐ 中程度 | 実行時間課金 | 最高 | ⭐⭐⭐⭐ |

### 選び方のガイドライン

**ローカル開発で手軽に始めたい**
→ **git-worktree**（方法2）

**リモートサーバーで大規模開発**
→ **SSH + TMUX**（方法3）

**CI/CDパイプラインで自動化**
→ **GitHub Actions**（方法4）

**とにかくシンプルに**
→ **複数git checkout**（方法1）

---

## 実践的な組み合わせ例

### 組み合わせ1: git-worktree + TMUX

```bash
# ローカルでgit-worktreeを使いつつ、TMUXで管理

# TMUXセッションを作成
tmux new -s dev

# ウィンドウ1: mainブランチ
cd ~/myapp
claude

# ウィンドウ2: feature/authブランチ（Ctrl+b → c で新規ウィンドウ）
git worktree add ../myapp-auth feature/auth
cd ../myapp-auth
claude

# ウィンドウ3: feature/uiブランチ
git worktree add ../myapp-ui feature/ui
cd ../myapp-ui
claude

# ウィンドウ間をCtrl+b → 0/1/2で切り替え
```

### 組み合わせ2: GitHub Actions + ローカルgit-worktree

```yaml
# .github/workflows/hybrid.yml
# GitHub ActionsでCIを実行し、ローカルではgit-worktreeで開発

name: Hybrid Workflow

on: [push, pull_request]

jobs:
  # GitHub Actionsで自動レビュー
  auto-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: claude --non-interactive "コードレビューしてください"

  # GitHub Actionsで自動テスト生成
  auto-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate Tests
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: claude --non-interactive "テストを生成してください"
```

```bash
# ローカルではgit-worktreeで並行開発
git worktree add ../myapp-feature1 feature/new-api
git worktree add ../myapp-feature2 feature/new-ui

# 各worktreeでClaude Codeを起動
cd ../myapp-feature1 && claude &
cd ../myapp-feature2 && claude &
```

### 組み合わせ3: SSH + GitHub Actions

```bash
# リモートサーバーで開発しつつ、GitHub ActionsでCI

# リモートサーバーにSSH
ssh devserver

# TMUXで複数のClaude Codeを起動
tmux new -s dev
git worktree add ../myapp-feature feature/new-feature
cd ../myapp-feature
claude

# コミット・プッシュするとGitHub Actionsが自動実行
git add .
git commit -m "feat: 新機能追加"
git push origin feature/new-feature
# → GitHub Actionsで自動テスト・デプロイ
```

---

## トラブルシューティング

### 問題1: ディスク容量不足（複数git checkout）

**症状**:
```bash
error: 'node_modules' could not be created: No space left on device
```

**解決策**:
```bash
# 不要なnode_modulesを削除
find ~/projects -name "node_modules" -type d -prune -exec rm -rf '{}' +

# または、シンボリックリンクで共有
cd myapp-auth
rm -rf node_modules
ln -s ../myapp/node_modules node_modules
```

### 問題2: git-worktreeでブランチが競合

**症状**:
```bash
fatal: 'feature/auth' is already checked out at '/Users/you/myapp-auth'
```

**解決策**:
```bash
# 既存のworktreeを削除してから再作成
git worktree remove myapp-auth
git worktree add ../myapp-auth feature/auth
```

### 問題3: TMUXセッションが見つからない

**症状**:
```bash
tmux attach -t dev
no sessions
```

**解決策**:
```bash
# セッション一覧を確認
tmux ls

# セッション名が違う場合
tmux attach -t 0  # セッション番号で接続

# セッションが本当にない場合は新規作成
tmux new -s dev
```

### 問題4: GitHub Actionsで認証エラー

**症状**:
```
Error: ANTHROPIC_API_KEY is not set
```

**解決策**:
```bash
# リポジトリのSecretsを確認
# GitHub Repository → Settings → Secrets and variables → Actions
# ANTHROPIC_API_KEYが正しく設定されているか確認

# ワークフローファイルで正しく参照しているか確認
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## まとめ

複数のClaude Codeを並列実行することで、**開発効率を大幅に向上**させることができます。

### 重要ポイント

**4つの方法**:
1. **複数git checkout**: シンプルだがディスク容量を消費
2. **git-worktree**: ディスク容量を節約しつつ並列作業（推奨）
3. **SSH + TMUX**: リモートサーバーで高性能な環境を構築
4. **GitHub Actions**: CI/CD環境で完全自動化

**選び方の基準**:
- **ローカル開発**: git-worktree
- **リモート開発**: SSH + TMUX
- **自動化**: GitHub Actions
- **簡単さ重視**: 複数git checkout

**ベストプラクティス**:
- ✅ git-worktreeを基本として採用
- ✅ TMUXでセッション管理を効率化
- ✅ GitHub Actionsで定型作業を自動化
- ✅ 各方法を組み合わせて最大効率化

### 次のステップ

1. **まずはgit-worktreeから始める**: 最もバランスが良く実用的
2. **TMUXを学ぶ**: 複数セッション管理のスキルを習得
3. **GitHub Actionsで自動化**: 定型作業をCIパイプラインに組み込む
4. **チームで共有**: 効率化のノウハウをチーム全体に広める

複数のClaude Codeを並列実行することで、待ち時間を削減し、複数のタスクを同時進行させ、開発速度を飛躍的に向上させましょう！

---

## 参考リンク

- **Git Worktree公式ドキュメント**: https://git-scm.com/docs/git-worktree
- **TMUX公式サイト**: https://github.com/tmux/tmux
- **GitHub Actions公式ドキュメント**: https://docs.github.com/en/actions
- **Claude Code公式ドキュメント**: https://docs.claude.ai/
- **TMUX Cheat Sheet**: https://tmuxcheatsheet.com/
