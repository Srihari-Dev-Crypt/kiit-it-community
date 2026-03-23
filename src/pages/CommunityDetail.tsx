import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, PenSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("communities").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["community-posts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts_public")
        .select("*, communities (name, icon)")
        .eq("community_id", id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (communityLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-6 w-24 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Community not found</h2>
        <Link to="/communities"><Button variant="gradient" className="rounded-full">Browse Communities</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/communities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />Back to Communities
      </Link>

      <div className="p-5 rounded-card bg-card border border-border shadow-card mb-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
            {community.icon || '💬'}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold mb-1">{community.name}</h1>
            <p className="text-sm text-muted-foreground mb-3">{community.description || 'Welcome to the community'}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{community.member_count || 0} members</span>
            </div>
          </div>
        </div>
        {community.rules && community.rules.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-2">Community Rules</h3>
            <ul className="space-y-1">
              {community.rules.map((rule, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Posts</h2>
        {user && (
          <Link to="/create">
            <Button variant="gradient" size="sm" className="gap-2 rounded-full">
              <PenSquare className="h-3.5 w-3.5" />Post Here
            </Button>
          </Link>
        )}
      </div>

      {postsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-card" />)}
        </div>
      ) : posts && posts.length > 0 ? (
        <StaggerContainer className="space-y-3" staggerDelay={0.06}>
          {posts.map((post) => (
            <StaggerItem key={post.id} blur>
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <div className="text-center py-16 rounded-card bg-card border border-border">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
          <p className="text-muted-foreground text-sm">Be the first to post in this community!</p>
        </div>
      )}
    </div>
  );
}
