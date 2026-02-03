import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useProducts, useCategories, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/hooks/useProducts";
import { toast } from "sonner";
import ScanProductModal from "@/components/admin/ScanProductModal";
import ProductTable from "@/components/admin/ProductTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading: productsLoading, refetch } = useProducts();
  const { data: categories = [], refetch: refetchCategories } = useCategories();
  const { data: orders = [] } = useOrders();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [showScanModal, setShowScanModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "products">("overview");

  // Stats
  const stats = {
    totalProducts: products.length,
    outOfStock: products.filter(p => (p.stock_quantity ?? 100) === 0).length,
    lowStock: products.filter(p => {
      const stock = p.stock_quantity ?? 100;
      return stock > 0 && stock <= 5;
    }).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    revenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
  };

  // Sort by stock (low stock first) for products view
  const sortedProducts = [...products].sort((a, b) => {
    const stockA = a.stock_quantity ?? 100;
    const stockB = b.stock_quantity ?? 100;
    return stockA - stockB;
  });

  const handleSave = async (productId: string, stockValue: string, priceValue: string) => {
    const quantity = parseInt(stockValue, 10);
    const price = parseFloat(priceValue);
    
    if (isNaN(quantity) || quantity < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      await updateProduct.mutateAsync({ 
        productId, 
        stock_quantity: quantity,
        price: price
      });
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteProduct.mutateAsync(deleteConfirm.id);
      toast.success(`"${deleteConfirm.name}" deleted`);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <AdminLayout title="Control Room" subtitle="Manage your store from one place">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setShowScanModal(true)}
          className="btn-primary text-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Product
        </button>
        <button
          onClick={() => navigate("/admin/orders")}
          className="btn-secondary text-sm"
        >
          <span className="material-symbols-outlined text-lg">shopping_bag</span>
          View Orders
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
            </div>
            <div>
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-label">Products</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-success">shopping_bag</span>
            </div>
            <div>
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-label">Orders</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-warning">warning</span>
            </div>
            <div>
              <div className="stat-value">{stats.lowStock}</div>
              <div className="stat-label">Low Stock</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-destructive">error</span>
            </div>
            <div>
              <div className="stat-value">{stats.outOfStock}</div>
              <div className="stat-label">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{formatPrice(stats.revenue)}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">payments</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "overview" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "products" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Products
        </button>
      </div>

      {/* Content */}
      {activeTab === "overview" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="card p-5">
            <h3 className="font-semibold text-foreground mb-4">Inventory Alerts</h3>
            {stats.lowStock + stats.outOfStock === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                <p>All products are well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedProducts.slice(0, 5).filter(p => (p.stock_quantity ?? 100) <= 5).map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className={`text-xs ${(product.stock_quantity ?? 100) === 0 ? 'text-destructive' : 'text-warning'}`}>
                        {(product.stock_quantity ?? 100) === 0 ? 'Out of stock' : `${product.stock_quantity} left`}
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("products")}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Update
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent Orders</h3>
              <button 
                onClick={() => navigate("/admin/orders")}
                className="text-primary text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatPrice(order.total_amount)}</p>
                      <span className={`badge ${
                        order.status === 'completed' ? 'badge-success' : 
                        order.status === 'pending' ? 'badge-warning' : 'badge-primary'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Products Tab */
        <div>
          {productsLoading ? (
            <div className="card p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="card p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">inventory_2</span>
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <ProductTable
              products={sortedProducts}
              categories={categories}
              onEdit={() => {}}
              onSave={handleSave}
              onDelete={(id, name) => setDeleteConfirm({ id, name })}
              isSaving={updateProduct.isPending}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <ScanProductModal
        open={showScanModal}
        onClose={() => setShowScanModal(false)}
        onProductAdded={() => { refetch(); refetchCategories(); }}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Admin;
