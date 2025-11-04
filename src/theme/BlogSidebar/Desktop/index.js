import React, {useState, useMemo} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function BlogSidebarDesktop({sidebar}) {
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  // カテゴリーのリストを取得
  const categories = useMemo(() => {
    const categoriesSet = new Set(['すべて']);
    sidebar.items.forEach((item) => {
      // メタデータからカテゴリーを取得
      if (item.frontMatter?.categories) {
        item.frontMatter.categories.forEach((cat) => categoriesSet.add(cat));
      }
    });
    return Array.from(categoriesSet);
  }, [sidebar.items]);

  // 選択されたカテゴリーでフィルタリング
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'すべて') {
      return sidebar.items;
    }
    return sidebar.items.filter((item) =>
      item.frontMatter?.categories?.includes(selectedCategory)
    );
  }, [sidebar.items, selectedCategory]);

  return (
    <aside className="col col--2">
      <nav
        className={clsx(styles.sidebar, 'thin-scrollbar')}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}>
        <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md')}>
          {sidebar.title}
        </div>

        {/* カテゴリーフィルター */}
        <div className={clsx(styles.categoryFilter, 'margin-bottom--md')}>
          <label htmlFor="category-select" className={styles.categoryLabel}>
            カテゴリー:
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
          {filteredItems.map((item) => (
            <li key={item.permalink} className={styles.sidebarItem}>
              <Link
                isNavLink
                to={item.permalink}
                className={styles.sidebarItemLink}
                activeClassName={styles.sidebarItemLinkActive}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
