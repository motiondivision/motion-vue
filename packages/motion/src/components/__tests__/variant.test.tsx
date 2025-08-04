import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Motion } from '@/components'
import { motionValue, stagger } from 'framer-motion/dom'
import { defineComponent, h, nextTick, onMounted } from 'vue'

describe('animate prop as variant', () => {
  it('when: beforeChildren works correctly', async () => {
    const promise = new Promise((resolve) => {
      const opacity = motionValue(0.1)
      const variants = {
        visible: {
          opacity: 1,
          transition: { duration: 1, when: 'beforeChildren' },
        },
        hidden: {
          opacity: 0.1,
        },
      }

      mount({
        render() {
          return h(Motion, {
            variants,
            initial: 'hidden',
            animate: 'visible',
          }, {
            default: () => [
              h(Motion, null, {
                default: () => [
                  h(Motion, { variants, style: { opacity } }),
                ],
              }),
            ],
          })
        },
        components: { Motion },
      })

      setTimeout(() => resolve(opacity.get()), 200)
    })

    await expect(promise).resolves.toBe(0.1)
  })

  it('components without variants are transparent to stagger order', async () => {
    const [recordedOrder, staggeredEqually] = await new Promise<[number[], boolean]>((resolve) => {
      const order: number[] = []
      const delayedBy: number[] = []
      const staggerDuration = 0.1

      const updateDelayedBy = (i: number) => {
        if (delayedBy[i])
          return
        delayedBy[i] = performance.now()
      }

      const checkStaggerEquidistance = () => {
        let isEquidistant = true
        let prev = 0
        for (let i = 0; i < delayedBy.length; i++) {
          if (prev) {
            const timeSincePrev = prev - delayedBy[i]
            if (Math.round(timeSincePrev / 100) * 100 !== staggerDuration * 1000) {
              isEquidistant = false
            }
          }
          prev = delayedBy[i]
        }
        return isEquidistant
      }

      const parentVariants = {
        visible: {
          transition: {
            staggerChildren: staggerDuration,
            staggerDirection: -1,
          },
        },
      }

      const variants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.000001 },
        },
      }

      mount({
        render() {
          return (
            <Motion
              initial="hidden"
              animate="visible"
              variants={parentVariants}
              onAnimationComplete={() =>
                requestAnimationFrame(() =>
                  resolve([order, checkStaggerEquidistance()]),
                )}
            >
              <Motion>
                <Motion />
                <Motion
                  variants={variants}
                  onUpdate={() => {
                    updateDelayedBy(0)
                    order.push(1)
                  }}
                  style={{ willChange: 'auto' }}
                />
                <Motion
                  variants={variants}
                  onUpdate={() => {
                    updateDelayedBy(1)
                    order.push(2)
                  }}
                  style={{ willChange: 'auto' }}
                />
              </Motion>
              <Motion>
                <Motion
                  variants={variants}
                  onUpdate={() => {
                    updateDelayedBy(2)
                    order.push(3)
                  }}
                  style={{ willChange: 'auto' }}
                />
                <Motion
                  variants={variants}
                  onUpdate={() => {
                    updateDelayedBy(3)
                    order.push(4)
                  }}
                  style={{ willChange: 'auto' }}
                />
              </Motion>
            </Motion>
          )
        },
        components: { Motion },
      })
    })

    expect(recordedOrder).toEqual([4, 3, 2, 1])
    expect(staggeredEqually).toEqual(true)
  })
  it('child variants with value-specific transitions correctly calculate delay based on staggerChildren (deprecated)', async () => {
    const isCorrectlyStaggered = await new Promise((resolve) => {
      const childVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { opacity: { duration: 0.1 } },
        },
      }

      const Component = defineComponent({
        setup() {
          const a = motionValue(0)
          const b = motionValue(0)

          onMounted(() => {
            a.on('change', (latest) => {
              if (latest >= 1 && b.get() === 0) {
                resolve(true)
              }
            })
          })

          return () => (
            <Motion
              variants={{
                hidden: {},
                visible: {
                  x: 100,
                  transition: { staggerChildren: 0.15 },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <Motion
                variants={childVariants}
                style={{ opacity: a }}
              />
              <Motion
                variants={childVariants}
                style={{ opacity: b }}
              />
            </Motion>
          )
        },
      })

      mount(Component)
    })

    expect(isCorrectlyStaggered).toBe(true)
  })

  it('child variants with stagger function passed to delayChildren work correctly', async () => {
    const [recordedOrder, staggeredEqually] = await new Promise<[number[], boolean]>((resolve) => {
      const order: number[] = []
      const delayedBy: number[] = []
      const staggerDuration = 0.1

      const updateDelayedBy = (i: number) => {
        if (delayedBy[i])
          return
        delayedBy[i] = performance.now()
      }

      const checkStaggerEquidistance = () => {
        let isEquidistant = true
        let prev = 0
        for (let i = 0; i < delayedBy.length; i++) {
          if (prev) {
            const timeSincePrev = prev - delayedBy[i]
            if (Math.round(timeSincePrev / 100) * 100 !== staggerDuration * 1000) {
              isEquidistant = false
            }
          }
          prev = delayedBy[i]
        }
        return isEquidistant
      }

      const parentVariants = {
        visible: {
          transition: {
            delayChildren: stagger(staggerDuration, { from: 'last' }),
          },
        },
      }

      const variants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.000001 },
        },
      }

      mount({
        render() {
          return (
            <Motion
              initial="hidden"
              animate="visible"
              variants={parentVariants}
              onAnimationComplete={() =>
                requestAnimationFrame(() =>
                  resolve([order, checkStaggerEquidistance()]),
                )}
            >
              <Motion
                variants={variants}
                onUpdate={() => {
                  updateDelayedBy(0)
                  order.push(1)
                }}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => {
                  updateDelayedBy(1)
                  order.push(2)
                }}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => {
                  updateDelayedBy(2)
                  order.push(3)
                }}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => {
                  updateDelayedBy(3)
                  order.push(4)
                }}
                style={{ willChange: 'auto' }}
              />
            </Motion>
          )
        },
        components: { Motion },
      })
    })

    expect(recordedOrder).toEqual([4, 3, 2, 1])
    expect(staggeredEqually).toEqual(true)
  })

  it('stagger function with different "from" options work correctly', async () => {
    const [centerOrder, firstOrder] = await new Promise<[number[], number[]]>((resolve) => {
      const centerOrder: number[] = []
      const firstOrder: number[] = []
      let centerComplete = false
      let firstComplete = false

      const checkComplete = () => {
        if (centerComplete && firstComplete) {
          resolve([centerOrder, firstOrder])
        }
      }

      const centerVariants = {
        visible: {
          transition: {
            delayChildren: stagger(0.1, { from: 'center' }),
          },
        },
      }

      const firstVariants = {
        visible: {
          transition: {
            delayChildren: stagger(0.1, { from: 'first' }),
          },
        },
      }

      const variants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.000001 },
        },
      }

      // Test center stagger
      mount({
        render() {
          return (
            <Motion
              initial="hidden"
              animate="visible"
              variants={centerVariants}
              onAnimationComplete={() => {
                centerComplete = true
                checkComplete()
              }}
            >
              <Motion
                variants={variants}
                onUpdate={() => centerOrder.push(1)}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => centerOrder.push(2)}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => centerOrder.push(3)}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => centerOrder.push(4)}
                style={{ willChange: 'auto' }}
              />
            </Motion>
          )
        },
        components: { Motion },
      })

      // Test first stagger
      mount({
        render() {
          return (
            <Motion
              initial="hidden"
              animate="visible"
              variants={firstVariants}
              onAnimationComplete={() => {
                firstComplete = true
                checkComplete()
              }}
            >
              <Motion
                variants={variants}
                onUpdate={() => firstOrder.push(1)}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => firstOrder.push(2)}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => firstOrder.push(3)}
                style={{ willChange: 'auto' }}
              />
              <Motion
                variants={variants}
                onUpdate={() => firstOrder.push(4)}
                style={{ willChange: 'auto' }}
              />
            </Motion>
          )
        },
        components: { Motion },
      })
    })

    // Center stagger should start from middle elements
    expect(centerOrder).toEqual([2, 3, 1, 4])
    // First stagger should start from first element
    expect(firstOrder).toEqual([1, 2, 3, 4])
  })
  it('staggerChildren is calculated correctly for new children', async () => {
    const Component = defineComponent({
      props: {
        items: {
          type: Array as () => string[],
          required: true,
        },
      },
      setup(props) {
        return () => (
          <Motion
            animate="enter"
            variants={{
              enter: { transition: { delayChildren: stagger(0.1) } },
            }}
          >
            {props.items.map(item => (
              <Motion
                key={item}
                id={item}
                class="item"
                variants={{ enter: { opacity: 1 } }}
                initial={{ opacity: 0 }}
              />
            ))}
          </Motion>
        )
      },
    })

    const wrapper = mount(Component, {
      props: {
        items: ['1', '2'],
      },
    })

    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()

    await wrapper.setProps({
      items: ['1', '2', '3', '4', '5'],
    })

    // Wait for animations to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    const elements = document.querySelectorAll('.item')

    // Check that none of the opacities are the same
    const opacities = Array.from(elements).map(el =>
      parseFloat(window.getComputedStyle(el).opacity),
    )

    // All opacities should be unique
    const uniqueOpacities = new Set(opacities)
    expect(uniqueOpacities.size).toBe(opacities.length)
  })
})
