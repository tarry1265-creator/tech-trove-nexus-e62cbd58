import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { mockCartItems } from "@/data/products";

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const items = mockCartItems;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <Layout showBottomNav={false}>
      <div className="content-container py-6 lg:py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>

        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="First Name" className="input-premium" />
                <input placeholder="Last Name" className="input-premium" />
                <input placeholder="Email" className="input-premium sm:col-span-2" />
                <input placeholder="Address" className="input-premium sm:col-span-2" />
                <input placeholder="City" className="input-premium" />
                <input placeholder="Zip Code" className="input-premium" />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-primary rounded-xl cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="accent-primary" />
                  <span className="material-symbols-outlined">credit_card</span>
                  <span>Credit Card</span>
                </label>
                <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:border-muted-foreground">
                  <input type="radio" name="payment" className="accent-primary" />
                  <span className="material-symbols-outlined">account_balance</span>
                  <span>Bank Transfer</span>
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <input placeholder="Card Number" className="input-premium sm:col-span-2" />
                <input placeholder="MM/YY" className="input-premium" />
                <input placeholder="CVV" className="input-premium" />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-2xl border border-border p-6 h-fit">
            <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-muted-foreground text-sm">x{item.quantity}</p>
                  </div>
                  <span className="font-semibold">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={() => alert("Order placed! (Demo)")} className="w-full btn-premium py-4">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
