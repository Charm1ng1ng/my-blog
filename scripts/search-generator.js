/**
 * 搜索页面生成器
 * 注册 search-page generator，生成站内搜索页面 /search/index.html
 * 使用 search 布局渲染
 */
'use strict';

hexo.extend.generator.register('search-page', function(locals) {
  return {
    path: 'search/index.html',
    layout: 'search',
    data: {}
  };
});
