import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/hooks/useProducts";
import { toast } from "sonner";

const Dispatch = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["dispatch-orders"],
    queryFn: async () => {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch items and profiles for each order
      const enriched = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);

          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("user_id", order.user_id)
            .single();

          return { ...order, items: items || [], profile };
        })
      );

      return enriched;
    },
    enabled: authenticated,
    staleTime: 1000 * 30,
  });

  const confirmDelivery = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      toast.success("Delivery confirmed! Order marked as delivered.");
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error("Failed to confirm delivery");
    },
  });

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dispatch Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter password to access orders</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password === "Brainhubtek") {
                setAuthenticated(true);
              } else {
                toast.error("Incorrect password");
              }
            }}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              Access Orders
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-foreground text-lg">local_shipping</span>
            </div>
            <span className="font-bold text-foreground">Dispatch Portal</span>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-4 lg:p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-foreground mb-1">Active Orders</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {orders.length} order{orders.length !== 1 ? "s" : ""} awaiting delivery
        </p>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">inbox</span>
            <h3 className="text-lg font-semibold mb-1">No Active Orders</h3>
            <p className="text-muted-foreground text-sm">All orders have been delivered!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="card overflow-hidden">
                <button
                  onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.profile?.username || "Unknown user"} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatPrice(order.total_amount)}</p>
                      <span className="material-symbols-outlined text-muted-foreground text-xl">
                        {selectedOrder === order.id ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </div>
                </button>

                {selectedOrder === order.id && (
                  <div className="border-t border-border p-4">
                    <div className="space-y-3 mb-4">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-3 items-center">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-14 h-14 rounded-lg object-cover bg-muted"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} • {formatPrice(item.unit_price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => confirmDelivery.mutate(order.id)}
                      disabled={confirmDelivery.isPending}
                      className="btn-primary w-full py-3 disabled:opacity-50"
                    >
                      {confirmDelivery.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                          Confirming...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          Confirm Delivery
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dispatch;
