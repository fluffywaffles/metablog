
var metablog = require('../src/metablog')
  , Base     = require('../src/_baseclass')

describe('metablog.Blog', function () {

  var blog

  blog = metablog.Blog()

  it('Should have a name', function () {
    expect(blog.name).toBeDefined()
  })

  it('Should have some form of unique identifier', function () {
    expect(blog.__id).toBeDefined()
  })

  it('Should have some form of version', function () {
    expect(blog.__version).toBeDefined()
  })

  it('Should be easily composeable', function () {
    var BetterBlog = Base.define(function (bblog) {
      bblog.isBetter = true
    }).compose(metablog.Blog)

    var bblog = BetterBlog()

    expect(bblog.isBetter).toBe(true)
  })

  it('Should have pages, posts, resources, and collections', function () {
    expect(blog.pages).toEqual(metablog.Collection.of(metablog.Page))
    expect(blog.posts).toEqual(metablog.Collection.of(metablog.Post))
    expect(blog.resources).toEqual(metablog.Collection.of(metablog.Resource))
    expect(blog.collections).toEqual(metablog.Collection.of(metablog.Collection))
  })

  it('Should support plugins', function () {
    var pblog = metablog.Blog.use(function blogPlugin (b) {
      b.hasAPlugin = true
    })

    expect(pblog().hasAPlugin).toBe(true)
  })

  it('Should have its own Page, Post, Resouce, and Collection types', function () {
    ;[ 'Page'
       , 'Post'
       , 'Resources'
       , 'Collection' ].forEach(function (item) {
        expect(metablog[item].isInstance(blog[item])).toBe(true)
      })
  })

})
