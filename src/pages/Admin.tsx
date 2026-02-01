import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProducts, useUpdateProductStock, formatPrice } from "@/hooks/useProducts";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const updateStock = useUpdateProductStock();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products by search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by stock (low stock first)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const stockA = a.stock_quantity ?? 100;
    const stockB = b.stock_quantity ?? 100;
    return stockA - stockB;
  });

  const handleEdit = (productId: string, currentStock: number | null) => {
    setEditingId(productId);
    setStockValue(String(currentStock ?? 0));
  };

  const handleSave = async (productId: string) => {
    const quantity = parseInt(stockValue, 10);
    if (isNaN(quantity) || quantity < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    try {
      await updateStock.mutateAsync({ productId, quantity });
      toast.success("Stock updated successfully");
      setEditingId(null);
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock. Make sure you have admin permissions.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setStockValue("");
  };

  const getStockStatusColor = (quantity: number | null) => {
    if (quantity === null || quantity === undefined) return "text-muted-foreground";
    if (quantity === 0) return "text-destructive";
    if (quantity <= 5) return "text-orange-500";
    return "text-green-600";
  };

  if (authLoading || adminLoading) {
    return (
      <Layout>
        <div className="content-container py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="content-container py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">lock</span>
          <h1 className="font-display text-2xl font-bold mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-6">Please login to access the admin panel</p>
          <button onClick={() => navigate("/login")} className="btn-primary">
            Login
          </button>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="content-container py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-destructive mb-4">block</span>
          <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page</p>
          <button onClick={() => navigate("/home")} className="btn-primary">
            Go Home
          </button>
        </div>
      </Layout>
    );
  }

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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage product inventory</p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{products.length}</div>
              <div className="text-xs text-muted-foreground">Total Products</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-destructive">
                {products.filter(p => (p.stock_quantity ?? 100) === 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Out of Stock</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {products.filter(p => {
                  const stock = p.stock_quantity ?? 100;
                  return stock > 0 && stock <= 5;
                }).length}
              </div>
              <div className="text-xs text-muted-foreground">Low Stock</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="card overflow-hidden">
          {productsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Product</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Brand</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Price</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Stock</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedProducts.map((product) => {
                    const stock = product.stock_quantity ?? 0;
                    const isEditing = editingId === product.id;
                    
                    return (
                      <tr key={product.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-muted"
                            />
                            <div>
                              <div className="font-medium text-foreground line-clamp-1">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.category?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{product.brand || "-"}</td>
                        <td className="p-4 text-sm font-medium">{formatPrice(product.price)}</td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={stockValue}
                              onChange={(e) => setStockValue(e.target.value)}
                              className="w-20 px-2 py-1 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                              min="0"
                              autoFocus
                            />
                          ) : (
                            <span className={`font-medium ${getStockStatusColor(stock)}`}>
                              {stock}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {stock === 0 ? (
                            <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded">
                              Out of Stock
                            </span>
                          ) : stock <= 5 ? (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSave(product.id)}
                                disabled={updateStock.isPending}
                                className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-lg">check</span>
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">close</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(product.id, product.stock_quantity)}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
