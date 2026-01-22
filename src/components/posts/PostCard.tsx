import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Eye,
  EyeOff,
  HelpCircle,
  MessageSquare,
  Lightbulb,
  Megaphone,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useVote } from "@/hooks/useVote";

interface Post {
  id: string;
  title: string;
  content: string;
  post_type: 'confession' | 'question' | 'rant' | 'advice' | 'discussion';
  identity_type: 'anonymous' | 'pseudonymous' | 'named';
  pseudonym?: string;
  upvotes: number | null;
  downvotes: number | null;
  comment_count: number | null;
  created_at: string;
  communities?: {
    name: string;
    icon: string | null;
  } | null;
}

interface PostCardProps {
  post: Post;
}

const postTypeConfig = {
  confession: { icon: EyeOff, label: "Confession", color: "bg-primary/20 text-primary" },
  question: { icon: HelpCircle, label: "Question", color: "bg-accent/20 text-accent" },
  rant: { icon: Megaphone, label: "Rant", color: "bg-destructive/20 text-destructive" },
  advice: { icon: Lightbulb, label: "Advice", color: "bg-warning/20 text-warning" },
  discussion: { icon: MessageSquare, label: "Discussion", color: "bg-muted text-foreground" },
};

export function PostCard({ post }: PostCardProps) {
  const { vote, totalVotes, handleUpvote, handleDownvote, isVoting } = useVote({
    postId: post.id,
    initialUpvotes: post.upvotes ?? 0,
    initialDownvotes: post.downvotes ?? 0,
  });

  const typeConfig = postTypeConfig[post.post_type];
  const TypeIcon = typeConfig.icon;

  const displayName = post.identity_type === 'anonymous' 
    ? 'Anonymous' 
    : post.identity_type === 'pseudonymous' 
      ? post.pseudonym || 'Anonymous'
      : 'User';

  return (
    <article className="group p-4 md:p-6 rounded-xl glass border border-border/50 hover:border-primary/30 transition-all duration-300">
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              vote === 1 && "text-primary bg-primary/20"
            )}
            onClick={handleUpvote}
            disabled={isVoting}
          >
            {isVoting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </Button>
          <span className={cn(
            "text-sm font-semibold",
            totalVotes > 0 && "text-primary",
            totalVotes < 0 && "text-destructive"
          )}>
            {totalVotes}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              vote === -1 && "text-destructive bg-destructive/20"
            )}
            onClick={handleDownvote}
            disabled={isVoting}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
            <Badge variant="outline" className={cn("gap-1 border-0", typeConfig.color)}>
              <TypeIcon className="h-3 w-3" />
              {typeConfig.label}
            </Badge>
            {post.communities && (
              <span className="text-muted-foreground">
                {post.communities.icon} {post.communities.name}
              </span>
            )}
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              {post.identity_type === 'anonymous' ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              {displayName}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Title */}
          <Link to={`/post/${post.id}`}>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {post.content}
          </p>

          <div className="flex items-center gap-4">
            <Link to={`/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-4 w-4" />
                {post.comment_count ?? 0} Comments
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground ml-auto">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
