# Contributing Guidelines

## Getting Started

### Pre-requisites

- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) installed
- [pnpm](https://pnpm.io/) package manager installed

### Fork the repository

Fork the repository by clicking on the fork button on the top of the page. This will create a copy of this repository in your account.

### Clone your fork

Go to your GitHub account, open the forked repository, click on the code button and then click the copy to clipboard icon.

Open a terminal and run the following git command:

```bash
git clone "url you just copied"
```

### Change directory to the folder you just cloned to.

```bash
cd "folder name"
```

### Install dependencies

```bash
pnpm install
```

### Build the motion package

Building the motion package is necessary to compile the latest code changes and ensure that the package functions correctly within the project. This step generates the necessary build artifacts, allowing you to develop, test, and verify your modifications effectively

```bash
cd packages/motion
```

```bash
pnpm build
```

### Start the development server

go to root again
```bash
cd ../..
```

go to playground/nuxt where you can test the motion package.
```bash
cd playground/nuxt
```

install dependencies
```bash
pnpm install
```

start the development server
```bash
pnpm run dev
```

This will start the development server and open the browser with the playground.
