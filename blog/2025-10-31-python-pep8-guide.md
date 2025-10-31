---
slug: python-pep8-guide
title: Python PEP 8完全ガイド：読みやすいコードを書くためのコーディング規約
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

Pythonでコードを書いていると、「PEP 8」という言葉を聞いたことがあるかもしれません。**PEP 8は、Pythonコードを読みやすく、一貫性のあるスタイルで書くための公式ガイドライン**です。この記事では、PEP 8の基本から実践的な活用方法まで、初心者にもわかりやすく徹底解説します。

<!--truncate-->

## PEP 8とは何か

**PEP 8（Python Enhancement Proposal 8）**は、Pythonの公式なスタイルガイドです。Pythonの作者であるGuido van Rossumらによって策定され、**Pythonコードの可読性と一貫性を保つための規約**が定められています。

公式ドキュメント: https://peps.python.org/pep-0008/

### なぜPEP 8が重要なのか

**1. 可読性の向上**
- 統一されたスタイルにより、他の人のコードが読みやすくなる
- チーム開発でのコミュニケーションが円滑になる

**2. メンテナンス性の向上**
- 一貫したコードスタイルにより、バグを見つけやすくなる
- コードの変更や拡張が容易になる

**3. プロフェッショナルな印象**
- 業界標準に従うことで、プロフェッショナルなコードとして認められる
- オープンソースプロジェクトへの貢献がしやすくなる

### PEP 8の基本哲学

PEP 8の冒頭には、「**コードは書かれるよりも読まれることの方が多い**」という重要な原則が記されています。つまり、読みやすさを最優先にすべきということです。

また、「**一貫性の愚かさは、小さな心の悩みの種である**（A Foolish Consistency is the Hobgoblin of Little Minds）」という言葉もあり、盲目的にルールに従うのではなく、状況に応じて柔軟に判断することも推奨されています。

---

## PEP 8の主要なルール

### 1. インデント（字下げ）

Pythonではインデントが文法的に重要です。

```python
# ✅ 良い例: 4つのスペースでインデント
def calculate_total(items):
    total = 0
    for item in items:
        total += item.price
    return total

# ❌ 悪い例: タブとスペースの混在
def calculate_total(items):
	total = 0  # タブを使用
    for item in items:  # スペースを使用
        total += item.price
    return total
```

**ルール**:
- **4つのスペース**を使用する（タブは使わない）
- 継続行は垂直に揃える

```python
# ✅ 良い例: 関数の引数を揃える
def long_function_name(
        var_one, var_two, var_three,
        var_four):
    print(var_one)

# ✅ 良い例: ハンギングインデント
result = some_function_that_takes_arguments(
    'argument1',
    'argument2',
    'argument3'
)
```

### 2. 1行の最大文字数

**1行は最大79文字**（ドキュメント文字列やコメントは72文字）を推奨します。

```python
# ✅ 良い例: 長い行を分割
with open('/path/to/some/file/you/want/to/read') as file_1, \
     open('/path/to/some/file/being/written', 'w') as file_2:
    file_2.write(file_1.read())

# ✅ 良い例: リストを複数行に分割
my_very_long_list = [
    'item1', 'item2', 'item3',
    'item4', 'item5', 'item6'
]

# ❌ 悪い例: 長すぎる行
result = some_function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11)
```

**なぜ79文字？**
- 狭いディスプレイでもコードが横スクロールせずに表示できる
- 複数のファイルを並べて表示できる
- コードレビューツールで見やすい

### 3. 空行の使い方

適切な空行により、コードの構造が明確になります。

```python
# ✅ 良い例: 適切な空行
class MyClass:
    """クラスのドキュメント文字列"""

    def __init__(self):
        self.value = 0

    def method_one(self):
        """最初のメソッド"""
        return self.value

    def method_two(self):
        """2番目のメソッド"""
        return self.value * 2


def standalone_function():
    """スタンドアロン関数"""
    pass


def another_function():
    """別の関数"""
    pass
```

**ルール**:
- トップレベルの関数やクラスは**2行の空行**で区切る
- クラス内のメソッドは**1行の空行**で区切る
- 関数内では論理的なまとまりで空行を使用（控えめに）

### 4. インポート

インポートは常にファイルの先頭に配置します。

```python
# ✅ 良い例: 標準的なインポートの順序
# 1. 標準ライブラリ
import os
import sys

# 2. サードパーティライブラリ
import numpy as np
import pandas as pd
from django.http import HttpResponse

# 3. ローカルアプリケーション/ライブラリ
from myapp.models import User
from myapp.utils import helper_function

# ❌ 悪い例: 複数のインポートを1行で
import os, sys, json

# ✅ 良い例: 別々の行でインポート
import os
import sys
import json

# ✅ 良い例: fromを使った複数インポート
from typing import Dict, List, Optional
```

**ルール**:
- インポートは常に別々の行に書く
- インポートの順序: 標準ライブラリ → サードパーティ → ローカル
- 各グループ間は空行で区切る
- ワイルドカードインポート（`from module import *`）は避ける

### 5. 命名規則

命名規則はコードの可読性に大きく影響します。

```python
# ✅ 良い例: 適切な命名規則

# クラス名: PascalCase（大文字始まりのキャメルケース）
class UserAccount:
    pass

class HTTPConnection:
    pass

# 関数名・変数名: snake_case（小文字とアンダースコア）
def calculate_total_price():
    pass

user_name = "Alice"
total_count = 100

# 定数: UPPER_SNAKE_CASE（大文字とアンダースコア）
MAX_CONNECTIONS = 100
DEFAULT_TIMEOUT = 30

# プライベート変数: 先頭にアンダースコア
class MyClass:
    def __init__(self):
        self._internal_value = 0  # プライベート変数
        self.__private_value = 1  # ネームマングリング

# ❌ 悪い例: 不適切な命名
class user_account:  # クラスはPascalCase
    pass

def CalculateTotal():  # 関数はsnake_case
    pass

UserName = "Alice"  # 変数はsnake_case
TOTAL_COUNT = 100  # 変数で定数形式は使わない（定数でない場合）
```

**命名規則まとめ**:

| 対象 | 規則 | 例 |
|------|------|-----|
| クラス | PascalCase | `UserAccount`, `HTTPServer` |
| 関数 | snake_case | `calculate_total`, `get_user` |
| 変数 | snake_case | `user_name`, `total_count` |
| 定数 | UPPER_SNAKE_CASE | `MAX_SIZE`, `DEFAULT_VALUE` |
| プライベート | _先頭アンダースコア | `_internal_method` |
| モジュール | snake_case | `my_module.py` |

### 6. スペースの使い方

スペースの適切な使用により、コードが読みやすくなります。

```python
# ✅ 良い例: 演算子の周りにスペース
x = 1
y = 2
result = x + y
is_valid = x == y

# ❌ 悪い例: スペースが不適切
x=1
y = 2
result = x+y

# ✅ 良い例: カンマの後にスペース
my_list = [1, 2, 3, 4, 5]
my_dict = {'key': 'value', 'name': 'Alice'}

# ❌ 悪い例: カンマの後にスペースなし
my_list = [1,2,3,4,5]

# ✅ 良い例: 関数呼び出し
print(x, y)
result = some_function(arg1, arg2)

# ❌ 悪い例: 括弧の内側にスペース
print( x, y )
result = some_function (arg1, arg2)

# ✅ 良い例: キーワード引数
def function(arg1, arg2=None):
    pass

function(1, arg2=2)

# ❌ 悪い例: キーワード引数の=の周りにスペース
def function(arg1, arg2 = None):
    pass

function(1, arg2 = 2)
```

**スペースのルール**:
- 演算子の前後には**スペースを入れる**
- カンマの後には**スペースを入れる**（前には入れない）
- 括弧の内側には**スペースを入れない**
- キーワード引数の`=`の周りには**スペースを入れない**

### 7. コメントとドキュメント文字列

適切なコメントはコードの理解を助けます。

```python
# ✅ 良い例: 関数のドキュメント文字列
def calculate_tax(amount, tax_rate):
    """
    税額を計算します。

    Args:
        amount (float): 税抜き金額
        tax_rate (float): 税率（例: 0.1は10%）

    Returns:
        float: 税込み金額

    Examples:
        >>> calculate_tax(1000, 0.1)
        1100.0
    """
    return amount * (1 + tax_rate)

# ✅ 良い例: クラスのドキュメント文字列
class UserAccount:
    """
    ユーザーアカウントを管理するクラス。

    Attributes:
        username (str): ユーザー名
        email (str): メールアドレス
        is_active (bool): アカウントが有効かどうか
    """

    def __init__(self, username, email):
        self.username = username
        self.email = email
        self.is_active = True

# ✅ 良い例: インラインコメント（控えめに）
x = x + 1  # 境界値を補正

# ❌ 悪い例: 不要なコメント
x = x + 1  # xに1を足す（コードを見れば明らか）

# ✅ 良い例: ブロックコメント
# この部分は複雑なアルゴリズムを実装しています。
# まず、データを正規化してから、
# 機械学習モデルに渡します。
normalized_data = normalize(raw_data)
predictions = model.predict(normalized_data)
```

**コメントのルール**:
- コメントは完全な文で書く
- ブロックコメントは`#`の後にスペース
- インラインコメントはコードの2つ以上のスペース後に配置
- **自明なことはコメントしない**
- ドキュメント文字列（docstring）は`"""`で囲む

---

## 実践的なPEP 8の例

### 良い例：PEP 8に準拠したコード

```python
"""
ユーザー管理モジュール

このモジュールはユーザーアカウントの作成、
更新、削除を管理します。
"""

from typing import Optional, List
import re


class UserValidator:
    """ユーザー情報のバリデーションを行うクラス"""

    EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    MIN_PASSWORD_LENGTH = 8

    @classmethod
    def validate_email(cls, email: str) -> bool:
        """
        メールアドレスの形式を検証します。

        Args:
            email: 検証するメールアドレス

        Returns:
            有効な場合True、無効な場合False
        """
        if not email:
            return False
        return bool(re.match(cls.EMAIL_PATTERN, email))

    @classmethod
    def validate_password(cls, password: str) -> bool:
        """
        パスワードの強度を検証します。

        Args:
            password: 検証するパスワード

        Returns:
            有効な場合True、無効な場合False
        """
        if len(password) < cls.MIN_PASSWORD_LENGTH:
            return False

        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)

        return has_upper and has_lower and has_digit


class User:
    """ユーザーアカウントを表すクラス"""

    def __init__(
            self,
            username: str,
            email: str,
            password: str,
            is_active: bool = True):
        """
        ユーザーインスタンスを初期化します。

        Args:
            username: ユーザー名
            email: メールアドレス
            password: パスワード
            is_active: アカウントが有効かどうか（デフォルト: True）
        """
        self.username = username
        self.email = email
        self._password = password
        self.is_active = is_active

    def change_password(self, new_password: str) -> bool:
        """
        パスワードを変更します。

        Args:
            new_password: 新しいパスワード

        Returns:
            変更が成功した場合True、失敗した場合False
        """
        if not UserValidator.validate_password(new_password):
            return False

        self._password = new_password
        return True

    def deactivate(self) -> None:
        """アカウントを無効化します。"""
        self.is_active = False

    def activate(self) -> None:
        """アカウントを有効化します。"""
        self.is_active = True


def create_user(
        username: str,
        email: str,
        password: str) -> Optional[User]:
    """
    新しいユーザーを作成します。

    Args:
        username: ユーザー名
        email: メールアドレス
        password: パスワード

    Returns:
        作成されたUserオブジェクト。検証に失敗した場合はNone
    """
    if not UserValidator.validate_email(email):
        print(f"無効なメールアドレス: {email}")
        return None

    if not UserValidator.validate_password(password):
        print("パスワードが弱すぎます")
        return None

    return User(username, email, password)


def get_active_users(users: List[User]) -> List[User]:
    """
    有効なユーザーのリストを取得します。

    Args:
        users: ユーザーのリスト

    Returns:
        有効なユーザーのリスト
    """
    return [user for user in users if user.is_active]
```

### 悪い例：PEP 8に違反したコード

```python
# ❌ 悪い例: PEP 8違反が多数

import re,sys,os  # 複数のインポートを1行で

class user:  # クラス名がsnake_case
    def __init__(self,username,email,password,is_active=True):  # スペースがない
        self.username=username  # スペースがない
        self.email=email
        self._password=password
        self.is_active=is_active

    def ChangePassword(self,newPassword):  # 関数名がPascalCase
        if len(newPassword)<8:  # スペースがない
            return False
        self._password=newPassword
        return True

def CreateUser(username,email,password):  # 関数名がPascalCase
    # コメントの後にスペースがない
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',email):
        return None
    return user(username,email,password)

MAX_users = 100  # 定数なのにsnake_caseが混在
activeUsers=[]  # 変数がキャメルケース
```

---

## PEP 8チェックツール

### 1. flake8

最も人気のあるPEP 8チェックツールです。

```bash
# インストール
pip install flake8

# 使い方
flake8 your_file.py

# 特定のディレクトリをチェック
flake8 src/

# 設定ファイル（.flake8またはsetup.cfg）
[flake8]
max-line-length = 100
exclude = .git,__pycache__,venv
ignore = E203,W503
```

### 2. pylint

より厳格なチェックとコード品質の評価を行います。

```bash
# インストール
pip install pylint

# 使い方
pylint your_file.py

# 設定ファイル（.pylintrc）
[MASTER]
max-line-length=100

[MESSAGES CONTROL]
disable=C0111
```

### 3. black

**自動フォーマッター**です。PEP 8に準拠したコードに自動で整形します。

```bash
# インストール
pip install black

# 使い方
black your_file.py

# ディレクトリ全体をフォーマット
black src/

# 確認だけ（変更しない）
black --check your_file.py

# 設定ファイル（pyproject.toml）
[tool.black]
line-length = 100
target-version = ['py310']
```

### 4. autopep8

PEP 8違反を自動修正します。

```bash
# インストール
pip install autopep8

# 使い方
autopep8 --in-place --aggressive --aggressive your_file.py
```

### 5. ruff

Rust製の高速リンター・フォーマッターです。

```bash
# インストール
pip install ruff

# リント
ruff check .

# 自動修正
ruff check --fix .

# フォーマット
ruff format .
```

---

## エディタ・IDEでのPEP 8サポート

### VS Code

**拡張機能のインストール**:
- **Python** (Microsoft公式)
- **Pylance**
- **Black Formatter**
- **Ruff**

**settings.json**:

```json
{
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.linting.pylintEnabled": false,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "python.linting.flake8Args": [
    "--max-line-length=100"
  ]
}
```

### PyCharm

PyCharmはデフォルトでPEP 8チェックが有効になっています。

**設定方法**:
1. `Settings` → `Editor` → `Code Style` → `Python`
2. `Right margin (columns)`: 79または100に設定
3. `Settings` → `Editor` → `Inspections` → `Python` → `PEP 8 coding style violation`を有効化

**ショートカット**:
- `Ctrl + Alt + L` (Windows/Linux) / `Cmd + Option + L` (Mac): コードフォーマット

### Vim/Neovim

プラグインを使用してPEP 8チェックを有効化:

```vim
" .vimrcまたはinit.vim
Plug 'psf/black'
Plug 'dense-analysis/ale'

" ALE設定
let g:ale_linters = {'python': ['flake8', 'pylint']}
let g:ale_fixers = {'python': ['black', 'autopep8']}
let g:ale_fix_on_save = 1
```

---

## PEP 8のベストプラクティス

### 1. チーム全体で統一する

```toml
# pyproject.toml - プロジェクト全体の設定
[tool.black]
line-length = 100
target-version = ['py310']

[tool.ruff]
line-length = 100
target-version = "py310"

[tool.isort]
profile = "black"
line_length = 100
```

### 2. プリコミットフックを使用

**pre-commit**を使って、コミット前に自動チェックします。

```bash
# インストール
pip install pre-commit

# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.0
    hooks:
      - id: black
        language_version: python3.10

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
      - id: flake8
        args: [--max-line-length=100]

# フックをインストール
pre-commit install
```

### 3. CI/CDに組み込む

**GitHub Actions**:

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          pip install black ruff flake8
      - name: Check with Black
        run: black --check .
      - name: Check with Ruff
        run: ruff check .
      - name: Check with Flake8
        run: flake8 .
```

### 4. 段階的に導入する

既存プロジェクトでは、一度にすべて修正するのではなく、段階的に導入します。

```bash
# 新しいコードのみをチェック
git diff main | flake8 --diff

# 自動修正できる部分のみ修正
black --check src/
ruff check --fix src/

# 優先度の高い違反から修正
flake8 --select=E,W src/  # まずエラーと警告のみ
```

---

## PEP 8を破っても良いとき

PEP 8は絶対的なルールではありません。以下の場合は例外が認められます。

### 1. 既存コードとの一貫性

```python
# 既存のコードベースがキャメルケースを使用している場合
def existingFunction():  # 既存の関数
    pass

def newFunction():  # 新しい関数も同じスタイルに合わせる
    pass
```

### 2. 後方互換性

```python
# 公開APIの関数名を変更すると破壊的変更になる
def OldFunctionName():  # PEP 8違反だが、互換性のため維持
    pass
```

### 3. 可読性の向上

```python
# ✅ 数学的な式では、可読性のためスペースを調整することがある
# 演算子の優先順位を視覚的に表現
result = x*x + y*y
hypot = (x**2 + y**2)**0.5

# 行列の整列
matrix = [
    [1,  0,  0],
    [0,  1,  0],
    [0,  0,  1],
]
```

### 4. 特定のフレームワークの慣習

```python
# Djangoではモデルクラスで大文字の定数を使うことがある
class User(models.Model):
    ROLE_ADMIN = 'admin'
    ROLE_USER = 'user'

    role = models.CharField(max_length=10)
```

---

## よくある質問

### Q1: タブとスペース、どちらを使うべきか？

**A: スペースを使用してください。** PEP 8では4つのスペースを推奨しています。Pythonはタブとスペースの混在を許可していますが、Python 3ではエラーになります。

### Q2: 行の長さは79文字と100文字、どちらが良い？

**A: プロジェクトで統一すればどちらでも構いません。** 現代的なプロジェクトでは100文字や120文字を採用することも多いです。重要なのはチーム内で統一することです。

### Q3: Blackを使えば他のツールは不要？

**A: Blackは整形のみで、論理的なエラーは検出しません。** Blackと併用して、flake8やruffでリントチェックを行うことを推奨します。

### Q4: 既存プロジェクトにPEP 8を適用するには？

**A: 段階的に適用しましょう。** まずは新しいコードから始め、自動修正ツール（BlackやRuff）を使って少しずつ修正していくのが現実的です。

### Q5: PEP 8違反があるとコードは動かない？

**A: 動きます。** PEP 8はスタイルガイドであり、文法エラーではありません。しかし、可読性とメンテナンス性のために従うことが推奨されます。

---

## まとめ

PEP 8は、Pythonコードを**読みやすく、一貫性のあるスタイル**で書くための重要なガイドラインです。

### 重要ポイント

**PEP 8の基本ルール**:
- **インデント**: 4つのスペースを使用
- **行の長さ**: 最大79文字（または100文字）
- **命名規則**: クラスはPascalCase、関数・変数はsnake_case
- **インポート**: 標準ライブラリ → サードパーティ → ローカルの順
- **スペース**: 演算子の周りにスペース、括弧内はスペースなし

**推奨ツール**:
- **Black**: 自動フォーマッター（最も手軽）
- **Ruff**: 高速リンター＆フォーマッター
- **flake8**: PEP 8チェッカー
- **pre-commit**: コミット前の自動チェック

**導入ステップ**:
1. **エディタにリンターを設定**: VS CodeやPyCharmの設定
2. **自動フォーマッターを導入**: Blackまたはruff format
3. **プリコミットフックを設定**: pre-commitで自動チェック
4. **CI/CDに組み込む**: GitHub Actionsで継続的にチェック
5. **チーム内で統一**: pyproject.tomlで設定を共有

### 最後に

PEP 8は絶対的なルールではなく、**より良いコードを書くための指針**です。重要なのは、チーム内で一貫したスタイルを保ち、コードの可読性を高めることです。

まずは自動フォーマッター（Black）を導入して、**「スタイルについて考える時間」を減らし、「ロジックについて考える時間」を増やす**ことから始めましょう！

### 参考リンク

- **PEP 8公式**: https://peps.python.org/pep-0008/
- **PEP 8日本語訳**: https://pep8-ja.readthedocs.io/ja/latest/
- **Black**: https://black.readthedocs.io/
- **Ruff**: https://docs.astral.sh/ruff/
- **flake8**: https://flake8.pycqa.org/
- **pre-commit**: https://pre-commit.com/
