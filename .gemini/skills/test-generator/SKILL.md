---
name: test-generator
description: Generates new tests for components and services, ensuring adherence to project testing standards and conventions, including AAA pattern and descriptive English messages.
---

# Test Generator

This skill guides the process of generating new tests for various parts of the project, including React components and TypeScript services. It ensures that generated tests follow the project's testing standards and conventions.

## Core Workflow

1.  **Identify Testing Target:**
    *   Determine which component, service, or functionality needs a new test.

2.  **Understand Testing Requirements:**
    *   Consider the expected behavior of the target. What are the key functionalities that need to be verified?
    *   Refer to `references/testing-guidelines.md` for project-specific testing principles.

3.  **Generate Test File Structure:**
    *   Use the `assets/test-template.ts` as a starting point for creating a new test file.
    *   Ensure the test file is placed in the correct location (e.g., alongside the component/service or in a dedicated `__tests__` directory).

4.  **Implement Test Cases (AAA Pattern):**
    *   For each test case, follow the Arrange-Act-Assert (AAA) pattern:
        *   **Arrange:** Set up the test environment, mock dependencies, and render the component/initialize the service.
        *   **Act:** Perform the action that triggers the behavior being tested (e.g., user interaction, function call).
        *   **Assert:** Verify the expected outcome (e.g., element visible, function called, state changed).
    *   Use descriptive English messages for `it` or `test` blocks.
    *   Prioritize testing observable behavior over internal implementation details.

5.  **Mock External Dependencies:**
    *   Mock external API calls, third-party libraries, or complex dependencies to isolate the unit under test.
    *   Avoid mocking the actual business logic being tested.

6.  **Run and Refine Tests:**
    *   Execute the newly created tests to ensure they pass and correctly assert the desired behavior.
    *   Refine test cases as needed to cover edge cases and improve test robustness.