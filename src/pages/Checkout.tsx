import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { formatPrice } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [activePayment, setActivePayment] = useState("card");
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 2500;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="content-container py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">shopping_cart</span>
          <p className="text-muted-foreground mb-6">Your cart is empty</p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </Layout>
    );
  }

  const paymentMethods = [
    { id: "card", icon: "credit_card", label: "Card Payment", desc: "Pay with Visa, Mastercard, or Verve" },
    { id: "bank", icon: "account_balance", label: "Bank Transfer", desc: "Direct bank transfer" },
    { id: "delivery", icon: "local_shipping", label: "Pay on Delivery", desc: "Cash on delivery" },
  ];

  return (
    <Layout showBottomNav={false}>
      <div className="content-container py-6 lg:py-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate("/cart")} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back to Cart</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-1">Complete your order</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { num: 1, label: "Shipping" },
            { num: 2, label: "Payment" },
            { num: 3, label: "Confirm" },
          ].map((step, i) => (
            <div key={step.num} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                step.num === 1 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {step.num}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${
                step.num === 1 ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
              {i < 2 && (
                <div className="w-12 h-px bg-border hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Section */}
            <div className="card p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                  <input placeholder="John" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                  <input placeholder="Doe" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input type="email" placeholder="john@example.com" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                  <input placeholder="+234 800 000 0000" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
                  <input placeholder="123 Main Street" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                  <input placeholder="Lagos" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">State</label>
                  <input placeholder="Lagos State" className="input-field" />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="card p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      activePayment === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={activePayment === method.id}
                      onChange={() => setActivePayment(method.id)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="material-symbols-outlined text-muted-foreground">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 lg:p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-14 h-14 rounded-lg object-cover bg-muted flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
              </div>

              <button 
                onClick={() => alert("Order placed! (Demo)")} 
                className="w-full btn-primary py-3"
              >
                Place Order
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
