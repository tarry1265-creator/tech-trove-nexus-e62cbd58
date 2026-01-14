import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { mockCartItems, CartItem } from "@/data/products";

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(mockCartItems);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">shopping_cart</span>
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <button onClick={() => navigate("/products")} className="btn-premium px-8 py-3">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-card rounded-2xl border border-border">
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{item.brand}</p>
                        <h3 className="font-display font-semibold">{item.name}</h3>
                        {item.selectedColor && <p className="text-sm text-muted-foreground">{item.selectedColor}</p>}
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 hover:bg-accent">-</button>
                        <span className="px-3">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 hover:bg-accent">+</button>
                      </div>
                      <span className="font-bold">${item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-2xl border border-border p-6 h-fit">
              <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => navigate("/checkout")} className="w-full btn-premium py-4">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
