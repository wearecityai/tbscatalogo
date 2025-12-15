import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { Header } from './Header';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products, collections, siteConfig } = useShop();

    const product = products.find(p => p.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <h2 className="text-2xl font-serif text-stone-800 mb-4">Producto no encontrado</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-stone-500 hover:text-stone-900 underline"
                    >
                        Volver al catálogo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 font-sans selection:bg-stone-200 selection:text-stone-900">
            {/* Reusing Header for consistency */}
            <Header
                siteName={siteConfig.siteName}
                logoUrl={siteConfig.logoUrl}
                collections={collections}
                selectedCollection={product.collection as any}
                onSelectCollection={(col) => navigate('/')}
                showBackButton={true}
                onBack={() => navigate(-1)}
            />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Back Button removed from here */}

                <div className="flex flex-col md:flex-row overflow-hidden max-w-6xl mx-auto">

                    {/* Mobile Title (Visible only on mobile) */}
                    <div className="md:hidden pr-8 py-4 pl-0 text-left">
                        <h1 className="text-3xl font-serif text-stone-900 leading-tight">
                            {product.name}
                        </h1>
                    </div>

                    {/* Image Section (Left on Desktop) */}
                    <div className="w-full md:w-1/2 bg-stone-100 aspect-square md:aspect-auto relative">
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details Section (Right on Desktop) */}
                    <div className="w-full md:w-1/2 pr-8 py-8 pl-0 md:p-16 flex flex-col justify-center text-left">

                        {/* Desktop Title (Hidden on mobile) */}
                        <h1 className="hidden md:block text-4xl lg:text-5xl font-serif text-stone-900 mb-8 leading-tight">
                            {product.name}
                        </h1>

                        {/* Description */}
                        <p className="text-stone-600 font-light leading-relaxed mb-8 font-serif text-lg">
                            {product.description}
                        </p>

                        {/* Material */}
                        <div className="mb-8 border-t border-stone-100 pt-8 w-full">
                            <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-2">Material</h4>
                            <p className="text-stone-700">{product.material}</p>
                        </div>

                        {/* Collection & Category */}
                        <div className="flex flex-wrap justify-start gap-4 mb-8">
                            <span className="text-xs tracking-[0.1em] text-stone-400 uppercase border border-stone-200 px-3 py-1">
                                Colección {product.collection}
                            </span>
                            <span className="text-xs tracking-[0.2em] text-stone-500 uppercase py-1">
                                {product.category}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="mt-4">
                            <p className="text-3xl font-serif text-stone-900">{product.price}</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-stone-100 py-12 border-t border-stone-200 mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
                    <p className="text-stone-400 text-xs font-light">
                        {siteConfig.footerText}
                    </p>
                </div>
            </footer>
        </div>
    );
};
