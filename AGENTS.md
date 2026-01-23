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

- Ensure you are in the project's root directory before running any git commands.
- Be detailed in commit messages, specifying what changes were made instead of just mentioning general changes to files.
- Commit messages should reflect the actual changes to the files, not the actions taken.
- Before committing, always check the git diff to understand what has changed.
- Produce commit messages based on the file changes observed in the diff.

- Commit with conventional commit format.
- Example single-line commit: `feat: add user authentication`
- Example multi-line commit (must be true multi-line, not escaped newlines!):

  The correct way:

  feat: add user authentication
  - Implement login form
  - Add JWT token handling
  - Update user model

  **How to do it correctly:**
  - The subject line is followed by a blank line.
  - Each bullet point is on its own line, not separated by `\n` or any escape sequence.
  - Do NOT use a single quoted string with embedded `\n` characters in your commit command.
  - In the terminal, use a single multi-line string with real line breaks.

  **Incorrect (do NOT do this):**
  - `git commit -m "feat: add user authentication\n\n- Implement login form\n- Add JWT token handling\n- Update user model"`
  - This will result in a single-line commit message with literal `\n` characters, not a true multi-line message.

### On Failed Commit

- Check the error message from the terminal output to understand the cause (e.g., merge conflict, pre-commit hook failure, or invalid message format).
- Address the issue: resolve conflicts if any, fix hooks, or correct the commit message.
- After fixing, retry the commit command.
- If unsure, use git status or git log to verify the repository state.

## Avoiding Untruthfulness

- **NEVER state something as fact without verifying it first**.
- Always use tools to check file contents, configurations, or code before making claims.
- If you're unsure about something, explicitly say "let me check" and use the appropriate tool.
- Do NOT make assumptions and present them as truth, especially in:
  - File contents (check with `read_file` first)
  - Configuration settings (verify before stating)
  - Code implementation (read the actual code)
  - Git status or tracked files (use `git status` or other git commands)
- If you make a mistake or hallucinate, acknowledge it immediately and correct it.
- Be honest about uncertainty.