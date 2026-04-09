import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  phone_number?: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_banned?: boolean;
}

interface SignUpProfileData {
  username?: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData?: SignUpProfileData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUsername: (username: string) => Promise<{ error: Error | null }>;
  updateAvatar: (file: File) => Promise<{ error: Error | null; url?: string }>;
  removeAvatar: () => Promise<{ error: Error | null }>;
  needsUsername: boolean;
  isBanned: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  const fetchProfile = async (authUser: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .single();

    if (!error && data) {
      const metadataUsername = typeof authUser.user_metadata?.username === "string" ? authUser.user_metadata.username.trim() : "";
      const metadataPhone = typeof authUser.user_metadata?.phone_number === "string" ? authUser.user_metadata.phone_number.trim() : "";
      const updateData: Partial<Profile> = {};

      if (!data.username && metadataUsername) {
        updateData.username = metadataUsername;
      }
      if (!data.phone_number && metadataPhone) {
        updateData.phone_number = metadataPhone;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase.from("profiles").update(updateData).eq("user_id", authUser.id);
      }

      const mergedProfile = { ...data, ...updateData };
      setProfile(mergedProfile);
      setNeedsUsername(!mergedProfile.username);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user);
          }, 0);
        } else {
          setProfile(null);
          setNeedsUsername(false);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, profileData?: SignUpProfileData) => {
    const redirectUrl = `${window.location.origin}/home`;
    const metadata: SignUpProfileData = {};
    if (profileData?.username?.trim()) metadata.username = profileData.username.trim();
    if (profileData?.phone_number?.trim()) metadata.phone_number = profileData.phone_number.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setNeedsUsername(false);
  };

  const updateUsername = async (username: string) => {
    if (!user) return { error: new Error("No user logged in") };

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("user_id", user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, username } : null));
      setNeedsUsername(false);
    }

    return { error: error as Error | null };
  };

  const updateAvatar = async (file: File) => {
    if (!user) return { error: new Error("No user logged in") };

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/avatar.${fileExt}`;

      // First, try to remove existing avatar files
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToRemove);
      }

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: new Error(uploadError.message || "Failed to upload image") };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        return { error: new Error(updateError.message || "Failed to update profile") };
      }

      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
      return { error: null, url: avatarUrl };
    } catch (err) {
      console.error("Avatar update error:", err);
      return { error: new Error("An unexpected error occurred while uploading") };
    }
  };

  const removeAvatar = async () => {
    if (!user) return { error: new Error("No user logged in") };

    // List files in user's folder
    const { data: files } = await supabase.storage
      .from("avatars")
      .list(user.id);

    if (files && files.length > 0) {
      const filesToRemove = files.map((f) => `${user.id}/${f.name}`);
      await supabase.storage.from("avatars").remove(filesToRemove);
    }

    // Update profile to remove avatar URL
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("user_id", user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : null));
    }

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateUsername,
        updateAvatar,
        removeAvatar,
        needsUsername,
        isBanned: profile?.is_banned ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
