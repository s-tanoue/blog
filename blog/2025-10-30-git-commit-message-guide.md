---
slug: git-commit-message-guide
title: Git コミットメッセージの書き方完全ガイド：Conventional Commits のすすめ
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

チーム開発において、**Git のコミットメッセージ**は単なる記録ではなく、チームメンバー間のコミュニケーションツールであり、プロジェクトの歴史を物語る重要な資産です。本記事では、なぜコミットメッセージが大切なのか、そして **Conventional Commits** という規約を使うことでどのような利点が得られるのかを解説します。

<!--truncate-->

## なぜコミットメッセージが重要なのか

良いコミットメッセージがもたらす価値：

- **変更意図の明確化**: 数ヶ月後、数年後に見返したときに「なぜこの変更を行ったのか」がすぐに理解できます。
- **レビューの効率化**: プルリクエストのレビュー時に、各コミットの目的が明確だとレビュアーの負担が減ります。
- **デバッグの高速化**: `git log` や `git blame` で問題の原因を追跡する際、コミットメッセージが手がかりになります。
- **自動化との連携**: コミットメッセージから CHANGELOG を自動生成したり、セマンティックバージョニングを自動化できます。
- **チーム文化の形成**: 統一されたフォーマットはチームの規律と品質意識を高めます。

## Conventional Commits とは

**Conventional Commits** は、コミットメッセージに軽量な規約を与える仕様です。人間にも機械にも読みやすい形式で、変更の性質を明確に伝えられます。

公式サイト: https://www.conventionalcommits.org/

### 基本フォーマット

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

最もシンプルな例：
```
feat: ユーザー登録機能を追加
```

より詳細な例：
```
fix(auth): ログイン時のトークン検証ロジックを修正

JWT トークンの有効期限チェックが正しく動作していなかった問題を修正。
expires_at フィールドを正しく参照するように変更。

Fixes #123
```

## Type（変更の種類）

主要な Type とその用途：

- **feat**: 新機能の追加
  - 例: `feat: ダークモード対応を追加`

- **fix**: バグ修正
  - 例: `fix: モバイルでのレイアウト崩れを修正`

- **docs**: ドキュメントのみの変更
  - 例: `docs: API ドキュメントに認証方法を追記`

- **style**: コードの意味に影響しない変更（空白、フォーマット、セミコロンなど）
  - 例: `style: ESLint のルールに従ってインデントを修正`

- **refactor**: バグ修正でも機能追加でもないコード変更
  - 例: `refactor: ユーザー認証ロジックを関数に分離`

- **perf**: パフォーマンス改善
  - 例: `perf: 画像の遅延読み込みを実装`

- **test**: テストの追加や修正
  - 例: `test: ユーザー登録APIのE2Eテストを追加`

- **build**: ビルドシステムや外部依存関係の変更（npm、webpack など）
  - 例: `build: webpack 5 にアップグレード`

- **ci**: CI 設定ファイルやスクリプトの変更
  - 例: `ci: GitHub Actions に自動デプロイを追加`

- **chore**: その他の変更（リリース準備、ツール設定など）
  - 例: `chore: .gitignore に .env を追加`

## Scope（影響範囲）

Scope はオプションですが、変更が影響する範囲を括弧で示すことで、より詳細な情報を伝えられます：

```
feat(api): ユーザー検索エンドポイントを追加
fix(ui): ヘッダーメニューのドロップダウンが開かない問題を修正
docs(readme): インストール手順を更新
test(auth): ログインフローのユニットテストを追加
```

Scope の例：
- コンポーネント名: `(button)`, `(header)`, `(sidebar)`
- モジュール名: `(auth)`, `(payment)`, `(notification)`
- レイヤー名: `(api)`, `(ui)`, `(database)`

## Breaking Change（破壊的変更）

API の互換性を破壊する変更は、`!` を付けるか、フッターに `BREAKING CHANGE:` を記載します：

```
feat(api)!: ユーザーAPI のレスポンス形式を変更

従来の { user: {...} } から { data: {...} } 形式に変更。

BREAKING CHANGE: API クライアントは新しいレスポンス形式に対応する必要があります。
```

## Conventional Commits の実践的な活用

### 1. CHANGELOG の自動生成

[standard-version](https://github.com/conventional-changelog/standard-version) や [semantic-release](https://github.com/semantic-release/semantic-release) を使えば、コミットメッセージから自動的に CHANGELOG を生成できます：

```bash
# standard-version のインストール
npm install --save-dev standard-version

# package.json にスクリプトを追加
{
  "scripts": {
    "release": "standard-version"
  }
}

# バージョンアップと CHANGELOG 生成
npm run release
```

### 2. セマンティックバージョニングの自動化

Conventional Commits に従っていれば、次のバージョン番号を自動判定できます：

- `fix:` → パッチバージョン（0.0.x）
- `feat:` → マイナーバージョン（0.x.0）
- `BREAKING CHANGE:` → メジャーバージョン（x.0.0）

### 3. コミットメッセージの検証

[commitlint](https://commitlint.js.org/) を使えば、コミットメッセージが規約に従っているかを自動チェックできます：

```bash
# commitlint と husky のインストール
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky

# commitlint の設定
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# husky でコミット時に検証
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

これで、規約に反するコミットメッセージは自動的に拒否されます。

### 4. プルリクエストとの連携

コミットメッセージに issue 番号を含めることで、自動的にリンクされます：

```
fix(auth): パスワードリセット機能の不具合を修正

Closes #456
Refs #123
```

## よくある質問

### Q: すべてのコミットを Conventional Commits にする必要がありますか？

A: 理想的にはすべてのコミットが規約に従うべきですが、まずは `main` ブランチにマージするコミットから始めるのも良いでしょう。Squash merge を使えば、プルリクエスト単位で整形できます。

### Q: Type が複数ある場合はどうしますか？

A: コミットは可能な限り小さく保ち、1つのコミットには1つの Type が望ましいです。どうしても複数の変更が含まれる場合は、最も重要な Type を選びます。

### Q: 日本語と英語、どちらで書くべきですか？

A: チームの方針次第ですが、グローバルなプロジェクトでは英語、国内チームのみなら日本語でも構いません。重要なのは、チーム全体で統一することです。

### Q: 既存プロジェクトに導入する際の注意点は？

A: 急に厳格なルールを導入するとメンバーが混乱するので、まずはドキュメントを整備し、チーム全体で合意を取りましょう。commitlint のようなツールは、警告モードから始めて徐々に厳格化するのがおすすめです。

## まとめ

Conventional Commits は、コミットメッセージに一貫性をもたらし、チーム開発の効率と品質を高める強力な手法です。以下のステップで導入を進めましょう：

1. **チームで規約を共有**: Conventional Commits の仕様とメリットを説明し、合意を得る
2. **Type と Scope を定義**: プロジェクトに合わせた Type と Scope のリストを作成
3. **ツールを導入**: commitlint や husky で自動検証を設定
4. **実践と改善**: 運用しながらルールを見直し、チームに最適化

最初は慣れないかもしれませんが、習慣化すればコミットメッセージの品質が劇的に向上し、チーム全体の開発体験が改善されます。今日から始めてみましょう！
