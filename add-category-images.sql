-- Add imageUrl and description columns to Category table
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Verify the columns were added
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Category';
