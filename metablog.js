var fs = require('fs')

async function template (str, vars, root = '.') {
  let m

  const ifre = /#{if\(([^)}]+)\)(.+)}/g
  let s = str.slice()
  while (m = ifre.exec(str)) {
    console.log(`IF Found: ${m[0]}`)
    if (vars[m[1]]) {
      let toput = m[2]
      if (/include\([^)]+\)/g.test(toput)) {
        toput = '#{' + toput.trim() + '}'
      }
      console.log(`Writing: ${toput.trim()}`)
      s = s.replace(m[0], toput.trim())
    } else {
      // FIXME(jordan): Detect if there are newlines to coalesce.
      console.log(`Removing line, !! assuming newlines on either side! !!`)
      s = s.slice(0, s.indexOf(m[0]) - 1) + s.slice(s.indexOf(m[0]) + m[0].length + 1)
    }
  }

  const includere  = /([ ]+)*#{include\(([^)}]+)\)}/g
  str = s, s = str.slice()
  while (m = includere.exec(str)) {
    console.log(`INCLUDE Found: ${m[0]}`)
    if (m[1]) console.log(`HAS LEADING SPACES: ${m[1].length}`)
    console.log(`>>> Recur...`)
    let toput = await template(await read(root + '/' + m[2]), vars, root)
    console.log(`<<< Recur done!`)
    if (m[1]) {
      console.log(`Preserve leading spaces...`)
      toput = toput.split('\n').map(l => l.length ? m[1] + l : l).join(`\n`)
    }
    console.log(`Spaces restored!`)
    console.log(`INCLUDE DONE.`)
    s = s.replace(m[0], toput)
  }

  const templatere = /#{([^}]+)}/g
  str = s, s = str.slice()
  while (m = templatere.exec(str)) {
    console.log(`PLAIN Found: ${m[0]}`)
    let toput = vars[m[1]]
    // FIXME(jordan): This code is grody.
    let lastNewline = str.substr(0, m.index).lastIndexOf('\n')
    console.log(str.substr(lastNewline + 1, m.index - lastNewline - 1))
    if (lastNewline != -1) {
      let leadingSpaces = str.substr(lastNewline + 1, m.index - lastNewline - 1).match(/^([ ]+)/)
      if (leadingSpaces) {
        leadingSpaces = leadingSpaces[0]
        console.log(`HAS LEADING SPACES: ${leadingSpaces.length}`)
        if (~toput.indexOf('\n')) {
          toput = toput.split('\n').map(l => l.length ? leadingSpaces + l : l).join('\n')
        }
      }
    }
    console.log(`Writing: ${toput}`)
    s = s.replace(m[0], toput)
  }

  return s
}

function bindall (o) {
  for (let [ key, val ] of Object.entries(o)) {
    if (val instanceof Function) {
      o[key] = val.bind(o)
    }
  }
}

function mkdirp (d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d)
}

function read (f) {
  return new Promise((resolve, reject) => {
    fs.readFile(f, (err, file) => {
      if (err) reject(err)
      else resolve(file.toString().trim())
    })
  })
}

function write (f, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(f, data, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

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
      await write(outdir + '/' + name, out)
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

