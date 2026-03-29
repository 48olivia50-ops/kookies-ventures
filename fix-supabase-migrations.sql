-- Fix for: relation "supabase_migrations.schema_migrations" does not exist
-- This creates the missing schema_migrations table that Supabase uses to track migrations

-- Create the supabase_migrations schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

-- Create the schema_migrations table with the standard Supabase structure
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY,
    inserted_at timestamptz DEFAULT now() NOT NULL
);

-- Insert any existing migration version if you have one (leave empty for fresh start)
-- Example: INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20230101000000');

-- Verify the table was created
SELECT * FROM supabase_migrations.schema_migrations;
