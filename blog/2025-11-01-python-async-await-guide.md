---
slug: python-async-await-guide
title: Python async/await完全ガイド：非同期プログラミングで高速処理を実現する方法
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

Pythonの**async/await**は、**非同期プログラミング**を実現するための強力な仕組みです。I/O待機時間を有効活用することで、**Web API呼び出し、データベースアクセス、ファイル読み書きなどを劇的に高速化**できます。この記事では、async/awaitの基本から実践的な活用方法まで、初心者にもわかりやすく徹底解説します。

<!--truncate-->

## async/awaitとは何か

**async/await**は、Python 3.5から導入された非同期プログラミングのための構文です。これにより、I/O待機中に他の処理を実行できるため、**全体の実行時間を大幅に短縮**できます。

### 基本的な構文

```python
import asyncio

# 非同期関数の定義
async def hello():
    print("Hello")
    await asyncio.sleep(1)  # 1秒待機（非同期）
    print("World")

# 実行
asyncio.run(hello())
```

**キーワード**:
- `async def`: 非同期関数（コルーチン）を定義
- `await`: 非同期処理の完了を待つ
- `asyncio.run()`: 非同期関数を実行

---

## なぜ非同期プログラミングが必要なのか

### 問題：I/O待機時間の無駄

通常の同期処理では、I/O（ネットワーク通信、ファイル読み書き、データベースアクセスなど）の完了を待っている間、CPUは何もしません。

```python
import time
import requests

def fetch_url(url):
    """同期的にURLを取得（待機時間が無駄）"""
    response = requests.get(url)
    return response.text

# 3つのURLを順番に取得（合計6秒）
start = time.time()
urls = [
    "https://httpbin.org/delay/2",
    "https://httpbin.org/delay/2",
    "https://httpbin.org/delay/2"
]
for url in urls:
    fetch_url(url)  # 各2秒待機
print(f"実行時間: {time.time() - start:.2f}秒")  # 約6秒
```

### 解決策：非同期処理で並行実行

非同期処理では、1つのI/O待機中に他のタスクを実行できます。

```python
import asyncio
import aiohttp
import time

async def fetch_url_async(session, url):
    """非同期的にURLを取得"""
    async with session.get(url) as response:
        return await response.text()

async def main():
    urls = [
        "https://httpbin.org/delay/2",
        "https://httpbin.org/delay/2",
        "https://httpbin.org/delay/2"
    ]

    async with aiohttp.ClientSession() as session:
        # 3つのリクエストを並行実行
        tasks = [fetch_url_async(session, url) for url in urls]
        await asyncio.gather(*tasks)

# 実行
start = time.time()
asyncio.run(main())
print(f"実行時間: {time.time() - start:.2f}秒")  # 約2秒（3倍高速！）
```

**結果**: 6秒 → 2秒（**3倍高速化**）

---

## 同期処理と非同期処理の違い

### 同期処理（Synchronous）

```python
import time

def task1():
    print("Task 1 開始")
    time.sleep(2)  # 2秒ブロック
    print("Task 1 完了")

def task2():
    print("Task 2 開始")
    time.sleep(2)  # 2秒ブロック
    print("Task 2 完了")

# 順番に実行（合計4秒）
task1()
task2()
```

**実行フロー**:
```
Task 1 開始 → [2秒待機] → Task 1 完了 → Task 2 開始 → [2秒待機] → Task 2 完了
合計: 4秒
```

### 非同期処理（Asynchronous）

```python
import asyncio

async def task1():
    print("Task 1 開始")
    await asyncio.sleep(2)  # 2秒待機（他のタスクに譲る）
    print("Task 1 完了")

async def task2():
    print("Task 2 開始")
    await asyncio.sleep(2)  # 2秒待機（他のタスクに譲る）
    print("Task 2 完了")

async def main():
    # 並行実行（合計2秒）
    await asyncio.gather(task1(), task2())

asyncio.run(main())
```

**実行フロー**:
```
Task 1 開始
Task 2 開始
[2秒待機（並行）]
Task 1 完了
Task 2 完了
合計: 2秒
```

---

## asyncioの基本概念

### 1. イベントループ（Event Loop）

イベントループは、非同期タスクを管理・実行する中心的な仕組みです。

```python
import asyncio

async def hello():
    print("Hello, async world!")

# 方法1: asyncio.run()（Python 3.7以降推奨）
asyncio.run(hello())

# 方法2: イベントループを明示的に取得（低レベルAPI）
loop = asyncio.get_event_loop()
loop.run_until_complete(hello())
loop.close()
```

**ポイント**: `asyncio.run()`を使うのがシンプルで推奨されます。

### 2. コルーチン（Coroutine）

`async def`で定義された関数は**コルーチン**です。

```python
async def my_coroutine():
    return "Hello"

# コルーチンオブジェクトを作成（まだ実行されない）
coro = my_coroutine()
print(type(coro))  # <class 'coroutine'>

# 実行するにはawaitが必要
asyncio.run(coro)
```

### 3. タスク（Task）

タスクは、コルーチンをイベントループで並行実行するためのラッパーです。

```python
import asyncio

async def say_hello(delay, name):
    await asyncio.sleep(delay)
    print(f"Hello, {name}!")

async def main():
    # タスクを作成
    task1 = asyncio.create_task(say_hello(1, "Alice"))
    task2 = asyncio.create_task(say_hello(2, "Bob"))

    # タスクの完了を待つ
    await task1
    await task2

asyncio.run(main())
```

---

## async/awaitの基本的な使い方

### 1. 非同期関数の定義と呼び出し

```python
import asyncio

async def greet(name):
    """非同期の挨拶関数"""
    await asyncio.sleep(1)  # 1秒待機
    return f"Hello, {name}!"

async def main():
    # awaitで結果を取得
    result = await greet("Alice")
    print(result)

asyncio.run(main())
```

### 2. 複数の非同期処理を順次実行

```python
import asyncio

async def step1():
    print("Step 1 開始")
    await asyncio.sleep(1)
    print("Step 1 完了")
    return "結果1"

async def step2(input_data):
    print(f"Step 2 開始（入力: {input_data}）")
    await asyncio.sleep(1)
    print("Step 2 完了")
    return "結果2"

async def main():
    # 順番に実行
    result1 = await step1()
    result2 = await step2(result1)
    print(f"最終結果: {result2}")

asyncio.run(main())
```

**出力**:
```
Step 1 開始
Step 1 完了
Step 2 開始（入力: 結果1）
Step 2 完了
最終結果: 結果2
```

### 3. 複数の非同期処理を並行実行

```python
import asyncio
import time

async def fetch_data(id, delay):
    print(f"[{id}] データ取得開始")
    await asyncio.sleep(delay)
    print(f"[{id}] データ取得完了")
    return f"Data {id}"

async def main():
    start = time.time()

    # gather: 複数のコルーチンを並行実行
    results = await asyncio.gather(
        fetch_data(1, 2),
        fetch_data(2, 1),
        fetch_data(3, 3)
    )

    print(f"結果: {results}")
    print(f"実行時間: {time.time() - start:.2f}秒")

asyncio.run(main())
```

**出力**:
```
[1] データ取得開始
[2] データ取得開始
[3] データ取得開始
[2] データ取得完了
[1] データ取得完了
[3] データ取得完了
結果: ['Data 1', 'Data 2', 'Data 3']
実行時間: 3.00秒  # 最も長い3秒で完了（順次なら6秒）
```

---

## asyncio.gatherの活用

### 1. 基本的な使い方

```python
import asyncio

async def task(n):
    await asyncio.sleep(1)
    return n * 2

async def main():
    # 複数のタスクを並行実行
    results = await asyncio.gather(
        task(1),
        task(2),
        task(3)
    )
    print(results)  # [2, 4, 6]

asyncio.run(main())
```

### 2. リスト内包表記との組み合わせ

```python
import asyncio

async def process_item(item):
    await asyncio.sleep(0.1)
    return item ** 2

async def main():
    items = [1, 2, 3, 4, 5]

    # リスト内包表記でタスクを作成
    results = await asyncio.gather(*[process_item(i) for i in items])
    print(results)  # [1, 4, 9, 16, 25]

asyncio.run(main())
```

### 3. エラーハンドリング

```python
import asyncio

async def task_success():
    await asyncio.sleep(1)
    return "成功"

async def task_failure():
    await asyncio.sleep(0.5)
    raise ValueError("エラー発生")

async def main():
    try:
        # return_exceptions=True: エラーを例外として返す
        results = await asyncio.gather(
            task_success(),
            task_failure(),
            return_exceptions=True
        )

        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"タスク {i}: エラー - {result}")
            else:
                print(f"タスク {i}: {result}")
    except Exception as e:
        print(f"予期しないエラー: {e}")

asyncio.run(main())
```

**出力**:
```
タスク 0: 成功
タスク 1: エラー - エラー発生
```

---

## タスクの作成と管理

### 1. create_taskでバックグラウンド実行

```python
import asyncio

async def background_task(name, duration):
    print(f"[{name}] 開始")
    await asyncio.sleep(duration)
    print(f"[{name}] 完了")
    return f"{name}の結果"

async def main():
    # タスクを作成（即座にバックグラウンドで実行開始）
    task1 = asyncio.create_task(background_task("Task1", 2))
    task2 = asyncio.create_task(background_task("Task2", 1))

    print("他の処理を実行中...")
    await asyncio.sleep(0.5)
    print("まだ他の処理を実行中...")

    # タスクの完了を待つ
    result1 = await task1
    result2 = await task2

    print(f"結果: {result1}, {result2}")

asyncio.run(main())
```

### 2. タスクのキャンセル

```python
import asyncio

async def long_running_task():
    try:
        print("長時間タスク開始")
        await asyncio.sleep(10)
        print("長時間タスク完了")
    except asyncio.CancelledError:
        print("タスクがキャンセルされました")
        raise

async def main():
    task = asyncio.create_task(long_running_task())

    await asyncio.sleep(2)  # 2秒待機

    # タスクをキャンセル
    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        print("キャンセルを確認しました")

asyncio.run(main())
```

### 3. タイムアウト

```python
import asyncio

async def slow_operation():
    await asyncio.sleep(5)
    return "完了"

async def main():
    try:
        # 2秒でタイムアウト
        result = await asyncio.wait_for(slow_operation(), timeout=2.0)
        print(result)
    except asyncio.TimeoutError:
        print("タイムアウトしました")

asyncio.run(main())
```

---

## 非同期コンテキストマネージャー

### 1. async withの基本

```python
import asyncio

class AsyncResource:
    async def __aenter__(self):
        print("リソースを取得")
        await asyncio.sleep(1)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("リソースを解放")
        await asyncio.sleep(1)

    async def use(self):
        print("リソースを使用")

async def main():
    async with AsyncResource() as resource:
        await resource.use()

asyncio.run(main())
```

**出力**:
```
リソースを取得
リソースを使用
リソースを解放
```

### 2. aiohttpでのHTTPクライアント

```python
import asyncio
import aiohttp

async def fetch_url(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

async def main():
    html = await fetch_url("https://example.com")
    print(f"取得したHTMLの長さ: {len(html)} 文字")

asyncio.run(main())
```

### 3. aiodatabaseでのデータベースアクセス

```python
import asyncio
import aiosqlite

async def database_example():
    # 非同期SQLiteデータベース
    async with aiosqlite.connect("example.db") as db:
        # テーブル作成
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name TEXT,
                email TEXT
            )
        """)

        # データ挿入
        await db.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            ("Alice", "alice@example.com")
        )
        await db.commit()

        # データ取得
        async with db.execute("SELECT * FROM users") as cursor:
            async for row in cursor:
                print(row)

# asyncio.run(database_example())
```

---

## 非同期イテレータとジェネレーター

### 1. 非同期イテレータ（async for）

```python
import asyncio

class AsyncCounter:
    def __init__(self, max_count):
        self.max_count = max_count
        self.current = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.current >= self.max_count:
            raise StopAsyncIteration

        await asyncio.sleep(0.5)  # 非同期処理をシミュレート
        self.current += 1
        return self.current

async def main():
    async for num in AsyncCounter(5):
        print(f"カウント: {num}")

asyncio.run(main())
```

### 2. 非同期ジェネレーター

```python
import asyncio

async def async_range(start, end):
    """非同期範囲ジェネレーター"""
    for i in range(start, end):
        await asyncio.sleep(0.5)
        yield i

async def main():
    async for num in async_range(1, 6):
        print(f"数値: {num}")

asyncio.run(main())
```

### 3. 非同期リスト内包表記

```python
import asyncio

async def async_square(n):
    await asyncio.sleep(0.1)
    return n ** 2

async def main():
    # 非同期リスト内包表記
    results = [await async_square(i) for i in range(5)]
    print(results)  # [0, 1, 4, 9, 16]

    # 並行実行版（gather使用）
    results = await asyncio.gather(*[async_square(i) for i in range(5)])
    print(results)  # [0, 1, 4, 9, 16]

asyncio.run(main())
```

---

## 実践的な例

### 1. 複数のWeb APIを並行呼び出し

```python
import asyncio
import aiohttp
import time

async def fetch_pokemon(session, pokemon_id):
    """ポケモンAPIからデータを取得"""
    url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}"
    async with session.get(url) as response:
        data = await response.json()
        return data['name']

async def main():
    pokemon_ids = [1, 2, 3, 4, 5, 25, 50, 100]

    async with aiohttp.ClientSession() as session:
        start = time.time()

        # 並行実行
        tasks = [fetch_pokemon(session, pid) for pid in pokemon_ids]
        names = await asyncio.gather(*tasks)

        print(f"ポケモン名: {names}")
        print(f"実行時間: {time.time() - start:.2f}秒")

# asyncio.run(main())
# 出力例: ポケモン名: ['bulbasaur', 'ivysaur', 'venusaur', ...]
# 実行時間: 約1秒（同期だと8秒以上）
```

### 2. 複数のファイルを並行処理

```python
import asyncio
import aiofiles

async def read_file_async(filename):
    """ファイルを非同期で読み込む"""
    async with aiofiles.open(filename, 'r') as file:
        content = await file.read()
        return len(content)

async def write_file_async(filename, content):
    """ファイルに非同期で書き込む"""
    async with aiofiles.open(filename, 'w') as file:
        await file.write(content)

async def main():
    # 複数のファイルを並行処理
    files = ['file1.txt', 'file2.txt', 'file3.txt']

    # 並行書き込み
    write_tasks = [
        write_file_async(f, f"Content of {f}\n" * 100)
        for f in files
    ]
    await asyncio.gather(*write_tasks)

    # 並行読み込み
    read_tasks = [read_file_async(f) for f in files]
    sizes = await asyncio.gather(*read_tasks)

    for filename, size in zip(files, sizes):
        print(f"{filename}: {size} bytes")

# asyncio.run(main())
```

### 3. データベースクエリの並行実行

```python
import asyncio
import aiosqlite

async def fetch_user(db, user_id):
    """ユーザー情報を取得"""
    async with db.execute(
        "SELECT * FROM users WHERE id = ?", (user_id,)
    ) as cursor:
        return await cursor.fetchone()

async def fetch_user_orders(db, user_id):
    """ユーザーの注文を取得"""
    async with db.execute(
        "SELECT * FROM orders WHERE user_id = ?", (user_id,)
    ) as cursor:
        return await cursor.fetchall()

async def get_user_data(user_id):
    """ユーザーの全データを並行取得"""
    async with aiosqlite.connect("app.db") as db:
        # ユーザー情報と注文を並行取得
        user, orders = await asyncio.gather(
            fetch_user(db, user_id),
            fetch_user_orders(db, user_id)
        )

        return {
            "user": user,
            "orders": orders
        }

# asyncio.run(get_user_data(1))
```

### 4. Web スクレイピング

```python
import asyncio
import aiohttp
from bs4 import BeautifulSoup

async def scrape_page(session, url):
    """Webページをスクレイピング"""
    async with session.get(url) as response:
        html = await response.text()
        soup = BeautifulSoup(html, 'html.parser')
        title = soup.find('title')
        return title.text if title else "No title"

async def main():
    urls = [
        "https://example.com",
        "https://example.org",
        "https://example.net",
    ]

    async with aiohttp.ClientSession() as session:
        tasks = [scrape_page(session, url) for url in urls]
        titles = await asyncio.gather(*tasks)

        for url, title in zip(urls, titles):
            print(f"{url}: {title}")

# asyncio.run(main())
```

---

## エラーハンドリング

### 1. try-exceptでエラーを捕捉

```python
import asyncio

async def risky_operation():
    await asyncio.sleep(1)
    raise ValueError("エラーが発生しました")

async def main():
    try:
        await risky_operation()
    except ValueError as e:
        print(f"エラーをキャッチ: {e}")

asyncio.run(main())
```

### 2. 複数タスクのエラーハンドリング

```python
import asyncio

async def task_with_error(task_id):
    await asyncio.sleep(1)
    if task_id == 2:
        raise ValueError(f"Task {task_id} でエラー")
    return f"Task {task_id} 成功"

async def main():
    # return_exceptions=True: エラーを結果として返す
    results = await asyncio.gather(
        task_with_error(1),
        task_with_error(2),
        task_with_error(3),
        return_exceptions=True
    )

    for i, result in enumerate(results, 1):
        if isinstance(result, Exception):
            print(f"Task {i}: エラー - {result}")
        else:
            print(f"Task {i}: {result}")

asyncio.run(main())
```

**出力**:
```
Task 1: Task 1 成功
Task 2: エラー - Task 2 でエラー
Task 3: Task 3 成功
```

### 3. タイムアウトエラー

```python
import asyncio

async def slow_task():
    await asyncio.sleep(5)
    return "完了"

async def main():
    try:
        result = await asyncio.wait_for(slow_task(), timeout=2.0)
        print(result)
    except asyncio.TimeoutError:
        print("タイムアウト: 処理が2秒以内に完了しませんでした")

asyncio.run(main())
```

---

## よくあるパターン

### 1. プロデューサー・コンシューマーパターン

```python
import asyncio
import random

async def producer(queue, producer_id):
    """データを生成してキューに入れる"""
    for i in range(5):
        item = f"P{producer_id}-Item{i}"
        await queue.put(item)
        print(f"[Producer {producer_id}] 生成: {item}")
        await asyncio.sleep(random.uniform(0.1, 0.5))

    # 終了シグナル
    await queue.put(None)

async def consumer(queue, consumer_id):
    """キューからデータを取り出して処理"""
    while True:
        item = await queue.get()

        if item is None:
            # 終了シグナルを受信
            await queue.put(None)  # 他のコンシューマーに伝播
            break

        print(f"[Consumer {consumer_id}] 処理: {item}")
        await asyncio.sleep(random.uniform(0.1, 0.3))

async def main():
    queue = asyncio.Queue()

    # 2つのプロデューサーと3つのコンシューマー
    await asyncio.gather(
        producer(queue, 1),
        producer(queue, 2),
        consumer(queue, 1),
        consumer(queue, 2),
        consumer(queue, 3)
    )

asyncio.run(main())
```

### 2. レート制限

```python
import asyncio
import time

class RateLimiter:
    """レート制限を実装するクラス"""

    def __init__(self, max_calls, period):
        self.max_calls = max_calls
        self.period = period
        self.semaphore = asyncio.Semaphore(max_calls)
        self.times = []

    async def __aenter__(self):
        await self.semaphore.acquire()

        # 古いタイムスタンプを削除
        now = time.time()
        self.times = [t for t in self.times if now - t < self.period]

        # レート制限チェック
        if len(self.times) >= self.max_calls:
            sleep_time = self.period - (now - self.times[0])
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)

        self.times.append(time.time())
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.semaphore.release()

async def api_call(limiter, call_id):
    async with limiter:
        print(f"[{time.time():.2f}] API Call {call_id}")
        await asyncio.sleep(0.1)

async def main():
    # 5秒間に最大3回の呼び出し
    limiter = RateLimiter(max_calls=3, period=5)

    # 10回のAPI呼び出しを試行
    await asyncio.gather(*[api_call(limiter, i) for i in range(10)])

asyncio.run(main())
```

### 3. リトライロジック

```python
import asyncio
import random

async def unstable_api():
    """不安定なAPIをシミュレート"""
    if random.random() < 0.7:  # 70%の確率で失敗
        raise ConnectionError("接続エラー")
    return "成功"

async def retry_async(func, max_attempts=3, delay=1):
    """非同期リトライロジック"""
    for attempt in range(max_attempts):
        try:
            result = await func()
            print(f"成功（試行回数: {attempt + 1}）")
            return result
        except Exception as e:
            if attempt == max_attempts - 1:
                print(f"最大リトライ回数に到達")
                raise

            print(f"エラー: {e}. {delay}秒後にリトライ...")
            await asyncio.sleep(delay)

async def main():
    try:
        result = await retry_async(unstable_api, max_attempts=5, delay=2)
        print(f"結果: {result}")
    except Exception as e:
        print(f"最終的に失敗: {e}")

asyncio.run(main())
```

---

## 同期コードと非同期コードの統合

### 1. 同期関数を非同期で実行

```python
import asyncio
import time

def blocking_operation(n):
    """CPU集約的な処理（ブロッキング）"""
    time.sleep(2)  # 重い処理をシミュレート
    return n ** 2

async def main():
    # run_in_executorでブロッキング処理を別スレッドで実行
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, blocking_operation, 10)
    print(f"結果: {result}")

asyncio.run(main())
```

### 2. ThreadPoolExecutorの利用

```python
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor

def cpu_intensive_task(n):
    """CPU集約的な処理"""
    total = 0
    for i in range(n):
        total += i ** 2
    return total

async def main():
    loop = asyncio.get_event_loop()

    # 複数のCPU集約的タスクを並行実行
    with ThreadPoolExecutor(max_workers=4) as executor:
        tasks = [
            loop.run_in_executor(executor, cpu_intensive_task, 1000000)
            for _ in range(4)
        ]
        results = await asyncio.gather(*tasks)
        print(f"結果: {results}")

asyncio.run(main())
```

### 3. 非同期関数を同期コードから呼ぶ

```python
import asyncio

async def async_function():
    await asyncio.sleep(1)
    return "非同期処理完了"

# 方法1: asyncio.run()
def sync_caller_1():
    result = asyncio.run(async_function())
    print(result)

# 方法2: イベントループを取得
def sync_caller_2():
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(async_function())
    print(result)

sync_caller_1()
```

---

## パフォーマンス比較

### 同期 vs 非同期

```python
import asyncio
import aiohttp
import requests
import time

# 同期バージョン
def fetch_sync(urls):
    results = []
    for url in urls:
        response = requests.get(url)
        results.append(len(response.text))
    return results

# 非同期バージョン
async def fetch_async(urls):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for url in urls:
            async with session.get(url) as response:
                tasks.append(len(await response.text()))
        return tasks

# テスト
urls = [
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
]

# 同期版のテスト
start = time.time()
# sync_results = fetch_sync(urls)
# print(f"同期処理: {time.time() - start:.2f}秒")  # 約5秒

# 非同期版のテスト
start = time.time()
# async_results = asyncio.run(fetch_async(urls))
# print(f"非同期処理: {time.time() - start:.2f}秒")  # 約1秒
```

**結果**:
- 同期処理: 約5秒（5個 × 1秒）
- 非同期処理: 約1秒（並行実行）
- **5倍高速化！**

---

## ベストプラクティス

### 1. I/O処理に非同期を使う

```python
# ✅ 良い例：I/O処理（ネットワーク、ファイル、DB）
async def good_use_case():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.example.com") as response:
            return await response.json()

# ❌ 悪い例：CPU集約的処理には向かない
async def bad_use_case():
    # 非同期にしても速くならない
    result = sum([i ** 2 for i in range(10000000)])
    return result
```

### 2. awaitを忘れない

```python
# ❌ 間違い：awaitを忘れる
async def wrong():
    result = asyncio.sleep(1)  # コルーチンオブジェクトが返る
    print(result)  # <coroutine object sleep>

# ✅ 正しい
async def correct():
    await asyncio.sleep(1)  # 実際に1秒待つ
    print("完了")
```

### 3. 適切なライブラリを使う

```python
# ❌ 悪い例：同期ライブラリを非同期で使う
async def bad():
    # requestsは同期ライブラリ（ブロックする）
    response = requests.get("https://example.com")
    return response.text

# ✅ 良い例：非同期ライブラリを使う
async def good():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://example.com") as response:
            return await response.text()
```

**推奨ライブラリ**:
- HTTP: `aiohttp`
- ファイルI/O: `aiofiles`
- データベース: `aiosqlite`, `asyncpg`, `motor`（MongoDB）
- Redis: `aioredis`

### 4. エラーハンドリングを忘れない

```python
async def robust_fetch(url):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                response.raise_for_status()
                return await response.text()
    except asyncio.TimeoutError:
        print(f"タイムアウト: {url}")
    except aiohttp.ClientError as e:
        print(f"HTTPエラー: {e}")
    except Exception as e:
        print(f"予期しないエラー: {e}")

    return None
```

### 5. リソースの適切な管理

```python
# ✅ 良い例：async withでリソースを管理
async def good_resource_management():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://example.com") as response:
            return await response.text()
    # 自動的にクローズされる

# ❌ 悪い例：手動管理（漏れの危険）
async def bad_resource_management():
    session = aiohttp.ClientSession()
    response = await session.get("https://example.com")
    text = await response.text()
    # クローズを忘れている！
    return text
```

---

## よくある間違い

### 1. asyncio.run()を複数回呼ぶ

```python
# ❌ 間違い
async def task1():
    await asyncio.sleep(1)

async def task2():
    await asyncio.sleep(1)

# これは動かない
asyncio.run(task1())
asyncio.run(task2())  # RuntimeError

# ✅ 正しい
async def main():
    await task1()
    await task2()

asyncio.run(main())
```

### 2. time.sleepを使う

```python
# ❌ 間違い：time.sleepは全体をブロックする
import time

async def bad_sleep():
    time.sleep(1)  # これは他のタスクもブロックする！

# ✅ 正しい：asyncio.sleepを使う
async def good_sleep():
    await asyncio.sleep(1)  # 他のタスクに制御を譲る
```

### 3. 非同期関数を同期的に呼ぶ

```python
# ❌ 間違い
async def my_async_func():
    return "Hello"

# これは動かない
result = my_async_func()  # コルーチンオブジェクトが返る
print(result)  # <coroutine object my_async_func>

# ✅ 正しい
async def caller():
    result = await my_async_func()
    print(result)  # "Hello"

asyncio.run(caller())
```

### 4. gatherとcreate_taskの混同

```python
# ❌ 間違い：create_taskの結果をawaitしない
async def wrong():
    task1 = asyncio.create_task(some_async_func())
    task2 = asyncio.create_task(another_async_func())
    # awaitしていないので完了を待たない！

# ✅ 正しい：awaitで完了を待つ
async def correct():
    task1 = asyncio.create_task(some_async_func())
    task2 = asyncio.create_task(another_async_func())
    await task1
    await task2

# または
async def correct_2():
    await asyncio.gather(
        some_async_func(),
        another_async_func()
    )
```

---

## まとめ

Python async/awaitは、**I/O待機時間を有効活用して処理を高速化**する強力な仕組みです。

### 重要ポイント

**async/awaitの基本**:
- `async def`: 非同期関数（コルーチン）を定義
- `await`: 非同期処理の完了を待つ
- `asyncio.run()`: 非同期関数を実行

**並行実行の方法**:
- `asyncio.gather()`: 複数のタスクを並行実行して全結果を取得
- `asyncio.create_task()`: タスクをバックグラウンドで実行
- `asyncio.wait_for()`: タイムアウト付きで実行

**非同期プログラミングのメリット**:
1. **I/O処理の高速化**: Web API、DB、ファイルアクセスを並行実行
2. **リソースの効率的利用**: 待機時間を有効活用
3. **スケーラビリティ**: 多数の同時接続を処理

**ベストプラクティス**:
1. **I/O処理に使う**: CPU集約的処理には向かない
2. **非同期ライブラリを使う**: aiohttp、aiofiles、asyncpgなど
3. **awaitを忘れない**: コルーチンは必ずawait
4. **エラーハンドリング**: try-exceptとtimeout設定
5. **リソース管理**: async withを活用

### 使い分けガイド

**非同期が適している場合**:
- Web API呼び出し（複数のエンドポイント）
- データベースクエリ（複数のテーブル）
- ファイル読み書き（多数のファイル）
- ネットワーク通信

**同期が適している場合**:
- CPU集約的処理（数値計算、画像処理）
- シンプルなスクリプト
- 並行実行が不要な処理

### 実践のコツ

1. **小さく始める**: まずは`asyncio.gather()`で複数API呼び出しから
2. **既存ライブラリを活用**: aiohttp、aiofilesなど
3. **パフォーマンス測定**: 実際に速くなっているか確認
4. **エラーケースをテスト**: タイムアウト、ネットワークエラーなど
5. **ドキュメントを読む**: asyncioの公式ドキュメントを参照

async/awaitをマスターすると、**高速でスケーラブルなPythonアプリケーション**が開発できるようになります！

### 参考リンク

- **asyncio — 非同期 I/O**: https://docs.python.org/ja/3/library/asyncio.html
- **PEP 492 -- Coroutines with async and await syntax**: https://peps.python.org/pep-0492/
- **aiohttp Documentation**: https://docs.aiohttp.org/
- **Real Python - Async IO in Python**: https://realpython.com/async-io-python/
- **Python Async/Await Tutorial**: https://www.youtube.com/watch?v=t5Bo1Je9EmE
