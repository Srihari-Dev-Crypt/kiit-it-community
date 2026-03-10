import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowRight } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

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
      <ScrollReveal direction="down" blur className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Communities</h1>
        </div>
        <p className="text-muted-foreground text-sm">Join topic-based communities and connect with like-minded students</p>
      </ScrollReveal>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl bg-card/50 border border-border/40 animate-pulse">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-5 w-28 mb-2" />
              <Skeleton className="h-3 w-full mb-4" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : communities && communities.length > 0 ? (
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
          {communities.map((community) => (
            <StaggerItem key={community.id} blur>
              <div className="group p-5 rounded-xl bg-card/50 border border-border/40 hover:border-primary/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                    {community.icon || '💬'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{community.member_count || 0}</span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">
                  {community.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {community.description || 'Join the conversation'}
                </p>

                <Link to={`/community/${community.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-xs h-8 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                    View Community
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <ScrollReveal direction="up" blur scale>
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏘️</div>
            <h3 className="text-lg font-semibold mb-2">No communities yet</h3>
            <p className="text-muted-foreground text-sm">Communities are being set up!</p>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
