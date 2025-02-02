# Contributing Guidelines

We are delighted that you are considering contributing to our project. Your contributions are invaluable in helping us improve and grow. Thank you for taking the time to contribute!

## Getting Started

### Prerequisites

- Ensure [Git](https://git-scm.com/) is installed.
- Ensure [Node.js](https://nodejs.org/) is installed.
- Ensure [pnpm](https://pnpm.io/) package manager is installed.

### Fork the Repository

Fork the repository by clicking the fork button at the top of the page. This action will create a copy of this repository in your account.

### Clone Your Fork

Navigate to your GitHub account, open the forked repository, click the code button, and then click the copy to clipboard icon.

Open a terminal and execute the following git command:

```bash
git clone "url you just copied"
```

### Change Directory to the Cloned Folder

```bash
cd "folder name"
```

### Install Dependencies

```bash
pnpm install
```

### Build the Motion Package

Building the motion package is essential to compile the latest code changes and ensure the package functions correctly within the project. This step generates the necessary build artifacts, allowing you to develop, test, and verify your modifications effectively.

```bash
pnpm build
```

This will build all the necessary files for the motion package.

### Start the Development Server

To start the development server and test the motion package in the playground, run the following command:
```bash
pnpm run dev:play
```

This will start the development server and open the browser with the playground.

### Additional Commands

Here are some additional commands that you might find useful:

- **dev**: This command runs the development server for the motion package.
  ```bash
  pnpm run dev
  ```

- **build**: This command builds all packages within the project.
  ```bash
  pnpm run build
  ```

- **test**: This command runs tests for the motion package.
  ```bash
  pnpm run test
  ```

- **prepare**: This command sets up git hooks using simple-git-hooks.
  ```bash
  pnpm run prepare
  ```

- **docs:install**: This command installs dependencies for the documentation.
  ```bash
  pnpm run docs:install
  ```

- **docs:dev**: This command runs the development server for the documentation.
  ```bash
  pnpm run docs:dev
  ```

- **docs:build**: This command builds the documentation.
  ```bash
  pnpm run docs:build
  ```

- **docs:gen**: This command generates documentation files.
  ```bash
  pnpm run docs:gen
  ```

- **docs:contributors**: This command generates a list of contributors for the documentation.
  ```bash
  pnpm run docs:contributors
  ```
