import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface WishlistContextType {
  wishlistIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const getStorageKey = (userId: string) => `wishlist_${userId}`;

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Load from localStorage when user changes
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(getStorageKey(user.id));
      setWishlistIds(stored ? JSON.parse(stored) : []);
    } else {
      setWishlistIds([]);
    }
  }, [user]);

  // Persist to localStorage
  const persist = useCallback((ids: string[]) => {
    if (user) {
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(ids));
    }
  }, [user]);

  const addToWishlist = useCallback((productId: string) => {
    setWishlistIds(prev => {
      if (prev.includes(productId)) return prev;
      const next = [...prev, productId];
      persist(next);
      return next;
    });
  }, [persist]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistIds(prev => {
      const next = prev.filter(id => id !== productId);
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      persist(next);
      return next;
    });
  }, [persist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
