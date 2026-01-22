-- Drop the foreign key constraint on posts.user_id to auth.users
-- This allows demo/system posts without real user accounts
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Add a is_demo column to identify demo posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Drop the foreign key constraint on comments.user_id to auth.users  
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;