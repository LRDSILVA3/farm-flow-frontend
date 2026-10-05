---
name: code-reviewer
description: Performs automated code reviews and ensures adherence to project coding standards and conventions defined in .gemini/rules.md.
---

# Code Reviewer

This skill assists in performing automated code reviews, checking code against the project's defined coding standards and best practices.

## Core Workflow

1.  **Identify Code for Review:**
    *   Determine which code changes (e.g., new feature, bug fix, refactoring) need to be reviewed for compliance with coding standards.

2.  **Load Project Coding Rules:**
    *   Consult `references/project-coding-rules.md` to access the detailed coding standards, naming conventions, and best practices.

3.  **Perform Code Analysis:**
    *   Examine the code for adherence to:
        *   **Naming Conventions:** English language, `camelCase` for variables/functions, `PascalCase` for React components, `UPPER_SNAKE_CASE` for global constants.
        *   **Clean Code Principles:** Descriptive names, small functions, "Early Return," DRY principle.
        *   **TypeScript & React Best Practices:** Strong typing, use of custom hooks, immutability.
        *   **Comments:** Ensure comments explain "why" and are in English.
        *   **Automated Testing:** Verify that tests follow AAA pattern, have descriptive English messages, and prioritize behavior over implementation.

4.  **Provide Feedback:**
    *   Generate a summary of findings, highlighting any deviations from the coding standards.
    *   Suggest specific improvements and corrections based on the rules.
    *   Provide examples where applicable.