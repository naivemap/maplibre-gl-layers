import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Demo from './components/Demo.vue'
import './styles/index.less'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Demo', Demo)
  }
} satisfies Theme
