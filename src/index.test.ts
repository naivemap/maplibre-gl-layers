import { describe, expect, test } from 'vitest'
import { add } from '../src'

describe('加法函数测试', () => {
  test('1加1等于2', () => {
    expect(add(1, 1)).toBe(2)
  })
})
