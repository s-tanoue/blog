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

## Docker を利用する

```bash
docker compose up --build
```

Docker イメージ内で Docusaurus の開発サーバーが起動します。
