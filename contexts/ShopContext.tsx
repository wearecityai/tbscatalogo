import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CollectionData, SiteConfig } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS, COLLECTIONS as INITIAL_COLLECTIONS, DEFAULT_SITE_CONFIG } from '../constants';
import { supabase } from '../lib/supabase';

interface ShopContextType {
  products: Product[];
  collections: CollectionData[];
  siteConfig: SiteConfig;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCollection: (data: CollectionData) => void;
  updateCollection: (originalName: string, data: CollectionData) => void;
  deleteCollection: (name: string) => void;
  updateSiteConfig: (config: SiteConfig) => void;
  resetToDefault: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load collections
        const { data: collectionsData, error: collectionsError } = await supabase
          .from('collections')
          .select('*')
          .order('name');

        if (collectionsError) throw collectionsError;

        if (collectionsData && collectionsData.length > 0) {
          const formattedCollections: CollectionData[] = collectionsData.map(c => ({
            name: c.name,
            description: c.description || ''
          }));

          // Ensure 'Todas' is always first
          formattedCollections.sort((a, b) => {
            if (a.name === 'Todas') return -1;
            if (b.name === 'Todas') return 1;
            return a.name.localeCompare(b.name);
          });

          setCollections(formattedCollections);
        } else {
          // Initialize with default collections if empty
          setCollections(INITIAL_COLLECTIONS);
          // Insert default collections
          for (const col of INITIAL_COLLECTIONS) {
            await supabase.from('collections').upsert({ name: col.name, description: col.description });
          }
        }

        // Load products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        if (productsData && productsData.length > 0) {
          const formattedProducts: Product[] = productsData.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            collection: p.collection,
            price: p.price,
            description: p.description || '',
            material: p.material || '',
            imageUrl: p.image_url
          }));
          setProducts(formattedProducts);
        } else {
          setProducts(INITIAL_PRODUCTS);
          // Insert default products
          for (const product of INITIAL_PRODUCTS) {
            await supabase.from('products').upsert({
              id: product.id,
              name: product.name,
              category: product.category,
              collection: product.collection,
              price: product.price,
              description: product.description,
              material: product.material,
              image_url: product.imageUrl
            });
          }
        }

        // Load site config
        const { data: configData, error: configError } = await supabase
          .from('site_config')
          .select('*')
          .eq('id', 1)
          .single();

        if (configError && configError.code !== 'PGRST116') throw configError; // PGRST116 = no rows returned

        if (configData) {
          setSiteConfig({
            siteName: configData.site_name,
            logoUrl: configData.logo_url,
            footerText: configData.footer_text || '',
            socialLinks: configData.social_links || []
          });
        } else {
          setSiteConfig(DEFAULT_SITE_CONFIG);
          // Insert default config
          await supabase.from('site_config').upsert({
            id: 1,
            site_name: DEFAULT_SITE_CONFIG.siteName,
            logo_url: DEFAULT_SITE_CONFIG.logoUrl,
            footer_text: DEFAULT_SITE_CONFIG.footerText,
            social_links: DEFAULT_SITE_CONFIG.socialLinks
          });
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fallback to localStorage
        const storedProducts = localStorage.getItem('lumina_products');
        const storedCollections = localStorage.getItem('lumina_collections');
        const storedConfig = localStorage.getItem('lumina_config');

        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          setProducts(INITIAL_PRODUCTS);
        }

        if (storedCollections) {
          setCollections(JSON.parse(storedCollections));
        } else {
          setCollections(INITIAL_COLLECTIONS);
        }

        if (storedConfig) {
          setSiteConfig(JSON.parse(storedConfig));
        } else {
          setSiteConfig(DEFAULT_SITE_CONFIG);
        }

        setIsInitialized(true);
      }
    };

    loadData();
  }, []);

  // REMOVED: The useEffect that saved everything on every change.
  // Now we save granularly in each function below.

  const addProduct = async (product: Product) => {
    // Optimistic update
    setProducts((prev) => [...prev, product]);

    try {
      const { error } = await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        category: product.category,
        collection: product.collection,
        price: product.price,
        description: product.description,
        material: product.material,
        image_url: product.imageUrl
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding product to Supabase:', error);
      // Revert optimistic update on error
      setProducts((prev) => prev.filter(p => p.id !== product.id));
      alert('Error al guardar el producto. Por favor intenta de nuevo.');
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    // Optimistic update
    const previousProducts = [...products];
    setProducts((prev) =>
      prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
    );

    try {
      const { error } = await supabase.from('products').upsert({
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.category,
        collection: updatedProduct.collection,
        price: updatedProduct.price,
        description: updatedProduct.description,
        material: updatedProduct.material,
        image_url: updatedProduct.imageUrl
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating product in Supabase:', error);
      // Revert
      setProducts(previousProducts);
      alert('Error al actualizar el producto. Por favor intenta de nuevo.');
    }
  };

  const deleteProduct = async (id: string) => {
    // Optimistic update
    const previousProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product from Supabase:', error);
      // Revert
      setProducts(previousProducts);
      alert('Error al eliminar el producto. Por favor intenta de nuevo.');
    }
  };

  const addCollection = async (data: CollectionData) => {
    if (!collections.some(c => c.name === data.name)) {
      // Optimistic update
      const previousCollections = [...collections];
      setCollections((prev) => [...prev, data]);

      try {
        const { error } = await supabase.from('collections').upsert({
          name: data.name,
          description: data.description
        });
        if (error) throw error;
      } catch (error) {
        console.error('Error adding collection to Supabase:', error);
        // Revert
        setCollections(previousCollections);
        alert('Error al añadir la colección. Por favor intenta de nuevo.');
      }
    }
  };

  const updateCollection = async (originalName: string, data: CollectionData) => {
    // Optimistic update
    const previousCollections = [...collections];
    const previousProducts = [...products];

    // 1. Update Collection Info locally
    setCollections((prev) =>
      prev.map(c => c.name === originalName ? data : c)
    );

    // 2. If name changed, update all associated products locally
    if (originalName !== data.name) {
      setProducts((prev) => prev.map(p => {
        if (p.collection === originalName) {
          return { ...p, collection: data.name };
        }
        return p;
      }));
    }

    try {
      // Database updates
      if (originalName !== data.name) {
        // Create new collection first
        const { error: createError } = await supabase.from('collections').insert({
          name: data.name,
          description: data.description
        });
        if (createError) throw createError;

        // Update products to point to new collection
        const { error: updateProductsError } = await supabase
          .from('products')
          .update({ collection: data.name })
          .eq('collection', originalName);
        if (updateProductsError) throw updateProductsError;

        // Delete old collection
        const { error: deleteError } = await supabase
          .from('collections')
          .delete()
          .eq('name', originalName);
        if (deleteError) throw deleteError;
      } else {
        // Just update description
        const { error } = await supabase.from('collections').update({
          description: data.description
        }).eq('name', originalName);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating collection in Supabase:', error);
      // Revert
      setCollections(previousCollections);
      setProducts(previousProducts);
      alert('Error al actualizar la colección. Por favor intenta de nuevo.');
    }
  };

  const deleteCollection = async (name: string) => {
    if (name === 'Todas') return;

    const previousCollections = [...collections];
    const previousProducts = [...products];
    const fallbackCollection = collections.find(c => c.name !== 'Todas' && c.name !== name)?.name || 'Aurora';

    // Optimistic update
    setCollections((prev) => prev.filter((c) => c.name !== name));
    setProducts((prev) => prev.map(p => {
      if (p.collection === name) {
        return { ...p, collection: fallbackCollection };
      }
      return p;
    }));

    try {
      // Update products in Supabase
      const { error: updateError } = await supabase
        .from('products')
        .update({ collection: fallbackCollection })
        .eq('collection', name);

      if (updateError) throw updateError;

      // Delete collection
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('name', name);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error('Error deleting collection from Supabase:', error);
      // Revert
      setCollections(previousCollections);
      setProducts(previousProducts);
      alert('Error al eliminar la colección. Por favor intenta de nuevo.');
    }
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    const previousConfig = siteConfig;
    setSiteConfig(config);

    try {
      const { error } = await supabase.from('site_config').upsert({
        id: 1,
        site_name: config.siteName,
        logo_url: config.logoUrl,
        footer_text: config.footerText,
        social_links: config.socialLinks
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating site config in Supabase:', error);
      setSiteConfig(previousConfig);
      alert('Error al actualizar la configuración. Por favor intenta de nuevo.');
    }
  };

  const resetToDefault = async () => {
    if (!window.confirm('¿Estás seguro de que quieres restablecer todo a los valores por defecto? Esto borrará todos los datos actuales.')) {
      return;
    }

    const previousProducts = products;
    const previousCollections = collections;
    const previousConfig = siteConfig;

    setProducts(INITIAL_PRODUCTS);
    setCollections(INITIAL_COLLECTIONS);
    setSiteConfig(DEFAULT_SITE_CONFIG);

    try {
      // Clear and reset in Supabase
      // Note: We need to be careful with foreign key constraints.
      // 1. Delete all products
      await supabase.from('products').delete().neq('id', 'placeholder'); // Delete all

      // 2. Delete all collections except 'Todas' if it exists, or just all and recreate
      // It's safer to delete collections that are NOT in the initial set, or just wipe all if possible.
      // For simplicity in this reset function, we'll try to wipe and recreate.

      // We might need to delete collections one by one or disable constraints, but RLS might block "delete all".
      // Let's try deleting products first (done above), then collections.
      await supabase.from('collections').delete().neq('name', 'placeholder');

      // 3. Insert default collections
      for (const col of INITIAL_COLLECTIONS) {
        await supabase.from('collections').upsert({ name: col.name, description: col.description });
      }

      // 4. Insert default products
      for (const product of INITIAL_PRODUCTS) {
        await supabase.from('products').upsert({
          id: product.id,
          name: product.name,
          category: product.category,
          collection: product.collection,
          price: product.price,
          description: product.description,
          material: product.material,
          image_url: product.imageUrl
        });
      }

      // 5. Reset config
      await supabase.from('site_config').upsert({
        id: 1,
        site_name: DEFAULT_SITE_CONFIG.siteName,
        logo_url: DEFAULT_SITE_CONFIG.logoUrl,
        footer_text: DEFAULT_SITE_CONFIG.footerText,
        social_links: DEFAULT_SITE_CONFIG.socialLinks
      });

      alert('Sitio restablecido correctamente.');
    } catch (error) {
      console.error('Error resetting to default in Supabase:', error);
      setProducts(previousProducts);
      setCollections(previousCollections);
      setSiteConfig(previousConfig);
      alert('Error al restablecer el sitio.');
    }
  }

  if (!isInitialized) return null;

  return (
    <ShopContext.Provider value={{
      products,
      collections,
      siteConfig,
      addProduct,
      updateProduct,
      deleteProduct,
      addCollection,
      updateCollection,
      deleteCollection,
      updateSiteConfig,
      resetToDefault
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};