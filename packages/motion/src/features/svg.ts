import { frame } from 'framer-motion/dom'
import { Feature } from '@/features/feature'

function isSVGElement(element: Element) {
  return element instanceof SVGElement && element.tagName !== 'svg'
}

export class SVGFeature extends Feature {
  mount() {
    const instance = this.state.getElement() as Element
    if (!isSVGElement(instance)) {
      return
    }
    const visualElement = this.state.visualElement
    frame.read(() => {
      try {
        (visualElement.renderState as any).dimensions
            = typeof (instance as SVGGraphicsElement).getBBox
            === 'function'
            ? (instance as SVGGraphicsElement).getBBox()
            : (instance.getBoundingClientRect() as DOMRect)
      }
      catch (e) {
        // Most likely trying to measure an unrendered element under Firefox
        (visualElement.renderState as any).dimensions = {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        }
      }
    })
  }

  unmount() {
    console.log('SVGRender unmount')
  }
}
