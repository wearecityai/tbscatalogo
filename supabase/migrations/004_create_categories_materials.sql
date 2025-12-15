-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Collares', 'Collares y colgantes elegantes'),
  ('Aretes', 'Pendientes y aretes para toda ocasión'),
  ('Pulseras', 'Pulseras y brazaletes'),
  ('Anillos', 'Anillos y sortijas');

-- Insert default materials (optional, but good for starting)
INSERT INTO materials (name, description) VALUES
  ('Oro', 'Oro de 14k o 18k'),
  ('Plata', 'Plata esterlina 925'),
  ('Baño de oro', 'Latón con baño de oro'),
  ('Acero inoxidable', 'Acero quirúrgico resistente');

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Public categories are viewable by everyone" 
ON categories FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories" 
ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" 
ON categories FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" 
ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for materials
CREATE POLICY "Public materials are viewable by everyone" 
ON materials FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert materials" 
ON materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update materials" 
ON materials FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete materials" 
ON materials FOR DELETE USING (auth.role() = 'authenticated');
