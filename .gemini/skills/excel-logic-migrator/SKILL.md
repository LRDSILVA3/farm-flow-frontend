---
name: excel-logic-migrator
description: Migrates complex business logic from Excel spreadsheets to TypeScript services. Use when a user needs to translate Excel formulas and data into a new or existing backend service.
---

# Excel Logic Migrator

This skill provides a structured workflow for migrating business logic from Excel spreadsheets into TypeScript services.

## Core Workflow

1.  **Analyze the Source Excel Files:**
    *   Examine all provided Excel files (or CSV exports) to understand the data flow and calculations.
    *   Identify the main input files, data sources, and formula sheets.
    *   Use the `read_file` tool to inspect the contents of each relevant file.

2.  **Identify Key Variables and Formulas:**
    *   Locate the core variables and their values in the Excel files (often in a "database" or "config" sheet).
    *   Trace the formulas to understand how the final values are calculated.
    *   Pay close attention to hidden logic, such as conditional formatting, macros, or values that change based on other cells (e.g., "Nota Fiscal").
    *   Refer to `references/migration-guide.md` for a detailed guide on this process.

3.  **Update Database Schema and Inserts:**
    *   Create or update a database migration script (e.g., for Supabase) to store the identified variables.
    *   Ensure that the variable names in the database follow a consistent naming convention (e.g., `snake_case` or `UPPER_CASE`).
    *   Update the insert script with the values from the Excel files.

4.  **Implement the TypeScript Service:**
    *   Create a new TypeScript service file for the migrated logic. You can use the `assets/service-template.ts` as a starting point.
    *   Implement a `calculate` method that takes the necessary parameters and performs the calculations based on the Excel formulas.
    *   Retrieve the cost variables from the database and use them in the calculations.
    *   Ensure the TypeScript implementation correctly mirrors the logic from the Excel files.

5.  **Verify and Test:**
    *   Compare the output of the TypeScript service with the output from the Excel examples.
    *   Run any existing tests to ensure that the changes haven't introduced regressions.
    *   If possible, create new tests to cover the migrated logic.