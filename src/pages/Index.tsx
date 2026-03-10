import { Link } from "react-router-dom";
import {
  MessageSquare,
  HelpCircle,
  Users,
  Shield,
  ThumbsUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PostCard } from "@/components/posts/PostCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { FloatingParticles } from "@/components/ui/floating-particles";

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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/12 rounded-full blur-[100px] animate-float" />
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-primary/6 rounded-full blur-[80px] animate-float" style={{ animationDelay: "-5s" }} />
          <FloatingParticles count={15} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,hsl(var(--background))_70%)]" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal delay={0} direction="down" blur>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-border/40 mb-8">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse-scale" />
                <span className="text-xs font-medium text-muted-foreground">Anonymous · Safe · Student-first</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} direction="up" blur scale>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
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
                      <Button variant="gradient" size="xl" className="gap-2 group rounded-full shadow-lg shadow-primary/25">
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
                      <Button variant="gradient" size="xl" className="gap-2 group rounded-full shadow-lg shadow-primary/25">
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
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" blur className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Everything you need to <span className="gradient-text-primary">express yourself</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              A safe, supportive environment for students to share, learn, and grow together.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.1}>
            {features.map((feature) => (
              <StaggerItem key={feature.title} blur>
                <div className="group p-5 rounded-xl bg-card/50 border border-border/40 hover:border-primary/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 h-full">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
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
        <section className="py-20 border-t border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <ScrollReveal direction="left" blur>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1">Recent Posts</h2>
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
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid md:grid-cols-3 gap-4" staggerDelay={0.1}>
            {[
              { value: "100%", label: "Anonymous by Default" },
              { value: "24/7", label: "AI Moderation" },
              { value: "∞", label: "Topics to Explore" },
            ].map((stat) => (
              <StaggerItem key={stat.label} blur>
                <div className="p-6 rounded-xl bg-card/50 border border-border/40 hover:border-primary/25 transition-all duration-300 hover:-translate-y-1 group text-center">
                  <div className="text-3xl font-extrabold gradient-text mb-1 inline-block">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" blur scale>
            <div className="max-w-2xl mx-auto text-center p-8 md:p-10 rounded-2xl gradient-border glass">
              <h2 className="text-xl md:text-3xl font-bold mb-3">
                Ready to share what's on your mind?
              </h2>
              <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
                Join our community of students supporting each other through honest, open conversations.
              </p>
              {user ? (
                <Link to="/create">
                  <Button variant="gradient" size="lg" className="gap-2 group rounded-full shadow-lg shadow-primary/25">
                    <ThumbsUp className="h-4 w-4" />
                    Create Your First Post
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button variant="gradient" size="lg" className="gap-2 group rounded-full shadow-lg shadow-primary/25">
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
