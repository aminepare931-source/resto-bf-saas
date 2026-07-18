import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type CartContextValue = {
  items: Record<string, number>;
  setQty: (id: string, qty: number) => void;
  addItem: (id: string) => void;
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setIsOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 50);
      return next;
    });
  }, []);

  const addItem = useCallback(
    (id: string) => {
      setItems((prev) => ({ ...prev, [id]: Math.min((prev[id] ?? 0) + 1, 50) }));
      setIsOpen(true);
    },
    [],
  );

  const count = useMemo(() => Object.values(items).reduce((s, q) => s + q, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, setQty, addItem, count, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false), setIsOpen }),
    [items, setQty, addItem, count, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Retourne le panier partagé, ou null si le site n'est pas dans un CartProvider (ex: aperçus/éditeur de template). */
export function useCart() {
  return useContext(CartContext);
}
