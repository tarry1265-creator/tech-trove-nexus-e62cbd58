import { useState } from "react";
import { formatPrice, Category } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  stock_quantity: number | null;
  image_url: string;
  category?: { id: string; name: string } | null;
}

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (productId: string, stock: number | null, price: number) => void;
  onSave: (productId: string, stock: string, price: string) => Promise<void>;
  onDelete: (productId: string, productName: string) => void;
  isSaving: boolean;
}

const ProductTable = ({ products, categories, onEdit, onSave, onDelete, isSaving }: ProductTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<string>("");
  const [priceValue, setPriceValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleEdit = (productId: string, currentStock: number | null, currentPrice: number) => {
    setEditingId(productId);
    setStockValue(String(currentStock ?? 0));
    setPriceValue(String(currentPrice));
    onEdit(productId, currentStock, currentPrice);
  };

  const handleSave = async (productId: string) => {
    await onSave(productId, stockValue, priceValue);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setStockValue("");
    setPriceValue("");
  };

  const getStockStatusColor = (quantity: number | null) => {
    if (quantity === null || quantity === undefined) return "text-muted-foreground";
    if (quantity === 0) return "text-destructive";
    if (quantity <= 5) return "text-orange-500";
    return "text-green-600";
  };

  // Filter products by search query and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCategory = selectedCategory === "all" || 
      product.category?.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
            search
          </span>
          <Input
            type="text"
            placeholder="Search by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <div className="card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Product</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Category</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Price (₦)</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Stock</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => {
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
                          <div className="text-xs text-muted-foreground">{product.brand || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-foreground">{product.category?.name || "Uncategorized"}</span>
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={priceValue}
                          onChange={(e) => setPriceValue(e.target.value)}
                          className="w-28 px-2 py-1 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-background"
                          min="0"
                          step="100"
                        />
                      ) : (
                        <span className="font-medium text-foreground">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={stockValue}
                          onChange={(e) => setStockValue(e.target.value)}
                          className="w-20 px-2 py-1 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-background"
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
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded dark:bg-orange-900/30 dark:text-orange-400">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded dark:bg-green-900/30 dark:text-green-400">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSave(product.id)}
                            disabled={isSaving}
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(product.id, product.stock_quantity, product.price)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => onDelete(product.id, product.name)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-border">
          {filteredProducts.map((product) => {
            const stock = product.stock_quantity ?? 0;
            const isEditing = editingId === product.id;

            return (
              <div key={product.id} className="p-4">
                <div className="flex gap-3">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.category?.name || "Uncategorized"} {product.brand && `• ${product.brand}`}
                    </p>
                    
                    {isEditing ? (
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Price</label>
                          <input
                            type="number"
                            value={priceValue}
                            onChange={(e) => setPriceValue(e.target.value)}
                            className="w-full px-2 py-1.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-background"
                            min="0"
                            step="100"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-xs text-muted-foreground">Stock</label>
                          <input
                            type="number"
                            value={stockValue}
                            onChange={(e) => setStockValue(e.target.value)}
                            className="w-full px-2 py-1.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-background"
                            min="0"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-bold text-primary text-sm">{formatPrice(product.price)}</span>
                        <span className={`text-xs font-medium ${getStockStatusColor(stock)}`}>
                          Stock: {stock}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(product.id)}
                        disabled={isSaving}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(product.id, product.stock_quantity, product.price)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(product.id, product.name)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
            <p>No products found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
