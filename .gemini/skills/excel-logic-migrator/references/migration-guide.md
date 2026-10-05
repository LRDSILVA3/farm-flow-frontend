# Excel to TypeScript Migration Guide

This guide provides a detailed step-by-step process for migrating business logic from Excel to TypeScript.

## 1. Understanding the Excel Files

*   **Goal:** Get a high-level understanding of how the Excel workbook is structured.
*   **Action:**
    *   List all the provided files (CSVs or the original `.xlsm` if available).
    *   Read each file to identify its purpose. Look for files named `database`, `formulas`, `inputs`, `examples`, etc.
    *   Pay special attention to any `.csv` files that are exports from the original Excel file.

## 2. Identifying Variables

*   **Goal:** Create a comprehensive list of all the variables used in the calculations.
*   **Action:**
    *   Look for a "database" or "config" sheet/file that lists the core variables and their values.
    *   Go through the formula sheets and identify any hardcoded values or references to other cells that act as variables.
    *   Create a table of variables with their names, values, and a description of their purpose.

## 3. Deconstructing Formulas

*   **Goal:** Understand the exact calculation logic from the Excel formulas.
*   **Action:**
    *   Translate the Excel formulas into a more readable pseudocode format.
    *   Break down complex nested formulas into smaller, more manageable parts.
    *   Pay close attention to Excel functions like `SE` (IF), `SOMA` (SUM), `POTÊNCIA` (POWER), `ARRED` (ROUND), etc.
    *   Be aware of how cell references (e.g., `$A$1` vs. `A1`) affect the formulas.

## 4. Handling Hidden Logic

*   **Goal:** Uncover any logic that isn't immediately obvious from the formulas.
*   **Action:**
    *   Look for cells that change their value based on a selection in another cell (e.g., a dropdown for "Nota Fiscal").
    *   Check for conditional formatting rules that might affect the calculations.
    *   If you have access to the original `.xlsm` file, check for any macros that might contain business logic.

## 5. Database Integration

*   **Goal:** Persist the identified variables in the database.
*   **Action:**
    *   Create a new migration script to add a `cost_variables` table if it doesn't exist.
    *   For each variable, add an entry to the `cost_variables` table with its `name`, `code`, `value`, and `description`.
    *   Use the `ON CONFLICT (code) DO UPDATE` clause to prevent duplicate entries and allow for easy updates.

## 6. TypeScript Implementation

*   **Goal:** Replicate the Excel logic in a TypeScript service.
*   **Action:**
    *   Create a new service class (e.g., `MyService`).
    *   In the constructor, accept a list of `CostVariable` objects from the database and store them in a `Map` for easy lookup.
    *   Create a `calculate` method that takes the user inputs as parameters.
    *   Implement the calculation logic using the variables from the `Map`.
    *   Return the final calculated value and any other relevant details.

## 7. Validation

*   **Goal:** Ensure the TypeScript implementation is correct.
*   **Action:**
    *   Use the data from the "example" sheets in the Excel files as input for your `calculate` method.
    *   Compare the output of your service with the final values in the example sheets.
    *   If there are discrepancies, double-check your formula translation and variable values.
