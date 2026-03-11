import { Link } from "react-router-dom";
import {
  MessageSquare, HelpCircle, Users, Shield, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PostCard } from "@/components/posts/PostCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const features = [
  {
    icon: MessageSquare,
    title: "Anonymous Confessions",
    description: "Share your thoughts freely without revealing your identity",
  },
  {
    icon: HelpCircle,
    title: "Student Q&A",
    description: "Get answers from peers and mark the best solutions",
  },
  {
    icon: Users,
    title: "Communities",
    description: "Join topic-based groups and connect with like-minded students",
  },
  {
    icon: Shield,
    title: "Safe Space",
    description: "AI-moderated content to ensure respectful discussions",
  },
];

export default function Index() {
  const { user } = useAuth();

  const { data: recentPosts } = useQuery({
    queryKey: ["recent-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts_public")
        .select(`*, communities (name, icon)`)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Subtle green accent blob */}
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal delay={0} direction="down" blur>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green-soft border border-primary/20 mb-8">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-foreground">Anonymous · Safe · Student-first</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} direction="up" blur scale>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] text-foreground">
                Got something on
                <br />your mind?{" "}
                <span className="gradient-text">KIIT IT</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="up" blur>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                The anonymous-first student community where you can express yourself freely,
                get answers, and connect with peers — without fear of judgment.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3} direction="up" blur>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {user ? (
                  <>
                    <Link to="/create">
                      <Button variant="gradient" size="xl" className="gap-2 group rounded-full">
                        Create a Post
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/confessions">
                      <Button variant="outline" size="xl" className="rounded-full">
                        Browse Confessions
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button variant="gradient" size="xl" className="gap-2 group rounded-full">
                        Get Started Free
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" size="xl" className="rounded-full">
                        Already have an account?
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-section border-t border-border">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" blur className="text-center mb-14">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Everything you need to <span className="gradient-text-primary">express yourself</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              A safe, supportive environment for students to share, learn, and grow together.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.1}>
            {features.map((feature) => (
              <StaggerItem key={feature.title} blur>
                <div className="group p-6 rounded-card bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-normal hover:-translate-y-1 h-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Recent Posts */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="py-section border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <ScrollReveal direction="left" blur>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-1">Recent Posts</h2>
                  <p className="text-muted-foreground text-sm">See what's happening in the community</p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" blur>
                <Link to="/confessions">
                  <Button variant="ghost" size="sm" className="gap-1.5 group text-sm">
                    View all
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </ScrollReveal>
            </div>

            <StaggerContainer className="grid gap-3" staggerDelay={0.08}>
              {recentPosts.map((post) => (
                <StaggerItem key={post.id} blur>
                  <PostCard post={post} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-section border-t border-border">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid md:grid-cols-3 gap-4" staggerDelay={0.1}>
            {[
              { value: "100%", label: "Anonymous by Default" },
              { value: "24/7", label: "AI Moderation" },
              { value: "∞", label: "Topics to Explore" },
            ].map((stat) => (
              <StaggerItem key={stat.label} blur>
                <div className="p-6 rounded-card bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-normal hover:-translate-y-1 group text-center">
                  <div className="text-3xl font-extrabold gradient-text mb-1 inline-block font-display">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-section border-t border-border">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" blur scale>
            <div className="max-w-2xl mx-auto text-center p-8 md:p-10 rounded-2xl bg-card border border-border shadow-card">
              <h2 className="font-display text-xl md:text-3xl font-bold mb-3">
                Ready to share what's on your mind?
              </h2>
              <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
                Join our community of students supporting each other through honest, open conversations.
              </p>
              {user ? (
                <Link to="/create">
                  <Button variant="gradient" size="lg" className="gap-2 group rounded-full">
                    Create Your First Post
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button variant="gradient" size="lg" className="gap-2 group rounded-full">
                    Join KIIT IT Now
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
