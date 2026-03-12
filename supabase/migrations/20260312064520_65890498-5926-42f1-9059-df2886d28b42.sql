
-- Create a security definer function to notify post owners on new comments
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _post_owner_id uuid;
  _post_title text;
BEGIN
  -- Get the post owner
  SELECT user_id, title INTO _post_owner_id, _post_title
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Don't notify if commenting on own post
  IF _post_owner_id IS NOT NULL AND _post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_post_id, related_comment_id)
    VALUES (
      _post_owner_id,
      'comment',
      'New comment on your post',
      'Someone commented on "' || LEFT(_post_title, 60) || '"',
      NEW.post_id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create a security definer function to notify post owners on upvotes
CREATE OR REPLACE FUNCTION public.notify_on_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _post_owner_id uuid;
  _post_title text;
BEGIN
  -- Only notify on upvotes for posts (not comments, not downvotes)
  IF NEW.post_id IS NOT NULL AND NEW.vote_type = 1 THEN
    SELECT user_id, title INTO _post_owner_id, _post_title
    FROM public.posts
    WHERE id = NEW.post_id;

    -- Don't notify if voting on own post
    IF _post_owner_id IS NOT NULL AND _post_owner_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_post_id)
      VALUES (
        _post_owner_id,
        'upvote',
        'Your post was upvoted',
        'Someone upvoted "' || LEFT(_post_title, 60) || '"',
        NEW.post_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach triggers
CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();

CREATE TRIGGER on_new_vote
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_vote();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
