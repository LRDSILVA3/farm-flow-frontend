# Testing Guidelines

This document outlines the testing guidelines for the project, serving as a reference for the Test Generator skill.

## 1. General Principles

*   **Behavior over Implementation:** Test the observable behavior of the component or service, not its internal implementation details. This makes tests more robust to refactoring.
*   **Small, Focused Tests:** Each test should focus on verifying a single piece of behavior.
*   **Fast and Reliable:** Tests should run quickly and produce consistent results.
*   **Readability:** Tests should be easy to understand, almost like documentation.

## 2. Test Structure: AAA Pattern

All tests should follow the Arrange-Act-Assert (AAA) pattern:

*   **Arrange (Setup):**
    *   Set up the test environment (e.g., render a component, initialize a service).
    *   Mock any external dependencies (APIs, third-party libraries).
    *   Prepare input data or initial state.
*   **Act (Execution):**
    *   Perform the action that triggers the behavior you want to test (e.g., simulate user interaction, call a function).
*   **Assert (Verification):**
    *   Verify that the expected outcome occurred (e.g., an element is visible, a function was called with specific arguments, state has changed).

## 3. Naming Conventions and Descriptions

*   **Test File Naming:** Test files should typically be named `[ComponentName].spec.tsx` for React components or `[ServiceName].test.ts` for services, and placed alongside the code they test.
*   **Descriptive `it`/`test` Messages:** Use clear, concise, and descriptive English phrases for your test descriptions.
    *   ❌ `it('test 1')`
    *   ✅ `it('should display the user profile when data is loaded')`
    *   ✅ `it('should call the create user API with correct data on form submission')`

## 4. Mocking External Dependencies

*   **When to Mock:** Mock external calls (e.g., API requests using `fetch` or `axios`), global objects (`window`, `localStorage`), or complex third-party libraries that are not the focus of the current test.
*   **What Not to Mock:** Avoid mocking the actual business logic or core functionality that you are trying to test.
*   **Mocking Libraries:** Use `vitest.mock` or other relevant mocking utilities provided by your testing framework.

## 5. React Component Testing (using React Testing Library)

*   **Querying Elements:** Prefer user-centric queries (e.g., `getByRole`, `getByLabelText`, `getByText`) over implementation-specific queries (`getByTestId`, `querySelector`).
*   **User Interactions:** Use `@testing-library/user-event` to simulate realistic user interactions (e.g., `user.click`, `user.type`).
*   **Assertions:** Use `jest-dom` matchers for clear assertions about the DOM state (e.g., `expect(element).toBeInTheDocument()`, `expect(input).toHaveValue('...')`).

## 6. Vitest Configuration

*   Ensure your `vite.config.ts` has the correct setup for Vitest, including `setupFiles` for global test setup (e.g., `setupTests.ts` for `jest-dom` extensions).
