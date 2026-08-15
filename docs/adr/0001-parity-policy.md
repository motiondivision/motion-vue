# Parity policy: behavior 1:1, Vue-idiomatic naming canonical

When porting framer-motion features, motion-vue matches upstream behavior and capabilities 1:1, but Vue-idiomatic API naming is canonical and is not treated as a gap. The concrete case: Reorder keeps `onUpdate:values` (enabling `v-model:values`) instead of adopting React's `onReorder`, even while everything else about Reorder was brought to parity with framer-motion 13.1.0. No compatibility aliases are written — when upstream changes behavior, we replace directly and note breaking changes in the changelog.

## Considered Options

- **Rename to `onReorder` for literal API parity** — rejected: it would break existing Vue users to satisfy a naming correspondence, while `v-model:values` is the idiomatic Vue expression of the same contract. Parity is about behavior and capability, not prop names.

## Consequences

- Future ports apply the same rule: port behavior 1:1, keep established Vue idioms (v-model, slots), never add compat layers unless the maintainer explicitly asks.
- Readers comparing motion-vue's API against React docs should expect naming differences of this kind; they are deliberate, not omissions.
