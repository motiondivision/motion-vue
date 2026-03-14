# Contributing Guidelines

We are delighted that you are considering contributing to our project. Your contributions are invaluable in helping us improve and grow. Thank you for taking the time to contribute!

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/) (v9.15.0+)

### Fork & Clone

1. Fork the repository by clicking the fork button at the top of the page.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/motion-vue.git
cd motion-vue
```

### Install Dependencies

```bash
pnpm install
```

### Build the Motion Package

Building the motion package is essential before development. This compiles the latest code and generates the necessary build artifacts.

```bash
pnpm build
```

> **Note**: Plugin builds happen automatically after the motion build via the `afterBuild` hook.

### Start the Development Server

To start the playground for interactive testing:

```bash
pnpm play
```

This starts the Nuxt playground on port 3001.

For the Vite playground (used by E2E tests):

```bash
pnpm play:vite
```

This starts on port 5173.

For watch mode on the motion package (auto-rebuilds on changes):

```bash
pnpm dev
```

> **Tip**: If the playground doesn't reflect your changes, make sure you ran `pnpm build` first.

## Project Structure

```
motion-vue/
├── packages/
│   ├── motion/       # Core motion library (published as `motion-v`)
│   └── plugins/      # Nuxt module and unplugin-vue-components resolver
├── playground/
│   ├── nuxt/         # Nuxt playground (pnpm play, port 3001)
│   └── vite/         # Vite playground for E2E tests (port 5173)
└── tests/            # E2E tests (Playwright)
```

## Commands Reference

### Development & Build

| Command | Description |
|---------|-------------|
| `pnpm dev` | Watch mode for the motion package |
| `pnpm build` | Build the motion package and plugins |
| `pnpm play` | Start the Nuxt playground |
| `pnpm play:vite` | Start the Vite playground (port 5173) |

### Testing

| Command | Description |
|---------|-------------|
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |

You can also run a single test file:

```bash
pnpm --filter motion-v test <test-file-name>
```

## Git Workflow

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are validated by **commitlint** via a git hook.

Examples:

```
feat: add spring animation support
fix: resolve layout animation flicker
docs: update AnimatePresence usage guide
chore: bump dependencies
```

### Pre-commit Hooks

- **pre-commit**: Runs ESLint auto-fix on staged `*.{js,ts,vue}` files via `lint-staged`
- **commit-msg**: Validates commit message format via `commitlint`

Git hooks are set up automatically via `simple-git-hooks` when you run `pnpm install`. If hooks aren't working, run:

```bash
pnpm prepare
```

## Writing Tests

- **Unit tests**: Add test files in `__tests__` directories co-located with the source code. Tests use Vitest with Vue Test Utils in a JSDOM environment.
- **E2E tests**: Add test files in the root `/tests` directory using Playwright. E2E tests run against the Vite playground (port 5173) on Chromium and WebKit.
