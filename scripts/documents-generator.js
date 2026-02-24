/**
 * 文档归档生成器
 * 为 type: 'documents' 的文章生成分页归档页面
 * 使用 hexo-pagination 库实现分页，路径格式: documents/page/x/
 */
'use strict';

const pagination = require('hexo-pagination');

hexo.extend.generator.register('documents', function(locals) {
  const { config } = this;
  
  const documentsDir = 'documents';
  const paginationDir = config.pagination_dir || 'page';
  const perPage = config.per_page || 10;
  const result = [];

  const documentPosts = locals.posts.filter(post => post.type === 'documents');
  
  if (!documentPosts.length) return result;

  function generate(path, posts, options = {}) {
    options.documents = true;
    
    result.push(...pagination(path, posts, {
      perPage,
      layout: ['archive', 'index'],
      format: paginationDir + '/%d/',
      data: options
    }));
  }

  generate(documentsDir, documentPosts);

  return result;
});
