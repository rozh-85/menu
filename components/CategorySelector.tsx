// src/components/CategorySelector.tsx
import React, { useEffect, useRef } from 'react';
import { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll the active category into view within the horizontal scroller
  useEffect(() => {
    if (!selectedCategoryId || !containerRef.current) return;

    const activeElement = containerRef.current.querySelector<HTMLElement>(
      `[data-id="${selectedCategoryId}"]`
    );
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedCategoryId]);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface-light dark:bg-zinc-800/80 rounded-2xl p-2 shadow-xl border border-gray-200 dark:border-zinc-700/50 backdrop-blur-sm overflow-hidden ring-1 ring-black/5">
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-3 pb-1 pt-1 px-1 scrollbar-hide no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              data-id={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-none flex items-center gap-3 p-1.5 pr-4 cursor-pointer rounded-xl transition-all duration-300 group min-w-[140px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${
                isActive
                  ? 'bg-primary text-zinc-900 shadow-lg shadow-primary/20'
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-700/50 bg-gray-50 dark:bg-zinc-900/40'
              }`}
            >
              <div className="relative flex-none">
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={`w-10 h-10 object-cover rounded-lg shadow-sm transition-transform duration-500 ${
                      isActive ? 'scale-105 rotate-2' : 'group-hover:scale-105'
                    }`}
                  />
                )}
              </div>

              <div className="flex flex-col whitespace-nowrap overflow-hidden text-left">
                <span
                  className={`font-bold text-xs transition-colors truncate ${
                    isActive ? 'text-zinc-900' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {cat.name}
                </span>
                <span
                  className={`text-[10px] font-bold opacity-70 ${
                    isActive ? 'text-zinc-800' : 'text-primary'
                  }`}
                >
                  {cat.itemCount} Items
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySelector;
