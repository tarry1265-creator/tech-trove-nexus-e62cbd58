import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { formatPrice, getStockStatus } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout>
      <div className="content-container py-4 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-foreground">Your Cart</h1>
          </div>
          <span className="text-sm text-muted-foreground">{totalItems} items</span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-muted-foreground mb-4">shopping_cart</span>
            <h2 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-6">Add some products to get started</p>
            <button onClick={() => navigate("/products")} className="btn-primary">Browse Products</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="card p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover bg-muted flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-price mb-3">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-3 py-1.5 hover:bg-muted transition-colors text-foreground"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="px-3 py-1.5 text-sm font-medium text-foreground min-w-[32px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-3 py-1.5 hover:bg-muted transition-colors text-foreground"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary - desktop sidebar */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="card p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-price">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  You'll choose Delivery or Pickup at checkout.
                </p>
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full btn-primary py-3.5 mt-4"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 lg:hidden z-40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-price">{formatPrice(subtotal)}</span>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full btn-primary py-3.5"
              >
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
