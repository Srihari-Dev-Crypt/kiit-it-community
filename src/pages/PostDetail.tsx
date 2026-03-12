import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useVote } from "@/hooks/useVote";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CommentCard } from "@/components/comments/CommentCard";
import { ShareMenu } from "@/components/posts/ShareMenu";
import { cn } from "@/lib/utils";
import {
  ArrowUp, ArrowDown, ArrowLeft, MessageCircle,
  Eye, EyeOff, HelpCircle, MessageSquare, Lightbulb, Megaphone,
  Loader2, Send,
} from "lucide-react";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  is_anonymous: z.boolean(),
});
type CommentForm = z.infer<typeof commentSchema>;

const postTypeConfig = {
  confession: { icon: EyeOff, label: "Confession", color: "bg-primary/10 text-foreground" },
  question: { icon: HelpCircle, label: "Question", color: "bg-blue-50 text-blue-700" },
  rant: { icon: Megaphone, label: "Rant", color: "bg-red-50 text-red-700" },
  advice: { icon: Lightbulb, label: "Advice", color: "bg-amber-50 text-amber-700" },
  discussion: { icon: MessageSquare, label: "Discussion", color: "bg-secondary text-muted-foreground" },
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { is_anonymous: true },
  });
  const isAnonymous = watch("is_anonymous");

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts_public").select("*, communities (name, icon)").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { vote, totalVotes, handleUpvote, handleDownvote, isVoting } = useVote({
    postId: id,
    initialUpvotes: post?.upvotes ?? 0,
    initialDownvotes: post?.downvotes ?? 0,
  });

  const createComment = useMutation({
    mutationFn: async (data: CommentForm) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("comments").insert({
        post_id: id, user_id: user.id, content: data.content,
        identity_type: data.is_anonymous ? "anonymous" : "named",
      });
      if (error) throw error;
      await supabase.rpc("increment_comment_count", { _post_id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      reset();
      toast({ title: "Comment posted!" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-6 w-24 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-40 w-full mb-6" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Post not found</h2>
        <Link to="/"><Button variant="gradient" className="rounded-full">Go Home</Button></Link>
      </div>
    );
  }

  const typeConfig = postTypeConfig[post.post_type as keyof typeof postTypeConfig];
  const TypeIcon = typeConfig?.icon || MessageSquare;
  const displayName = post.identity_type === "anonymous" ? "Anonymous" : post.identity_type === "pseudonymous" ? post.pseudonym || "Anonymous" : "User";

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />Back to feed
      </Link>

      {/* Post */}
      <article className="p-5 rounded-card bg-card border border-border shadow-card mb-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-0.5">
            <Button variant="ghost" size="icon" className={cn("h-9 w-9 rounded-lg", vote === 1 && "text-primary bg-primary/10")} onClick={handleUpvote} disabled={isVoting}>
              {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </Button>
            <span className={cn("text-base font-bold tabular-nums", totalVotes > 0 && "text-primary", totalVotes < 0 && "text-destructive")}>{totalVotes}</span>
            <Button variant="ghost" size="icon" className={cn("h-9 w-9 rounded-lg", vote === -1 && "text-destructive bg-destructive/10")} onClick={handleDownvote} disabled={isVoting}>
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <Badge variant="outline" className={cn("gap-1 border-0 text-xs", typeConfig?.color)}>
                <TypeIcon className="h-3 w-3" />{typeConfig?.label}
              </Badge>
              {post.communities && <span className="text-muted-foreground">{post.communities.icon} {post.communities.name}</span>}
              <span className="text-muted-foreground/50">·</span>
              <span className="text-muted-foreground flex items-center gap-1">
                {post.identity_type === "anonymous" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{displayName}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>

            <h1 className="font-display text-xl font-bold mb-4">{post.title}</h1>
            <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mb-5">{post.content}</p>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="h-3.5 w-3.5" />{post.comment_count ?? 0} Comments
              </span>
              <ShareMenu postId={post.id} title={post.title} />
            </div>
          </div>
        </div>
      </article>

      {/* Comment Form */}
      {user ? (
        <div className="p-5 rounded-card bg-card border border-border mb-6">
          <h3 className="font-semibold text-sm mb-3">Add a Comment</h3>
          <form onSubmit={handleSubmit((data) => createComment.mutate(data))} className="space-y-3">
            <Textarea placeholder="Share your thoughts..." className="min-h-[80px] resize-none" {...register("content")} />
            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch id="anonymous" checked={isAnonymous} onCheckedChange={(v) => setValue("is_anonymous", v)} />
                <Label htmlFor="anonymous" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {isAnonymous ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {isAnonymous ? "Anonymous" : "Show identity"}
                </Label>
              </div>
              <Button type="submit" variant="gradient" size="sm" disabled={createComment.isPending} className="gap-1.5 rounded-full">
                {createComment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Post
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-5 rounded-card bg-card border border-border mb-6 text-center">
          <p className="text-muted-foreground text-sm mb-3">Sign in to comment</p>
          <Link to="/login"><Button variant="gradient" size="sm" className="rounded-full">Sign In</Button></Link>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Comments ({comments?.length ?? 0})</h3>
        {commentsLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => <CommentCard key={comment.id} comment={comment} postId={id!} />)
        ) : (
          <div className="p-8 rounded-card bg-card border border-border text-center">
            <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No comments yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}
