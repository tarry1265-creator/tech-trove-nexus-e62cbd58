import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";

const AdminAI = () => {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate some basic insights for context
  const lowStockProducts = products.filter(p => (p.stock_quantity ?? 100) <= 5);
  const outOfStockProducts = products.filter(p => (p.stock_quantity ?? 100) === 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  const suggestedPrompts = [
    "What products need restocking?",
    "Give me a sales summary",
    "Suggest best times for promotions",
    "How can I improve inventory turnover?",
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simulate AI response (will be connected to actual AI service)
    // The AI service is modular and can be swapped for Gemini-compatible API
    setTimeout(() => {
      let response = "";
      
      if (userMessage.toLowerCase().includes("restock") || userMessage.toLowerCase().includes("stock")) {
        response = `Based on your current inventory:\n\n`;
        if (lowStockProducts.length > 0) {
          response += `⚠️ **Low Stock Alert**: ${lowStockProducts.length} products need attention\n`;
          lowStockProducts.slice(0, 3).forEach(p => {
            response += `• ${p.name} - ${p.stock_quantity} units left\n`;
          });
        }
        if (outOfStockProducts.length > 0) {
          response += `\n🚫 **Out of Stock**: ${outOfStockProducts.length} products\n`;
        }
        response += `\nRecommendation: Prioritize restocking bestsellers and items with pending orders.`;
      } else if (userMessage.toLowerCase().includes("sales") || userMessage.toLowerCase().includes("revenue")) {
        response = `📊 **Sales Summary**\n\n`;
        response += `• Total Orders: ${orders.length}\n`;
        response += `• Total Revenue: ₦${totalRevenue.toLocaleString()}\n`;
        response += `• Pending Orders: ${pendingOrders.length}\n`;
        response += `\nTip: Consider running a promotion to convert pending carts into sales.`;
      } else if (userMessage.toLowerCase().includes("promotion") || userMessage.toLowerCase().includes("promo")) {
        response = `💡 **Promotion Timing Suggestions**\n\n`;
        response += `Based on e-commerce patterns:\n`;
        response += `• Best days: Friday & Saturday\n`;
        response += `• Peak hours: 7-10 PM\n`;
        response += `• Flash sales work best with 24-48hr windows\n\n`;
        response += `Recommendation: Run a "Weekend Flash Sale" with 10-15% off to boost conversions.`;
      } else {
        response = `I can help you with:\n\n`;
        response += `• **Inventory insights** - Stock levels, restock alerts\n`;
        response += `• **Sales analysis** - Revenue, order trends\n`;
        response += `• **Promotion timing** - Best times to run deals\n\n`;
        response += `Try asking about any of these topics!`;
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AdminLayout title="AI Assistant" subtitle="Get insights and recommendations">
      {/* Context Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <div className="text-lg font-bold text-foreground">{products.length}</div>
          <div className="text-xs text-muted-foreground">Products</div>
        </div>
        <div className="stat-card">
          <div className="text-lg font-bold text-warning">{lowStockProducts.length}</div>
          <div className="text-xs text-muted-foreground">Low Stock</div>
        </div>
        <div className="stat-card">
          <div className="text-lg font-bold text-foreground">{orders.length}</div>
          <div className="text-xs text-muted-foreground">Orders</div>
        </div>
        <div className="stat-card">
          <div className="text-lg font-bold text-success">₦{(totalRevenue / 1000).toFixed(0)}k</div>
          <div className="text-xs text-muted-foreground">Revenue</div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="card flex flex-col h-[500px] lg:h-[600px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Admin AI Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Ask me about inventory, sales insights, or get recommendations for your store.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt);
                    }}
                    className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 hover:text-foreground transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your store..."
              className="input-field flex-1"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="btn-primary px-4 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This assistant is modular and can be connected to Gemini or other AI APIs.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAI;
