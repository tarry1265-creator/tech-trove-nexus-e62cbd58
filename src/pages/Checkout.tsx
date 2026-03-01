import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { formatPrice } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 2500;
  const total = subtotal + shipping;

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
    if (!shippingInfo.firstName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state) {
      toast.error("Please fill in all shipping details");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
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
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/cart")} className="text-foreground">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-foreground">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                SHIPPING INFORMATION
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
                  <label className="block text-sm font-medium text-foreground mb-2">Email (optional)</label>
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
                  <span className="text-muted-foreground">Shipping cost</span>
                  <span className="text-foreground">{formatPrice(shipping)}</span>
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
                  `Checkout ${formatPrice(total)}`
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="material-symbols-outlined text-muted-foreground text-sm">verified_user</span>
                <p className="text-xs text-muted-foreground">Secured by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
