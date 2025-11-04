# プロジェクト概要

このプロジェクトは、Docusaurus 3.3.2をベースとしたソフトウェア開発ブログです。
技術記事を日本語で公開し、GitHub Pagesでホスティングしています。

## 技術スタック

- **フレームワーク**: Docusaurus 3.3.2 (React 18ベース)
- **言語**: TypeScript
- **Node.js**: 18以上
- **パッケージマネージャー**: npm
- **デプロイ**: GitHub Actions → GitHub Pages

## ブログ記事の作成規約

### ファイル命名規則
```
blog/YYYY-MM-DD-slug.md
例: blog/2025-10-31-vercel-workflow-ai-guide.md
```

### フロントマター（必須）
```yaml
---
slug: kebab-case-slug
title: 記事タイトル（日本語）
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---
```

### 記事構成
- 冒頭に記事の概要を書く
- `<!--truncate-->`でプレビュー表示範囲を区切る
- 日本語で記述
- コードブロックは言語を指定（例: ```typescript, ```bash）
- MDX内で中括弧 `{}` を使う場合はエスケープする

## コミットメッセージ規約

プレフィックスを使用して、変更内容を明確に示してください：

- `docs:` - ドキュメント・記事の追加/更新
- `fix:` - バグ修正
- `ci:` - CI/CD設定の変更
- `feat:` - 新機能追加

例:
```
docs: Git Worktree完全ガイドを追加
fix: MDXパーサーエラーを修正するためコードブロック内の中括弧をエスケープ
ci: GitHub Actionsにnpmキャッシュを追加してビルド時間を最適化
```

## 開発コマンド

```bash
npm install          # 依存関係のインストール
npm run start        # 開発サーバー起動 (http://localhost:3000)
npm run build        # 本番ビルド
npm run lint         # TypeScript型チェック
npm run serve        # ビルド後のプレビュー
```

## デプロイフロー

1. **自動デプロイ**: `master`ブランチへのpushでGitHub Actionsが自動実行
2. **手動デプロイ**: `npm run deploy` でgh-pagesブランチにデプロイ
3. **公開URL**: https://s-tanoue.github.io/blog/

## 重要な注意事項

- `onBrokenLinks: 'throw'` 設定により、リンク切れはビルドエラーになります
- Dockerでの開発も可能: `docker compose up --build`
- プルリクエストを作成する際は、必ずビルドが成功することを確認してください
- GitHub Pagesで正しく表示されるよう、.nojekyllファイルが配置されています

## ブランチ戦略

- **master**: 本番環境（自動デプロイ）
- **claude/***: 機能追加・記事追加用のブランチ（プルリクエスト経由でmaster にマージ）
