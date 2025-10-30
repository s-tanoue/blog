import React from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import PaginatorNavLink from '@theme/PaginatorNavLink';
import styles from './styles.module.css';

export default function BlogPostPaginator(props) {
  const {nextItem, prevItem} = props;

  return (
    <nav
      className={styles.blogPostPaginator}
      aria-label={translate({
        id: 'theme.blog.post.paginator.navAriaLabel',
        message: 'Blog post page navigation',
        description: 'The ARIA label for the blog posts pagination',
      })}>
      <div className={styles.paginatorContainer}>
        {prevItem && (
          <PaginatorNavLink
            {...prevItem}
            subLabel={
              <Translate
                id="theme.blog.post.paginator.newerPost"
                description="The blog post button label to navigate to the newer/previous post">
                前の記事
              </Translate>
            }
          />
        )}
        {nextItem && (
          <PaginatorNavLink
            {...nextItem}
            subLabel={
              <Translate
                id="theme.blog.post.paginator.olderPost"
                description="The blog post button label to navigate to the older/next post">
                次の記事
              </Translate>
            }
            isNext
          />
        )}
      </div>
    </nav>
  );
}
