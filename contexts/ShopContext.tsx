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

  // Save to Supabase whenever state changes (but not on initial load)
  useEffect(() => {
    if (!isInitialized) return;

    const saveData = async () => {
      try {
        // Save collections
        for (const col of collections) {
          await supabase.from('collections').upsert({
            name: col.name,
            description: col.description
          });
        }

        // Save products
        for (const product of products) {
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

        // Save site config
        await supabase.from('site_config').upsert({
          id: 1,
          site_name: siteConfig.siteName,
          logo_url: siteConfig.logoUrl,
          footer_text: siteConfig.footerText,
          social_links: siteConfig.socialLinks
        });
      } catch (error) {
        console.error('Error saving to Supabase:', error);
        // Fallback to localStorage
        localStorage.setItem('lumina_products', JSON.stringify(products));
        localStorage.setItem('lumina_collections', JSON.stringify(collections));
        localStorage.setItem('lumina_config', JSON.stringify(siteConfig));
      }
    };

    saveData();
  }, [products, collections, siteConfig, isInitialized]);

  const addProduct = async (product: Product) => {
    setProducts((prev) => [...prev, product]);
    try {
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
    } catch (error) {
      console.error('Error adding product to Supabase:', error);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts((prev) => 
      prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
    );
    try {
      await supabase.from('products').upsert({
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.category,
        collection: updatedProduct.collection,
        price: updatedProduct.price,
        description: updatedProduct.description,
        material: updatedProduct.material,
        image_url: updatedProduct.imageUrl
      });
    } catch (error) {
      console.error('Error updating product in Supabase:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting product from Supabase:', error);
    }
  };

  const addCollection = async (data: CollectionData) => {
    if (!collections.some(c => c.name === data.name)) {
      setCollections((prev) => [...prev, data]);
      try {
        await supabase.from('collections').upsert({
          name: data.name,
          description: data.description
        });
      } catch (error) {
        console.error('Error adding collection to Supabase:', error);
      }
    }
  };

  const updateCollection = async (originalName: string, data: CollectionData) => {
    // 1. Update Collection Info
    setCollections((prev) => 
      prev.map(c => c.name === originalName ? data : c)
    );

    // 2. If name changed, update all associated products
    if (originalName !== data.name) {
      setProducts((prev) => prev.map(p => {
        if (p.collection === originalName) {
          return { ...p, collection: data.name };
        }
        return p;
      }));

      // Update products in Supabase
      try {
        const { data: productsToUpdate } = await supabase
          .from('products')
          .select('id')
          .eq('collection', originalName);

        if (productsToUpdate) {
          for (const p of productsToUpdate) {
            await supabase.from('products').update({ collection: data.name }).eq('id', p.id);
          }
        }
      } catch (error) {
        console.error('Error updating products collection in Supabase:', error);
      }
    }

    try {
      // Update or insert collection
      if (originalName !== data.name) {
        // Delete old collection and create new one
        await supabase.from('collections').delete().eq('name', originalName);
      }
      await supabase.from('collections').upsert({
        name: data.name,
        description: data.description
      });
    } catch (error) {
      console.error('Error updating collection in Supabase:', error);
    }
  };

  const deleteCollection = async (name: string) => {
    if (name === 'Todas') return; // Cannot delete the root collection

    // 1. Remove the collection
    setCollections((prev) => prev.filter((c) => c.name !== name));

    // 2. Reassign products in that collection to the first available specific collection (usually 'Aurora')
    const fallbackCollection = collections.find(c => c.name !== 'Todas' && c.name !== name)?.name || 'Aurora';
    
    setProducts((prev) => prev.map(p => {
      if (p.collection === name) {
        return { ...p, collection: fallbackCollection };
      }
      return p;
    }));

    try {
      // Update products in Supabase
      await supabase.from('products').update({ collection: fallbackCollection }).eq('collection', name);
      // Delete collection
      await supabase.from('collections').delete().eq('name', name);
    } catch (error) {
      console.error('Error deleting collection from Supabase:', error);
    }
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    setSiteConfig(config);
    try {
      await supabase.from('site_config').upsert({
        id: 1,
        site_name: config.siteName,
        logo_url: config.logoUrl,
        footer_text: config.footerText,
        social_links: config.socialLinks
      });
    } catch (error) {
      console.error('Error updating site config in Supabase:', error);
    }
  };

  const resetToDefault = async () => {
    setProducts(INITIAL_PRODUCTS);
    setCollections(INITIAL_COLLECTIONS);
    setSiteConfig(DEFAULT_SITE_CONFIG);
    
    try {
      // Clear and reset in Supabase
      await supabase.from('products').delete().neq('id', '');
      await supabase.from('collections').delete().neq('name', '');
      
      // Insert default data
      for (const col of INITIAL_COLLECTIONS) {
        await supabase.from('collections').upsert({ name: col.name, description: col.description });
      }
      
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
      
      await supabase.from('site_config').upsert({
        id: 1,
        site_name: DEFAULT_SITE_CONFIG.siteName,
        logo_url: DEFAULT_SITE_CONFIG.logoUrl,
        footer_text: DEFAULT_SITE_CONFIG.footerText,
        social_links: DEFAULT_SITE_CONFIG.socialLinks
      });
    } catch (error) {
      console.error('Error resetting to default in Supabase:', error);
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