import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CollectionData, SiteConfig, CategoryData, MaterialData } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS, COLLECTIONS as INITIAL_COLLECTIONS, DEFAULT_SITE_CONFIG } from '../constants';
import { supabase } from '../lib/supabase';

interface ShopContextType {
  products: Product[];
  collections: CollectionData[];
  categories: CategoryData[];
  materials: MaterialData[];
  siteConfig: SiteConfig;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCollection: (data: CollectionData) => void;
  updateCollection: (originalName: string, data: CollectionData) => void;
  deleteCollection: (name: string) => void;
  addCategory: (data: CategoryData) => void;
  updateCategory: (originalName: string, data: CategoryData) => void;
  deleteCategory: (name: string) => void;
  addMaterial: (data: MaterialData) => void;
  updateMaterial: (originalName: string, data: MaterialData) => void;
  deleteMaterial: (name: string) => void;
  updateSiteConfig: (config: SiteConfig) => void;
  resetToDefault: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
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
          setCollections(INITIAL_COLLECTIONS);
          for (const col of INITIAL_COLLECTIONS) {
            await supabase.from('collections').upsert({ name: col.name, description: col.description });
          }
        }

        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (!categoriesError && categoriesData) {
          setCategories(categoriesData.map(c => ({ name: c.name, description: c.description || '' })));
        }

        // Load materials
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select('*')
          .order('name');

        if (!materialsError && materialsData) {
          setMaterials(materialsData.map(m => ({ name: m.name, description: m.description || '' })));
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

  const addCollection = async (collection: CollectionData) => {
    // Optimistic
    setCollections(prev => [...prev, collection]);
    try {
      const { error } = await supabase.from('collections').insert({
        name: collection.name,
        description: collection.description
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error adding collection:', error);
      setCollections(prev => prev.filter(c => c.name !== collection.name));
      alert('Error al crear la colección');
    }
  };

  const updateCollection = async (originalName: string, updatedCollection: CollectionData) => {
    // Optimistic
    setCollections(prev => prev.map(c => c.name === originalName ? updatedCollection : c));

    // Also update products that use this collection
    if (originalName !== updatedCollection.name) {
      setProducts(prev => prev.map(p => p.collection === originalName ? { ...p, collection: updatedCollection.name } : p));
    }

    try {
      const { error } = await supabase.from('collections')
        .update({ name: updatedCollection.name, description: updatedCollection.description })
        .eq('name', originalName);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating collection:', error);
      // Revert is complex here, simplified for now
      alert('Error al actualizar la colección');
    }
  };

  const deleteCollection = async (name: string) => {
    // Optimistic
    setCollections(prev => prev.filter(c => c.name !== name));
    try {
      const { error } = await supabase.from('collections').delete().eq('name', name);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Error al eliminar la colección');
    }
  };

  // --- Categories CRUD ---

  const addCategory = async (category: CategoryData) => {
    setCategories(prev => [...prev, category]);
    try {
      const { error } = await supabase.from('categories').insert(category);
      if (error) throw error;
    } catch (error) {
      console.error('Error adding category:', error);
      setCategories(prev => prev.filter(c => c.name !== category.name));
      alert('Error al crear la categoría');
    }
  };

  const updateCategory = async (originalName: string, updatedCategory: CategoryData) => {
    setCategories(prev => prev.map(c => c.name === originalName ? updatedCategory : c));

    // Update products using this category
    if (originalName !== updatedCategory.name) {
      setProducts(prev => prev.map(p => p.category === originalName ? { ...p, category: updatedCategory.name } : p));
    }

    try {
      const { error } = await supabase.from('categories')
        .update(updatedCategory)
        .eq('name', originalName);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error al actualizar la categoría');
    }
  };

  const deleteCategory = async (name: string) => {
    setCategories(prev => prev.filter(c => c.name !== name));
    try {
      const { error } = await supabase.from('categories').delete().eq('name', name);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  // --- Materials CRUD ---

  const addMaterial = async (material: MaterialData) => {
    setMaterials(prev => [...prev, material]);
    try {
      const { error } = await supabase.from('materials').insert(material);
      if (error) throw error;
    } catch (error) {
      console.error('Error adding material:', error);
      setMaterials(prev => prev.filter(m => m.name !== material.name));
      alert('Error al crear el material');
    }
  };

  const updateMaterial = async (originalName: string, updatedMaterial: MaterialData) => {
    setMaterials(prev => prev.map(m => m.name === originalName ? updatedMaterial : m));

    // Update products using this material
    if (originalName !== updatedMaterial.name) {
      setProducts(prev => prev.map(p => p.material === originalName ? { ...p, material: updatedMaterial.name } : p));
    }

    try {
      const { error } = await supabase.from('materials')
        .update(updatedMaterial)
        .eq('name', originalName);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating material:', error);
      alert('Error al actualizar el material');
    }
  };

  const deleteMaterial = async (name: string) => {
    setMaterials(prev => prev.filter(m => m.name !== name));
    try {
      const { error } = await supabase.from('materials').delete().eq('name', name);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Error al eliminar el material');
    }
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    setSiteConfig(config);
    try {
      const { data } = await supabase.from('site_config').select('id').limit(1).single();

      if (data) {
        await supabase.from('site_config').update({
          site_name: config.siteName,
          logo_url: config.logoUrl,
          footer_text: config.footerText,
          social_links: config.socialLinks
        }).eq('id', data.id);
      } else {
        await supabase.from('site_config').insert({
          site_name: config.siteName,
          logo_url: config.logoUrl,
          footer_text: config.footerText,
          social_links: config.socialLinks
        });
      }
    } catch (error) {
      console.error('Error updating site config:', error);
    }
  };

  const resetToDefault = async () => {
    if (!window.confirm('¿Estás seguro? Esto borrará TODOS los datos y restaurará el contenido de demostración.')) return;

    try {
      await supabase.from('products').delete().neq('id', '0');
      await supabase.from('collections').delete().neq('name', 'placeholder');
      await supabase.from('categories').delete().neq('name', 'placeholder');
      await supabase.from('materials').delete().neq('name', 'placeholder');

      setProducts(INITIAL_PRODUCTS);
      setCollections(INITIAL_COLLECTIONS);
      setSiteConfig(DEFAULT_SITE_CONFIG);

      window.location.reload();

    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Error al restaurar los datos');
    }
  };

  if (!isInitialized) return null;

  return (
    <ShopContext.Provider value={{
      products,
      collections,
      categories,
      materials,
      siteConfig,
      addProduct,
      updateProduct,
      deleteProduct,
      addCollection,
      updateCollection,
      deleteCollection,
      addCategory,
      updateCategory,
      deleteCategory,
      addMaterial,
      updateMaterial,
      deleteMaterial,
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