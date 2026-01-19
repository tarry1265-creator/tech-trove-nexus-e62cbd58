import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UsernameModalProps {
  isOpen: boolean;
}

const UsernameModal = ({ isOpen }: UsernameModalProps) => {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUsername } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue.",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: "Username too short",
        description: "Username must be at least 3 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: "Invalid username",
        description: "Username can only contain letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await updateUsername(username.trim());
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes("unique")) {
        toast({
          title: "Username taken",
          description: "This username is already in use. Please try another.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Welcome!",
        description: "Your profile has been set up successfully.",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card rounded-3xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full brain-gradient-bg flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-primary-foreground">
                  person
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Welcome to BRAINHUB!
              </h2>
              <p className="text-muted-foreground">
                Choose a username to complete your profile
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-premium"
                  maxLength={20}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Letters, numbers, and underscores only. 3-20 characters.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-premium py-4 disabled:opacity-50"
              >
                {isSubmitting ? "Setting up..." : "Continue"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UsernameModal;
