/*
  # Fix RLS policies for shifts table

  1. Changes
    - Add INSERT policy for shifts table
    - Ensure all CRUD operations are allowed for anon and authenticated users
  
  2. Security
    - Allow anon and authenticated users to manage shifts
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read shifts" ON shifts;
DROP POLICY IF EXISTS "Anyone can insert shifts" ON shifts;
DROP POLICY IF EXISTS "Anyone can update shifts" ON shifts;
DROP POLICY IF EXISTS "Anyone can delete shifts" ON shifts;

-- Create comprehensive policies for shifts
CREATE POLICY "Anyone can read shifts"
  ON shifts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert shifts"
  ON shifts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update shifts"
  ON shifts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete shifts"
  ON shifts FOR DELETE
  TO anon, authenticated
  USING (true);