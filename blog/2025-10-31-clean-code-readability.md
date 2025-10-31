---
slug: clean-code-readability
title: 可読性の高いコードを書く：Clean Codeの実践ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

コードは書かれる回数よりも読まれる回数の方が圧倒的に多いため、**可読性**はソフトウェア開発における最重要要素の一つです。Robert C. Martin（Uncle Bob）の名著「Clean Code」の原則に基づき、保守性が高く、理解しやすいコードを書くための実践的な方法を解説します。

<!--truncate-->

## Clean Codeとは何か

**Clean Code（クリーンコード）**とは、**読みやすく、理解しやすく、変更しやすいコード**のことです。Clean Codeは以下の特徴を持ちます：

- **明確な意図**: コードを読むだけで何をしているかが分かる
- **シンプル**: 不要な複雑さがない
- **保守性**: 変更や拡張が容易
- **テスタブル**: テストが書きやすい
- **一貫性**: プロジェクト全体で統一されたスタイル

### Clean Codeが重要な理由

#### 1. 開発速度の向上

可読性の高いコードは、新機能の追加やバグ修正が速くなります。

**悪い例（時間がかかる）**:
```python
def calc(x, y, z):
    if z == 1:
        return x + y
    elif z == 2:
        return x - y
    elif z == 3:
        return x * y
    else:
        return x / y
```

**良い例（すぐに理解できる）**:
```python
def add(a: int, b: int) -> int:
    return a + b

def subtract(a: int, b: int) -> int:
    return a - b

def multiply(a: int, b: int) -> int:
    return a * b

def divide(a: int, b: int) -> float:
    if b == 0:
        raise ValueError("除数は0以外である必要があります")
    return a / b
```

#### 2. バグの削減

明確なコードはバグが発見しやすく、新たなバグも生まれにくくなります。

#### 3. チーム開発の円滑化

コードが読みやすいと、チームメンバーがスムーズに協業できます。

#### 4. 技術的負債の削減

Clean Codeは長期的にメンテナンスコストを削減します。

---

## 1. 意味のある命名（Meaningful Names）

### 意図を明確にする

変数名、関数名、クラス名は、その役割や目的を明確に表現すべきです。

**悪い例**:
```typescript
// 何を表しているか不明
const d = 86400;
let x = users.filter(u => u.age > 18);
```

**良い例**:
```typescript
// 明確な意味が分かる
const SECONDS_PER_DAY = 86400;
const adultUsers = users.filter(user => user.age > 18);
```

### 誤解を招く名前を避ける

**悪い例**:
```java
// accountListという名前だが、実際はListではない
Map<String, Account> accountList = new HashMap<>();

// hpはhorsepowerかhitPointsか、それともhomepageか？
int hp = 100;
```

**良い例**:
```java
// 正確な型を反映
Map<String, Account> accountMap = new HashMap<>();

// 明確な名前
int hitPoints = 100;
int horsepower = 250;
String homepage = "https://example.com";
```

### 検索可能な名前を使用する

**悪い例**:
```python
# マジックナンバー：何を意味するか不明
time.sleep(86400)
if status == 5:
    process()
```

**良い例**:
```python
# 定数として定義：検索可能で意味が明確
SECONDS_PER_DAY = 86400
STATUS_COMPLETED = 5

time.sleep(SECONDS_PER_DAY)
if status == STATUS_COMPLETED:
    process()
```

### クラス名と関数名の規則

**クラス名**: 名詞または名詞句を使用

```typescript
// 良い例
class Customer {}
class WikiPage {}
class Account {}

// 悪い例
class Manage {}  // 動詞
class Process {} // 曖昧
class Data {}    // 抽象的すぎる
```

**関数名**: 動詞または動詞句を使用

```python
# 良い例
def save_customer(customer: Customer) -> None:
    pass

def is_valid_email(email: str) -> bool:
    pass

def get_user_by_id(user_id: int) -> User:
    pass

# 悪い例
def customer():  # 何をするのか不明
    pass

def valid():     # 曖昧
    pass
```

---

## 2. 関数（Functions）

### 小さく保つ

関数は**1つのことだけを行う**べきです。理想的には、関数は20行以下に収めます。

**悪い例（複数の責務を持つ）**:
```javascript
function processUserRegistration(userData) {
    // 検証
    if (!userData.email || !userData.password) {
        throw new Error('Invalid data');
    }

    // パスワードのハッシュ化
    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    // データベースへの保存
    const user = db.users.create({
        email: userData.email,
        password: hashedPassword
    });

    // メール送信
    sendEmail(user.email, 'Welcome!', 'Thank you for registering');

    // ログ記録
    logger.info(`New user registered: ${user.email}`);

    return user;
}
```

**良い例（単一責任）**:
```javascript
function processUserRegistration(userData) {
    validateUserData(userData);
    const user = createUser(userData);
    sendWelcomeEmail(user);
    logUserRegistration(user);
    return user;
}

function validateUserData(userData) {
    if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
    }
}

function createUser(userData) {
    const hashedPassword = hashPassword(userData.password);
    return db.users.create({
        email: userData.email,
        password: hashedPassword
    });
}

function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

function sendWelcomeEmail(user) {
    sendEmail(user.email, 'Welcome!', 'Thank you for registering');
}

function logUserRegistration(user) {
    logger.info(`New user registered: ${user.email}`);
}
```

### 引数は少なく

関数の引数は**0〜3個**が理想的です。引数が多い場合は、オブジェクトにまとめることを検討します。

**悪い例（引数が多すぎる）**:
```java
public void createUser(String firstName, String lastName, String email,
                       String phone, String address, String city,
                       String state, String zipCode) {
    // ...
}
```

**良い例（オブジェクトでまとめる）**:
```java
public class UserInfo {
    private String firstName;
    private String lastName;
    private String email;
    private ContactInfo contactInfo;
    private Address address;
}

public void createUser(UserInfo userInfo) {
    // ...
}
```

### 副作用を避ける

関数は予期しない変更（副作用）を引き起こすべきではありません。

**悪い例（副作用あり）**:
```python
def check_password(username: str, password: str) -> bool:
    user = db.get_user(username)
    if user.password == password:
        # 副作用：セッションを開始している
        initialize_session(user)
        return True
    return False
```

**良い例（副作用なし）**:
```python
def check_password(username: str, password: str) -> bool:
    user = db.get_user(username)
    return user.password == password

# 明示的に分離
def authenticate_user(username: str, password: str) -> bool:
    if check_password(username, password):
        user = db.get_user(username)
        initialize_session(user)
        return True
    return False
```

### コマンドとクエリの分離

関数は**何かを実行する**か、**何かを返す**かのどちらか一方にすべきです。

**悪い例（コマンドとクエリが混在）**:
```typescript
// 属性を設定し、成功したかどうかを返す
function setAttribute(attribute: string, value: string): boolean {
    // ...
    return success;
}

// 使用時に混乱を招く
if (setAttribute("username", "john")) {
    // 設定が成功した？それとも既に設定されていた？
}
```

**良い例（分離）**:
```typescript
// クエリ：状態を返す
function hasAttribute(attribute: string): boolean {
    // ...
}

// コマンド：状態を変更する
function setAttribute(attribute: string, value: string): void {
    // ...
}

// 使用時に明確
if (!hasAttribute("username")) {
    setAttribute("username", "john");
}
```

---

## 3. コメント（Comments）

### コードで表現できることはコメントしない

**悪い例（不要なコメント）**:
```java
// ユーザーが成人かどうかチェック
if (user.age >= 18) {
    // ...
}
```

**良い例（自己説明的なコード）**:
```java
if (user.isAdult()) {
    // ...
}

// User クラス内
public boolean isAdult() {
    return age >= ADULT_AGE_THRESHOLD;
}
```

### 良いコメントの例

#### 1. 意図の説明

```python
# 性能向上のため、バイナリサーチを使用
# 大規模データセット（100万件以上）での検索速度が重要
def find_user(user_id: int) -> User:
    return binary_search(users, user_id)
```

#### 2. 警告

```typescript
// 警告：この関数は非常に時間がかかる可能性があります
// 大規模データセットでは、バックグラウンドジョブで実行してください
function calculateComplexStatistics(data: Data[]): Statistics {
    // ...
}
```

#### 3. TODO コメント

```go
// TODO: キャッシュ機構を実装して性能を改善 (Issue #123)
func fetchUserData(userID int) (*User, error) {
    // 直接データベースから取得
    return db.GetUser(userID)
}
```

#### 4. 公開APIのドキュメント

```javascript
/**
 * ユーザーをメールアドレスで検索します
 *
 * @param {string} email - 検索するメールアドレス
 * @returns {Promise<User|null>} ユーザーが見つかった場合はUserオブジェクト、見つからない場合はnull
 * @throws {ValidationError} メールアドレスの形式が無効な場合
 */
async function findUserByEmail(email) {
    // ...
}
```

### 悪いコメントの例

#### 1. 冗長なコメント

```python
# 悪い例：コードを繰り返しているだけ
# userの名前を取得
name = user.get_name()

# 良い例：コメント不要
name = user.get_name()
```

#### 2. コメントアウトされたコード

```java
// 悪い例：削除すべき
public void processOrder(Order order) {
    // validateOrder(order);  // 古い検証ロジック
    // calculateTax(order);   // 税計算は別サービスに移行
    processPayment(order);
}

// 良い例：不要なコードは削除（バージョン管理システムで履歴は残る）
public void processOrder(Order order) {
    processPayment(order);
}
```

---

## 4. コードフォーマット（Formatting）

### 垂直方向のフォーマット

**関連するコードは近くに配置**します。

**悪い例**:
```python
class UserService:
    def create_user(self, data):
        pass

    def get_all_users(self):
        pass

    def update_user(self, user_id, data):
        pass

    def validate_email(self, email):
        pass

    def validate_password(self, password):
        pass

    def delete_user(self, user_id):
        pass
```

**良い例**:
```python
class UserService:
    # CRUD操作をグループ化
    def create_user(self, data):
        self._validate_email(data['email'])
        self._validate_password(data['password'])
        # ...

    def get_all_users(self):
        pass

    def update_user(self, user_id, data):
        pass

    def delete_user(self, user_id):
        pass

    # 検証メソッドをグループ化
    def _validate_email(self, email):
        pass

    def _validate_password(self, password):
        pass
```

### 水平方向のフォーマット

一行は**80〜120文字**以内に収めます。

**悪い例**:
```javascript
// 長すぎる一行
const result = users.filter(user => user.age > 18).map(user => ({ id: user.id, name: user.firstName + ' ' + user.lastName, email: user.email })).sort((a, b) => a.name.localeCompare(b.name));
```

**良い例**:
```javascript
// 適切に改行
const result = users
    .filter(user => user.age > 18)
    .map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
```

### インデントとスペース

一貫したインデント（通常は2または4スペース）を使用します。

```typescript
// 良い例：一貫したインデント
class OrderProcessor {
    processOrder(order: Order): void {
        if (this.isValid(order)) {
            this.calculateTotal(order);
            this.applyDiscount(order);
            this.submitOrder(order);
        }
    }

    private isValid(order: Order): boolean {
        return order.items.length > 0;
    }
}
```

---

## 5. エラーハンドリング（Error Handling）

### 例外を使用する

エラーコードではなく例外を使用します。

**悪い例（エラーコード）**:
```python
def save_user(user):
    if not user.email:
        return -1  # エラーコード
    if not user.password:
        return -2  # エラーコード
    # ...
    return 0  # 成功

# 使用側
result = save_user(user)
if result == -1:
    print("Email is required")
elif result == -2:
    print("Password is required")
```

**良い例（例外）**:
```python
def save_user(user):
    if not user.email:
        raise ValueError("Email is required")
    if not user.password:
        raise ValueError("Password is required")
    # ...

# 使用側
try:
    save_user(user)
except ValueError as e:
    print(f"Validation error: {e}")
```

### エラーコンテキストを提供する

例外には十分な情報を含めます。

**悪い例**:
```java
if (balance < amount) {
    throw new Exception("Insufficient funds");
}
```

**良い例**:
```java
if (balance < amount) {
    throw new InsufficientFundsException(
        String.format(
            "Cannot withdraw %s from account %s. Current balance: %s",
            amount, accountId, balance
        )
    );
}
```

### Try-Catchブロックを分離する

エラーハンドリングはビジネスロジックから分離します。

**悪い例**:
```typescript
function processUserData(userId: string) {
    try {
        const user = fetchUser(userId);
        const profile = fetchProfile(userId);
        const orders = fetchOrders(userId);

        // ビジネスロジック
        const summary = {
            user: user,
            profile: profile,
            totalOrders: orders.length
        };

        return summary;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
```

**良い例**:
```typescript
function processUserData(userId: string) {
    try {
        return buildUserSummary(userId);
    } catch (error) {
        handleUserDataError(error, userId);
        return null;
    }
}

function buildUserSummary(userId: string): UserSummary {
    const user = fetchUser(userId);
    const profile = fetchProfile(userId);
    const orders = fetchOrders(userId);

    return {
        user: user,
        profile: profile,
        totalOrders: orders.length
    };
}

function handleUserDataError(error: Error, userId: string): void {
    logger.error(`Failed to process user data for ${userId}:`, error);
}
```

---

## 6. クラス設計（Classes）

### 単一責任の原則（Single Responsibility Principle）

クラスは**1つの責任**だけを持つべきです。

**悪い例（複数の責任）**:
```python
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    # ユーザー管理の責任
    def save_to_database(self):
        # データベース保存ロジック
        pass

    # メール送信の責任
    def send_email(self, subject, body):
        # メール送信ロジック
        pass

    # レポート生成の責任
    def generate_report(self):
        # レポート生成ロジック
        pass
```

**良い例（単一責任）**:
```python
# ユーザーデータのみを表現
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

# データベース操作の責任
class UserRepository:
    def save(self, user: User):
        pass

    def find_by_email(self, email: str) -> User:
        pass

# メール送信の責任
class EmailService:
    def send(self, to: str, subject: str, body: str):
        pass

# レポート生成の責任
class UserReportGenerator:
    def generate(self, user: User) -> Report:
        pass
```

### カプセル化

内部の実装詳細を隠蔽します。

**悪い例**:
```java
public class BankAccount {
    public double balance;  // 直接アクセス可能
}

// 使用側
account.balance -= 1000;  // 検証なし
account.balance = -500;   // 負の残高も可能
```

**良い例**:
```java
public class BankAccount {
    private double balance;  // カプセル化

    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (balance < amount) {
            throw new InsufficientFundsException();
        }
        balance -= amount;
    }

    public double getBalance() {
        return balance;
    }
}
```

---

## 7. SOLID原則

### S - 単一責任の原則（Single Responsibility Principle）

1つのクラスは1つの責任のみを持つべきです。

### O - 開放閉鎖の原則（Open/Closed Principle）

クラスは拡張には開いていて、修正には閉じているべきです。

**悪い例**:
```typescript
class PaymentProcessor {
    processPayment(type: string, amount: number) {
        if (type === 'credit_card') {
            // クレジットカード処理
        } else if (type === 'paypal') {
            // PayPal処理
        } else if (type === 'bitcoin') {
            // Bitcoin処理（新しい支払い方法を追加するたびに修正が必要）
        }
    }
}
```

**良い例**:
```typescript
interface PaymentMethod {
    process(amount: number): void;
}

class CreditCardPayment implements PaymentMethod {
    process(amount: number): void {
        // クレジットカード処理
    }
}

class PayPalPayment implements PaymentMethod {
    process(amount: number): void {
        // PayPal処理
    }
}

class BitcoinPayment implements PaymentMethod {
    process(amount: number): void {
        // Bitcoin処理
    }
}

class PaymentProcessor {
    processPayment(paymentMethod: PaymentMethod, amount: number) {
        paymentMethod.process(amount);
    }
}
```

### L - リスコフの置換原則（Liskov Substitution Principle）

派生クラスは基底クラスと置き換え可能であるべきです。

### I - インターフェース分離の原則（Interface Segregation Principle）

クライアントは使用しないインターフェースに依存すべきではありません。

**悪い例**:
```java
interface Worker {
    void work();
    void eat();
    void sleep();
}

// ロボットはeatやsleepを必要としない
class Robot implements Worker {
    public void work() { /* ... */ }
    public void eat() { /* 使わない */ }
    public void sleep() { /* 使わない */ }
}
```

**良い例**:
```java
interface Workable {
    void work();
}

interface Feedable {
    void eat();
}

interface Restable {
    void sleep();
}

class Human implements Workable, Feedable, Restable {
    public void work() { /* ... */ }
    public void eat() { /* ... */ }
    public void sleep() { /* ... */ }
}

class Robot implements Workable {
    public void work() { /* ... */ }
}
```

### D - 依存性逆転の原則（Dependency Inversion Principle）

高レベルのモジュールは低レベルのモジュールに依存すべきではありません。両方とも抽象に依存すべきです。

**悪い例**:
```python
class MySQLDatabase:
    def save(self, data):
        # MySQL固有の実装
        pass

class UserService:
    def __init__(self):
        self.db = MySQLDatabase()  # 具象クラスに依存

    def create_user(self, user):
        self.db.save(user)
```

**良い例**:
```python
from abc import ABC, abstractmethod

class Database(ABC):
    @abstractmethod
    def save(self, data):
        pass

class MySQLDatabase(Database):
    def save(self, data):
        # MySQL実装
        pass

class PostgreSQLDatabase(Database):
    def save(self, data):
        # PostgreSQL実装
        pass

class UserService:
    def __init__(self, database: Database):  # 抽象に依存
        self.db = database

    def create_user(self, user):
        self.db.save(user)

# 使用
db = MySQLDatabase()  # または PostgreSQLDatabase()
user_service = UserService(db)
```

---

## 8. テスト（Testing）

### クリーンなテストコード

テストコードも本番コードと同じくらい重要です。

**良いテストの特徴（F.I.R.S.T原則）**:

- **Fast（高速）**: テストは素早く実行されるべき
- **Independent（独立）**: テストは互いに依存しない
- **Repeatable（再現可能）**: どの環境でも同じ結果
- **Self-Validating（自己検証）**: 成功か失敗かが明確
- **Timely（適時）**: 本番コードの前または直後に書く

**良いテストの例**:
```typescript
describe('UserService', () => {
    describe('createUser', () => {
        it('should create user with valid data', () => {
            // Arrange（準備）
            const userData = {
                email: 'test@example.com',
                password: 'SecurePass123'
            };
            const userService = new UserService();

            // Act（実行）
            const user = userService.createUser(userData);

            // Assert（検証）
            expect(user.email).toBe('test@example.com');
            expect(user.id).toBeDefined();
        });

        it('should throw error when email is invalid', () => {
            // Arrange
            const userData = {
                email: 'invalid-email',
                password: 'SecurePass123'
            };
            const userService = new UserService();

            // Act & Assert
            expect(() => userService.createUser(userData))
                .toThrow('Invalid email format');
        });
    });
});
```

### テストのベストプラクティス

#### 1. 1つのテストで1つのことをテスト

```python
# 悪い例：複数のことをテスト
def test_user_operations():
    user = create_user("test@example.com")
    assert user.email == "test@example.com"

    updated = update_user(user.id, "new@example.com")
    assert updated.email == "new@example.com"

    deleted = delete_user(user.id)
    assert deleted is True

# 良い例：分離
def test_create_user_with_valid_email():
    user = create_user("test@example.com")
    assert user.email == "test@example.com"

def test_update_user_email():
    user = create_user("test@example.com")
    updated = update_user(user.id, "new@example.com")
    assert updated.email == "new@example.com"

def test_delete_user():
    user = create_user("test@example.com")
    result = delete_user(user.id)
    assert result is True
```

#### 2. わかりやすいテスト名

```go
// 良い例：テスト名で意図が明確
func TestUserService_CreateUser_WithValidEmail_ShouldSucceed(t *testing.T) {
    // ...
}

func TestUserService_CreateUser_WithInvalidEmail_ShouldReturnError(t *testing.T) {
    // ...
}

func TestUserService_CreateUser_WithDuplicateEmail_ShouldReturnError(t *testing.T) {
    // ...
}
```

---

## 9. リファクタリング（Refactoring）

### リファクタリングのタイミング

#### 1. コードの重複を見つけたとき（DRY原則）

**悪い例（重複）**:
```javascript
function calculateAreaOfRectangle(width, height) {
    return width * height;
}

function calculateAreaOfSquare(side) {
    return side * side;
}

function calculateAreaOfTriangle(base, height) {
    return 0.5 * base * height;
}
```

**良い例（抽象化）**:
```javascript
class Shape {
    calculateArea() {
        throw new Error('Must implement calculateArea');
    }
}

class Rectangle extends Shape {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }

    calculateArea() {
        return this.width * this.height;
    }
}

class Square extends Rectangle {
    constructor(side) {
        super(side, side);
    }
}

class Triangle extends Shape {
    constructor(base, height) {
        super();
        this.base = base;
        this.height = height;
    }

    calculateArea() {
        return 0.5 * this.base * this.height;
    }
}
```

#### 2. 関数が長すぎるとき

20行を超える関数は分割を検討します。

#### 3. クラスが大きすぎるとき

クラスが複数の責任を持っている場合は分割します。

### リファクタリングの手法

#### 1. Extract Method（メソッドの抽出）

```python
# Before
def print_owing(invoice):
    print_banner()

    # 詳細を印刷
    print(f"Name: {invoice.customer}")
    print(f"Amount: {invoice.amount}")

# After
def print_owing(invoice):
    print_banner()
    print_details(invoice)

def print_details(invoice):
    print(f"Name: {invoice.customer}")
    print(f"Amount: {invoice.amount}")
```

#### 2. Replace Temp with Query（一時変数をクエリに置換）

```java
// Before
double basePrice = quantity * itemPrice;
if (basePrice > 1000) {
    return basePrice * 0.95;
} else {
    return basePrice * 0.98;
}

// After
if (basePrice() > 1000) {
    return basePrice() * 0.95;
} else {
    return basePrice() * 0.98;
}

private double basePrice() {
    return quantity * itemPrice;
}
```

#### 3. Replace Conditional with Polymorphism（条件分岐をポリモーフィズムに置換）

```typescript
// Before
class Bird {
    getSpeed(): number {
        switch (this.type) {
            case 'European':
                return this.getBaseSpeed();
            case 'African':
                return this.getBaseSpeed() - this.getLoadFactor();
            case 'Norwegian':
                return this.isNailed ? 0 : this.getBaseSpeed();
        }
    }
}

// After
abstract class Bird {
    abstract getSpeed(): number;
}

class European extends Bird {
    getSpeed(): number {
        return this.getBaseSpeed();
    }
}

class African extends Bird {
    getSpeed(): number {
        return this.getBaseSpeed() - this.getLoadFactor();
    }
}

class Norwegian extends Bird {
    getSpeed(): number {
        return this.isNailed ? 0 : this.getBaseSpeed();
    }
}
```

---

## 10. 実践的なチェックリスト

コードレビューやリファクタリング時に以下をチェックしましょう。

### 命名
- [ ] 変数名・関数名は意図を明確に表現しているか
- [ ] 誤解を招く名前はないか
- [ ] マジックナンバーは定数化されているか
- [ ] 略語は適切に使用されているか

### 関数
- [ ] 関数は1つのことだけを行っているか
- [ ] 関数は20行以下か
- [ ] 引数は3個以下か
- [ ] 副作用はないか
- [ ] コマンドとクエリは分離されているか

### コメント
- [ ] コードで表現できることをコメントしていないか
- [ ] コメントアウトされたコードは削除されているか
- [ ] 必要なコメント（意図、警告、TODO）は適切か

### クラス
- [ ] 単一責任の原則は守られているか
- [ ] カプセル化は適切か
- [ ] SOLID原則に従っているか

### エラーハンドリング
- [ ] エラーコードではなく例外を使用しているか
- [ ] 例外に十分な情報が含まれているか
- [ ] エラーハンドリングとビジネスロジックは分離されているか

### テスト
- [ ] テストは十分にカバーされているか
- [ ] 1つのテストで1つのことをテストしているか
- [ ] テスト名は明確か
- [ ] テストは高速に実行されるか

### 全般
- [ ] コードの重複（DRY原則違反）はないか
- [ ] フォーマットは一貫しているか
- [ ] ビルド時に警告は出ないか

---

## まとめ

Clean Codeは一朝一夕には身につきませんが、日々意識して実践することで確実にスキルアップできます。

### Clean Codeの核心的な原則

**1. 可読性が最優先**:
- コードは書くよりも読まれる回数の方が多い
- 自分だけでなくチーム全体のために書く

**2. シンプルに保つ**:
- 複雑さは敵
- 最もシンプルな解決策を選ぶ

**3. 単一責任の原則**:
- 関数、クラスは1つのことだけを行う
- 変更の理由は1つだけであるべき

**4. 継続的な改善**:
- 完璧を求めず、継続的にリファクタリング
- ボーイスカウトルール：「来た時よりも美しく」

### 今日から始められること

1. **変数名を丁寧に付ける**: `x`、`temp`、`data`のような曖昧な名前を避ける
2. **関数を小さく保つ**: 20行を超えたら分割を検討
3. **コメントを見直す**: コードで表現できることはコメントしない
4. **テストを書く**: 新しいコードには必ずテストを追加
5. **コードレビューで学ぶ**: 他の人のコードから学び、自分のコードにフィードバックを求める

### 推奨書籍

- **Clean Code** by Robert C. Martin - Clean Codeのバイブル
- **Refactoring** by Martin Fowler - リファクタリングの技法
- **The Pragmatic Programmer** by Andrew Hunt & David Thomas - 実践的なプログラミング哲学
- **Design Patterns** by Gang of Four - デザインパターンの基礎

Clean Codeは技術スキルだけでなく、プロフェッショナルとしての姿勢でもあります。読みやすく保守しやすいコードを書くことは、自分自身と将来のチームメンバーへの思いやりです。

今日から、Clean Codeの原則を1つずつ実践していきましょう。小さな改善の積み重ねが、やがて大きな違いを生み出します。

### 参考リンク

- **Clean Code by Robert C. Martin**: https://www.oreilly.com/library/view/clean-code-a/9780136083238/
- **Refactoring Guru**: https://refactoring.guru/
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID
- **Code Smells**: https://refactoring.guru/refactoring/smells
