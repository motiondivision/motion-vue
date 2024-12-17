const packageManagersCode: {
  name: 'npm' | 'pnpm' | 'bun' | 'yarn'
  command: string
  install: string
  installEmpty: string
  run: string
  x: string
  saveDev: string
}[] = [
  {
    name: 'npm',
    command: 'npm ',
    install: 'i ',
    installEmpty: 'install',
    run: 'run ',
    x: 'npx ',
    saveDev: '-D ',
  },
  {
    name: 'pnpm',
    command: 'pnpm ',
    install: 'i ',
    installEmpty: 'install',
    run: 'run ',
    x: 'pnpm dlx ',
    saveDev: '-D ',
  },
  {
    name: 'bun',
    command: 'bun ',
    install: 'add ',
    installEmpty: 'install',
    run: 'run ',
    x: 'bun x ',
    saveDev: '-d ',
  },
  {
    name: 'yarn',
    command: 'yarn ',
    install: 'add ',
    installEmpty: 'install',
    run: 'run ',
    x: 'yarn dlx ',
    saveDev: '-D ',
  },
]

export function usePm() {
  const { pm } = useConfig().value.main

  const packageManagers = computed(
    () => packageManagersCode.filter(x => pm.includes(x.name)),
  )

  return {
    packageManagers,
  }
}
