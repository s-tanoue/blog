---
slug: pulumi-intro-terraform-comparison
title: Pulumiの入門ガイド：Terraformとの違いを徹底比較して理解する
authors:
  name: Blog Maintainer
  title: Maintainer
  url: https://example.com
  image_url: https://avatars.githubusercontent.com/u/1?v=4
categories:
  - 開発ツール
---

クラウドインフラの管理において、**Pulumi**は革新的なアプローチを提供する Infrastructure as Code（IaC）ツールです。従来の**Terraform**との違いを理解しながら、Pulumiの特徴、メリット、実践的な使い方を解説します。

<!--truncate-->

## Pulumiとは何か

**Pulumi**は、**プログラミング言語**を使ってクラウドインフラを定義・管理できるモダンなInfrastructure as Code（IaC）プラットフォームです。

公式サイト: https://www.pulumi.com/

### Pulumiの最大の特徴

Pulumiの最も革新的な点は、**実際のプログラミング言語（Python、TypeScript、Go、C#、Java）**を使ってインフラを記述できることです。HCL（HashiCorp Configuration Language）やYAMLのような独自の設定言語を学ぶ必要がありません。

```python
# Pulumi（Python）の例
import pulumi
import pulumi_aws as aws

# S3バケットの作成
bucket = aws.s3.Bucket('my-bucket',
    acl='private',
    tags={
        'Environment': 'dev',
        'Name': 'My bucket'
    })

# バケット名を出力
pulumi.export('bucket_name', bucket.id)
```

このコードは、AWSのS3バケットを作成する完全に動作するPulumiプログラムです。Pythonの構文、ループ、条件分岐、関数、クラスなどをそのまま使用できます。

---

## PulumiとTerraformの比較

PulumiとTerraformは、どちらもInfrastructure as Codeのツールですが、アプローチが大きく異なります。

### 比較表

| 項目 | Pulumi | Terraform |
|------|--------|-----------|
| **言語** | Python、TypeScript、Go、C#、Java | HCL（独自の設定言語） |
| **パラダイム** | 命令型（Imperative） | 宣言型（Declarative） |
| **対応クラウド** | AWS、Azure、GCP、Kubernetes、100+ | AWS、Azure、GCP、Kubernetes、1000+ |
| **状態管理** | Pulumi Service / セルフホスト可能 | Terraform Cloud / S3などのバックエンド |
| **テスト** | ユニットテスト、モックが容易 | terratest などの外部ツール |
| **学習曲線** | 既存の言語知識を活用可能 | HCLを学ぶ必要がある |
| **IDE支援** | 完全なIntelliSense、補完、型チェック | 限定的（拡張機能による） |
| **ポリシー管理** | Policy as Code（TypeScript/Python） | Sentinel（独自言語） |
| **コミュニティ** | 成長中 | 非常に大きい |
| **ライセンス** | Apache 2.0 | BSL → MPL 2.0（2023年変更） |

### 1. 言語の違い

**Terraform（HCL）**:
```hcl
# Terraform の例
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-bucket"
  acl    = "private"

  tags = {
    Environment = "dev"
    Name        = "My bucket"
  }
}

output "bucket_name" {
  value = aws_s3_bucket.my_bucket.id
}
```

**Pulumi（TypeScript）**:
```typescript
// Pulumi (TypeScript) の例
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// S3バケットの作成
const bucket = new aws.s3.Bucket("my-bucket", {
    acl: "private",
    tags: {
        Environment: "dev",
        Name: "My bucket",
    },
});

// バケット名を出力
export const bucketName = bucket.id;
```

### 2. プログラミングのパワー

Pulumiでは、プログラミング言語のすべての機能を活用できます：

**条件分岐とループ（Pulumi）**:
```python
import pulumi
import pulumi_aws as aws

environments = ['dev', 'staging', 'prod']

# 環境ごとにバケットを作成
for env in environments:
    bucket = aws.s3.Bucket(f'{env}-bucket',
        acl='private',
        tags={'Environment': env})

    pulumi.export(f'{env}_bucket_name', bucket.id)
```

**Terraform での同等の実装**:
```hcl
variable "environments" {
  default = ["dev", "staging", "prod"]
}

resource "aws_s3_bucket" "buckets" {
  for_each = toset(var.environments)

  bucket = "${each.key}-bucket"
  acl    = "private"

  tags = {
    Environment = each.key
  }
}

output "bucket_names" {
  value = { for env, bucket in aws_s3_bucket.buckets : env => bucket.id }
}
```

TerraformでもループやMap操作は可能ですが、HCLの制約があります。Pulumiは完全なプログラミング言語なので、より柔軟です。

### 3. 型安全性とIDE支援

**Pulumiの強み**:
- **完全な型チェック**: コンパイル時に型エラーを検出
- **IntelliSense**: VSCodeやIDEで自動補完
- **ドキュメント統合**: IDEでAPIドキュメントを即座に参照

**Terraformの場合**:
- 実行時までエラーが分からないことが多い
- IDE支援は拡張機能に依存（限定的）

### 4. テストのしやすさ

**Pulumiのユニットテスト（Python）**:
```python
import unittest
import pulumi

class MyMocks(pulumi.runtime.Mocks):
    def new_resource(self, args: pulumi.runtime.MockResourceArgs):
        return [args.name + '_id', args.inputs]

    def call(self, args: pulumi.runtime.MockCallArgs):
        return {}

pulumi.runtime.set_mocks(MyMocks())

# インフラコードをインポートしてテスト
import infra

class TestInfrastructure(unittest.TestCase):
    @pulumi.runtime.test
    def test_bucket_created(self):
        def check_bucket(args):
            bucket_name = args[0]
            self.assertIsNotNone(bucket_name)

        return infra.bucket.id.apply(check_bucket)

if __name__ == '__main__':
    unittest.main()
```

Pulumiでは、標準的なテストフレームワーク（pytest、Jest、Go test等）を使ってユニットテストを書けます。

**Terraformのテスト**:
- Terratest（Go）などの外部ツールが必要
- 実際のインフラをデプロイしてテストすることが多い
- ユニットテストは難しい

### 5. 状態管理

**Pulumi**:
- デフォルトでPulumi Service（クラウド）に状態を保存
- セルフホスト可能（S3、Azure Blob、ローカルファイル）
- 暗号化、バージョン管理、ロールバック機能

**Terraform**:
- デフォルトでローカルファイル
- リモートバックエンド（S3、Terraform Cloud等）の設定が必要
- 状態ファイルの管理が重要（ロックメカニズム）

### 6. マルチクラウドの扱い

**どちらもマルチクラウド対応**ですが：

- **Terraform**: 1000以上のプロバイダーで圧倒的なエコシステム
- **Pulumi**: 主要クラウド（AWS、Azure、GCP、Kubernetes）は完全対応、100以上のプロバイダー

---

## Pulumiの主な特徴とメリット

### 1. 既存のスキルを活用

チームが既にPythonやTypeScriptに精通していれば、新しい言語を学ぶ必要がありません。

### 2. 複雑なロジックの実装が容易

- API呼び出し
- データベースクエリ
- 外部サービスとの統合
- 複雑な計算やデータ変換

これらをすべてインフラコード内で実行できます。

**例：外部APIからデータを取得してリソースを作成**:
```python
import pulumi
import pulumi_aws as aws
import requests

# 外部APIからデータを取得
response = requests.get('https://api.example.com/config')
config = response.json()

# 取得したデータに基づいてリソースを作成
for region in config['regions']:
    bucket = aws.s3.Bucket(f'bucket-{region}',
        region=region,
        tags={'Region': region})
```

Terraformでこれを実現するには、外部データソースやスクリプトを使う必要があります。

### 3. コンポーネントの再利用

**Pulumiコンポーネント**:
```python
# vpc_component.py
import pulumi
import pulumi_aws as aws

class VpcComponent(pulumi.ComponentResource):
    def __init__(self, name, cidr_block, opts=None):
        super().__init__('custom:network:VPC', name, None, opts)

        # VPCの作成
        self.vpc = aws.ec2.Vpc(f'{name}-vpc',
            cidr_block=cidr_block,
            enable_dns_hostnames=True,
            opts=pulumi.ResourceOptions(parent=self))

        # サブネットの作成
        self.subnet = aws.ec2.Subnet(f'{name}-subnet',
            vpc_id=self.vpc.id,
            cidr_block=cidr_block,
            opts=pulumi.ResourceOptions(parent=self))

        self.register_outputs({
            'vpc_id': self.vpc.id,
            'subnet_id': self.subnet.id
        })

# 使用例
dev_vpc = VpcComponent('dev', '10.0.0.0/16')
prod_vpc = VpcComponent('prod', '10.1.0.0/16')
```

オブジェクト指向プログラミングの手法を活用して、再利用可能なコンポーネントを作成できます。

### 4. Policy as Code

**Pulumi CrossGuard**を使えば、インフラのポリシーを強制できます：

```typescript
// policy.ts
import * as aws from "@pulumi/aws";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";

new PolicyPack("aws-policies", {
    policies: [
        {
            name: "s3-no-public-read",
            description: "S3バケットをパブリック読み取り可能にしない",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
                if (bucket.acl === "public-read") {
                    reportViolation("S3バケットをパブリック読み取りにすることはできません");
                }
            }),
        },
    ],
});
```

### 5. シークレット管理

Pulumiは機密情報を自動的に暗号化します：

```python
import pulumi

# シークレットとしてマーク
password = pulumi.Output.secret("my-super-secret-password")

# 出力してもマスクされる
pulumi.export('db_password', password)
```

---

## Pulumiのインストールと始め方

### インストール

**macOS**:
```bash
brew install pulumi/tap/pulumi
```

**Linux**:
```bash
curl -fsSL https://get.pulumi.com | sh
```

**Windows**:
```powershell
choco install pulumi
```

または公式サイトからバイナリをダウンロード: https://www.pulumi.com/docs/get-started/install/

### プロジェクトの作成

```bash
# ディレクトリを作成
mkdir my-pulumi-project
cd my-pulumi-project

# Pulumiプロジェクトを初期化（Python + AWS）
pulumi new aws-python

# または TypeScript + AWS
pulumi new aws-typescript

# または Go + AWS
pulumi new aws-go
```

`pulumi new` コマンドで対話的にプロジェクトを作成できます。

### 基本的なワークフロー

```bash
# プレビュー（変更内容を確認）
pulumi preview

# デプロイ（インフラを作成）
pulumi up

# スタックの状態を確認
pulumi stack

# 出力を表示
pulumi stack output

# リソースを削除
pulumi destroy
```

---

## 実践例：EC2インスタンスとVPCの作成

### Python版

```python
import pulumi
import pulumi_aws as aws

# VPCの作成
vpc = aws.ec2.Vpc('my-vpc',
    cidr_block='10.0.0.0/16',
    enable_dns_hostnames=True,
    tags={'Name': 'my-vpc'})

# サブネットの作成
subnet = aws.ec2.Subnet('my-subnet',
    vpc_id=vpc.id,
    cidr_block='10.0.1.0/24',
    availability_zone='ap-northeast-1a',
    tags={'Name': 'my-subnet'})

# セキュリティグループの作成
security_group = aws.ec2.SecurityGroup('web-sg',
    vpc_id=vpc.id,
    description='Allow HTTP and SSH',
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            protocol='tcp',
            from_port=22,
            to_port=22,
            cidr_blocks=['0.0.0.0/0'],
        ),
        aws.ec2.SecurityGroupIngressArgs(
            protocol='tcp',
            from_port=80,
            to_port=80,
            cidr_blocks=['0.0.0.0/0'],
        ),
    ],
    egress=[
        aws.ec2.SecurityGroupEgressArgs(
            protocol='-1',
            from_port=0,
            to_port=0,
            cidr_blocks=['0.0.0.0/0'],
        ),
    ])

# AMIの取得（最新のAmazon Linux 2）
ami = aws.ec2.get_ami(
    most_recent=True,
    owners=['amazon'],
    filters=[
        aws.ec2.GetAmiFilterArgs(
            name='name',
            values=['amzn2-ami-hvm-*-x86_64-gp2'],
        ),
    ])

# EC2インスタンスの作成
instance = aws.ec2.Instance('web-server',
    instance_type='t2.micro',
    vpc_security_group_ids=[security_group.id],
    subnet_id=subnet.id,
    ami=ami.id,
    tags={'Name': 'web-server'})

# 出力
pulumi.export('instance_id', instance.id)
pulumi.export('public_ip', instance.public_ip)
pulumi.export('vpc_id', vpc.id)
```

### TypeScript版

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// VPCの作成
const vpc = new aws.ec2.Vpc("my-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    tags: { Name: "my-vpc" },
});

// サブネットの作成
const subnet = new aws.ec2.Subnet("my-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "ap-northeast-1a",
    tags: { Name: "my-subnet" },
});

// セキュリティグループの作成
const securityGroup = new aws.ec2.SecurityGroup("web-sg", {
    vpcId: vpc.id,
    description: "Allow HTTP and SSH",
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

// AMIの取得
const ami = aws.ec2.getAmi({
    mostRecent: true,
    owners: ["amazon"],
    filters: [{ name: "name", values: ["amzn2-ami-hvm-*-x86_64-gp2"] }],
});

// EC2インスタンスの作成
const instance = new aws.ec2.Instance("web-server", {
    instanceType: "t2.micro",
    vpcSecurityGroupIds: [securityGroup.id],
    subnetId: subnet.id,
    ami: ami.then(a => a.id),
    tags: { Name: "web-server" },
});

// 出力
export const instanceId = instance.id;
export const publicIp = instance.publicIp;
export const vpcId = vpc.id;
```

---

## TerraformからPulumiへの移行

### 移行ツール

Pulumiは、既存のTerraformコードを変換するツールを提供しています：

```bash
# Terraform の状態をインポート
pulumi import --from terraform terraform.tfstate

# Terraform コードを Pulumi に変換
pulumi convert --from terraform --language python
```

### 移行戦略

1. **段階的移行**: すべてを一度に移行せず、新しいリソースからPulumiを使い始める
2. **並行運用**: TerraformとPulumiを並行して使用（異なるリソースを管理）
3. **完全移行**: すべてのリソースをPulumiに移行

### Pulumiで既存のTerraformプロバイダーを使う

Pulumiは、Terraformプロバイダーを直接使用できます（tf2pulumi）：

```bash
pulumi plugin install resource terraform-provider 1.0.0
```

これにより、Terraformのエコシステムを活用しながらPulumiの利点を享受できます。

---

## Pulumiを使うべきケース

### Pulumiが向いている場合

- **既存の言語スキルを活用したい**: チームがPython、TypeScript等に精通している
- **複雑なロジックが必要**: 条件分岐、ループ、API呼び出しなどが多い
- **テストを重視**: ユニットテストやモックを活用したい
- **型安全性が重要**: コンパイル時の型チェックで安全性を高めたい
- **開発スピード**: IDE支援とIntelliSenseで素早く開発したい

### Terraformが向いている場合

- **エコシステム**: 1000以上のプロバイダーが必要
- **チームの経験**: チームがTerraformに精通している
- **シンプルな構成**: 複雑なロジックが不要
- **コミュニティ**: 大規模なコミュニティとリソースを活用したい

---

## よくある質問

### Q1: Pulumiは無料で使えますか？

A: はい、Pulumi CLIはオープンソース（Apache 2.0）で無料です。Pulumi Serviceは、個人や小規模チーム向けに無料枠があります。大規模利用や追加機能が必要な場合は有料プランがあります。

### Q2: 既存のTerraformプロジェクトをPulumiに移行するのは難しいですか？

A: Pulumiは変換ツール（`pulumi convert`）を提供しており、Terraformコードを自動的にPulumiコードに変換できます。ただし、100%完璧な変換ではないため、手動での調整が必要な場合があります。段階的な移行がおすすめです。

### Q3: Pulumiで管理できるクラウドサービスは？

A: AWS、Azure、GCP、Kubernetes、DigitalOcean、Cloudflare、DataDog、MongoDB Atlasなど、100以上のプロバイダーに対応しています。主要なクラウドサービスはすべてサポートされています。

### Q4: Pulumiの状態ファイルはどこに保存されますか？

A: デフォルトではPulumi Service（クラウド）に保存されますが、セルフホストも可能です。S3、Azure Blob Storage、Google Cloud Storage、ローカルファイルシステムなどをバックエンドとして使用できます。

### Q5: チームでPulumiを使う場合、どう管理しますか？

A: Pulumi ServiceまたはPulumi Cloud Enterpriseを使えば、チームメンバーの管理、アクセス制御、監査ログ、CI/CD統合などが可能です。RBAC（ロールベースアクセス制御）やSAML/SSOもサポートされています。

### Q6: Pulumiのパフォーマンスは？

A: Pulumiは並列実行を活用し、リソースの作成・更新を効率的に行います。Terraformと同等かそれ以上のパフォーマンスを発揮します。

### Q7: Pulumiでプロバイダーのバージョン管理は？

A: Pulumiは各プロバイダーのバージョンを管理できます。`Pulumi.yaml`で依存関係を指定します。

```yaml
name: my-project
runtime: python
description: My Pulumi project
dependencies:
  pulumi: ">=3.0.0,<4.0.0"
  pulumi-aws: ">=6.0.0,<7.0.0"
```

---

## まとめ

PulumiとTerraformの選択は、チームのスキル、プロジェクトの要件、既存の投資によって決まります。

**Pulumiの強み**:
- 実際のプログラミング言語を使用（Python、TypeScript、Go、C#、Java）
- 完全な型安全性とIDE支援
- ユニットテストとモックが容易
- 複雑なロジックの実装が柔軟
- コンポーネントの再利用が簡単

**Terraformの強み**:
- 巨大なエコシステムと1000以上のプロバイダー
- 成熟したコミュニティと豊富なリソース
- シンプルで宣言的な構文
- 広く採用されている（業界標準的な立ち位置）

**どちらを選ぶべきか**:
- **既存の言語スキルを活用したい** → Pulumi
- **複雑なロジックやテストが重要** → Pulumi
- **豊富なプロバイダーが必要** → Terraform
- **チームがTerraformに精通** → Terraform

**併用も可能**: 異なるプロジェクトや用途に応じて、両方を使い分けることもできます。

### 始めるためのステップ

1. **Pulumiをインストール**: https://www.pulumi.com/docs/get-started/install/
2. **チュートリアルを試す**: `pulumi new` でサンプルプロジェクトを作成
3. **ドキュメントを読む**: https://www.pulumi.com/docs/
4. **小規模なプロジェクトで試す**: 本番環境の前に検証環境で試す
5. **チームで評価**: チームメンバーのフィードバックを収集

Infrastructure as Codeの新しい選択肢として、Pulumiはエンジニアに強力なツールを提供します。既存の言語スキルを活かしながら、モダンなインフラ管理を実現しましょう！
