---
slug: ddd-layered-architecture
title: DDDレイヤードアーキテクチャのフォルダ構成ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

DDD（ドメイン駆動設計）のレイヤードアーキテクチャを適用する際に、どのようなフォルダ構成にすると理解しやすく運用しやすいかをまとめました。プロジェクトの規模や利用するフレームワークに応じて調整しつつ、レイヤーの役割を明確に分離することがポイントです。

```
src/
├── application/
│   ├── service/
│   ├── command/
│   ├── query/
│   └── dto/
├── domain/
│   ├── model/
│   │   ├── entity/
│   │   ├── value_object/
│   │   └── aggregate/
│   ├── repository/
│   └── service/
├── infrastructure/
│   ├── persistence/
│   ├── external_api/
│   └── configuration/
└── interface/
    ├── rest/
    ├── graphql/
    ├── cli/
    └── event/
```

---

## application レイヤー

- **service/**: ユースケースを実装するアプリケーションサービス。ドメインオブジェクトを組み合わせて処理を調整します。
- **command/** / **query/**: CQRS を採用する場合の入力モデルやハンドラーを配置します。
- **dto/**: API や UI 層に渡すデータ転送オブジェクトをまとめます。

## domain レイヤー

- **model/entity/**: 識別子を持つドメインの中心となるエンティティ。
- **model/value_object/**: 不変で、値の等価性で比較される値オブジェクト。
- **model/aggregate/**: 境界づけられたコンテキスト内の整合性を担保するアグリゲート関連のロジック。
- **repository/**: 永続化の抽象インターフェイス。実装は infrastructure レイヤーで行います。
- **service/**: 単一エンティティに収まらないビジネスルールを表現するドメインサービス。

## infrastructure レイヤー

- **persistence/**: RDB や NoSQL、ファイルストレージなどへのアクセス実装。
- **external_api/**: 外部サービスとの連携処理。
- **configuration/**: DI 設定やミドルウェア設定など、アプリを動かす技術的セットアップ。

## interface レイヤー

- **rest/** / **graphql/** / **cli/**: REST コントローラや GraphQL リゾルバ、CLI コマンドなどのエンドポイントを実装します。
- **event/**: メッセージングやイベント駆動システム向けのサブスクライバ／パブリッシャを配置します。

---

ドメインのモデルとルールを中心に据え、アプリケーション・インフラ・インターフェイスの依存を一方向に保つことで、変更に強く理解しやすいコードベースを維持できます。チームの習熟度やシステムの複雑性に応じてサブディレクトリを細分化し、命名を調整していきましょう。
