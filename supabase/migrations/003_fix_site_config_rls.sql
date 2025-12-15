
-- Add INSERT policy for site_config to allow upserts
CREATE POLICY "Allow public insert on site_config" ON site_config
  FOR INSERT WITH CHECK (true);

-- Ensure the existing update policy is correct
DROP POLICY IF EXISTS "Allow public update on site_config" ON site_config;
CREATE POLICY "Allow public update on site_config" ON site_config
  FOR UPDATE USING (true);
