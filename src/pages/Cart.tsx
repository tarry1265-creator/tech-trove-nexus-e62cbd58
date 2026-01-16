import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { formatPrice } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <Layout>
      <div className="content-container py-6 lg:py-10">
        <div className="glass-card rounded-3xl p-6 mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">Review items before checkout.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Items</div>
            <div className="text-2xl font-bold text-foreground">{cart.length}</div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">shopping_cart</span>
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <button onClick={() => navigate("/products")} className="btn-premium px-8 py-3">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 glass-card rounded-3xl">
                  <img src={item.image_url} alt={item.name} className="w-24 h-24 rounded-2xl object-cover border border-border/50" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{item.brand}</p>
                        <h3 className="font-display font-semibold text-foreground">{item.name}</h3>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 -m-2 rounded-xl hover:bg-white/5">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border/60 rounded-2xl bg-card/30">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-2 hover:bg-white/5 rounded-l-2xl transition-colors">-</button>
                        <span className="px-3 font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-2 hover:bg-white/5 rounded-r-2xl transition-colors">+</button>
                      </div>
                      <span className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-3xl p-6 h-fit">
              <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-border/60 pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
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
