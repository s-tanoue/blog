---
slug: python-decorator-guide
title: Pythonデコレーター完全ガイド：関数をパワーアップする魔法の構文
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

Pythonの**デコレーター（Decorator）**は、関数やクラスに機能を追加する強力な仕組みです。`@`記号を使った独特の構文で、**コードの重複を減らし、関数に横断的な機能を追加**できます。この記事では、デコレーターの基本から実践的な活用方法まで、初心者にもわかりやすく徹底解説します。

<!--truncate-->

## デコレーターとは何か

**デコレーター（Decorator）**は、既存の関数やクラスを変更せずに、その振る舞いを拡張する仕組みです。直訳すると「装飾する人」という意味で、関数を「装飾」して新しい機能を追加します。

### デコレーターの基本構文

```python
# デコレーターの基本的な使い方
@decorator_function
def my_function():
    pass
```

この`@decorator_function`という記法は、実は以下のコードの糖衣構文（シンタックスシュガー）です：

```python
def my_function():
    pass

my_function = decorator_function(my_function)
```

### 簡単な例

```python
def greeting_decorator(func):
    """関数の実行前後に挨拶を追加するデコレーター"""
    def wrapper():
        print("こんにちは！")
        func()  # 元の関数を実行
        print("さようなら！")
    return wrapper

@greeting_decorator
def say_hello():
    print("Hello, World!")

# 実行
say_hello()
```

**出力結果**:
```
こんにちは！
Hello, World!
さようなら！
```

---

## なぜデコレーターが必要なのか

デコレーターは、以下のような問題を解決します：

### 1. コードの重複を防ぐ

多くの関数で同じ処理（ログ記録、認証チェックなど）が必要な場合、各関数にコードを書くのは非効率です。

```python
# ❌ 悪い例：コードの重複
def function_a():
    print("開始")
    # メインの処理
    print("終了")

def function_b():
    print("開始")
    # メインの処理
    print("終了")

# ✅ 良い例：デコレーターで共通処理を抽出
def log_decorator(func):
    def wrapper():
        print("開始")
        func()
        print("終了")
    return wrapper

@log_decorator
def function_a():
    # メインの処理のみ
    pass

@log_decorator
def function_b():
    # メインの処理のみ
    pass
```

### 2. 関心の分離（Separation of Concerns）

ビジネスロジックと横断的関心事（ログ、認証、キャッシュなど）を分離できます。

```python
@authenticate  # 認証チェック
@log_execution  # ログ記録
@cache_result  # キャッシュ
def process_payment(amount):
    # ビジネスロジックに集中できる
    return perform_payment(amount)
```

### 3. 既存コードを変更せずに拡張

既存の関数を変更せず、外部から機能を追加できます（開放/閉鎖原則：OCP）。

---

## デコレーターの仕組み

デコレーターは**高階関数**（関数を引数に取り、関数を返す関数）として実装されます。

### 基本的な仕組み

```python
def simple_decorator(func):
    """最もシンプルなデコレーター"""
    def wrapper():
        print("関数実行前")
        result = func()  # 元の関数を実行
        print("関数実行後")
        return result
    return wrapper

@simple_decorator
def greet():
    print("Hello!")
    return "挨拶完了"

# 実行
result = greet()
print(f"戻り値: {result}")
```

**出力結果**:
```
関数実行前
Hello!
関数実行後
戻り値: 挨拶完了
```

### ステップバイステップの流れ

1. **`@simple_decorator`が適用される**: `greet = simple_decorator(greet)`と同じ
2. **`greet()`を呼び出す**: 実際には`wrapper()`が呼ばれる
3. **`wrapper()`内で元の`greet()`が実行される**
4. **`wrapper()`から結果が返される**

---

## 引数を持つ関数のデコレーター

実際の関数は引数を持つことが多いため、可変長引数を使います。

### `*args`と`**kwargs`を使う

```python
def log_decorator(func):
    """任意の引数を持つ関数をデコレート"""
    def wrapper(*args, **kwargs):
        print(f"関数 {func.__name__} を呼び出し")
        print(f"引数: {args}, {kwargs}")
        result = func(*args, **kwargs)
        print(f"戻り値: {result}")
        return result
    return wrapper

@log_decorator
def add(a, b):
    return a + b

@log_decorator
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# 実行
print(add(3, 5))
print()
print(greet("Alice", greeting="Hi"))
```

**出力結果**:
```
関数 add を呼び出し
引数: (3, 5), {}
戻り値: 8
8

関数 greet を呼び出し
引数: ('Alice',), {'greeting': 'Hi'}
戻り値: Hi, Alice!
Hi, Alice!
```

---

## functools.wrapsの重要性

デコレーターを作る際、`functools.wraps`を使わないと、関数のメタデータ（名前やドキュメントなど）が失われます。

### 問題例

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        """ラッパー関数"""
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def calculate_sum(a, b):
    """2つの数の合計を計算"""
    return a + b

# メタデータが失われる
print(calculate_sum.__name__)  # 出力: wrapper
print(calculate_sum.__doc__)   # 出力: ラッパー関数
```

### 解決策：functools.wrapsを使う

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)  # これを追加！
    def wrapper(*args, **kwargs):
        """ラッパー関数"""
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def calculate_sum(a, b):
    """2つの数の合計を計算"""
    return a + b

# メタデータが保持される
print(calculate_sum.__name__)  # 出力: calculate_sum
print(calculate_sum.__doc__)   # 出力: 2つの数の合計を計算
```

**ベストプラクティス**: デコレーターを作る際は**必ず`@wraps(func)`を使いましょう**。

---

## 実践的なデコレーターの例

### 1. 実行時間計測デコレーター

```python
import time
from functools import wraps

def measure_time(func):
    """関数の実行時間を計測するデコレーター"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"{func.__name__} の実行時間: {execution_time:.4f}秒")
        return result
    return wrapper

@measure_time
def slow_function():
    """時間のかかる処理"""
    time.sleep(2)
    return "完了"

# 実行
result = slow_function()
# 出力: slow_function の実行時間: 2.0021秒
```

### 2. リトライデコレーター

```python
import time
from functools import wraps

def retry(max_attempts=3, delay=1):
    """失敗時にリトライするデコレーター"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    if attempts >= max_attempts:
                        print(f"最大リトライ回数 ({max_attempts}) に到達")
                        raise
                    print(f"エラー発生: {e}. {delay}秒後にリトライ... ({attempts}/{max_attempts})")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2)
def unstable_api_call():
    """不安定なAPI呼び出しをシミュレート"""
    import random
    if random.random() < 0.7:  # 70%の確率で失敗
        raise ConnectionError("接続エラー")
    return "成功"

# 実行
try:
    result = unstable_api_call()
    print(f"結果: {result}")
except Exception as e:
    print(f"最終的に失敗: {e}")
```

### 3. キャッシュデコレーター

```python
from functools import wraps

def memoize(func):
    """関数の結果をキャッシュするデコレーター"""
    cache = {}

    @wraps(func)
    def wrapper(*args):
        if args in cache:
            print(f"キャッシュから取得: {args}")
            return cache[args]

        print(f"計算実行: {args}")
        result = func(*args)
        cache[args] = result
        return result

    return wrapper

@memoize
def fibonacci(n):
    """フィボナッチ数を計算"""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 実行
print(fibonacci(5))
print(fibonacci(5))  # 2回目はキャッシュから取得
```

**出力結果**:
```
計算実行: (5,)
計算実行: (4,)
計算実行: (3,)
計算実行: (2,)
計算実行: (1,)
計算実行: (0,)
キャッシュから取得: (1,)
キャッシュから取得: (2,)
キャッシュから取得: (3,)
キャッシュから取得: (4,)
5
キャッシュから取得: (5,)
5
```

### 4. 認証デコレーター

```python
from functools import wraps

# グローバル変数（実際にはセッションやDBから取得）
current_user = None

def require_auth(func):
    """認証が必要な関数に適用するデコレーター"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if current_user is None:
            raise PermissionError("認証が必要です")
        print(f"ユーザー {current_user} がアクセス")
        return func(*args, **kwargs)
    return wrapper

@require_auth
def view_profile():
    return "プロフィールページ"

@require_auth
def edit_settings():
    return "設定を編集"

# 実行
try:
    view_profile()  # エラー
except PermissionError as e:
    print(e)

current_user = "Alice"
print(view_profile())  # 成功
```

### 5. ログ記録デコレーター

```python
import logging
from functools import wraps

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def log_execution(func):
    """関数の実行をログに記録するデコレーター"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.info(f"関数 {func.__name__} 開始")
        logger.debug(f"引数: {args}, {kwargs}")

        try:
            result = func(*args, **kwargs)
            logger.info(f"関数 {func.__name__} 正常終了")
            return result
        except Exception as e:
            logger.error(f"関数 {func.__name__} でエラー発生: {e}")
            raise

    return wrapper

@log_execution
def divide(a, b):
    return a / b

# 実行
print(divide(10, 2))
print(divide(10, 0))  # エラーをログに記録
```

---

## 引数を持つデコレーター

デコレーター自体に引数を渡したい場合、**3層の関数**を作ります。

### 基本パターン

```python
from functools import wraps

def repeat(times):
    """関数を指定回数繰り返すデコレーター"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(times):
                result = func(*args, **kwargs)
                results.append(result)
            return results
        return wrapper
    return decorator

@repeat(times=3)
def greet(name):
    print(f"Hello, {name}!")
    return f"Greeted {name}"

# 実行
results = greet("Alice")
print(f"戻り値: {results}")
```

**出力結果**:
```
Hello, Alice!
Hello, Alice!
Hello, Alice!
戻り値: ['Greeted Alice', 'Greeted Alice', 'Greeted Alice']
```

### 引数のデフォルト値を持つデコレーター

```python
from functools import wraps

def validate_range(min_value=0, max_value=100):
    """戻り値が範囲内かチェックするデコレーター"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            if not (min_value <= result <= max_value):
                raise ValueError(f"戻り値 {result} が範囲外 [{min_value}, {max_value}]")
            return result
        return wrapper
    return decorator

@validate_range(min_value=0, max_value=100)
def calculate_percentage(score, total):
    return (score / total) * 100

# 実行
print(calculate_percentage(80, 100))  # OK: 80.0
print(calculate_percentage(120, 100))  # エラー: ValueError
```

---

## クラスベースのデコレーター

デコレーターは関数だけでなく、クラスとしても実装できます。

### `__call__`メソッドを使う

```python
from functools import wraps

class CountCalls:
    """関数の呼び出し回数をカウントするデコレーター（クラス版）"""

    def __init__(self, func):
        self.func = func
        self.call_count = 0
        wraps(func)(self)  # メタデータを保持

    def __call__(self, *args, **kwargs):
        self.call_count += 1
        print(f"{self.func.__name__} が {self.call_count} 回目の呼び出し")
        return self.func(*args, **kwargs)

@CountCalls
def say_hello():
    print("Hello!")

# 実行
say_hello()
say_hello()
say_hello()
print(f"合計呼び出し回数: {say_hello.call_count}")
```

**出力結果**:
```
say_hello が 1 回目の呼び出し
Hello!
say_hello が 2 回目の呼び出し
Hello!
say_hello が 3 回目の呼び出し
Hello!
合計呼び出し回数: 3
```

### 引数を持つクラスベースデコレーター

```python
from functools import wraps

class RateLimiter:
    """レート制限を実装するデコレーター"""

    def __init__(self, max_calls, period):
        self.max_calls = max_calls  # 最大呼び出し回数
        self.period = period  # 期間（秒）
        self.calls = []

    def __call__(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            import time
            now = time.time()

            # 古い呼び出しを削除
            self.calls = [call_time for call_time in self.calls if now - call_time < self.period]

            if len(self.calls) >= self.max_calls:
                raise Exception(f"レート制限: {self.period}秒間に最大{self.max_calls}回まで")

            self.calls.append(now)
            return func(*args, **kwargs)

        return wrapper

@RateLimiter(max_calls=3, period=10)
def api_call():
    print("APIコール成功")

# 実行
for i in range(5):
    try:
        api_call()
    except Exception as e:
        print(e)
```

---

## 複数のデコレーターを組み合わせる

複数のデコレーターを重ねて適用できます。

### 適用順序

```python
from functools import wraps

def decorator_a(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("Decorator A - 前")
        result = func(*args, **kwargs)
        print("Decorator A - 後")
        return result
    return wrapper

def decorator_b(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("Decorator B - 前")
        result = func(*args, **kwargs)
        print("Decorator B - 後")
        return result
    return wrapper

@decorator_a
@decorator_b
def my_function():
    print("関数本体")

# 実行
my_function()
```

**出力結果**:
```
Decorator A - 前
Decorator B - 前
関数本体
Decorator B - 後
Decorator A - 後
```

**ポイント**: デコレーターは**下から上に**適用されます。
- `@decorator_a` → `@decorator_b` → `my_function`
- 実行時は `decorator_a` → `decorator_b` → `my_function` → `decorator_b` → `decorator_a` の順

### 実践例：認証＋ログ＋キャッシュ

```python
@require_auth      # 3. 認証チェック（最初に実行）
@log_execution     # 2. ログ記録
@memoize           # 1. キャッシュ（最後に適用）
def fetch_user_data(user_id):
    # 重い処理
    return f"User {user_id} のデータ"
```

---

## クラスデコレーター

関数だけでなく、クラス全体をデコレートすることもできます。

### クラスにメソッドを追加

```python
def add_str_method(cls):
    """クラスに__str__メソッドを追加するデコレーター"""
    def __str__(self):
        attrs = ", ".join(f"{k}={v}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"

    cls.__str__ = __str__
    return cls

@add_str_method
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

# 実行
user = User("Alice", 30)
print(user)  # 出力: User(name=Alice, age=30)
```

### シングルトンパターン

```python
def singleton(cls):
    """クラスをシングルトンにするデコレーター"""
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance

@singleton
class Database:
    def __init__(self):
        print("データベース接続を初期化")
        self.connection = "DB Connection"

# 実行
db1 = Database()  # 出力: データベース接続を初期化
db2 = Database()  # 何も出力されない
print(db1 is db2)  # True（同じインスタンス）
```

---

## 標準ライブラリのデコレーター

Pythonの標準ライブラリには便利なデコレーターが用意されています。

### 1. `@property`：ゲッター・セッター

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        """半径のゲッター"""
        return self._radius

    @radius.setter
    def radius(self, value):
        """半径のセッター"""
        if value < 0:
            raise ValueError("半径は0以上である必要があります")
        self._radius = value

    @property
    def area(self):
        """面積（読み取り専用）"""
        return 3.14159 * self._radius ** 2

# 実行
circle = Circle(5)
print(circle.radius)  # 5
print(circle.area)    # 78.53975

circle.radius = 10    # セッターを使用
print(circle.area)    # 314.159
```

### 2. `@staticmethod`：静的メソッド

```python
class MathUtils:
    @staticmethod
    def add(a, b):
        """インスタンスを必要としない静的メソッド"""
        return a + b

    @staticmethod
    def multiply(a, b):
        return a * b

# インスタンス化せずに呼び出し
print(MathUtils.add(3, 5))       # 8
print(MathUtils.multiply(4, 6))  # 24
```

### 3. `@classmethod`：クラスメソッド

```python
class Person:
    population = 0

    def __init__(self, name):
        self.name = name
        Person.population += 1

    @classmethod
    def get_population(cls):
        """クラスメソッド：クラス変数にアクセス"""
        return cls.population

    @classmethod
    def from_birth_year(cls, name, birth_year):
        """ファクトリーメソッド"""
        age = 2025 - birth_year
        instance = cls(name)
        instance.age = age
        return instance

# 実行
person1 = Person("Alice")
person2 = Person("Bob")
print(Person.get_population())  # 2

person3 = Person.from_birth_year("Charlie", 1990)
print(person3.age)  # 35
```

### 4. `@functools.lru_cache`：LRUキャッシュ

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    """フィボナッチ数を計算（キャッシュ付き）"""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 実行（高速！）
print(fibonacci(100))  # 瞬時に計算

# キャッシュ情報を確認
print(fibonacci.cache_info())
# 出力: CacheInfo(hits=98, misses=101, maxsize=128, currsize=101)
```

### 5. `@dataclasses.dataclass`：データクラス

```python
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    quantity: int = 0

    def total_cost(self):
        return self.price * self.quantity

# 実行
product = Product("Laptop", 1200.0, 3)
print(product)  # Product(name='Laptop', price=1200.0, quantity=3)
print(product.total_cost())  # 3600.0
```

---

## よくあるユースケース

### 1. Webフレームワーク（Flask）

```python
from flask import Flask

app = Flask(__name__)

@app.route('/hello')
def hello():
    return "Hello, World!"

@app.route('/user/<username>')
def show_user_profile(username):
    return f"User: {username}"
```

### 2. テストフレームワーク（pytest）

```python
import pytest

@pytest.fixture
def sample_data():
    return [1, 2, 3, 4, 5]

@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 3),
    (3, 4),
])
def test_increment(input, expected):
    assert input + 1 == expected
```

### 3. 非同期処理（asyncio）

```python
import asyncio

@asyncio.coroutine
async def fetch_data():
    await asyncio.sleep(1)
    return "データ取得完了"

# Python 3.5以降の構文
async def main():
    result = await fetch_data()
    print(result)

asyncio.run(main())
```

### 4. 権限チェック（Django）

```python
from django.contrib.auth.decorators import login_required, permission_required

@login_required
def profile_view(request):
    return render(request, 'profile.html')

@permission_required('app.can_edit')
def edit_view(request):
    return render(request, 'edit.html')
```

---

## デコレーターのベストプラクティス

### 1. 常に`@wraps`を使う

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)  # 必須！
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

### 2. 汎用的なデコレーターを作る

```python
# ❌ 悪い例：特定の関数専用
def log_add(func):
    def wrapper(a, b):  # aとbに限定
        print(f"Adding {a} + {b}")
        return func(a, b)
    return wrapper

# ✅ 良い例：任意の関数に対応
def log_execution(func):
    @wraps(func)
    def wrapper(*args, **kwargs):  # 任意の引数に対応
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper
```

### 3. デコレーターの副作用を最小限に

```python
# ❌ 悪い例：グローバル変数を変更
global_counter = 0

def bad_decorator(func):
    def wrapper(*args, **kwargs):
        global global_counter
        global_counter += 1  # グローバル変数を変更（危険）
        return func(*args, **kwargs)
    return wrapper

# ✅ 良い例：デコレーター内に状態を保持
def good_decorator(func):
    call_count = 0  # クロージャ変数

    @wraps(func)
    def wrapper(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        return func(*args, **kwargs)

    wrapper.call_count = lambda: call_count  # アクセス用メソッド
    return wrapper
```

### 4. ドキュメントを書く

```python
def retry(max_attempts=3, delay=1):
    """
    失敗時に自動リトライするデコレーター。

    Args:
        max_attempts (int): 最大リトライ回数（デフォルト: 3）
        delay (int): リトライ間隔（秒）（デフォルト: 1）

    Returns:
        デコレートされた関数

    Example:
        @retry(max_attempts=5, delay=2)
        def unstable_function():
            # 不安定な処理
            pass
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 実装
            pass
        return wrapper
    return decorator
```

### 5. デコレーターをテストする

```python
def test_measure_time_decorator():
    @measure_time
    def sample_function():
        import time
        time.sleep(0.1)
        return "完了"

    result = sample_function()
    assert result == "完了"
    # 実行時間が記録されることを確認
```

---

## よくある間違いと解決策

### 1. `@wraps`を忘れる

```python
# ❌ 間違い
def my_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# ✅ 正しい
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

### 2. 引数を持つデコレーターの層を間違える

```python
# ❌ 間違い（2層しかない）
def repeat(times):
    def wrapper(*args, **kwargs):
        # これだと動かない
        pass
    return wrapper

# ✅ 正しい（3層）
def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator
```

### 3. デコレーター内で元の関数を呼び忘れる

```python
# ❌ 間違い
def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("処理開始")
        # func()を呼ぶのを忘れている！
        print("処理終了")
    return wrapper

# ✅ 正しい
def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("処理開始")
        result = func(*args, **kwargs)  # 元の関数を呼ぶ
        print("処理終了")
        return result
    return wrapper
```

---

## まとめ

Pythonのデコレーターは、**コードの重複を減らし、関数に横断的な機能を追加する**強力な仕組みです。

### 重要ポイント

**デコレーターの基本**:
- `@decorator`構文は糖衣構文
- 関数を引数に取り、関数を返す高階関数
- `*args`と`**kwargs`で任意の引数に対応

**必須のベストプラクティス**:
- **必ず`@functools.wraps`を使う**（メタデータを保持）
- 汎用的なデコレーターを作る
- ドキュメントを書く

**デコレーターの種類**:
1. **関数デコレーター**: 最も一般的
2. **引数付きデコレーター**: 3層の関数
3. **クラスベースデコレーター**: `__call__`を使用
4. **クラスデコレーター**: クラス自体をデコレート

**よくあるユースケース**:
- ログ記録
- 実行時間計測
- キャッシュ
- 認証・認可
- リトライ処理
- レート制限

### 実践のコツ

1. **小さく始める**: まずは`@log_execution`や`@measure_time`のようなシンプルなデコレーターから
2. **標準ライブラリを活用**: `@property`, `@lru_cache`, `@dataclass`など
3. **組み合わせる**: 複数のデコレーターを重ねて適用
4. **テストする**: デコレーターもユニットテストの対象
5. **ドキュメントを読む**: `functools`, `dataclasses`などのモジュールのドキュメントを確認

デコレーターをマスターすると、**より簡潔で保守性の高いPythonコード**が書けるようになります！

### 参考リンク

- **PEP 318 -- Decorators for Functions and Methods**: https://peps.python.org/pep-0318/
- **functools — Higher-order functions**: https://docs.python.org/3/library/functools.html
- **Python Decorator Library**: https://wiki.python.org/moin/PythonDecoratorLibrary
- **Real Python - Primer on Python Decorators**: https://realpython.com/primer-on-python-decorators/
