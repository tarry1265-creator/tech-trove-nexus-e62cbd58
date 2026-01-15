import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string;
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

// Fetch all products
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
  });
};
