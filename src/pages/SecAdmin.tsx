import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useProducts, useUpdateProductStock, formatPrice } from "@/hooks/useProducts";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const SecAdmin = () => {
  const { data: products = [], isLoading } = useProducts();
  const updateStock = useUpdateProductStock();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [deductAmount, setDeductAmount] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleDeductStock = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    const amount = parseInt(deductAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid quantity to deduct");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const currentStock = product.stock_quantity ?? 0;
    if (amount > currentStock) {
      toast.error(`Cannot deduct ${amount}. Only ${currentStock} in stock.`);
      return;
    }

    const newStock = currentStock - amount;

    try {
      await updateStock.mutateAsync({ productId: selectedProduct, quantity: newStock });
      toast.success(`Deducted ${amount} unit(s) of "${product.name}". New stock: ${newStock}`);
      setDeductAmount("");
      setSelectedProduct(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error deducting stock:", error);
      toast.error("Failed to update stock");
    }
  };

  const selected = products.find((p) => p.id === selectedProduct);
  const showMobileSelectedPanel = !!selected;

  const SelectedPanelContent = () => {
    if (!selected) {
      return (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
            </div>
            <h3 className="font-semibold text-foreground">No Product Selected</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick a product from the list to deduct sold quantity.
          </p>
        </div>
      );
    }

    return (
      <div className="card w-full max-w-full overflow-hidden p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4 items-start">
          <img
            src={selected.image_url}
            alt={selected.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-muted"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">{selected.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{selected.brand || "No brand"}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-sm font-medium text-foreground">{formatPrice(selected.price)}</span>
              <span className={`text-sm font-medium ${(selected.stock_quantity ?? 0) <= 5 ? "text-destructive" : "text-green-600"}`}>
                Stock: {selected.stock_quantity ?? 0}
              </span>
            </div>
          </div>
          <button
            onClick={() => { setSelectedProduct(null); setDeductAmount(""); }}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Quantity Sold
            </label>
            <Input
              type="number"
              placeholder="Enter quantity..."
              value={deductAmount}
              onChange={(e) => setDeductAmount(e.target.value)}
              min="1"
              max={String(selected.stock_quantity ?? 0)}
            />
          </div>
          <button
            onClick={handleDeductStock}
            disabled={updateStock.isPending || !deductAmount}
            className="btn-primary w-full px-6 py-2.5 disabled:opacity-50"
          >
            {updateStock.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                Updating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">remove_shopping_cart</span>
                Deduct Stock
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="In-Store Sales" subtitle="Deduct stock for physical purchases" showMobileNav={false}>
      <div className={`w-full max-w-full overflow-x-hidden grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_360px] ${showMobileSelectedPanel ? "pb-64 sm:pb-72 lg:pb-0" : ""}`}>
        <div>
          <div className="relative mb-4 sm:mb-6">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
              search
            </span>
            <Input
              type="text"
              placeholder="Search product by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="card p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">search_off</span>
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              {filteredProducts.map((product) => {
                const stock = product.stock_quantity ?? 0;
                const isSelected = selectedProduct === product.id;

                return (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product.id);
                      setDeductAmount("");
                    }}
                    className={`card w-full max-w-full overflow-hidden p-3 sm:p-4 text-left transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary" : ""
                    } ${stock === 0 ? "opacity-50" : ""}`}
                    disabled={stock === 0}
                  >
                    <div className="flex gap-3 items-start sm:items-center w-full min-w-0">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-muted flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {product.brand || "No brand"} • {formatPrice(product.price)}
                        </p>
                        <p className={`text-xs font-semibold mt-1 sm:hidden ${
                          stock === 0 ? "text-destructive" : stock <= 5 ? "text-orange-500" : "text-green-600"
                        }`}>
                          {stock} in stock
                        </p>
                      </div>
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <span className={`text-sm font-bold ${
                          stock === 0 ? 'text-destructive' : stock <= 5 ? 'text-orange-500' : 'text-green-600'
                        }`}>
                          {stock}
                        </span>
                        <p className="text-xs text-muted-foreground">in stock</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden lg:block lg:sticky lg:top-20 h-fit">
          <SelectedPanelContent />
        </div>
      </div>

      {selected && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-3 pb-5 shadow-2xl overflow-x-hidden">
          <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden">
            <SelectedPanelContent />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SecAdmin;
