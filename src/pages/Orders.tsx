import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="content-container py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

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

        <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

        {/* Empty State - Shows when no orders exist */}
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">shopping_bag</span>
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            When you complete a purchase, your orders will appear here. Start shopping to see your order history!
          </p>
          <button
            onClick={() => navigate("/products")}
            className="btn-premium px-8 py-3"
          >
            Start Shopping
          </button>
        </div>

        {/* 
          TODO: When payment integration is added, fetch and display orders here
          Orders should only show products that have been successfully paid for
          
          Example structure for future implementation:
          {orders.map((order) => (
            <div key={order.id} className="glass-card rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-primary/20 text-primary">
                  {order.status}
                </span>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        */}
      </div>
    </Layout>
  );
};

export default Orders;
