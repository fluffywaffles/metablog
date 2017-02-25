const fs = require('fs')
const path = require('path')
const { bindall } = require('./src/util')
const { compile } = require('./src/blog/compile')

/////////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////

function Blog (
  ...pages
) {
  const b = {
    // Fields.
    pages,
    // Methods.
    compile,
  }

  bindall(b)

  return b
}

/////////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////

let blog = Blog(
  ...fs.readdirSync('page').map(p => path.resolve('page/' + p))
)

blog.compile()

