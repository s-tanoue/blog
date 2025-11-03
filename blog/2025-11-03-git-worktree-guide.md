---
slug: git-worktree-guide
title: Git Worktree完全ガイド：複数ブランチを同時に扱う最強テクニック
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

複数のブランチを同時に作業したい、テスト中に別のブランチで緊急対応が必要になった…こんな経験はありませんか？**Git Worktree（ワークツリー）**を使えば、1つのリポジトリで複数のブランチを同時にチェックアウトして作業できます。この記事では、git worktreeの基本から実践的な活用法、よくあるトラブルと解決策まで、わかりやすく徹底解説します。

<!--truncate-->

## Git Worktreeとは何か

**Git Worktree（ワークツリー）**は、1つのGitリポジトリで**複数の作業ディレクトリ**を持てる機能です。通常、Gitリポジトリは1つの作業ディレクトリ（ワークツリー）しか持てませんが、worktreeを使うと複数のディレクトリで異なるブランチを同時にチェックアウトできます。

### 通常のGit操作の制限

通常、Gitでは以下のような制限があります：

```bash
# feature-aブランチで作業中
git checkout feature-a

# 別のブランチに切り替えたい
git checkout main  # ❌ 未コミットの変更があるとエラー

# stashして切り替え（面倒）
git stash
git checkout main
# ...作業...
git checkout feature-a
git stash pop
```

### Git Worktreeを使うと

```bash
# mainブランチはメインディレクトリ
~/project/

# feature-aブランチは別ディレクトリで同時に開ける
~/project-worktrees/feature-a/

# feature-bブランチも別ディレクトリで同時に開ける
~/project-worktrees/feature-b/
```

**それぞれ独立したディレクトリ**なので、ブランチを切り替える必要がなく、同時に作業できます。

### Git Worktreeの仕組み

```
プロジェクト構造のイメージ：

~/project/                    ← メインのworktree（mainブランチ）
  ├── .git/                   ← Gitリポジトリ本体
  ├── src/
  └── README.md

~/project-worktrees/
  ├── feature-a/              ← 追加worktree（feature-aブランチ）
  │   ├── .git（ファイル）    ← メインの.gitへのリンク
  │   ├── src/
  │   └── README.md
  │
  └── hotfix-bug/             ← 追加worktree（hotfix-bugブランチ）
      ├── .git（ファイル）
      ├── src/
      └── README.md

すべてのworktreeは同じGitリポジトリ（~/project/.git/）を共有
```

---

## なぜGit Worktreeが必要なのか

### 従来の方法の課題

#### 1. ブランチ切り替えの煩雑さ

```bash
# feature-aで作業中
git checkout feature-a
# ...コーディング...

# 緊急バグ修正のためmainに切り替え
git stash                # 変更を一時退避
git checkout main        # ブランチ切り替え
git checkout -b hotfix   # 修正用ブランチ作成
# ...バグ修正...
git checkout feature-a   # 元のブランチに戻る
git stash pop            # 変更を復元
```

#### 2. リポジトリを複数クローンする無駄

```bash
# 従来のアプローチ（非効率）
git clone https://github.com/user/project.git project-main
git clone https://github.com/user/project.git project-feature
git clone https://github.com/user/project.git project-hotfix

# 問題点：
# - ディスクスペースの無駄（.gitが3つ）
# - fetch/pullを各リポジトリで実行する必要
# - 設定が各リポジトリで独立（共有できない）
```

#### 3. 未コミットの変更との戦い

```bash
# よくあるエラー
$ git checkout main
error: Your local changes to the following files would be overwritten by checkout:
    src/app.js
Please commit your changes or stash them before you switch branches.
```

### Git Worktreeのメリット

#### 1. 同時作業が可能

複数のブランチを**同時に開いて作業**できます：

```bash
# ターミナル1: feature-aで開発
cd ~/project-worktrees/feature-a
npm run dev

# ターミナル2: mainでテスト実行
cd ~/project
npm test

# ターミナル3: hotfixで緊急修正
cd ~/project-worktrees/hotfix
vim src/critical-bug.js
```

#### 2. ディスクスペースの効率化

`.git`ディレクトリは**1つだけ**で、worktreeは作業ファイルのみを持ちます：

```bash
# ディスク使用量の比較

# 複数クローン（非効率）
project-main/.git/    → 500MB
project-feature/.git/ → 500MB
project-hotfix/.git/  → 500MB
合計: 1500MB

# worktree（効率的）
project/.git/                  → 500MB
project-worktrees/feature-a/   → 作業ファイルのみ（50MB）
project-worktrees/hotfix/      → 作業ファイルのみ（50MB）
合計: 600MB
```

#### 3. 設定とデータの共有

すべてのworktreeが同じ`.git`を共有するため：

- **fetch/pullは1回だけ**: 全worktreeに反映される
- **設定が共有**: `.gitconfig`の設定が全worktreeで有効
- **reflogが共有**: すべてのコミット履歴を一元管理

#### 4. IDEで複数プロジェクトを開ける

```bash
# VS Codeで複数worktreeを同時に開く
code ~/project                        # mainブランチ
code ~/project-worktrees/feature-a    # feature-aブランチ
code ~/project-worktrees/hotfix       # hotfixブランチ

# それぞれ独立したウィンドウで開発できる
```

#### 5. ビルドやテストの並行実行

```bash
# mainブランチでビルド実行中
cd ~/project
npm run build  # 実行中...

# 同時にfeature-aでテスト実行
cd ~/project-worktrees/feature-a
npm test  # ブロックされない！
```

---

## Git Worktreeの基本的な使い方

### 1. worktreeを追加する

新しいworktreeを作成します。

```bash
# 基本構文
git worktree add <path> <branch>

# 例：feature-aブランチのworktreeを作成
git worktree add ../project-worktrees/feature-a feature-a

# 新しいブランチを作成してworktreeを追加
git worktree add -b feature-b ../project-worktrees/feature-b main

# デフォルトのパスに作成（.git/worktrees配下）
git worktree add ../feature-a feature-a
```

**実行例**:

```bash
$ cd ~/project

$ git worktree add ../project-worktrees/feature-login feature-login
Preparing worktree (checking out 'feature-login')
HEAD is now at a1b2c3d Add login form

$ ls ~/project-worktrees/
feature-login/

$ cd ~/project-worktrees/feature-login
$ git branch
* feature-login
  main
```

### 2. worktreeの一覧を確認する

```bash
# worktree一覧を表示
git worktree list

# 詳細情報付きで表示
git worktree list --porcelain
```

**実行例**:

```bash
$ git worktree list
/Users/username/project              a1b2c3d [main]
/Users/username/project-worktrees/feature-a  e4f5g6h [feature-a]
/Users/username/project-worktrees/hotfix     i7j8k9l [hotfix]

$ git worktree list --porcelain
worktree /Users/username/project
HEAD a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
branch refs/heads/main

worktree /Users/username/project-worktrees/feature-a
HEAD e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3
branch refs/heads/feature-a

worktree /Users/username/project-worktrees/hotfix
HEAD i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6
branch refs/heads/hotfix
```

### 3. worktreeを削除する

作業が終わったworktreeを削除します。

```bash
# worktreeディレクトリを削除
rm -rf ../project-worktrees/feature-a

# Gitからworktreeを削除
git worktree remove ../project-worktrees/feature-a

# または、ディレクトリを削除した後にprune
rm -rf ../project-worktrees/feature-a
git worktree prune
```

**実行例**:

```bash
$ git worktree list
/Users/username/project              a1b2c3d [main]
/Users/username/project-worktrees/feature-a  e4f5g6h [feature-a]

$ git worktree remove ../project-worktrees/feature-a
$ git worktree list
/Users/username/project              a1b2c3d [main]

# ディレクトリが残っている場合はpruneで整理
$ git worktree prune
```

### 4. worktreeを移動する

worktreeを別のディレクトリに移動します。

```bash
# worktreeを移動
git worktree move <old-path> <new-path>

# 例
git worktree move ../project-worktrees/feature-a ../worktrees/feature-a
```

### 5. worktreeをロックする

誤って削除されないようにworktreeをロックします。

```bash
# worktreeをロック
git worktree lock ../project-worktrees/feature-a

# アンロック
git worktree unlock ../project-worktrees/feature-a

# ロック理由を指定
git worktree lock --reason "作業中のため削除禁止" ../project-worktrees/feature-a
```

---

## 実践的なGit Worktreeの活用例

### ユースケース1: フィーチャー開発とレビュー対応

開発中に別のブランチをレビューする必要がある場合：

```bash
# 現在feature-aで開発中
cd ~/project-worktrees/feature-a
# ...コーディング中...

# レビュー依頼が来たのでfeature-bをチェックアウト
cd ~/project
git worktree add ../project-worktrees/feature-b origin/feature-b

# feature-bをレビュー
cd ../project-worktrees/feature-b
npm install
npm test
# ...レビュー...

# レビュー完了後、worktreeを削除
git worktree remove ../project-worktrees/feature-b

# feature-aの開発に戻る（変更はそのまま）
cd ../project-worktrees/feature-a
# ...開発再開...
```

### ユースケース2: ホットフィックスと並行開発

緊急バグ修正と通常開発を同時進行：

```bash
# mainブランチで緊急バグを発見
cd ~/project
npm test  # ❌ テスト失敗

# hotfixブランチを作成してworktree追加
git worktree add -b hotfix/critical-bug ../project-worktrees/hotfix main

# hotfixで修正作業
cd ../project-worktrees/hotfix
vim src/bug.js
git add src/bug.js
git commit -m "fix: critical bug in production"
git push origin hotfix/critical-bug

# 同時にfeature開発も継続（別ターミナル）
cd ~/project-worktrees/feature-a
# ...通常開発...

# hotfixマージ後、worktree削除
git worktree remove ../project-worktrees/hotfix
```

### ユースケース3: CI/CDビルドとローカル開発

ビルドやテストを実行しながら開発を継続：

```bash
# mainブランチで長時間ビルドを実行
cd ~/project
npm run build:production  # 10分かかる...

# 同時に別worktreeで開発を継続
cd ~/project-worktrees/feature-a
npm run dev  # 開発サーバー起動
# ...開発...

# ビルドが完了したらデプロイ
cd ~/project
npm run deploy
```

### ユースケース4: 比較とテスト

新旧バージョンの比較やA/Bテスト：

```bash
# mainブランチとfeatureブランチを同時にチェックアウト
git worktree add ../project-worktrees/main-stable main
git worktree add ../project-worktrees/feature-new feature-new

# それぞれでアプリを起動
cd ~/project-worktrees/main-stable
npm run dev -- --port 3000

cd ~/project-worktrees/feature-new
npm run dev -- --port 3001

# ブラウザで比較
# localhost:3000 → 安定版
# localhost:3001 → 新機能版
```

### ユースケース5: リリースブランチの管理

複数のリリースバージョンを同時に管理：

```bash
# プロジェクト構造
~/project/                          # develop（開発）
~/project-worktrees/release-1.0/    # リリース1.0系
~/project-worktrees/release-2.0/    # リリース2.0系
~/project-worktrees/hotfix-1.0.1/   # 1.0.1のバグ修正

# release-1.0でバグ修正
cd ~/project-worktrees/release-1.0
git checkout -b hotfix/1.0.1
# ...修正...
git commit -m "fix: security issue in 1.0"

# release-2.0でも同じ修正を適用
cd ~/project-worktrees/release-2.0
git cherry-pick <commit-hash>

# developにもマージ
cd ~/project
git merge hotfix/1.0.1
```

### ユースケース6: 依存関係の異なるバージョンテスト

異なるNode.jsバージョンでテスト：

```bash
# Node.js 16でテスト
cd ~/project-worktrees/test-node16
nvm use 16
npm install
npm test

# Node.js 18でテスト
cd ~/project-worktrees/test-node18
nvm use 18
npm install
npm test

# 同時実行可能（それぞれのnode_modulesが独立）
```

---

## よくある疑問とトラブルシューティング

### Q1: 同じブランチを複数のworktreeでチェックアウトできる？

**A: いいえ、できません。** 1つのブランチは1つのworktreeでしかチェックアウトできません。

```bash
$ git worktree add ../worktree1 feature-a
Preparing worktree (checking out 'feature-a')
HEAD is now at a1b2c3d

$ git worktree add ../worktree2 feature-a
fatal: 'feature-a' is already checked out at '/Users/username/worktree1'
```

**回避策**: 新しいブランチを作成してworktreeを追加

```bash
# feature-aから新しいブランチを作成
git worktree add -b feature-a-copy ../worktree2 feature-a
```

### Q2: worktreeを削除したのにエラーが出る

**症状**:

```bash
$ rm -rf ../project-worktrees/feature-a
$ git worktree list
/Users/username/project              a1b2c3d [main]
/Users/username/project-worktrees/feature-a  e4f5g6h [feature-a] prunable
```

**原因**: ディレクトリを直接削除しても、Gitの管理情報が残っている

**解決策**:

```bash
# 古いworktree情報をクリーンアップ
git worktree prune

# または、正しくworktreeを削除
git worktree remove ../project-worktrees/feature-a
```

### Q3: worktreeでsubmoduleが動作しない

**症状**:

```bash
$ cd ~/project-worktrees/feature-a
$ git submodule update --init
fatal: not a git repository
```

**原因**: worktreeではsubmoduleの初期化が必要

**解決策**:

```bash
# worktree作成時にsubmoduleも初期化
git worktree add ../project-worktrees/feature-a feature-a
cd ../project-worktrees/feature-a
git submodule update --init --recursive
```

### Q4: worktreeが「detached HEAD」になってしまう

**症状**:

```bash
$ git worktree add ../project-worktrees/test abc123  # コミットハッシュを指定
$ cd ../project-worktrees/test
$ git branch
* (HEAD detached at abc123)
  main
```

**原因**: ブランチ名ではなくコミットハッシュを指定した

**解決策**: ブランチ名を指定するか、新しいブランチを作成

```bash
# 新しいブランチを作成
git worktree add -b test-branch ../project-worktrees/test abc123
```

### Q5: worktreeでgit pullができない

**症状**:

```bash
$ cd ~/project-worktrees/feature-a
$ git pull
fatal: refusing to fetch into branch 'refs/heads/feature-a' checked out at '/Users/username/project-worktrees/feature-a'
```

**原因**: 通常は発生しませんが、設定の問題の可能性

**解決策**:

```bash
# メインのリポジトリでfetch
cd ~/project
git fetch origin

# worktreeでrebase
cd ~/project-worktrees/feature-a
git rebase origin/feature-a

# または、mergeを使用
git merge origin/feature-a
```

### Q6: IDE（VS Code）で.gitが認識されない

**症状**: VS CodeでGitの機能が使えない

**原因**: worktreeの`.git`はファイル（ディレクトリへのリンク）

**解決策**: 通常、VS Codeは自動的に認識しますが、認識しない場合：

```bash
# .git ファイルの内容を確認
$ cat ~/project-worktrees/feature-a/.git
gitdir: /Users/username/project/.git/worktrees/feature-a

# VS Codeを再起動
# または、settings.jsonに追加
{
  "git.detectSubmodules": true
}
```

### Q7: ディスクスペースが増え続ける

**原因**: 削除したworktreeの情報が残っている

**解決策**:

```bash
# 不要なworktree情報をクリーンアップ
git worktree prune

# 強制的に削除
git worktree prune --verbose

# .git/worktrees/を確認
ls .git/worktrees/
```

### Q8: worktreeで作業中にメインリポジトリが壊れた

**症状**: メインの`.git`が破損

**影響**: すべてのworktreeに影響

**解決策**:

```bash
# バックアップから復元
cp -r .git.backup .git

# または、リモートから再クローン
git clone https://github.com/user/project.git project-new
cd project-new
git worktree add ../project-worktrees/feature-a feature-a
```

**予防策**: 定期的にバックアップ

```bash
# .gitディレクトリのバックアップ
tar -czf git-backup-$(date +%Y%m%d).tar.gz .git
```

---

## Git Worktreeのベストプラクティス

### 1. worktreeの命名規則を統一する

```bash
# 良い例：わかりやすい命名
~/project/                          # main
~/project-worktrees/feature-login   # feature系
~/project-worktrees/hotfix-001      # hotfix系
~/project-worktrees/release-1.0     # release系

# 悪い例：わかりにくい命名
~/wt1/
~/temp/
~/test123/
```

### 2. worktreeは専用ディレクトリにまとめる

```bash
# 推奨構成
~/projects/
  └── myapp/                    # メインリポジトリ
      └── worktrees/            # worktree専用ディレクトリ
          ├── feature-a/
          ├── feature-b/
          └── hotfix-001/

# または、親ディレクトリに配置
~/projects/
  ├── myapp/                    # メインリポジトリ
  └── myapp-worktrees/          # worktree専用ディレクトリ
      ├── feature-a/
      └── hotfix-001/
```

### 3. 使い終わったworktreeは速やかに削除

```bash
# worktree一覧を確認
git worktree list

# 不要なworktreeを削除
git worktree remove ../project-worktrees/old-feature

# 定期的にクリーンアップ
git worktree prune
```

### 4. スクリプトで自動化する

**worktree作成スクリプト**:

```bash
#!/bin/bash
# create-worktree.sh

BRANCH_NAME=$1
WORKTREE_DIR="$HOME/projects/myapp-worktrees/$BRANCH_NAME"

if [ -z "$BRANCH_NAME" ]; then
  echo "Usage: ./create-worktree.sh <branch-name>"
  exit 1
fi

# worktreeを作成
git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"

# ディレクトリに移動
cd "$WORKTREE_DIR"

# 依存関係をインストール
npm install

echo "Worktree created at $WORKTREE_DIR"
```

**使い方**:

```bash
$ ./create-worktree.sh feature-new-ui
Preparing worktree (checking out 'feature-new-ui')
...
Worktree created at /Users/username/projects/myapp-worktrees/feature-new-ui
```

**worktree削除スクリプト**:

```bash
#!/bin/bash
# remove-worktree.sh

BRANCH_NAME=$1
WORKTREE_DIR="$HOME/projects/myapp-worktrees/$BRANCH_NAME"

if [ -z "$BRANCH_NAME" ]; then
  echo "Usage: ./remove-worktree.sh <branch-name>"
  exit 1
fi

# worktreeを削除
git worktree remove "$WORKTREE_DIR"

echo "Worktree removed: $WORKTREE_DIR"
```

### 5. エイリアスを設定する

```bash
# ~/.gitconfigに追加
[alias]
  wt = worktree
  wta = worktree add
  wtl = worktree list
  wtr = worktree remove
  wtp = worktree prune

# 使い方
git wta ../worktrees/feature-a feature-a
git wtl
git wtr ../worktrees/feature-a
```

### 6. .gitignoreで不要なファイルを除外

```gitignore
# .gitignore

# ビルド成果物（各worktreeで異なる可能性）
dist/
build/
*.log

# IDE設定（各worktreeで異なる設定の場合）
.vscode/settings.json
.idea/workspace.xml

# node_modules（各worktreeで個別にインストール）
node_modules/
```

### 7. CI/CDとの連携を考慮

```yaml
# .github/workflows/ci.yml

name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # worktree環境でも動作するようにfetch-depth設定
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # すべての履歴を取得

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

### 8. ドキュメント化する

プロジェクトのREADMEにworktreeの使い方を記載：

```markdown
## 開発環境のセットアップ

### Git Worktreeを使った開発

複数の機能を同時に開発する場合は、Git Worktreeを活用してください。

1. worktreeの作成:
   ```bash
   git worktree add ../myapp-worktrees/feature-name feature-name
   ```

2. 依存関係のインストール:
   ```bash
   cd ../myapp-worktrees/feature-name
   npm install
   ```

3. 開発サーバーの起動:
   ```bash
   npm run dev
   ```

4. 作業完了後、worktreeを削除:
   ```bash
   git worktree remove ../myapp-worktrees/feature-name
   ```
```

### 9. セキュリティ対策

```bash
# 機密情報を含むworktreeはロック
git worktree lock --reason "本番環境設定を含む" ../worktrees/production

# ロック状態を確認
git worktree list
# /path/to/worktrees/production  abc123 [production] locked

# 作業完了後にアンロック
git worktree unlock ../worktrees/production
```

### 10. パフォーマンスの最適化

```bash
# 大規模リポジトリでは、partial cloneを活用
git clone --filter=blob:none https://github.com/user/large-repo.git
cd large-repo
git worktree add ../worktrees/feature-a feature-a

# node_modulesは各worktreeで共有しない（シンボリックリンクも避ける）
# 各worktreeで個別にnpm installを実行
```

---

## Git Worktreeの高度な活用法

### 1. Bareリポジトリとworktreeの組み合わせ

bareリポジトリ（作業ディレクトリを持たない）を使い、すべてのブランチをworktreeで管理：

```bash
# bareリポジトリとしてクローン
git clone --bare https://github.com/user/project.git project.git
cd project.git

# すべてのブランチをworktreeとして展開
git worktree add ../project-main main
git worktree add ../project-develop develop
git worktree add ../project-feature-a feature-a

# 構造
~/projects/
  ├── project.git/              # bareリポジトリ
  ├── project-main/             # mainブランチ
  ├── project-develop/          # developブランチ
  └── project-feature-a/        # feature-aブランチ
```

**メリット**:
- すべてのブランチが対等に扱われる
- メインの作業ディレクトリがない（すべてがworktree）
- クリーンな構造

### 2. スクリプトでworktreeの一括管理

```bash
#!/bin/bash
# manage-worktrees.sh

REPO_DIR="$HOME/projects/myapp"
WORKTREE_BASE="$HOME/projects/myapp-worktrees"

# すべてのfeatureブランチをworktreeとして作成
for branch in $(git branch -r | grep 'origin/feature' | sed 's|origin/||'); do
  worktree_path="$WORKTREE_BASE/$branch"
  if [ ! -d "$worktree_path" ]; then
    echo "Creating worktree for $branch"
    git worktree add "$worktree_path" "$branch"
    cd "$worktree_path" && npm install
  fi
done

# 削除されたブランチのworktreeをクリーンアップ
git worktree prune
```

### 3. CI/CDでのworktree活用

複数の環境を同時にデプロイ：

```bash
#!/bin/bash
# deploy-all-environments.sh

# staging環境をデプロイ
cd ~/project-worktrees/staging
npm run build
npm run deploy:staging &

# production環境をデプロイ
cd ~/project-worktrees/production
npm run build
npm run deploy:production &

# 両方の完了を待つ
wait
echo "All deployments completed"
```

---

## まとめ

Git Worktreeは、**複数のブランチを同時に扱う**ための強力な機能です。1つのリポジトリで複数の作業ディレクトリを持つことで、ブランチ切り替えの煩雑さから解放され、効率的な開発が可能になります。

### 重要ポイント

**Git Worktreeの基本**:
- 1つのリポジトリで複数の作業ディレクトリを持てる
- `.git`ディレクトリは共有（ディスクスペース効率的）
- ブランチ切り替え不要で同時作業が可能

**主な利点**:
- **同時作業**: 複数ブランチを同時に開発・テスト
- **効率性**: ディスクスペースとfetch/pullの共有
- **柔軟性**: ビルドやテストを並行実行
- **IDEサポート**: 複数プロジェクトを同時に開ける

**基本コマンド**:
- `git worktree add <path> <branch>`: worktreeを追加
- `git worktree list`: worktree一覧を表示
- `git worktree remove <path>`: worktreeを削除
- `git worktree prune`: 不要なworktree情報をクリーンアップ

**実践的なユースケース**:
1. **並行開発**: feature開発とレビュー対応を同時進行
2. **緊急対応**: ホットフィックスと通常開発を両立
3. **比較テスト**: 新旧バージョンを同時起動して比較
4. **ビルド並行**: ビルド実行中に別worktreeで開発継続
5. **リリース管理**: 複数のリリースバージョンを同時管理

**ベストプラクティス**:
- worktreeは専用ディレクトリにまとめる
- 命名規則を統一する
- 使い終わったら速やかに削除
- スクリプトやエイリアスで自動化
- ドキュメントに使い方を記載

**注意点**:
- 同じブランチを複数worktreeでチェックアウト不可
- 削除後は`git worktree prune`でクリーンアップ
- submoduleは各worktreeで初期化が必要
- node_modulesは各worktreeで個別にインストール

### 導入ステップ

1. **試してみる**: 既存プロジェクトでworktreeを1つ作成
   ```bash
   git worktree add ../project-worktrees/test-branch test-branch
   ```

2. **構造を決める**: worktreeの配置場所と命名規則を決定
   ```bash
   ~/projects/myapp/           # メインリポジトリ
   ~/projects/myapp-worktrees/ # worktree専用ディレクトリ
   ```

3. **エイリアスを設定**: よく使うコマンドをエイリアス化
   ```bash
   git config --global alias.wta 'worktree add'
   git config --global alias.wtl 'worktree list'
   ```

4. **スクリプト化**: worktreeの作成・削除を自動化
5. **チームで共有**: READMEに使い方を記載してチームに展開

Git Worktreeをマスターして、より効率的で柔軟な開発ワークフローを実現しましょう！

### 参考リンク

- **Git Documentation - git-worktree**: https://git-scm.com/docs/git-worktree
- **Git Worktree: Multiple Working Trees**: https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain
- **Atlassian Git Tutorial - Git Worktree**: https://www.atlassian.com/git/tutorials/git-worktree
- **GitHub Blog - Git Worktree**: https://github.blog/2015-07-29-git-2-5-including-multiple-worktrees-and-triangular-workflows/
