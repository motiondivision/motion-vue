import { expectTypeOf, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { m, motion } from 'motion-v'
import type { M, Motion, MotionProps, Options, Reorder } from 'motion-v'

it('public component fx accepts only an optional boolean', () => {
  expectTypeOf<MotionProps['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<InstanceType<typeof motion.div>['$props']['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<InstanceType<typeof m.div>['$props']['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<InstanceType<typeof motion.svg>['$props']['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<InstanceType<typeof m.svg>['$props']['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Parameters<typeof Motion<'div'>>[0]['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Parameters<typeof M<'svg'>>[0]['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Parameters<typeof Reorder.Group>[0]['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Parameters<typeof Reorder.Item>[0]['fx']>().toEqualTypeOf<boolean | undefined>()
  const Target = defineComponent({
    props: { label: { type: String, required: true } },
    setup: (props, { attrs }) => () => h('div', attrs, props.label),
  })
  const Wrapped = motion.create(Target)
  const LazyWrapped = m.create(Target)
  expectTypeOf<InstanceType<typeof Wrapped>['$props']['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<InstanceType<typeof LazyWrapped>['$props']['fx']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<InstanceType<typeof Wrapped>['$props']['label']>().toEqualTypeOf<string>()
  const enabled: MotionProps = { fx: true }
  const disabled: MotionProps = { fx: false }
  const omitted: MotionProps = {}
  // @ts-expect-error fx is a logical boolean, not an encoded attribute string.
  const stringMarker: MotionProps = { fx: '' }
  // @ts-expect-error fx does not accept numeric values.
  const numericMarker: MotionProps = { fx: 1 }
  // @ts-expect-error fx is component metadata, not an animation-state option.
  const stateMarker: Options = { fx: true }
  expectTypeOf(enabled).toMatchTypeOf<MotionProps>()
  expectTypeOf(disabled).toMatchTypeOf<MotionProps>()
  expectTypeOf(omitted).toMatchTypeOf<MotionProps>()
})
