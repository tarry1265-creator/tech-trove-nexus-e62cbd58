import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useOrders, Order } from "@/hooks/useOrders";
import { formatPrice } from "@/hooks/useProducts";

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const statusOptions = ["all", "pending", "processing", "completed", "cancelled"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "cancelled":
        return "badge-destructive";
      default:
        return "badge-primary";
    }
  };

  return (
    <AdminLayout title="Orders" subtitle="Manage customer orders">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {status === "all" ? "All Orders" : status}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-warning">{orders.filter(o => o.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-primary">{orders.filter(o => o.status === 'processing').length}</div>
          <div className="stat-label">Processing</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-success">{orders.filter(o => o.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">inbox</span>
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-foreground">
                        {formatPrice(order.total_amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
