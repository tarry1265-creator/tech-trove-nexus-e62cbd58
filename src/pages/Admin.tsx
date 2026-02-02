import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProducts, useUpdateProduct, useDeleteProduct, formatPrice } from "@/hooks/useProducts";
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
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanModal, setShowScanModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

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

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => (p.stock_quantity ?? 100) === 0).length,
    lowStock: products.filter(p => {
      const stock = p.stock_quantity ?? 100;
      return stock > 0 && stock <= 5;
    }).length,
  };

  return (
    <Layout>
      <div className="content-container py-4 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
          
          <h1 className="font-display text-xl lg:text-2xl font-bold">Admin</h1>
          
          <button
            onClick={() => setShowScanModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
            <span className="text-sm font-medium hidden sm:inline">Scan</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
          <div className="card p-3 lg:p-4 text-center">
            <div className="text-xl lg:text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-[10px] lg:text-xs text-muted-foreground">Products</div>
          </div>
          <div className="card p-3 lg:p-4 text-center">
            <div className="text-xl lg:text-2xl font-bold text-destructive">{stats.outOfStock}</div>
            <div className="text-[10px] lg:text-xs text-muted-foreground">Out of Stock</div>
          </div>
          <div className="card p-3 lg:p-4 text-center">
            <div className="text-xl lg:text-2xl font-bold text-orange-500">{stats.lowStock}</div>
            <div className="text-[10px] lg:text-xs text-muted-foreground">Low Stock</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {/* Products */}
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
            onEdit={() => {}}
            onSave={handleSave}
            onDelete={(id, name) => setDeleteConfirm({ id, name })}
            isSaving={updateProduct.isPending}
          />
        )}
      </div>

      {/* Scan Modal */}
      <ScanProductModal
        open={showScanModal}
        onClose={() => setShowScanModal(false)}
        onProductAdded={() => refetch()}
      />

      {/* Delete Confirmation Dialog */}
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
    </Layout>
  );
};

export default Admin;
