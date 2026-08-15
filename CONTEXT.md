# Motion for Vue

Vue port of Framer Motion ("motion"), published as `motion-v`. This glossary defines the project's canonical language; implementation details live in CLAUDE.md and the code.

## Language

**Parity （对齐）**:
The porting convention: motion-vue matches framer-motion's behavior and capabilities 1:1, while Vue-idiomatic API naming is canonical and not considered a gap.
_Avoid_: "exact copy", "bug-for-bug port"

**Reorder Group**:
A draggable list container that tracks item layouts and emits a new order for its `values` while dragging.
_Avoid_: sortable list, drag list

**Reorder Item**:
A child of a Reorder Group bound to a single entry of `values`; dragging it drives the Group's reordering.
_Avoid_: sortable item

**Axis auto-detection**:
When a Reorder Group's `axis` is omitted, the scroll/drag axis (`x`, `y`, or `xy` for grid layouts) is inferred from measured item layouts rather than defaulted.
_Avoid_: fixed default axis

**`onUpdate:values`**:
The canonical Vue equivalent of React's `onReorder` callback; emitting `update:values` enables `v-model:values`.
_Avoid_: onReorder
