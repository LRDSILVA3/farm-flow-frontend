# Supabase Migration Guide

This guide provides best practices and detailed steps for creating and managing database migrations within a Supabase project.

## 1. Supabase CLI

Supabase migrations are typically managed using the Supabase CLI. Ensure you have the CLI installed and configured for your project.

*   **Initialize:** `supabase init`
*   **Link Project:** `supabase link --project-ref your-project-id`
*   **Generate Migration:** `supabase db diff -f <migration_name>` (generates a migration file based on local schema changes)
*   **Apply Migrations:** `supabase db push` (applies local migrations to your local database) or `supabase db reset` (resets and reapplies all migrations)

## 2. Migration File Structure

Supabase migration files are standard SQL files located in `supabase/migrations/`. Each file should represent a single, logical schema change.

*   **Naming Convention:** `YYYYMMDDHHMMSS_your_migration_name.sql`
*   **Content:** Each migration file should contain SQL Data Definition Language (DDL) statements.

## 3. Best Practices for Writing SQL Migrations

### A. Atomicity

*   **Wrap in a Transaction:** Whenever possible, wrap your DDL statements in a transaction to ensure atomicity. If any statement fails, the entire transaction is rolled back.
    ```sql
    BEGIN;

    -- Your DDL statements here

    COMMIT;
    ```

### B. Idempotency

*   **`IF NOT EXISTS` / `IF EXISTS`:** Use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE IF EXISTS`, `DROP TABLE IF EXISTS` to make your migrations idempotent. This prevents errors if a migration is run multiple times or if the schema already exists.
    ```sql
    CREATE TABLE IF NOT EXISTS public.my_table (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL
    );
    ```

### C. Naming Conventions

*   **Tables:** Use `snake_case` (e.g., `user_profiles`, `order_items`).
*   **Columns:** Use `snake_case` (e.g., `created_at`, `first_name`).
*   **Primary Keys:** Typically `id` of type `uuid` or `bigint`.
*   **Foreign Keys:** Name consistently (e.g., `fk_user_id`).
*   **Indexes:** Name descriptively (e.g., `idx_user_email`).

### D. Data Types

*   **Use appropriate data types:**
    *   `uuid` for IDs.
    *   `text` for strings of variable length.
    *   `varchar(n)` for strings with a known maximum length.
    *   `integer`, `bigint`, `numeric` for numbers.
    *   `boolean` for true/false values.
    *   `timestamp with time zone` for dates and times.
    *   `jsonb` for JSON data.

### E. Altering Tables

*   **Add Columns:**
    ```sql
    ALTER TABLE public.my_table ADD COLUMN IF NOT EXISTS new_column text;
    ```
*   **Rename Columns:**
    ```sql
    ALTER TABLE public.my_table RENAME COLUMN old_column TO new_column;
    ```
*   **Drop Columns (use with caution):**
    ```sql
    ALTER TABLE public.my_table DROP COLUMN IF EXISTS old_column;
    ```

### F. Indexes

*   **Create Indexes for frequently queried columns:** This significantly improves query performance.
    ```sql
    CREATE INDEX IF NOT EXISTS idx_my_table_name ON public.my_table (name);
    ```

### G. Up and Down Migrations (Optional but Recommended)

For more complex scenarios or when explicit rollback is needed, you might consider having separate "up" and "down" scripts within a single migration file or in separate files. Supabase CLI typically works with a sequence of `up` migrations. However, for a more robust local development, you might simulate rollbacks.

## 4. Review and Test

*   **Local Testing:** Always run `supabase db push` locally and test your application against the new schema before deploying.
*   **Peer Review:** Have another developer review your migration scripts.
*   **Schema Diff:** Use `supabase db diff` to compare your local schema with a remote one to catch unexpected changes.
