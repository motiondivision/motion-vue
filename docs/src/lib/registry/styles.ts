export const styles = [
  {
    name: 'new-york',
    label: 'New York',
  },
] as const

export type Style = typeof styles[number]['name']
