---
name: refactoring-assistant
description: Guides refactoring tasks in the project, ensuring adherence to clean code principles, naming conventions, and identifying opportunities for code improvement.
---

# Refactoring Assistant

This skill helps in performing refactoring tasks by providing guidance on common patterns, coding standards, and identifying areas for improvement.

## Core Workflow

1.  **Understand the Refactoring Goal:**
    *   Clearly define what needs to be refactored and why (e.g., improve readability, reduce complexity, fix a bug).

2.  **Analyze the Codebase:**
    *   Identify the scope of the refactoring: which files, functions, or modules are affected.
    *   Use code analysis tools (if available) or manual inspection to pinpoint areas that can be improved.

3.  **Apply Refactoring Patterns:**
    *   Refer to `references/refactoring-patterns.md` for common refactoring techniques (e.g., Extract Function, Rename Variable, Introduce Variable).
    *   Apply the most suitable pattern(s) to achieve the refactoring goal.

4.  **Adhere to Coding Standards:**
    *   Consult `references/coding-standards.md` to ensure all changes comply with the project's established clean code principles and naming conventions.
    *   Pay attention to aspects like "Early Return," removal of unnecessary nesting, and clear variable/function naming.

5.  **Verify Changes:**
    *   Run existing tests to ensure the refactoring hasn't introduced any regressions.
    *   If necessary, write new tests to cover the refactored code.

## Key Principles

*   **Small, Incremental Changes:** Perform refactorings in small, manageable steps to minimize risks.
*   **Tests are Your Safety Net:** Always run tests after each small change to catch regressions early.
*   **Improve Readability:** Aim to make the code easier to understand and maintain.
*   **Follow Project Conventions:** Ensure your refactorings align with the existing codebase style and standards.