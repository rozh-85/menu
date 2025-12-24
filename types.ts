
export interface PriceOption {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  isMultiPriced: boolean;
  prices: PriceOption[];
}

export interface Category {
  id: string;
  name: string;
  itemCount: number;
  image: string;
}
