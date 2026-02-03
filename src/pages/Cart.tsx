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
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="card p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">shopping_cart</span>
            <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some products to get started</p>
            <button onClick={() => navigate("/products")} className="btn-primary">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const stockStatus = getStockStatus(item.stock_quantity);
                
                return (
                  <div key={item.id} className="flex gap-4 p-4 card">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover bg-muted flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.brand}</p>
                          <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                          {stockStatus.type === 'low' && (
                            <p className="text-xs text-warning mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">warning</span>
                              {stockStatus.message}
                            </p>
                          )}
                          {stockStatus.type === 'out' && (
                            <p className="text-xs text-destructive mt-1">Out of stock</p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 -m-1 rounded-lg hover:bg-muted flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)} 
                            className="px-3 py-1.5 hover:bg-muted transition-colors text-foreground"
                          >
                            <span className="material-symbols-outlined text-lg">remove</span>
                          </button>
                          <span className="px-4 py-1.5 font-medium text-foreground min-w-[40px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)} 
                            className="px-3 py-1.5 hover:bg-muted transition-colors text-foreground"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>
                        <span className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-5 lg:p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-primary font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-base font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(total)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate("/checkout")} 
                  className="w-full btn-primary py-3"
                >
                  Proceed to Checkout
                </button>
                <button 
                  onClick={() => navigate("/products")} 
                  className="w-full btn-ghost py-2.5 mt-2 text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
