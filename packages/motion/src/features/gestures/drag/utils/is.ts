export function isHTMLElement(value: any): value is HTMLElement {
  return typeof value === 'object' && value !== null && 'nodeType' in value
}
