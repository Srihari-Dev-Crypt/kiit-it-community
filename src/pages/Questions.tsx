import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PenSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Filter,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type SortOption = 'new' | 'unanswered' | 'top';

export default function Questions() {
  const [sortBy, setSortBy] = useState<SortOption>('new');
  const { user } = useAuth();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["questions", sortBy],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(`
          *,
          communities (name, icon)
        `)
        .eq("post_type", "question");

      if (sortBy === 'new') {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === 'unanswered') {
        query = query.eq("comment_count", 0).order("created_at", { ascending: false });
      } else {
        query = query.order("upvotes", { ascending: false });
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
  });

  const sortOptions: { value: SortOption; label: string; icon: typeof Clock }[] = [
    { value: 'new', label: 'Newest', icon: Clock },
    { value: 'unanswered', label: 'Unanswered', icon: HelpCircle },
    { value: 'top', label: 'Top', icon: TrendingUp },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text-primary">Student Q&A</span>
          </h1>
          <p className="text-muted-foreground">
            Ask questions, get answers from fellow students
          </p>
        </div>
        {user && (
          <Link to="/create?type=question">
            <Button variant="gradient" className="gap-2">
              <PenSquare className="h-4 w-4" />
              Ask a Question
            </Button>
          </Link>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={sortBy === option.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy(option.value)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl glass border border-border/50">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-8 w-48" />
                </div>
              </div>
            </div>
          ))
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to ask something!
            </p>
            {user ? (
              <Link to="/create?type=question">
                <Button variant="gradient" className="gap-2">
                  <PenSquare className="h-4 w-4" />
                  Ask a Question
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button variant="gradient">
                  Sign up to ask
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
