---
slug: python-naming-conventions-grammar
title: 英語文法に従うPythonの変数名・関数名の書き方：読みやすいコードの秘訣
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
---

Pythonでコードを書く際、**変数名や関数名の付け方**は可読性に大きく影響します。特に**英語の文法規則に従った命名**をすることで、コードの意図が明確になり、チーム開発での理解が深まります。この記事では、英語文法の観点から、わかりやすい変数名・関数名の書き方を徹底解説します。

<!--truncate-->

## なぜ英語文法に従うべきか

プログラミングは**自然言語（英語）とプログラミング言語の融合**です。英語文法に従った命名をすることで、以下のメリットがあります：

### 1. 直感的な理解
英語のネイティブスピーカーでなくても、基本的な文法規則（名詞、動詞、形容詞など）に従うことで、コードの意味が自然に伝わります。

### 2. 国際的な協業
Pythonは世界中で使われている言語です。英語文法に従うことで、国際的なチームでのコミュニケーションが円滑になります。

### 3. 一貫性の確保
文法規則に従うことで、命名に一貫性が生まれ、コードベース全体の品質が向上します。

---

## 変数名の命名規則：名詞を使う

変数は**データを保持する入れ物**です。英語文法では、物や概念を表すのは**名詞（Noun）**です。したがって、変数名は名詞または名詞句で命名するのが原則です。

### 基本原則

```python
# ✅ 良い例：名詞を使用
user_name = "Alice"
user_age = 25
order_total = 1500
item_count = 10
database_connection = connect_to_db()

# ❌ 悪い例：動詞を使用
calculate_age = 25  # calculateは動詞
process_order = 1500  # processは動詞
```

### 具体的な名詞を使う

抽象的な名前よりも、具体的な名詞の方が意図が明確になります。

```python
# ✅ 良い例：具体的な名詞
email_address = "user@example.com"
product_price = 2980
customer_list = ["Alice", "Bob", "Charlie"]
invoice_date = "2025-10-31"

# ❌ 悪い例：抽象的すぎる
data = "user@example.com"  # 何のデータ?
value = 2980  # 何の値?
items = ["Alice", "Bob", "Charlie"]  # 何のアイテム?
```

### 複数形と単数形の使い分け

**単数形**は単一のオブジェクトを、**複数形**は複数のオブジェクトを表します。

```python
# ✅ 良い例：単数形と複数形を正しく使う
user = {"name": "Alice", "age": 25}  # 単一のユーザー
users = [{"name": "Alice"}, {"name": "Bob"}]  # 複数のユーザー

product = {"id": 1, "name": "Laptop"}  # 単一の商品
products = [{"id": 1}, {"id": 2}]  # 複数の商品

# ❌ 悪い例：複数形と単数形が混乱
user = [{"name": "Alice"}, {"name": "Bob"}]  # userは単数形なのに複数
users = {"name": "Alice"}  # usersは複数形なのに単数
```

### 数量を表す変数

数を表す変数には、`count`、`number`、`total`などの名詞を使います。

```python
# ✅ 良い例：数量を表す名詞
user_count = 100
page_number = 5
order_total = 15000
item_quantity = 3
max_retry_count = 3

# ❌ 悪い例：数量が不明確
users = 100  # usersは複数形なのに数値
page = 5  # ページオブジェクトなのか番号なのか不明
```

---

## 関数名の命名規則：動詞を使う

関数は**アクション（動作）**を表します。英語文法では、動作を表すのは**動詞（Verb）**です。したがって、関数名は動詞または動詞句で命名するのが原則です。

### 基本原則

```python
# ✅ 良い例：動詞で始まる
def calculate_total(items):
    return sum(items)

def fetch_user_data(user_id):
    return database.get(user_id)

def send_email(recipient, message):
    email_service.send(recipient, message)

def validate_input(data):
    return len(data) > 0

# ❌ 悪い例：名詞で始まる
def total(items):  # totalは名詞
    return sum(items)

def user_data(user_id):  # user_dataは名詞
    return database.get(user_id)
```

### よく使う動詞とその意味

| 動詞 | 意味 | 例 |
|------|------|------|
| **get** | データを取得する | `get_user()`, `get_config()` |
| **set** | データを設定する | `set_password()`, `set_theme()` |
| **fetch** | 外部からデータを取得 | `fetch_api_data()`, `fetch_records()` |
| **calculate** | 計算する | `calculate_total()`, `calculate_tax()` |
| **create** | 新しく作成する | `create_user()`, `create_order()` |
| **update** | 既存のものを更新 | `update_profile()`, `update_status()` |
| **delete** | 削除する | `delete_file()`, `delete_account()` |
| **validate** | 検証する | `validate_email()`, `validate_input()` |
| **convert** | 変換する | `convert_to_json()`, `convert_currency()` |
| **parse** | 解析する | `parse_csv()`, `parse_xml()` |
| **format** | 整形する | `format_date()`, `format_phone_number()` |
| **send** | 送信する | `send_notification()`, `send_request()` |
| **process** | 処理する | `process_payment()`, `process_order()` |
| **check** | チェックする | `check_permission()`, `check_availability()` |
| **find** | 探す | `find_user()`, `find_duplicates()` |
| **filter** | 絞り込む | `filter_results()`, `filter_by_date()` |
| **sort** | 並べ替える | `sort_by_price()`, `sort_alphabetically()` |

### 動詞+名詞のパターン

**動詞 + 名詞（または名詞句）**のパターンは、英語の基本文型（SVO: Subject-Verb-Object）に従います。

```python
# ✅ 良い例：動詞 + 名詞
def calculate_discount(price, rate):
    return price * rate

def send_welcome_email(user):
    send_email(user.email, "Welcome!")

def validate_user_input(data):
    return len(data) > 0 and data.isalnum()

def fetch_product_details(product_id):
    return database.query(product_id)

# ❌ 悪い例：名詞だけ
def discount(price, rate):  # 動詞がない
    return price * rate

def welcome_email(user):  # 動詞がない
    send_email(user.email, "Welcome!")
```

---

## Boolean変数・関数の命名規則

Boolean（真偽値）を返す変数や関数は、**疑問文形式**で命名します。英語の疑問文は、`is`、`has`、`can`、`should`などの助動詞で始まります。

### Boolean変数

```python
# ✅ 良い例：疑問文形式
is_active = True
is_authenticated = False
has_permission = True
has_children = False
can_edit = True
can_delete = False
should_retry = True
should_notify = False

# ❌ 悪い例：疑問文形式でない
active = True  # is_activeの方が明確
authenticated = False  # is_authenticatedの方が明確
permission = True  # has_permissionの方が明確
```

### Boolean関数

Boolean値を返す関数も同様に、疑問文形式で命名します。

```python
# ✅ 良い例：疑問文形式
def is_valid_email(email):
    return "@" in email and "." in email

def has_expired(timestamp):
    return datetime.now() > timestamp

def can_access_resource(user, resource):
    return user.role == "admin" or resource.owner == user

def should_send_notification(user):
    return user.notification_enabled and user.is_online

# ❌ 悪い例：疑問文形式でない
def valid_email(email):  # is_valid_emailの方が明確
    return "@" in email

def expired(timestamp):  # has_expiredの方が明確
    return datetime.now() > timestamp
```

### よく使うBoolean接頭辞

| 接頭辞 | 意味 | 例 |
|--------|------|------|
| **is** | 〜である | `is_empty()`, `is_admin()`, `is_active()` |
| **has** | 〜を持っている | `has_permission()`, `has_children()` |
| **can** | 〜できる | `can_edit()`, `can_delete()`, `can_access()` |
| **should** | 〜すべき | `should_retry()`, `should_notify()` |
| **will** | 〜するだろう | `will_expire()`, `will_succeed()` |
| **needs** | 〜が必要 | `needs_update()`, `needs_approval()` |

---

## クラス名の命名規則：名詞（単数形）を使う

クラスは**概念やオブジェクトの型**を表します。したがって、クラス名は**単数形の名詞**で命名します。

```python
# ✅ 良い例：単数形の名詞（PascalCase）
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

class ShoppingCart:
    def __init__(self):
        self.items = []

class EmailService:
    def send(self, recipient, message):
        pass

class DatabaseConnection:
    def connect(self):
        pass

# ❌ 悪い例：複数形や動詞
class Users:  # 複数形は避ける
    pass

class SendEmail:  # 動詞は避ける
    pass
```

---

## 実践的な例：良い命名と悪い命名の比較

### 例1: ユーザー管理システム

```python
# ❌ 悪い例：文法規則に従っていない
def user(id):  # 名詞だけ（動詞がない）
    return db.query(id)

def process(data):  # 抽象的すぎる
    return data * 2

active = check_status()  # Boolean変数なのにis_がない
users_count = get_users()  # 複数形なのに数値を返す

# ✅ 良い例：文法規則に従っている
def get_user(user_id):  # 動詞 + 名詞
    return db.query(user_id)

def calculate_discount(price):  # 動詞 + 名詞
    return price * 0.9

is_active = check_account_status()  # Boolean変数にis_
user_count = count_active_users()  # 数量を明確に
```

### 例2: ECサイトの注文処理

```python
# ❌ 悪い例
class Orders:  # 複数形
    def __init__(self):
        self.order = []  # 単数形と複数形が逆

    def total(self, items):  # 名詞（動詞がない）
        return sum(items)

    def valid(self, order):  # Boolean関数なのにis_がない
        return order.total > 0

# ✅ 良い例
class Order:  # 単数形
    def __init__(self):
        self.items = []  # 複数のアイテム

    def calculate_total(self):  # 動詞 + 名詞
        return sum(item.price for item in self.items)

    def is_valid(self):  # Boolean関数にis_
        return len(self.items) > 0 and self.calculate_total() > 0
```

### 例3: API処理

```python
# ❌ 悪い例
def api(endpoint):  # 名詞だけ
    return requests.get(endpoint)

def data_process(response):  # 名詞 + 動詞（逆）
    return response.json()

success = api_call()  # Boolean変数なのにis_がない

# ✅ 良い例
def fetch_api_data(endpoint):  # 動詞 + 名詞
    return requests.get(endpoint)

def process_response_data(response):  # 動詞 + 名詞
    return response.json()

is_successful = check_api_response()  # Boolean変数にis_
```

---

## よくある間違いと修正例

### 1. 動詞と名詞の混同

```python
# ❌ 悪い例
calculate = 100  # calculateは動詞なのに変数
price = def calculate_price():  # 混乱
    pass

# ✅ 良い例
calculation_result = 100  # 名詞
def calculate_price():  # 関数は動詞
    pass
```

### 2. 曖昧な名前

```python
# ❌ 悪い例
data = fetch_something()  # 何のデータ?
value = calculate()  # 何の値?
temp = x * 2  # tempは避ける

# ✅ 良い例
user_profile = fetch_user_profile()
total_price = calculate_order_total()
discounted_price = original_price * 0.9
```

### 3. 略語の乱用

```python
# ❌ 悪い例
usr = get_usr()  # 略しすぎ
cnt = get_cnt()  # 意味不明
calc_tot = lambda x: sum(x)  # 読みにくい

# ✅ 良い例
user = get_user()  # 明確
count = get_item_count()  # 明確
calculate_total = lambda items: sum(items)  # 明確
```

### 4. 冗長な命名

```python
# ❌ 悪い例
user_user_name = "Alice"  # 冗長
list_of_users = []  # list_ofは不要
get_user_user = lambda: None  # 重複

# ✅ 良い例
user_name = "Alice"
users = []
get_user = lambda user_id: database.get(user_id)
```

---

## PEP 8との整合性

Pythonの公式スタイルガイド**PEP 8**も、英語文法に従った命名を推奨しています。

### 変数名・関数名：snake_case

```python
# ✅ PEP 8準拠
user_name = "Alice"
def calculate_total(items):
    return sum(items)
```

### クラス名：PascalCase

```python
# ✅ PEP 8準拠
class UserProfile:
    pass

class ShoppingCart:
    pass
```

### 定数：UPPER_SNAKE_CASE

```python
# ✅ PEP 8準拠
MAX_RETRY_COUNT = 3
DEFAULT_TIMEOUT = 30
API_BASE_URL = "https://api.example.com"
```

---

## 実践：命名規則チェックリスト

コードレビューやセルフチェックに使える命名規則チェックリスト：

### 変数名
- [ ] 名詞または名詞句を使用している
- [ ] 単数形と複数形を正しく使い分けている
- [ ] 具体的で意味のある名前をつけている
- [ ] Boolean変数には`is_`、`has_`などの接頭辞を使用している

### 関数名
- [ ] 動詞で始まっている
- [ ] 動詞 + 名詞のパターンを使用している
- [ ] 関数の動作を明確に表現している
- [ ] Boolean関数には`is_`、`has_`などの接頭辞を使用している

### クラス名
- [ ] 単数形の名詞を使用している
- [ ] PascalCaseを使用している
- [ ] クラスの役割を明確に表現している

---

## まとめ

英語文法に従った命名規則を守ることで、コードの可読性と保守性が大幅に向上します。

### 重要ポイント

**変数名の原則**:
- **名詞**を使う
- 単数形と複数形を正しく使い分ける
- Boolean変数には`is_`、`has_`などの接頭辞

**関数名の原則**:
- **動詞**で始める
- 動詞 + 名詞のパターン
- Boolean関数には`is_`、`has_`などの接頭辞

**クラス名の原則**:
- 単数形の**名詞**
- PascalCase形式

**文法規則に従うメリット**:
1. 直感的な理解
2. 国際的な協業の円滑化
3. コードベース全体の一貫性

### 実践のコツ

1. **コードを声に出して読む**: 自然な英語に聞こえるか確認
2. **チームでガイドラインを作る**: 一貫した命名規則を共有
3. **コードレビューで確認**: 命名規則のチェックを習慣化
4. **リファクタリングを恐れない**: 悪い名前を見つけたら改善

英語文法に従った命名規則を実践して、誰が読んでも理解しやすいPythonコードを書きましょう！

### 参考リンク

- **PEP 8 -- Style Guide for Python Code**: https://peps.python.org/pep-0008/
- **Google Python Style Guide**: https://google.github.io/styleguide/pyguide.html
- **The Art of Readable Code**: https://www.oreilly.com/library/view/the-art-of/9781449318482/
