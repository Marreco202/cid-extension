# Contributing

Thank you for your interest in contributing to this project! We welcome all contributions, including bug reports, feature requests, and pull requests.

## Prerequisites

To build and run this extension locally, you will need:
- [Node.js](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)

## Development Setup

1. Fork and clone the repository.
2. Open the cloned directory in VS Code.
3. Install the dependencies by running:
   ```bash
   npm install
   ```
4. Press `F5` or go to the Run and Debug view and click "Run Extension" to open a new VS Code window with the extension loaded.

## Code Style

- The project uses TypeScript. Please ensure your code passes the compiler checks.
- We use ESLint for maintaining code quality. Check your code using:
  ```bash
  npm run lint
  ```
- Before committing, ensure that your changes follow the existing codebase conventions.

## Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This leads to a more readable history and makes it easier to automate release notes.

Each commit message should be structured as follows:

```
<type>[optional scope]: <description>
```

**Common Types:**
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes (e.g., `README.md`)
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools and libraries

**Example:** `feat: add mermaid diagram renderer`

## Submitting a Pull Request

We love pull requests from everyone! To ensure a smooth review process, please follow these guidelines:

1. **Create a branch**: For your feature, docs, bug fix, or hotfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Review your code**: Make sure your code passes linting (`npm run lint`), TypeScript checks (`npm run compile`), and follows the existing codebase conventions.
3. **Commit structure**: Commit your changes following the [Conventional Commits](#commit-messages) pattern described above. Provide context on *why* a change was made in the PR description.
4. **Push and Open**: Push your branch to your fork and open a Pull Request.
5. **Use the Template**: Fill out the Pull Request template that automatically populates when you create the PR. It ensures you haven't missed any steps and gives reviewers the context they need.

## Reporting Issues

If you find a bug or have a suggestion, please open an issue in the repository. Provide as much context as possible, including steps to reproduce bugs and expected behavior.
