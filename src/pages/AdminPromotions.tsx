import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Promo {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  status: "pending" | "active" | "expired";
  usageLimit: number;
  usedCount: number;
}

const AdminPromotions = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Placeholder promos (would come from database)
  const promos: Promo[] = [
    {
      id: "1",
      code: "WELCOME10",
      discount: 10,
      type: "percentage",
      status: "pending",
      usageLimit: 100,
      usedCount: 0,
    },
    {
      id: "2",
      code: "FLASH500",
      discount: 500,
      type: "fixed",
      status: "pending",
      usageLimit: 50,
      usedCount: 0,
    },
  ];

  const getStatusBadge = (status: Promo["status"]) => {
    switch (status) {
      case "active":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "expired":
        return "badge-destructive";
      default:
        return "badge-primary";
    }
  };

  return (
    <AdminLayout title="Promotions" subtitle="Create and manage discount codes">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Promo Code
        </button>
      </div>

      {/* Info Banner */}
      <div className="card p-4 mb-6 border-warning/30 bg-warning/5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-warning">info</span>
          <div>
            <p className="font-medium text-foreground">Approval Required</p>
            <p className="text-sm text-muted-foreground mt-1">
              All promo codes require admin approval before they can be used by customers. 
              New codes are created with "Pending" status.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-card">
          <div className="stat-value">{promos.length}</div>
          <div className="stat-label">Total Promos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-success">{promos.filter(p => p.status === 'active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-warning">{promos.filter(p => p.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Promo Codes List */}
      {promos.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">local_offer</span>
          <p className="text-muted-foreground">No promo codes created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => (
            <div key={promo.id} className="card p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">local_offer</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{promo.code}</span>
                      <span className={`badge ${getStatusBadge(promo.status)}`}>
                        {promo.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {promo.type === "percentage" 
                        ? `${promo.discount}% off` 
                        : `₦${promo.discount} off`
                      } • {promo.usedCount}/{promo.usageLimit} used
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {promo.status === "pending" && (
                    <button className="btn-primary text-sm py-1.5">
                      Approve
                    </button>
                  )}
                  <button className="btn-ghost p-2">
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Create Promo Code</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Code</label>
                <input 
                  type="text" 
                  placeholder="e.g., SUMMER20" 
                  className="input-field uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Discount</label>
                  <input 
                    type="number" 
                    placeholder="10" 
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                  <select className="input-field">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Usage Limit</label>
                <input 
                  type="number" 
                  placeholder="100" 
                  className="input-field"
                />
              </div>
              <div className="pt-2">
                <button className="w-full btn-primary">
                  Create (Pending Approval)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPromotions;
