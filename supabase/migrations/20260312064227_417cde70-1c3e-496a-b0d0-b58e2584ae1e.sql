
-- Function to update post vote counts (security definer bypasses RLS)
CREATE OR REPLACE FUNCTION public.update_post_votes(
  _post_id uuid,
  _upvotes integer,
  _downvotes integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET upvotes = _upvotes, downvotes = _downvotes
  WHERE id = _post_id;
END;
$$;

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION public.update_comment_votes(
  _comment_id uuid,
  _upvotes integer,
  _downvotes integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.comments
  SET upvotes = _upvotes, downvotes = _downvotes
  WHERE id = _comment_id;
END;
$$;

-- Function to increment comment count on a post
CREATE OR REPLACE FUNCTION public.increment_comment_count(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET comment_count = COALESCE(comment_count, 0) + 1
  WHERE id = _post_id;
END;
$$;
