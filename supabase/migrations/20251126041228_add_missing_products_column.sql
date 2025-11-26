/*
  # Add missing active column to products table

  1. Changes
    - Add `active` column (boolean) to track if product is available for sale
  
  2. Notes
    - Using IF NOT EXISTS pattern to prevent errors on re-run
    - Setting default to true for existing products
*/

-- Add active column to products if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'active'
  ) THEN
    ALTER TABLE products ADD COLUMN active boolean DEFAULT true;
  END IF;
END $$;