# Coding Standards and Best Practices

This document outlines the coding standards and best practices for the project, serving as a reference for the Refactoring Assistant skill.

## 1. Naming Conventions (Language Standards)
- **Language:** All code (variables, functions, classes, parameters, technical comments) must be written in **English**.
  - ❌ `function calcularTotal(valor)`
  - ✅ `function calculateTotal(amount)`
- **Variables and Functions:** Use `camelCase`. Ex: `getUserData`, `isLoading`.
- **React Components:** Use `PascalCase`. Ex: `UserProfile`, `SubmitButton`.
- **Constants:** Use `UPPER_SNAKE_CASE` for global constants. Ex: `MAX_RETRY_COUNT`.

## 2. Clean Code & Best Practices
- **Descriptive Names:** Avoid obscure abbreviations. `user` is better than `u`.
- **Small Functions:** Keep functions and components focused on a single responsibility (SRP).
- **Early Return:** Use early returns (guard clauses) to avoid excessive `if/else` nesting.
- **DRY (Don't Repeat Yourself):** Avoid duplication of logic. Extract to hooks or utilities.

## 3. TypeScript & React
- **Typing:** Avoid `any` at all costs. Use explicit interfaces or types.
- **Hooks:** Separate complex state logic into custom hooks (as seen in `useCounterAnimation`).
- **Immutability:** Never mutate state directly.

## 4. Comments
- Code comments should explain the "why," not the "how." They should be in English.

## 5. Automated Testing
- **AAA Pattern:** Structure tests in Arrange (prepare), Act (execute), and Assert (verify).
- **Descriptions:** Use descriptive phrases in English for `it` or `test`.
  - ❌ `it('test 1')`
  - ✅ `it('should display the user profile when data is loaded')`
- **Behavior over Implementation:** Test observable user behavior, not internal implementation details.
- **Mocks:** Mock external calls (API), but avoid mocking the business logic being tested.
