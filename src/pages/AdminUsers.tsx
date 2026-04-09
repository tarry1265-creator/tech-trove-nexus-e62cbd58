import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

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

  const toggleBan = useMutation({
    mutationFn: async ({ userId, ban }: { userId: string; ban: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: ban })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { ban }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-profiles-count"] });
      toast.success(ban ? "User has been banned" : "User has been unbanned");
    },
    onError: (err) => {
      console.error("Ban/unban error:", err);
      toast.error("Failed to update user status");
    },
  });

  const bannedCount = profiles.filter((p: any) => p.is_banned).length;
  const activeCount = profiles.length - bannedCount;

  return (
    <AdminLayout title="Users" subtitle="Manage customers and access">
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
              <div className="stat-value">{activeCount}</div>
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
              <div className="stat-value">{bannedCount}</div>
              <div className="stat-label">Banned</div>
            </div>
          </div>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">group</span>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Users Yet</h3>
          <p className="text-muted-foreground text-sm">Users will appear here when they sign up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile: any) => {
            const isBanned = profile.is_banned;
            const isExpanded = selectedUser === profile.id;

            return (
              <div key={profile.id} className={`card overflow-hidden ${isBanned ? "opacity-60" : ""}`}>
                <button onClick={() => setSelectedUser(isExpanded ? null : profile.id)} className="w-full p-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-primary">person</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {profile.username || "No username set"}
                        </p>
                        {isBanned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">BANNED</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        📱 {profile.phone_number || "No phone number"} ·{" "}
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-muted-foreground">
                      {isExpanded ? "expand_less" : "expand_more"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">User ID</p>
                        <p className="font-mono text-foreground text-xs truncate">{profile.user_id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Username</p>
                        <p className="text-foreground">{profile.username || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Phone</p>
                        <p className="text-foreground">{profile.phone_number || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Joined</p>
                        <p className="text-foreground">
                          {new Date(profile.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Status</p>
                        <p className={isBanned ? "text-destructive font-medium" : "text-success font-medium"}>
                          {isBanned ? "Banned" : "Active"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBan.mutate({ userId: profile.user_id, ban: !isBanned })}
                      disabled={toggleBan.isPending}
                      className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
                        isBanned
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      }`}
                    >
                      {toggleBan.isPending ? "Updating..." : isBanned ? "Unban User" : "Ban User"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
