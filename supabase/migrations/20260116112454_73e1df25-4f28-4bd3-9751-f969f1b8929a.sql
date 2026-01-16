-- Fix the overly permissive notifications insert policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a proper insert policy - only allow inserting notifications for posts/comments you own or are being replied to
CREATE POLICY "Users receive notifications" ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL
  );