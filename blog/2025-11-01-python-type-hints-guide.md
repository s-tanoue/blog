---
slug: python-type-hints-guide
title: Python型ヒント（Type Hints）完全ガイド：型安全なコードを書くための実践テクニック
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

Pythonは動的型付け言語ですが、**型ヒント（Type Hints）**を使うことで、コードの可読性を高め、バグを事前に検出できます。型ヒントは、関数の引数や戻り値の型を明示的に指定する機能で、**静的型チェックツール**と組み合わせることで、型安全なコードが書けます。この記事では、Python型ヒントの基本から実践的な活用方法まで、初心者にもわかりやすく徹底解説します。

<!--truncate-->

## 型ヒント（Type Hints）とは何か

**型ヒント（Type Hints）**は、Python 3.5から導入された機能で、変数や関数の引数、戻り値に型情報を付与する仕組みです。これにより、コードの意図を明確にし、開発者間のコミュニケーションを円滑にします。

### 基本的な構文

```python
# 型ヒントなし
def greet(name):
    return f"Hello, {name}!"

# 型ヒントあり
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

- `name: str`：引数`name`は文字列型
- `-> str`：戻り値は文字列型

### 型ヒントの特徴

**1. 実行時には影響しない**
- 型ヒントは**アノテーション**として保存され、実行時にチェックされません
- 型が間違っていてもプログラムは動作します（静的解析ツールで検出可能）

```python
def add(a: int, b: int) -> int:
    return a + b

# 実行時エラーにならない（型ヒント違反だが動く）
result = add("hello", "world")  # 文字列の連結になる
print(result)  # 出力: helloworld
```

**2. 開発体験の向上**
- IDEの補完機能が強化される
- リファクタリングが安全になる
- ドキュメントとしての役割を果たす

**3. 静的型チェック**
- **mypy**、**pyright**、**pyre**などのツールで型チェックが可能

---

## なぜ型ヒントが必要なのか

### 1. バグの早期発見

型ヒントと静的型チェッカーを使うと、実行前にバグを発見できます。

```python
# ❌ 型ヒントなし：実行時エラー
def calculate_total(prices):
    return sum(prices) * 1.1  # 消費税10%

# 実行時にエラー
result = calculate_total("100")  # TypeError: 'str' object is not iterable

# ✅ 型ヒントあり：myPyが事前に検出
def calculate_total(prices: list[float]) -> float:
    return sum(prices) * 1.1

# myPyが「str型はlist[float]と互換性がない」と警告
result = calculate_total("100")  # error: Argument 1 has incompatible type "str"; expected "list[float]"
```

### 2. コードの可読性向上

型ヒントは**生きたドキュメント**として機能します。

```python
# ❌ 型ヒントなし：引数と戻り値が不明
def process_data(data, config):
    # dataは何？configは何？戻り値は？
    pass

# ✅ 型ヒントあり：一目で理解できる
def process_data(
    data: dict[str, list[int]],
    config: dict[str, bool]
) -> tuple[list[int], dict[str, str]]:
    # dataはstr→list[int]の辞書
    # configはstr→boolの辞書
    # 戻り値はlist[int]とdict[str, str]のタプル
    pass
```

### 3. IDEの補完機能強化

型ヒントがあると、IDEが正確な補完候補を提示できます。

```python
def get_user_name(user: dict[str, str]) -> str:
    # user.と入力すると、辞書のメソッドが補完される
    return user.get("name", "Unknown")

class User:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

def greet_user(user: User) -> None:
    # user.と入力すると、nameとageが補完候補に表示される
    print(f"Hello, {user.name}!")
```

### 4. リファクタリングの安全性

型ヒントがあると、関数のシグネチャを変更した際に影響範囲がわかります。

```python
# 関数のシグネチャを変更
def calculate_price(amount: float, tax_rate: float) -> float:
    return amount * (1 + tax_rate)

# すべての呼び出し元で型チェックが実行される
calculate_price(100, 0.1)  # OK
calculate_price(100)  # error: Missing positional argument
```

---

## 基本的な型ヒントの使い方

### 1. プリミティブ型

```python
# 基本的な型
name: str = "Alice"
age: int = 30
height: float = 165.5
is_active: bool = True

# 関数の型ヒント
def add(a: int, b: int) -> int:
    return a + b

def divide(a: float, b: float) -> float:
    return a / b

def is_adult(age: int) -> bool:
    return age >= 18

def greet(name: str) -> None:  # 戻り値がない場合はNone
    print(f"Hello, {name}!")
```

### 2. コレクション型

```python
from typing import List, Dict, Set, Tuple

# Python 3.9以降の推奨記法
numbers: list[int] = [1, 2, 3, 4, 5]
names: set[str] = {"Alice", "Bob", "Charlie"}
scores: dict[str, int] = {"Alice": 90, "Bob": 85}
point: tuple[int, int] = (10, 20)

# Python 3.9以前の記法（typingモジュールを使用）
numbers: List[int] = [1, 2, 3, 4, 5]
scores: Dict[str, int] = {"Alice": 90, "Bob": 85}

# ネストした型
matrix: list[list[int]] = [[1, 2], [3, 4]]
user_data: dict[str, list[str]] = {
    "Alice": ["alice@example.com", "555-1234"],
    "Bob": ["bob@example.com", "555-5678"]
}

# タプル（要素数と各要素の型を指定）
coordinates: tuple[float, float, float] = (1.0, 2.0, 3.0)

# 可変長タプル
numbers: tuple[int, ...] = (1, 2, 3, 4, 5)
```

### 3. Optional型とNone

`Optional[T]`は`T | None`と同じで、値が`None`の可能性があることを示します。

```python
from typing import Optional

# Python 3.10以降の推奨記法
def find_user(user_id: int) -> str | None:
    # ユーザーが見つからない場合はNone
    if user_id == 1:
        return "Alice"
    return None

# Python 3.9以前の記法
def find_user(user_id: int) -> Optional[str]:
    if user_id == 1:
        return "Alice"
    return None

# 変数の型ヒント
name: str | None = None
name = "Alice"  # OK

# デフォルト値がNoneの場合
def greet(name: str | None = None) -> str:
    if name is None:
        return "Hello, Guest!"
    return f"Hello, {name}!"
```

### 4. Union型（複数の型を許可）

```python
from typing import Union

# Python 3.10以降の推奨記法（|を使用）
def process_id(user_id: int | str) -> str:
    return str(user_id)

# Python 3.9以前の記法
def process_id(user_id: Union[int, str]) -> str:
    return str(user_id)

# 複数の型を許可
def format_value(value: int | float | str) -> str:
    return str(value)

# 実行例
print(process_id(123))      # "123"
print(process_id("abc"))    # "abc"
print(format_value(10))     # "10"
print(format_value(3.14))   # "3.14"
print(format_value("test")) # "test"
```

### 5. Any型（任意の型）

`Any`は任意の型を許可します（型チェックを無効化）。

```python
from typing import Any

def log(message: Any) -> None:
    """任意の型のメッセージをログに記録"""
    print(f"LOG: {message}")

log("Hello")          # OK
log(123)              # OK
log([1, 2, 3])        # OK
log({"key": "value"}) # OK

# Anyは型チェックをバイパスする
data: Any = "string"
data = 123  # OK（型変更も許可される）
data.some_method_that_doesnt_exist()  # mypyはチェックしない
```

---

## 高度な型ヒント

### 1. Literal型（リテラル値を型として指定）

特定の値のみを許可します。

```python
from typing import Literal

def set_log_level(level: Literal["DEBUG", "INFO", "WARNING", "ERROR"]) -> None:
    print(f"Log level set to {level}")

set_log_level("INFO")     # OK
set_log_level("CRITICAL") # error: Argument has incompatible type

# 複数のリテラル型
def move(direction: Literal["up", "down", "left", "right"]) -> None:
    print(f"Moving {direction}")

# 数値リテラル
def roll_dice() -> Literal[1, 2, 3, 4, 5, 6]:
    import random
    return random.choice([1, 2, 3, 4, 5, 6])  # type: ignore
```

### 2. TypedDict（型付き辞書）

辞書のキーと値の型を厳密に定義します。

```python
from typing import TypedDict

# TypedDictで型を定義
class User(TypedDict):
    name: str
    age: int
    email: str

# 使用例
def create_user(name: str, age: int, email: str) -> User:
    return {"name": name, "age": age, "email": email}

def print_user(user: User) -> None:
    print(f"{user['name']} ({user['age']}) - {user['email']}")

# 正しい使い方
alice: User = {"name": "Alice", "age": 30, "email": "alice@example.com"}
print_user(alice)

# エラー：キーが不足
bob: User = {"name": "Bob", "age": 25}  # error: Missing key 'email'

# オプショナルなキー
class UserWithOptional(TypedDict, total=False):
    name: str  # 必須
    age: int   # 必須
    phone: str # オプショナル

user: UserWithOptional = {"name": "Charlie", "age": 28}  # OK
```

### 3. Callable型（関数型）

関数を引数や戻り値として扱う場合に使用します。

```python
from typing import Callable

# Callable[[引数の型], 戻り値の型]
def apply_operation(x: int, y: int, operation: Callable[[int, int], int]) -> int:
    return operation(x, y)

def add(a: int, b: int) -> int:
    return a + b

def multiply(a: int, b: int) -> int:
    return a * b

# 使用例
result1 = apply_operation(10, 5, add)       # 15
result2 = apply_operation(10, 5, multiply)  # 50

# コールバック関数
def process_data(data: list[int], callback: Callable[[int], None]) -> None:
    for item in data:
        callback(item)

def print_item(item: int) -> None:
    print(f"Item: {item}")

process_data([1, 2, 3], print_item)

# 引数がない関数
def execute(func: Callable[[], None]) -> None:
    func()

def say_hello() -> None:
    print("Hello!")

execute(say_hello)
```

### 4. Generic型（ジェネリクス）

型パラメータを使って、汎用的な型を定義します。

```python
from typing import TypeVar, Generic

# 型変数を定義
T = TypeVar('T')

class Stack(Generic[T]):
    """ジェネリックなスタッククラス"""

    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def is_empty(self) -> bool:
        return len(self._items) == 0

# 使用例
int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
print(int_stack.pop())  # 2

str_stack: Stack[str] = Stack()
str_stack.push("hello")
str_stack.push("world")
print(str_stack.pop())  # "world"

# ジェネリック関数
def first_item(items: list[T]) -> T | None:
    return items[0] if items else None

numbers = [1, 2, 3]
first_num = first_item(numbers)  # 型はint | None

words = ["hello", "world"]
first_word = first_item(words)   # 型はstr | None
```

### 5. Protocol型（構造的部分型）

ダックタイピングを型安全に実現します。

```python
from typing import Protocol

class Drawable(Protocol):
    """描画可能なオブジェクトのプロトコル"""

    def draw(self) -> None:
        ...

class Circle:
    def draw(self) -> None:
        print("Drawing a circle")

class Square:
    def draw(self) -> None:
        print("Drawing a square")

def render(shape: Drawable) -> None:
    """Drawableプロトコルに準拠する任意のオブジェクトを描画"""
    shape.draw()

# 使用例（CircleとSquareはDrawableを継承していない）
circle = Circle()
square = Square()

render(circle)  # OK: CircleはDrawableプロトコルに準拠
render(square)  # OK: SquareもDrawableプロトコルに準拠

# プロトコルの実践例
class Comparable(Protocol):
    def __lt__(self, other: "Comparable") -> bool:
        ...

def sort_items(items: list[Comparable]) -> list[Comparable]:
    return sorted(items)  # type: ignore
```

### 6. NewType（新しい型を定義）

既存の型から意味的に異なる新しい型を作成します。

```python
from typing import NewType

# 新しい型を定義
UserId = NewType('UserId', int)
ProductId = NewType('ProductId', int)

def get_user(user_id: UserId) -> str:
    return f"User {user_id}"

def get_product(product_id: ProductId) -> str:
    return f"Product {product_id}"

# 使用例
user_id = UserId(123)
product_id = ProductId(456)

print(get_user(user_id))         # OK
print(get_product(product_id))   # OK

# エラー：型が異なる
# print(get_user(product_id))    # error: Argument has incompatible type
# print(get_product(user_id))    # error: Argument has incompatible type

# 実行時は普通のint
print(user_id + 1)  # 124（実行時は動作する）
```

---

## クラスの型ヒント

### 1. クラス変数とインスタンス変数

```python
from typing import ClassVar

class User:
    # クラス変数（全インスタンスで共有）
    user_count: ClassVar[int] = 0

    def __init__(self, name: str, age: int) -> None:
        # インスタンス変数
        self.name: str = name
        self.age: int = age
        User.user_count += 1

    def get_info(self) -> str:
        return f"{self.name} ({self.age})"

# 使用例
alice = User("Alice", 30)
bob = User("Bob", 25)
print(User.user_count)  # 2
```

### 2. プロパティの型ヒント

```python
class Circle:
    def __init__(self, radius: float) -> None:
        self._radius = radius

    @property
    def radius(self) -> float:
        return self._radius

    @radius.setter
    def radius(self, value: float) -> None:
        if value < 0:
            raise ValueError("半径は0以上である必要があります")
        self._radius = value

    @property
    def area(self) -> float:
        return 3.14159 * self._radius ** 2

# 使用例
circle = Circle(5.0)
print(circle.radius)  # 5.0
print(circle.area)    # 78.53975

circle.radius = 10.0
print(circle.area)    # 314.159
```

### 3. 抽象基底クラス（ABC）

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    """図形の抽象基底クラス"""

    @abstractmethod
    def area(self) -> float:
        """面積を計算（サブクラスで実装必須）"""
        pass

    @abstractmethod
    def perimeter(self) -> float:
        """周囲長を計算（サブクラスで実装必須）"""
        pass

class Rectangle(Shape):
    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height

    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

# 使用例
rect = Rectangle(10.0, 5.0)
print(rect.area())       # 50.0
print(rect.perimeter())  # 30.0

# エラー：抽象メソッドを実装していない
# class InvalidShape(Shape):
#     pass
# invalid = InvalidShape()  # error: Cannot instantiate abstract class
```

### 4. データクラス（dataclass）

```python
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    quantity: int = 0  # デフォルト値

    def total_cost(self) -> float:
        return self.price * self.quantity

# 使用例
laptop = Product("Laptop", 1200.0, 3)
print(laptop)  # Product(name='Laptop', price=1200.0, quantity=3)
print(laptop.total_cost())  # 3600.0

# データクラスの高度な使い方
@dataclass(frozen=True)  # イミュータブル
class Point:
    x: float
    y: float

    def distance_from_origin(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5

point = Point(3.0, 4.0)
print(point.distance_from_origin())  # 5.0

# エラー：frozenなので変更できない
# point.x = 10  # error: Cannot assign to field
```

---

## 実践的な型ヒントの活用

### 1. 型エイリアス（Type Alias）

複雑な型を名前で定義すると可読性が向上します。

```python
from typing import TypeAlias

# 型エイリアスを定義
UserId: TypeAlias = int
UserName: TypeAlias = str
UserData: TypeAlias = dict[str, str | int]
Matrix: TypeAlias = list[list[float]]

# 使用例
def get_user_name(user_id: UserId) -> UserName:
    return f"User_{user_id}"

def create_user(user_id: UserId, data: UserData) -> None:
    print(f"Creating user {user_id}: {data}")

# 複雑な型のエイリアス
JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

def parse_json(data: str) -> JSON:
    import json
    return json.loads(data)
```

### 2. オーバーロード（関数の多重定義）

同じ関数名で異なる型シグネチャを定義します。

```python
from typing import overload

@overload
def process(value: int) -> str:
    ...

@overload
def process(value: str) -> int:
    ...

def process(value: int | str) -> int | str:
    """
    intを受け取るとstrを返し、
    strを受け取るとintを返す
    """
    if isinstance(value, int):
        return str(value)
    else:
        return len(value)

# 使用例
result1 = process(123)     # 型はstr
result2 = process("hello") # 型はint

print(result1)  # "123"
print(result2)  # 5
```

### 3. 型ガード（Type Guards）

型の絞り込みを明示的に行います。

```python
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    """すべての要素がstrかチェック"""
    return all(isinstance(item, str) for item in val)

def process_strings(items: list[object]) -> None:
    if is_string_list(items):
        # この時点でitemsの型はlist[str]
        for item in items:
            print(item.upper())  # strメソッドが使える
    else:
        print("Not all items are strings")

# 使用例
process_strings(["hello", "world"])  # OK
process_strings([1, 2, 3])           # "Not all items are strings"
```

### 4. 型の絞り込み（Narrowing）

条件分岐で型を絞り込みます。

```python
def process_value(value: int | str | None) -> str:
    # Noneチェック
    if value is None:
        return "No value"

    # この時点でvalueの型はint | str

    # 型チェック
    if isinstance(value, int):
        # この時点でvalueの型はint
        return f"Number: {value * 2}"

    # この時点でvalueの型はstr
    return f"Text: {value.upper()}"

# 使用例
print(process_value(10))      # "Number: 20"
print(process_value("hello")) # "Text: HELLO"
print(process_value(None))    # "No value"
```

### 5. 型変数の制約（TypeVar Constraints）

型変数に制約を設けます。

```python
from typing import TypeVar

# 特定の型のみ許可
NumberType = TypeVar('NumberType', int, float)

def add(a: NumberType, b: NumberType) -> NumberType:
    return a + b  # type: ignore

# 使用例
print(add(1, 2))       # 3（int）
print(add(1.5, 2.5))   # 4.0（float）
# print(add("a", "b")) # error: 型制約違反

# 上限制約（bound）
from typing import Protocol

class Comparable(Protocol):
    def __lt__(self, other: "Comparable") -> bool:
        ...

T = TypeVar('T', bound=Comparable)

def get_min(a: T, b: T) -> T:
    return a if a < b else b

print(get_min(10, 20))     # 10
print(get_min("a", "z"))   # "a"
```

---

## 静的型チェックツール

### 1. mypy（最も人気）

```bash
# インストール
pip install mypy

# 基本的な使い方
mypy your_file.py

# ディレクトリ全体をチェック
mypy src/

# 厳格モード
mypy --strict your_file.py

# 設定ファイル（mypy.ini）
[mypy]
python_version = 3.10
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
```

**実行例**:

```python
# example.py
def add(a: int, b: int) -> int:
    return a + b

result = add(1, "2")  # 型エラー
```

```bash
$ mypy example.py
example.py:4: error: Argument 2 to "add" has incompatible type "str"; expected "int"
Found 1 error in 1 file (checked 1 source file)
```

### 2. pyright（Microsoft製）

```bash
# インストール
npm install -g pyright

# 使い方
pyright your_file.py

# VS Codeの設定（pylanceがpyrightを使用）
{
  "python.analysis.typeCheckingMode": "strict"
}
```

### 3. pyre（Meta製）

```bash
# インストール
pip install pyre-check

# 初期化
pyre init

# チェック
pyre check
```

### 4. pytype（Google製）

```bash
# インストール
pip install pytype

# 使い方
pytype your_file.py
```

---

## 型ヒントのベストプラクティス

### 1. 公開APIには必ず型ヒントを付ける

```python
# ✅ 良い例：公開関数に型ヒント
def calculate_tax(amount: float, tax_rate: float) -> float:
    """税額を計算する公開API"""
    return _apply_tax(amount, tax_rate)

# プライベート関数は型ヒントなしでもOK（推奨は付ける）
def _apply_tax(amount, tax_rate):
    return amount * (1 + tax_rate)
```

### 2. 複雑な型は型エイリアスを使う

```python
# ❌ 悪い例：複雑な型が直接書かれている
def process_users(
    users: list[dict[str, str | int | list[str]]]
) -> dict[str, list[tuple[str, int]]]:
    pass

# ✅ 良い例：型エイリアスで可読性向上
from typing import TypeAlias

UserData: TypeAlias = dict[str, str | int | list[str]]
ProcessedResult: TypeAlias = dict[str, list[tuple[str, int]]]

def process_users(users: list[UserData]) -> ProcessedResult:
    pass
```

### 3. Anyの使用を最小限にする

```python
from typing import Any

# ❌ 悪い例：Anyを乱用
def process(data: Any) -> Any:
    return data

# ✅ 良い例：具体的な型を指定
def process(data: dict[str, int]) -> list[int]:
    return list(data.values())

# Anyが必要な場合（外部ライブラリとの統合など）
def deserialize(json_str: str) -> Any:
    """JSONをデシリアライズ（型が不明な場合）"""
    import json
    return json.loads(json_str)
```

### 4. TypedDictとDataclassを活用する

```python
from typing import TypedDict
from dataclasses import dataclass

# ❌ 悪い例：辞書の型が不明確
def create_user(name: str, age: int) -> dict:
    return {"name": name, "age": age}

# ✅ 良い例：TypedDict
class User(TypedDict):
    name: str
    age: int

def create_user(name: str, age: int) -> User:
    return {"name": name, "age": age}

# ✅ さらに良い例：Dataclass
@dataclass
class UserData:
    name: str
    age: int

def create_user_data(name: str, age: int) -> UserData:
    return UserData(name, age)
```

### 5. 型ヒントコメント（レガシーコード用）

Python 3.5以前や特定の状況では、コメントで型ヒントを指定できます。

```python
# Python 3.5以前
def add(a, b):
    # type: (int, int) -> int
    return a + b

# 変数の型ヒント（Python 3.5）
numbers = []  # type: list[int]
```

---

## CI/CDへの組み込み

### GitHub Actionsの例

```yaml
name: Type Check

on: [push, pull_request]

jobs:
  mypy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          pip install mypy
      - name: Run mypy
        run: mypy src/
```

### pre-commitフックの例

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
```

---

## よくある質問

### Q1: 型ヒントは必須？

**A: いいえ、オプションです。** しかし、大規模プロジェクトやチーム開発では強く推奨されます。

### Q2: 実行時に型チェックされる？

**A: されません。** 型ヒントは静的解析ツール（mypyなど）でチェックします。実行時は`typing.get_type_hints()`で取得可能ですが、自動チェックはされません。

### Q3: 既存プロジェクトに導入するには？

**A: 段階的に導入しましょう。** 新しいコードから型ヒントを追加し、mypyの設定で徐々に厳格化します。

```ini
# mypy.ini（段階的導入）
[mypy]
# 最初は警告のみ
warn_return_any = True

# 徐々に厳格化
# disallow_untyped_defs = True
# disallow_any_generics = True
```

### Q4: パフォーマンスへの影響は？

**A: ほぼありません。** 型ヒントは実行時に評価されないため、パフォーマンスへの影響は最小限です。

### Q5: mypyとpyrightどちらを使うべき？

**A: どちらでも構いません。** mypyは歴史が長くコミュニティが大きい。pyrightは高速でVS Codeとの統合が優れています。

---

## まとめ

Python型ヒントは、**コードの可読性を高め、バグを事前に検出する**強力な仕組みです。

### 重要ポイント

**型ヒントの基本**:
- 引数と戻り値に型を明示（`def func(a: int) -> str:`）
- 実行時には影響しない（静的解析ツールでチェック）
- `list[T]`, `dict[K, V]`, `T | None`などの組み込み型

**高度な型ヒント**:
- **TypedDict**: 辞書のキーと値の型を定義
- **Callable**: 関数型
- **Generic**: ジェネリクス（汎用型）
- **Protocol**: 構造的部分型（ダックタイピング）
- **Literal**: リテラル値を型として指定

**推奨ツール**:
- **mypy**: 最も人気の静的型チェッカー
- **pyright**: Microsoft製の高速型チェッカー
- **VS Code + Pylance**: 最高の開発体験

**導入ステップ**:
1. **mypyをインストール**: `pip install mypy`
2. **新しいコードから型ヒントを追加**: 公開APIから開始
3. **エディタに型チェックを統合**: VS CodeのPylanceなど
4. **CI/CDに組み込む**: GitHub Actionsで自動チェック
5. **段階的に厳格化**: `mypy.ini`で設定を調整

### 実践のコツ

1. **公開APIには必ず型ヒント**: ライブラリやモジュールの境界
2. **複雑な型は型エイリアスを使う**: 可読性向上
3. **Anyの使用を最小限に**: 型安全性の確保
4. **DataclassとTypedDictを活用**: 構造化データの型安全性
5. **静的型チェックをCI/CDに統合**: 自動化で品質維持

型ヒントをマスターすると、**より安全で保守性の高いPythonコード**が書けるようになります！

### 参考リンク

- **PEP 484 -- Type Hints**: https://peps.python.org/pep-0484/
- **typing — Support for type hints**: https://docs.python.org/3/library/typing.html
- **mypy Documentation**: https://mypy.readthedocs.io/
- **pyright Documentation**: https://microsoft.github.io/pyright/
- **Real Python - Python Type Checking**: https://realpython.com/python-type-checking/
- **Type Hints Cheat Sheet**: https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html
