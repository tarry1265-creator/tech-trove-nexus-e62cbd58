import { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { formatPrice } from "@/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-orders-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    staleTime: 1000 * 60,
  });

  const getDeliveryStatus = (o: any) => {
    if (o.status === "delivered" || o.delivered_at) return "delivered";
    if (o.status === "failed") return "failed";
    if (o.status === "out_for_delivery" || o.out_for_delivery_at) return "out_for_delivery";
    if (o.status === "completed") return "awaiting_dispatch";
    return o.status;
  };

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o: any) => getDeliveryStatus(o) === statusFilter);
  }, [orders, statusFilter]);

  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return {
      deliveredToday: orders.filter(
        (o: any) => o.delivered_at && new Date(o.delivered_at) >= today
      ).length,
      outNow: orders.filter((o: any) => getDeliveryStatus(o) === "out_for_delivery").length,
      awaiting: orders.filter((o: any) => getDeliveryStatus(o) === "awaiting_dispatch").length,
      failed7d: orders.filter(
        (o: any) =>
          (o.failed_attempts || 0) > 0 && new Date(o.created_at) >= sevenDaysAgo
      ).length,
    };
  }, [orders]);

  const statusOptions = [
    { key: "all", label: "All" },
    { key: "awaiting_dispatch", label: "Awaiting Dispatch" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
    { key: "failed", label: "Failed" },
  ];

  const badgeClass = (s: string) => {
    if (s === "delivered") return "badge-success";
    if (s === "out_for_delivery") return "badge-primary";
    if (s === "failed") return "badge-destructive";
    if (s === "awaiting_dispatch") return "badge-warning";
    return "badge-primary";
  };

  const detailOrder = orders.find((o: any) => o.id === detailOrderId);

  const reopenOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "completed",
        delivered_at: null,
        out_for_delivery_at: null,
        delivered_by: null,
      } as any)
      .eq("id", orderId);
    if (error) {
      toast.error("Failed to reopen");
      return;
    }
    await supabase.from("dispatch_events" as any).insert({
      order_id: orderId,
      event_type: "reopened",
      notes: "Reopened by admin",
      dispatcher_name: "Admin",
    });
    toast.success("Order reopened for dispatch");
    refetch();
    setDetailOrderId(null);
  };

  return (
    <AdminLayout title="Orders" subtitle="Track every delivery end to end">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <div className="stat-value text-success">{kpis.deliveredToday}</div>
          <div className="stat-label">Delivered Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-primary">{kpis.outNow}</div>
          <div className="stat-label">Out for Delivery</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-warning">{kpis.awaiting}</div>
          <div className="stat-label">Awaiting Dispatch</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-destructive">{kpis.failed7d}</div>
          <div className="stat-label">Failed Attempts (7d)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">inbox</span>
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Delivery</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Delivered By</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order: any) => {
                  const ds = getDeliveryStatus(order);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setDetailOrderId(order.id)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-mono text-sm text-foreground">#{order.id.slice(0, 8)}</span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {order.shipping_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {order.shipping_phone || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${badgeClass(ds)}`}>{ds.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {order.delivered_by || "—"}
                        {order.delivered_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.delivered_at).toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-foreground">
                          {formatPrice(order.total_amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {detailOrder && (
        <OrderDetailDrawer
          order={detailOrder}
          onClose={() => setDetailOrderId(null)}
          onReopen={() => reopenOrder(detailOrder.id)}
        />
      )}
    </AdminLayout>
  );
};

const OrderDetailDrawer = ({
  order,
  onClose,
  onReopen,
}: {
  order: any;
  onClose: () => void;
  onReopen: () => void;
}) => {
  const { data: events = [] } = useQuery({
    queryKey: ["dispatch-events", order.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("dispatch_events" as any)
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["order-items", order.id],
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
      return data || [];
    },
  });

  const address = [order.shipping_address, order.shipping_city, order.shipping_state]
    .filter(Boolean)
    .join(", ");
  const isDelivered = !!order.delivered_at;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div
        className="bg-background w-full max-w-md h-full overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Customer</p>
            <p className="font-medium text-foreground">{order.shipping_name || "—"}</p>
            {order.shipping_phone && (
              <a href={`tel:${order.shipping_phone}`} className="text-primary text-sm">
                📞 {order.shipping_phone}
              </a>
            )}
            {address && <p className="text-foreground mt-1">📍 {address}</p>}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Items</p>
            <div className="space-y-2">
              {items.map((it: any) => (
                <div key={it.id} className="flex gap-2 items-center">
                  <img src={it.product_image} alt="" className="w-10 h-10 rounded object-cover bg-muted" />
                  <div className="flex-1 text-xs">
                    <p className="font-medium">{it.product_name}</p>
                    <p className="text-muted-foreground">
                      {it.quantity} × {formatPrice(it.unit_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-right font-bold mt-2">Total: {formatPrice(order.total_amount)}</p>
          </div>

          {isDelivered && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="font-semibold text-foreground text-sm">✅ Delivered</p>
              <p className="text-xs text-muted-foreground mt-1">
                By <strong>{order.delivered_by}</strong> on{" "}
                {new Date(order.delivered_at).toLocaleString()}
              </p>
              {order.recipient_name && (
                <p className="text-xs mt-1">Received by: <strong>{order.recipient_name}</strong></p>
              )}
              {order.delivery_notes && (
                <p className="text-xs italic mt-1">"{order.delivery_notes}"</p>
              )}
              {order.delivery_proof_url && (
                <a href={order.delivery_proof_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={order.delivery_proof_url}
                    alt="Proof"
                    className="mt-2 rounded-lg max-h-48 object-cover"
                  />
                </a>
              )}
            </div>
          )}

          {events.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Timeline</p>
              <div className="space-y-2">
                {events.map((ev: any) => (
                  <div key={ev.id} className="flex gap-2 text-xs border-l-2 border-primary/30 pl-2">
                    <div className="flex-1">
                      <p className="text-foreground capitalize font-medium">
                        {ev.event_type.replace(/_/g, " ")}
                        {ev.dispatcher_name && (
                          <span className="text-muted-foreground"> • {ev.dispatcher_name}</span>
                        )}
                      </p>
                      {ev.notes && <p className="text-muted-foreground italic">{ev.notes}</p>}
                      <p className="text-muted-foreground">
                        {new Date(ev.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(isDelivered || order.status === "failed") && (
            <button
              onClick={onReopen}
              className="btn-ghost w-full py-2.5 text-sm border border-border"
            >
              <span className="material-symbols-outlined text-base mr-1">restart_alt</span>
              Reopen for Dispatch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
