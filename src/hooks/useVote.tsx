import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type VoteType = 1 | -1 | 0;

interface UseVoteOptions {
  postId?: string;
  commentId?: string;
  initialUpvotes: number;
  initialDownvotes: number;
}

export function useVote({ postId, commentId, initialUpvotes, initialDownvotes }: UseVoteOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [optimisticVote, setOptimisticVote] = useState<VoteType>(0);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(initialUpvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(initialDownvotes);

  // Fetch user's existing vote
  const { data: existingVote } = useQuery({
    queryKey: ["vote", postId, commentId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      let query = supabase
        .from("votes")
        .select("vote_type")
        .eq("user_id", user.id);
      
      if (postId) {
        query = query.eq("post_id", postId);
      }
      if (commentId) {
        query = query.eq("comment_id", commentId);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data?.vote_type as VoteType | null;
    },
    enabled: !!user,
  });

  // Sync existing vote to state
  useEffect(() => {
    if (existingVote !== undefined && existingVote !== null) {
      setOptimisticVote(existingVote as VoteType);
    }
  }, [existingVote]);

  // Update counts when initial values change
  useEffect(() => {
    setOptimisticUpvotes(initialUpvotes);
    setOptimisticDownvotes(initialDownvotes);
  }, [initialUpvotes, initialDownvotes]);

  const voteMutation = useMutation({
    mutationFn: async (newVote: VoteType) => {
      if (!user) throw new Error("Must be logged in to vote");

      const currentVote = optimisticVote;
      
      if (newVote === 0) {
        // Remove vote
        let query = supabase
          .from("votes")
          .delete()
          .eq("user_id", user.id);
        
        if (postId) {
          query = query.eq("post_id", postId);
        }
        if (commentId) {
          query = query.eq("comment_id", commentId);
        }
        
        const { error } = await query;
        if (error) throw error;

        // Update post/comment vote counts
        if (postId) {
          const updates: Record<string, number> = {};
          if (currentVote === 1) updates.upvotes = optimisticUpvotes - 1;
          if (currentVote === -1) updates.downvotes = optimisticDownvotes - 1;
          
          if (Object.keys(updates).length > 0) {
            await supabase.from("posts").update(updates).eq("id", postId);
          }
        }
      } else {
        // Check if vote exists
        let existsQuery = supabase
          .from("votes")
          .select("id")
          .eq("user_id", user.id);
        
        if (postId) existsQuery = existsQuery.eq("post_id", postId);
        if (commentId) existsQuery = existsQuery.eq("comment_id", commentId);
        
        const { data: existing } = await existsQuery.maybeSingle();

        if (existing) {
          // Update existing vote
          let updateQuery = supabase
            .from("votes")
            .update({ vote_type: newVote })
            .eq("user_id", user.id);
          
          if (postId) updateQuery = updateQuery.eq("post_id", postId);
          if (commentId) updateQuery = updateQuery.eq("comment_id", commentId);
          
          const { error } = await updateQuery;
          if (error) throw error;
        } else {
          // Insert new vote
          const { error } = await supabase.from("votes").insert({
            user_id: user.id,
            post_id: postId || null,
            comment_id: commentId || null,
            vote_type: newVote,
          });
          if (error) throw error;
        }

        // Update post/comment vote counts
        if (postId) {
          let newUpvotes = optimisticUpvotes;
          let newDownvotes = optimisticDownvotes;

          // Remove old vote effect
          if (currentVote === 1) newUpvotes--;
          if (currentVote === -1) newDownvotes--;

          // Add new vote effect
          if (newVote === 1) newUpvotes++;
          if (newVote === -1) newDownvotes++;

          await supabase
            .from("posts")
            .update({ upvotes: newUpvotes, downvotes: newDownvotes })
            .eq("id", postId);
        }
      }

      return newVote;
    },
    onMutate: async (newVote) => {
      const currentVote = optimisticVote;
      
      // Optimistically update
      setOptimisticVote(newVote);
      
      let newUpvotes = optimisticUpvotes;
      let newDownvotes = optimisticDownvotes;

      // Remove old vote effect
      if (currentVote === 1) newUpvotes--;
      if (currentVote === -1) newDownvotes--;

      // Add new vote effect
      if (newVote === 1) newUpvotes++;
      if (newVote === -1) newDownvotes++;

      setOptimisticUpvotes(newUpvotes);
      setOptimisticDownvotes(newDownvotes);

      return { currentVote, previousUpvotes: optimisticUpvotes, previousDownvotes: optimisticDownvotes };
    },
    onError: (error, _newVote, context) => {
      // Rollback on error
      if (context) {
        setOptimisticVote(context.currentVote);
        setOptimisticUpvotes(context.previousUpvotes);
        setOptimisticDownvotes(context.previousDownvotes);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["confessions"] });
    },
  });

  const handleVote = (direction: 1 | -1) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote",
        variant: "destructive",
      });
      return;
    }

    const newVote: VoteType = optimisticVote === direction ? 0 : direction;
    voteMutation.mutate(newVote);
  };

  return {
    vote: optimisticVote,
    upvotes: optimisticUpvotes,
    downvotes: optimisticDownvotes,
    totalVotes: optimisticUpvotes - optimisticDownvotes,
    handleUpvote: () => handleVote(1),
    handleDownvote: () => handleVote(-1),
    isVoting: voteMutation.isPending,
  };
}
