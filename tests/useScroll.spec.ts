import { expect, test } from '@playwright/test'

test.describe('useScroll with VueInstance', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到测试页面
    await page.goto('/scroll-test')
  })

  test('should accept VueInstance as container', async ({ page }) => {
    // 等待容器加载完成
    await page.waitForSelector('.scroll-container')

    // 获取容器元素
    const container = page.locator('.scroll-container')

    // 执行滚动
    await container.evaluate((el) => {
      el.scrollTop = 100
    })

    // 等待滚动事件处理完成
    await page.waitForTimeout(300)

    // 验证滚动位置
    const scrollTop = await container.evaluate(el => el.scrollTop)
    expect(scrollTop).toBe(100)

    // 验证滚动值是否被正确更新到UI
    const scrollValue = await page.locator('.scroll-y-value').textContent()
    expect(scrollValue).toBe('100')
  })

  test('should accept VueInstance as target', async ({ page }) => {
    // 等待目标元素加载完成
    await page.waitForSelector('.scroll-target')

    // 获取容器和目标元素
    const container = page.locator('.scroll-container')
    const target = page.locator('.scroll-target')

    // 执行滚动
    await container.evaluate((el) => {
      el.scrollTop = 50
    })

    // 等待滚动事件处理完成
    await page.waitForTimeout(100)

    // 验证目标元素的可见性
    const isVisible = await target.isVisible()
    expect(isVisible).toBeTruthy()

    // 验证目标元素的位置信息
    const boundingBox = await target.boundingBox()
    expect(boundingBox?.y).toBeDefined()
  })

  test('should work with both VueInstance container and target', async ({ page }) => {
    // 等待元素加载完成
    await page.waitForSelector('.scroll-container')
    await page.waitForSelector('.scroll-target')

    // 获取元素
    const container = page.locator('.scroll-container')
    const target = page.locator('.scroll-target')
    const progressValue = page.locator('.scroll-progress-value')

    // 执行多个滚动操作
    const scrollPositions = [0, 50, 100]

    for (const position of scrollPositions) {
      // 滚动到指定位置
      await container.evaluate((el, pos) => {
        el.scrollTop = pos
      }, position)

      // 等待滚动事件处理完成
      await page.waitForTimeout(100)

      // 验证滚动位置
      const scrollTop = await container.evaluate(el => el.scrollTop)
      expect(scrollTop).toBe(position)

      // 验证进度值
      const progress = await progressValue.textContent()
      expect(parseFloat(progress || '0')).toBeGreaterThanOrEqual(0)
      expect(parseFloat(progress || '0')).toBeLessThanOrEqual(1)
    }

    // 验证目标元素的可见性变化
    const isVisible = await target.isVisible()
    expect(isVisible).toBeTruthy()
  })
})
