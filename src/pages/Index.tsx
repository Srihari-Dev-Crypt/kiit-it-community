import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  HelpCircle, 
  Users, 
  Shield, 
  ThumbsUp,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PostCard } from "@/components/posts/PostCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    icon: MessageSquare,
    title: "Anonymous Confessions",
    description: "Share your thoughts freely without revealing your identity",
    gradient: "from-primary to-purple-400",
  },
  {
    icon: HelpCircle,
    title: "Student Q&A",
    description: "Get answers from peers and mark the best solutions",
    gradient: "from-accent to-cyan-400",
  },
  {
    icon: Users,
    title: "Communities",
    description: "Join topic-based groups and connect with like-minded students",
    gradient: "from-pink-500 to-primary",
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
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/50 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Anonymous. Safe. Student-first.</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Got something on your mind?{" "}
              <span className="gradient-text">KIIT IT.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The anonymous-first student community where you can express yourself freely, 
              get answers to your questions, and connect with peers — all without fear of judgment.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link to="/create">
                    <Button variant="gradient" size="xl" className="gap-2">
                      Create a Post
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/confessions">
                    <Button variant="outline" size="xl">
                      Browse Confessions
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup">
                    <Button variant="gradient" size="xl" className="gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="xl">
                      Already have an account?
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text-primary">express yourself</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              KIIT IT provides a safe, supportive environment for students to share, learn, and grow together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-6 rounded-xl glass border border-border/50 hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="py-20 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Recent Posts</h2>
                <p className="text-muted-foreground">See what's happening in the community</p>
              </div>
              <Link to="/confessions">
                <Button variant="ghost" className="gap-2">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-xl glass border border-border/50">
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <div className="text-muted-foreground">Anonymous by Default</div>
            </div>
            <div className="p-8 rounded-xl glass border border-border/50">
              <div className="text-4xl font-bold gradient-text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">AI Moderation</div>
            </div>
            <div className="p-8 rounded-xl glass border border-border/50">
              <div className="text-4xl font-bold gradient-text mb-2">∞</div>
              <div className="text-muted-foreground">Topics to Explore</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-2xl gradient-border glass">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Ready to share what's on your mind?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join our community of students supporting each other through honest, open conversations.
            </p>
            {user ? (
              <Link to="/create">
                <Button variant="gradient" size="xl" className="gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Create Your First Post
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button variant="gradient" size="xl" className="gap-2">
                  Join KIIT IT Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
