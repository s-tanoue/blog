import React, {useState, useMemo} from 'react';
import Link from '@docusaurus/Link';
import {NavbarSecondaryMenuFiller} from '@docusaurus/theme-common';

function BlogSidebarMobileSecondaryMenu({sidebar}) {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  // カテゴリーのリストを取得
  const categories = useMemo(() => {
    const categoriesSet = new Set(['すべて']);
    sidebar.items.forEach((item) => {
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

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Calculate the items to display on the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // カテゴリー変更時にページをリセット
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      {/* カテゴリーフィルター */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--ifm-color-emphasis-200)'
      }}>
        <label htmlFor="category-select-mobile" style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          カテゴリー:
        </label>
        <select
          id="category-select-mobile"
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.9rem',
            borderRadius: '4px',
            border: '1px solid var(--ifm-color-emphasis-300)',
            backgroundColor: 'var(--ifm-background-color)',
            color: 'var(--ifm-font-color-base)'
          }}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <ul className="menu__list">
        {currentItems.map((item) => (
          <li key={item.permalink} className="menu__list-item">
            <Link
              isNavLink
              to={item.permalink}
              className="menu__link"
              activeClassName="menu__link--active">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderTop: '1px solid var(--ifm-color-emphasis-200)'
        }}>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentPage === 1 ? 'var(--ifm-color-emphasis-200)' : 'var(--ifm-color-primary)',
              color: currentPage === 1 ? 'var(--ifm-color-emphasis-600)' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}>
            ← 前へ
          </button>

          <span style={{
            fontSize: '0.9rem',
            color: 'var(--ifm-color-emphasis-800)'
          }}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentPage === totalPages ? 'var(--ifm-color-emphasis-200)' : 'var(--ifm-color-primary)',
              color: currentPage === totalPages ? 'var(--ifm-color-emphasis-600)' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}>
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogSidebarMobile(props) {
  return (
    <NavbarSecondaryMenuFiller
      component={BlogSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}
