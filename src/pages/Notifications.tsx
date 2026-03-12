import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Bell, MessageCircle, ThumbsUp, CheckCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment': return MessageCircle;
      case 'upvote': return ThumbsUp;
      default: return Bell;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-4">Sign in to see notifications</h2>
        <Link to="/login"><Button variant="gradient" className="rounded-full">Sign In</Button></Link>
      </div>
    );
  }

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-xl font-bold mb-0.5">Notifications</h1>
          <p className="text-muted-foreground text-xs">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending} className="rounded-full text-xs h-8">
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-card bg-card border border-border">
              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-3/4" /><Skeleton className="h-2.5 w-20" /></div>
              </div>
            </div>
          ))
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n.id}
                className={cn(
                  "p-3.5 rounded-card border transition-all cursor-pointer",
                  n.is_read
                    ? "bg-card border-border hover:border-muted-foreground/20"
                    : "bg-primary/5 border-primary/20 hover:border-primary/30"
                )}
                onClick={() => { if (!n.is_read) markAsRead.mutate(n.id); }}
              >
                <div className="flex gap-3">
                  <div className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0",
                    n.is_read ? "bg-secondary" : "bg-primary/10"
                  )}>
                    <Icon className={cn("h-4 w-4", n.is_read ? "text-muted-foreground" : "text-primary")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.is_read && "font-medium")}>{n.title}</p>
                    {n.message && <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  </div>
                  {n.related_post_id && (
                    <Link to={`/post/${n.related_post_id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ArrowRight className="h-3.5 w-3.5" /></Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No notifications yet</h3>
            <p className="text-muted-foreground text-sm">When someone interacts with your posts, you'll see it here</p>
          </div>
        )}
      </div>
    </div>
  );
}
