---
slug: python-context-manager-guide
title: Pythonのコンテキストマネージャー完全ガイド：with文でリソース管理を安全に
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

Pythonの**コンテキストマネージャー（Context Manager）**は、ファイルやデータベース接続などのリソースを**安全に管理する仕組み**です。`with`文と組み合わせることで、**リソースの取得と解放を自動化**し、例外が発生してもリソースリークを防ぎます。この記事では、コンテキストマネージャーの基本から実践的な活用方法まで、初心者にもわかりやすく徹底解説します。

<!--truncate-->

## コンテキストマネージャーとは何か

**コンテキストマネージャー（Context Manager）**は、リソースの**セットアップとクリーンアップを自動化する仕組み**です。`with`文と組み合わせて使うことで、以下のような処理を確実に実行できます：

- **リソースの取得**（ファイルを開く、データベースに接続するなど）
- **本来の処理**（ファイルの読み書き、クエリの実行など）
- **リソースの解放**（ファイルを閉じる、接続を切断するなど）

### 最も基本的な例：ファイル操作

```python
# ✅ with文を使った場合（推奨）
with open('sample.txt', 'r') as file:
    content = file.read()
    print(content)
# ブロックを抜けると自動的にファイルが閉じられる

# ❌ with文を使わない場合（非推奨）
file = open('sample.txt', 'r')
content = file.read()
print(content)
file.close()  # 閉じるのを忘れる可能性がある
```

`with`文を使うと、**例外が発生してもファイルが確実に閉じられます**。

---

## なぜコンテキストマネージャーが必要なのか

### 問題：リソースリークの危険性

```python
# ❌ 悪い例：例外が発生するとファイルが閉じられない
def read_file_unsafe(filename):
    file = open(filename, 'r')
    content = file.read()  # ここで例外が発生すると...
    file.close()  # この行が実行されない！
    return content

# ファイルが閉じられないまま終了（リソースリーク）
```

### 従来の解決策：try-finally

```python
# △ try-finallyを使う（冗長）
def read_file_with_try(filename):
    file = open(filename, 'r')
    try:
        content = file.read()
        return content
    finally:
        file.close()  # 必ず実行される
```

### 最良の解決策：with文

```python
# ✅ with文を使う（簡潔で安全）
def read_file_safe(filename):
    with open(filename, 'r') as file:
        return file.read()
# 例外の有無に関わらずファイルが閉じられる
```

---

## with文の仕組み

`with`文は、以下の流れで動作します：

1. **`__enter__()`メソッドが呼ばれる**
   - リソースの初期化処理
   - 戻り値が`as`の後の変数に代入される

2. **withブロック内のコードが実行される**
   - 本来の処理

3. **`__exit__()`メソッドが呼ばれる**
   - リソースのクリーンアップ処理
   - 例外が発生しても必ず実行される

### 動作の可視化

```python
# with文の内部動作（疑似コード）
manager = open('sample.txt', 'r')
file = manager.__enter__()  # ファイルを開く
try:
    content = file.read()  # 本来の処理
    print(content)
finally:
    manager.__exit__(None, None, None)  # ファイルを閉じる
```

---

## 自作のコンテキストマネージャー

### 方法1: クラスで実装（`__enter__`と`__exit__`）

コンテキストマネージャーは、`__enter__`と`__exit__`メソッドを持つクラスとして実装できます。

```python
class MyContextManager:
    """シンプルなコンテキストマネージャーの例"""

    def __enter__(self):
        """withブロックに入る時に実行される"""
        print("__enter__: リソースを取得")
        return self  # このオブジェクトがasの後の変数に代入される

    def __exit__(self, exc_type, exc_value, traceback):
        """withブロックを抜ける時に実行される"""
        print("__exit__: リソースを解放")
        # exc_type: 例外の型（例外がない場合はNone）
        # exc_value: 例外の値
        # traceback: トレースバック情報
        return False  # Falseを返すと例外が再送出される

# 使用例
with MyContextManager() as manager:
    print("withブロック内の処理")

# 出力:
# __enter__: リソースを取得
# withブロック内の処理
# __exit__: リソースを解放
```

### `__exit__`の引数

`__exit__`メソッドは3つの引数を受け取ります：

```python
class DetailedContextManager:
    def __enter__(self):
        print("リソース取得")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is None:
            print("正常終了")
        else:
            print(f"例外発生: {exc_type.__name__}: {exc_value}")

        # Trueを返すと例外を抑制（外に伝播しない）
        # Falseを返すと例外を再送出（外に伝播する）
        return False

# 正常終了の場合
with DetailedContextManager():
    print("処理実行")

print()

# 例外発生の場合
try:
    with DetailedContextManager():
        raise ValueError("エラー発生！")
except ValueError as e:
    print(f"外でキャッチ: {e}")
```

**出力結果**:
```
リソース取得
処理実行
正常終了

リソース取得
例外発生: ValueError: エラー発生！
外でキャッチ: エラー発生！
```

---

## 実践的な例：クラスベースのコンテキストマネージャー

### 例1: データベース接続管理

```python
import sqlite3

class DatabaseConnection:
    """データベース接続を管理するコンテキストマネージャー"""

    def __init__(self, db_name):
        self.db_name = db_name
        self.connection = None

    def __enter__(self):
        """データベースに接続"""
        print(f"データベース {self.db_name} に接続中...")
        self.connection = sqlite3.connect(self.db_name)
        return self.connection

    def __exit__(self, exc_type, exc_value, traceback):
        """データベース接続を閉じる"""
        if exc_type is None:
            # 正常終了時はコミット
            self.connection.commit()
            print("変更をコミット")
        else:
            # 例外発生時はロールバック
            self.connection.rollback()
            print(f"エラー発生、ロールバック: {exc_value}")

        self.connection.close()
        print("データベース接続を閉じる")
        return False  # 例外を再送出

# 使用例
with DatabaseConnection(':memory:') as conn:
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE users (id INTEGER, name TEXT)')
    cursor.execute('INSERT INTO users VALUES (1, "Alice")')
    print("データを挿入")
```

### 例2: 実行時間計測

```python
import time

class Timer:
    """処理時間を計測するコンテキストマネージャー"""

    def __init__(self, name="処理"):
        self.name = name
        self.start_time = None

    def __enter__(self):
        """計測開始"""
        self.start_time = time.time()
        print(f"{self.name}を開始...")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """計測終了"""
        elapsed_time = time.time() - self.start_time
        print(f"{self.name}が完了: {elapsed_time:.4f}秒")
        return False

# 使用例
with Timer("データ処理"):
    time.sleep(1.5)  # 時間のかかる処理
    print("処理中...")
```

**出力結果**:
```
データ処理を開始...
処理中...
データ処理が完了: 1.5012秒
```

### 例3: 一時的なディレクトリ変更

```python
import os

class ChangeDirectory:
    """一時的にカレントディレクトリを変更するコンテキストマネージャー"""

    def __init__(self, new_path):
        self.new_path = new_path
        self.original_path = None

    def __enter__(self):
        """ディレクトリを変更"""
        self.original_path = os.getcwd()
        os.chdir(self.new_path)
        print(f"ディレクトリ変更: {self.original_path} → {self.new_path}")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """元のディレクトリに戻る"""
        os.chdir(self.original_path)
        print(f"ディレクトリを復元: {self.new_path} → {self.original_path}")
        return False

# 使用例
print(f"現在のディレクトリ: {os.getcwd()}")

with ChangeDirectory('/tmp'):
    print(f"with内のディレクトリ: {os.getcwd()}")
    # ここで /tmp での処理を実行

print(f"with後のディレクトリ: {os.getcwd()}")
```

---

## contextlibモジュールの活用

Pythonの標準ライブラリ`contextlib`を使うと、**より簡単にコンテキストマネージャーを作成**できます。

### `@contextmanager`デコレーター

クラスを作らずに、**ジェネレーター関数**でコンテキストマネージャーを実装できます。

```python
from contextlib import contextmanager

@contextmanager
def my_context():
    """ジェネレーター関数でコンテキストマネージャーを実装"""
    print("__enter__: セットアップ")
    yield "リソース"  # yieldの値がasの後の変数に代入される
    print("__exit__: クリーンアップ")

# 使用例
with my_context() as resource:
    print(f"処理実行: {resource}")
```

**出力結果**:
```
__enter__: セットアップ
処理実行: リソース
__exit__: クリーンアップ
```

### 仕組み

```python
@contextmanager
def my_context():
    # yieldの前：__enter__と同じ
    print("セットアップ")

    try:
        yield "値"  # ここでwithブロックに制御が移る
    finally:
        # yieldの後：__exit__と同じ（必ず実行される）
        print("クリーンアップ")
```

---

## 実践的な例：@contextmanagerを使った実装

### 例1: ファイルロック

```python
from contextlib import contextmanager
import fcntl

@contextmanager
def file_lock(filename):
    """ファイルロックを管理するコンテキストマネージャー"""
    lock_file = open(filename + '.lock', 'w')
    try:
        print(f"ロック取得中: {filename}")
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        yield lock_file
    finally:
        print(f"ロック解放: {filename}")
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)
        lock_file.close()

# 使用例
with file_lock('data.txt'):
    print("排他制御された処理を実行")
```

### 例2: 環境変数の一時変更

```python
from contextlib import contextmanager
import os

@contextmanager
def temporary_env_var(key, value):
    """環境変数を一時的に変更するコンテキストマネージャー"""
    old_value = os.environ.get(key)
    os.environ[key] = value
    print(f"環境変数を設定: {key}={value}")

    try:
        yield
    finally:
        if old_value is None:
            del os.environ[key]
            print(f"環境変数を削除: {key}")
        else:
            os.environ[key] = old_value
            print(f"環境変数を復元: {key}={old_value}")

# 使用例
print(f"API_KEY: {os.environ.get('API_KEY', 'なし')}")

with temporary_env_var('API_KEY', 'secret123'):
    print(f"with内 API_KEY: {os.environ.get('API_KEY')}")

print(f"with後 API_KEY: {os.environ.get('API_KEY', 'なし')}")
```

### 例3: 例外の抑制

```python
from contextlib import contextmanager

@contextmanager
def suppress_exception(exception_type):
    """特定の例外を抑制するコンテキストマネージャー"""
    try:
        yield
    except exception_type as e:
        print(f"例外を抑制: {e}")
        # 例外を再送出しない（抑制）

# 使用例
with suppress_exception(ValueError):
    print("処理開始")
    raise ValueError("エラー発生")
    print("この行は実行されない")

print("プログラムは継続")
```

**出力結果**:
```
処理開始
例外を抑制: エラー発生
プログラムは継続
```

---

## contextlibの便利な関数

### 1. `contextlib.suppress`：例外を抑制

```python
from contextlib import suppress

# ファイルが存在しない場合のエラーを無視
with suppress(FileNotFoundError):
    os.remove('non_existent_file.txt')
    print("この行は実行されない")

print("プログラム継続")

# 複数の例外を抑制
with suppress(ValueError, TypeError, KeyError):
    # エラーが発生しても処理を続行
    data = int("invalid")
```

### 2. `contextlib.closing`：closeメソッドを持つオブジェクトを自動クローズ

```python
from contextlib import closing
import urllib.request

# closeメソッドを持つオブジェクトを自動的に閉じる
with closing(urllib.request.urlopen('https://www.python.org')) as page:
    content = page.read()
    print(f"読み込んだバイト数: {len(content)}")
# pageが自動的にクローズされる
```

### 3. `contextlib.redirect_stdout`：標準出力をリダイレクト

```python
from contextlib import redirect_stdout
import io

# 標準出力をStringIOにリダイレクト
output = io.StringIO()
with redirect_stdout(output):
    print("これはファイルに書き込まれる")
    print("コンソールには出力されない")

# 出力内容を取得
captured = output.getvalue()
print(f"キャプチャした出力: {captured}")
```

### 4. `contextlib.ExitStack`：複数のコンテキストマネージャーを動的に管理

```python
from contextlib import ExitStack

# 複数のファイルを同時に開く
filenames = ['file1.txt', 'file2.txt', 'file3.txt']

with ExitStack() as stack:
    files = [stack.enter_context(open(fname, 'w')) for fname in filenames]

    for i, file in enumerate(files):
        file.write(f"ファイル{i+1}の内容\n")

    # すべてのファイルが自動的に閉じられる
```

**動的な数のリソース管理**:

```python
from contextlib import ExitStack

def process_files(filenames):
    """可変個のファイルを処理"""
    with ExitStack() as stack:
        # 動的に複数のファイルを開く
        files = [stack.enter_context(open(f, 'r')) for f in filenames]

        # すべてのファイルの内容を処理
        for file in files:
            print(file.read())

        # ブロックを抜けるとすべて自動的に閉じられる
```

---

## ネストしたコンテキストマネージャー

### 複数のwith文

```python
# ❌ ネストが深くなる
with open('input.txt', 'r') as input_file:
    with open('output.txt', 'w') as output_file:
        with DatabaseConnection('db.sqlite') as conn:
            # 処理
            pass

# ✅ カンマで区切る（Python 2.7+）
with open('input.txt', 'r') as input_file, \
     open('output.txt', 'w') as output_file, \
     DatabaseConnection('db.sqlite') as conn:
    # 処理
    content = input_file.read()
    output_file.write(content)
```

### ExitStackを使った動的管理

```python
from contextlib import ExitStack

with ExitStack() as stack:
    # 条件に応じてリソースを追加
    input_file = stack.enter_context(open('input.txt', 'r'))
    output_file = stack.enter_context(open('output.txt', 'w'))

    if need_database:
        conn = stack.enter_context(DatabaseConnection('db.sqlite'))

    # 処理
    pass
```

---

## エラーハンドリング

### 例外を抑制する

`__exit__`が`True`を返すと例外が抑制されます。

```python
class SuppressSpecificError:
    """特定のエラーを抑制するコンテキストマネージャー"""

    def __init__(self, error_type):
        self.error_type = error_type

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is None:
            return False  # 例外なし

        if issubclass(exc_type, self.error_type):
            print(f"例外を抑制: {exc_value}")
            return True  # 例外を抑制

        return False  # その他の例外は再送出

# 使用例
with SuppressSpecificError(ValueError):
    print("処理開始")
    raise ValueError("このエラーは抑制される")
    print("実行されない")

print("プログラム継続")

# 異なる例外は抑制されない
try:
    with SuppressSpecificError(ValueError):
        raise TypeError("このエラーは抑制されない")
except TypeError as e:
    print(f"外でキャッチ: {e}")
```

### @contextmanagerでの例外処理

```python
from contextlib import contextmanager

@contextmanager
def handle_errors():
    """エラーハンドリングを行うコンテキストマネージャー"""
    try:
        yield
    except ValueError as e:
        print(f"ValueErrorをキャッチ: {e}")
        # 例外を再送出しない（抑制）
    except Exception as e:
        print(f"その他のエラー: {e}")
        raise  # 再送出

# 使用例
with handle_errors():
    raise ValueError("このエラーは処理される")

print("継続")

try:
    with handle_errors():
        raise TypeError("このエラーは再送出される")
except TypeError:
    print("外でキャッチされた")
```

---

## 実践的なユースケース

### 1. ログコンテキスト

```python
from contextlib import contextmanager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@contextmanager
def log_context(operation):
    """操作のログを記録するコンテキストマネージャー"""
    logger.info(f"{operation}を開始")
    start_time = time.time()

    try:
        yield
    except Exception as e:
        logger.error(f"{operation}でエラー発生: {e}")
        raise
    else:
        elapsed = time.time() - start_time
        logger.info(f"{operation}が完了: {elapsed:.2f}秒")

# 使用例
with log_context("データベース更新"):
    time.sleep(1)
    # データベース更新処理
```

### 2. トランザクション管理

```python
from contextlib import contextmanager
import sqlite3

@contextmanager
def transaction(connection):
    """データベーストランザクションを管理"""
    cursor = connection.cursor()
    try:
        yield cursor
        connection.commit()
        print("トランザクションをコミット")
    except Exception as e:
        connection.rollback()
        print(f"トランザクションをロールバック: {e}")
        raise

# 使用例
conn = sqlite3.connect(':memory:')

with transaction(conn) as cursor:
    cursor.execute('CREATE TABLE users (id INTEGER, name TEXT)')
    cursor.execute('INSERT INTO users VALUES (1, "Alice")')
    # 成功すれば自動コミット、失敗すれば自動ロールバック

conn.close()
```

### 3. 設定の一時変更

```python
from contextlib import contextmanager

class Config:
    """アプリケーション設定"""
    DEBUG = False
    LOG_LEVEL = 'INFO'

@contextmanager
def temporary_config(**kwargs):
    """設定を一時的に変更するコンテキストマネージャー"""
    # 元の設定を保存
    original_values = {}
    for key, value in kwargs.items():
        original_values[key] = getattr(Config, key)
        setattr(Config, key, value)

    try:
        yield Config
    finally:
        # 元の設定を復元
        for key, value in original_values.items():
            setattr(Config, key, value)

# 使用例
print(f"通常時: DEBUG={Config.DEBUG}")

with temporary_config(DEBUG=True, LOG_LEVEL='DEBUG'):
    print(f"with内: DEBUG={Config.DEBUG}, LOG_LEVEL={Config.LOG_LEVEL}")

print(f"復元後: DEBUG={Config.DEBUG}")
```

### 4. リソースプール

```python
from contextlib import contextmanager
from queue import Queue

class ConnectionPool:
    """データベース接続プール"""

    def __init__(self, max_connections=5):
        self.pool = Queue(maxsize=max_connections)
        for _ in range(max_connections):
            self.pool.put(self._create_connection())

    def _create_connection(self):
        # 実際の接続を作成（ここでは簡略化）
        return {"connected": True}

    @contextmanager
    def get_connection(self):
        """プールから接続を取得"""
        conn = self.pool.get()
        print(f"接続を取得（残り: {self.pool.qsize()}）")
        try:
            yield conn
        finally:
            self.pool.put(conn)
            print(f"接続を返却（残り: {self.pool.qsize()}）")

# 使用例
pool = ConnectionPool(max_connections=3)

with pool.get_connection() as conn:
    print(f"接続を使用: {conn}")
    # データベース操作
```

### 5. パフォーマンス監視

```python
from contextlib import contextmanager
import time

@contextmanager
def performance_monitor(threshold_seconds=1.0):
    """処理時間が閾値を超えたら警告"""
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        if elapsed > threshold_seconds:
            print(f"⚠️ 警告: 処理時間が閾値を超過: {elapsed:.2f}秒 > {threshold_seconds}秒")
        else:
            print(f"✅ 処理時間: {elapsed:.2f}秒")

# 使用例
with performance_monitor(threshold_seconds=0.5):
    time.sleep(0.3)  # 高速な処理

with performance_monitor(threshold_seconds=0.5):
    time.sleep(1.0)  # 遅い処理（警告が出る）
```

---

## ベストプラクティス

### 1. 常にリソースをクリーンアップする

```python
# ✅ 良い例：必ずクリーンアップ
@contextmanager
def managed_resource():
    resource = acquire_resource()
    try:
        yield resource
    finally:
        resource.cleanup()  # 必ず実行

# ❌ 悪い例：finallyがない
@contextmanager
def bad_resource():
    resource = acquire_resource()
    yield resource
    resource.cleanup()  # 例外時に実行されない
```

### 2. 例外を適切に処理する

```python
@contextmanager
def proper_exception_handling():
    setup()
    try:
        yield
    except SpecificError as e:
        # 特定のエラーを処理
        handle_error(e)
        # 必要に応じて再送出
        raise
    finally:
        cleanup()  # 常に実行
```

### 3. 戻り値を提供する

```python
# ✅ 良い例：有用なオブジェクトを返す
@contextmanager
def database_cursor(db_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    try:
        yield cursor  # カーソルを提供
        conn.commit()
    except:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

# 使用時
with database_cursor('app.db') as cursor:
    cursor.execute('SELECT * FROM users')
```

### 4. 単一責任の原則

```python
# ❌ 悪い例：複数の責任
@contextmanager
def do_everything():
    open_file()
    connect_database()
    start_server()
    yield
    stop_server()
    disconnect_database()
    close_file()

# ✅ 良い例：責任を分離
@contextmanager
def managed_file():
    f = open_file()
    try:
        yield f
    finally:
        f.close()

@contextmanager
def managed_database():
    conn = connect_database()
    try:
        yield conn
    finally:
        conn.close()

# 組み合わせて使う
with managed_file() as f, managed_database() as db:
    # 処理
    pass
```

### 5. ドキュメントを書く

```python
@contextmanager
def transaction(connection):
    """
    データベーストランザクションを管理するコンテキストマネージャー。

    Args:
        connection: データベース接続オブジェクト

    Yields:
        cursor: データベースカーソル

    Raises:
        DatabaseError: トランザクション処理中のエラー

    Example:
        with transaction(conn) as cursor:
            cursor.execute('INSERT INTO users VALUES (?, ?)', (1, 'Alice'))

    Note:
        - 正常終了時は自動コミット
        - 例外発生時は自動ロールバック
    """
    cursor = connection.cursor()
    try:
        yield cursor
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()
```

---

## クラスベース vs @contextmanager の使い分け

### クラスベースが適している場合

- **状態を保持する必要がある**
- **複数のメソッドを提供したい**
- **再利用可能なリソースを管理する**

```python
class ResourceManager:
    """複雑な状態管理が必要な場合"""

    def __init__(self, config):
        self.config = config
        self.resource = None
        self.stats = {'entries': 0, 'exits': 0}

    def __enter__(self):
        self.resource = self._acquire()
        self.stats['entries'] += 1
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self._release()
        self.stats['exits'] += 1
        return False

    def get_stats(self):
        return self.stats
```

### @contextmanagerが適している場合

- **シンプルなセットアップ/クリーンアップ**
- **一時的な状態変更**
- **簡潔さが重要**

```python
@contextmanager
def simple_manager():
    """シンプルな処理の場合"""
    setup()
    try:
        yield
    finally:
        cleanup()
```

---

## よくある間違いと解決策

### 1. yieldを忘れる

```python
# ❌ 間違い
@contextmanager
def broken_manager():
    setup()
    cleanup()  # yieldがない！

# ✅ 正しい
@contextmanager
def correct_manager():
    setup()
    yield  # 必須！
    cleanup()
```

### 2. finallyを使わない

```python
# ❌ 間違い
@contextmanager
def unsafe_manager():
    resource = acquire()
    yield resource
    resource.release()  # 例外時に実行されない

# ✅ 正しい
@contextmanager
def safe_manager():
    resource = acquire()
    try:
        yield resource
    finally:
        resource.release()  # 必ず実行
```

### 3. 例外を誤って抑制

```python
# ❌ 間違い：すべての例外を抑制
def __exit__(self, exc_type, exc_value, traceback):
    cleanup()
    return True  # すべて抑制（危険）

# ✅ 正しい：必要な例外のみ抑制
def __exit__(self, exc_type, exc_value, traceback):
    cleanup()
    if exc_type is SpecificError:
        return True  # この例外のみ抑制
    return False  # その他は再送出
```

### 4. リソースリーク

```python
# ❌ 間違い
@contextmanager
def leaky_manager():
    file1 = open('file1.txt')
    file2 = open('file2.txt')  # ここで例外が起きたらfile1が閉じられない
    try:
        yield (file1, file2)
    finally:
        file1.close()
        file2.close()

# ✅ 正しい
@contextmanager
def safe_multi_manager():
    with ExitStack() as stack:
        file1 = stack.enter_context(open('file1.txt'))
        file2 = stack.enter_context(open('file2.txt'))
        yield (file1, file2)
```

---

## まとめ

Pythonのコンテキストマネージャーは、**リソース管理を安全かつ簡潔に行う強力な仕組み**です。

### 重要ポイント

**コンテキストマネージャーの基本**:
- `with`文でリソースの自動管理
- `__enter__`でセットアップ、`__exit__`でクリーンアップ
- 例外が発生しても必ずクリーンアップが実行される

**実装方法**:
1. **クラスベース**: `__enter__`と`__exit__`メソッド
2. **@contextmanager**: ジェネレーター関数で簡潔に実装

**contextlibの便利な機能**:
- `@contextmanager`: 簡潔な実装
- `suppress`: 例外の抑制
- `closing`: closeメソッドの自動呼び出し
- `ExitStack`: 動的な複数リソース管理

**ベストプラクティス**:
1. 必ず`finally`または`try-except-finally`を使う
2. 適切な戻り値を提供する
3. 単一責任の原則を守る
4. 例外を慎重に処理する
5. ドキュメントを書く

**よくあるユースケース**:
- ファイル操作
- データベーストランザクション
- ロック管理
- 一時的な状態変更
- ログコンテキスト
- パフォーマンス監視

### 実践のコツ

1. **ファイル操作は常にwithを使う**
2. **カスタムリソースにはコンテキストマネージャーを実装**
3. **@contextmanagerで簡潔に書く**
4. **ExitStackで複数リソースを管理**
5. **テストでリソースリークをチェック**

コンテキストマネージャーをマスターすることで、**安全でバグの少ないPythonコード**が書けるようになります！

### 参考リンク

- **PEP 343 -- The "with" Statement**: https://peps.python.org/pep-0343/
- **contextlib — Utilities for with-statement contexts**: https://docs.python.org/3/library/contextlib.html
- **Python Context Managers**: https://realpython.com/python-with-statement/
- **Writing Context Managers**: https://book.pythontips.com/en/latest/context_managers.html
