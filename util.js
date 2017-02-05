const fs = require('fs')

module.exports.bindall = function bindall (o) {
  for (let [ key, val ] of Object.entries(o)) {
    if (val instanceof Function) {
      o[key] = val.bind(o)
    }
  }
}

module.exports.mkdirp = function mkdirp (d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d)
}

module.exports.read = function read (f) {
  return new Promise((resolve, reject) => {
    fs.readFile(f, (err, file) => {
      if (err) reject(err)
      else resolve(file.toString().trim())
    })
  })
}

module.exports.write = function write (f, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(f, data, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}
