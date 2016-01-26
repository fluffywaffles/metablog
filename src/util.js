var util = module.exports

util.extend2 = function extend2 (a, b) {
  for (var bk in b)
    a[bk] = b[bk]
  return a
}
