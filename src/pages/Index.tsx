import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  HelpCircle, 
  Users, 
  Shield, 
  ThumbsUp,
  Sparkles,
  ArrowRight,
  Flame
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
    gradient: "from-primary to-orange-400",
  },
  {
    icon: HelpCircle,
    title: "Student Q&A",
    description: "Get answers from peers and mark the best solutions",
    gradient: "from-accent to-yellow-400",
  },
  {
    icon: Users,
    title: "Communities",
    description: "Join topic-based groups and connect with like-minded students",
    gradient: "from-orange-600 to-primary",
  },
  {
    icon: Shield,
    title: "Safe Space",
    description: "AI-moderated content to ensure respectful discussions",
    gradient: "from-success to-emerald-400",
  },
];

export default function Index() {
  const { user } = useAuth();

  const { data: recentPosts } = useQuery({
    queryKey: ["recent-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          communities (name, icon)
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-scale" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-scale" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-spin-slow" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <ScrollReveal delay={0} direction="down" blur>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/50 mb-8 hover:scale-105 transition-transform cursor-default">
                <Sparkles className="h-4 w-4 text-primary animate-pulse-scale" />
                <span className="text-sm text-muted-foreground">Anonymous. Safe. Student-first.</span>
              </div>
            </ScrollReveal>

            {/* Main Heading */}
            <ScrollReveal delay={0.1} direction="up" blur scale>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                Got something on your mind?{" "}
                <span className="gradient-text inline-flex items-center gap-2">
                  KIIT IT
                  <Flame className="h-10 w-10 md:h-14 md:w-14 text-primary animate-flame" />
                </span>
              </h1>
            </ScrollReveal>

            {/* Subtitle */}
            <ScrollReveal delay={0.2} direction="up" blur>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                The anonymous-first student community where you can express yourself freely, 
                get answers to your questions, and connect with peers — all without fear of judgment.
              </p>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal delay={0.3} direction="up" blur>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <>
                    <Link to="/create">
                      <Button variant="gradient" size="xl" className="gap-2 group shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
                        Create a Post
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/confessions">
                      <Button variant="outline" size="xl" className="hover:bg-muted transition-colors">
                        Browse Confessions
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button variant="gradient" size="xl" className="gap-2 group shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
                        Get Started Free
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" size="xl" className="hover:bg-muted transition-colors">
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

      {/* Features Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" blur className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text-primary">express yourself</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              KIIT IT provides a safe, supportive environment for students to share, learn, and grow together.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.15}>
            {features.map((feature) => (
              <StaggerItem key={feature.title} blur>
                <div className="group p-6 rounded-xl glass border border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 h-full">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Recent Posts Section */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="py-20 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <ScrollReveal direction="left" blur>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Recent Posts</h2>
                  <p className="text-muted-foreground">See what's happening in the community</p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" blur>
                <Link to="/confessions">
                  <Button variant="ghost" className="gap-2 group">
                    View all
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </ScrollReveal>
            </div>

            <StaggerContainer className="grid gap-4" staggerDelay={0.1}>
              {recentPosts.map((post) => (
                <StaggerItem key={post.id} blur>
                  <PostCard post={post} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid md:grid-cols-3 gap-8 text-center" staggerDelay={0.15}>
            {[
              { value: "100%", label: "Anonymous by Default" },
              { value: "24/7", label: "AI Moderation" },
              { value: "∞", label: "Topics to Explore" },
            ].map((stat) => (
              <StaggerItem key={stat.label} blur>
                <div className="p-8 rounded-xl glass border border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 group">
                  <div className="text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform inline-block">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" blur scale>
            <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-2xl gradient-border glass hover:shadow-2xl hover:shadow-primary/20 transition-shadow duration-500">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                Ready to share what's on your mind?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join our community of students supporting each other through honest, open conversations.
              </p>
              {user ? (
                <Link to="/create">
                  <Button variant="gradient" size="xl" className="gap-2 group shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
                    <ThumbsUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Create Your First Post
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button variant="gradient" size="xl" className="gap-2 group shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
                    Join KIIT IT Now
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
