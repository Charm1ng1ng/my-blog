/**
 * 项目归档生成器
 * 为 type: 'projects' 的文章生成分页归档页面
 * 使用 hexo-pagination 库实现分页，路径格式: projects/page/x/
 */
'use strict';

const pagination = require('hexo-pagination');

hexo.extend.generator.register('projects', function(locals) {
  const { config } = this;
  
  const projectsDir = 'projects';
  const paginationDir = config.pagination_dir || 'page';
  const perPage = config.per_page || 10;
  const result = [];

  const projectPosts = locals.posts.filter(post => post.type === 'projects').sort('-date');
  
  if (!projectPosts.length) return result;

  function generate(path, posts, options = {}) {
    options.projects = true;
    
    result.push(...pagination(path, posts, {
      perPage,
      layout: ['archive', 'index'],
      format: paginationDir + '/%d/',
      data: options
    }));
  }

  generate(projectsDir, projectPosts);

  return result;
});
