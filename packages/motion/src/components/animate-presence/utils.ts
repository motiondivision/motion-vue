export function requestIdleCallback(callback: () => void) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback)
  }
  else {
    setTimeout(callback, 50)
  }
}
