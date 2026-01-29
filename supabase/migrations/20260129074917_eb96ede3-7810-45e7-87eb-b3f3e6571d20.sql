-- Create a secure view that hides user_id for anonymous posts
-- This view will be used by the application instead of directly querying the posts table

CREATE OR REPLACE VIEW public.posts_public
WITH (security_invoker=on) AS
SELECT 
  id,
  -- Only show user_id for non-anonymous posts, hide for anonymous ones
  CASE 
    WHEN identity_type = 'anonymous' THEN NULL 
    ELSE user_id 
  END AS user_id,
  community_id,
  title,
  content,
  post_type,
  identity_type,
  pseudonym,
  upvotes,
  downvotes,
  comment_count,
  is_pinned,
  is_demo,
  created_at,
  updated_at
FROM public.posts;

-- Drop the existing public SELECT policy on posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;

-- Create a new SELECT policy that only allows:
-- 1. Users to see their own posts (full access including user_id)
-- 2. Everyone can read via the posts_public view (which masks user_id for anonymous posts)
CREATE POLICY "Users can view own posts directly" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Grant select on the view to authenticated and anon roles
GRANT SELECT ON public.posts_public TO authenticated;
GRANT SELECT ON public.posts_public TO anon;