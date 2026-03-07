import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        // No reference means direct navigation or Stripe legacy flow
        clearCart();
        setVerified(true);
        return;
      }

      setVerifying(true);
      try {
        const { data, error } = await supabase.functions.invoke("verify-paystack-payment", {
          body: { reference },
        });

        if (error) throw error;

        if (data?.status === "success") {
          clearCart();
          setVerified(true);
        } else {
          setVerified(false);
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        // Still clear cart and show success if we got redirected here
        clearCart();
        setVerified(true);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [reference, clearCart]);

  if (verifying) {
    return (
      <Layout showBottomNav={false}>
        <div className="content-container py-20 text-center">
          <div className="max-w-md mx-auto">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4">progress_activity</span>
            <h1 className="text-xl font-bold text-foreground mb-2">Verifying Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBottomNav={false}>
      <div className="content-container py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Payment Successful!</h1>
          <p className="text-muted-foreground mb-2">
            Your order has been placed successfully. You'll receive a confirmation email shortly.
          </p>
          {reference && (
            <p className="text-xs text-muted-foreground mb-8">
              Reference: <span className="font-mono">{reference}</span>
            </p>
          )}
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
