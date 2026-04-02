import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasRun = useRef(false);

  // Flutterwave returns transaction_id and tx_ref as query params
  const transactionId = searchParams.get("transaction_id");
  const txRef = searchParams.get("tx_ref");
  const flwStatus = searchParams.get("status");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyAndSaveOrder = async () => {
      // If Flutterwave returns status=cancelled, fail immediately
      if (flwStatus === "cancelled") {
        setFailed(true);
        setVerifying(false);
        return;
      }

      if (!transactionId) {
        console.error("[PaymentSuccess] No transaction_id in URL");
        setFailed(true);
        setVerifying(false);
        return;
      }

      try {
        // Read cart from localStorage BEFORE any clearing
        const savedCart = localStorage.getItem("cart");
        const cartItems = savedCart ? JSON.parse(savedCart) : [];

        console.log("[PaymentSuccess] Cart items from localStorage:", cartItems.length);
        console.log("[PaymentSuccess] Verifying transaction_id:", transactionId, "tx_ref:", txRef);

        const { data, error } = await supabase.functions.invoke("verify-flutterwave-payment", {
          body: { transaction_id: transactionId, tx_ref: txRef },
        });

        console.log("[PaymentSuccess] Verify response:", JSON.stringify(data), "Error:", error);

        if (error) {
          console.error("Payment verification error:", error);
          setFailed(true);
          setVerifying(false);
          return;
        }

        const paymentStatus = data?.status;
        console.log("[PaymentSuccess] Payment status:", paymentStatus);

        if (paymentStatus === "success") {
          await saveOrder(cartItems);
          clearCart();
          setVerified(true);
        } else {
          setFailed(true);
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setFailed(true);
      } finally {
        setVerifying(false);
      }
    };

    const saveOrder = async (cartItems: any[]) => {
      try {
        if (!user?.id) {
          console.error("[PaymentSuccess] No user ID, cannot save order");
          return;
        }

        if (!cartItems || cartItems.length === 0) {
          console.error("[PaymentSuccess] No cart items to save");
          return;
        }

        const totalAmount = cartItems.reduce(
          (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );

        console.log("[PaymentSuccess] Saving order with total:", totalAmount, "items:", cartItems.length);

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            total_amount: totalAmount,
            currency: "NGN",
            status: "completed",
          })
          .select()
          .single();

        if (orderError) {
          console.error("Error creating order:", orderError);
          return;
        }

        console.log("[PaymentSuccess] Order created:", order.id);

        const orderItems = cartItems.map((item: any) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image_url,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.price) || 0,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error("Error creating order items:", itemsError);
        } else {
          console.log("[PaymentSuccess] Order items created successfully");
        }

        // Deduct stock
        for (const item of cartItems) {
          const { data: product } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.id)
            .single();

          if (product) {
            const newStock = Math.max(0, (product.stock_quantity ?? 0) - (Number(item.quantity) || 1));
            await supabase
              .from("products")
              .update({ stock_quantity: newStock })
              .eq("id", item.id);
          }
        }
      } catch (err) {
        console.error("Error saving order:", err);
      }
    };

    verifyAndSaveOrder();
  }, [transactionId, txRef, user?.id]);

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

  if (failed) {
    return (
      <Layout showBottomNav={false}>
        <div className="content-container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-destructive">cancel</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Payment Unsuccessful</h1>
            <p className="text-muted-foreground mb-2">
              Your payment could not be verified. Please try again or contact support.
            </p>
            {txRef && (
              <p className="text-xs text-muted-foreground mb-8">
                Reference: <span className="font-mono">{txRef}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate("/checkout")} className="btn-primary px-6 py-3">
                Try Again
              </button>
              <button onClick={() => navigate("/home")} className="btn-ghost px-6 py-3">
                Go Home
              </button>
            </div>
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
          {txRef && (
            <p className="text-xs text-muted-foreground mb-8">
              Reference: <span className="font-mono">{txRef}</span>
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
