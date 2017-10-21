const { read, write, mkdir } = require('../util')
const path = require('path')
const template = require('../templater')

async function compile (outdir = 'dist') {
  mkdir(outdir)

  let tpl = await read('template/entry')

  for (let name of this.pages) {
    let content = await read(name)
    if (this.config.DEBUG) console.log(
      `\n=== Templater invoked... Debug! ===================================================\n`
    )
    let out = await template(tpl, {
      content,
      referrer: 'origin-when-cross-origin',
      title: name,
      header: 'hello',
      subheader: 'there',
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
    if (this.config.DEBUG) console.log(
      `\n=== Templater done. ===============================================================\n`
    )
    if (this.config.DEBUG) console.log(out)
    await write(outdir + '/' + path.basename(name) + '.html', out)
  }
}

module.exports.compile = compile
