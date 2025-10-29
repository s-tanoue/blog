import clsx from 'clsx';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

const features = [
  {
    title: 'Docusaurus ベース',
    description: 'React と Markdown を組み合わせて、コンテンツを柔軟に管理できます。',
  },
  {
    title: 'ブログに特化',
    description: 'タイムラインやタグ機能を持つブログで記事を公開できます。',
  },
  {
    title: '開発者体験の向上',
    description: 'TypeScript とモダンなツールチェーンにより、快適に拡張できます。',
  },
];

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          開発ブログへようこそ
        </Heading>
        <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
          Nuxt.js から Docusaurus へ移行し、より軽量でカスタマイズしやすい構成になりました。
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            ドキュメントを見る
          </Link>
          <Link className="button button--outline button--lg" to="/blog">
            ブログ記事を読む
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureList() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featureList}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <Heading as="h3">{feature.title}</Heading>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout>
      <HomepageHeader />
      <main>
        <FeatureList />
      </main>
    </Layout>
  );
}
