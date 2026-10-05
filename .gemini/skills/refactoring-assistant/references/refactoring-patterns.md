# Refactoring Patterns Guide

This guide outlines common refactoring patterns to improve code quality, readability, and maintainability.

## 1. Extract Method (Function)

*   **When to use:** A fragment of code that can be grouped together, has a clear purpose, and might be repeated elsewhere.
*   **Action:**
    1.  Create a new, empty method/function with a name that explains the purpose of the extracted code.
    2.  Move the extracted code from the source method/function to the new method/function.
    3.  Replace the extracted code with a call to the new method/function.
    4.  Pass any local variables that the extracted code needs as parameters to the new method/function.
    5.  Return any values that the extracted code computes and that the original method/function needs.

## 2. Rename Variable/Method/Class

*   **When to use:** A name does not clearly communicate its purpose, or a new context makes the old name misleading.
*   **Action:** Use your IDE's refactoring features to rename the element consistently across the entire codebase. Ensure the new name is descriptive and follows project naming conventions.

## 3. Introduce Explaining Variable

*   **When to use:** A complex expression is hard to understand.
*   **Action:**
    1.  Declare a new variable with a name that describes the meaning of the complex expression.
    2.  Assign the result of the complex expression to this new variable.
    3.  Replace the complex expression with the new variable.

## 4. Replace Conditional with Polymorphism

*   **When to use:** You have a conditional expression (`if`/`else` or `switch`) that chooses different behavior based on the type or properties of an object.
*   **Action:**
    1.  Create subclasses for each branch of the conditional.
    2.  Move the differing behavior from the conditional branches into methods in the corresponding subclasses.
    3.  Replace the conditional with a polymorphic method call on the object.

## 5. Consolidate Duplicate Conditional Fragments

*   **When to use:** The same code appears in all branches of a conditional expression.
*   **Action:** Move the duplicated code outside of the conditional expression.

## 6. Replace Nested Conditional with Guard Clauses (Early Return)

*   **When to use:** A function has multiple conditional paths, especially when dealing with error conditions or boundary cases.
*   **Action:**
    1.  Instead of nesting `if` statements, use `return` (or `throw`) statements at the beginning of the function to handle exceptional conditions.
    2.  This flattens the code structure and improves readability.

## 7. Remove Dead Code

*   **When to use:** Code that is no longer used or reachable.
*   **Action:** Delete the code. This reduces the codebase size and makes it easier to understand.

## 8. Extract Interface/Abstract Class

*   **When to use:** Multiple classes share a common interface or functionality, and you want to define a contract or provide a base implementation.
*   **Action:**
    1.  Create a new interface or abstract class.
    2.  Move the common method signatures (for interfaces) or common implementation (for abstract classes) to the new construct.
    3.  Make the original classes implement the interface or extend the abstract class.
