// Credit: nuxt-themes/docus

/**
 * Scrollspy allows you to watch visible headings in a specific page.
 * Useful for table of contents live style updates.
 */
export function useScrollspy() {
  const observer = ref() as Ref<IntersectionObserver>
  const visibleHeadings = ref([]) as Ref<string[]>
  const activeHeadings = ref([]) as Ref<string[]>

  const observerCallback = (entries: IntersectionObserverEntry[]) =>
    entries.forEach((entry) => {
      const id = entry.target.id

      if (entry.isIntersecting)
        visibleHeadings.value.push(id)
      else visibleHeadings.value = visibleHeadings.value.filter(t => t !== id)
    })

  const updateHeadings = (headings: Element[]) => {
    if (observer.value)
      observer.value.disconnect()
    observer.value = new IntersectionObserver(observerCallback)

    headings.forEach((heading) => {
      observer.value.observe(heading)
    })
  }

  watch(
    visibleHeadings,
    (val, oldVal) => {
      if (val.length === 0)
        activeHeadings.value = oldVal
      else
        activeHeadings.value = val
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    observer.value?.disconnect()
  })

  return {
    visibleHeadings,
    activeHeadings,
    updateHeadings,
  }
}
