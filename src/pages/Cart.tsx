import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { formatPrice, getStockStatus } from "@/hooks/useProducts";
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
        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="card p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <div className="card p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">shopping_cart</span>
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <button onClick={() => navigate("/products")} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const stockStatus = getStockStatus(item.stock_quantity);
                
                return (
                  <div key={item.id} className="flex gap-4 p-4 card">
                    <img src={item.image_url} alt={item.name} className="w-24 h-24 rounded-lg object-cover bg-muted" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.brand}</p>
                          <h3 className="font-display font-semibold text-foreground truncate">{item.name}</h3>
                          {stockStatus.type === 'low' && (
                            <p className="text-xs text-orange-600 mt-1">{stockStatus.message}</p>
                          )}
                          {stockStatus.type === 'out' && (
                            <p className="text-xs text-destructive mt-1">Out of stock</p>
                          )}
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 -m-2 rounded-lg hover:bg-muted">
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-2 hover:bg-muted rounded-l-lg transition-colors">-</button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-2 hover:bg-muted rounded-r-lg transition-colors">+</button>
                        </div>
                        <span className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card p-6 h-fit">
              <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-primary">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <button onClick={() => navigate("/checkout")} className="w-full btn-primary py-4">
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
