import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface SavedAddress {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

const emptyForm = {
  label: "Home",
  recipient_name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  latitude: null as number | null,
  longitude: null as number | null,
  is_default: false,
};

const Addresses = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [fetching, setFetching] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  const load = async () => {
    if (!user?.id) return;
    setFetching(true);
    const { data, error } = await supabase
      .from("user_addresses" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Could not load addresses");
    } else {
      setAddresses((data || []) as any);
    }
    setFetching(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (a: SavedAddress) => {
    setEditingId(a.id);
    setForm({
      label: a.label || "",
      recipient_name: a.recipient_name || "",
      phone: a.phone || "",
      address: a.address || "",
      city: a.city || "",
      state: a.state || "",
      latitude: a.latitude,
      longitude: a.longitude,
      is_default: a.is_default,
    });
    setOpen(true);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
          const fullAddress = street || data.display_name?.split(",").slice(0, 2).join(",") || "";
          const city = addr.city || addr.town || addr.village || addr.suburb || "";
          const state = addr.state || "";
          setForm((f) => ({
            ...f,
            latitude,
            longitude,
            address: fullAddress || f.address,
            city: city || f.city,
            state: state || f.state,
          }));
          toast.success("Location captured. Edit anything if needed.");
        } catch {
          setForm((f) => ({ ...f, latitude, longitude }));
          toast.message("Location captured but couldn't auto-fill the address.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enter the address manually.");
        } else {
          toast.error("Could not get your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.address || !form.recipient_name || !form.phone) {
      toast.error("Recipient, phone and address are required");
      return;
    }
    setSaving(true);
    try {
      // If marking default, unset other defaults first
      if (form.is_default) {
        await supabase
          .from("user_addresses" as any)
          .update({ is_default: false } as any)
          .eq("user_id", user.id);
      }

      if (editingId) {
        const { error } = await supabase
          .from("user_addresses" as any)
          .update(form as any)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Address updated");
      } else {
        const { error } = await supabase
          .from("user_addresses" as any)
          .insert({ ...form, user_id: user.id } as any);
        if (error) throw error;
        toast.success("Address saved");
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const { error } = await supabase.from("user_addresses" as any).delete().eq("id", id);
    if (error) {
      toast.error("Could not delete");
    } else {
      toast.success("Deleted");
      await load();
    }
  };

  const setDefault = async (id: string) => {
    if (!user?.id) return;
    await supabase
      .from("user_addresses" as any)
      .update({ is_default: false } as any)
      .eq("user_id", user.id);
    await supabase
      .from("user_addresses" as any)
      .update({ is_default: true } as any)
      .eq("id", id);
    toast.success("Default address updated");
    await load();
  };

  if (loading || fetching) {
    return (
      <Layout>
        <div className="content-container py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">My Addresses</h1>
          <button onClick={openNew} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Add address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="card p-8 flex flex-col items-center justify-center text-center min-h-[260px]">
            <span className="material-symbols-outlined text-5xl text-muted-foreground/40 mb-4">location_on</span>
            <h2 className="text-lg font-semibold mb-2">No saved addresses</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Save an address to speed up checkout when you choose delivery.
            </p>
            <button onClick={openNew} className="btn-primary px-6 py-2.5 text-sm">
              Add your first address
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div key={a.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <span className="font-semibold">{a.label || "Address"}</span>
                    {a.is_default && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">{a.recipient_name}</p>
                <p className="text-sm text-muted-foreground">{a.phone}</p>
                <p className="text-sm text-foreground mt-2">
                  {a.address}
                  {a.city ? `, ${a.city}` : ""}
                  {a.state ? `, ${a.state}` : ""}
                </p>
                {a.latitude && a.longitude && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    GPS: {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <button onClick={() => openEdit(a)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted">
                    Edit
                  </button>
                  {!a.is_default && (
                    <button onClick={() => setDefault(a.id)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted">
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit address" : "Add new address"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">
                  {locating ? "progress_activity" : "my_location"}
                </span>
                <span className="text-sm font-medium">
                  {locating ? "Getting location..." : "Use my current location"}
                </span>
              </button>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Label</label>
                <input
                  className="input-field"
                  placeholder="Home, Office, etc."
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Recipient name</label>
                <input
                  className="input-field"
                  value={form.recipient_name}
                  onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <input
                  className="input-field"
                  placeholder="+234..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Street address</label>
                <input
                  className="input-field"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">City</label>
                  <input
                    className="input-field"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">State</label>
                  <input
                    className="input-field"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm pt-1">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                />
                Set as default
              </label>
            </div>

            <DialogFooter>
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-border">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary px-4 py-2 text-sm">
                {saving ? "Saving..." : "Save address"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Addresses;
