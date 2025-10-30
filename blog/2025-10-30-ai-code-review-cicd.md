---
slug: ai-code-review-cicd
title: AI コーディングツールを CI/CD パイプラインに組み込む：自動コードレビューと品質チェック
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

コードレビューは開発プロセスの重要な一部ですが、レビュアーの時間を大幅に消費し、プロジェクトのボトルネックになることがあります。AI を活用した自動コードレビューを **CI/CD パイプライン**に組み込むことで、レビューの品質を保ちながら、開発速度を向上させることができます。この記事では、**LiteLLM** を使って AI コードレビューを GitHub Actions に統合し、コスト管理とセキュリティを両立させる方法を解説します。

<!--truncate-->

## なぜ AI コードレビューを CI/CD に組み込むのか

従来のコードレビュープロセスには、以下のような課題があります：

### 従来の課題

1. **レビュアーの負担**
   - シニアエンジニアがレビューに時間を取られ、本来の開発業務に集中できない
   - レビュー待ちで PR のマージが遅延し、開発サイクルが長くなる

2. **一貫性の欠如**
   - レビュアーによって指摘の粒度や厳しさが異なる
   - 疲労や時間帯によってレビューの質がばらつく

3. **基本的なミスの見逃し**
   - セキュリティ上の脆弱性やパフォーマンス問題が見過ごされる
   - コーディング規約違反が放置される

### AI コードレビューのメリット

AI を CI/CD パイプラインに組み込むことで、以下のメリットが得られます：

- **即座のフィードバック**: PR を作成した瞬間に、AI が自動でレビューを開始
- **24/7 稼働**: 時間や曜日に関係なく、常にレビューが実行される
- **一貫性**: 同じ基準で常に一貫したレビューが行われる
- **人間レビュアーの負担軽減**: 基本的なチェックを AI に任せ、人間は設計やビジネスロジックのレビューに集中
- **学習機会**: AI のレビューコメントから、開発者がベストプラクティスを学べる

AI はあくまで**補助ツール**であり、人間のレビューを完全に置き換えるものではありません。基本的なチェックを自動化し、人間は本質的な問題に集中するという**ハイブリッドアプローチ**が効果的です。

---

## アーキテクチャ概要

AI コードレビューを CI/CD パイプラインに組み込む際の全体アーキテクチャは以下のとおりです：

```
┌─────────────────┐
│   Developer     │
│   (PR 作成)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      GitHub Actions Workflow        │
│  ┌──────────────────────────────┐   │
│  │  1. コードチェックアウト      │   │
│  │  2. 変更ファイルの抽出        │   │
│  │  3. AI レビュースクリプト実行  │   │
│  └──────────────┬───────────────┘   │
└─────────────────┼───────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │   LiteLLM Proxy    │
         │  (コスト管理・認証)  │
         └────────┬───────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌─────────────┐   ┌──────────────┐
│ Claude API  │   │ Bedrock API  │
│  (Anthropic)│   │    (AWS)     │
└─────────────┘   └──────────────┘
         │                 │
         └────────┬────────┘
                  ▼
         ┌────────────────────┐
         │  レビューコメント    │
         │   を PR に投稿      │
         └────────────────────┘
```

### コンポーネントの役割

1. **GitHub Actions**: PR 作成時に自動でワークフローをトリガー
2. **LiteLLM Proxy**: API リクエストを一元管理し、コスト管理、認証、ロギングを実施
3. **LLM API**: Claude や GPT-4 などのモデルを使用してコードをレビュー
4. **GitHub API**: レビュー結果を PR にコメントとして投稿

---

## LiteLLM を使った実装手順

### 前提条件

- GitHub リポジトリへの管理者アクセス
- LiteLLM プロキシサーバーが稼働している（オンプレミスまたはクラウド）
- Claude API または Bedrock のアクセス権限

### ステップ 1: LiteLLM プロキシの設定

まず、CI/CD 専用の API キーと予算設定を行います。

**config.yaml**:

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-haiku
    litellm_params:
      model: anthropic/claude-3-5-haiku-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  success_callback: ["langfuse"]  # オプション: ログ記録
  drop_params: True
  cache: true  # 同じコードの再レビューをキャッシュ
  cache_params:
    type: "redis"
    host: "localhost"
    port: 6379
    ttl: 3600  # 1時間キャッシュ

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL
  enforce_budget: true
```

**CI/CD 専用の仮想キーを発行**:

```bash
curl -X POST 'https://litellm.example.com/key/generate' \
  -H 'Authorization: Bearer sk-master-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "key_alias": "cicd-code-review",
    "duration": "365d",
    "max_budget": 500.0,
    "budget_duration": "30d",
    "models": ["claude-haiku"],
    "rpm_limit": 100,
    "tpm_limit": 500000,
    "metadata": {
      "purpose": "cicd-code-review",
      "team": "platform"
    }
  }'
```

**重要なポイント**:
- **Haiku モデル使用**: コストを抑えるため、コードレビューには Haiku を推奨（Sonnet の 1/5 のコスト）
- **レート制限**: 無限ループを防ぐために `rpm_limit` を設定
- **予算上限**: 月 500 ドルに制限し、予期せぬコスト増加を防止

### ステップ 2: GitHub Secrets の設定

GitHub リポジトリの Settings → Secrets and variables → Actions で以下の秘密情報を追加します：

- `LITELLM_API_KEY`: LiteLLM から発行された仮想キー（`sk-litellm-...`）
- `LITELLM_BASE_URL`: LiteLLM プロキシの URL（例: `https://litellm.example.com`）
- `GITHUB_TOKEN`: 自動的に提供される（PR にコメントを投稿するため）

### ステップ 3: AI レビュースクリプトの作成

`.github/scripts/ai-code-review.py` を作成します：

```python
#!/usr/bin/env python3
import os
import sys
import json
from openai import OpenAI
from github import Github

def get_changed_files(repo, pr_number):
    """PR で変更されたファイルを取得"""
    pr = repo.get_pull(pr_number)
    files = pr.get_files()

    changed_files = []
    for file in files:
        # バイナリファイルやテストファイルをスキップ
        if file.filename.endswith(('.jpg', '.png', '.pdf', '.lock')):
            continue

        # パッチ（差分）を取得
        if file.patch:
            changed_files.append({
                'filename': file.filename,
                'patch': file.patch,
                'status': file.status
            })

    return changed_files

def review_code_with_ai(client, file_info):
    """AI でコードをレビュー"""
    filename = file_info['filename']
    patch = file_info['patch']
    status = file_info['status']

    prompt = f"""あなたは経験豊富なシニアエンジニアです。以下の変更内容をレビューしてください。

ファイル: {filename}
ステータス: {status}

変更内容:
```
{patch}
```

以下の観点でレビューしてください：
1. **セキュリティ**: SQL インジェクション、XSS、認証・認可の問題、機密情報の漏洩
2. **パフォーマンス**: N+1 クエリ、無駄なループ、メモリリーク
3. **コード品質**: 命名規約、可読性、重複コード、エラーハンドリング
4. **ベストプラクティス**: 言語固有の慣例、設計パターン
5. **潜在的なバグ**: null/undefined 参照、境界条件、競合状態

重大な問題がある場合のみ指摘してください。軽微な問題は無視してください。

出力形式:
- 問題がない場合: "LGTM: 特に問題は見つかりませんでした。"
- 問題がある場合: 各問題を箇条書きで、具体的な改善案とともに記載

レビュー:"""

    try:
        response = client.chat.completions.create(
            model="claude-haiku",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.3
        )

        return response.choices[0].message.content
    except Exception as e:
        return f"エラーが発生しました: {str(e)}"

def post_review_comment(repo, pr_number, comments):
    """PR にレビューコメントを投稿"""
    pr = repo.get_pull(pr_number)

    # コメントを整形
    body = "## 🤖 AI コードレビュー\n\n"
    body += "AI によるコードレビュー結果です。参考としてご活用ください。\n\n"

    for comment in comments:
        body += f"### 📄 `{comment['filename']}`\n\n"
        body += f"{comment['review']}\n\n"
        body += "---\n\n"

    body += "*このレビューは AI によって自動生成されました。最終的な判断は人間のレビュアーにお任せします。*"

    pr.create_issue_comment(body)

def main():
    # 環境変数から設定を取得
    github_token = os.environ.get('GITHUB_TOKEN')
    litellm_api_key = os.environ.get('LITELLM_API_KEY')
    litellm_base_url = os.environ.get('LITELLM_BASE_URL')
    repo_name = os.environ.get('GITHUB_REPOSITORY')
    pr_number = int(os.environ.get('PR_NUMBER'))

    if not all([github_token, litellm_api_key, litellm_base_url, repo_name, pr_number]):
        print("必要な環境変数が設定されていません")
        sys.exit(1)

    # GitHub クライアントの初期化
    g = Github(github_token)
    repo = g.get_repo(repo_name)

    # OpenAI クライアント（LiteLLM 経由）の初期化
    client = OpenAI(
        api_key=litellm_api_key,
        base_url=litellm_base_url
    )

    # 変更ファイルを取得
    print(f"PR #{pr_number} の変更ファイルを取得中...")
    changed_files = get_changed_files(repo, pr_number)

    if not changed_files:
        print("レビュー対象のファイルがありません")
        return

    print(f"{len(changed_files)} ファイルをレビューします...")

    # 各ファイルをレビュー
    comments = []
    for file_info in changed_files:
        print(f"レビュー中: {file_info['filename']}")
        review = review_code_with_ai(client, file_info)

        comments.append({
            'filename': file_info['filename'],
            'review': review
        })

    # レビュー結果を PR に投稿
    print("レビュー結果を投稿中...")
    post_review_comment(repo, pr_number, comments)

    print("✅ AI コードレビュー完了")

if __name__ == "__main__":
    main()
```

### ステップ 4: GitHub Actions ワークフローの作成

`.github/workflows/ai-code-review.yml` を作成します：

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]
    # 特定のブランチのみ対象にする場合
    branches:
      - main
      - develop

jobs:
  ai-code-review:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install openai PyGithub

      - name: Run AI Code Review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          LITELLM_API_KEY: ${{ secrets.LITELLM_API_KEY }}
          LITELLM_BASE_URL: ${{ secrets.LITELLM_BASE_URL }}
          GITHUB_REPOSITORY: ${{ github.repository }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: |
          python .github/scripts/ai-code-review.py

      - name: Comment on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ AI コードレビューの実行中にエラーが発生しました。詳細は Actions ログを確認してください。'
            })
```

### ステップ 5: テスト実行

1. 新しいブランチを作成し、コードを変更
2. PR を作成
3. GitHub Actions が自動的に起動し、AI レビューが実行される
4. PR に AI のレビューコメントが投稿される

---

## コスト管理のベストプラクティス

AI コードレビューを CI/CD に組み込む際、コストが急増するリスクがあります。以下の戦略で効果的にコストを管理します。

### 1. 適切なモデル選択

| モデル | 用途 | コスト（概算） | 推奨シーン |
|--------|------|---------------|-----------|
| Claude Haiku | 基本的なコードレビュー | $0.001/1K tokens | 日常的な PR レビュー |
| Claude Sonnet | 複雑なリファクタリング | $0.003/1K tokens | 大規模変更のレビュー |
| Claude Opus | アーキテクチャレビュー | $0.015/1K tokens | クリティカルな変更のみ |

**推奨**: 95% のレビューには **Haiku** を使用し、特別なケースのみ Sonnet/Opus を使用

### 2. レビュー対象の絞り込み

すべてのファイルをレビューするのではなく、重要なファイルのみに絞り込みます：

```python
def should_review_file(filename):
    """レビュー対象かどうかを判定"""
    # スキップするファイル
    skip_patterns = [
        r'\.lock$',           # ロックファイル
        r'\.json$',           # JSON 設定ファイル
        r'\.md$',             # ドキュメント
        r'^test/',            # テストファイル（オプション）
        r'^vendor/',          # サードパーティライブラリ
        r'^node_modules/',    # 依存関係
        r'\.min\.js$',        # ミニファイル
        r'package-lock\.json' # npm ロックファイル
    ]

    for pattern in skip_patterns:
        if re.search(pattern, filename):
            return False

    # レビュー対象の拡張子
    review_extensions = ['.py', '.js', '.ts', '.java', '.go', '.rb', '.php', '.rs']
    return any(filename.endswith(ext) for ext in review_extensions)
```

### 3. 差分サイズの制限

大きすぎる PR は API コストが高くなるため、制限を設けます：

```python
def get_changed_files(repo, pr_number, max_lines=500):
    """変更行数が制限内のファイルのみ取得"""
    pr = repo.get_pull(pr_number)
    files = pr.get_files()

    changed_files = []
    total_lines = 0

    for file in files:
        if not should_review_file(file.filename):
            continue

        # パッチの行数をカウント
        if file.patch:
            lines = len(file.patch.split('\n'))

            if total_lines + lines > max_lines:
                print(f"⚠️ 変更行数が {max_lines} 行を超えたため、残りのファイルはスキップします")
                break

            changed_files.append({
                'filename': file.filename,
                'patch': file.patch,
                'status': file.status
            })

            total_lines += lines

    return changed_files
```

### 4. キャッシュの活用

LiteLLM のキャッシュ機能を使って、同じコードの再レビューを防ぎます：

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: "redis"
    host: "localhost"
    port: 6379
    ttl: 3600  # 1時間キャッシュ
```

同じコードブロックが複数回レビューされる場合（リベースや再プッシュ）、キャッシュから結果を返すため、API コストを削減できます。

### 5. 予算アラートの設定

LiteLLM で予算の 80% に達したら Slack で通知：

```yaml
general_settings:
  alerting:
    - slack_webhook_url: os.environ/SLACK_WEBHOOK_URL
      budget_threshold: 80
      alert_types: ["budget_alerts"]
```

### 6. 使用状況の定期レポート

月次でコスト分析レポートを生成し、最適化の機会を見つけます：

```bash
# LiteLLM ダッシュボードで確認
curl -X GET 'https://litellm.example.com/spend/tags' \
  -H 'Authorization: Bearer sk-master-1234' \
  | jq '.data[] | select(.metadata.purpose == "cicd-code-review")'
```

---

## セキュリティ考慮事項

AI コードレビューを CI/CD に組み込む際、セキュリティリスクを適切に管理する必要があります。

### 1. API キーの安全な管理

**やってはいけないこと**:
- ❌ GitHub Actions ワークフローに API キーを直接記述
- ❌ `.env` ファイルをリポジトリにコミット
- ❌ ログに API キーを出力

**ベストプラクティス**:
- ✅ GitHub Secrets を使用して API キーを保存
- ✅ LiteLLM の仮想キーを使用し、実際の API キーは LiteLLM サーバーが管理
- ✅ キーに最小権限を設定（CI/CD 専用キーは他の用途に使用不可）

**キーのローテーション**:

```bash
# 古いキーを無効化
curl -X DELETE 'https://litellm.example.com/key/delete' \
  -H 'Authorization: Bearer sk-master-1234' \
  -d '{"key": "sk-litellm-old-key"}'

# 新しいキーを発行
curl -X POST 'https://litellm.example.com/key/generate' \
  -H 'Authorization: Bearer sk-master-1234' \
  -d '{
    "key_alias": "cicd-code-review-new",
    "duration": "365d",
    "max_budget": 500.0,
    "models": ["claude-haiku"]
  }'
```

定期的（3ヶ月ごとなど）にキーをローテーションすることで、漏洩リスクを軽減します。

### 2. コードの機密性保護

**リスク**: コードが外部の LLM API に送信されることで、機密情報が漏洩する可能性

**対策**:

1. **機密情報のフィルタリング**:

```python
import re

def sanitize_code(code):
    """機密情報をマスクする"""
    # API キーやトークンをマスク
    code = re.sub(r'(api[_-]?key|token|secret)["\s:=]+["\']?[\w-]+["\']?',
                  r'\1="***REDACTED***"', code, flags=re.IGNORECASE)

    # パスワードをマスク
    code = re.sub(r'(password|passwd)["\s:=]+["\']?[^"\']+["\']?',
                  r'\1="***REDACTED***"', code, flags=re.IGNORECASE)

    # メールアドレスをマスク
    code = re.sub(r'\b[\w.-]+@[\w.-]+\.\w+\b', '***@***.***', code)

    return code

def review_code_with_ai(client, file_info):
    filename = file_info['filename']
    patch = file_info['patch']

    # 機密情報をマスク
    sanitized_patch = sanitize_code(patch)

    prompt = f"""ファイル: {filename}

変更内容:
```
{sanitized_patch}
```

レビューしてください。"""

    # ... レビュー実行
```

2. **特定のファイルをレビューから除外**:

```python
def is_sensitive_file(filename):
    """機密ファイルかどうかを判定"""
    sensitive_patterns = [
        r'\.env',
        r'secrets\.yaml',
        r'credentials\.json',
        r'config/production\.yml',
        r'private_key\.pem'
    ]

    for pattern in sensitive_patterns:
        if re.search(pattern, filename):
            return True
    return False
```

3. **プライベート LLM の使用**:

機密性の高いプロジェクトでは、AWS Bedrock や Azure OpenAI など、自社のクラウド環境内で動作する LLM を使用します：

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-sonnet-4-5-v1:0
      aws_region_name: us-east-1
      # Bedrock は AWS アカウント内でデータが処理される
```

### 3. 監査ログの保存

すべての AI レビューリクエストをログに記録し、後から監査できるようにします：

```yaml
litellm_settings:
  success_callback: ["s3"]
  failure_callback: ["s3"]

general_settings:
  s3_callback_params:
    s3_bucket_name: "cicd-ai-review-logs"
    s3_region_name: "us-east-1"
    s3_path: "logs/{year}/{month}/{day}/"

  # リクエストとレスポンスを記録
  log_requests: true
  log_responses: true
```

ログには以下の情報が含まれます：
- リクエスト日時
- PR 番号とリポジトリ名
- レビュー対象のファイル
- 使用したモデル
- トークン数とコスト
- レビュー結果

### 4. アクセス制御

LiteLLM で IP アドレス制限を設定し、GitHub Actions のランナー IP のみを許可：

```yaml
general_settings:
  allowed_ips:
    - "192.30.252.0/22"  # GitHub Actions の IP レンジ
    - "185.199.108.0/22"
    - "140.82.112.0/20"
```

### 5. レート制限の設定

無限ループや攻撃から保護するため、CI/CD キーに厳格なレート制限を設定：

```bash
curl -X POST 'https://litellm.example.com/key/generate' \
  -H 'Authorization: Bearer sk-master-1234' \
  -d '{
    "key_alias": "cicd-code-review",
    "rpm_limit": 100,     # 1分あたり100リクエスト
    "tpm_limit": 500000,  # 1分あたり500Kトークン
    "max_parallel_requests": 10
  }'
```

---

## 実践的なユースケース

### ユースケース 1: セキュリティ重視のレビュー

セキュリティに特化したレビュープロンプトを使用：

```python
def security_review_prompt(filename, patch):
    return f"""あなたはセキュリティ専門家です。以下のコード変更をセキュリティの観点から厳密にレビューしてください。

ファイル: {filename}

変更内容:
```
{patch}
```

以下のセキュリティリスクを重点的にチェック:
1. SQL インジェクション、NoSQL インジェクション
2. XSS（クロスサイトスクリプティング）
3. CSRF（クロスサイトリクエストフォージェリ）
4. 認証・認可のバイパス
5. 機密情報のハードコーディング（API キー、パスワード）
6. 安全でない暗号化アルゴリズム
7. パストラバーサル、ディレクトリトラバーサル
8. コマンドインジェクション
9. XML 外部エンティティ（XXE）攻撃
10. 安全でないデシリアライゼーション

重大なセキュリティ問題がある場合は「🔴 CRITICAL」、中程度の場合は「🟡 WARNING」のマークを付けてください。

レビュー:"""
```

### ユースケース 2: パフォーマンス重視のレビュー

特定のファイル（データベースクエリ、API エンドポイントなど）にはパフォーマンス重視のレビュー：

```python
def performance_review_prompt(filename, patch):
    return f"""あなたはパフォーマンスエンジニアです。以下のコード変更をパフォーマンスの観点からレビューしてください。

ファイル: {filename}

変更内容:
```
{patch}
```

以下の観点でチェック:
1. N+1 クエリ問題
2. インデックスの欠如
3. 不要なデータベースラウンドトリップ
4. メモリリーク
5. 無駄なループや再計算
6. キャッシュの機会
7. 非同期処理の機会
8. バッチ処理の機会

具体的な改善案とともに、推定されるパフォーマンス影響を記載してください。

レビュー:"""
```

### ユースケース 3: コードスタイルとベストプラクティス

新人エンジニアの PR には、教育的なレビューを提供：

```python
def educational_review_prompt(filename, patch):
    return f"""あなたは親切なメンターです。以下のコード変更をレビューし、ベストプラクティスを教えてください。

ファイル: {filename}

変更内容:
```
{patch}
```

以下の観点でレビュー:
1. 命名規約（変数名、関数名、クラス名）
2. コードの可読性と保守性
3. DRY 原則（重複コードの排除）
4. SOLID 原則
5. エラーハンドリング
6. ドキュメンテーション（コメント、docstring）
7. 言語固有のベストプラクティス

批判的ではなく、教育的な tone で、なぜそのプラクティスが重要かを説明してください。

レビュー:"""
```

### ユースケース 4: モノレポでのディレクトリ別モデル選択

モノレポで、重要なディレクトリには Sonnet、その他には Haiku を使用：

```python
def select_model_for_file(filename):
    """ファイルパスに応じてモデルを選択"""
    critical_paths = [
        'src/auth/',       # 認証モジュール
        'src/payments/',   # 決済モジュール
        'src/api/core/',   # コア API
    ]

    for path in critical_paths:
        if filename.startswith(path):
            return "claude-sonnet"  # より高精度なモデル

    return "claude-haiku"  # コスト効率の良いモデル

# レビュー時にモデルを動的に選択
model = select_model_for_file(file_info['filename'])
response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": prompt}],
    max_tokens=1500
)
```

---

## 高度な機能

### 1. レビューの重要度スコアリング

AI のレビュー結果に重要度スコアを付け、人間レビュアーが優先すべき問題を明確にします：

```python
def score_review(review_text):
    """レビューの重要度をスコアリング"""
    critical_keywords = ['critical', 'security', 'vulnerability', 'injection', 'leak']
    warning_keywords = ['warning', 'performance', 'memory', 'inefficient']

    score = 0
    for keyword in critical_keywords:
        if keyword.lower() in review_text.lower():
            score += 10

    for keyword in warning_keywords:
        if keyword.lower() in review_text.lower():
            score += 5

    if 'lgtm' in review_text.lower():
        score = 0

    return score

# レビューコメントにスコアを追加
for comment in comments:
    score = score_review(comment['review'])
    if score >= 10:
        comment['priority'] = '🔴 High Priority'
    elif score >= 5:
        comment['priority'] = '🟡 Medium Priority'
    else:
        comment['priority'] = '🟢 Low Priority'
```

### 2. 自動ラベル付け

AI のレビュー結果に基づいて、PR に自動的にラベルを付けます：

```python
def add_labels_based_on_review(repo, pr_number, comments):
    """レビュー結果に基づいてラベルを付与"""
    pr = repo.get_pull(pr_number)
    labels_to_add = []

    for comment in comments:
        review = comment['review'].lower()

        if 'security' in review or 'vulnerability' in review:
            labels_to_add.append('security-review-needed')

        if 'performance' in review:
            labels_to_add.append('performance-review-needed')

        if 'lgtm' in review:
            labels_to_add.append('ai-approved')

    if labels_to_add:
        pr.add_to_labels(*labels_to_add)
```

### 3. 複数モデルの併用

異なるモデルでレビューし、結果を比較：

```python
def multi_model_review(clients, file_info):
    """複数のモデルでレビューし、統合結果を返す"""
    models = ['claude-haiku', 'claude-sonnet']
    reviews = []

    for model in models:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500
        )
        reviews.append(response.choices[0].message.content)

    # 共通の指摘を抽出（両方のモデルが指摘した問題は重要）
    common_issues = find_common_issues(reviews)

    return format_multi_model_review(reviews, common_issues)
```

---

## トラブルシューティング

### Q: GitHub Actions が LiteLLM プロキシに接続できない

A: 以下を確認してください：

1. **ネットワーク接続**: GitHub Actions ランナーが LiteLLM プロキシにアクセスできるか
   ```bash
   # ワークフローでテスト
   - name: Test connectivity
     run: curl -I ${{ secrets.LITELLM_BASE_URL }}/health
   ```

2. **ファイアウォール設定**: LiteLLM プロキシが GitHub Actions の IP レンジを許可しているか

3. **URL の形式**: `https://` プロトコルを含んでいるか確認

### Q: API コストが予想以上に高い

A: 以下を確認してください：

1. **レビュー対象ファイルの絞り込み**: 不要なファイル（lock ファイル、バイナリなど）をスキップしているか

2. **差分サイズの制限**: 大きすぎる PR をレビューしていないか

3. **キャッシュの有効化**: LiteLLM のキャッシュ設定を確認

4. **使用モデル**: Sonnet/Opus ではなく Haiku を使用しているか

5. **LiteLLM ダッシュボードで分析**:
   ```bash
   # コスト分析
   curl -X GET 'https://litellm.example.com/spend/tags' \
     -H 'Authorization: Bearer sk-master-1234'
   ```

### Q: AI のレビューコメントが的外れ

A: プロンプトを改善してください：

1. **具体的な指示**: レビューの観点を明確に指定
2. **例示**: 良いレビューの例を few-shot として提供
3. **コンテキストの追加**: ファイルの役割や関連する設計情報を含める
4. **モデルの変更**: Haiku で精度が低い場合、Sonnet を試す

### Q: レビューが遅い

A: 並列処理を導入してください：

```python
import concurrent.futures

def review_files_in_parallel(client, changed_files, max_workers=5):
    """複数ファイルを並列でレビュー"""
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(review_code_with_ai, client, file_info): file_info
            for file_info in changed_files
        }

        comments = []
        for future in concurrent.futures.as_completed(futures):
            file_info = futures[future]
            try:
                review = future.result()
                comments.append({
                    'filename': file_info['filename'],
                    'review': review
                })
            except Exception as e:
                print(f"エラー: {file_info['filename']} - {e}")

        return comments
```

---

## まとめ

AI コードレビューを CI/CD パイプラインに組み込むことで、開発プロセスが大幅に改善されます：

### 得られるメリット

1. **開発速度の向上**
   - 即座のフィードバックで、レビュー待ち時間を削減
   - 基本的なチェックを自動化し、人間は本質的な問題に集中

2. **コード品質の向上**
   - 一貫した基準でレビューが実施される
   - セキュリティやパフォーマンスの問題を早期発見

3. **学習機会の提供**
   - AI のレビューコメントからベストプラクティスを学べる
   - 新人エンジニアの教育ツールとして活用

4. **コストの最適化**
   - LiteLLM で予算管理、レート制限、キャッシュを実装
   - 適切なモデル選択とレビュー対象の絞り込みでコストを抑制

5. **セキュリティの強化**
   - API キーの安全な管理と監査ログで、リスクを軽減
   - 機密情報のフィルタリングとプライベート LLM の活用

### 導入ステップ

1. **LiteLLM プロキシのセットアップ**: CI/CD 専用キーを発行し、予算とレート制限を設定
2. **GitHub Secrets の設定**: API キーと URL を安全に保存
3. **レビュースクリプトの作成**: Python スクリプトで AI レビューロジックを実装
4. **GitHub Actions ワークフローの作成**: PR 作成時に自動実行
5. **プロンプトの最適化**: プロジェクトに合わせてレビュー観点をカスタマイズ
6. **コスト監視**: LiteLLM ダッシュボードで定期的にコストを確認
7. **継続的改善**: フィードバックを基にプロンプトとフィルタリングを改善

### 注意点

- AI レビューは**補助ツール**であり、人間のレビューを完全に置き換えるものではありません
- 機密性の高いコードは、プライベート LLM またはフィルタリングを使用
- コスト管理を怠ると、予想外の請求が発生する可能性があります
- 定期的にプロンプトとレビュー結果を評価し、精度を向上させましょう

AI を活用した自動コードレビューで、開発チームの生産性を向上させ、高品質なソフトウェアを効率的に提供しましょう！
