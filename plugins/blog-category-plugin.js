/**
 * カスタムプラグイン：ブログ記事のカテゴリー情報をグローバルデータとして公開
 */
module.exports = function blogCategoryPlugin(context, options) {
  return {
    name: 'blog-category-plugin',
    async allContentLoaded({allContent, actions}) {
      const {setGlobalData} = actions;

      // ブログプラグインのコンテンツを取得
      const blogContent = allContent['docusaurus-plugin-content-blog']?.default;

      if (!blogContent?.blogPosts) {
        console.warn('Blog content not found');
        return;
      }

      // ブログポストのメタデータを抽出（カテゴリー情報を含む）
      const postsMetadata = blogContent.blogPosts.map(post => ({
        permalink: post.metadata.permalink,
        title: post.metadata.title,
        categories: post.metadata.frontMatter?.categories || []
      }));

      // グローバルデータとして公開
      setGlobalData({blogPosts: postsMetadata});
    }
  };
};
