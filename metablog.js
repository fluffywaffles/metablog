var fs = require('fs')

async function template (str, vars, root = '.') {
  let m

  const ifre = /^#{if\(([^)}]+)\)(.+)}$/gm
  let s = str.slice()
  while (m = ifre.exec(str)) {
    console.log(`IF Found: ${m[0]}`)
    if (vars[m[1]]) {
      console.log(`Writing: ${m[2].trim()}`)
      s = s.replace(m[0], m[2].trim())
    } else {
      console.log(`Removing line.`)
      s = s.slice(0, s.indexOf(m[0]))  + s.slice(s.indexOf(m[0]) + m[0].length + 1)
    }
  }

  const includere  = /([ ]+)*#{include\(([^)}]+)\)}/g
  str = s, s = str.slice()
  while (m = includere.exec(str)) {
    console.log(`INCLUDE Found: ${m[0]}`)
    console.log(`HAS LEADING SPACES: ${m[1].length}`)
    console.log(`>>> Recur...`)
    let toput = await template(await read(root + '/' + m[2]), vars, root)
    console.log(`<<< Recur done!`)
    console.log(`Preserve leading spaces...`)
    toput = toput.split('\n').map(l => l.length ? m[1] + l : l).join(`\n`)
    console.log(`Spaces restored!`)
    console.log(`INCLUDE DONE.`)
    s = s.replace(m[0], toput)
  }

  const templatere = /#{([^}]+)}/g
  str = s, s = str.slice()
  while (m = templatere.exec(str)) {
    console.log(`PLAIN Found: ${m[0]}`)
    console.log(`Writing: ${vars[m[1]]}`)
    s = s.replace(m[0], vars[m[1]])
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
const outdir   = 'dist'

async function Page (
  name
) {
  return {
    name,
    content: await read(pagedir + '/' + name)
  }
}

function Blog (
  ...pages
) {
  async function compile () {
    mkdirp(outdir)

    let tpl = await read('template/entry')

    for (let name of this.pages) {
      let { content } = await Page(name)
      console.log(
        `\n=== Templater invoked... Debug! ===================================================\n`
      )
      let out = await template(tpl, { content, referer: 'me!', title: name, description: 'blah' })
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

