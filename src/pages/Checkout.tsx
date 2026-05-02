import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { formatPrice } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PICKUP_LOCATION = "BRAINHUB TECH Store, Lagos, Nigeria";

type Fulfillment = "delivery" | "pickup";

interface SavedAddress {
  id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  is_default: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  // Load saved addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("user_addresses" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      const list = (data || []) as any as SavedAddress[];
      setSavedAddresses(list);
      const def = list.find((a) => a.is_default) || list[0];
      if (def) {
        setSelectedAddressId(def.id);
        applyAddress(def);
      }
    };
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const applyAddress = (a: SavedAddress) => {
    const [first, ...rest] = (a.recipient_name || "").split(" ");
    setShippingInfo((prev) => ({
      ...prev,
      firstName: first || prev.firstName,
      lastName: rest.join(" ") || prev.lastName,
      phone: a.phone || prev.phone,
      address: a.address || prev.address,
      city: a.city || prev.city,
      state: a.state || prev.state,
    }));
  };

  const handleSelectSaved = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setShippingInfo((prev) => ({ ...prev, address: "", city: "", state: "" }));
      return;
    }
    const a = savedAddresses.find((x) => x.id === id);
    if (a) applyAddress(a);
  };

  if (cart.length === 0) {
    return (
      <Layout showBottomNav={false}>
        <div className="content-container py-20 text-center">
          <span className="material-symbols-outlined text-5xl text-muted-foreground mb-4">shopping_cart</span>
          <p className="text-muted-foreground mb-6">Your cart is empty</p>
          <button onClick={() => navigate("/products")} className="btn-primary">Continue Shopping</button>
        </div>
      </Layout>
    );
  }

  const handleChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    // Validate based on fulfillment type
    if (!shippingInfo.firstName || !shippingInfo.phone) {
      toast.error("Please enter your name and phone number");
      return;
    }
    if (fulfillment === "delivery") {
      if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state) {
        toast.error("Please fill in your delivery address");
        return;
      }
    }

    setIsLoading(true);
    try {
      // Save new address if requested
      if (
        fulfillment === "delivery" &&
        selectedAddressId === "new" &&
        saveNewAddress &&
        user?.id
      ) {
        await supabase.from("user_addresses" as any).insert({
          user_id: user.id,
          label: "Home",
          recipient_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          is_default: savedAddresses.length === 0,
        } as any);
      }

      // Persist for PaymentSuccess
      localStorage.setItem("checkout_phone", shippingInfo.phone);
      localStorage.setItem("checkout_name", `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim());
      localStorage.setItem("checkout_fulfillment", fulfillment);

      if (fulfillment === "delivery") {
        localStorage.setItem("checkout_address", shippingInfo.address);
        localStorage.setItem("checkout_city", shippingInfo.city);
        localStorage.setItem("checkout_state", shippingInfo.state);
      } else {
        localStorage.setItem("checkout_address", "PICKUP - In-store collection");
        localStorage.setItem("checkout_city", "");
        localStorage.setItem("checkout_state", "");
      }

      const callbackUrl = `${window.location.origin}/payment-success`;

      const { data, error } = await supabase.functions.invoke("create-flutterwave-checkout", {
        body: {
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url,
            brand: item.brand,
          })),
          shippingInfo: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: fulfillment === "delivery" ? shippingInfo.address : "PICKUP - In-store collection",
            city: fulfillment === "delivery" ? shippingInfo.city : "",
            state: fulfillment === "delivery" ? shippingInfo.state : "",
            fulfillmentType: fulfillment,
          },
          callbackUrl,
        },
      });

      if (error) throw error;
      if (data?.payment_link) {
        window.location.href = data.payment_link;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showBottomNav={false}>
      <div className="content-container py-4 lg:py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/cart")} className="text-foreground">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-foreground">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Fulfillment choice */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                How would you like to receive your order?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillment("delivery")}
                  className={`text-left p-4 rounded-2xl border-2 transition ${
                    fulfillment === "delivery"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <span className="font-semibold">Delivery</span>
                  </div>
                  <p className="text-xs text-muted-foreground">We bring it to your doorstep</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillment("pickup")}
                  className={`text-left p-4 rounded-2xl border-2 transition ${
                    fulfillment === "pickup"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary">storefront</span>
                    <span className="font-semibold">Pickup</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Collect at our store</p>
                </button>
              </div>
            </div>

            {/* Saved address picker (delivery only) */}
            {fulfillment === "delivery" && savedAddresses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Deliver to
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/addresses")}
                    className="text-xs text-primary font-medium"
                  >
                    Manage addresses
                  </button>
                </div>
                <div className="space-y-2">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleSelectSaved(a.id)}
                      className={`w-full text-left p-3 rounded-xl border transition ${
                        selectedAddressId === a.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{a.label || "Address"}</span>
                        {a.is_default && (
                          <span className="text-[10px] uppercase bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {a.recipient_name} · {a.phone}
                      </p>
                      <p className="text-xs text-foreground">
                        {a.address}{a.city ? `, ${a.city}` : ""}{a.state ? `, ${a.state}` : ""}
                      </p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectSaved("new")}
                    className={`w-full text-left p-3 rounded-xl border-2 border-dashed transition ${
                      selectedAddressId === "new"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-sm font-medium">+ Use a new address</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pickup info */}
            {fulfillment === "pickup" && (
              <div className="card p-5 border-l-4 border-l-primary">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">storefront</span>
                  <div>
                    <p className="font-semibold mb-1">Pickup location</p>
                    <p className="text-sm text-muted-foreground mb-2">{PICKUP_LOCATION}</p>
                    <p className="text-xs text-muted-foreground">
                      We'll call you on the phone number below as soon as your order is ready for collection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {fulfillment === "delivery" ? "DELIVERY DETAILS" : "CONTACT DETAILS"}
              </p>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                    <input
                      placeholder="John"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                    <input
                      placeholder="Doe"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {fulfillment === "delivery" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                      <input
                        placeholder="123 Main Street"
                        value={shippingInfo.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">City</label>
                        <input
                          placeholder="Lagos"
                          value={shippingInfo.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">State</label>
                        <input
                          placeholder="Lagos State"
                          value={shippingInfo.state}
                          onChange={(e) => handleChange("state", e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                    {selectedAddressId === "new" && user && (
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                        />
                        Save this address for next time
                      </label>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone number</label>
                  <input
                    placeholder="+234 800 000 0000"
                    value={shippingInfo.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email (for receipt)</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={shippingInfo.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 lg:p-6 sticky top-24">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fulfillment</span>
                  <span className="text-foreground capitalize">{fulfillment}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-price text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full btn-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatPrice(total)}`
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="material-symbols-outlined text-muted-foreground text-sm">verified_user</span>
                <p className="text-xs text-muted-foreground">Secured by Flutterwave</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
