import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ShopProvider, useShop } from './contexts/ShopContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Collection, Product } from './types';

// Catalog View Component (shared between home and editor)
const CatalogView: React.FC<{ showAdminButton?: boolean }> = ({ showAdminButton = false }) => {
  const { products, collections, siteConfig } = useShop();
  const [selectedCollection, setSelectedCollection] = useState<Collection>('Todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Helper to render a grid of products
  const ProductGrid = ({ gridProducts }: { gridProducts: Product[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
      {gridProducts.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onClick={setSelectedProduct} 
        />
      ))}
    </div>
  );

  const selectedCollectionData = collections.find(c => c.name === selectedCollection);

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-stone-200 selection:text-stone-900 relative">
      
      {/* Admin Toggle - Only show if showAdminButton is true */}
      {showAdminButton && (
        <button 
          onClick={() => setIsAdminOpen(true)}
          className="fixed top-4 right-4 z-50 text-stone-300 hover:text-stone-800 transition-colors p-2"
          title="Admin Panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
      )}

      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
      
      <Header 
        siteName={siteConfig.siteName}
        logoUrl={siteConfig.logoUrl}
        collections={collections}
        selectedCollection={selectedCollection} 
        onSelectCollection={(col) => {
          setSelectedCollection(col);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 mb-20">
        
        {/* Intro Text - Only Render if Description Exists */}
        {selectedCollectionData?.description && (
          <div className="text-center mb-12 md:mb-20 max-w-2xl mx-auto animate-fadeIn">
            <p className="font-serif text-lg md:text-xl text-stone-600 italic leading-relaxed px-4">
              {selectedCollectionData.description}
            </p>
          </div>
        )}

        {/* Content Logic: Show Sections vs Single Grid */}
        <div className="space-y-24 md:space-y-32">
          {selectedCollection === 'Todas' ? (
            // Render all collections as separate sections
            collections.filter(c => c.name !== 'Todas').map((col) => {
              const collectionProducts = products.filter(p => p.collection === col.name);
              if (collectionProducts.length === 0) return null;

              return (
                <section key={col.name} className="fade-in">
                  <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
                     <div className="flex items-center gap-4 mb-3">
                        <div className="h-px bg-stone-300 w-8 md:w-24"></div>
                        <h2 className="text-2xl md:text-3xl font-serif text-stone-800 uppercase tracking-widest text-center">
                          {col.name}
                        </h2>
                        <div className="h-px bg-stone-300 w-8 md:w-24"></div>
                     </div>
                     <p className="text-stone-500 font-light italic text-xs md:text-sm text-center max-w-lg px-4">
                        {col.description}
                     </p>
                  </div>
                  <ProductGrid gridProducts={collectionProducts} />
                </section>
              );
            })
          ) : (
            // Render specific collection
            <section className="fade-in">
               <ProductGrid gridProducts={products.filter(p => p.collection === selectedCollection)} />
            </section>
          )}
        </div>

        {/* Empty State */}
        {selectedCollection !== 'Todas' && products.filter(p => p.collection === selectedCollection).length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500 font-serif text-xl">Próximamente nuevas piezas en esta colección.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 py-12 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          {siteConfig.logoUrl ? (
            <img 
              src={siteConfig.logoUrl} 
              alt={siteConfig.siteName} 
              className="h-8 object-contain mb-6 opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          ) : (
            <h2 className="text-2xl font-serif text-stone-800 mb-6">{siteConfig.siteName}</h2>
          )}
          
          <div className="flex justify-center gap-8 mb-8 text-sm tracking-widest text-stone-500 uppercase flex-wrap">
            {siteConfig.socialLinks.map((link, index) => (
               <a 
                 key={index} 
                 href={link.url} 
                 target={link.url.startsWith('http') || link.url.startsWith('mailto') ? "_blank" : "_self"}
                 rel="noopener noreferrer"
                 className="hover:text-stone-800 transition-colors"
               >
                 {link.platform}
               </a>
            ))}
          </div>
          <p className="text-stone-400 text-xs font-light">
            {siteConfig.footerText}
          </p>
        </div>
      </footer>

      {/* Interactive Elements */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
};

// Home Route - Catalog without admin button
const Home = () => <CatalogView showAdminButton={false} />;

// Editor Route - Catalog with admin button (protected)
const EditorContent = () => {
  const { signOut } = useAuth();
  
  return (
    <div className="relative">
      {/* Logout Button */}
      <button
        onClick={async () => {
          await signOut();
          window.location.href = '/';
        }}
        className="fixed top-4 left-4 z-50 bg-stone-800 text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-stone-700 transition-colors shadow-md"
        title="Cerrar Sesión"
      >
        Salir
      </button>
      <CatalogView showAdminButton={true} />
    </div>
  );
};

const Editor = () => (
  <ProtectedRoute>
    <EditorContent />
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editar" element={<Editor />} />
          </Routes>
        </BrowserRouter>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;