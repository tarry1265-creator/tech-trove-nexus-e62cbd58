import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string;
  additional_images: string[] | null;
  category_id: string | null;
  brand: string | null;
  rating: number | null;
  stock_quantity: number | null;
  is_featured: boolean | null;
  is_new_arrival: boolean | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

// Format price in Naira
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Get stock status message
export const getStockStatus = (quantity: number | null): { message: string; type: 'available' | 'low' | 'out' } => {
  if (quantity === null || quantity === undefined) {
    return { message: '', type: 'available' };
  }
  if (quantity === 0) {
    return { message: 'Out of stock', type: 'out' };
  }
  if (quantity <= 5) {
    return { message: `Only ${quantity} left`, type: 'low' };
  }
  return { message: 'In stock', type: 'available' };
};

// Fetch all products with optimized caching
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
  });
};

// Fetch featured products
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

// Fetch new arrivals
export const useNewArrivals = () => {
  return useQuery({
    queryKey: ["products", "new"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("is_new_arrival", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

// Fetch single product by slug
export const useProduct = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug provided");
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

// Fetch products by category
export const useProductsByCategory = (categorySlug: string | null) => {
  return useQuery({
    queryKey: ["products", "category", categorySlug],
    queryFn: async () => {
      if (!categorySlug || categorySlug === "all") {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            category:categories(*)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Product[];
      }

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories!inner(*)
        `)
        .eq("category.slug", categorySlug)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

// Search products
export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 2,
  });
};

// Fetch all categories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 1000 * 60 * 10, // Categories change less frequently
    gcTime: 1000 * 60 * 60,
  });
};

// Update product stock (admin only)
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ stock_quantity: quantity })
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
