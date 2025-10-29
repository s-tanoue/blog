# Docusaurus ブログ

Nuxt.js で構築されていたブログを Docusaurus へ移行しました。React ベースの静的サイトとしてブログとドキュメントを簡単に管理できます。

## 必要要件

- Node.js 18 以上
- npm または Yarn

## ローカル開発

```bash
npm install
npm run start
```

`http://localhost:3000` を開くとブログを確認できます。

## ビルド

```bash
npm run build
```

生成された静的ファイルは `build` ディレクトリに出力されます。

## GitHub Pages へのデプロイ

`master` ブランチへ push されると、GitHub Actions (`Deploy to GitHub Pages`) が自動的にビルドして GitHub Pages へ公開します。

### 初回セットアップ

1. [Pages の設定画面](https://github.com/s-tanoue/blog/settings/pages) を開く
2. **Source** (ソース) を "GitHub Actions" に変更
3. `master` ブランチへ push すると、自動的にデプロイが開始されます

### ローカルから手動でデプロイ

```bash
npm run deploy
```

サイトは `https://s-tanoue.github.io/blog/` にホストされます。

## Docker を利用する

```bash
docker compose up --build
```

Docker イメージ内で Docusaurus の開発サーバーが起動します。
