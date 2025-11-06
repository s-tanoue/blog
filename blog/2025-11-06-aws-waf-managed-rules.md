---
slug: aws-waf-managed-rules
title: AWS WAFマネージドルール完全ガイド：Webアプリケーションを守る即戦力
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
tags: [AWS, WAF, セキュリティ, クラウド]
---

AWS WAF（Web Application Firewall）は、Webアプリケーションを一般的な攻撃から保護するクラウド型ファイアウォールサービスです。本記事では、AWS WAFのマネージドルールについて詳しく解説し、効果的なセキュリティ対策の実装方法をご紹介します。

<!--truncate-->

## AWS WAFマネージドルールとは

AWS WAFマネージドルールは、AWSや信頼できるセキュリティベンダーによって事前に設定されたルールセットです。これらのルールは、一般的なWebアプリケーションの脆弱性や脅威から保護するために最適化されており、セキュリティの専門知識がなくても簡単に導入できます。

### マネージドルールの利点

- **即座に利用可能**: 複雑なルール設定なしで、すぐに保護を開始できます
- **継続的な更新**: AWSやベンダーが最新の脅威に対応してルールを更新します
- **専門知識不要**: セキュリティ専門家でなくても、効果的な保護を実装できます
- **コスト効率**: 独自のルールを開発・維持するよりも低コストです

## マネージドルールの種類

AWS WAFでは、以下の種類のマネージドルールが提供されています。

### 1. AWS Managed Rules（AWS提供の無料ルール）

AWSが提供する無料のマネージドルールグループです。基本的な保護を提供し、追加料金なしで利用できます。

#### Core rule set（コアルールセット）

最も基本的で重要なルールセットです。OWASP Top 10の脅威を含む一般的な攻撃から保護します。

```json
{
  "Name": "AWSManagedRulesCommonRuleSet",
  "Priority": 0,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesCommonRuleSet"
    }
  },
  "OverrideAction": {
    "None": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "AWSManagedRulesCommonRuleSetMetric"
  }
}
```

保護対象：
- SQLインジェクション（SQLi）
- クロスサイトスクリプティング（XSS）
- ローカルファイルインクルージョン（LFI）
- リモートファイルインクルージョン（RFI）
- パストラバーサル攻撃

#### Known bad inputs（既知の悪意ある入力）

既知の脆弱性を悪用しようとするリクエストパターンをブロックします。

```json
{
  "Name": "AWSManagedRulesKnownBadInputsRuleSet",
  "Priority": 1,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesKnownBadInputsRuleSet"
    }
  },
  "OverrideAction": {
    "None": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "AWSManagedRulesKnownBadInputsRuleSetMetric"
  }
}
```

#### Amazon IP reputation list（IP評判リスト）

悪意あるIPアドレスからのトラフィックをブロックします。

```json
{
  "Name": "AWSManagedRulesAmazonIpReputationList",
  "Priority": 2,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesAmazonIpReputationList"
    }
  },
  "OverrideAction": {
    "None": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "AWSManagedRulesAmazonIpReputationListMetric"
  }
}
```

#### Anonymous IP list（匿名IPリスト）

VPN、プロキシ、Torなどの匿名化サービスからのトラフィックをブロックします。

### 2. AWS Marketplace Managed Rules（有料ルール）

サードパーティのセキュリティベンダーが提供する専門的なルールセットです。より高度な保護や特定の用途に特化したルールが含まれます。

主なベンダー：
- **Fortinet**: エンタープライズグレードの保護
- **F5**: アプリケーションセキュリティに特化
- **Imperva**: 高度な脅威インテリジェンス
- **Cloudflare**: CDNと統合されたセキュリティ

### 3. Use-case Specific Rule Groups（用途別ルールグループ）

特定の用途やアプリケーションタイプに最適化されたルールグループです。

#### SQL database protection

SQLデータベースを使用するアプリケーションに特化した保護を提供します。

```json
{
  "Name": "AWSManagedRulesSQLiRuleSet",
  "Priority": 3,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesSQLiRuleSet"
    }
  },
  "OverrideAction": {
    "None": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "AWSManagedRulesSQLiRuleSetMetric"
  }
}
```

#### Linux operating system protection

Linuxオペレーティングシステム固有の脅威から保護します。

#### POSIX operating system protection

POSIX準拠システムに対する攻撃を防ぎます。

#### Windows operating system protection

Windowsシステム固有の脅威をブロックします。

#### PHP application protection

PHPアプリケーションの脆弱性を狙った攻撃を防御します。

#### WordPress application protection

WordPressサイト専用の保護を提供します。CMSの既知の脆弱性に対応します。

```json
{
  "Name": "AWSManagedRulesWordPressRuleSet",
  "Priority": 4,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesWordPressRuleSet"
    }
  },
  "OverrideAction": {
    "None": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "AWSManagedRulesWordPressRuleSetMetric"
  }
}
```

## マネージドルールの実装方法

### AWS Management Consoleでの設定

1. **AWS WAFコンソールを開く**: AWSマネジメントコンソールにログインし、WAFサービスを選択します

2. **Web ACLを作成**:
   - リージョンを選択（CloudFront、ALB、API Gatewayなど保護対象に応じて選択）
   - Web ACLの名前を入力
   - 関連付けるリソース（ALB、CloudFrontディストリビューションなど）を選択

3. **ルールを追加**:
   - 「Add rules」→「Add managed rule groups」を選択
   - AWS Managed RulesまたはAWS Marketplaceルールから選択
   - 優先度を設定

4. **デフォルトアクションを設定**: マッチしなかったリクエストの扱い（Allow/Block）を選択

5. **確認とデプロイ**: 設定を確認してWeb ACLを作成

### Terraformでの実装例

インフラストラクチャをコードで管理する場合、Terraformを使用してマネージドルールを実装できます。

```hcl
resource "aws_wafv2_web_acl" "example" {
  name        = "managed-rule-example"
  description = "Example WAF with managed rules"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 0

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesKnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # IP Reputation List
  rule {
    name     = "AWSManagedRulesAmazonIpReputationList"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesAmazonIpReputationList"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesAmazonIpReputationListMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "ExampleWebACLMetric"
    sampled_requests_enabled   = true
  }
}

# ALBに関連付け
resource "aws_wafv2_web_acl_association" "example" {
  resource_arn = aws_lb.example.arn
  web_acl_arn  = aws_wafv2_web_acl.example.arn
}
```

### AWS CLIでの設定

コマンドラインから設定する場合の例：

```bash
# Web ACLの作成
aws wafv2 create-web-acl \
  --name my-web-acl \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://rules.json \
  --visibility-config \
    SampledRequestsEnabled=true,\
    CloudWatchMetricsEnabled=true,\
    MetricName=MyWebACL \
  --region ap-northeast-1

# Application Load Balancerに関連付け
aws wafv2 associate-web-acl \
  --web-acl-arn arn:aws:wafv2:ap-northeast-1:123456789012:regional/webacl/my-web-acl/a1b2c3d4 \
  --resource-arn arn:aws:elasticloadbalancing:ap-northeast-1:123456789012:loadbalancer/app/my-alb/1234567890abcdef \
  --region ap-northeast-1
```

## ルールのカスタマイズとチューニング

マネージドルールは即座に利用できますが、アプリケーションの特性に応じてカスタマイズが必要な場合があります。

### ルールの除外（Rule Exclusions）

特定のルールが正常なトラフィックをブロックしてしまう場合、そのルールを除外できます。

```json
{
  "Name": "AWSManagedRulesCommonRuleSet",
  "Priority": 0,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesCommonRuleSet",
      "ExcludedRules": [
        {
          "Name": "SizeRestrictions_BODY"
        },
        {
          "Name": "GenericRFI_BODY"
        }
      ]
    }
  },
  "OverrideAction": {
    "None": {}
  }
}
```

### Count モードでのテスト

本番環境に適用する前に、Countモードでルールの影響を確認できます。

```json
{
  "Name": "AWSManagedRulesCommonRuleSet",
  "Priority": 0,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesCommonRuleSet"
    }
  },
  "OverrideAction": {
    "Count": {}
  }
}
```

Countモードでは、ルールにマッチしたリクエストをブロックせず、メトリクスとして記録します。CloudWatch Logsで影響を分析した後、Blockモードに切り替えることができます。

### スコープダウンステートメント

特定の条件下でのみルールを適用することができます。

```json
{
  "Name": "AWSManagedRulesSQLiRuleSet",
  "Priority": 3,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesSQLiRuleSet",
      "ScopeDownStatement": {
        "ByteMatchStatement": {
          "FieldToMatch": {
            "UriPath": {}
          },
          "PositionalConstraint": "STARTS_WITH",
          "SearchString": "/api/",
          "TextTransformations": [
            {
              "Priority": 0,
              "Type": "LOWERCASE"
            }
          ]
        }
      }
    }
  },
  "OverrideAction": {
    "None": {}
  }
}
```

この例では、`/api/`で始まるパスに対してのみSQLインジェクション保護を適用します。

## モニタリングとログ分析

マネージドルールを効果的に運用するには、継続的なモニタリングが重要です。

### CloudWatch メトリクス

AWS WAFは自動的にCloudWatchメトリクスを送信します：

- **AllowedRequests**: 許可されたリクエスト数
- **BlockedRequests**: ブロックされたリクエスト数
- **CountedRequests**: Countモードでカウントされたリクエスト数
- **PassedRequests**: ルールグループを通過したリクエスト数

### ログの有効化

詳細な分析のために、AWS WAFログを有効化します。

```bash
aws wafv2 put-logging-configuration \
  --logging-configuration \
    ResourceArn=arn:aws:wafv2:ap-northeast-1:123456789012:regional/webacl/my-web-acl/a1b2c3d4,\
    LogDestinationConfigs=arn:aws:logs:ap-northeast-1:123456789012:log-group:aws-waf-logs-my-web-acl \
  --region ap-northeast-1
```

ログは以下の宛先に送信できます：
- **Amazon CloudWatch Logs**: リアルタイム分析とアラート
- **Amazon S3**: 長期保存とバッチ処理
- **Amazon Kinesis Data Firehose**: ストリーミング分析

### CloudWatch Insights でのログ分析

CloudWatch Logs Insightsを使用して、ブロックされたリクエストを分析できます。

```sql
# ブロックされたリクエストの上位10件
fields @timestamp, httpRequest.clientIp, httpRequest.uri, terminatingRuleId
| filter action = "BLOCK"
| sort @timestamp desc
| limit 10

# 特定のルールでブロックされたIPアドレス
fields httpRequest.clientIp, httpRequest.uri
| filter terminatingRuleId = "AWSManagedRulesCommonRuleSet"
| stats count() by httpRequest.clientIp
| sort count desc
| limit 20

# 時間帯別のブロック数
fields @timestamp
| filter action = "BLOCK"
| stats count() by bin(5m)
```

## 料金体系

AWS WAFの料金は以下の要素で構成されます：

### 基本料金

- **Web ACL**: 1つあたり $5.00/月
- **ルール**: 1つあたり $1.00/月
- **リクエスト**: 100万リクエストあたり $0.60

### マネージドルールの料金

- **AWS Managed Rules**: 無料（基本のWeb ACLとリクエスト料金のみ）
- **AWS Marketplace Managed Rules**: ベンダーによって異なる（月額 $10〜$200程度）
- **Bot Control Managed Rule Group**: 100万リクエストあたり $10.00

### 料金計算例

月間10億リクエストのWebアプリケーションで、Core Rule SetとKnown Bad Inputsを使用する場合：

```
Web ACL: $5.00
ルール: $1.00 × 2 = $2.00
リクエスト: (1,000,000,000 / 1,000,000) × $0.60 = $600.00
合計: $607.00/月
```

## ベストプラクティス

### 1. 段階的な導入

新しいマネージドルールを導入する際は、以下の手順で進めます：

1. **Countモードで開始**: まずCountモードでルールを追加し、影響を観察
2. **ログ分析**: 1週間程度CloudWatchログを分析し、誤検知を確認
3. **除外ルールの設定**: 必要に応じて誤検知を防ぐための除外を設定
4. **Blockモードに移行**: 問題がなければBlockモードに切り替え
5. **継続的なモニタリング**: 本番運用後も定期的にログを確認

### 2. 最小限のルールセットから開始

最初は以下の基本的なルールセットから始めることをお勧めします：

```
1. Core Rule Set (AWSManagedRulesCommonRuleSet)
2. Known Bad Inputs (AWSManagedRulesKnownBadInputsRuleSet)
3. IP Reputation List (AWSManagedRulesAmazonIpReputationList)
```

必要に応じて、アプリケーション固有のルールグループを追加します。

### 3. レート制限との併用

マネージドルールと並行して、レート制限ルールを設定することで、DDoS攻撃やブルートフォース攻撃に対する保護を強化できます。

```json
{
  "Name": "RateLimitRule",
  "Priority": 10,
  "Statement": {
    "RateBasedStatement": {
      "Limit": 2000,
      "AggregateKeyType": "IP"
    }
  },
  "Action": {
    "Block": {}
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "RateLimitRule"
  }
}
```

### 4. 地理的ブロッキングの活用

特定の国からのトラフィックが不要な場合、地理的ブロッキングを組み合わせます。

```json
{
  "Name": "GeoBlockRule",
  "Priority": 11,
  "Statement": {
    "GeoMatchStatement": {
      "CountryCodes": ["CN", "RU", "KP"]
    }
  },
  "Action": {
    "Block": {}
  }
}
```

### 5. 定期的な見直し

- **月次レビュー**: CloudWatchメトリクスを確認し、ブロック率や誤検知を分析
- **四半期レビュー**: ルール構成を見直し、新しいマネージドルールの適用を検討
- **セキュリティインシデント後**: 攻撃パターンを分析し、ルールの改善を検討

### 6. アラートの設定

CloudWatch Alarmsを設定して、異常なトラフィックパターンを検知します。

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-blocked-requests \
  --alarm-description "Alert when blocked requests spike" \
  --metric-name BlockedRequests \
  --namespace AWS/WAFV2 \
  --statistic Sum \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:ap-northeast-1:123456789012:security-alerts
```

## トラブルシューティング

### 正常なトラフィックがブロックされる場合

1. **CloudWatch Logsで原因を特定**:
```sql
fields terminatingRuleId, httpRequest.uri, httpRequest.clientIp
| filter action = "BLOCK"
| stats count() by terminatingRuleId
```

2. **該当ルールを一時的にCountモードに変更**

3. **スコープダウンステートメントで適用範囲を限定**

4. **最終手段として、該当ルールを除外**

### パフォーマンスへの影響

AWS WAFはエッジで処理されるため、通常レイテンシーへの影響は最小限（1〜5ms程度）です。ただし、複雑なルールや大量のルールを設定すると影響が出る可能性があります。

対策：
- 不要なルールを削除
- ルールの優先度を最適化（頻繁にマッチするルールを上位に配置）
- スコープダウンステートメントで処理対象を限定

### コストが予想以上に高い場合

1. **リクエスト数を確認**: CloudWatchメトリクスでリクエスト数を確認
2. **ルール数を最適化**: 重複するルールや不要なルールを削除
3. **ログ保存期間の見直し**: CloudWatch Logsの保存期間を調整（S3への移行を検討）

## まとめ

AWS WAFのマネージドルールは、Webアプリケーションのセキュリティを迅速かつ効果的に強化する優れたソリューションです。

**重要なポイント：**

✅ **即座に利用可能**: 複雑な設定なしで保護を開始できる
✅ **自動更新**: 最新の脅威に対応するルールが自動的に適用される
✅ **コスト効率**: 独自のルール開発よりも低コストで高度な保護を実現
✅ **柔軟なカスタマイズ**: アプリケーションの特性に応じて調整可能
✅ **包括的な保護**: OWASP Top 10を含む幅広い脅威に対応

まずは無料のAWS Managed Rulesから始めて、段階的にセキュリティ対策を強化していくことをお勧めします。Countモードでの検証、ログ分析、継続的な改善のサイクルを回すことで、誤検知を最小限に抑えながら、効果的なセキュリティ対策を実現できます。

## 参考リンク

- [AWS WAF公式ドキュメント](https://docs.aws.amazon.com/waf/latest/developerguide/)
- [AWS Managed Rules一覧](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups.html)
- [AWS WAF料金](https://aws.amazon.com/jp/waf/pricing/)
- [AWS WAF Security Automations](https://aws.amazon.com/solutions/implementations/aws-waf-security-automations/)
- [AWS WAF API Reference](https://docs.aws.amazon.com/waf/latest/APIReference/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
