import React from 'react';
import { Collection, CollectionData } from '../types';

interface HeaderProps {
  siteName: string;
  logoUrl: string | null;
  collections: CollectionData[];
  selectedCollection: Collection;
  onSelectCollection: (collection: Collection) => void;
}

export const Header: React.FC<HeaderProps> = ({ siteName, logoUrl, collections, selectedCollection, onSelectCollection }) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 transition-all duration-300">
      <div className="w-full flex flex-col items-center justify-center pt-4 pb-2 space-y-2">
        {/* Logo Section */}
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity px-6" 
          onClick={() => onSelectCollection('Todas')}
        >
          {logoUrl ? (
             <img 
              src={logoUrl} 
              alt={siteName} 
              className="h-16 md:h-20 object-contain max-w-[200px]" 
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-serif tracking-widest text-stone-900 uppercase text-center">
              {siteName}
            </h1>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className="w-full overflow-x-auto scrollbar-hide pb-2">
          <ul className="flex flex-nowrap items-center px-6 md:justify-center gap-4 min-w-max md:min-w-full">
            {collections.map((col) => (
              <li key={col.name} className="flex-shrink-0">
                <button
                  onClick={() => onSelectCollection(col.name)}
                  className={`text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-300 font-serif whitespace-nowrap px-2 py-2 ${
                    selectedCollection === col.name
                      ? 'text-stone-900 border-b-2 border-stone-900'
                      : 'text-stone-400 hover:text-stone-800 border-b-2 border-transparent'
                  }`}
                >
                  {col.name === 'Todas' ? 'Todo' : col.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};