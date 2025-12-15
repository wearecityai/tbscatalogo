import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../contexts/ShopContext';
import { Product, Category, CollectionData, SiteConfig, SocialLink } from '../types';

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
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
  } = useShop();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings'>('inventory');
  
  // Inventory View State
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Collection Management State
  const [editingCollectionName, setEditingCollectionName] = useState<string | null>(null);
  const [collectionForm, setCollectionForm] = useState<CollectionData>({ name: '', description: '' });

  // Settings View State
  const [configForm, setConfigForm] = useState<SiteConfig>(siteConfig);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Product Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Collares',
    collection: 'Aurora',
    price: '',
    description: '',
    material: '',
    imageUrl: ''
  });

  // Init config form when entering settings
  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
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

    if (editingProduct) {
      updateProduct({ ...formData, id: editingProduct.id } as Product);
    } else {
      addProduct({ ...formData, id: Date.now().toString() } as Product);
    }
    
    setView('list');
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Collares',
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
           <h2 className="text-xl font-serif tracking-widest">Lumina Editor</h2>
           <div className="hidden md:flex gap-4">
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`text-xs uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-white text-white' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
              >
                Inventario
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
              onClick={() => setActiveTab('settings')}
              className={`flex-1 text-xs uppercase py-2 ${activeTab === 'settings' ? 'bg-stone-200 font-bold' : 'bg-stone-100'}`}
            >
              Configuración
            </button>
        </div>

        {activeTab === 'inventory' ? (
           /* --- INVENTORY TAB --- */
           view === 'list' ? (
            <div className="space-y-12">
              
              {/* Stats & Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-serif text-stone-800 mb-2">Inventario</h1>
                  <p className="text-stone-500">{products.length} productos en {collections.length - 1} colecciones</p>
                </div>
                <button 
                  onClick={() => { setEditingProduct(null); setFormData({ collection: collections[1]?.name || 'Aurora' }); setView('form'); }}
                  className="bg-stone-800 text-white px-6 py-3 rounded text-sm uppercase tracking-widest hover:bg-stone-700 transition-colors shadow-lg"
                >
                  + Nuevo Producto
                </button>
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
                        onChange={(e) => setCollectionForm(prev => ({...prev, name: e.target.value}))}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white transition-colors"
                        placeholder="Ej. Verano"
                      />
                     </div>
                     <div>
                       <label className="text-xs uppercase text-stone-400 mb-1 block">Descripción</label>
                       <textarea 
                        value={collectionForm.description}
                        onChange={(e) => setCollectionForm(prev => ({...prev, description: e.target.value}))}
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

              {/* Product Table */}
              <div className="overflow-x-auto bg-white border border-stone-200 shadow-sm">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-100 text-stone-800 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">Imagen</th>
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4">Colección</th>
                      <th className="px-6 py-4">Precio</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-stone-50 transition-colors">
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
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-widest text-stone-500">Precio</label>
                      <input 
                        required
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00 €"
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-widest text-stone-500">Categoría</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as Category})}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors appearance-none"
                      >
                        <option value="Collares">Collares</option>
                        <option value="Aretes">Aretes</option>
                        <option value="Pulseras">Pulseras</option>
                        <option value="Anillos">Anillos</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-widest text-stone-500">Colección</label>
                      <select 
                        value={formData.collection}
                        onChange={e => setFormData({...formData, collection: e.target.value})}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors appearance-none"
                      >
                        {collections.filter(c => c.name !== 'Todas').map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-widest text-stone-500">Descripción</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full bg-stone-50 border border-stone-300 p-3 mt-1 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white resize-none font-light transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-widest text-stone-500">Material</label>
                    <input 
                      value={formData.material}
                      onChange={e => setFormData({...formData, material: e.target.value})}
                      className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors"
                    />
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
        ) : (
          /* --- SETTINGS TAB --- */
          <div className="max-w-3xl mx-auto space-y-12">
             <div>
                <h1 className="text-3xl font-serif text-stone-800 mb-2">Identidad de Marca</h1>
                <p className="text-stone-500">Personaliza la información visible en la cabecera y pie de página.</p>
             </div>

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
                             <span className="text-xs text-stone-400 text-center px-2">Sin Logo<br/>(Click para subir)</span>
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
                        onChange={e => setConfigForm({...configForm, siteName: e.target.value})}
                        className="w-full bg-stone-50 border-b border-stone-300 p-2 text-stone-800 focus:border-stone-800 focus:outline-none focus:bg-white transition-colors text-lg font-serif"
                        placeholder="Nombre visible si no hay logo"
                      />
                   </div>

                   <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-widest text-stone-500">Texto del Pie de Página</label>
                      <input 
                        value={configForm.footerText}
                        onChange={e => setConfigForm({...configForm, footerText: e.target.value})}
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
          </div>
        )}
      </div>
    </div>
  );
}