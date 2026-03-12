import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useUnreadCount() {
  const { user } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // fallback polling every 30s
  });

  return unreadCount;
}
