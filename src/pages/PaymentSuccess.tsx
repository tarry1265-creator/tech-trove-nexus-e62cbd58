import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Layout showBottomNav={false}>
      <div className="content-container py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Your order has been placed successfully. You'll receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/orders")} className="btn-primary px-6 py-3">
              View Orders
            </button>
            <button onClick={() => navigate("/home")} className="btn-ghost px-6 py-3">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
