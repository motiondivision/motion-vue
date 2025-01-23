---
title: Gesture
navigation.icon: 'lucide:hand'
---

Motion provides a set of gesture controls that allow you to create interactive animations.

## Hover

`Motion` provides a `hover` prop that allows you to animate the element when the mouse hovers over it.

<ComponentPreview name="hover" />

### Hover event

`hoverStart`

Callback function that fires when the mouse hovers over the element. Provided the triggering `MouseEvent`.

```vue
  <Motion
    @hover-start="(event)=>console.log('hover start', event)"
  />
```

`hoverEnd`

Callback function that fires when the mouse leaves the element. Provided the triggering `MouseEvent`.

```vue
  <Motion
    @hover-end="(event)=>console.log('hover end', event)"
  />
```

## Press

The `Press` gesture control allows you to animate the element when the mouse is pressed.

<ComponentPreview name="press" />

### Press event

`pressStart`

 Callback function that fires when a pointer starts pressing the component. Provided the triggering PointerEvent.

```vue
  <Motion
    @press-start="(event)=>console.log('press start', event)"
  />
```

`press`

Callback function that fires when a pointer is stops pressing the component and the pointer is still over the component. Provided the triggering `PointerEvent`.

```vue
  <Motion
    @press="(event)=>console.log('press', event)"
  />
```

`pressCancel`

Callback function that fires when a pointer stops pressing the component and the pointer is no longer over the component. Provided the triggering `PointerEvent`.

```vue
  <Motion
    @press-cancel="(event)=>console.log('press cancel', event)"
  />
```

## Focus

The focus gesture detects when a  component gains or loses focus, following the same rules as the CSS :focus-visible selector.

You can use `@focus` and `@blur` events, or the `focus` prop to animate when a component has focus. For example:

```vue
<Motion
  focus="{ scale: 1.2 }"
  href="#"
/>
```

## Pan

The pan gesture recognises when a pointer presses down on a component and moves further than 3 pixels. The pan gesture is ended when the pointer is released. Unlike drag, pan only provides event handlers and does not have props for animation.

You can use `@pan-start`, `@pan`, `@pan-end` events to handle pan gestures:

<ComponentPreview name="pan" />

## Drag

The `Drag` gesture control allows you to drag an element.

<ComponentPreview name="drag" />

and can use `whileDrag` to animate the element while dragging.

<ComponentPreview name="while-drag" />

### Drag with constraints

<ComponentPreview name="drag-with-constraints" />

### Drag Props

::PropsTable
---
data:
  - name: drag
    default: "false"
    type: "boolean | 'x' | 'y'"
    description: Enable dragging for this element. Set to `false` by default.
  - name: dragSnapToOrigin
    default: "false"
    type: "boolean"
    description: If `true`, this will snap back to its origin when dragging ends.
  - name: dragDirectionLock
    default: "false"
    type: "boolean"
    description: If `true`, this will lock dragging to the initially-detected direction. Defaults to `false`.
  - name: dragPropagation
    default: "false"
    type: "boolean"
    description: Allows drag gesture propagation to child components. Set to `false` by default.
  - name: dragConstraints
    default: "false"
    type: "false | Partial<BoundingBox> | HTMLElement"
    description: The drag constraints. Set to `false` by default.
  - name: dragElastic
    default: "0.5"
    type: "boolean | number | Partial<BoundingBox>"
    description: The drag elasticity. Set to `0.5` by default.
  - name: dragMomentum
    default: "true"
    type: "boolean"
    description: Apply momentum from the pan gesture to the component when dragging finishes. Set to `true` by default.
  - name: dragTransition
    type: "InertiaOptions"
    description: The drag transition. Set to `undefined` by default.
  - name: dragListener
    default: "true"
    type: "boolean"
    description: By default, if `drag` is defined on a component then an event listener will be attached to automatically initiate dragging when a user presses down on it. Set to `true` by default.
  - name: dragControls
    type: "DragControls"
    description: A drag controls object.
  - name: onDragStart
    type: "(event: PointerEvent, info: PanInfo) => void"
    description: Callback function that fires when dragging starts. Provided the triggering `PointerEvent` and `PanInfo`.
  - name: onDrag
    type: "(event: PointerEvent, info: PanInfo) => void"
    description: Callback function that fires when dragging. Provided the triggering `PointerEvent` and `PanInfo`.
  - name: onDragEnd
    type: "(event: PointerEvent, info: PanInfo) => void"
    description: Callback function that fires when dragging ends.
  - name: dragDirectionLock
    type: "(axis: 'x' | 'y') => void"
    description: Callback function that fires when the drag direction is locked to the x or y axis.
  - name: onDragTransitionEnd
    type: "() => void"
    description: Callback function that fires when drag momentum/bounce transition finishes.
  - name: onMeasureDragConstraints
    type: "(constraints: BoundingBox) => BoundingBox | void"
    description: If `dragConstraints` is set to a React ref, this callback will call with the measured drag constraints.
---
::
