import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../contexts/ShopContext';
import { Product, Category, CollectionData, SiteConfig, SocialLink, CategoryData, MaterialData } from '../types';

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
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
  } = useShop();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'inventory' | 'classification' | 'settings'>('inventory');

  // Inventory View State
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Collection Management State
  const [editingCollectionName, setEditingCollectionName] = useState<string | null>(null);
  const [collectionForm, setCollectionForm] = useState<CollectionData>({ name: '', description: '' });

  // Category Management State
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryData>({ name: '', description: '' });

  // Material Management State
  const [editingMaterialName, setEditingMaterialName] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState<MaterialData>({ name: '', description: '' });

  // Settings View State
  const [configForm, setConfigForm] = useState<SiteConfig>(siteConfig);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Product Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: categories[0]?.name || '',
    collection: 'Aurora',
    price: '',
    description: '',
    material: '',
    imageUrl: ''
  });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterCollection, setFilterCollection] = useState('');
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'name-asc'>('date-desc');

  // Scroll State for Sticky Header
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bulk Selection State
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkUpdate = async (field: keyof Product, value: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas actualizar ${selectedProducts.size} productos?`)) return;

    const updates = Array.from(selectedProducts).map(id => {
      const product = products.find(p => p.id === id);
      if (!product) return Promise.resolve();

      let finalValue = value;
      if (field === 'price') {
        finalValue = value.includes('€') ? value : `${value} €`;
      }

      return updateProduct({ ...product, [field]: finalValue });
    });

    await Promise.all(updates);
    setSelectedProducts(new Set());
    alert('Productos actualizados correctamente.');
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿ESTÁS SEGURO? Se eliminarán permanentemente ${selectedProducts.size} productos. Esta acción no se puede deshacer.`)) return;

    const deletions = Array.from(selectedProducts).map(id => deleteProduct(id));

    await Promise.all(deletions);
    setSelectedProducts(new Set());
  };

  // Filtered & Sorted Products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? product.category === filterCategory : true;
    const matchesMaterial = filterMaterial ? product.material === filterMaterial : true;
    const matchesCollection = filterCollection ? product.collection === filterCollection : true;
    return matchesSearch && matchesCategory && matchesMaterial && matchesCollection;
  });

  // Fix sort for date since we don't have explicit date in Product type yet, 
  // but we know products from context are sorted by created_at DESC.
  // So for date-desc we can just respect original order (which is stable if we return 0? No, filter creates new array).
  // Actually, let's just use the index in the original products array as a proxy for 'date' if we want to be precise,
  // or just add created_at to Product type.
  // For now, let's assume we want to sort by ID if they were time-sortable, but they are UUIDs.
  // SIMPLE FIX: The context loads products ordered by created_at DESC. 
  // So `products` array is already sorted by date-desc.
  // If we want date-asc, we can just reverse.
  // However, `sort` mutates or we need to be careful.
  // Let's improve the sort logic to use the original index.
  const productIndexMap = new Map<string, number>(products.map((p, i) => [p.id, i]));

  filteredProducts.sort((a, b) => {
    const indexA = productIndexMap.get(a.id) ?? 0;
    const indexB = productIndexMap.get(b.id) ?? 0;

    switch (sortOption) {
      case 'price-desc':
        return (parseFloat(b.price.replace(/[^\d.]/g, '')) || 0) - (parseFloat(a.price.replace(/[^\d.]/g, '')) || 0);
      case 'price-asc':
        return (parseFloat(a.price.replace(/[^\d.]/g, '')) || 0) - (parseFloat(b.price.replace(/[^\d.]/g, '')) || 0);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'date-asc':
        return indexB - indexA; // Reverse of original order (which is DESC) -> ASC
      case 'date-desc':
      default:
        return indexA - indexB; // Original order (DESC)
    }
  });

  // Init config form when entering settings
  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  // Ensure form has valid category when categories load
  useEffect(() => {
    if (!formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, formData.category]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || categories[0]?.name || '',
      collection: product.collection || 'Aurora',
      price: product.price ? product.price.replace(' €', '').replace('€', '') : '',
      description: product.description || '',
      material: product.material || '',
      imageUrl: product.imageUrl || ''
    });
    setView('form');
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  const handleDeleteCollection = (name: string) => {
    const productCount = products.filter(p => p.collection === name).length;
    const msg = productCount > 0
      ? `Esta colección tiene ${productCount} productos. Si la eliminas, se moverán a otra colección. ¿Continuar?`
      : `¿Eliminar la colección "${name}"?`;

    if (window.confirm(msg)) {
      deleteCollection(name);
      if (editingCollectionName === name) {
        resetCollectionForm();
      }
    }
  };

  const handleEditCollection = (col: CollectionData) => {
    setEditingCollectionName(col.name);
    setCollectionForm(col);
  };

  const resetCollectionForm = () => {
    setEditingCollectionName(null);
    setCollectionForm({ name: '', description: '' });
  };

  const handleSaveCollection = () => {
    if (!collectionForm.name.trim()) return;

    if (editingCollectionName) {
      updateCollection(editingCollectionName, collectionForm);
    } else {
      addCollection(collectionForm);
    }
    resetCollectionForm();
  };

  // --- Category Handlers ---
  const handleEditCategory = (cat: CategoryData) => {
    setEditingCategoryName(cat.name);
    setCategoryForm(cat);
  };

  const resetCategoryForm = () => {
    setEditingCategoryName(null);
    setCategoryForm({ name: '', description: '' });
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return;

    if (editingCategoryName) {
      updateCategory(editingCategoryName, categoryForm);
    } else {
      addCategory(categoryForm);
    }
    resetCategoryForm();
  };

  const handleDeleteCategory = (name: string) => {
    const productCount = products.filter(p => p.category === name).length;
    const msg = productCount > 0
      ? `Esta categoría tiene ${productCount} productos. Si la eliminas, se moverán a otra categoría. ¿Continuar?`
      : `¿Eliminar la categoría "${name}"?`;

    if (window.confirm(msg)) {
      deleteCategory(name);
      if (editingCategoryName === name) {
        resetCategoryForm();
      }
    }
  };

  // --- Material Handlers ---
  const handleEditMaterial = (mat: MaterialData) => {
    setEditingMaterialName(mat.name);
    setMaterialForm(mat);
  };

  const resetMaterialForm = () => {
    setEditingMaterialName(null);
    setMaterialForm({ name: '', description: '' });
  };

  const handleSaveMaterial = () => {
    if (!materialForm.name.trim()) return;

    if (editingMaterialName) {
      updateMaterial(editingMaterialName, materialForm);
    } else {
      addMaterial(materialForm);
    }
    resetMaterialForm();
  };

  const handleDeleteMaterial = (name: string) => {
    const productCount = products.filter(p => p.material === name).length;
    const msg = productCount > 0
      ? `Este material tiene ${productCount} productos. Si lo eliminas, se moverán a otro material. ¿Continuar?`
      : `¿Eliminar el material "${name}"?`;

    if (window.confirm(msg)) {
      deleteMaterial(name);
      if (editingMaterialName === name) {
        resetMaterialForm();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) return;

    const formattedPrice = formData.price?.includes('€')
      ? formData.price
      : `${formData.price} €`;

    if (editingProduct) {
      updateProduct({ ...formData, price: formattedPrice, id: editingProduct.id } as Product);
    } else {
      addProduct({ ...formData, price: formattedPrice, id: Date.now().toString() } as Product);
    }

    setView('list');
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || '',
      collection: collections[1]?.name || 'Aurora',
      price: '',
      description: '',
      material: '',
      imageUrl: ''
    });
  };

  // --- Settings Handlers ---

  const handleSaveSettings = () => {
    updateSiteConfig(configForm);
    alert('Configuración guardada correctamente.');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfigForm(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setConfigForm(prev => ({ ...prev, logoUrl: null }));
  };

  const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...configForm.socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setConfigForm({ ...configForm, socialLinks: newLinks });
  };

  const handleAddSocial = () => {
    setConfigForm({
      ...configForm,
      socialLinks: [...configForm.socialLinks, { platform: '', url: '' }]
    });
  };

  const handleRemoveSocial = (index: number) => {
    const newLinks = configForm.socialLinks.filter((_, i) => i !== index);
    setConfigForm({ ...configForm, socialLinks: newLinks });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 overflow-y-auto animate-fadeIn">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-serif tracking-widest">Editor</h2>
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`text-xs uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-white text-white' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              Inventario
            </button>
            <button
              onClick={() => setActiveTab('classification')}
              className={`text-xs uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'classification' ? 'border-white text-white' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              Clasificación
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`text-xs uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'settings' ? 'border-white text-white' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              Configuración del Sitio
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={resetToDefault} className="text-xs uppercase tracking-widest text-stone-400 hover:text-white">
            Restaurar Datos
          </button>
          <button onClick={onClose} className="text-xs uppercase tracking-widest hover:text-stone-300">
            Cerrar Editor
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12">

        {/* MOBILE TABS */}
        <div className="md:hidden flex gap-2 mb-6 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 text-xs uppercase py-2 ${activeTab === 'inventory' ? 'bg-stone-200 font-bold' : 'bg-stone-100'}`}
          >
            Inventario
          </button>
          <button
            onClick={() => setActiveTab('classification')}
            className={`flex-1 text-xs uppercase py-2 ${activeTab === 'classification' ? 'bg-stone-200 font-bold' : 'bg-stone-100'}`}
          >
            Clasificación
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 text-xs uppercase py-2 ${activeTab === 'settings' ? 'bg-stone-200 font-bold' : 'bg-stone-100'}`}
          >
            Configuración
          </button>
        </div>

        {activeTab === 'inventory' && (
          /* --- INVENTORY TAB --- */
          view === 'list' ? (
            <div className="space-y-12">

              <div className="sticky top-[60px] z-30 bg-stone-50/95 backdrop-blur-sm transition-all duration-300 space-y-4 pb-4 border-b border-stone-200 -mx-6 px-6 md:-mx-12 md:px-12 pt-4">

                {/* Search & Filters - Hides on scroll down */}
                <div className={`transition-all duration-300 overflow-hidden ${scrollDirection === 'down' ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                  <div className="bg-stone-50 p-4 border border-stone-200 rounded-sm space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Search */}
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Buscar productos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white border border-stone-300 p-2 text-sm text-stone-800 focus:border-stone-800 focus:outline-none"
                        />
                      </div>
                      {/* Sort */}
                      <div className="w-full md:w-48">
                        <select
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value as any)}
                          className="w-full bg-white border border-stone-300 p-2 text-sm text-stone-800 focus:border-stone-800 focus:outline-none"
                        >
                          <option value="date-desc">Más recientes</option>
                          <option value="date-asc">Más antiguos</option>
                          <option value="price-asc">Precio: Menor a Mayor</option>
                          <option value="price-desc">Precio: Mayor a Menor</option>
                          <option value="name-asc">Nombre (A-Z)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Filter Category */}
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-white border border-stone-300 p-2 text-sm text-stone-800 focus:border-stone-800 focus:outline-none"
                      >
                        <option value="">Todas las Categorías</option>
                        {categories.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>

                      {/* Filter Material */}
                      <select
                        value={filterMaterial}
                        onChange={(e) => setFilterMaterial(e.target.value)}
                        className="w-full bg-white border border-stone-300 p-2 text-sm text-stone-800 focus:border-stone-800 focus:outline-none"
                      >
                        <option value="">Todos los Materiales</option>
                        {materials.map(m => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                      </select>

                      {/* Filter Collection */}
                      <select
                        value={filterCollection}
                        onChange={(e) => setFilterCollection(e.target.value)}
                        className="w-full bg-white border border-stone-300 p-2 text-sm text-stone-800 focus:border-stone-800 focus:outline-none"
                      >
                        <option value="">Todas las Colecciones</option>
                        {collections.filter(c => c.name !== 'Todas').map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Stats & Actions - Always Visible */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h1 className="text-3xl font-serif text-stone-800 mb-2">Inventario</h1>
                    <p className="text-stone-500">
                      Mostrando {filteredProducts.length} de {products.length} productos
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setFormData({
                        name: '',
                        category: categories[0]?.name || '',
                        collection: collections[1]?.name || 'Aurora',
                        price: '',
                        description: '',
                        material: '',
                        imageUrl: ''
                      });
                      setView('form');
                    }}
                    className="bg-stone-800 text-white px-6 py-3 rounded text-sm uppercase tracking-widest hover:bg-stone-700 transition-colors shadow-lg"
                  >
                    + Nuevo Producto
                  </button>
                </div>
              </div>

              {/* Bulk Actions Toolbar */}
              {selectedProducts.size > 0 && (
                <div className="bg-stone-900 text-white p-4 rounded-sm shadow-lg animate-fadeIn sticky top-20 z-20">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="text-sm font-bold uppercase tracking-widest">
                      {selectedProducts.size} seleccionados
                    </span>

                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Bulk Category */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleBulkUpdate('category', e.target.value);
                          e.target.value = '';
                        }}
                        className="bg-stone-800 text-white border border-stone-700 text-xs p-2 rounded hover:bg-stone-700"
                      >
                        <option value="">Cambiar Categoría...</option>
                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>

                      {/* Bulk Collection */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleBulkUpdate('collection', e.target.value);
                          e.target.value = '';
                        }}
                        className="bg-stone-800 text-white border border-stone-700 text-xs p-2 rounded hover:bg-stone-700"
                      >
                        <option value="">Cambiar Colección...</option>
                        {collections.filter(c => c.name !== 'Todas').map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>

                      {/* Bulk Material */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleBulkUpdate('material', e.target.value);
                          e.target.value = '';
                        }}
                        className="bg-stone-800 text-white border border-stone-700 text-xs p-2 rounded hover:bg-stone-700"
                      >
                        <option value="">Cambiar Material...</option>
                        {materials.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                      </select>

                      {/* Bulk Price */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Nuevo Precio"
                          className="w-24 bg-stone-800 border border-stone-700 text-xs p-2 text-white placeholder-stone-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleBulkUpdate('price', e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleBulkDelete}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 uppercase tracking-wider"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setSelectedProducts(new Set())}
                        className="text-xs text-stone-400 hover:text-white underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Table */}
              <div className="overflow-x-auto bg-white border border-stone-200 shadow-sm">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-100 text-stone-800 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4 w-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                        />
                      </th>
                      <th className="px-6 py-4">Imagen</th>
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4">Colección</th>
                      <th className="px-6 py-4">Material</th>
                      <th className="px-6 py-4">Precio</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className={`hover:bg-stone-50 transition-colors ${selectedProducts.has(product.id) ? 'bg-stone-50' : ''}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-stone-200 overflow-hidden rounded-sm">
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-stone-800">{product.name}</td>
                        <td className="px-6 py-4 text-stone-500">{product.category}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-stone-100 rounded text-xs border border-stone-200 text-stone-700">
                            {product.collection}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-500">{product.material}</td>
                        <td className="px-6 py-4 text-stone-800">{product.price}</td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-stone-500 hover:text-stone-800 underline decoration-stone-300 underline-offset-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-400 hover:text-red-600 underline decoration-red-100 underline-offset-4"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* PRODUCT FORM VIEW */
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setView('list')}
                className="mb-6 flex items-center text-stone-500 hover:text-stone-800 text-sm"
              >
                ← Volver a la lista
              </button>

              <div className="bg-white p-8 md:p-10 border border-stone-200 shadow-lg">
                <h2 className="text-2xl font-serif text-stone-900 mb-8 pb-4 border-b border-stone-100">
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h2>

                <form onSubmit={handleSubmitProduct} className="space-y-6">

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-stone-500">Fotografía</label>
                    <div className="flex items-center gap-6">
                      <div
                        className="w-24 h-24 bg-stone-100 border border-stone-200 flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors overflow-hidden relative"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {formData.imageUrl ? (
                          <img src={formData.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl text-stone-400">+</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm border border-stone-300 px-4 py-2 hover:bg-stone-50 transition-colors text-stone-800"
                        >
                          Seleccionar Archivo
                        </button>
                        <p className="mt-2 text-xs text-stone-400">Recomendado: Formato vertical 3:4</p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-widest text-stone-500">Nombre</label>
                      <input
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-widest text-stone-500">Precio</label>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={e => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors pr-8"
                        />
                        <span className="absolute right-2 top-2 text-stone-500">€</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase text-stone-400 mb-1 block">Categoría</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:outline-none focus:border-stone-800 focus:bg-white transition-colors"
                      >
                        {categories.map(cat => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase text-stone-400 mb-1 block">Colección</label>
                      <select
                        value={formData.collection}
                        onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:outline-none focus:border-stone-800 focus:bg-white transition-colors"
                      >
                        {collections.filter(c => c.name !== 'Todas').map(col => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-widest text-stone-500">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full bg-stone-50 border border-stone-300 p-3 mt-1 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white resize-none font-light transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase text-stone-400 mb-1 block">Material</label>
                    <select
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:outline-none focus:border-stone-800 focus:bg-white transition-colors"
                    >
                      <option value="">Seleccionar material...</option>
                      {materials.map(mat => (
                        <option key={mat.name} value={mat.name}>{mat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      className="px-6 py-3 text-sm text-stone-500 hover:text-stone-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-stone-900 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-stone-700 transition-colors shadow-md"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        )}

        {activeTab === 'classification' && (
          /* --- CLASSIFICATION TAB --- */
          <div className="max-w-6xl mx-auto space-y-12">
            <div>
              <h1 className="text-3xl font-serif text-stone-800 mb-2">Clasificación</h1>
              <p className="text-stone-500">Gestiona las categorías, materiales y colecciones de tus productos.</p>
            </div>

            {/* Categories Management */}
            <div className="bg-white p-6 md:p-8 border border-stone-200 rounded-sm shadow-sm grid md:grid-cols-3 gap-8">
              {/* Create/Edit Category Form */}
              <div className="md:col-span-1 border-r border-stone-100 pr-0 md:pr-8">
                <h3 className="font-serif text-lg mb-4 text-stone-800">
                  {editingCategoryName ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase text-stone-400 mb-1 block">Nombre</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white transition-colors"
                      placeholder="Ej. Collares"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-stone-400 mb-1 block">Descripción</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 p-3 mt-1 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white h-24 resize-none transition-colors"
                      placeholder="Descripción breve..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveCategory}
                      disabled={!categoryForm.name.trim()}
                      className="flex-1 bg-stone-800 text-white text-xs uppercase py-2 hover:bg-stone-700 disabled:opacity-50"
                    >
                      {editingCategoryName ? 'Guardar' : 'Crear'}
                    </button>
                    {editingCategoryName && (
                      <button
                        onClick={resetCategoryForm}
                        className="px-3 bg-stone-200 text-stone-600 text-xs uppercase py-2 hover:bg-stone-300"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category List */}
              <div className="md:col-span-2">
                <h3 className="font-serif text-lg mb-4 text-stone-800">Categorías Activas</h3>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2">
                  {categories.map(c => (
                    <div key={c.name} className={`flex justify-between items-center p-3 border rounded-sm transition-colors ${editingCategoryName === c.name ? 'bg-stone-50 border-stone-400' : 'bg-white border-stone-100 hover:border-stone-300'}`}>
                      <div>
                        <div className="font-medium text-stone-800">{c.name}</div>
                        <div className="text-xs text-stone-500 truncate max-w-xs">{c.description}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(c)}
                          className="text-stone-400 hover:text-stone-800 p-1"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.name)}
                          className="text-stone-300 hover:text-red-500 p-1"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-stone-400 italic">No hay categorías definidas.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Materials Management */}
            <div className="bg-white p-6 md:p-8 border border-stone-200 rounded-sm shadow-sm grid md:grid-cols-3 gap-8">
              {/* Create/Edit Material Form */}
              <div className="md:col-span-1 border-r border-stone-100 pr-0 md:pr-8">
                <h3 className="font-serif text-lg mb-4 text-stone-800">
                  {editingMaterialName ? 'Editar Material' : 'Nuevo Material'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase text-stone-400 mb-1 block">Nombre</label>
                    <input
                      type="text"
                      value={materialForm.name}
                      onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                      className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white transition-colors"
                      placeholder="Ej. Oro 18k"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-stone-400 mb-1 block">Descripción</label>
                    <textarea
                      value={materialForm.description}
                      onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 p-3 mt-1 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white h-24 resize-none transition-colors"
                      placeholder="Descripción breve..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveMaterial}
                      disabled={!materialForm.name.trim()}
                      className="flex-1 bg-stone-800 text-white text-xs uppercase py-2 hover:bg-stone-700 disabled:opacity-50"
                    >
                      {editingMaterialName ? 'Guardar' : 'Crear'}
                    </button>
                    {editingMaterialName && (
                      <button
                        onClick={resetMaterialForm}
                        className="px-3 bg-stone-200 text-stone-600 text-xs uppercase py-2 hover:bg-stone-300"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Material List */}
              <div className="md:col-span-2">
                <h3 className="font-serif text-lg mb-4 text-stone-800">Materiales Activos</h3>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2">
                  {materials.map(m => (
                    <div key={m.name} className={`flex justify-between items-center p-3 border rounded-sm transition-colors ${editingMaterialName === m.name ? 'bg-stone-50 border-stone-400' : 'bg-white border-stone-100 hover:border-stone-300'}`}>
                      <div>
                        <div className="font-medium text-stone-800">{m.name}</div>
                        <div className="text-xs text-stone-500 truncate max-w-xs">{m.description}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMaterial(m)}
                          className="text-stone-400 hover:text-stone-800 p-1"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(m.name)}
                          className="text-stone-300 hover:text-red-500 p-1"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {materials.length === 0 && (
                    <p className="text-sm text-stone-400 italic">No hay materiales definidos.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Collections Management Panel */}
            <div className="bg-white p-6 md:p-8 border border-stone-200 rounded-sm shadow-sm grid md:grid-cols-3 gap-8">
              {/* Collection Form */}
              <div className="md:col-span-1 border-r border-stone-100 pr-0 md:pr-8">
                <h3 className="font-serif text-lg mb-4 text-stone-800">
                  {editingCollectionName ? 'Editar Colección' : 'Nueva Colección'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase text-stone-400 mb-1 block">Nombre</label>
                    <input
                      type="text"
                      value={collectionForm.name}
                      onChange={(e) => setCollectionForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white transition-colors"
                      placeholder="Ej. Verano"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-stone-400 mb-1 block">Descripción</label>
                    <textarea
                      value={collectionForm.description}
                      onChange={(e) => setCollectionForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-stone-50 border border-stone-200 p-3 mt-1 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white h-24 resize-none transition-colors"
                      placeholder="Describe la inspiración..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveCollection}
                      disabled={!collectionForm.name}
                      className="flex-1 bg-stone-800 text-white text-xs uppercase py-2 hover:bg-stone-700 disabled:opacity-50"
                    >
                      {editingCollectionName ? 'Actualizar' : 'Crear'}
                    </button>
                    {editingCollectionName && (
                      <button
                        onClick={resetCollectionForm}
                        className="px-3 bg-stone-200 text-stone-600 text-xs uppercase py-2 hover:bg-stone-300"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Collection List */}
              <div className="md:col-span-2">
                <h3 className="font-serif text-lg mb-4 text-stone-800">Colecciones Activas</h3>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2">
                  {collections.filter(c => c.name !== 'Todas').map(c => (
                    <div key={c.name} className={`flex justify-between items-center p-3 border rounded-sm transition-colors ${editingCollectionName === c.name ? 'bg-stone-50 border-stone-400' : 'bg-white border-stone-100 hover:border-stone-300'}`}>
                      <div>
                        <div className="font-medium text-stone-800">{c.name}</div>
                        <div className="text-xs text-stone-500 truncate max-w-xs">{c.description}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCollection(c)}
                          className="text-stone-400 hover:text-stone-800 p-1"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(c.name)}
                          className="text-stone-300 hover:text-red-500 p-1"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {collections.filter(c => c.name !== 'Todas').length === 0 && (
                    <p className="text-sm text-stone-400 italic">No hay colecciones personalizadas.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (

          <div className="bg-white p-8 md:p-10 border border-stone-200 shadow-sm space-y-8">

            {/* Branding */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-stone-800 border-b border-stone-100 pb-2">Logotipo e Identidad</h3>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest text-stone-500">Logotipo (SVG o PNG)</label>
                <div className="flex items-start gap-6 pt-2">
                  <div
                    className="w-32 h-32 bg-stone-100 border border-stone-200 flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors overflow-hidden relative rounded-sm"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {configForm.logoUrl ? (
                      <img src={configForm.logoUrl} className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-xs text-stone-400 text-center px-2">Sin Logo<br />(Click para subir)</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/png, image/svg+xml, image/jpeg"
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="text-sm border border-stone-300 px-4 py-2 hover:bg-stone-50 transition-colors text-stone-800"
                        >
                          Subir Logo
                        </button>
                        {configForm.logoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="text-sm border border-red-200 text-red-500 px-4 py-2 hover:bg-red-50 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-stone-400">Formatos: PNG o SVG (Fondo transparente recomendado)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-4">
                <label className="block text-xs uppercase tracking-widest text-stone-500">Nombre de la Tienda (Texto Alternativo)</label>
                <input
                  value={configForm.siteName}
                  onChange={e => setConfigForm({ ...configForm, siteName: e.target.value })}
                  className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors text-lg font-serif"
                  placeholder="Nombre visible si no hay logo"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-widest text-stone-500">Texto del Pie de Página</label>
                <input
                  value={configForm.footerText}
                  onChange={e => setConfigForm({ ...configForm, footerText: e.target.value })}
                  className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-stone-800 border-b border-stone-100 pb-2">Redes Sociales y Enlaces</h3>
              <p className="text-xs text-stone-400">Estos enlaces aparecerán en el pie de página del sitio.</p>

              <div className="space-y-3">
                {configForm.socialLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-4 items-end animate-fadeIn">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400">Nombre / Plataforma</label>
                      <input
                        value={link.platform}
                        onChange={e => handleSocialChange(idx, 'platform', e.target.value)}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div className="flex-[2] space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400">URL / Enlace</label>
                      <input
                        value={link.url}
                        onChange={e => handleSocialChange(idx, 'url', e.target.value)}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveSocial(idx)}
                      className="text-stone-300 hover:text-red-500 pb-2"
                      title="Eliminar enlace"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddSocial}
                className="mt-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 border border-dashed border-stone-300 px-4 py-2 hover:border-stone-500 transition-colors w-full"
              >
                + Agregar Enlace
              </button>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="bg-stone-900 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-stone-700 transition-colors shadow-md"
              >
                Guardar Cambios
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}