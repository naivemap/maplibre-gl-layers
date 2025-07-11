import fs from 'fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ReflectionKind } from 'typedoc'
import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import apiJSON from '../../api/api.json'
import { pascalToKebab, singularToPlural } from './util'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-Hans-CN',
  title: 'Lib',
  // titleTemplate: 'Lib',
  description: 'A JavaScript library template built with Vite',
  base: '/vite-lib-template/',
  head: [['link', { rel: 'icon', href: '/vite-lib-template/logo.svg' }]],
  cleanUrls: true,
  rewrites: {
    '(.*)/README.md': '(.*)/index.md'
  },
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true
    },
    math: true
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      light: '/logo.svg',
      dark: '/logo.svg'
    },
    nav: [
      { text: '快速开始', link: '/starter' },
      { text: '示例', link: '/examples' },
      { text: 'API', link: '/api' }
    ],
    sidebar: {
      '/api': sidebarApi(),
      '/examples': [
        {
          text: '示例',
          link: '/examples',
          items: sidebarExamples()
        }
      ]
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/huanglii/vite-lib-template'
      }
    ],
    editLink: {
      pattern: 'https://github.com/huanglii/vite-lib-template/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },
    footer: {
      // message: '基于 MIT 许可发布',
      copyright: `版权所有 © 2025-${new Date().getFullYear()} naivemap`
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    outline: {
      label: '目录',
      level: [2, 3]
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容',
    notFound: {
      title: '找不到页面',
      quote: '抱歉，我们无法找到您需要的页面。',
      linkLabel: '返回首页',
      linkText: '返回首页'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            displayDetails: '显示匹配详情',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '关闭搜索',
            noResultsText: '无法找到相关结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '取消'
            }
          }
        }
      }
    }
  }
})

/**
 * 生成 API 侧边栏
 */
function sidebarApi(): DefaultTheme.SidebarItem[] {
  /**
   * 按类型分组 Kinds of reflection:
   * URL_ADDRESS   * https://typedoc.org/api/enums/Models.ReflectionKind.html
   */
  const groups = Map.groupBy(apiJSON.children, (item) => {
    return ReflectionKind[item.kind]
  })

  const res: DefaultTheme.SidebarItem[] = []
  for (const [key, value] of groups) {
    const path = singularToPlural(pascalToKebab(key))
    res.push({
      text: key,
      items: value.map((item) => {
        return { text: item.name, link: `/api/${path}/${item.name}` }
      })
    })
  }
  return res
}

/**
 * 生成示例侧边栏
 */
function sidebarExamples(): DefaultTheme.SidebarItem[] {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const folder = resolve(__dirname, '../../public/demos')
  const files = fs.readdirSync(folder).filter((f) => f.endsWith('html'))

  const res: DefaultTheme.SidebarItem[] = []
  files.forEach((file) => {
    const htmlContent = fs.readFileSync(resolve(folder, file), 'utf-8')
    const htmlContentLines = htmlContent.split('\n')
    const title = htmlContentLines
      .find((l) => l.includes('<title'))
      ?.replace('<title>', '')
      .replace('</title>', '')
      .trim()!
    const name = file.replace('.html', '')
    res.push({ text: title, link: `/examples/${name}` })
  })
  return res
}
