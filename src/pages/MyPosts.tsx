import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  EyeOff,
  HelpCircle,
  MessageSquare,
  Megaphone,
  Lightbulb,
  Plus,
  User,
} from "lucide-react";

type PostType = "all" | "confession" | "question" | "rant" | "advice" | "discussion";

const postTypeFilters = [
  { value: "all", label: "All Posts", icon: FileText },
  { value: "confession", label: "Confessions", icon: EyeOff },
  { value: "question", label: "Questions", icon: HelpCircle },
  { value: "discussion", label: "Discussions", icon: MessageSquare },
  { value: "rant", label: "Rants", icon: Megaphone },
  { value: "advice", label: "Advice", icon: Lightbulb },
];

export default function MyPosts() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<PostType>("all");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["my-posts", user?.id, activeFilter],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("posts")
        .select("*, communities (name, icon)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (activeFilter !== "all") {
        query = query.eq("post_type", activeFilter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-4">Sign in to view your posts</h2>
        <Link to="/login">
          <Button variant="gradient">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text-primary mb-2">My Posts</h1>
          <p className="text-muted-foreground">
            View and manage all your posts, confessions, and questions
          </p>
        </div>
        <Link to="/create">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as PostType)} className="mb-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
          {postTypeFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <TabsTrigger
                key={filter.value}
                value={filter.value}
                className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Icon className="h-4 w-4" />
                {filter.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-xl glass border border-border/50">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {activeFilter === "all" ? "No posts yet" : `No ${activeFilter}s yet`}
          </h3>
          <p className="text-muted-foreground mb-6">
            {activeFilter === "all"
              ? "Start sharing with the KIIT community!"
              : `You haven't posted any ${activeFilter}s yet.`}
          </p>
          <Link to="/create">
            <Button variant="gradient" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Post
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
