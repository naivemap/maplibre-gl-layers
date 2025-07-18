import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ['./src'],
      reporter: 'html',
      reportsDirectory: './tests/coverage'
    }
  }
})
