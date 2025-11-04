---
slug: github-squash-merge-guide
title: GitHubのスカッシュマージで綺麗なコミット履歴を作る完全ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - Git・バージョン管理
---

GitHub でプルリクエストをマージする際、**スカッシュマージ（Squash and Merge）**を使うと、複数のコミットを 1 つにまとめて綺麗なコミット履歴を維持できます。本記事では、スカッシュマージの基本から、コンフリクトが起きやすいケースとその対処法まで、実践的な内容を詳しく解説します。

<!--truncate-->

## スカッシュマージとは

**スカッシュマージ**は、GitHub が提供する 3 つのマージ方法の 1 つで、プルリクエストの複数のコミットを**1 つのコミットにまとめて**メインブランチにマージする手法です。

### GitHub の 3 つのマージ方法

1. **Create a merge commit（マージコミット）**
   - すべてのコミットを保持し、マージコミットを作成
   - コミット履歴がそのまま残る

2. **Squash and merge（スカッシュマージ）**
   - すべてのコミットを 1 つにまとめてマージ
   - クリーンなコミット履歴を維持

3. **Rebase and merge（リベースマージ）**
   - すべてのコミットを保持しながら、直線的な履歴を作成
   - マージコミットは作成されない

### スカッシュマージのイメージ

```
# マージ前（feature ブランチ）
A - B - C - D (main)
         \
          E - F - G - H (feature)

# スカッシュマージ後
A - B - C - D - I (main)
                ↑
         E+F+G+H をまとめた 1 つのコミット
```

---

## なぜスカッシュマージを使うのか

### スカッシュマージのメリット

#### 1. クリーンなコミット履歴

メインブランチのコミット履歴が整理され、読みやすくなります：

```bash
# スカッシュマージ前
feat: ユーザー登録機能を追加
fix: バリデーションの typo を修正
fix: レビュー指摘の対応
fix: テストの追加
fix: さらに修正
refactor: コードレビュー対応

# スカッシュマージ後
feat: ユーザー登録機能を追加
```

#### 2. 意味のある履歴単位

「1 プルリクエスト = 1 機能 = 1 コミット」という明確な単位でコミット履歴を管理できます。

#### 3. git log の見やすさ

`git log` で履歴を確認する際、重要な変更だけが表示されます：

```bash
git log --oneline
a1b2c3d feat: ダークモード対応を追加
e4f5g6h fix: モバイルレイアウトの不具合を修正
i7j8k9l feat: ユーザー登録機能を追加
```

#### 4. git bisect の効率化

バグの原因を特定する `git bisect` が、意味のある単位でコミットを調査できます。

#### 5. Conventional Commits との相性

スカッシュマージ時に Conventional Commits 形式のメッセージを設定すれば、CHANGELOG の自動生成が簡単になります。

### スカッシュマージのデメリット

1. **詳細な履歴が失われる**: 開発過程のコミットは消える
2. **個々の開発者の貢献が見えにくい**: すべて 1 つのコミットにまとまる
3. **大きな変更の場合**: 1 つのコミットが巨大になる可能性

---

## スカッシュマージの基本的な使い方

### GitHub UI でのスカッシュマージ

1. プルリクエストのページで「**Merge pull request**」ボタンの右側のドロップダウンをクリック
2. 「**Squash and merge**」を選択
3. コミットメッセージを編集（Conventional Commits 形式を推奨）
4. 「**Confirm squash and merge**」をクリック

### リポジトリでスカッシュマージをデフォルトに設定

リポジトリの設定で、スカッシュマージをデフォルトにできます：

1. リポジトリの「**Settings**」タブを開く
2. 「**General**」→「**Pull Requests**」セクション
3. 「**Allow squash merging**」のみをチェック
4. 他のマージ方法のチェックを外す

---

## スカッシュマージのコミットメッセージベストプラクティス

### Conventional Commits 形式を使う

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 例

```
feat(auth): ユーザー登録機能を追加

- メール認証フローの実装
- パスワード強度チェック
- 利用規約への同意機能

Closes #123
```

### プルリクエストのタイトルを最適化

GitHub は**プルリクエストのタイトル**をスカッシュマージのデフォルトメッセージとして使用します。そのため、プルリクエストのタイトルを Conventional Commits 形式にすると効率的です：

```
✅ 良い例
feat(auth): ユーザー登録機能を追加

❌ 悪い例
Update user.js
```

---

## スカッシュマージでコンフリクトが起きやすいケース

スカッシュマージは**マージ時にコンフリクトを解決する**ため、通常のマージよりもコンフリクトが起きやすい場合があります。以下、よくあるケースを紹介します。

### ケース 1: 長期間更新されていないブランチ

**状況**:
- feature ブランチを作成後、長期間作業
- その間に main ブランチが大きく進んでいる
- 同じファイルが main と feature の両方で変更されている

```
main:    A - B - C - D - E - F - G
                  \
feature:           H - I - J
```

**原因**:
- main ブランチの変更（D, E, F, G）と feature ブランチの変更（H, I, J）が重複している

**症状**:
- 「This branch has conflicts that must be resolved」と表示される
- スカッシュマージボタンがグレーアウトされる

### ケース 2: 同じファイルの同じ箇所を複数人が変更

**状況**:
- チームメンバー A が `config.js` の設定値を変更してマージ
- 同時に作業していたメンバー B も同じ箇所を変更
- メンバー B がプルリクエストを出すとコンフリクト

```javascript
// main ブランチ（メンバー A がマージ済み）
const config = {
  apiUrl: 'https://api.example.com/v2',
  timeout: 5000
};

// feature ブランチ（メンバー B が作業中）
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 10000
};
```

### ケース 3: ファイルの削除と変更の競合

**状況**:
- main ブランチで `old-component.js` が削除された
- feature ブランチで同じファイルを修正している

```
main:    old-component.js を削除
feature: old-component.js を修正
```

### ケース 4: リファクタリングとの競合

**状況**:
- main ブランチで大規模なリファクタリングが行われた（関数名変更、ファイル移動など）
- feature ブランチで古い関数名やファイルパスを使用している

```javascript
// main ブランチ（リファクタリング後）
import { authenticateUser } from './auth/service';

// feature ブランチ（古い名前を使用）
import { loginUser } from './auth';
```

### ケース 5: package.json や lockfile の競合

**状況**:
- 複数のブランチで異なるパッケージを追加
- `package.json`、`package-lock.json`、`yarn.lock` などが競合

```json
// main ブランチ
{
  "dependencies": {
    "axios": "^1.5.0",
    "react": "^18.2.0"
  }
}

// feature ブランチ
{
  "dependencies": {
    "lodash": "^4.17.21",
    "react": "^18.2.0"
  }
}
```

### ケース 6: マイグレーションファイルやスキーマ定義の競合

**状況**:
- データベースマイグレーションファイルが複数ブランチで作成される
- 同じテーブルに対して異なる変更が加えられる

```sql
-- main ブランチ: 20231101_add_email_column.sql
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- feature ブランチ: 20231101_add_phone_column.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

---

## コンフリクトの対処法

### 方法 1: GitHub UI でコンフリクトを解決（簡単なケース向け）

GitHub の Web エディタで直接コンフリクトを解決できます。

**手順**:
1. プルリクエストページで「**Resolve conflicts**」ボタンをクリック
2. コンフリクトマーカー（`<<<<<<<`, `=======`, `>>>>>>>`）を手動で編集
3. 「**Mark as resolved**」をクリック
4. 「**Commit merge**」をクリック

**例**:
```javascript
<<<<<<< feature-branch
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 10000
};
=======
const config = {
  apiUrl: 'https://api.example.com/v2',
  timeout: 5000
};
>>>>>>> main
```

**解決後**:
```javascript
const config = {
  apiUrl: 'https://api.example.com/v2',  // main の変更を採用
  timeout: 10000  // feature の変更を採用
};
```

### 方法 2: ローカルで main ブランチを merge する

最も一般的で確実な方法です。

**手順**:

```bash
# 1. feature ブランチに切り替え
git checkout feature-branch

# 2. 最新の main ブランチを取得
git fetch origin main

# 3. main ブランチを feature ブランチにマージ
git merge origin/main

# 4. コンフリクトが発生
# エディタでコンフリクトを解決

# 5. 解決したファイルをステージング
git add .

# 6. マージコミットを作成
git commit -m "fix: merge conflicts with main"

# 7. プッシュ
git push origin feature-branch
```

**コンフリクト解決の例**:
```javascript
// エディタで以下のように表示される
<<<<<<< HEAD (feature-branch)
const timeout = 10000;
=======
const timeout = 5000;
>>>>>>> origin/main

// 両方を考慮して解決
const timeout = 10000;  // feature の変更を採用
```

### 方法 3: ローカルで main ブランチを rebase する（推奨）

rebase を使うと、より綺麗な履歴を保てます。

**手順**:

```bash
# 1. feature ブランチに切り替え
git checkout feature-branch

# 2. 最新の main ブランチを取得
git fetch origin main

# 3. main ブランチを feature ブランチにリベース
git rebase origin/main

# 4. コンフリクトが発生したら解決
# エディタでコンフリクトを解決

# 5. 解決したファイルをステージング
git add .

# 6. リベースを続行
git rebase --continue

# 7. すべてのコンフリクトを解決したら、強制プッシュ
git push origin feature-branch --force-with-lease
```

**注意**: `--force-with-lease` は、リモートの変更を上書きする前に、他の人がプッシュしていないか確認します。

### 方法 4: package.json / lockfile の競合解決

**package.json の場合**:

```bash
# 1. main をマージ
git merge origin/main

# 2. package.json の競合を手動で解決（両方の依存関係を残す）

# 3. lockfile を再生成
npm install  # または yarn install / pnpm install

# 4. コミット
git add package.json package-lock.json
git commit -m "fix: resolve package.json conflicts"
git push origin feature-branch
```

**lockfile だけが競合している場合**:

```bash
# 1. lockfile を削除
rm package-lock.json  # または yarn.lock

# 2. main をマージ
git merge origin/main

# 3. lockfile を再生成
npm install

# 4. コミット
git add package-lock.json
git commit -m "fix: regenerate lockfile"
git push origin feature-branch
```

### 方法 5: マイグレーションファイルの競合解決

**手順**:

```bash
# 1. main をマージ
git merge origin/main

# 2. マイグレーションファイル名を変更してタイムスタンプを更新
mv migrations/20231101_add_phone_column.sql \
   migrations/20231102_add_phone_column.sql

# 3. コミット
git add migrations/
git commit -m "fix: resolve migration file conflict"
git push origin feature-branch
```

---

## コンフリクトを防ぐベストプラクティス

### 1. こまめに main ブランチを取り込む

長期間作業するブランチは、定期的に main の変更を取り込みましょう。

```bash
# 毎日または数日おきに実行
git fetch origin main
git merge origin/main
# または
git rebase origin/main
```

### 2. 小さなプルリクエストを作る

大きな変更を避け、小さく分割してプルリクエストを作成します。

```
❌ 悪い例
feat: 認証機能、ダッシュボード、通知機能を追加 (1000+ 行)

✅ 良い例
feat(auth): ユーザー登録機能を追加 (200 行)
feat(dashboard): ダッシュボード UI を追加 (150 行)
feat(notification): 通知機能を追加 (100 行)
```

### 3. プルリクエストのレビューを迅速に

プルリクエストが長期間オープンなままだと、コンフリクトが発生しやすくなります。

### 4. ブランチ戦略を明確にする

チームで Git Flow や GitHub Flow などのブランチ戦略を決め、一貫性を保ちます。

### 5. 変更範囲を調整する

他のメンバーと同じファイルを変更する場合は、事前にコミュニケーションを取りましょう。

### 6. 自動化ツールを活用

**Dependabot** や **Renovate** を使って、依存関係の更新を自動化します。これにより、`package.json` の競合を減らせます。

---

## スカッシュマージの高度なテクニック

### 1. スカッシュ前に interactive rebase で整理

ローカルでコミットを整理してからプッシュします。

```bash
# 最近の 5 つのコミットを整理
git rebase -i HEAD~5

# エディタが開くので、コミットを編集
# pick → squash (s) に変更してコミットをまとめる

# 例
pick a1b2c3d feat: ユーザー登録機能を追加
s e4f5g6h fix: typo 修正
s i7j8k9l fix: レビュー対応
s m0n1o2p test: テスト追加
```

### 2. 複数のプルリクエストを順次マージ

依存関係のあるプルリクエストは、順番にマージします。

```bash
# PR #1: 基盤機能
feat(auth): 認証基盤を追加

# PR #2: 登録機能（PR #1 に依存）
feat(auth): ユーザー登録機能を追加

# PR #3: ログイン機能（PR #1 に依存）
feat(auth): ログイン機能を追加
```

### 3. Draft Pull Request を活用

作業中のプルリクエストを**Draft**にすることで、誤ってマージされるのを防ぎます。

### 4. ブランチ保護ルールを設定

リポジトリの設定で、main ブランチへの直接プッシュを禁止し、プルリクエスト経由のみを許可します。

```yaml
# GitHub の Branch Protection Rules
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
```

---

## スカッシュマージと CI/CD

### CI/CD パイプラインでの自動チェック

コンフリクトを防ぐため、CI でブランチが最新かをチェックします。

```yaml
# .github/workflows/check-branch.yml
name: Check Branch Up-to-Date

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check if branch is up-to-date with main
        run: |
          git fetch origin main
          if ! git merge-base --is-ancestor origin/main HEAD; then
            echo "⚠️ Branch is not up-to-date with main. Please rebase or merge."
            exit 1
          fi
```

### 自動マージ（Automerge）

条件を満たしたプルリクエストを自動的にスカッシュマージします。

```yaml
# .github/workflows/automerge.yml
name: Automerge

on:
  pull_request:
    types: [labeled, unlabeled, synchronize, opened, edited, ready_for_review]

jobs:
  automerge:
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'automerge')
    steps:
      - uses: pascalgn/automerge-action@v0.15.6
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MERGE_METHOD: squash
          MERGE_LABELS: automerge
```

---

## まとめ

GitHub のスカッシュマージは、**クリーンなコミット履歴**を維持するための強力な手法です。コンフリクトが起きやすいケースを理解し、適切に対処することで、チーム開発の効率を大幅に向上させられます。

### 重要ポイント

**スカッシュマージの特徴**:
- 複数のコミットを 1 つにまとめてマージ
- メインブランチのコミット履歴がクリーンになる
- Conventional Commits との相性が良い

**コンフリクトが起きやすいケース**:
- 長期間更新されていないブランチ
- 同じファイルの同じ箇所を複数人が変更
- ファイルの削除と変更の競合
- リファクタリングとの競合
- package.json や lockfile の競合
- マイグレーションファイルの競合

**対処法**:
1. **GitHub UI で解決**: 簡単なコンフリクト向け
2. **ローカルで merge**: 最も一般的
3. **ローカルで rebase**: 綺麗な履歴を保てる（推奨）
4. **lockfile を再生成**: 依存関係の競合
5. **マイグレーションファイル名を変更**: DB マイグレーション

**ベストプラクティス**:
- こまめに main ブランチを取り込む
- 小さなプルリクエストを作る
- プルリクエストのレビューを迅速に
- ブランチ戦略を明確にする
- 自動化ツールを活用

### 導入ステップ

1. **リポジトリ設定**: スカッシュマージをデフォルトに設定
2. **チームで合意**: Conventional Commits を採用
3. **ブランチ保護**: main ブランチへの直接プッシュを禁止
4. **CI/CD 設定**: 自動チェックとテストを導入
5. **運用開始**: 小さく始めて徐々に改善

スカッシュマージを活用して、読みやすく保守しやすいコミット履歴を維持しましょう！

### 参考リンク

- **GitHub Docs - About merge methods**: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Git Docs - git-rebase**: https://git-scm.com/docs/git-rebase
- **Atlassian Git Tutorial**: https://www.atlassian.com/git/tutorials/merging-vs-rebasing
