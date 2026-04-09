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

  return (
    <AdminLayout title="In-Store Sales" subtitle="Deduct stock for physical purchases">
      {/* Selected Product Card */}
      {selected && (
        <div className="card p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <img
              src={selected.image_url}
              alt={selected.name}
              className="w-20 h-20 rounded-xl object-cover bg-muted mx-auto sm:mx-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base sm:text-lg text-center sm:text-left">{selected.name}</h3>
              <p className="text-sm text-muted-foreground text-center sm:text-left">{selected.brand || "No brand"}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                <span className="text-sm font-medium text-foreground">{formatPrice(selected.price)}</span>
                <span className={`text-sm font-medium ${(selected.stock_quantity ?? 0) <= 5 ? 'text-destructive' : 'text-green-600'}`}>
                  Stock: {selected.stock_quantity ?? 0}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setSelectedProduct(null); setDeductAmount(""); }}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground self-end sm:self-auto"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 w-full">
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
              className="btn-primary px-6 py-2.5 disabled:opacity-50 w-full sm:w-auto"
            >
              {updateStock.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">remove_shopping_cart</span>
                  Deduct Stock
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5 sm:mb-6">
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

      {/* Products List */}
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
        <div className="grid gap-2.5 sm:gap-3">
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
                className={`card p-4 text-left transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${stock === 0 ? "opacity-50" : ""}`}
                disabled={stock === 0}
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm sm:text-[15px] line-clamp-2">{product.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {product.brand || "No brand"} • {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
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
    </AdminLayout>
  );
};

export default SecAdmin;
