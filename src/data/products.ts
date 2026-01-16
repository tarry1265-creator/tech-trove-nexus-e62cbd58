// Legacy types for cart and wishlist (will be migrated to Supabase later)
export interface CartItem {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string;
  quantity: number;
  selectedColor?: string;
}

// Mock cart data - will be empty, user adds items
export const mockCartItems: CartItem[] = [];

// Mock wishlist data - will be empty, user adds items
export const mockWishlistItems: string[] = []; // Just store product IDs

// Mock user data
export const mockUser = {
  id: "1",
  name: "Guest User",
  email: "guest@roothub.ng",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  phone: "+234 800 000 0000",
  address: {
    street: "123 Victoria Island",
    city: "Lagos",
    state: "Lagos",
    zip: "101001",
    country: "Nigeria",
  },
  orders: 0,
  wishlistCount: 0,
  memberSince: "2025",
};
