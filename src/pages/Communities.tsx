import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowRight } from "lucide-react";

export default function Communities() {
  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("member_count", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Communities</span>
        </h1>
        <p className="text-muted-foreground">
          Join topic-based communities and connect with like-minded students
        </p>
      </div>

      {/* Communities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl glass border border-border/50">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-9 w-24" />
            </div>
          ))
        ) : communities && communities.length > 0 ? (
          communities.map((community) => (
            <div 
              key={community.id} 
              className="group p-6 rounded-xl glass border border-border/50 hover:border-primary/30 hover-lift transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                  {community.icon || '💬'}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{community.member_count || 0}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {community.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {community.description || 'Join the conversation'}
              </p>
              
              <Link to={`/community/${community.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  View Community
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-4">🏘️</div>
            <h3 className="text-xl font-semibold mb-2">No communities yet</h3>
            <p className="text-muted-foreground">
              Communities are being set up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
