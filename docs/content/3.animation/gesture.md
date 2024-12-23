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

## Drag

The `Drag` gesture control allows you to drag an element.

<ComponentPreview name="drag" />

and can use `whileDrag` to animate the element while dragging.

<ComponentPreview name="while-drag" />

### Drag with constraints

<ComponentPreview name="drag-with-constraints" />
