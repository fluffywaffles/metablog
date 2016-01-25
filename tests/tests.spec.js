
describe('metablog.Blog', function () {
  var blog

  beforeAll(function () {
    blog = metablog.Blog()
    blog.pages.items.push(blog.Page({
      template: 'home.jade'
    }))
  })

  it('has collections of posts and pages', function () {
    expect(blog.Collection.isInstance(blog.pages)).toEqual(true)
    expect([].every(blog.Page.isInstance, blog.pages.items)).toEqual(true)
  })

  it('', function () {
    var blog = metablog.Blog()
    blog.posts
      .use(slug('title', '-'))
      .use(tags)
      .use(trackEdits)
      .use(publishDate)
      .use(disqusComments)

    blog.pages
      .use(renderingEngine.jade)
      .use(renderingPath('posts'))
      .use(staticPath('public'))
      .use(baseTemplate('posts/_template.jade'))
  })

})
