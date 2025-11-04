---
slug: python-iterators-generators
title: Pythonのイテレータとジェネレーター徹底解説：メモリ効率的なデータ処理の仕組み
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - Python
---

Pythonの**イテレータ（Iterator）**と**ジェネレーター（Generator）**は、大量のデータを効率的に処理するための強力な仕組みです。これらを理解することで、**メモリ使用量を大幅に削減**し、無限のデータストリームを扱えるようになります。この記事では、イテレータとジェネレーターの基本から実践的な活用方法まで、初心者にもわかりやすく徹底解説します。

<!--truncate-->

## イテレータとは何か

**イテレータ（Iterator）**は、要素を1つずつ順番に取り出すことができるオブジェクトです。Pythonの`for`ループの背後では、常にイテレータが使われています。

### イテラブルとイテレータの違い

まず、2つの重要な概念を区別する必要があります：

- **イテラブル（Iterable）**: イテレータを返すことができるオブジェクト（例: リスト、タプル、文字列）
- **イテレータ（Iterator）**: 実際に要素を1つずつ返すオブジェクト

```python
# リストはイテラブル
numbers = [1, 2, 3, 4, 5]

# iter()でイテレータを取得
iterator = iter(numbers)

# next()で1つずつ要素を取得
print(next(iterator))  # 1
print(next(iterator))  # 2
print(next(iterator))  # 3
```

### forループの仕組み

`for`ループは、内部で自動的にイテレータを使用します：

```python
# ユーザーが書くコード
for item in [1, 2, 3]:
    print(item)

# Pythonが実際に行っていること
iterator = iter([1, 2, 3])
while True:
    try:
        item = next(iterator)
        print(item)
    except StopIteration:
        break
```

**ポイント**: `for`ループは`iter()`でイテレータを取得し、`next()`で要素を取り出し、`StopIteration`例外でループを終了します。

---

## イテレータプロトコル

イテレータは、2つの特殊メソッドを実装する必要があります：

### 1. `__iter__()`メソッド

イテレータオブジェクト自身を返します。

### 2. `__next__()`メソッド

次の要素を返します。要素がなくなったら`StopIteration`例外を発生させます。

### 簡単な例

```python
class CountUp:
    """1からnまでカウントアップするイテレータ"""

    def __init__(self, max_count):
        self.max_count = max_count
        self.current = 0

    def __iter__(self):
        """イテレータ自身を返す"""
        return self

    def __next__(self):
        """次の値を返す"""
        self.current += 1
        if self.current > self.max_count:
            raise StopIteration
        return self.current

# 使用例
counter = CountUp(5)
for num in counter:
    print(num)

# 出力:
# 1
# 2
# 3
# 4
# 5
```

---

## カスタムイテレータの作成

実践的なカスタムイテレータの例を見ていきましょう。

### 例1: 偶数を返すイテレータ

```python
class EvenNumbers:
    """指定範囲の偶数を返すイテレータ"""

    def __init__(self, start, end):
        self.current = start if start % 2 == 0 else start + 1
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current > self.end:
            raise StopIteration

        result = self.current
        self.current += 2
        return result

# 使用例
evens = EvenNumbers(1, 10)
print(list(evens))  # [2, 4, 6, 8, 10]
```

### 例2: ファイルを行ごとに読むイテレータ

```python
class FileLineIterator:
    """ファイルを1行ずつ読み込むイテレータ"""

    def __init__(self, filename):
        self.filename = filename
        self.file = None

    def __iter__(self):
        self.file = open(self.filename, 'r', encoding='utf-8')
        return self

    def __next__(self):
        if self.file is None:
            raise StopIteration

        line = self.file.readline()
        if not line:
            self.file.close()
            raise StopIteration

        return line.rstrip('\n')

    def __del__(self):
        """デストラクタでファイルを確実に閉じる"""
        if self.file:
            self.file.close()

# 使用例
# for line in FileLineIterator('data.txt'):
#     print(line)
```

### 例3: フィボナッチ数列イテレータ

```python
class Fibonacci:
    """フィボナッチ数列を生成するイテレータ"""

    def __init__(self, max_count=None):
        self.max_count = max_count
        self.count = 0
        self.a, self.b = 0, 1

    def __iter__(self):
        return self

    def __next__(self):
        if self.max_count is not None and self.count >= self.max_count:
            raise StopIteration

        self.count += 1
        result = self.a
        self.a, self.b = self.b, self.a + self.b
        return result

# 使用例
fib = Fibonacci(10)
print(list(fib))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# 無限フィボナッチ数列（上限なし）
fib_infinite = Fibonacci()
for i, num in enumerate(fib_infinite):
    if i >= 15:  # 手動で制限
        break
    print(num, end=' ')
# 出力: 0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
```

---

## ジェネレーターとは何か

**ジェネレーター（Generator）**は、イテレータを簡単に作成するための仕組みです。クラスを定義する代わりに、**`yield`文**を使った関数でイテレータを作成できます。

### ジェネレーターの利点

1. **シンプルな構文**: `__iter__()`や`__next__()`を実装する必要がない
2. **自動的な状態管理**: 関数のローカル変数が自動的に保存される
3. **メモリ効率**: 値を必要になるまで生成しない（遅延評価）

### 基本的な例

```python
def count_up(max_count):
    """1からnまでカウントアップするジェネレーター"""
    current = 1
    while current <= max_count:
        yield current
        current += 1

# 使用例
counter = count_up(5)
print(type(counter))  # <class 'generator'>

for num in counter:
    print(num)

# 出力:
# 1
# 2
# 3
# 4
# 5
```

**ポイント**: `yield`文を含む関数は、呼び出されると自動的にジェネレーターオブジェクトを返します。

---

## yield文の仕組み

`yield`文は、関数の実行を一時停止し、値を返します。次に`next()`が呼ばれると、前回の位置から実行を再開します。

### yieldの動作

```python
def simple_generator():
    print("開始")
    yield 1
    print("1を返した後")
    yield 2
    print("2を返した後")
    yield 3
    print("終了")

# 実行
gen = simple_generator()
print("ジェネレーター作成")

print(next(gen))  # "開始" → 1
print(next(gen))  # "1を返した後" → 2
print(next(gen))  # "2を返した後" → 3
# print(next(gen))  # "終了" → StopIteration
```

**出力結果**:
```
ジェネレーター作成
開始
1
1を返した後
2
2を返した後
3
```

### yield vs return

```python
# return: 関数を終了
def with_return():
    return 1
    return 2  # 到達不可能
    return 3  # 到達不可能

# yield: 一時停止して再開可能
def with_yield():
    yield 1
    yield 2
    yield 3

print(with_return())  # 1（1つだけ）
print(list(with_yield()))  # [1, 2, 3]（すべて取得）
```

---

## 実践的なジェネレーターの例

### 例1: フィボナッチ数列（ジェネレーター版）

```python
def fibonacci(max_count=None):
    """フィボナッチ数列を生成するジェネレーター"""
    a, b = 0, 1
    count = 0

    while max_count is None or count < max_count:
        yield a
        a, b = b, a + b
        count += 1

# 使用例
print(list(fibonacci(10)))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# 無限数列も簡単に
fib = fibonacci()
for i, num in enumerate(fib):
    if i >= 15:
        break
    print(num, end=' ')
# 0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
```

### 例2: ファイルを行ごとに読む（ジェネレーター版）

```python
def read_large_file(filename):
    """大きなファイルを1行ずつ読み込むジェネレーター"""
    with open(filename, 'r', encoding='utf-8') as file:
        for line in file:
            yield line.rstrip('\n')

# 使用例（メモリ効率的）
# for line in read_large_file('huge_file.txt'):
#     process(line)  # 1行ずつ処理
```

### 例3: 範囲内の素数を生成

```python
def primes_in_range(start, end):
    """指定範囲の素数を生成するジェネレーター"""
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                return False
        return True

    for num in range(start, end + 1):
        if is_prime(num):
            yield num

# 使用例
primes = primes_in_range(1, 50)
print(list(primes))
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
```

### 例4: データのバッチ処理

```python
def batch_data(data, batch_size):
    """データをバッチに分割するジェネレーター"""
    for i in range(0, len(data), batch_size):
        yield data[i:i + batch_size]

# 使用例
data = list(range(1, 26))  # 1〜25
for batch in batch_data(data, 5):
    print(batch)

# 出力:
# [1, 2, 3, 4, 5]
# [6, 7, 8, 9, 10]
# [11, 12, 13, 14, 15]
# [16, 17, 18, 19, 20]
# [21, 22, 23, 24, 25]
```

### 例5: 無限シーケンス

```python
def infinite_counter(start=0, step=1):
    """無限にカウントするジェネレーター"""
    current = start
    while True:
        yield current
        current += step

# 使用例
counter = infinite_counter(10, 5)
for i, value in enumerate(counter):
    if i >= 5:
        break
    print(value, end=' ')
# 出力: 10 15 20 25 30
```

---

## ジェネレーター式

**ジェネレーター式（Generator Expression）**は、リスト内包表記に似た構文で、ジェネレーターを簡潔に作成できます。

### 基本構文

```python
# リスト内包表記（すべて生成）
squares_list = [x**2 for x in range(10)]
print(type(squares_list))  # <class 'list'>
print(squares_list)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# ジェネレーター式（必要に応じて生成）
squares_gen = (x**2 for x in range(10))
print(type(squares_gen))  # <class 'generator'>
print(list(squares_gen))  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

**ポイント**: `[]`ではなく`()`を使うだけでジェネレーターになります。

### メモリ効率の違い

```python
import sys

# リスト内包表記（すべてメモリに保持）
list_comp = [x**2 for x in range(1000000)]
print(f"リストのサイズ: {sys.getsizeof(list_comp):,} bytes")
# リストのサイズ: 8,448,728 bytes

# ジェネレーター式（必要な時だけ生成）
gen_expr = (x**2 for x in range(1000000))
print(f"ジェネレーターのサイズ: {sys.getsizeof(gen_expr):,} bytes")
# ジェネレーターのサイズ: 112 bytes
```

**約75,000倍**のメモリ差！

### 実践例

```python
# ファイルから特定の行を抽出
def extract_lines(filename, keyword):
    """キーワードを含む行を抽出するジェネレーター式"""
    with open(filename, 'r', encoding='utf-8') as file:
        return (line.strip() for line in file if keyword in line)

# 数値データの変換
data = [1, 2, 3, 4, 5]
doubled = (x * 2 for x in data)
filtered = (x for x in doubled if x > 5)
print(list(filtered))  # [6, 8, 10]
```

---

## yieldとreturn、yield fromの使い分け

### 1. yield: 値を返して一時停止

```python
def count_up(n):
    for i in range(1, n + 1):
        yield i

print(list(count_up(5)))  # [1, 2, 3, 4, 5]
```

### 2. return: ジェネレーターを終了

```python
def limited_fibonacci(max_value):
    """指定値までのフィボナッチ数列"""
    a, b = 0, 1
    while a <= max_value:
        yield a
        a, b = b, a + b
    return "終了"  # StopIteration.valueに設定される

fib = limited_fibonacci(20)
print(list(fib))  # [0, 1, 1, 2, 3, 5, 8, 13, 21]
```

### 3. yield from: 別のジェネレーターに委譲

```python
def sub_generator():
    yield 1
    yield 2
    yield 3

def main_generator():
    yield 'start'
    yield from sub_generator()  # sub_generatorの全要素をyield
    yield 'end'

print(list(main_generator()))
# ['start', 1, 2, 3, 'end']
```

### yield fromの実践例

```python
def flatten(nested_list):
    """ネストされたリストを平坦化"""
    for item in nested_list:
        if isinstance(item, list):
            yield from flatten(item)  # 再帰的に平坦化
        else:
            yield item

# 使用例
nested = [1, [2, 3, [4, 5]], 6, [7, [8, 9]]]
print(list(flatten(nested)))
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

---

## イテレータとジェネレーターの違い

| 特徴 | イテレータ（クラス） | ジェネレーター（関数） |
|------|---------------------|----------------------|
| **実装方法** | `__iter__()`と`__next__()`を実装 | `yield`文を使う関数 |
| **コード量** | 多い（クラス定義） | 少ない（関数定義） |
| **状態管理** | 手動（インスタンス変数） | 自動（ローカル変数） |
| **複雑性** | 複雑な制御に適す | シンプルな制御に適す |
| **再利用** | 再初期化が必要 | 再呼び出しで新しいジェネレーター |

### 使い分けの指針

```python
# ✅ ジェネレーターが適している場合
def simple_range(n):
    """シンプルな順次処理"""
    for i in range(n):
        yield i

# ✅ イテレータクラスが適している場合
class ComplexIterator:
    """複雑な状態管理が必要"""
    def __init__(self):
        self.state = {}
        self.cache = []

    def __iter__(self):
        return self

    def __next__(self):
        # 複雑な状態管理ロジック
        pass
```

---

## メモリ効率とパフォーマンス

### 例1: 大きなデータセットの処理

```python
# ❌ 悪い例：すべてをメモリに読み込む
def process_data_bad(filename):
    data = []
    with open(filename, 'r') as file:
        for line in file:
            data.append(process_line(line))  # すべてメモリに
    return data

# ✅ 良い例：ジェネレーターで1行ずつ処理
def process_data_good(filename):
    with open(filename, 'r') as file:
        for line in file:
            yield process_line(line)  # 必要に応じて処理

def process_line(line):
    return line.strip().upper()
```

### 例2: チェーンによるデータ変換

```python
# データ処理パイプライン
def read_numbers(filename):
    """ファイルから数値を読み込む"""
    with open(filename, 'r') as file:
        for line in file:
            yield int(line.strip())

def filter_even(numbers):
    """偶数だけフィルター"""
    for num in numbers:
        if num % 2 == 0:
            yield num

def square(numbers):
    """2乗する"""
    for num in numbers:
        yield num ** 2

# パイプラインを構築（メモリ効率的）
# pipeline = square(filter_even(read_numbers('numbers.txt')))
# for result in pipeline:
#     print(result)
```

### 例3: パフォーマンス比較

```python
import time

# リストで処理
def list_approach(n):
    data = [x**2 for x in range(n)]
    return sum(data)

# ジェネレーターで処理
def generator_approach(n):
    data = (x**2 for x in range(n))
    return sum(data)

n = 10_000_000

# リストの場合
start = time.time()
result1 = list_approach(n)
time1 = time.time() - start
print(f"リスト: {time1:.4f}秒")

# ジェネレーターの場合
start = time.time()
result2 = generator_approach(n)
time2 = time.time() - start
print(f"ジェネレーター: {time2:.4f}秒")

print(f"メモリ効率: ジェネレーターの方が優れている")
```

---

## itertools: 強力なイテレータツール

Pythonの標準ライブラリ`itertools`は、便利なイテレータを提供します。

### よく使うitertools関数

```python
import itertools

# 1. count(): 無限カウンター
counter = itertools.count(start=10, step=2)
for i, val in enumerate(counter):
    if i >= 5:
        break
    print(val, end=' ')  # 10 12 14 16 18

print()

# 2. cycle(): 無限ループ
cycle = itertools.cycle(['A', 'B', 'C'])
for i, val in enumerate(cycle):
    if i >= 7:
        break
    print(val, end=' ')  # A B C A B C A

print()

# 3. repeat(): 値を繰り返す
repeat = itertools.repeat('Hello', 3)
print(list(repeat))  # ['Hello', 'Hello', 'Hello']

# 4. chain(): 複数のイテラブルを連結
chain = itertools.chain([1, 2], [3, 4], [5, 6])
print(list(chain))  # [1, 2, 3, 4, 5, 6]

# 5. islice(): スライス
data = itertools.islice(range(100), 10, 20)
print(list(data))  # [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

# 6. takewhile(): 条件が真の間だけ取得
takewhile = itertools.takewhile(lambda x: x < 5, [1, 2, 3, 4, 5, 6, 1, 2])
print(list(takewhile))  # [1, 2, 3, 4]

# 7. dropwhile(): 条件が真の間スキップ
dropwhile = itertools.dropwhile(lambda x: x < 5, [1, 2, 3, 4, 5, 6, 1, 2])
print(list(dropwhile))  # [5, 6, 1, 2]

# 8. combinations(): 組み合わせ
combinations = itertools.combinations([1, 2, 3, 4], 2)
print(list(combinations))
# [(1, 2), (1, 3), (1, 4), (2, 3), (2, 4), (3, 4)]

# 9. permutations(): 順列
permutations = itertools.permutations([1, 2, 3], 2)
print(list(permutations))
# [(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]

# 10. groupby(): グループ化
data = [('A', 1), ('A', 2), ('B', 3), ('B', 4), ('C', 5)]
grouped = itertools.groupby(data, key=lambda x: x[0])
for key, group in grouped:
    print(f"{key}: {list(group)}")
# A: [('A', 1), ('A', 2)]
# B: [('B', 3), ('B', 4)]
# C: [('C', 5)]
```

---

## 実践的なユースケース

### 1. ログファイルの解析

```python
def parse_log_file(filename, error_only=False):
    """ログファイルを解析するジェネレーター"""
    with open(filename, 'r', encoding='utf-8') as file:
        for line in file:
            if error_only and 'ERROR' not in line:
                continue

            # ログをパース
            parts = line.strip().split(' - ')
            if len(parts) >= 3:
                timestamp, level, message = parts[0], parts[1], parts[2]
                yield {
                    'timestamp': timestamp,
                    'level': level,
                    'message': message
                }

# 使用例
# for log in parse_log_file('app.log', error_only=True):
#     print(f"[{log['timestamp']}] {log['message']}")
```

### 2. CSVファイルの処理

```python
def read_csv(filename, skip_header=True):
    """CSVファイルを辞書形式で読み込むジェネレーター"""
    with open(filename, 'r', encoding='utf-8') as file:
        if skip_header:
            header = file.readline().strip().split(',')
        else:
            header = None

        for line in file:
            values = line.strip().split(',')
            if header:
                yield dict(zip(header, values))
            else:
                yield values

# 使用例
# for row in read_csv('users.csv'):
#     print(row['name'], row['email'])
```

### 3. ページネーション

```python
def paginate(items, page_size=10):
    """データをページに分割するジェネレーター"""
    items_list = list(items)
    total_pages = (len(items_list) + page_size - 1) // page_size

    for page_num in range(total_pages):
        start = page_num * page_size
        end = start + page_size
        yield {
            'page': page_num + 1,
            'total_pages': total_pages,
            'items': items_list[start:end]
        }

# 使用例
data = range(1, 26)  # 1〜25
for page in paginate(data, page_size=5):
    print(f"Page {page['page']}/{page['total_pages']}: {page['items']}")
```

### 4. データストリームの変換

```python
def transform_stream(data_stream, transformations):
    """データストリームに複数の変換を適用"""
    for item in data_stream:
        for transform in transformations:
            item = transform(item)
        yield item

# 使用例
data = [1, 2, 3, 4, 5]
transforms = [
    lambda x: x * 2,      # 2倍
    lambda x: x + 10,     # +10
    lambda x: x ** 2      # 2乗
]

result = transform_stream(data, transforms)
print(list(result))  # [144, 196, 256, 324, 400]
```

### 5. 無限データストリーム

```python
def sensor_data_simulator():
    """センサーデータのシミュレーター（無限ストリーム）"""
    import random
    import time

    while True:
        yield {
            'timestamp': time.time(),
            'temperature': random.uniform(20.0, 30.0),
            'humidity': random.uniform(40.0, 60.0)
        }
        time.sleep(1)  # 1秒ごとにデータ生成

# 使用例
# sensor = sensor_data_simulator()
# for i, data in enumerate(sensor):
#     if i >= 10:  # 10個だけ取得
#         break
#     print(f"温度: {data['temperature']:.1f}℃, 湿度: {data['humidity']:.1f}%")
```

---

## ベストプラクティス

### 1. 適切な場面でジェネレーターを使う

```python
# ✅ 良い例：大きなデータにはジェネレーター
def process_large_file(filename):
    with open(filename, 'r') as file:
        for line in file:
            yield process_line(line)

# ❌ 悪い例：小さなデータにジェネレーターは過剰
def get_three_numbers():
    yield 1
    yield 2
    yield 3
# こういう場合は [1, 2, 3] で十分
```

### 2. ジェネレーターは一度しか使えない

```python
gen = (x**2 for x in range(5))

# 1回目は動作
print(list(gen))  # [0, 1, 4, 9, 16]

# 2回目は空
print(list(gen))  # []

# 再利用するには再生成
gen = (x**2 for x in range(5))
print(list(gen))  # [0, 1, 4, 9, 16]
```

### 3. with文でリソースを適切に管理

```python
# ✅ 良い例
def read_file(filename):
    with open(filename, 'r') as file:
        for line in file:
            yield line.strip()

# ❌ 悪い例
def read_file_bad(filename):
    file = open(filename, 'r')
    for line in file:
        yield line.strip()
    # file.close()が呼ばれない可能性
```

### 4. 例外処理を適切に行う

```python
def safe_division(numbers):
    """安全な除算ジェネレーター"""
    for num in numbers:
        try:
            yield 100 / num
        except ZeroDivisionError:
            yield float('inf')  # 無限大を返す

# 使用例
result = safe_division([10, 0, 5, 0, 2])
print(list(result))  # [10.0, inf, 20.0, inf, 50.0]
```

### 5. ドキュメントを書く

```python
def fibonacci(n):
    """
    フィボナッチ数列を生成するジェネレーター。

    Args:
        n (int): 生成する数列の長さ

    Yields:
        int: フィボナッチ数

    Example:
        >>> list(fibonacci(5))
        [0, 1, 1, 2, 3]
    """
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
```

---

## よくある間違いと解決策

### 1. ジェネレーターをリストとして扱う

```python
# ❌ 間違い
gen = (x**2 for x in range(10))
print(gen[5])  # TypeError: 'generator' object is not subscriptable

# ✅ 正しい
gen = (x**2 for x in range(10))
print(list(gen)[5])  # 25

# またはitertoolsを使用
import itertools
gen = (x**2 for x in range(10))
print(next(itertools.islice(gen, 5, 6)))  # 25
```

### 2. ジェネレーターの再利用

```python
# ❌ 間違い
gen = (x for x in range(5))
list1 = list(gen)
list2 = list(gen)  # 空になる
print(list2)  # []

# ✅ 正しい
def create_gen():
    return (x for x in range(5))

list1 = list(create_gen())
list2 = list(create_gen())
print(list2)  # [0, 1, 2, 3, 4]
```

### 3. yieldを忘れる

```python
# ❌ 間違い
def count_up(n):
    for i in range(1, n + 1):
        return i  # returnを使うと最初の値だけ返す

print(count_up(5))  # 1

# ✅ 正しい
def count_up(n):
    for i in range(1, n + 1):
        yield i

print(list(count_up(5)))  # [1, 2, 3, 4, 5]
```

---

## まとめ

Pythonの**イテレータとジェネレーター**は、効率的なデータ処理のための強力な仕組みです。

### 重要ポイント

**イテレータの基本**:
- `__iter__()`と`__next__()`を実装
- `StopIteration`で終了を通知
- 状態を手動で管理

**ジェネレーターの基本**:
- `yield`文で値を返して一時停止
- シンプルな構文でイテレータを作成
- 自動的な状態管理

**メモリ効率**:
- 必要に応じて値を生成（遅延評価）
- 大きなデータセットに最適
- 無限シーケンスも扱える

**ベストプラクティス**:
1. 大きなデータにはジェネレーターを使う
2. ジェネレーターは一度しか使えないことを理解
3. リソース管理に`with`文を使う
4. 適切な例外処理を行う
5. ドキュメントを書く

### 使い分けガイド

**リストを使うべき場合**:
- データサイズが小さい（数百〜数千要素）
- 複数回イテレートする必要がある
- インデックスアクセスが必要
- データ全体が必要

**ジェネレーターを使うべき場合**:
- データサイズが大きい（数万要素以上）
- 1回だけイテレートする
- メモリ効率が重要
- 無限シーケンスを扱う
- データをストリーム処理する

### 実践のコツ

1. **小さく始める**: まずは簡単なジェネレーター関数から
2. **itertoolsを活用**: 標準ライブラリの強力なツールを使う
3. **メモリプロファイリング**: 実際のメモリ使用量を測定
4. **テストを書く**: ジェネレーターもユニットテストの対象
5. **パフォーマンス測定**: 実際の処理時間を計測

イテレータとジェネレーターをマスターすると、**より効率的でスケーラブルなPythonコード**が書けるようになります！

### 参考リンク

- **PEP 255 -- Simple Generators**: https://peps.python.org/pep-0255/
- **Python Documentation - Iterators**: https://docs.python.org/3/tutorial/classes.html#iterators
- **Python Documentation - Generators**: https://docs.python.org/3/tutorial/classes.html#generators
- **itertools — Functions creating iterators**: https://docs.python.org/3/library/itertools.html
- **Generator Tricks for Systems Programmers**: http://www.dabeaz.com/generators/
