---
slug: uv-package-management-guide
title: UV：次世代のPythonパッケージ管理ツール完全ガイド
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - Python
  - 開発ツール
---

Pythonのパッケージ管理ツールとして、**pip**や**Poetry**が広く使われてきましたが、最近注目を集めているのが**UV**です。UVは**Rustで書かれた超高速なPythonパッケージマネージャー**で、既存ツールの問題点を解決する新世代のツールです。この記事では、UVの特徴、インストール方法、実践的な使い方を徹底解説します。

<!--truncate-->

## UVとは何か

**UV**は、Astral社が開発した**Pythonパッケージおよびプロジェクト管理ツール**です。Rustで実装されており、既存のツール（pip、pip-tools、pipx、poetry、pyenv、virtualenvなど）の機能を統合し、圧倒的な速度で動作します。

公式サイト: https://docs.astral.sh/uv/

### UVの特徴

#### 1. 圧倒的な速度

UVは**pip や Poetry と比較して10〜100倍高速**です。Rustで実装されており、並列処理と効率的なキャッシング機構により、パッケージのインストールが劇的に速くなります。

**速度比較の例**:
- pip: 約45秒
- Poetry: 約30秒
- UV: 約0.5秒

#### 2. オールインワンツール

UVは複数のツールの機能を1つに統合しています：

- **パッケージ管理**: pip、pip-toolsの代替
- **仮想環境管理**: venv、virtualenvの代替
- **プロジェクト管理**: Poetryの代替
- **Pythonバージョン管理**: pyenvの代替
- **スクリプト実行**: pipxの代替

#### 3. 依存関係解決の高速化

UVは依存関係の解決を**並列処理**で行い、競合を素早く検出して解決します。大規模なプロジェクトでも、依存関係の解決が数秒で完了します。

#### 4. ロックファイルによる再現性

`uv.lock`ファイルにより、すべての依存関係のバージョンを固定し、どの環境でも同じパッケージ構成を再現できます。

#### 5. 既存ツールとの互換性

`pyproject.toml`や`requirements.txt`など、既存のPythonエコシステムと完全に互換性があります。

---

## UVと既存ツールの比較

| 項目 | pip | Poetry | UV |
|------|-----|--------|-----|
| **速度** | 遅い | 中程度 | 非常に速い（10〜100倍） |
| **実装言語** | Python | Python | Rust |
| **依存関係解決** | 基本的 | 高度 | 高度＋高速 |
| **ロックファイル** | なし（pip-tools必要） | poetry.lock | uv.lock |
| **仮想環境管理** | 別ツール必要 | 統合 | 統合 |
| **Pythonバージョン管理** | なし | なし | あり |
| **プロジェクト管理** | 基本的 | 高度 | 高度 |
| **キャッシング** | 基本的 | あり | 高度 |

---

## UVのインストール

### macOS / Linux

```bash
# curlを使用したインストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# Homebrewを使用したインストール
brew install uv
```

### Windows

```powershell
# PowerShellを使用したインストール
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# wingetを使用したインストール
winget install --id=astral-sh.uv -e
```

### pipを使用したインストール

```bash
pip install uv
```

### インストールの確認

```bash
uv --version
```

---

## UVの基本的な使い方

### 1. 新しいプロジェクトの作成

```bash
# 新しいプロジェクトを作成
uv init my-project
cd my-project
```

これにより、以下のファイルが作成されます：

```
my-project/
├── pyproject.toml  # プロジェクト設定ファイル
├── README.md
└── .python-version # Pythonバージョン指定
```

### 2. パッケージのインストール

#### 個別のパッケージをインストール

```bash
# 最新バージョンをインストール
uv add requests

# 特定のバージョンをインストール
uv add "django>=4.0,<5.0"

# 開発用依存関係としてインストール
uv add --dev pytest black ruff
```

#### requirements.txtからインストール

```bash
# requirements.txtからインストール
uv pip install -r requirements.txt

# またはuvのsync機能を使用
uv sync
```

### 3. 仮想環境の管理

UVは自動的に仮想環境を管理します。

```bash
# 仮想環境を作成して有効化
uv venv

# 特定のPythonバージョンで仮想環境を作成
uv venv --python 3.11

# 仮想環境の有効化（Linux/macOS）
source .venv/bin/activate

# 仮想環境の有効化（Windows）
.venv\Scripts\activate
```

### 4. パッケージの更新と削除

```bash
# パッケージを更新
uv add --upgrade requests

# すべてのパッケージを最新バージョンに更新
uv lock --upgrade

# パッケージを削除
uv remove requests
```

### 5. 依存関係のロック

```bash
# 依存関係を解決してロックファイルを生成
uv lock

# ロックファイルから依存関係をインストール
uv sync
```

### 6. プロジェクトの実行

```bash
# スクリプトを実行
uv run python main.py

# コマンドを実行
uv run pytest

# 依存関係を自動インストールして実行
uv run --with pandas python analyze.py
```

---

## UVの実践的な活用例

### 例1: Djangoプロジェクトのセットアップ

```bash
# 新しいプロジェクトを作成
uv init django-app
cd django-app

# Djangoをインストール
uv add django

# 開発用ツールをインストール
uv add --dev pytest-django black ruff

# Djangoプロジェクトを作成
uv run django-admin startproject config .

# 開発サーバーを起動
uv run python manage.py runserver
```

### 例2: データ分析環境のセットアップ

```bash
# 新しいプロジェクトを作成
uv init data-analysis
cd data-analysis

# データ分析用ライブラリをインストール
uv add pandas numpy matplotlib seaborn jupyter

# Jupyter Notebookを起動
uv run jupyter notebook
```

### 例3: 機械学習プロジェクトのセットアップ

```bash
# 新しいプロジェクトを作成
uv init ml-project
cd ml-project

# 機械学習ライブラリをインストール
uv add scikit-learn tensorflow torch transformers

# 開発用ツールをインストール
uv add --dev pytest mlflow tensorboard

# トレーニングスクリプトを実行
uv run python train.py
```

### 例4: FastAPIアプリケーションのセットアップ

```bash
# 新しいプロジェクトを作成
uv init fastapi-app
cd fastapi-app

# FastAPIと必要なライブラリをインストール
uv add fastapi uvicorn[standard] pydantic sqlalchemy

# 開発用ツールをインストール
uv add --dev pytest httpx black ruff

# アプリケーションを起動
uv run uvicorn main:app --reload
```

---

## pyproject.tomlの設定

UVは`pyproject.toml`を使用してプロジェクトを管理します。

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "My awesome project"
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.31.0",
    "pydantic>=2.0.0",
    "fastapi>=0.104.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]

[tool.uv]
# UVの設定
dev-dependencies = [
    "pytest>=7.4.0",
    "black>=23.0.0",
]

[tool.ruff]
line-length = 100
target-version = "py310"

[tool.black]
line-length = 100
target-version = ['py310']
```

---

## Pythonバージョンの管理

UVは複数のPythonバージョンを管理できます。

```bash
# 利用可能なPythonバージョンを確認
uv python list

# 特定のPythonバージョンをインストール
uv python install 3.11

# プロジェクトで使用するPythonバージョンを指定
uv python pin 3.11

# 現在のPythonバージョンを確認
uv python show
```

---

## キャッシュの管理

UVは効率的なキャッシング機構を持っており、再インストールを高速化します。

```bash
# キャッシュの状態を確認
uv cache dir

# キャッシュをクリア
uv cache clean

# キャッシュサイズを確認
uv cache prune --dry-run
```

---

## CI/CDでのUV活用

### GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Set up Python
        run: uv python install 3.11

      - name: Install dependencies
        run: uv sync

      - name: Run tests
        run: uv run pytest

      - name: Run linter
        run: uv run ruff check .

      - name: Run formatter check
        run: uv run black --check .
```

### GitLab CI

```yaml
test:
  image: python:3.11
  before_script:
    - curl -LsSf https://astral.sh/uv/install.sh | sh
    - export PATH="$HOME/.cargo/bin:$PATH"
  script:
    - uv sync
    - uv run pytest
    - uv run ruff check .
```

### Docker

```dockerfile
FROM python:3.11-slim

# UVをインストール
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルをコピー
COPY pyproject.toml uv.lock ./

# 依存関係をインストール
RUN uv sync --frozen --no-dev

# アプリケーションをコピー
COPY . .

# アプリケーションを実行
CMD ["uv", "run", "python", "main.py"]
```

---

## 既存プロジェクトからの移行

### pipからの移行

```bash
# requirements.txtからpyproject.tomlを生成
uv add $(cat requirements.txt)

# または一括インストール
uv pip install -r requirements.txt
uv pip freeze > requirements.txt
```

### Poetryからの移行

```bash
# pyproject.tomlはそのまま使用可能
# poetry.lockからuv.lockを生成
uv lock

# 依存関係をインストール
uv sync
```

PoetryからUVへの主な変更点：

- `poetry add` → `uv add`
- `poetry install` → `uv sync`
- `poetry run` → `uv run`
- `poetry shell` → `source .venv/bin/activate`（またはuvコマンド経由で実行）

---

## UVの便利な機能

### 1. グローバルツールのインストール

```bash
# グローバルにツールをインストール（pipxの代替）
uv tool install black
uv tool install ruff
uv tool install ipython

# インストールされたツールを確認
uv tool list

# ツールを実行
uv tool run black .
```

### 2. 一時的な環境でのスクリプト実行

```bash
# 一時的な環境でスクリプトを実行
uv run --with requests python script.py

# 複数のパッケージを指定
uv run --with requests --with pandas python analyze.py
```

### 3. スクリプトの依存関係管理

Pythonスクリプトの先頭に依存関係を記述できます：

```python
# /// script
# dependencies = [
#   "requests>=2.31.0",
#   "pandas>=2.0.0",
# ]
# ///

import requests
import pandas as pd

response = requests.get("https://api.example.com/data")
df = pd.DataFrame(response.json())
print(df.head())
```

実行：

```bash
uv run script.py
```

### 4. プラットフォーム固有の依存関係

```toml
[project]
dependencies = [
    "requests>=2.31.0",
]

[tool.uv]
platform = "linux"  # または "macos", "windows"

[project.optional-dependencies]
linux = ["psutil>=5.9.0"]
macos = ["pyobjc>=9.0"]
windows = ["pywin32>=305"]
```

---

## トラブルシューティング

### 依存関係の競合

```bash
# 詳細なログを表示
uv add package-name --verbose

# 依存関係ツリーを表示
uv tree
```

### キャッシュの問題

```bash
# キャッシュをクリアして再インストール
uv cache clean
uv sync --reinstall
```

### 仮想環境の問題

```bash
# 仮想環境を削除して再作成
rm -rf .venv
uv venv
uv sync
```

---

## UVのメリットとデメリット

### メリット

1. **圧倒的な速度**: pip/Poetryの10〜100倍高速
2. **オールインワン**: 複数のツールを1つに統合
3. **Pythonバージョン管理**: pyenv不要
4. **優れた依存関係解決**: 高速かつ正確
5. **既存ツールとの互換性**: 段階的な移行が可能
6. **優れたキャッシング**: ディスク容量を節約
7. **アクティブな開発**: Astral社による継続的な改善

### デメリット

1. **比較的新しいツール**: Poetryほど成熟していない
2. **エコシステムの規模**: Poetryプラグインほど豊富ではない
3. **学習コスト**: 新しいコマンド体系に慣れる必要がある
4. **一部機能の制限**: Poetryの一部高度な機能はまだ未実装

---

## UVを使うべきケース

### UVがおすすめの場合

- **新規プロジェクト**: 最初からUVを使用
- **速度が重要**: CI/CDの高速化が必要
- **シンプルな構成**: ツールを統一したい
- **Pythonバージョン管理**: pyenvを使いたくない
- **モダンな開発環境**: 最新のツールを試したい

### 既存ツールを継続すべき場合

- **大規模な既存プロジェクト**: 移行コストが高い
- **Poetryの高度な機能**: プラグインなどに依存している
- **チーム全体の合意**: チームがPoetryに慣れている
- **安定性重視**: 実績のあるツールを使いたい

---

## まとめ

UVは、Pythonのパッケージ管理における**次世代のツール**です。圧倒的な速度、オールインワンの機能、優れた依存関係解決により、Python開発体験を大幅に向上させます。

### 重要ポイント

**UVの特徴**:
- Rustで実装された超高速パッケージマネージャー
- pip、Poetry、pyenv、pipxの機能を統合
- 10〜100倍高速なパッケージインストール
- `uv.lock`による完全な再現性

**基本コマンド**:
- `uv init` - プロジェクト作成
- `uv add` - パッケージ追加
- `uv sync` - 依存関係インストール
- `uv run` - スクリプト実行
- `uv python install` - Pythonバージョン管理

**活用シーン**:
- 新規プロジェクトの開始
- CI/CDの高速化
- 複数のPythonバージョン管理
- 一時的なスクリプト実行

### 導入ステップ

1. **UVをインストール**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. **新規プロジェクト作成**: `uv init my-project`
3. **パッケージ追加**: `uv add requests pandas`
4. **スクリプト実行**: `uv run python main.py`
5. **CI/CD設定**: GitHub ActionsなどでUVを使用

UVを活用して、より高速で快適なPython開発環境を構築しましょう！

### 参考リンク

- **公式ドキュメント**: https://docs.astral.sh/uv/
- **GitHub**: https://github.com/astral-sh/uv
- **Astral社**: https://astral.sh/
- **比較記事**: https://astral.sh/blog/uv
