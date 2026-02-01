import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export const useUserOrders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      
      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (orders || []).map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);
          
          if (itemsError) {
            console.error("Error fetching order items:", itemsError);
            return { ...order, items: [] };
          }
          
          return { ...order, items: items || [] };
        })
      );
      
      return ordersWithItems as Order[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
};
