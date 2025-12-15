import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void; // Optional now, or can be removed if unused
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link
      to={`/producto/${product.id}`}
      className="group cursor-pointer flex flex-col gap-2 md:gap-3 fade-in"
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-stone-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block">
          <span className="bg-stone-50 text-stone-900 text-xs uppercase tracking-widest px-4 py-2 shadow-sm">
            Ver Detalle
          </span>
        </div>
      </div>
      <div className="text-center space-y-1 mt-1 md:mt-2">
        <h3 className="text-sm md:text-lg font-serif text-stone-800 group-hover:text-stone-600 transition-colors leading-tight px-1">
          {product.name}
        </h3>
        <p className="text-xs md:text-sm font-light text-stone-500 tracking-wide font-sans">
          {product.price}
        </p>
      </div>
    </Link>
  );
};