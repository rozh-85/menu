// src/components/ProductCard.tsx
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const hasPrices = product.prices && product.prices.length > 0;
  const firstPrice = hasPrices ? product.prices[0].value : '';

  const priceLabel = product.isMultiPriced
    ? 'Multi Priced'
    : firstPrice || 'No price';

  return (
    <div
      onClick={onClick}
      className="group flex flex-col gap-4 cursor-pointer hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-800 shadow-xl relative ring-1 ring-black/5 dark:ring-white/5">
        <img
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          src={product.image}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="space-y-1 px-1">
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-primary text-xl">
            restaurant
          </span>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="material-icons-round text-primary/70 text-xl">
            point_of_sale
          </span>
          <p className="text-primary font-semibold text-sm tracking-wide">
            {priceLabel}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
