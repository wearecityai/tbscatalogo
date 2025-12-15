import React, { useEffect } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-stone-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-stone-500 hover:text-stone-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full md:w-1/2 bg-stone-200">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
             <span className="text-xs tracking-[0.2em] text-stone-500 uppercase">
              {product.category}
            </span>
             <span className="text-xs tracking-[0.1em] text-stone-400 uppercase border border-stone-200 px-2 py-1">
              Colección {product.collection}
            </span>
          </div>
         
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-6">
            {product.name}
          </h2>
          <p className="text-stone-600 font-light leading-relaxed mb-8 font-serif">
            {product.description}
          </p>
          
          <div className="border-t border-stone-200 pt-6 mb-8">
             <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-2">Material</h4>
             <p className="text-stone-700">{product.material}</p>
          </div>

          <div className="mt-auto">
            <p className="text-2xl font-serif text-stone-900 mb-6">{product.price}</p>
            <div className="text-xs text-stone-400 italic">
              *Disponible en tienda física y distribuidores autorizados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};