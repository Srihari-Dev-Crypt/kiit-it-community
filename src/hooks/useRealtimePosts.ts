import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to real-time changes on the posts table.
 * Invalidates feed queries so all users see new/updated posts.
 */
export function useRealtimePosts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["recent-posts"] });
          queryClient.invalidateQueries({ queryKey: ["posts"] });
          queryClient.invalidateQueries({ queryKey: ["confessions"], exact: false });
          queryClient.invalidateQueries({ queryKey: ["questions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
