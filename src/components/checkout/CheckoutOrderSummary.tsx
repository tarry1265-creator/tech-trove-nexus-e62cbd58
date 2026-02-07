import { formatPrice } from "@/hooks/useProducts";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CheckoutOrderSummaryProps {
  cart: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  isLoading: boolean;
  onPlaceOrder: () => void;
}

const CheckoutOrderSummary = ({
  cart,
  subtotal,
  shipping,
  total,
  isLoading,
  onPlaceOrder,
}: CheckoutOrderSummaryProps) => {
  return (
    <div className="card p-5 lg:p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>

      {/* Items */}
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {cart.map((item) => (
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
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(item.price * item.quantity)}
            </span>
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
        onClick={onPlaceOrder}
        disabled={isLoading}
        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            Processing...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">lock</span>
            Pay with Stripe
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="material-symbols-outlined text-muted-foreground text-sm">verified_user</span>
        <p className="text-xs text-muted-foreground">
          Secured by Stripe. Your payment info is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;
