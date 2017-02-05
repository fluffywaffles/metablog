const fs = require('fs')
const template = require('./templater')
const { bindall, read, write, mkdirp } = require('./util')

/////////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////

const pagedir = 'page'
const outdir  = 'dist'

function Blog (
  ...pages
) {
  async function compile () {
    mkdirp(outdir)

    let tpl = await read('template/entry')

    for (let name of this.pages) {
      let content = await read(pagedir + '/' + name)
      console.log(
        `\n=== Templater invoked... Debug! ===================================================\n`
      )
      let out = await template(tpl, {
        content,
        referrer: 'origin-when-cross-origin',
        title: name,
        description: 'blah',
        og: true,
        'og:site_name': 'me.com',
        'og:type': 'website?',
        'og:title': 'i am me',
        'og:description': 'all about me',
        'og:url': 'localhost',
        'og:image': 'me.png',
        twitter: true,
        'twitter:card': 'summary_large_image',
        'twitter:title': 'i am me',
        'twitter:description': 'still all about me',
        'twitter:url': 'localhost',
        'twitter:image:src': 'me.png',
      })
      console.log(
        `\n=== Templater done. ===============================================================\n`
      )
      console.log(out)
      await write(outdir + '/' + name + '.html', out)
    }
  }

  const b = {
    pages,
    compile,
  }

  bindall(b)

  return b
}

/////////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////

let blog = Blog(
  ...fs.readdirSync(pagedir)
)

blog.compile()

