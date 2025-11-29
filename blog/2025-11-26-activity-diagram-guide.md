---
slug: activity-diagram-guide
title: アクティビティ図の書き方完全ガイド - フローチャートとの違いとLLMワークフロー実例
authors:
  name: Tech Writer
  title: ソフトウェアエンジニア
  url: https://example.com/authors/tech-writer
  image_url: https://avatars.githubusercontent.com/u/3?v=4
---

システムの振る舞いや業務プロセスを視覚化する手法として「アクティビティ図」があります。フローチャートと混同されがちですが、両者には明確な違いがあります。本記事では、アクティビティ図の基本から実践的な書き方、フローチャートとの違い、そしてLLMワークフローを題材にした実例まで詳しく解説します。

<!--truncate-->

## アクティビティ図とは

アクティビティ図（Activity Diagram）は、UML（統一モデリング言語）で定義されている行動図の一種です。システムやビジネスプロセスにおける**一連のアクティビティ（活動）の流れ**を視覚的に表現します。

### アクティビティ図の特徴

アクティビティ図は、以下の特徴を持ちます：

- **並行処理の表現**: フォーク（分岐）とジョイン（合流）で並列処理を明示
- **オブジェクトフローの表現**: データの流れを可視化
- **スイムレーン**: 責任の所在を明確に区分
- **例外処理**: 割り込みや例外フローの表現が可能
- **階層化**: 複雑な処理をサブアクティビティとして分割可能

以下は、シンプルなアクティビティ図の例です：

```mermaid
flowchart TD
    Start((●)) --> A[タスクを開始する]
    A --> B{条件を確認}
    B -->|条件成立| C[処理Aを実行]
    B -->|条件不成立| D[処理Bを実行]
    C --> E[結果を保存]
    D --> E
    E --> End((◎))
```

## フローチャートとアクティビティ図の違い

フローチャートとアクティビティ図は見た目が似ていますが、その目的と表現力に大きな違いがあります。

### 比較表

| 観点 | フローチャート | アクティビティ図 |
|------|--------------|----------------|
| **起源** | 1920年代〜（工業工学） | 1997年〜（UML） |
| **標準化** | ISO 5807、JIS X 0121 | UML 2.x（OMG標準） |
| **並行処理** | 表現困難 | フォーク/ジョインで明示的に表現 |
| **責任の分離** | 表現困難 | スイムレーンで明示 |
| **オブジェクト** | データの流れは限定的 | オブジェクトノードで明示 |
| **例外処理** | 条件分岐で表現 | 割り込み領域で明示的に表現 |
| **主な用途** | アルゴリズム、単純な処理 | 業務プロセス、システムの振る舞い |
| **粒度** | 詳細な処理ステップ | 抽象的なアクティビティ |

### 具体的な違い

#### 1. 並行処理の表現

**フローチャート**では、並行処理を明示的に表現する標準的な記号がありません。処理が順番に実行されることを前提としています。

```mermaid
flowchart LR
    subgraph フローチャート
        A1[処理A] --> B1[処理B] --> C1[処理C] --> D1[処理D]
    end
```

**アクティビティ図**では、**フォークバー**で処理を分岐させ、**ジョインバー**で合流させることで、並行処理を明確に表現できます。

```mermaid
flowchart TB
    subgraph アクティビティ図
        A2[処理A] --> Fork[/ 並行処理開始 /]
        Fork --> B2[処理B]
        Fork --> C2[処理C]
        B2 --> Join[\ 並行処理終了 \]
        C2 --> Join
        Join --> D2[処理D]
    end
```

#### 2. 責任の分離（スイムレーン）

**フローチャート**では、誰がその処理を担当するかを図中に明示する標準的な方法がありません。

**アクティビティ図**では、**スイムレーン**（またはパーティション）を使って、各アクティビティの担当者・担当システムを視覚的に分離できます。

```mermaid
flowchart TB
    subgraph Customer["顧客"]
        A[注文する]
    end
    subgraph System["システム"]
        B[在庫確認]
        D[決済処理]
    end
    subgraph Inventory["在庫管理"]
        C[在庫引き当て]
    end

    A --> B
    B --> C
    C --> D
```

#### 3. オブジェクトフロー

**フローチャート**はデータの流れを表現することが主目的ではなく、処理の流れに焦点を当てています。

**アクティビティ図**では、**オブジェクトノード**を使って、アクティビティ間で受け渡されるデータや成果物を明示できます。

```mermaid
flowchart LR
    A[注文を作成] --> OrderData[(注文データ)]
    OrderData --> B[在庫を確認]
    B --> StockResult[(在庫結果)]
    StockResult --> C[決済を実行]
```

## アクティビティ図の基本要素

アクティビティ図を構成する主要な要素を解説します。

### 1. 開始ノード・終了ノード

```mermaid
flowchart LR
    Start((●)) -->|開始ノード| A[処理]
    A --> End1((◎))
    End1 -->|終了ノード| X1[ ]
    A --> End2((✕))
    End2 -->|フロー終了| X2[ ]

    style X1 fill:none,stroke:none
    style X2 fill:none,stroke:none
```

- **開始ノード（●）**: アクティビティの開始点。1つのダイアグラムに1つ
- **終了ノード（◎）**: アクティビティ全体の終了。すべてのフローが終了
- **フロー終了ノード（✕）**: 特定のフローのみ終了。他のフローは継続

### 2. アクションノード

```mermaid
flowchart LR
    A[注文を処理する] --> B[在庫を確認する] --> C[決済を実行する]
```

実際の処理・作業を表す角丸四角形です。動詞を使って「何をするか」を記述します。

### 3. 決定ノード・マージノード

```mermaid
flowchart TD
    A[入力を受け取る] --> Decision{条件判定}
    Decision -->|Yes| B[処理A]
    Decision -->|No| C[処理B]
    B --> Merge{マージ}
    C --> Merge
    Merge --> D[次の処理]
```

- **決定ノード**: ひし形で表し、条件によって処理を分岐
- **マージノード**: 複数のフローを1つに合流

### 4. フォーク・ジョイン（並行処理）

```mermaid
flowchart TD
    A[前処理] --> Fork[/ フォーク：並行処理開始 /]
    Fork --> B[処理A]
    Fork --> C[処理B]
    Fork --> D[処理C]
    B --> Join[\ ジョイン：並行処理終了 \]
    C --> Join
    D --> Join
    Join --> E[後処理]
```

- **フォーク**: 1つのフローを複数の並行フローに分割
- **ジョイン**: 複数の並行フローを1つに合流（すべて完了を待つ）

### 5. スイムレーン（パーティション）

```mermaid
flowchart TB
    subgraph Sales["営業部"]
        A[見積を作成]
        D[契約締結]
    end
    subgraph Finance["経理部"]
        B[与信審査]
        C[請求書発行]
    end

    A --> B
    B --> D
    D --> C
```

責任や役割ごとにアクティビティを分離して配置します。

### 6. オブジェクトノード（データフロー）

```mermaid
flowchart LR
    A[注文を作成] --> Data1[(注文書\n作成済)]
    Data1 --> B[承認を依頼]
    B --> Data2[(注文書\n承認済)]
    Data2 --> C[発注を実行]
```

アクティビティ間で受け渡されるデータや成果物を表します。状態を示すことも可能です。

## 基本的なアクティビティ図の例

### 例1: シンプルな注文処理フロー

```mermaid
flowchart TD
    Start((●)) --> Input[注文を受け付ける]
    Input --> Validate{入力チェック}
    Validate -->|OK| Stock[在庫を確認]
    Validate -->|NG| Error[エラー通知]
    Error --> End1((◎))

    Stock --> StockCheck{在庫あり?}
    StockCheck -->|Yes| Reserve[商品を確保]
    StockCheck -->|No| Backorder[入荷待ち登録]
    Backorder --> Notify[顧客に通知]
    Notify --> End2((◎))

    Reserve --> Payment[決済処理]
    Payment --> PayCheck{決済成功?}
    PayCheck -->|Yes| Ship[発送準備]
    PayCheck -->|No| Cancel[注文キャンセル]
    Cancel --> End3((◎))

    Ship --> Complete[発送完了通知]
    Complete --> End4((◎))
```

### 例2: 承認ワークフロー（スイムレーン付き）

```mermaid
flowchart TB
    subgraph Applicant["申請者"]
        Start((●)) --> Create[申請書を作成]
        Revise[申請を修正]
        Done[完了通知を受領]
        Done --> End1((◎))
    end

    subgraph Manager["上長"]
        Review[申請を確認]
        Decision{承認?}
    end

    subgraph Admin["管理部門"]
        Process[処理を実行]
        Notify[完了通知を送信]
    end

    Create --> Review
    Review --> Decision
    Decision -->|承認| Process
    Decision -->|差戻し| Revise
    Revise --> Review
    Process --> Notify
    Notify --> Done
```

### 例3: 並行処理を含むデータ処理

```mermaid
flowchart TD
    Start((●)) --> Load[データを読み込む]
    Load --> Fork1[/ 並行処理開始 /]

    Fork1 --> ValidateA[フォーマット検証]
    Fork1 --> ValidateB[整合性チェック]
    Fork1 --> ValidateC[重複チェック]

    ValidateA --> Join1[\ 並行処理終了 \]
    ValidateB --> Join1
    ValidateC --> Join1

    Join1 --> Merge[結果をマージ]
    Merge --> HasError{エラーあり?}

    HasError -->|Yes| Report[エラーレポート生成]
    Report --> End1((◎))

    HasError -->|No| Transform[データ変換]
    Transform --> Save[データベースに保存]
    Save --> End2((◎))
```

## LLMワークフローをアクティビティ図で表現する

ここからは、実際のLLM（大規模言語モデル）を活用したワークフローをアクティビティ図で表現してみます。

### ユースケース1: RAGベースの技術ドキュメントQ&Aシステム

社内の技術ドキュメントに対して自然言語で質問し、関連情報を検索して回答を生成するRAG（Retrieval-Augmented Generation）システムです。

```mermaid
flowchart TB
    subgraph User["ユーザー"]
        Start((●)) --> Input[質問を入力]
        Display[回答を表示]
        Display --> Feedback{満足?}
        Feedback -->|Yes| End1((◎))
        Feedback -->|No| Input
    end

    subgraph QueryProcessor["クエリ処理エンジン"]
        Input --> Analyze[クエリ分析]
        Analyze --> Intent[意図抽出]
        Intent --> Keywords[キーワード抽出]
        Keywords --> Expand[クエリ拡張]
        Expand --> Synonyms[同義語追加]
        Synonyms --> Vectorize[ベクトル化]
    end

    subgraph SearchEngine["検索エンジン"]
        Vectorize --> VectorSearch[ベクトル検索]
        VectorSearch --> KeywordSearch[キーワード検索]
        KeywordSearch --> HybridMerge[ハイブリッドマージ]
        HybridMerge --> ResultCheck{結果あり?}
        ResultCheck -->|Yes| Rerank[リランキング]
        Rerank --> TopK[Top-K選択]
    end

    subgraph LLMAgent["LLMエージェント"]
        ResultCheck -->|No| NoResult[該当なし回答生成]
        TopK --> BuildContext[コンテキスト構築]
        BuildContext --> PromptGen[プロンプト生成]
        PromptGen --> Generate[LLM回答生成]
        Generate --> Stream[ストリーミング出力]
        Stream --> QualityCheck{品質OK?}
        QualityCheck -->|NG| Regenerate[プロンプト調整]
        Regenerate --> Generate
        QualityCheck -->|OK| AddSources[参照元を付与]
        NoResult --> Display
        AddSources --> Display
    end
```

### ユースケース2: AIコードレビューエージェント

プルリクエストが作成されたときに自動でコードレビューを行うAIエージェントのワークフローです。

```mermaid
flowchart TB
    Start((●)) --> Trigger[PRイベント受信]
    Trigger --> GetDiff[PR差分を取得]
    GetDiff --> ParseFiles[変更ファイルを解析]
    ParseFiles --> Classify[言語・種別を分類]

    Classify --> Fork1[/ 並行レビュー開始 /]

    subgraph SecurityReview["セキュリティレビュー"]
        Fork1 --> S1[脆弱性パターン検出]
        S1 --> S2[シークレット検出]
        S2 --> S3[依存関係チェック]
        S3 --> SecurityResult[(セキュリティ指摘)]
    end

    subgraph QualityReview["品質レビュー"]
        Fork1 --> Q1[コード規約チェック]
        Q1 --> Q2[複雑度分析]
        Q2 --> Q3[重複コード検出]
        Q3 --> QualityResult[(品質指摘)]
    end

    subgraph PerfReview["パフォーマンスレビュー"]
        Fork1 --> P1[N+1クエリ検出]
        P1 --> P2[メモリ使用分析]
        P2 --> P3[アルゴリズム効率]
        P3 --> PerfResult[(パフォーマンス指摘)]
    end

    SecurityResult --> Join1[\ 並行レビュー終了 \]
    QualityResult --> Join1
    PerfResult --> Join1

    Join1 --> Aggregate[結果を統合]
    Aggregate --> Dedupe[重複を排除]
    Dedupe --> Prioritize[優先度付け]

    Prioritize --> HasIssues{指摘あり?}
    HasIssues -->|Yes| GenComments[コメント生成]
    HasIssues -->|No| Approve[承認コメント生成]

    GenComments --> FormatComments[行コメント形式に整形]
    FormatComments --> Summary[サマリー作成]
    Summary --> Post[PRに投稿]
    Approve --> Post

    Post --> End1((◎))
```

### ユースケース3: マルチエージェント文書作成システム

複数のAIエージェントが協調して技術文書を作成するワークフローです。

```mermaid
flowchart TB
    Start((●)) --> Requirements[要件入力]

    subgraph Planner["プランナーエージェント"]
        Requirements --> AnalyzeReq[要件分析]
        AnalyzeReq --> DefineScope[スコープ定義]
        DefineScope --> CreateOutline[アウトライン生成]
        CreateOutline --> AssignTasks[タスク割り当て]
    end

    AssignTasks --> Fork2[/ 並行執筆開始 /]

    subgraph Writers["ライターエージェント群"]
        Fork2 --> W1[導入部\nライター]
        Fork2 --> W2[技術詳細\nライター]
        Fork2 --> W3[実装例\nライター]
        Fork2 --> W4[まとめ\nライター]

        W1 --> D1[(導入ドラフト)]
        W2 --> D2[(詳細ドラフト)]
        W3 --> D3[(実装例ドラフト)]
        W4 --> D4[(まとめドラフト)]
    end

    D1 --> Join2[\ 並行執筆終了 \]
    D2 --> Join2
    D3 --> Join2
    D4 --> Join2

    subgraph Editor["エディターエージェント"]
        Join2 --> Merge[ドラフト統合]
        Merge --> ConsistencyCheck[一貫性チェック]
        ConsistencyCheck --> StyleUnify[文体統一]
        StyleUnify --> ReviewResult{修正必要?}
        ReviewResult -->|Yes| GenFeedback[フィードバック生成]
        ReviewResult -->|No| FinalEdit[最終校正]
    end

    GenFeedback --> Fork3[/ 修正指示配布 /]
    Fork3 --> W1
    Fork3 --> W2
    Fork3 --> W3
    Fork3 --> W4

    subgraph Finalizer["ファイナライザー"]
        FinalEdit --> FormatDoc[フォーマット整形]
        FormatDoc --> AddTOC[目次生成]
        AddTOC --> AddMeta[メタデータ付与]
        AddMeta --> Export[文書エクスポート]
    end

    Export --> Output[完成文書を出力]
    Output --> End2((◎))
```

### ユースケース4: 自律型問題解決エージェント（ReActパターン）

LLMが自律的に思考・行動・観察を繰り返して問題を解決するReAct（Reasoning and Acting）パターンのワークフローです。

```mermaid
flowchart TB
    Start((●)) --> TaskInput[タスク入力]
    TaskInput --> InitContext[コンテキスト初期化]

    subgraph ReActLoop["ReActループ"]
        InitContext --> Think[思考 - Reasoning]
        Think --> PlanAction[アクション計画]
        PlanAction --> SelectTool{ツール選択}

        SelectTool -->|Web検索| WebSearch[Web検索実行]
        SelectTool -->|計算| Calculator[計算実行]
        SelectTool -->|コード| CodeExec[コード実行]
        SelectTool -->|API| APICall[API呼び出し]
        SelectTool -->|ファイル| FileOp[ファイル操作]
        SelectTool -->|完了| FinalAnswer[最終回答生成]

        WebSearch --> Observe[観察 - Observation]
        Calculator --> Observe
        CodeExec --> Observe
        APICall --> Observe
        FileOp --> Observe

        Observe --> ParseResult[結果解析]
        ParseResult --> UpdateContext[コンテキスト更新]
        UpdateContext --> GoalCheck{目標達成?}

        GoalCheck -->|No| LimitCheck{試行上限?}
        LimitCheck -->|No| Think
        LimitCheck -->|Yes| Timeout[タイムアウト処理]
        GoalCheck -->|Yes| FinalAnswer
    end

    Timeout --> PartialResult[途中結果をまとめる]
    PartialResult --> Output

    FinalAnswer --> Explain[思考過程を説明]
    Explain --> AddReferences[参考情報を付与]
    AddReferences --> Output[回答を出力]

    Output --> End3((◎))
```

### ユースケース5: LLM評価パイプライン（LLM-as-Judge）

LLMの出力品質を別のLLMで評価するパイプラインです。

```mermaid
flowchart TB
    Start((●)) --> LoadTestCases[テストケース読み込み]
    LoadTestCases --> Fork1[/ 並行評価開始 /]

    subgraph Evaluation["評価パイプライン"]
        Fork1 --> TC1[テストケース1]
        Fork1 --> TC2[テストケース2]
        Fork1 --> TC3[テストケースN]

        TC1 --> Gen1[対象LLMで生成]
        TC2 --> Gen2[対象LLMで生成]
        TC3 --> Gen3[対象LLMで生成]

        Gen1 --> Judge1[Judge LLMで評価]
        Gen2 --> Judge2[Judge LLMで評価]
        Gen3 --> Judge3[Judge LLMで評価]

        Judge1 --> Score1[(スコア1)]
        Judge2 --> Score2[(スコア2)]
        Judge3 --> Score3[(スコアN)]
    end

    Score1 --> Join1[\ 並行評価終了 \]
    Score2 --> Join1
    Score3 --> Join1

    Join1 --> Aggregate[スコア集計]
    Aggregate --> CalcMetrics[メトリクス計算]
    CalcMetrics --> GenReport[レポート生成]

    GenReport --> Visualize[グラフ生成]
    Visualize --> Export[結果エクスポート]
    Export --> End1((◎))
```

## アクティビティ図を書くときのベストプラクティス

### 1. 適切な抽象度を選ぶ

アクティビティは適切な粒度で記述します。細かすぎると複雑になり、粗すぎると意味がなくなります。

```mermaid
flowchart LR
    subgraph Bad["❌ 細かすぎる"]
        A1[変数初期化] --> A2[ループ開始] --> A3[条件評価] --> A4[...]
    end
```

```mermaid
flowchart LR
    subgraph Good["✅ 適切な粒度"]
        B1[注文データ検証] --> B2[在庫確認] --> B3[決済処理]
    end
```

### 2. 動詞から始める命名

アクティビティ名は「何をするか」がわかるように動詞から始めます。

```mermaid
flowchart TB
    subgraph Bad["❌ 名詞のみ"]
        direction LR
        X1[注文] --> X2[在庫] --> X3[決済]
    end
    subgraph Good["✅ 動詞で開始"]
        direction LR
        Y1[注文を処理する] --> Y2[在庫を確認する] --> Y3[決済を実行する]
    end
```

### 3. スイムレーンで責任を明確に

責任の所在が重要な場合は、必ずスイムレーンを使って明確にします。

```mermaid
flowchart TB
    subgraph Frontend["フロントエンド"]
        A[リクエスト送信]
        E[レスポンス表示]
    end
    subgraph Backend["バックエンド"]
        B[リクエスト受信]
        C[ビジネスロジック実行]
        D[レスポンス返却]
    end

    A --> B --> C --> D --> E
```

### 4. 並行処理を明示する

処理が並行実行できる場合は、フォーク/ジョインを使って明示します。

```mermaid
flowchart TD
    A[データ受信] --> Fork[/ 並行処理 /]
    Fork --> B[検証処理]
    Fork --> C[ログ記録]
    Fork --> D[通知送信]
    B --> Join[\ 同期 \]
    C --> Join
    D --> Join
    Join --> E[完了処理]
```

### 5. 例外フローを忘れない

正常系だけでなく、エラー時やタイムアウト時のフローも記述します。

```mermaid
flowchart TD
    A[処理開始] --> B[外部API呼び出し]
    B --> C{成功?}
    C -->|Yes| D[結果を処理]
    C -->|No| E{リトライ可能?}
    E -->|Yes| F[待機してリトライ]
    F --> B
    E -->|No| G[エラーログ記録]
    G --> H[フォールバック処理]
    D --> I[完了]
    H --> I
```

## まとめ

アクティビティ図は、システムやビジネスプロセスの振る舞いを視覚化する強力なツールです。フローチャートと比較して、以下の点で優れています：

```mermaid
flowchart LR
    subgraph Advantages["アクティビティ図の利点"]
        A[並行処理を\nフォーク/ジョインで表現]
        B[責任の分離を\nスイムレーンで可視化]
        C[データの流れを\nオブジェクトノードで表現]
        D[UML標準に準拠]
    end
```

LLMを活用したシステムでは、複数のエージェントが並行して動作したり、思考・行動・観察のループが発生したりと、複雑なワークフローになりがちです。アクティビティ図を使うことで、これらの複雑な処理フローを明確に可視化し、チーム内での認識を揃えることができます。

フローチャートは単純なアルゴリズムの説明に、アクティビティ図は複雑なシステムの振る舞い記述に、それぞれ使い分けることで、より効果的なドキュメンテーションが実現できます。
