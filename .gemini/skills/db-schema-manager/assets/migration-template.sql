BEGIN;

-- This is an example migration file.
-- Add your SQL DDL (Data Definition Language) statements here.
-- Remember to use IF NOT EXISTS/IF EXISTS for idempotency where appropriate.

-- Example: Create a new table
-- CREATE TABLE IF NOT EXISTS public.new_table (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   name text NOT NULL,
--   created_at timestamp with time zone DEFAULT now()
-- );

-- Example: Add a new column to an existing table
-- ALTER TABLE public.existing_table ADD COLUMN IF NOT EXISTS new_column text;

-- Example: Create an index
-- CREATE INDEX IF NOT EXISTS idx_existing_table_new_column ON public.existing_table (new_column);

COMMIT;
