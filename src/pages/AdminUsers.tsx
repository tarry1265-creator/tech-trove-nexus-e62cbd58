import AdminLayout from "@/components/admin/AdminLayout";

const AdminUsers = () => {
  return (
    <AdminLayout title="Users" subtitle="Manage customers and access">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
            <div>
              <div className="stat-value">--</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-success">verified</span>
            </div>
            <div>
              <div className="stat-value">--</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-destructive">block</span>
            </div>
            <div>
              <div className="stat-value">--</div>
              <div className="stat-label">Banned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div className="card p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">group</span>
        <h3 className="text-lg font-semibold text-foreground mb-2">User Management</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
          View user profiles, activity summaries, and manage access. Ban or unban users when necessary.
        </p>
        <p className="text-xs text-muted-foreground">
          This feature requires additional database setup for user management.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
