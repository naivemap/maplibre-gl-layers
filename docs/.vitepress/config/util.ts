export function pascalToKebab(str: string) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

export function singularToPlural(word) {
  // 常见不规则变化的映射【这里用不到特殊的词】
  // const irregularMap = {
  //   child: 'children',
  //   foot: 'feet',
  //   tooth: 'teeth',
  //   mouse: 'mice',
  //   man: 'men',
  //   woman: 'women',
  //   person: 'people',
  //   goose: 'geese',
  //   ox: 'oxen'
  // }
  // // 先检查是否为不规则变化
  // if (irregularMap[word]) {
  //   return irregularMap[word]
  // }

  const lastLetter = word.slice(-1).toLowerCase()
  const lastTwoLetters = word.slice(-2).toLowerCase()

  // 以 s, x, z, ch, sh 结尾，加 es
  if (/[sxz]$/.test(lastLetter) || /(ch|sh)$/.test(lastTwoLetters)) {
    return word + 'es'
  }

  // 以辅音字母 + y 结尾，变 y 为 i 加 es
  if (/[^aeiou]y$/.test(lastTwoLetters)) {
    return word.slice(0, -1) + 'ies'
  }

  // 以 f 或 fe 结尾，变 f/fe 为 v 加 es
  if (/f$/.test(lastLetter)) {
    return word.slice(0, -1) + 'ves'
  }
  if (/fe$/.test(lastTwoLetters)) {
    return word.slice(0, -2) + 'ves'
  }

  // 其他情况直接加 s
  return word + 's'
}
