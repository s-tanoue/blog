---
slug: ddd-layered-architecture
title: 【完全図解】DDDとレイヤードアーキテクチャを初心者向けに解説
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - アーキテクチャ・設計
---

コードが散らかって「どこに何を書けばいいか分からない...」と悩んだことはありませんか？DDD（ドメイン駆動設計）のレイヤードアーキテクチャは、そんな悩みを解決する設計手法です。この記事では、レストランの例え話と実際のコードを使って、初心者でも分かるように丁寧に解説します。

<!--truncate-->

## なぜDDDが必要なのか？

まず、よくある問題から見ていきましょう。

```typescript
// ❌ よくない例：全部が混ざっているコード
async function createOrder(req, res) {
  // HTTPリクエストの処理
  const { userId, items } = req.body;

  // ビジネスルール
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (total < 0) throw new Error('金額が不正です');

  // データベース操作
  const order = await db.query('INSERT INTO orders ...');

  // レスポンス返却
  res.json({ orderId: order.id });
}
```

この書き方の問題点：
- HTTPとビジネスロジックとDBが全部混ざっている
- テストが書きにくい（DBやHTTPをモックする必要がある）
- 他の場所で同じビジネスルールを使いたくてもコピペするしかない
- 仕様変更があったときに影響範囲が分からない

DDDのレイヤードアーキテクチャは、これらの問題を「役割ごとに分ける」ことで解決します。

## レストランで理解するレイヤードアーキテクチャ

レストランに例えるとイメージしやすいです。

```
お客さん → 店員 → 調理担当 → 実際の調理器具・食材
          ↓      ↓          ↓
        Interface Application Domain Infrastructure
        レイヤー  レイヤー    レイヤー  レイヤー
```

### 🏪 Interface（店員）：お客さんとの接点
- お客さんから注文を聞く
- メニュー表を見せる
- 料理を運ぶ
- **コードでは**: HTTPリクエストを受け取る、レスポンスを返す

### 📋 Application（調理担当者のリーダー）：調理の流れをまとめる
- 「この料理を作るには、Aを準備してBを調理して...」という手順を決める
- 複数の料理人に指示を出す
- **コードでは**: ビジネスロジックを呼び出す順番を決める

### 👨‍🍳 Domain（レシピ・料理のルール）：お店の核心
- 「この料理は必ずこの温度で焼く」というルール
- 「この食材とこの食材は一緒に使えない」という制約
- **コードでは**: ビジネスルール、計算ロジック

### 🔧 Infrastructure（実際の調理器具・食材倉庫）：道具と材料
- 実際のオーブン、冷蔵庫
- 食材の仕入れ先
- **コードでは**: データベース、外部API

**重要な原則**: レシピ（Domain）は調理器具（Infrastructure）に依存しない！
- 「オーブンでもフライパンでも、180度で焼く」というルールは変わらない
- オーブンが壊れても、別のオーブンで同じ料理が作れる

## フォルダ構成

```text
src/
├── domain/           # 【最重要】ビジネスルールの核心
│   ├── models/       # ビジネスの「モノ」や「概念」
│   ├── repositories/ # データの保存・取得の「契約書」（実装はinfrastructure）
│   └── services/     # 複数のモデルをまたぐルール
├── application/      # ユースケース（やりたいことの流れ）
│   ├── services/     # 「注文する」「キャンセルする」などの処理
│   └── dto/          # 外部とのデータやり取り用の型
├── infrastructure/   # 技術的な実装
│   ├── database/     # DBへの保存・読み込みの実装
│   └── external/     # 外部APIとの通信
└── interface/        # 外の世界との接点
    ├── http/         # REST API（HTTPリクエスト/レスポンス）
    └── cli/          # コマンドラインツール
```

## 実例で理解する：ECサイトの注文処理

具体的なコードを見ていきましょう。

### 1. Domain層：ビジネスルールを定義

```typescript
// domain/models/Order.ts
// 「注文」という概念を表現
export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    private items: OrderItem[],
    private _status: OrderStatus
  ) {}

  // ビジネスルール：合計金額の計算方法
  get totalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // ビジネスルール：キャンセルできる条件
  cancel(): void {
    if (this._status === OrderStatus.Shipped) {
      throw new Error('発送済みの注文はキャンセルできません');
    }
    this._status = OrderStatus.Cancelled;
  }

  // ビジネスルール：最低注文金額のチェック
  validate(): void {
    if (this.totalAmount < 500) {
      throw new Error('注文金額は500円以上である必要があります');
    }
    if (this.items.length === 0) {
      throw new Error('注文には少なくとも1つの商品が必要です');
    }
  }
}

// domain/models/OrderItem.ts
export class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: number
  ) {}

  get subtotal(): number {
    return this.unitPrice * this.quantity;
  }
}

// domain/repositories/OrderRepository.ts
// データの保存方法の「契約」だけ定義（実装はInfrastructure層）
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}
```

**ポイント**：
- ビジネスルール（「500円以上」「発送済みはキャンセル不可」）が明確
- データベースやHTTPのことは一切書かれていない
- このコードを読めば、ビジネスのルールが分かる

### 2. Application層：ユースケースを実装

```typescript
// application/services/OrderService.ts
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private paymentService: PaymentService
  ) {}

  // ユースケース：注文を作成する
  async createOrder(dto: CreateOrderDto): Promise<string> {
    // 1. Domainオブジェクトを作成
    const order = new Order(
      generateId(),
      dto.userId,
      dto.items.map(item => new OrderItem(
        item.productId,
        item.quantity,
        item.unitPrice
      )),
      OrderStatus.Pending
    );

    // 2. ビジネスルールをチェック
    order.validate();

    // 3. 決済処理（Infrastructure層の実装を利用）
    await this.paymentService.processPayment(order.totalAmount);

    // 4. 保存（Infrastructure層の実装を利用）
    await this.orderRepository.save(order);

    return order.id;
  }

  // ユースケース：注文をキャンセルする
  async cancelOrder(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('注文が見つかりません');
    }

    // ビジネスルールはDomain層に委譲
    order.cancel();

    await this.orderRepository.save(order);
  }
}

// application/dto/CreateOrderDto.ts
// 外部から受け取るデータの形
export interface CreateOrderDto {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
```

**ポイント**：
- 処理の「流れ」を記述（1→2→3→4）
- ビジネスルールは Domain層 に書かれているものを呼ぶだけ
- データベースの詳細は知らない（インターフェイスだけ使う）

### 3. Infrastructure層：技術的な実装

```typescript
// infrastructure/database/PostgresOrderRepository.ts
// OrderRepositoryインターフェイスの実装
export class PostgresOrderRepository implements OrderRepository {
  constructor(private db: Pool) {}

  async save(order: Order): Promise<void> {
    // PostgreSQL固有の実装
    await this.db.query(
      'INSERT INTO orders (id, user_id, total_amount, status) VALUES ($1, $2, $3, $4)',
      [order.id, order.userId, order.totalAmount, order.status]
    );
  }

  async findById(id: string): Promise<Order | null> {
    const result = await this.db.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;

    // DBのデータをDomainオブジェクトに変換
    return this.mapToOrder(result.rows[0]);
  }

  private mapToOrder(row: any): Order {
    // データベースの行からOrderオブジェクトを組み立てる
    // ...
  }
}
```

**ポイント**：
- PostgreSQLの詳細はここだけに閉じ込められている
- 「OrderRepositoryという契約を守る」形で実装
- データベースを変えたくなったら、この層だけ書き換えればOK

### 4. Interface層：外の世界との窓口

```typescript
// interface/http/OrderController.ts
export class OrderController {
  constructor(private orderService: OrderService) {}

  // HTTPリクエストを受け取る
  async createOrder(req: Request, res: Response) {
    try {
      // 1. HTTPリクエストをDTOに変換
      const dto: CreateOrderDto = {
        userId: req.body.userId,
        items: req.body.items
      };

      // 2. Application層に処理を委譲
      const orderId = await this.orderService.createOrder(dto);

      // 3. HTTPレスポンスを返す
      res.status(201).json({ orderId });
    } catch (error) {
      // エラーをHTTPステータスコードに変換
      res.status(400).json({ error: error.message });
    }
  }

  async cancelOrder(req: Request, res: Response) {
    try {
      await this.orderService.cancelOrder(req.params.orderId);
      res.status(200).json({ message: 'キャンセルしました' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

**ポイント**：
- HTTPの詳細（リクエスト、レスポンス、ステータスコード）はここだけ
- ビジネスロジックは書かない、全部Application層に任せる
- HTTPをGraphQLに変えたくなっても、この層を書き換えるだけ

## 各層の責任を図で理解する

```
┌─────────────────────────────────────────┐
│  Interface層（窓口）                     │
│  - HTTPリクエストの受け取り              │
│  - レスポンスの返却                      │
│  - エラーをステータスコードに変換        │
└──────────────┬──────────────────────────┘
               ↓ DTOを渡す
┌─────────────────────────────────────────┐
│  Application層（流れ）                   │
│  - 処理の順番を決める                    │
│  - トランザクション管理                  │
│  - Domain層とInfrastructure層を組み合わせる │
└──────────────┬──────────────────────────┘
               ↓ ビジネスルールを呼ぶ
┌─────────────────────────────────────────┐
│  Domain層（ビジネスの核心）              │
│  - ビジネスルール                        │
│  - 計算ロジック                          │
│  - 制約・バリデーション                  │
│  ※他のどの層にも依存しない！            │
└─────────────────────────────────────────┘
               ↑ インターフェイスを実装
┌─────────────────────────────────────────┐
│  Infrastructure層（道具）                │
│  - データベース接続                      │
│  - 外部API呼び出し                       │
│  - ファイル読み書き                      │
└─────────────────────────────────────────┘
```

## よくある間違いと正しい書き方

### ❌ 間違い1：Domain層にDBのコードを書く

```typescript
// ❌ domain/models/Order.ts
export class Order {
  async save() {
    // DomainでDBに直接保存している（依存してしまっている）
    await db.query('INSERT INTO orders ...');
  }
}
```

### ✅ 正しい：Repositoryインターフェイスを使う

```typescript
// ✅ domain/repositories/OrderRepository.ts
export interface OrderRepository {
  save(order: Order): Promise<void>;
}

// ✅ application/services/OrderService.ts
await this.orderRepository.save(order);

// ✅ infrastructure/database/PostgresOrderRepository.ts
export class PostgresOrderRepository implements OrderRepository {
  async save(order: Order): Promise<void> {
    await this.db.query('INSERT INTO orders ...');
  }
}
```

### ❌ 間違い2：Interface層にビジネスルールを書く

```typescript
// ❌ interface/http/OrderController.ts
async createOrder(req: Request, res: Response) {
  const total = req.body.items.reduce((sum, item) =>
    sum + item.price * item.quantity, 0
  );
  if (total < 500) {
    return res.status(400).json({ error: '500円以上必要です' });
  }
  // ...
}
```

### ✅ 正しい：Domain層にビジネスルールを書く

```typescript
// ✅ domain/models/Order.ts
validate(): void {
  if (this.totalAmount < 500) {
    throw new Error('注文金額は500円以上である必要があります');
  }
}

// ✅ interface/http/OrderController.ts
async createOrder(req: Request, res: Response) {
  try {
    await this.orderService.createOrder(dto); // Domainで検証される
    res.status(201).json({ orderId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

## テストが簡単になる

レイヤーを分けると、テストが劇的に書きやすくなります。

```typescript
// Domain層のテスト：純粋なロジックのテスト（DBもHTTPも不要）
test('500円未満の注文は作れない', () => {
  const order = new Order('1', 'user1', [
    new OrderItem('product1', 1, 300)
  ], OrderStatus.Pending);

  expect(() => order.validate()).toThrow('500円以上');
});

// Application層のテスト：モックを使って流れをテスト
test('注文が正しく保存される', async () => {
  const mockRepository = {
    save: jest.fn(),
    findById: jest.fn()
  };

  const service = new OrderService(mockRepository, mockPaymentService);
  await service.createOrder(dto);

  expect(mockRepository.save).toHaveBeenCalled();
});
```

## まとめ：レイヤーの役割

| レイヤー | 役割 | 例 |
|---------|-----|---|
| **Domain** | ビジネスルール | 「500円以上」「発送済みはキャンセル不可」 |
| **Application** | 処理の流れ | 「検証→決済→保存」の順序 |
| **Infrastructure** | 技術的実装 | PostgreSQLへの保存、Stripe決済API呼び出し |
| **Interface** | 外部との接点 | HTTPリクエスト受信、JSON返却 |

**依存の方向（重要）**：
```
Interface → Application → Domain ← Infrastructure
```
- Domainはどこにも依存しない（一番大事）
- InfrastructureはDomainのインターフェイスを実装する
- Interface と Application は内側を使う

## 始め方のヒント

いきなり全部を完璧に分けようとしなくてOKです。

1. **まずDomain層から**：ビジネスルールを `Order` や `User` などのクラスに書く
2. **次にRepository**：データの保存・取得をインターフェイスで定義
3. **Application層**：処理の流れをまとめる
4. **徐々にリファクタリング**：既存のコードを少しずつ移動させる

最初は完璧を目指さず、「ビジネスルールとDB処理を分ける」だけでも大きな前進です。チームで少しずつ改善していきましょう。
