import React, { useState, useEffect } from 'react';
import { Collection, CollectionData } from '../types';

interface HeaderProps {
  siteName: string;
  logoUrl: string | null;
  collections: CollectionData[];
  selectedCollection: Collection;
  onSelectCollection: (collection: Collection) => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  siteName,
  logoUrl,
  collections,
  selectedCollection,
  onSelectCollection,
  showBackButton = false,
  onBack
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const isVisibleRef = React.useRef(true);
  const lastToggleTime = React.useRef(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const controlNavbar = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const direction = currentScrollY > lastScrollY ? 'down' : 'up';
          const distance = Math.abs(currentScrollY - lastScrollY);
          const now = Date.now();

          // Always show at the very top
          if (currentScrollY < 50) {
            if (!isVisibleRef.current) {
              setIsVisible(true);
              isVisibleRef.current = true;
              lastToggleTime.current = now;
            }
          }
          // Only change state if we've scrolled more than 10px
          else if (distance > 10) {
            // Prevent toggling if within cooldown period (500ms matches transition duration)
            if (now - lastToggleTime.current > 500) {
              if (direction === 'down' && isVisibleRef.current) {
                setIsVisible(false);
                isVisibleRef.current = false;
                lastToggleTime.current = now;
              } else if (direction === 'up' && !isVisibleRef.current) {
                setIsVisible(true);
                isVisibleRef.current = true;
                lastToggleTime.current = now;
              }
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 transition-all duration-300">
      <div className="w-full flex flex-col items-center justify-center pt-4 pb-2 space-y-2">
        {/* Logo Section - Collapsible */}
        <div
          className={`cursor-pointer hover:opacity-80 transition-all duration-500 ease-in-out overflow-hidden px-6 ${isVisible ? 'max-h-40 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'
            }`}
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

        {/* Scrollable Navigation or Back Button - Always Visible */}
        <nav className={`w-full overflow-x-auto scrollbar-hide pb-2 min-h-[40px] flex items-center ${showBackButton ? 'justify-start px-6' : 'justify-start px-6 md:justify-center md:px-0'}`}>
          {showBackButton ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-xs md:text-sm uppercase tracking-[0.2em] group py-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver
            </button>
          ) : (
            <ul className="flex flex-nowrap items-center px-6 md:justify-center gap-4 min-w-max md:min-w-full">
              {collections.map((col) => (
                <li key={col.name} className="flex-shrink-0">
                  <button
                    onClick={() => onSelectCollection(col.name)}
                    className={`text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-300 font-serif whitespace-nowrap px-2 py-2 ${selectedCollection === col.name
                      ? 'text-stone-900 border-b-2 border-stone-900'
                      : 'text-stone-400 hover:text-stone-800 border-b-2 border-transparent'
                      }`}
                  >
                    {col.name === 'Todas' ? 'Todo' : col.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
};