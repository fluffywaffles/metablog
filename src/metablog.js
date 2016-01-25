// [[METABLOG]]

var Classy = require('classy-js')

var Classy$Class$Pluggable = Classy.Module.$Class(function (classyClass) {
  classyClass.plugins = []
  classyClass.use = function (plugin) {
    classyClass.plugins.push(plugin)
    return classyClass
  }
})

var Pluggable = Classy$Class$Pluggable(Classy);

var Render = function (self) {
  self.render = function () {
    console.log('render this Renderable')
  }
}

var Renderable = Pluggable.extend(Render);

var Post = Pluggable.extend(function (post) {
  post.author = ''
  post.title  = ''
  post.content = ''
})

var Page = Renderable.extend(function (page) {
  page.template = 'index.jade'
})

var Collection = Pluggable.extend(function (col) {
  col.items = []
})

var Blog = Pluggable(function (blog) {
  blog.name = ''
  blog.url  = 'http'
})

module.exports = {
  Blog: Blog,
  Post: Post,
  Page: Page,
  Collection: Collection
}
