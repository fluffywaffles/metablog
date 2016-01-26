// [[METABLOG]]
var Base = require('./_baseclass')
  , util = require('./util')

var mb = Object.create(null)
var noop = function () { }
var mimetypeTest = /[A-z*]+\/[A-z*]+/.test

function validMetadata (md) {
  return (typeof md.title === 'string')
          ? util.extend2({}, md)
          : console.warn('Bad metadata:title') && { title: null }
}

function validUri (uri) {
  return (/(\/?(\/[A-z0-9-_])+)|\//.test(uri))
          ? uri
          : console.warn('Bad URI') && '/?!="bad_uri"'
}

function postStatus (post) {
  var __status = 'draft'
  post.status = function (s) {
    if (/^(draft|live)$/.test(s)) __status = s
  }
}

var Collection = mb.Collection = Base.define(function Collection (coll, options) {
  coll.type  = noop
  coll.items = [ ]

  Object.getOwnPropertyNames(Array.prototype).forEach(function (f) {
    if (typeof coll.items[f] === 'function')
        coll[f] = coll.items[f].bind(coll.items) // push, indexOf, pop, ...
  })

  util.extend2(coll, options)
})

Collection.ofMimetype = function (mt) {
  if (mimetypeTest(mt))
    return Collection({ type: function (t) { return mt === t } })
  else console.error('Cannot make collection of invalid mimetype:', mt)
}

Collection.of = function (c) {
  return Collection({ type: c.instanceOf })
}

var Page = mb.Page = Base.define(function (page, options) {
  page.metadata = validMetadata(options.metadata)
  page.uri      = validUri(options.uri)
  page          = util.extend2(options, page)
})

var Post = mb.Post = Page.use(postStatus)

var Resource = mb.Resource = Base.define(function (res, options) {
  res.type = mimetypeTest
  res.uri  = uri(options.uri)
})

var Blog = mb.Blog = Base.define(function Blog (blog, options) {
  blog.options = util.extend2({}, options)

  ;[ 'Page', 'Post', 'Resource', 'Collection' ].forEach(function (blogPart) {
    var partOptions = blog.options[blogPart.toLowerCase() + 's']
    if (partOptions && partOptions.use)
      blog[blogPart] = mb[blogPart].use(partOptions.use)
    else
      blog[blogPart] = mb[blogPart]
  })

  blog.pages       = Collection.of(blog.Page)
  blog.posts       = Collection.of(blog.Post)
  blog.resources   = Collection.of(blog.Resource)
  blog.collections = Collection.of(blog.Collection)

  blog.add = function (type, thing) {
    blog[type.toLowerCase() + 's'].push(thing)
  }
})

module.exports = mb
