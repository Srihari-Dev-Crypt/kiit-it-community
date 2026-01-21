import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useVote } from "@/hooks/useVote";

interface Comment {
  id: string;
  content: string;
  identity_type: "anonymous" | "pseudonymous" | "named";
  pseudonym?: string | null;
  upvotes: number | null;
  downvotes: number | null;
  is_best_answer: boolean | null;
  created_at: string;
}

interface CommentCardProps {
  comment: Comment;
  postId: string;
}

export function CommentCard({ comment, postId }: CommentCardProps) {
  const { vote, totalVotes, handleUpvote, handleDownvote, isVoting } = useVote({
    commentId: comment.id,
    initialUpvotes: comment.upvotes ?? 0,
    initialDownvotes: comment.downvotes ?? 0,
  });

  const displayName =
    comment.identity_type === "anonymous"
      ? "Anonymous"
      : comment.identity_type === "pseudonymous"
      ? comment.pseudonym || "Anonymous"
      : "User";

  return (
    <div className={cn(
      "p-4 rounded-xl glass border transition-all",
      comment.is_best_answer 
        ? "border-success/50 bg-success/5" 
        : "border-border/50"
    )}>
      <div className="flex gap-3">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", vote === 1 && "text-primary bg-primary/20")}
            onClick={handleUpvote}
            disabled={isVoting}
          >
            {isVoting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
          <span className={cn(
            "text-xs font-semibold",
            totalVotes > 0 && "text-primary",
            totalVotes < 0 && "text-destructive"
          )}>
            {totalVotes}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", vote === -1 && "text-destructive bg-destructive/20")}
            onClick={handleDownvote}
            disabled={isVoting}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              {comment.identity_type === "anonymous" ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              {displayName}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_best_answer && (
              <Badge variant="outline" className="gap-1 border-success/50 text-success bg-success/10">
                <CheckCircle className="h-3 w-3" />
                Best Answer
              </Badge>
            )}
          </div>

          {/* Comment Content */}
          <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}
