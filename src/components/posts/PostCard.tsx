import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp, ArrowDown, MessageCircle, MoreHorizontal,
  Eye, EyeOff, HelpCircle, MessageSquare, Lightbulb, Megaphone, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useVote } from "@/hooks/useVote";
import { ShareMenu } from "./ShareMenu";

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
  communities?: { name: string; icon: string | null } | null;
}

interface PostCardProps {
  post: Post;
}

const postTypeConfig = {
  confession: { icon: EyeOff, label: "Confession", color: "bg-primary/10 text-foreground" },
  question: { icon: HelpCircle, label: "Question", color: "bg-blue-50 text-blue-700" },
  rant: { icon: Megaphone, label: "Rant", color: "bg-red-50 text-red-700" },
  advice: { icon: Lightbulb, label: "Advice", color: "bg-amber-50 text-amber-700" },
  discussion: { icon: MessageSquare, label: "Discussion", color: "bg-secondary text-muted-foreground" },
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
    <article className="group p-4 md:p-5 rounded-card bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-normal">
      <div className="flex gap-3 md:gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg transition-all",
              vote === 1 && "text-primary bg-primary/10"
            )}
            onClick={handleUpvote}
            disabled={isVoting}
          >
            {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
          <span className={cn(
            "text-sm font-bold tabular-nums",
            totalVotes > 0 && "text-primary",
            totalVotes < 0 && "text-destructive"
          )}>
            {totalVotes}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg transition-all",
              vote === -1 && "text-destructive bg-destructive/10"
            )}
            onClick={handleDownvote}
            disabled={isVoting}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-xs">
            <Badge variant="outline" className={cn("gap-1 border-0 text-xs font-medium px-2 py-0.5", typeConfig.color)}>
              <TypeIcon className="h-3 w-3" />
              {typeConfig.label}
            </Badge>
            {post.communities && (
              <span className="text-muted-foreground">
                {post.communities.icon} {post.communities.name}
              </span>
            )}
            <span className="text-muted-foreground/50">·</span>
            <span className="text-muted-foreground flex items-center gap-1">
              {post.identity_type === 'anonymous' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {displayName}
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Title */}
          <Link to={`/post/${post.id}`}>
            <h3 className="text-base font-semibold mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          {/* Preview */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed">
            {post.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link to={`/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground h-8 text-xs rounded-lg">
                <MessageCircle className="h-3.5 w-3.5" />
                {post.comment_count ?? 0}
              </Button>
            </Link>
            <ShareMenu postId={post.id} title={post.title} />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground ml-auto rounded-lg">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
