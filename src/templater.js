/* =================================================================================================
 * TODO(jordan) Some notes here.
 * =================================================================================================
 *    This is fast enough to be acceptable for any use case I have for it, but it's horrifyingly
 *    non-optimal in general. This is O(n^n) I want to say -- worse case being n files with n lines
 *    and every line is an #{include(...)}.
 *
 *    That's the huge performance hit. Smaller, but still significant, is that we're repeatedly
 *    re-parsing the same files here. Because we have n regular expressions for n productions, we
 *    parse the entire text of the file n times.
 *
 *    Similarly, we are inefficient in building up our output string. We repeatedly search back
 *    through it even during the processing of a single production, which is very unnecessary and
 *    inefficient.
 *
 *  Ways to improve:
 * =================================================================================================
 *    Since JS doesn't have tail recusion it makes no sense to try to optimize the recursive case
 *    here: it needs to be eliminated. One way or another we generate a tree of the #{include(...)}s
 *    and then combine up it back to the entry. One option is to maintain a queue (BFS); another
 *    option is to precompute the tree of includes in memory instead, so we preprocess
 *    #{include(...)}s before we ever start handling our other parsing rules. This presents a very
 *    surmountable added challenge to #{if(...) include(...)} syntax, which becomes a special case--
 *    but nevertheless.
 *
 *    We should either combine our regular expressions into one regular expression (ehhhhh) or we
 *    should traverse the input string token by token looking for `#{` before we start trying to
 *    process anything. Combining RegExps feels like a bad idea just because we'll end up with a
 *    million and a half matching clauses and most of the returned array values will just be empty,
 *    which means we'll probably end up writing ugly stuff like `if (m[1]) { // parse include... }`.
 *
 *    We shouldn't be doing s.replace(...) period -- we should be appending data token by token.
 *
 * This is currently fast enough.
 * =================================================================================================
 *    0.06s on my existing templates is good enough.
 *    If things get slow, refer to the above for making them faster.
 *
 *    0.06s is FAST ENOUGH.
 *
 *    Right now, it's "parallelized" (pfff haha) so that complicates trying to analyze its
 *    efficiency little bit. I can't say if the async structure changes its running time, since I
 *    haven't tested it synchronously at all. That may be why it's even as fast as it is. Who can
 *    say. Or maybe the Node compiler has a magic O(n^n) => O(n) transformation in it?! :P
 * =================================================================================================
 */
const { read } = require('./util')

module.exports = async function template (str, vars, root = '.') {
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

  const linkre = /#{link\(([^)}]+)\)(.+)}/g
  str = s, s = str.slice()
  while (m = linkre.exec(str)) {
    console.log(`LINK Found: ${m[0]}`)
    let link = `<a href="./${m[1]}.html">${m[2].trim()}</a>`
    console.log(`Writing: ${link}`)
    s = s.replace(m[0], link)
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
          toput = toput.split('\n').map(l => l.length ? leadingSpaces + l : l).join('\n').trim()
        }
      }
    }
    console.log(`Writing: ${toput}`)
    s = s.replace(m[0], toput)
  }

  return s
}
