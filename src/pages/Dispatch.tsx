import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/hooks/useProducts";
import { toast } from "sonner";

type DeliveryStatus = "pending_pickup" | "out_for_delivery" | "delivered" | "failed";

const PASSWORD_KEY = "dispatch_authed";
const RIDER_KEY = "dispatch_rider_name";

const Dispatch = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const focusOrderId = searchParams.get("order");

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(PASSWORD_KEY) === "1");
  const [riderName, setRiderName] = useState(() => localStorage.getItem(RIDER_KEY) || "");
  const [riderInput, setRiderInput] = useState("");
  const [tab, setTab] = useState<"pending_pickup" | "out_for_delivery" | "delivered" | "failed">("pending_pickup");
  const [expanded, setExpanded] = useState<string | null>(focusOrderId);

  // Delivery modal
  const [deliveryModal, setDeliveryModal] = useState<{ orderId: string } | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  // Failed attempt modal
  const [failedModal, setFailedModal] = useState<{ orderId: string } | null>(null);
  const [failReason, setFailReason] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["dispatch-orders-v2"],
    queryFn: async () => {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["completed", "out_for_delivery", "picked_up", "delivered", "failed"])
        .order("created_at", { ascending: false });
      if (error) throw error;

      const enriched = await Promise.all(
        (ordersData || []).map(async (order: any) => {
          const { data: items } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url, phone_number")
            .eq("user_id", order.user_id)
            .maybeSingle();
          const { data: events } = await supabase
            .from("dispatch_events" as any)
            .select("*")
            .eq("order_id", order.id)
            .order("created_at", { ascending: false });
          return { ...order, items: items || [], profile, events: events || [] };
        })
      );
      return enriched;
    },
    enabled: authenticated && !!riderName,
    staleTime: 1000 * 30,
  });

  // Compute delivery status from order
  const getDeliveryStatus = (order: any): DeliveryStatus => {
    if (order.status === "delivered" || order.delivered_at) return "delivered";
    if (order.status === "failed") return "failed";
    if (order.status === "out_for_delivery" || order.out_for_delivery_at) return "out_for_delivery";
    return "pending_pickup";
  };

  const tabbed = useMemo(() => {
    return orders.filter((o: any) => getDeliveryStatus(o) === tab);
  }, [orders, tab]);

  const counts = useMemo(() => {
    const c = { pending_pickup: 0, out_for_delivery: 0, delivered: 0, failed: 0 };
    orders.forEach((o: any) => {
      c[getDeliveryStatus(o)]++;
    });
    return c;
  }, [orders]);

  const logEvent = async (orderId: string, eventType: string, notes?: string) => {
    await supabase.from("dispatch_events" as any).insert({
      order_id: orderId,
      event_type: eventType,
      notes: notes || null,
      dispatcher_name: riderName,
    });
  };

  const markPickedUp = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ picked_up_at: new Date().toISOString(), dispatcher_assigned: riderName } as any)
        .eq("id", orderId);
      if (error) throw error;
      await logEvent(orderId, "picked_up");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders-v2"] });
      toast.success("Marked as picked up");
    },
    onError: () => toast.error("Failed to update"),
  });

  const markOutForDelivery = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "out_for_delivery",
          out_for_delivery_at: new Date().toISOString(),
          dispatcher_assigned: riderName,
        } as any)
        .eq("id", orderId);
      if (error) throw error;
      await logEvent(orderId, "out_for_delivery");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders-v2"] });
      toast.success("Out for delivery");
    },
    onError: () => toast.error("Failed to update"),
  });

  const submitDelivery = async () => {
    if (!deliveryModal) return;
    if (!recipientName.trim()) {
      toast.error("Please enter recipient name");
      return;
    }
    setSubmittingDelivery(true);
    try {
      let proofUrl: string | null = null;
      if (proofFile) {
        const path = `${deliveryModal.orderId}/${Date.now()}-${proofFile.name}`;
        const { error: upErr } = await supabase.storage
          .from("delivery-proofs")
          .upload(path, proofFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("delivery-proofs").getPublicUrl(path);
        proofUrl = pub.publicUrl;
      }

      const { error } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
          delivered_by: riderName,
          recipient_name: recipientName.trim(),
          delivery_notes: deliveryNotes.trim() || null,
          delivery_proof_url: proofUrl,
        } as any)
        .eq("id", deliveryModal.orderId);
      if (error) throw error;

      await logEvent(
        deliveryModal.orderId,
        "delivered",
        `Recipient: ${recipientName}${deliveryNotes ? ` | ${deliveryNotes}` : ""}`
      );

      queryClient.invalidateQueries({ queryKey: ["dispatch-orders-v2"] });
      toast.success("Delivery confirmed!");
      setDeliveryModal(null);
      setRecipientName("");
      setDeliveryNotes("");
      setProofFile(null);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to confirm delivery");
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const submitFailed = async () => {
    if (!failedModal) return;
    if (!failReason.trim()) {
      toast.error("Please add a reason");
      return;
    }
    try {
      const order = orders.find((o: any) => o.id === failedModal.orderId);
      const newCount = (order?.failed_attempts || 0) + 1;
      const { error } = await supabase
        .from("orders")
        .update({ failed_attempts: newCount } as any)
        .eq("id", failedModal.orderId);
      if (error) throw error;
      await logEvent(failedModal.orderId, "failed_attempt", failReason.trim());
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders-v2"] });
      toast.success("Failed attempt logged");
      setFailedModal(null);
      setFailReason("");
    } catch (e: any) {
      toast.error(e.message || "Failed to log");
    }
  };

  // Auth gate
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
                sessionStorage.setItem(PASSWORD_KEY, "1");
                setAuthenticated(true);
              } else {
                toast.error("Incorrect password");
              }
            }}
            className="space-y-4"
          >
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
            />
            <button type="submit" className="btn-primary w-full py-3">
              Access Orders
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Rider name gate
  if (!riderName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">badge</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Who's dispatching?</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your name. Every action you take will be tagged with it.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!riderInput.trim()) return;
              localStorage.setItem(RIDER_KEY, riderInput.trim());
              setRiderName(riderInput.trim());
            }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Your full name"
              value={riderInput}
              onChange={(e) => setRiderInput(e.target.value)}
              className="input-field w-full"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full py-3">Continue</button>
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
            <div className="leading-tight">
              <p className="font-bold text-foreground text-sm">Dispatch Portal</p>
              <p className="text-xs text-muted-foreground">Rider: {riderName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem(RIDER_KEY);
                setRiderName("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Switch rider
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem(PASSWORD_KEY);
                setAuthenticated(false);
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-6 max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            ["pending_pickup", "Pending Pickup", counts.pending_pickup, "inventory"],
            ["out_for_delivery", "Out for Delivery", counts.out_for_delivery, "directions_bike"],
            ["delivered", "Delivered", counts.delivered, "task_alt"],
            ["failed", "Failed", counts.failed, "error"],
          ] as const).map(([key, label, count, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${tab === key ? "bg-primary-foreground/20" : "bg-background"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : tabbed.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">inbox</span>
            <h3 className="text-lg font-semibold mb-1">Nothing here</h3>
            <p className="text-muted-foreground text-sm">No orders in this status.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tabbed.map((order: any) => {
              const status = getDeliveryStatus(order);
              const isOpen = expanded === order.id;
              const address = [order.shipping_address, order.shipping_city, order.shipping_state]
                .filter(Boolean)
                .join(", ");
              const phone = order.shipping_phone || order.profile?.phone_number || "";
              const customerName = order.shipping_name || order.profile?.username || "Customer";

              return (
                <div key={order.id} className="card overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {customerName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        {address && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">📍 {address}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-foreground text-sm">{formatPrice(order.total_amount)}</p>
                        <span className="material-symbols-outlined text-muted-foreground text-xl">
                          {isOpen ? "expand_less" : "expand_more"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border p-4 space-y-4">
                      {/* Customer & address */}
                      <div className="space-y-2 text-sm">
                        {phone && (
                          <a
                            href={`tel:${phone}`}
                            className="flex items-center gap-2 text-primary font-medium"
                          >
                            <span className="material-symbols-outlined text-base">call</span>
                            {phone}
                          </a>
                        )}
                        {address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 text-foreground"
                          >
                            <span className="material-symbols-outlined text-base text-primary mt-0.5">map</span>
                            <span className="underline">{address}</span>
                          </a>
                        )}
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex gap-3 items-center">
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-12 h-12 rounded-lg object-cover bg-muted"
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

                      {/* Action buttons by status */}
                      {status === "pending_pickup" && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => markPickedUp.mutate(order.id)}
                            disabled={markPickedUp.isPending}
                            className="btn-ghost py-2.5 text-sm"
                          >
                            <span className="material-symbols-outlined text-base mr-1">inventory_2</span>
                            Picked Up
                          </button>
                          <button
                            onClick={() => markOutForDelivery.mutate(order.id)}
                            disabled={markOutForDelivery.isPending}
                            className="btn-primary py-2.5 text-sm"
                          >
                            <span className="material-symbols-outlined text-base mr-1">directions_bike</span>
                            Out for Delivery
                          </button>
                        </div>
                      )}

                      {status === "out_for_delivery" && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setFailedModal({ orderId: order.id })}
                            className="btn-ghost py-2.5 text-sm text-destructive"
                          >
                            <span className="material-symbols-outlined text-base mr-1">error</span>
                            Failed Attempt
                          </button>
                          <button
                            onClick={() => setDeliveryModal({ orderId: order.id })}
                            className="btn-primary py-2.5 text-sm"
                          >
                            <span className="material-symbols-outlined text-base mr-1">check_circle</span>
                            Mark Delivered
                          </button>
                        </div>
                      )}

                      {status === "delivered" && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                          <p className="font-medium text-foreground">
                            ✅ Delivered by {order.delivered_by || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.delivered_at && new Date(order.delivered_at).toLocaleString()}
                          </p>
                          {order.recipient_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Received by: <strong>{order.recipient_name}</strong>
                            </p>
                          )}
                          {order.delivery_notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">"{order.delivery_notes}"</p>
                          )}
                          {order.delivery_proof_url && (
                            <a href={order.delivery_proof_url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={order.delivery_proof_url}
                                alt="Delivery proof"
                                className="mt-2 rounded-lg max-h-40 object-cover"
                              />
                            </a>
                          )}
                        </div>
                      )}

                      {status === "failed" && (
                        <button
                          onClick={() => markOutForDelivery.mutate(order.id)}
                          className="btn-primary w-full py-2.5 text-sm"
                        >
                          Retry Delivery
                        </button>
                      )}

                      {/* Timeline */}
                      {order.events.length > 0 && (
                        <div className="border-t border-border pt-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Timeline</p>
                          <div className="space-y-2">
                            {order.events.map((ev: any) => (
                              <div key={ev.id} className="flex gap-2 text-xs">
                                <span className="material-symbols-outlined text-sm text-primary mt-0.5">
                                  {ev.event_type === "delivered" ? "check_circle" : ev.event_type === "failed_attempt" ? "error" : "radio_button_checked"}
                                </span>
                                <div className="flex-1">
                                  <p className="text-foreground capitalize">
                                    {ev.event_type.replace(/_/g, " ")}
                                    {ev.dispatcher_name && <span className="text-muted-foreground"> • {ev.dispatcher_name}</span>}
                                  </p>
                                  {ev.notes && <p className="text-muted-foreground italic">{ev.notes}</p>}
                                  <p className="text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delivery confirmation modal */}
      {deliveryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-background w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-1">Confirm Delivery</h3>
            <p className="text-sm text-muted-foreground mb-4">Capture proof of handover</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Recipient name *</label>
                <input
                  type="text"
                  placeholder="Who received the item?"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="input-field w-full mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <textarea
                  placeholder="Anything to note?"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="input-field w-full mt-1 min-h-[70px]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Photo proof (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm mt-1"
                />
                {proofFile && (
                  <p className="text-xs text-muted-foreground mt-1">{proofFile.name}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeliveryModal(null)}
                className="btn-ghost flex-1 py-2.5"
                disabled={submittingDelivery}
              >
                Cancel
              </button>
              <button
                onClick={submitDelivery}
                disabled={submittingDelivery}
                className="btn-primary flex-1 py-2.5"
              >
                {submittingDelivery ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed attempt modal */}
      {failedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-background w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5">
            <h3 className="font-bold text-lg mb-1">Log Failed Attempt</h3>
            <p className="text-sm text-muted-foreground mb-4">Order stays active for retry</p>
            <textarea
              placeholder="Reason (e.g. customer not reachable, wrong address)"
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              className="input-field w-full min-h-[90px]"
              autoFocus
            />
            <div className="flex gap-2 mt-5">
              <button onClick={() => setFailedModal(null)} className="btn-ghost flex-1 py-2.5">
                Cancel
              </button>
              <button onClick={submitFailed} className="btn-primary flex-1 py-2.5">
                Log Attempt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;
