import path from 'node:path'
import fs from 'node:fs'

function generateMarkdownForExample(title, description, file, htmlContent) {
  return `
# ${title}

${description}

<iframe src="/demos/${file}" width="100%" style="border:none; height:400px"></iframe>

\`\`\`html
${htmlContent}
\`\`\`
`
}

function generateExamplesFolder() {
  const demosFolder = path.join('docs', 'public', 'demos')
  const docsFolder = path.join('docs', 'examples')

  // 删除 docs 文件夹下除 index.md 外的所有文件
  const docFiles = fs.readdirSync(docsFolder)
  docFiles.forEach((file) => {
    const filePath = path.join(docsFolder, file)
    if (file !== 'index.md') {
      fs.unlinkSync(filePath)
    }
  })

  const demoFiles = fs.readdirSync(demosFolder).filter((f) => f.endsWith('html'))
  for (const file of demoFiles) {
    const htmlFile = path.join(demosFolder, file)
    const htmlContent = fs.readFileSync(htmlFile, 'utf-8')
    const htmlContentLines = htmlContent.split('\n')
    const title = htmlContentLines
      .find((l) => l.includes('<title'))
      .replace('<title>', '')
      .replace('</title>', '')
      .trim()
    const description = htmlContentLines.find((l) => l.includes('og:description')).replace(/.*content=\"(.*)\".*/, '$1')

    const mdFileName = file.replace('.html', '.md')
    const exampleMarkdown = generateMarkdownForExample(title, description, file, htmlContent)
    fs.writeFileSync(path.join(docsFolder, mdFileName), exampleMarkdown)
  }
}

generateExamplesFolder()
