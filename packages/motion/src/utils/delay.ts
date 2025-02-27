export function delay(fn: () => void) {
  return Promise.resolve().then(() => {
    fn()
  })
}
