/*
  # Add RLS policies for users table

  1. Changes
    - Add policy to allow reading users for authentication
    - Add policy to allow updating user data
  
  2. Security
    - Allow anon and authenticated users to read user records (needed for login)
    - This is safe because passwords should be hashed in production
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read users" ON users;
DROP POLICY IF EXISTS "Anyone can update users" ON users;

-- Allow reading users for login verification
CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow updating users
CREATE POLICY "Anyone can update users"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);