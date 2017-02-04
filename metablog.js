var fs = require('fs')

async function template (str, vars, root = '.') {
  const includere  = /#{include\(([^)]+)\)}/g
  let s = str.slice()
  while (m = includere.exec(str)) {
    s = s.replace(m[0], await read(root + '/' + m[1]))
  }
  const templatere = /#{([^}]+)}/g
  str = s, s = str.slice()
  while (m = templatere.exec(str)) {
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

    let tpl = await read('template/main')

    for (let name of this.pages) {
      let { content } = await Page(name)
      let out = await template(tpl, { content })
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

header = fs.readFileSync('template/header').toString()
body   = fs.readFileSync('template/body').toString()
footer = fs.readFileSync('template/footer').toString()

let blog = Blog(
  ...fs.readdirSync(pagedir)
)

blog.compile()
