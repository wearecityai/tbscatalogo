-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Collares', 'Aretes', 'Pulseras', 'Anillos')),
  collection TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT DEFAULT '',
  material TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (collection) REFERENCES collections(name) ON DELETE RESTRICT
);

-- Create site_config table (single row)
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'Catálogo',
  logo_url TEXT,
  footer_text TEXT DEFAULT '',
  social_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on collections" ON collections
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on site_config" ON site_config
  FOR SELECT USING (true);

-- Create policies to allow public write access (for admin)
CREATE POLICY "Allow public insert on collections" ON collections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on collections" ON collections
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on collections" ON collections
  FOR DELETE USING (true);

CREATE POLICY "Allow public insert on products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on products" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on products" ON products
  FOR DELETE USING (true);

CREATE POLICY "Allow public update on site_config" ON site_config
  FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON site_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default site config
INSERT INTO site_config (id, site_name, footer_text, social_links)
VALUES (1, 'Catálogo', '© 2024. Todos los derechos reservados.', 
  '[{"platform": "Instagram", "url": "#"}, {"platform": "Pinterest", "url": "#"}, {"platform": "Contacto", "url": "mailto:hola@thebrightsoul.com"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

