import AdminLayout from "@/components/admin/AdminLayout";
import { useProducts, useCategories, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { useState } from "react";
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

const AdminProducts = () => {
  const { data: products = [], isLoading: productsLoading, refetch } = useProducts();
  const { data: categories = [], refetch: refetchCategories } = useCategories();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [showScanModal, setShowScanModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category?.slug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const stockA = a.stock_quantity ?? 100;
    const stockB = b.stock_quantity ?? 100;
    return stockA - stockB;
  });

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => (p.stock_quantity ?? 100) === 0).length,
    lowStock: products.filter(p => {
      const stock = p.stock_quantity ?? 100;
      return stock > 0 && stock <= 5;
    }).length,
  };

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
    <AdminLayout title="Products" subtitle="Manage your product inventory">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setShowScanModal(true)}
          className="btn-primary text-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-warning">{stats.lowStock}</div>
          <div className="stat-label">Low Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-destructive">{stats.outOfStock}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {productsLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">inventory_2</span>
          <p className="text-muted-foreground">
            {searchQuery || categoryFilter !== "all" ? "No products match your filters" : "No products found"}
          </p>
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

export default AdminProducts;
