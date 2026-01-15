# tools.passkeys.dev

Developer tools for passkeys and WebAuthn

## Development

This site just uses raw HTML and JS, no SSG or build tools.
However, things like a sitemap need to get generated.

The following dependencies are required to work on tools.passkeys.dev locally:

- [Node.js 20.x+](https://nodejs.org/en/download)

Once these are installed, enable pre-commit linting:

1. In the project folder, run `git config core.hooksPath .git-hooks`
2. Make the hook executable: `chmod a+x .git-hooks/pre-commit`

When you try to commit, the hook will check for staged HTML files and regenerate the sitemap if found.
