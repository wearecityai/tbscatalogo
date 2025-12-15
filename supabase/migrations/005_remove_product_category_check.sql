-- Remove the restrictive check constraint on products.category
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Optionally, add a foreign key constraint to ensure data integrity
-- (Only if we are sure all existing products have valid categories in the new table)
-- ALTER TABLE products ADD CONSTRAINT products_category_fkey FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE RESTRICT;
