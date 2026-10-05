---
name: xlsx-inspector
description: Inspects .xlsx files to extract sheet names, cell values, and formulas, aiding in the migration of business logic to TypeScript services.
---

# XLSX Inspector

This skill provides a way to inspect `.xlsx` files and extract their contents, including sheet names, cell values, and formulas. This is particularly useful for understanding and migrating complex business logic from Excel to TypeScript.

## Core Workflow

1.  **Identify Target XLSX File:**
    *   Determine the path to the `.xlsx` or `.xlsm` file that needs to be inspected.

2.  **Run the Inspector Script:**
    *   Execute the `scripts/inspect-xlsx.cjs` script, passing the path to the target file as the first argument, and optionally the sheet name as the second argument.
    *   Example (all sheets): `node scripts/inspect-xlsx.cjs "path/to/your/file.xlsx"`
    *   Example (specific sheet): `node scripts/inspect-xlsx.cjs "path/to/your/file.xlsx" "Sheet Name"`

3.  **Analyze the JSON Output:**
    *   The script will output a JSON object containing the workbook's
     data.
    *   Refer to `references/xlsx-output-schema.md` for a detailed explanation of the JSON output structure.
    *   Use the extracted data (sheet names, cell values, formulas) to understand the spreadsheet's logic.

4.  **Extract and Translate Logic:**
    *   Based on the analysis, identify the key variables and formulas to be migrated.
    *   Use this information to build a new TypeScript service or update an existing one.