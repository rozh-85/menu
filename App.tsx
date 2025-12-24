// src/App.tsx
import React, { useState, useEffect } from 'react';

import Header from './components/Header';
import CategorySelector from './components/CategorySelector';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import { Product as UiProduct, Category as UiCategory, PriceOption } from './types';

interface ApiPriceOption {
  label: string;
  value: string;
}

interface ApiProduct {
  id: number | string;
  name: string;
  description: string;
  image: string;
  prices: ApiPriceOption[];
}

interface ApiMenuCategory {
  id: number | string;
  name: string;
  image?: string;
  products: ApiProduct[];
}

const FALLBACK_MENU: ApiMenuCategory[] = [
  {
    id: 'fallback-1',
    name: 'Lokmada',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNTU_5GqNP7Y70lWdBFYZJoAa1gJKX0B4g8nAjKaaqlEdI9uMToMj7Oy5NyxrQtFcHXXdYeq4mgxtRO2y2RiDb8yEMFxQQPiCiR3VhMK2DVqcK34GBRPTgMAonVp6pTrra4_1Z2XsX4bjPWDx1y8M84wkkRr0BUIHOsQXmDhltlqlY2KWCLi6wCiRtG3r0FGD5-jAw02ybSIHXfTScicKR5djlNC4yFNiYvZUXulkd2RJamO9cqpvSv2DWTp_EE5HIfKv1S85R_g1v',
    products: [
      {
        id: 'f-prod-1',
        name: 'White Lokmada',
        description: 'Vanilla - White Chocolate - Oreo',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCNTU_5GqNP7Y70lWdBFYZJoAa1gJKX0B4g8nAjKaaqlEdI9uMToMj7Oy5NyxrQtFcHXXdYeq4mgxtRO2y2RiDb8yEMFxQQPiCiR3VhMK2DVqcK34GBRPTgMAonVp6pTrra4_1Z2XsX4bjPWDx1y8M84wkkRr0BUIHOsQXmDhltlqlY2KWCLi6wCiRtG3r0FGD5-jAw02ybSIHXfTScicKR5djlNC4yFNiYvZUXulkd2RJamO9cqpvSv2DWTp_EE5HIfKv1S85R_g1v',
        prices: [
          { label: 'Small', value: 'IQD 2,500' },
          { label: 'Medium', value: 'IQD 5,000' },
          { label: 'Large', value: 'IQD 9,000' },
        ],
      },
    ],
  },
];

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<UiProduct | null>(null);
  const [menuData, setMenuData] = useState<ApiMenuCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await fetch('/api/menu');

        if (!res.ok) {
          if (res.status === 404) {
            console.warn('Backend API not found (404). Falling back to static menu.');
            setMenuData(FALLBACK_MENU);
            setActiveCategory(String(FALLBACK_MENU[0].id));
            setIsUsingMock(true);
            setLoading(false);
            return;
          }
          throw new Error(`Server error: ${res.status}`);
        }

        const data: ApiMenuCategory[] = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setMenuData(data);
          setActiveCategory(String(data[0].id));
        } else {
          setMenuData(FALLBACK_MENU);
          setActiveCategory(String(FALLBACK_MENU[0].id));
          setIsUsingMock(true);
        }
      } catch (err: any) {
        console.error('Fetch failed, using mock data:', err);
        setError(err?.message ?? 'Failed to load menu');
        setMenuData(FALLBACK_MENU);
        setActiveCategory(String(FALLBACK_MENU[0].id));
        setIsUsingMock(true);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`section-${categoryId}`);
    if (element) {
      const headerOffset = 160;
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveCategory(categoryId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (menuData.length === 0) return;
      const scrollPosition = window.scrollY + 220;

      for (const cat of menuData) {
        const idStr = String(cat.id);
        const element = document.getElementById(`section-${idStr}`);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          const absoluteTop = top + window.pageYOffset;
          const absoluteBottom = bottom + window.pageYOffset;
          if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
            setActiveCategory(idStr);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-primary font-medium animate-pulse tracking-widest uppercase text-xs">
            Loading Menu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />

      {isUsingMock && (
        <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] text-center py-1 font-bold uppercase tracking-widest border-b border-yellow-500/20">
          Preview Mode: Using Local Data (Backend Not Detected)
        </div>
      )}

      {menuData.length > 0 && activeCategory && (
        <div className="sticky top-[64px] z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md pb-4 pt-2">
          <div className="max-w-4xl mx-auto px-4">
            <CategorySelector
              categories={
                menuData.map((c) => ({
                  id: String(c.id),
                  name: c.name,
                  itemCount: c.products.length,
                  image: c.image || '',
                })) as UiCategory[]
              }
              selectedCategoryId={activeCategory}
              onSelectCategory={(id) => scrollToCategory(id)}
            />
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-12">
        {menuData.map((category) => {
          const catId = String(category.id);

          return (
            <section key={catId} id={`section-${catId}`} className="scroll-mt-40">
              <div className="flex items-center mb-6">
                <div className="h-8 w-1.5 bg-primary rounded-full mr-3 shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                  {category.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {category.products.map((product) => {
                  const uiProduct: UiProduct = {
                    id: String(product.id),
                    name: product.name,
                    description: product.description,
                    image: product.image,
                    category: catId,
                    isMultiPriced: product.prices.length > 1,
                    prices: product.prices as PriceOption[],
                  };

                  return (
                    <ProductCard
                      key={uiProduct.id}
                      product={uiProduct}
                      onClick={() => setSelectedProduct(uiProduct)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      <footer className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400 dark:text-zinc-600 text-sm border-t border-zinc-800/50 mt-12">
        <div className="flex justify-center items-center gap-2 mb-4">
          <span className="font-display text-4xl text-primary opacity-50">Lokmada</span>
        </div>
        <p className="font-medium">The Art of Sweetness</p>
        <p className="mt-2 text-xs opacity-60 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Lokmada Sweets
        </p>
      </footer>
    </div>
  );
};

export default App;
