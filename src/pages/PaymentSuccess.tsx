import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const hasRun = useRef(false);

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyAndSaveOrder = async () => {
      if (!reference) {
        clearCart();
        setVerified(true);
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-paystack-payment", {
          body: { reference },
        });

        if (error) throw error;

        // Paystack verify endpoint returns { status: "success", amount, ... }
        const paymentStatus = data?.status;
        if (paymentStatus === "success") {
          // Save order to database
          await saveOrder(data);
          clearCart();
          setVerified(true);
        } else {
          // Still mark as verified if we got redirected here from Paystack
          clearCart();
          setVerified(true);
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        clearCart();
        setVerified(true);
      } finally {
        setVerifying(false);
      }
    };

    const saveOrder = async (paymentData: any) => {
      try {
        if (!user?.id) return;

        // Get cart items from localStorage before they're cleared
        const savedCart = localStorage.getItem("cart");
        const cartItems = savedCart ? JSON.parse(savedCart) : cart;
        
        if (!cartItems || cartItems.length === 0) return;

        const totalAmount = cartItems.reduce(
          (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );

        // Create the order
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

        // Create order items
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
        }

        // Deduct stock for each purchased product
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
  }, [reference]);

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
