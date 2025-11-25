---
slug: github-actions-cicd-guide
title: GitHub Actions CI/CD実践ガイド - 自動化で開発効率を最大化
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [GitHub Actions, CI/CD, DevOps, 自動化]
---

GitHub Actionsは、GitHubに組み込まれたCI/CDプラットフォームです。本記事では、基本概念から実践的なワークフロー構築まで、すぐに使える知識を解説します。

<!--truncate-->

## GitHub Actionsとは

GitHub Actionsは、コードのビルド、テスト、デプロイを自動化するためのCI/CDプラットフォームです。GitHubリポジトリに直接統合されており、追加のサービス契約なしで利用できます。

### 主なメリット

- **GitHubとの統合**: PR、Issue、リリースなどのイベントと連携
- **無料枠**: パブリックリポジトリは無制限、プライベートでも月2,000分まで無料
- **豊富なマーケットプレイス**: 数千の公開アクションを再利用可能
- **マトリックスビルド**: 複数の環境で並列テストが可能

## 基本概念

### ワークフローの構成要素

```
┌─────────────────────────────────────────┐
│ Workflow（.github/workflows/*.yml）     │
│  ├─ Event（トリガー）                    │
│  └─ Jobs（並列実行可能）                 │
│       └─ Steps（順次実行）               │
│            └─ Actions または コマンド    │
└─────────────────────────────────────────┘
```

| 要素 | 説明 |
|------|------|
| **Workflow** | 自動化プロセス全体。YAMLファイルで定義 |
| **Event** | ワークフローを起動するトリガー |
| **Job** | 同一ランナーで実行されるステップの集合 |
| **Step** | 個々のタスク（コマンドまたはアクション） |
| **Action** | 再利用可能なワークフローの単位 |
| **Runner** | ワークフローを実行するサーバー |

## CI（継続的インテグレーション）の実装

### 基本的なCIワークフロー

プルリクエストごとにコードの品質をチェックするワークフローです：

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  ci:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node: [18, 20]  # 複数バージョンでテスト

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

### ポイント解説

#### 1. トリガーの設定（on）

```yaml
on:
  push:
    branches: [main]      # mainへのpushで実行
  pull_request:
    branches: [main]      # mainへのPRで実行
  workflow_dispatch:       # 手動実行を許可
  schedule:
    - cron: '0 0 * * *'   # 毎日0時に実行
```

#### 2. マトリックスビルド

複数の環境で並列テストを実行：

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]
  fail-fast: false  # 1つ失敗しても他を継続
```

#### 3. キャッシュの活用

ビルド時間を短縮するためにキャッシュを活用：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'  # node_modulesを自動キャッシュ
```

手動でキャッシュする場合：

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## CD（継続的デプロイ）の実装

### GitHub Pagesへのデプロイ

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 全履歴を取得

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Install dependencies
        run: npm ci

      - name: Build website
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./build

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### AWSへのデプロイ（S3 + CloudFront）

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install and Build
        run: |
          npm ci
          npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Deploy to S3
        run: aws s3 sync ./build s3://${{ secrets.S3_BUCKET }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

## 実践的なワークフローパターン

### 1. 条件付き実行

```yaml
steps:
  - name: Deploy to production
    if: github.ref == 'refs/heads/main'
    run: ./deploy-prod.sh

  - name: Deploy to staging
    if: github.ref == 'refs/heads/develop'
    run: ./deploy-staging.sh

  - name: Run only on PR
    if: github.event_name == 'pull_request'
    run: echo "This is a PR"
```

### 2. シークレットの管理

リポジトリ設定でシークレットを登録し、ワークフローで参照：

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**注意**: シークレットはログに出力されないよう自動的にマスクされます。

### 3. ジョブ間の依存関係

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    needs: test  # testジョブの完了後に実行
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  deploy:
    needs: [test, build]  # 両方の完了後に実行
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

### 4. アーティファクトの共有

ジョブ間でファイルを共有：

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: ./build
          retention-days: 1

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: ./build
      - run: ./deploy.sh
```

### 5. 環境変数とコンテキスト

```yaml
env:
  NODE_ENV: production  # ワークフロー全体で使用

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      CI: true  # ジョブレベルの環境変数
    steps:
      - name: Show context
        run: |
          echo "Repository: ${{ github.repository }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "SHA: ${{ github.sha }}"
          echo "Actor: ${{ github.actor }}"
```

## よく使うアクション

| アクション | 用途 |
|-----------|------|
| `actions/checkout@v4` | リポジトリのチェックアウト |
| `actions/setup-node@v4` | Node.js環境のセットアップ |
| `actions/setup-python@v5` | Python環境のセットアップ |
| `actions/cache@v4` | 依存関係のキャッシュ |
| `actions/upload-artifact@v4` | アーティファクトのアップロード |
| `actions/download-artifact@v4` | アーティファクトのダウンロード |
| `aws-actions/configure-aws-credentials@v4` | AWS認証情報の設定 |
| `docker/build-push-action@v5` | Dockerイメージのビルド&プッシュ |

## トラブルシューティング

### よくある問題と解決策

#### 1. キャッシュが効かない

```yaml
# キーにファイルハッシュを含める
key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

#### 2. 権限エラー

```yaml
permissions:
  contents: write   # プッシュする場合
  pull-requests: write  # PRにコメントする場合
  issues: write    # Issueを操作する場合
```

#### 3. タイムアウト

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # デフォルトは360分
```

#### 4. 同時実行の制御

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # 古い実行をキャンセル
```

## ベストプラクティス

### 1. ワークフローの分割

機能ごとにワークフローを分割して管理しやすくする：

```
.github/workflows/
├── ci.yml          # テスト・リント
├── deploy.yml      # デプロイ
├── release.yml     # リリース作成
└── codeql.yml      # セキュリティスキャン
```

### 2. 再利用可能なワークフロー

共通処理を再利用可能なワークフローとして定義：

```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci && npm run build
```

呼び出し側：

```yaml
jobs:
  call-build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '20'
```

### 3. セキュリティ

- シークレットは環境変数として渡す
- サードパーティアクションは特定のバージョンを指定
- `pull_request_target`の使用は慎重に

```yaml
# バージョンを固定（SHA推奨）
- uses: actions/checkout@v4  # タグ指定
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # SHA指定
```

## まとめ

GitHub Actionsを活用することで、以下のメリットが得られます：

- **品質向上**: 自動テストで問題を早期発見
- **効率化**: 手動作業を削減
- **一貫性**: 同じ環境で毎回ビルド
- **可視性**: PRにビルド状態が表示される

まずは簡単なCIワークフローから始めて、徐々にデプロイの自動化まで拡張していくことをおすすめします。

## 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions)
- [GitHub Actionsマーケットプレイス](https://github.com/marketplace?type=actions)
- [ワークフロー構文リファレンス](https://docs.github.com/ja/actions/using-workflows/workflow-syntax-for-github-actions)
