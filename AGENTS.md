# AI Agent Rules

## File Creation

- Create files with lowercase kebab casing (e.g., `utils-helper.ts`).
- Avoid uppercase letters, underscores, or camelCase in filenames.

## Code Quality

- Write clean, readable, and maintainable code.
- Follow language-specific best practices and conventions.
- Include comments for complex logic.

## Project Structure

- Organize files logically within the project structure.

## Dependencies

- Only add necessary dependencies.
- Prefer lightweight, well-maintained packages.

## Committing

- Ensure you are in the `~/play/vistaview` directory before running any git commands.
- Be detailed in commit messages, specifying what changes were made instead of just mentioning general changes to files.
- Commit messages should reflect the actual changes to the files, not the actions taken.
- Before committing, always check the git diff to understand what has changed.
- Produce commit messages based on the file changes observed in the diff.
- Commit with conventional commit format.
- Example single-line commit: `feat: add user authentication`
- Example multi-line commit:

  ```
  feat: add user authentication

  - Implement login form
  - Add JWT token handling
  - Update user model
  ```
