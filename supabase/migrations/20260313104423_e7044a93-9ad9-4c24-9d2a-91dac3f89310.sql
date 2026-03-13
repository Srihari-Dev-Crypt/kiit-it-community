
-- Drop the restrictive SELECT policy that only shows own posts
DROP POLICY IF EXISTS "Users can view own posts directly" ON public.posts;

-- Allow all authenticated users to view all posts
CREATE POLICY "Authenticated users can view all posts"
ON public.posts
FOR SELECT
TO authenticated
USING (true);

-- Ensure posts table is in realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
END $$;
