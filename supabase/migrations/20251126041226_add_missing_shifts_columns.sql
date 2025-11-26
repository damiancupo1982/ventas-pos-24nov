/*
  # Add missing columns to shifts table

  1. Changes
    - Add `active` column (boolean) to track if shift is currently active
    - Add `total_sales` column (numeric) to track total sales during shift
    - Add `total_expenses` column (numeric) to track total expenses during shift
  
  2. Notes
    - Using IF NOT EXISTS pattern to prevent errors on re-run
    - Setting reasonable defaults for existing rows
*/

-- Add active column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'active'
  ) THEN
    ALTER TABLE shifts ADD COLUMN active boolean DEFAULT true;
  END IF;
END $$;

-- Add total_sales column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'total_sales'
  ) THEN
    ALTER TABLE shifts ADD COLUMN total_sales numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Add total_expenses column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'total_expenses'
  ) THEN
    ALTER TABLE shifts ADD COLUMN total_expenses numeric(10,2) DEFAULT 0;
  END IF;
END $$;