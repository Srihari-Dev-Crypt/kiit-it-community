import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PenSquare, TrendingUp, Clock, Flame, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

type SortOption = 'new' | 'hot' | 'top';

export default function Confessions() {
  const [sortBy, setSortBy] = useState<SortOption>('new');
  const { user } = useAuth();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["confessions", sortBy],
    queryFn: async () => {
      let query = supabase
        .from("posts_public")
        .select(`*, communities (name, icon)`)
        .eq("post_type", "confession");

      if (sortBy === 'new') {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("upvotes", { ascending: false });
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
  });

  const sortOptions: { value: SortOption; label: string; icon: typeof Clock }[] = [
    { value: 'new', label: 'New', icon: Clock },
    { value: 'hot', label: 'Hot', icon: Flame },
    { value: 'top', label: 'Top', icon: TrendingUp },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <ScrollReveal direction="left" blur>
          <div className="flex items-center gap-2.5 mb-1">
            <EyeOff className="h-5 w-5 text-primary" />
            <h1 className="font-display text-2xl font-bold">Confessions</h1>
          </div>
          <p className="text-muted-foreground text-sm">Share your thoughts anonymously. No judgment here.</p>
        </ScrollReveal>
        {user && (
          <ScrollReveal direction="right" blur delay={0.1}>
            <Link to="/create?type=confession">
              <Button variant="gradient" size="sm" className="gap-2 rounded-full">
                <PenSquare className="h-3.5 w-3.5" />
                Confess Something
              </Button>
            </Link>
          </ScrollReveal>
        )}
      </div>

      <ScrollReveal direction="up" blur delay={0.15}>
        <div className="flex items-center gap-1.5 mb-6">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy(option.value)}
                className="gap-1.5 rounded-full text-xs h-8"
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </ScrollReveal>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-card bg-card border border-border animate-pulse">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-7 w-32" />
                </div>
              </div>
            </div>
          ))
        ) : posts && posts.length > 0 ? (
          <StaggerContainer className="space-y-3" staggerDelay={0.06}>
            {posts.map((post) => (
              <StaggerItem key={post.id} blur>
                <PostCard post={post} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <ScrollReveal direction="up" blur scale>
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🤫</div>
              <h3 className="text-lg font-semibold mb-2">No confessions yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Be the first to share what's on your mind</p>
              {user ? (
                <Link to="/create?type=confession">
                  <Button variant="gradient" className="gap-2 rounded-full">
                    <PenSquare className="h-4 w-4" />Write a Confession
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button variant="gradient" className="rounded-full">Sign up to confess</Button>
                </Link>
              )}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
