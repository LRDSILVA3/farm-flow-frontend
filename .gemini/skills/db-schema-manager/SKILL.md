---
name: db-schema-manager
description: Manages database schema changes and Supabase migrations, ensuring best practices for creating, reviewing, and applying database updates.
---

# Database Schema Manager

This skill provides guidance and tools for managing database schema changes, particularly for Supabase migrations. It helps ensure consistency, prevent common errors, and adhere to best practices.

## Core Workflow

1.  **Understand the Schema Change Request:**
    *   Clearly define the desired change to the database schema (e.g., add a new table, modify a column, create an index).
    *   Consider the impact of the change on existing data and applications.

2.  **Generate Migration Script:**
    *   Use the `assets/migration-template.sql` as a starting point for a new Supabase migration file.
    *   Write the SQL DDL (Data Definition Language) statements to implement the schema change.
    *   Ensure the migration script is idempotent where possible (i.e., running it multiple times has the same effect as running it once).

3.  **Adhere to Supabase Migration Best Practices:**
    *   Refer to `references/supabase-migration-guide.md` for detailed guidance on writing effective and safe Supabase migrations.
    *   Pay attention to naming conventions, data type choices, and index creation.
    *   Consider `UP` and `DOWN` scripts for easy rollbacks.

4.  **Review Migration Script:**
    *   Before applying, review the migration script for correctness, potential errors, and adherence to best practices.
    *   Consider edge cases and data integrity.

5.  **Apply Migration (Manual Step):**
    *   Inform the user how to apply the migration using Supabase CLI or dashboard tools. (Note: As an AI, I cannot directly execute database migrations for safety reasons).

6.  **Verify Schema Change:**
    *   After applying the migration, verify that the schema change has been successfully implemented in the database.
    *   Run any relevant tests or queries to confirm the new schema behaves as expected.