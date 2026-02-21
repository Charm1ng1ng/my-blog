'use strict';

hexo.extend.generator.register('search-page', function(locals) {
  return {
    path: 'search/index.html',
    layout: 'search',
    data: {}
  };
});
