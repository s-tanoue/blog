---
slug: microservices-ddd-event-driven
title: マイクロサービス設計の基礎：DDD からイベント駆動アーキテクチャまで
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

モノリシックなシステムから脱却し、スケーラブルで保守性の高いマイクロサービスを構築したいと思っていませんか？この記事では、DDD（ドメイン駆動設計）を起点に、境界づけられたコンテキスト、サービス分割、イベント駆動アーキテクチャまで、マイクロサービス設計の基礎を体系的に解説します。

<!--truncate-->

## マイクロサービスとは何か

マイクロサービスアーキテクチャは、大きなアプリケーションを**小さく独立したサービス**の集合として構築するアプローチです。

### モノリスとマイクロサービスの比較

```
【モノリス】
┌─────────────────────────────────┐
│                                 │
│   ユーザー管理                  │
│   商品管理                      │
│   注文管理                      │
│   在庫管理                      │
│   決済処理                      │
│                                 │
│   全てが1つのデプロイ単位       │
└─────────────────────────────────┘

【マイクロサービス】
┌────────┐  ┌────────┐  ┌────────┐
│ユーザー│  │ 商品   │  │ 注文   │
│サービス│  │サービス│  │サービス│
└────────┘  └────────┘  └────────┘
┌────────┐  ┌────────┐
│ 在庫   │  │ 決済   │
│サービス│  │サービス│
└────────┘  └────────┘
各サービスが独立してデプロイ可能
```

### マイクロサービスのメリット

1. **独立したデプロイ**
   - 1つのサービスを変更しても、他に影響しない
   - リリースサイクルが高速化

2. **技術スタックの自由度**
   - サービスごとに最適な技術を選択可能
   - 注文サービスはNode.js、在庫サービスはGo、など

3. **スケーラビリティ**
   - 負荷の高いサービスだけをスケールアウト
   - リソースの効率的利用

4. **障害の分離**
   - 1つのサービスの障害が全体に波及しにくい
   - システム全体の可用性向上

### マイクロサービスの課題

1. **分散システムの複雑さ**
   - ネットワーク遅延、タイムアウト、部分的な障害
   - トランザクション管理が難しい

2. **運用の複雑さ**
   - 多数のサービスの監視、ログ収集
   - デプロイパイプラインの整備が必要

3. **データ整合性**
   - サービス間でのデータ同期
   - 結果整合性の考慮

---

## DDD で境界づけられたコンテキストを見つける

マイクロサービスの適切な分割には、**DDD（ドメイン駆動設計）**が不可欠です。

### 境界づけられたコンテキスト（Bounded Context）とは

境界づけられたコンテキストは、**特定のドメインモデルが有効な範囲**を定義します。

#### 悪い例：全てを1つのモデルで表現

```typescript
// ❌ 1つの「商品」クラスがあらゆる用途に使われている
class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;           // 在庫管理で使用
  discountRate: number;    // 販売促進で使用
  shippingWeight: number;  // 配送で使用
  searchKeywords: string[]; // 検索で使用
  reviewScore: number;     // レビューで使用
  // ... 全ての用途の属性が混在
}
```

この問題点：
- 1つのクラスが肥大化し、複雑になる
- 変更の影響範囲が広い
- 異なるチームが同じコードを編集し、コンフリクト

#### 良い例：コンテキストごとに分割

```typescript
// ✅ カタログコンテキスト：商品情報の閲覧
namespace CatalogContext {
  export class Product {
    id: string;
    name: string;
    description: string;
    imageUrls: string[];
    displayPrice: number;
  }
}

// ✅ 在庫コンテキスト：在庫数の管理
namespace InventoryContext {
  export class Product {
    id: string;
    name: string;  // 表示用の最小限の情報
    stockQuantity: number;
    reservedQuantity: number;
    warehouseLocation: string;
  }
}

// ✅ 注文コンテキスト：注文処理
namespace OrderContext {
  export class OrderItem {
    productId: string;
    productName: string;  // 注文時の商品名（スナップショット）
    quantity: number;
    unitPrice: number;    // 注文時の価格（スナップショット）
  }
}
```

### コンテキストマップの作成

コンテキスト間の関係を図示します。

```
┌─────────────────┐
│   カタログ      │ 商品情報を提供
│   コンテキスト  ├────────────┐
└─────────────────┘            │
                               ↓
┌─────────────────┐      ┌─────────────────┐
│   在庫          │◄─────┤   注文          │
│   コンテキスト  │ 在庫確認 │   コンテキスト  │
└─────────────────┘      └────────┬────────┘
                                  │ 決済依頼
                                  ↓
                         ┌─────────────────┐
                         │   決済          │
                         │   コンテキスト  │
                         └─────────────────┘
```

### イベントストーミングでコンテキストを発見

イベントストーミングは、ドメインイベントを洗い出してコンテキストを発見する手法です。

#### ステップ 1：ドメインイベントを洗い出す

```
ECサイトのイベント例：
- ユーザーが登録された
- 商品がカタログに追加された
- 商品が検索された
- カートに商品が追加された
- 注文が確定された
- 在庫が引き当てられた
- 決済が完了した
- 発送が手配された
- 商品が配送された
- レビューが投稿された
```

#### ステップ 2：イベントをグルーピング

```
【ユーザー管理】
- ユーザーが登録された
- ユーザー情報が更新された

【カタログ管理】
- 商品がカタログに追加された
- 商品情報が更新された
- 商品が検索された

【注文管理】
- カートに商品が追加された
- 注文が確定された
- 注文がキャンセルされた

【在庫管理】
- 在庫が引き当てられた
- 在庫が補充された

【決済管理】
- 決済が完了した
- 決済が失敗した
- 返金が処理された

【配送管理】
- 発送が手配された
- 商品が配送された
```

これらのグループが、境界づけられたコンテキストの候補になります。

---

## マイクロサービスの分割戦略

### サービス分割の原則

#### 1. 単一責任の原則（SRP）

各サービスは1つの明確な責任を持つべきです。

```typescript
// ✅ 良い分割：各サービスが明確な責任を持つ
// ユーザーサービス：ユーザー認証と管理のみ
class UserService {
  async register(email: string, password: string): Promise<User> { }
  async authenticate(email: string, password: string): Promise<Token> { }
  async updateProfile(userId: string, profile: Profile): Promise<void> { }
}

// 注文サービス：注文処理のみ
class OrderService {
  async createOrder(userId: string, items: OrderItem[]): Promise<Order> { }
  async cancelOrder(orderId: string): Promise<void> { }
  async getOrderHistory(userId: string): Promise<Order[]> { }
}
```

#### 2. ビジネスケイパビリティによる分割

ビジネス機能（ケイパビリティ）に基づいてサービスを分割します。

```
【ECサイトのビジネスケイパビリティ】

┌────────────────────┐
│ 商品カタログ管理   │ ← 商品情報の管理、検索
└────────────────────┘

┌────────────────────┐
│ 注文管理           │ ← カート、注文作成、履歴
└────────────────────┘

┌────────────────────┐
│ 在庫管理           │ ← 在庫数の追跡、引き当て
└────────────────────┘

┌────────────────────┐
│ 決済処理           │ ← クレジットカード決済、返金
└────────────────────┘

┌────────────────────┐
│ 配送管理           │ ← 発送手配、配送状況追跡
└────────────────────┘
```

#### 3. データの所有権

各サービスは自分のデータベースを持つ（Database per Service パターン）。

```
┌─────────────────┐     ┌─────────────────┐
│  ユーザー       │     │  注文           │
│  サービス       │     │  サービス       │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ↓                       ↓
┌─────────────────┐     ┌─────────────────┐
│  users DB       │     │  orders DB      │
│  (PostgreSQL)   │     │  (MongoDB)      │
└─────────────────┘     └─────────────────┘
```

**重要な原則**：
- サービスは他のサービスのDBに直接アクセスしない
- データが必要な場合はAPIまたはイベントを通じて取得

### 実例：ECサイトの注文処理

```typescript
// 注文サービス（Order Service）
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private productCatalogClient: ProductCatalogClient,  // カタログサービスのクライアント
    private inventoryClient: InventoryClient,            // 在庫サービスのクライアント
    private paymentClient: PaymentClient,                // 決済サービスのクライアント
    private eventBus: EventBus
  ) {}

  async createOrder(userId: string, items: OrderItemDto[]): Promise<Order> {
    // 1. 商品情報を取得（カタログサービスに問い合わせ）
    const products = await this.productCatalogClient.getProducts(
      items.map(item => item.productId)
    );

    // 2. 在庫確認（在庫サービスに問い合わせ）
    const stockCheck = await this.inventoryClient.checkAvailability(items);
    if (!stockCheck.available) {
      throw new Error('在庫が不足しています');
    }

    // 3. 注文を作成
    const order = new Order({
      userId,
      items: items.map((item, index) => ({
        productId: item.productId,
        productName: products[index].name,  // 注文時の商品名をスナップショット
        quantity: item.quantity,
        unitPrice: products[index].price    // 注文時の価格をスナップショット
      })),
      status: OrderStatus.Pending
    });

    // 4. 在庫を引き当て（在庫サービスに依頼）
    await this.inventoryClient.reserveStock(order.id, items);

    // 5. 決済処理（決済サービスに依頼）
    try {
      await this.paymentClient.processPayment({
        orderId: order.id,
        amount: order.totalAmount,
        userId
      });
    } catch (error) {
      // 決済失敗時は在庫引き当てを解除
      await this.inventoryClient.releaseStock(order.id);
      throw error;
    }

    // 6. 注文を確定
    order.confirm();
    await this.orderRepository.save(order);

    // 7. イベントを発行
    await this.eventBus.publish(new OrderConfirmedEvent({
      orderId: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      items: order.items
    }));

    return order;
  }
}
```

---

## サービス間通信パターン

### 1. 同期通信：REST API

最もシンプルなサービス間通信です。

```typescript
// カタログサービスのクライアント
export class ProductCatalogClient {
  constructor(private httpClient: HttpClient) {}

  async getProduct(productId: string): Promise<Product> {
    const response = await this.httpClient.get(
      `http://catalog-service/api/products/${productId}`
    );
    return response.data;
  }

  async getProducts(productIds: string[]): Promise<Product[]> {
    const response = await this.httpClient.post(
      'http://catalog-service/api/products/batch',
      { productIds }
    );
    return response.data;
  }
}
```

**メリット**：
- シンプルで理解しやすい
- デバッグが容易
- 即座にレスポンスが得られる

**デメリット**：
- サービスの可用性に依存（カタログサービスがダウンすると注文できない）
- レイテンシが積み重なる（複数サービスを呼ぶと遅くなる）
- タイトな結合になりやすい

### 2. 非同期通信：メッセージング

メッセージブローカーを介した通信です。

```typescript
// イベントの定義
export class OrderConfirmedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public readonly occurredAt: Date = new Date()
  ) {}
}

// イベントを発行する側（注文サービス）
export class OrderService {
  async confirmOrder(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    order.confirm();
    await this.orderRepository.save(order);

    // イベントを発行
    await this.eventBus.publish(
      'order.confirmed',
      new OrderConfirmedEvent(
        order.id,
        order.userId,
        order.items,
        order.totalAmount
      )
    );
  }
}

// イベントを購読する側（在庫サービス）
export class InventoryEventHandler {
  @Subscribe('order.confirmed')
  async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    // 引き当て済みの在庫を確定する
    for (const item of event.items) {
      await this.inventoryService.commitReservation(
        event.orderId,
        item.productId,
        item.quantity
      );
    }
  }
}

// イベントを購読する側（配送サービス）
export class ShippingEventHandler {
  @Subscribe('order.confirmed')
  async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    // 配送を手配する
    await this.shippingService.arrangeShipment({
      orderId: event.orderId,
      items: event.items
    });
  }
}
```

**メリット**：
- サービス間の疎結合
- サービスが一時的にダウンしていてもメッセージは保持される
- 新しいサービスを追加しやすい（既存のイベントを購読するだけ）

**デメリット**：
- デバッグが難しい（処理の流れが追いにくい）
- 結果整合性を考慮する必要がある
- メッセージブローカーが単一障害点になりうる

### 3. メッセージブローカーの選択

主要なメッセージブローカーの比較：

| ブローカー | 特徴 | ユースケース |
|-----------|------|------------|
| **RabbitMQ** | AMQP準拠、柔軟なルーティング | 複雑なメッセージングパターンが必要な場合 |
| **Apache Kafka** | 高スループット、ログベース | イベントソーシング、ストリーム処理 |
| **AWS SQS** | マネージド、シンプル | AWSエコシステム内での簡単な非同期処理 |
| **Redis Streams** | 軽量、低レイテンシ | リアルタイム性が重要な場合 |

#### RabbitMQ の実装例

```typescript
import amqp from 'amqplib';

// イベントバスの実装
export class RabbitMQEventBus {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async connect(): Promise<void> {
    this.connection = await amqp.connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
  }

  async publish(eventName: string, event: any): Promise<void> {
    const exchange = 'domain-events';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });

    this.channel.publish(
      exchange,
      eventName,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );
  }

  async subscribe(eventName: string, handler: (event: any) => Promise<void>): Promise<void> {
    const exchange = 'domain-events';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });

    const queue = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue.queue, exchange, eventName);

    this.channel.consume(queue.queue, async (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        try {
          await handler(event);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error handling event:', error);
          // リトライロジックをここに追加
          this.channel.nack(msg, false, true);
        }
      }
    });
  }
}
```

---

## イベント駆動アーキテクチャ

イベント駆動アーキテクチャは、システムの状態変化を**イベント**として表現し、イベントを中心にサービスを連携させるアプローチです。

### イベントの種類

#### 1. ドメインイベント（Domain Event）

ビジネス上の重要な出来事を表すイベントです。

```typescript
// ドメインイベントの例
export class OrderConfirmedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public readonly confirmedAt: Date
  ) {}
}

export class PaymentCompletedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly paidAt: Date
  ) {}
}

export class ProductOutOfStockEvent {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly detectedAt: Date
  ) {}
}
```

**命名規則**：
- 過去形で表現（OrderConfirmed、PaymentCompleted）
- ビジネスの言葉で表現（技術用語を避ける）

#### 2. インテグレーションイベント（Integration Event）

サービス間の統合のためのイベントです。

```typescript
// インテグレーションイベントの例
export class OrderCreatedIntegrationEvent {
  eventId: string;
  eventType: string = 'OrderCreated';
  eventVersion: string = '1.0';
  occurredAt: Date;

  // ペイロード
  orderId: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  totalAmount: number;
}
```

**ドメインイベントとの違い**：
- バージョニングを含む（スキーマの進化に対応）
- より汎用的な形式（他のサービスが理解できる形）
- メタデータを含む（イベントID、発生時刻など）

### イベントソーシング（Event Sourcing）

イベントソーシングは、状態の変更を**イベントのシーケンス**として保存する手法です。

```typescript
// 従来の状態ベースの保存
// ❌ 現在の状態だけを保存
const order = {
  id: '123',
  status: 'Confirmed',  // 過去の状態（Pending → Confirmedの変化）は失われる
  totalAmount: 15000
};

// ✅ イベントソーシング：イベントのシーケンスとして保存
const events = [
  { type: 'OrderCreated', orderId: '123', items: [...], totalAmount: 15000 },
  { type: 'PaymentCompleted', orderId: '123', paymentId: 'pay-456' },
  { type: 'OrderConfirmed', orderId: '123' }
];
```

#### イベントソーシングの実装

```typescript
// 注文の集約（Aggregate）
export class Order {
  private id: string;
  private userId: string;
  private items: OrderItem[] = [];
  private status: OrderStatus = OrderStatus.Pending;
  private version: number = 0;

  // 未コミットのイベント
  private uncommittedEvents: DomainEvent[] = [];

  // イベントからの復元
  static fromEvents(events: DomainEvent[]): Order {
    const order = new Order();
    events.forEach(event => order.apply(event, false));
    return order;
  }

  // コマンド：注文を確定
  confirm(): void {
    if (this.status !== OrderStatus.Pending) {
      throw new Error('Pending状態の注文のみ確定できます');
    }
    this.apply(new OrderConfirmedEvent(this.id, this.userId, this.items, this.totalAmount, new Date()));
  }

  // イベントを適用
  private apply(event: DomainEvent, isNew: boolean = true): void {
    // イベントに応じて状態を更新
    if (event instanceof OrderCreatedEvent) {
      this.id = event.orderId;
      this.userId = event.userId;
      this.items = event.items;
      this.status = OrderStatus.Pending;
    } else if (event instanceof OrderConfirmedEvent) {
      this.status = OrderStatus.Confirmed;
    } else if (event instanceof OrderCancelledEvent) {
      this.status = OrderStatus.Cancelled;
    }

    this.version++;

    if (isNew) {
      this.uncommittedEvents.push(event);
    }
  }

  getUncommittedEvents(): DomainEvent[] {
    return this.uncommittedEvents;
  }

  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }
}

// イベントストア
export class EventStore {
  constructor(private db: Database) {}

  // イベントを保存
  async save(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    // 楽観的ロック（バージョンチェック）
    const currentVersion = await this.getCurrentVersion(aggregateId);
    if (currentVersion !== expectedVersion) {
      throw new Error('Concurrency conflict');
    }

    // イベントを保存
    for (const event of events) {
      await this.db.query(
        'INSERT INTO events (aggregate_id, event_type, event_data, version, occurred_at) VALUES (?, ?, ?, ?, ?)',
        [aggregateId, event.constructor.name, JSON.stringify(event), currentVersion + 1, event.occurredAt]
      );
    }
  }

  // イベントを読み込み
  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const rows = await this.db.query(
      'SELECT event_type, event_data FROM events WHERE aggregate_id = ? ORDER BY version ASC',
      [aggregateId]
    );

    return rows.map(row => this.deserializeEvent(row.event_type, row.event_data));
  }

  private deserializeEvent(eventType: string, eventData: string): DomainEvent {
    // イベントタイプに応じてデシリアライズ
    // ...
  }
}

// リポジトリ
export class OrderEventSourcedRepository {
  constructor(private eventStore: EventStore) {}

  async findById(orderId: string): Promise<Order | null> {
    const events = await this.eventStore.getEvents(orderId);
    if (events.length === 0) return null;

    return Order.fromEvents(events);
  }

  async save(order: Order): Promise<void> {
    const events = order.getUncommittedEvents();
    await this.eventStore.save(order.id, events, order.version - events.length);
    order.clearUncommittedEvents();
  }
}
```

**イベントソーシングのメリット**：
1. **完全な監査証跡**：すべての変更履歴が残る
2. **タイムトラベル**：過去の任意の時点の状態を再現できる
3. **イベント駆動アーキテクチャとの親和性**：イベントをそのまま他のサービスに送信できる

**デメリット**：
1. **学習コスト**：従来のCRUDより複雑
2. **クエリの複雑さ**：現在の状態を得るには全イベントを再生する必要がある
3. **スキーマの進化**：イベントの形式を変更するのが難しい

### CQRS（Command Query Responsibility Segregation）

イベントソーシングと組み合わせて使われる、読み取りと書き込みを分離するパターンです。

```
【書き込み側（Command）】
クライアント → コマンド → 集約 → イベント → イベントストア
                                      ↓
【読み取り側（Query）】                ↓
クライアント → クエリ → リードモデル ←─┘
                        （投影/Projection）
```

#### CQRS の実装

```typescript
// コマンド側：書き込み
export class OrderCommandService {
  constructor(
    private orderRepository: OrderEventSourcedRepository,
    private eventBus: EventBus
  ) {}

  async createOrder(command: CreateOrderCommand): Promise<string> {
    const order = Order.create(
      command.userId,
      command.items
    );

    await this.orderRepository.save(order);

    // イベントを発行
    for (const event of order.getUncommittedEvents()) {
      await this.eventBus.publish(event);
    }

    return order.id;
  }
}

// クエリ側：読み取り用のリードモデル
export interface OrderListItemDto {
  orderId: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export class OrderQueryService {
  constructor(private readDb: Database) {}

  async getOrderHistory(userId: string): Promise<OrderListItemDto[]> {
    // リードモデルから直接取得（高速）
    const rows = await this.readDb.query(
      'SELECT order_id, user_id, total_amount, status, created_at FROM order_list WHERE user_id = ?',
      [userId]
    );

    return rows.map(row => ({
      orderId: row.order_id,
      userId: row.user_id,
      totalAmount: row.total_amount,
      status: row.status,
      createdAt: row.created_at
    }));
  }

  async getOrderDetails(orderId: string): Promise<OrderDetailsDto> {
    // 詳細情報も最適化されたテーブルから取得
    // ...
  }
}

// イベントを購読してリードモデルを更新
export class OrderListProjection {
  constructor(private readDb: Database) {}

  @Subscribe('OrderCreatedEvent')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.readDb.query(
      'INSERT INTO order_list (order_id, user_id, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [event.orderId, event.userId, event.totalAmount, 'Pending', event.occurredAt]
    );
  }

  @Subscribe('OrderConfirmedEvent')
  async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    await this.readDb.query(
      'UPDATE order_list SET status = ? WHERE order_id = ?',
      ['Confirmed', event.orderId]
    );
  }
}
```

**CQRS のメリット**：
1. **読み取りの最適化**：クエリ専用のデータモデルで高速化
2. **スケーラビリティ**：読み取りと書き込みを独立してスケール
3. **複雑なクエリに対応**：リードモデルを用途に合わせて最適化

---

## Saga パターン：分散トランザクション

マイクロサービスでは、複数のサービスにまたがるトランザクションが課題になります。Sagaパターンは、一連のローカルトランザクションと補償トランザクションで分散トランザクションを実現します。

### Saga の種類

#### 1. Choreography（コレオグラフィー）ベース

各サービスがイベントを購読し、自律的に動作します。

```typescript
// 注文サービス
export class OrderService {
  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    const order = new Order(userId, items);
    await this.orderRepository.save(order);

    // イベントを発行
    await this.eventBus.publish(new OrderCreatedEvent(order.id, order.userId, order.items, order.totalAmount));

    return order;
  }

  @Subscribe('PaymentFailedEvent')
  async handlePaymentFailed(event: PaymentFailedEvent): Promise<void> {
    // 補償トランザクション：注文をキャンセル
    const order = await this.orderRepository.findById(event.orderId);
    order.cancel();
    await this.orderRepository.save(order);
  }
}

// 在庫サービス
export class InventoryService {
  @Subscribe('OrderCreatedEvent')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      // 在庫を引き当て
      await this.reserveStock(event.orderId, event.items);

      // 成功イベントを発行
      await this.eventBus.publish(new StockReservedEvent(event.orderId));
    } catch (error) {
      // 失敗イベントを発行
      await this.eventBus.publish(new StockReservationFailedEvent(event.orderId, error.message));
    }
  }

  @Subscribe('OrderCancelledEvent')
  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    // 補償トランザクション：在庫引き当てを解除
    await this.releaseStock(event.orderId);
  }
}

// 決済サービス
export class PaymentService {
  @Subscribe('StockReservedEvent')
  async handleStockReserved(event: StockReservedEvent): Promise<void> {
    try {
      // 決済処理
      await this.processPayment(event.orderId);

      // 成功イベントを発行
      await this.eventBus.publish(new PaymentCompletedEvent(event.orderId));
    } catch (error) {
      // 失敗イベントを発行
      await this.eventBus.publish(new PaymentFailedEvent(event.orderId, error.message));
    }
  }
}
```

**フロー**：
```
注文サービス：OrderCreatedEvent 発行
     ↓
在庫サービス：在庫引き当て → StockReservedEvent 発行
     ↓
決済サービス：決済処理 → PaymentCompletedEvent 発行

【失敗時の補償フロー】
決済サービス：決済失敗 → PaymentFailedEvent 発行
     ↓
在庫サービス：在庫引き当て解除
     ↓
注文サービス：注文キャンセル
```

**メリット**：
- シンプルで理解しやすい
- 中央の調整役が不要

**デメリット**：
- 処理の流れが追いにくい
- 循環的な依存が発生しやすい

#### 2. Orchestration（オーケストレーション）ベース

Saga Orchestratorが中央で処理を調整します。

```typescript
// Saga の定義
export class OrderSagaOrchestrator {
  constructor(
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
    private orderRepository: OrderRepository,
    private sagaStateRepository: SagaStateRepository
  ) {}

  async execute(orderId: string): Promise<void> {
    const sagaState = new SagaState(orderId);

    try {
      // ステップ1：在庫引き当て
      sagaState.setCurrentStep('RESERVE_STOCK');
      await this.sagaStateRepository.save(sagaState);

      await this.inventoryService.reserveStock(orderId);
      sagaState.completeStep('RESERVE_STOCK');

      // ステップ2：決済処理
      sagaState.setCurrentStep('PROCESS_PAYMENT');
      await this.sagaStateRepository.save(sagaState);

      await this.paymentService.processPayment(orderId);
      sagaState.completeStep('PROCESS_PAYMENT');

      // ステップ3：注文確定
      sagaState.setCurrentStep('CONFIRM_ORDER');
      await this.sagaStateRepository.save(sagaState);

      const order = await this.orderRepository.findById(orderId);
      order.confirm();
      await this.orderRepository.save(order);

      sagaState.complete();
      await this.sagaStateRepository.save(sagaState);

    } catch (error) {
      // 補償トランザクションを実行
      await this.compensate(sagaState);
      sagaState.fail(error.message);
      await this.sagaStateRepository.save(sagaState);
      throw error;
    }
  }

  private async compensate(sagaState: SagaState): Promise<void> {
    const completedSteps = sagaState.getCompletedSteps();

    // 逆順で補償
    for (const step of completedSteps.reverse()) {
      switch (step) {
        case 'PROCESS_PAYMENT':
          await this.paymentService.refund(sagaState.orderId);
          break;
        case 'RESERVE_STOCK':
          await this.inventoryService.releaseStock(sagaState.orderId);
          break;
      }
    }
  }
}

// Saga の状態管理
export class SagaState {
  constructor(
    public readonly orderId: string,
    private currentStep: string | null = null,
    private completedSteps: string[] = [],
    private status: 'RUNNING' | 'COMPLETED' | 'FAILED' = 'RUNNING'
  ) {}

  setCurrentStep(step: string): void {
    this.currentStep = step;
  }

  completeStep(step: string): void {
    this.completedSteps.push(step);
    this.currentStep = null;
  }

  complete(): void {
    this.status = 'COMPLETED';
  }

  fail(reason: string): void {
    this.status = 'FAILED';
  }

  getCompletedSteps(): string[] {
    return [...this.completedSteps];
  }
}
```

**メリット**：
- 処理の流れが明確
- エラーハンドリングが一元化
- 状態管理が容易

**デメリット**：
- Orchestratorが単一障害点になりうる
- Orchestratorが複雑になりがち

---

## API ゲートウェイ

マイクロサービスでは、クライアントが多数のサービスと直接通信するのは大変です。API Gatewayはこれを解決します。

```
【API Gateway なし】
モバイルアプリ ─┬─→ ユーザーサービス
                ├─→ 商品サービス
                ├─→ 注文サービス
                └─→ 在庫サービス

【API Gateway あり】
モバイルアプリ → API Gateway ─┬─→ ユーザーサービス
                              ├─→ 商品サービス
                              ├─→ 注文サービス
                              └─→ 在庫サービス
```

### API Gateway の役割

1. **ルーティング**：リクエストを適切なサービスに転送
2. **認証・認可**：JWTトークンの検証
3. **レート制限**：過剰なリクエストを制限
4. **レスポンスの集約**：複数サービスのレスポンスをまとめる
5. **プロトコル変換**：HTTP → gRPC など

### API Gateway の実装例（Node.js + Express）

```typescript
import express from 'express';
import httpProxy from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';

const app = express();

// 認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// レート制限ミドルウェア
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // 最大100リクエスト
});

app.use(limiter);

// ユーザーサービスへのプロキシ
app.use('/api/users', httpProxy.createProxyMiddleware({
  target: 'http://user-service:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users'
  }
}));

// 商品サービスへのプロキシ（認証不要）
app.use('/api/products', httpProxy.createProxyMiddleware({
  target: 'http://product-service:3002',
  changeOrigin: true
}));

// 注文サービスへのプロキシ（認証必要）
app.use('/api/orders', authenticateToken, httpProxy.createProxyMiddleware({
  target: 'http://order-service:3003',
  changeOrigin: true
}));

// レスポンス集約の例：商品詳細 + 在庫情報
app.get('/api/product-details/:productId', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.productId;

    // 複数のサービスに並列リクエスト
    const [productResponse, inventoryResponse] = await Promise.all([
      fetch(`http://product-service:3002/products/${productId}`),
      fetch(`http://inventory-service:3004/inventory/${productId}`)
    ]);

    const product = await productResponse.json();
    const inventory = await inventoryResponse.json();

    // レスポンスを集約
    res.json({
      ...product,
      stock: inventory.quantity,
      available: inventory.quantity > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

app.listen(8080, () => {
  console.log('API Gateway listening on port 8080');
});
```

---

## 監視と可観測性（Observability）

マイクロサービスでは、分散システムの監視が重要です。

### 可観測性の3本柱

#### 1. ログ（Logging）

各サービスのログを集約します。

```typescript
// 構造化ログの例
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用例
logger.info('Order created', {
  orderId: '123',
  userId: 'user-456',
  totalAmount: 15000,
  timestamp: new Date().toISOString()
});
```

**ログ集約ツール**：
- **ELK Stack**（Elasticsearch、Logstash、Kibana）
- **Loki** + Grafana
- **AWS CloudWatch Logs**

#### 2. メトリクス（Metrics）

システムのパフォーマンス指標を収集します。

```typescript
import prometheus from 'prom-client';

// カウンター：注文数
const orderCounter = new prometheus.Counter({
  name: 'orders_total',
  help: 'Total number of orders',
  labelNames: ['status']
});

// ヒストグラム：レスポンス時間
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// 使用例
app.post('/orders', async (req, res) => {
  const end = httpRequestDuration.startTimer();

  try {
    const order = await orderService.createOrder(req.body);
    orderCounter.inc({ status: 'success' });
    res.json(order);
    end({ method: 'POST', route: '/orders', status_code: 200 });
  } catch (error) {
    orderCounter.inc({ status: 'failed' });
    res.status(500).json({ error: error.message });
    end({ method: 'POST', route: '/orders', status_code: 500 });
  }
});

// メトリクスエンドポイント
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

**メトリクス収集ツール**：
- **Prometheus** + Grafana
- **Datadog**
- **AWS CloudWatch**

#### 3. 分散トレーシング（Distributed Tracing）

リクエストがサービス間をどう流れるかを追跡します。

```typescript
import { trace } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

// トレーサーの設定
const provider = new NodeTracerProvider();
const exporter = new JaegerExporter({
  serviceName: 'order-service',
  endpoint: 'http://jaeger:14268/api/traces'
});
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

// 使用例
app.post('/orders', async (req, res) => {
  const tracer = trace.getTracer('order-service');

  // スパンを開始
  const span = tracer.startSpan('createOrder');
  span.setAttribute('userId', req.body.userId);

  try {
    // 在庫サービスを呼び出し（スパンを伝播）
    const inventorySpan = tracer.startSpan('checkInventory', {
      parent: span
    });
    await inventoryClient.checkAvailability(req.body.items);
    inventorySpan.end();

    // 決済サービスを呼び出し（スパンを伝播）
    const paymentSpan = tracer.startSpan('processPayment', {
      parent: span
    });
    await paymentClient.processPayment(req.body);
    paymentSpan.end();

    span.setStatus({ code: SpanStatusCode.OK });
    res.json({ orderId: '123' });
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
    res.status(500).json({ error: error.message });
  } finally {
    span.end();
  }
});
```

**分散トレーシングツール**：
- **Jaeger**
- **Zipkin**
- **AWS X-Ray**
- **Datadog APM**

---

## まとめ

マイクロサービス設計の要点をまとめます。

### 設計の流れ

1. **DDD でドメインを理解**
   - イベントストーミングでドメインイベントを洗い出す
   - 境界づけられたコンテキストを見つける

2. **サービスに分割**
   - ビジネスケイパビリティに基づいて分割
   - 各サービスが自分のデータベースを持つ

3. **通信パターンを選択**
   - 同期通信（REST）：即座のレスポンスが必要な場合
   - 非同期通信（メッセージング）：疎結合が重要な場合

4. **イベント駆動で連携**
   - ドメインイベントを定義
   - イベントソーシング/CQRSを検討

5. **分散トランザクションを管理**
   - Saga パターンで補償トランザクション

6. **可観測性を確保**
   - ログ、メトリクス、分散トレーシングを導入

### アンチパターンを避ける

| アンチパターン | 問題 | 解決策 |
|-------------|------|-------|
| **分散モノリス** | サービスが密結合で、全体を同時にデプロイする必要がある | サービス間の依存を減らし、イベント駆動にする |
| **共有データベース** | サービスが同じDBを共有している | Database per Service パターンを適用 |
| **不適切な境界** | ビジネスロジックではなく技術的な層で分割 | DDDの境界づけられたコンテキストに基づく |
| **過度な細分化** | サービスが多すぎて管理が大変 | 適切な粒度で分割（マイクロサービスは手段、目的ではない） |

### 始め方

いきなり全てをマイクロサービスにする必要はありません。

1. **モノリスから始める**：まずはシンプルなモノリスで開発
2. **モジュラーモノリス**：モノリス内でモジュール分割（将来の分割に備える）
3. **段階的に分割**：ボトルネックや変更頻度の高い部分から切り出す
4. **経験を積む**：小さく始めて、チームが慣れてから拡大

マイクロサービスは強力ですが、複雑さも増します。チームの成熟度、システムの規模、ビジネス要件に応じて、適切なアーキテクチャを選択しましょう。
