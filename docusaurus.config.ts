import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: '開発ブログ',
  tagline: 'ソフトウェア開発に役立つ情報を残していきます',
  favicon: 'img/logo.svg',
  url: 'https://s-tanoue.github.io',
  baseUrl: '/blog/',
  organizationName: 's-tanoue',
  projectName: 'blog',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/s-tanoue/blog/tree/main/',
        },
        blog: {
          routeBasePath: '/', // ブログをルートに配置
          showReadingTime: true,
          editUrl: 'https://github.com/s-tanoue/blog/tree/main/',
          postsPerPage: 10, // 1ページあたり10件の記事を表示
          blogSidebarCount: 'ALL', // サイドバーに全ての記事を表示
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: ['./plugins/blog-category-plugin.js'],
  themeConfig: {
    image: 'img/logo.svg',
    navbar: {
      title: '開発ブログ',
      logo: {
        alt: 'Blog Logo',
        src: 'img/logo.svg',
      },
      items: [
        {type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'ドキュメント'},
        {to: '/', label: 'ブログ', position: 'left'},
        {
          href: 'https://github.com/s-tanoue/blog',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'コンテンツ',
          items: [
            {
              label: 'ドキュメント',
              to: '/docs/intro',
            },
            {
              label: 'ブログ',
              to: '/',
            },
          ],
        },
        {
          title: 'コミュニティ',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/s-tanoue/blog',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} s-tanoue`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
