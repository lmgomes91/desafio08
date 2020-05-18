import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProdocts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (storagedProdocts) {
        setProducts([...JSON.parse(storagedProdocts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // console.log(product);

      const productIndex = products.findIndex(prod => prod.id === product.id);

      if (productIndex >= 0) {
        products[productIndex].quantity += 1;
        setProducts([...products]);
      } else {
        const newProduct = {
          id: product.id,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
          title: product.title,
        };
        setProducts([...products, newProduct]);
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(prod => prod.id === id);

      if (productIndex >= 0) {
        products[productIndex].quantity += 1;
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(products),
        );

        setProducts([...products]);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(prod => prod.id === id);

      if (productIndex >= 0) {
        if (products[productIndex].quantity > 1) {
          products[productIndex].quantity -= 1;
        } else {
          products.splice(productIndex, 1);
        }

        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(products),
        );

        setProducts([...products]);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
