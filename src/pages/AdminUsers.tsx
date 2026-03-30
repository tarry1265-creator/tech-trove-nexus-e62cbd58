import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminUsers = () => {
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

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
              <div className="stat-value">{profiles.length}</div>
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
              <div className="stat-value">{profiles.length}</div>
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
              <div className="stat-value">0</div>
              <div className="stat-label">Banned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {profiles.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">group</span>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Users Yet</h3>
          <p className="text-muted-foreground text-sm">Users will appear here when they sign up.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">User</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Username</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-primary">person</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground">{profile.user_id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">{profile.username || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden divide-y divide-border">
            {profiles.map((profile) => (
              <div key={profile.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-primary">person</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile.username || profile.user_id.slice(0, 12) + "..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
