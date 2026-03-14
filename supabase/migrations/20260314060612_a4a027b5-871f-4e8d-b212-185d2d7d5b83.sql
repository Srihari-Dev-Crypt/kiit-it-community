
-- Fix notify_on_vote to handle demo posts with fake user IDs
CREATE OR REPLACE FUNCTION public.notify_on_vote()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _post_owner_id uuid;
  _post_title text;
  _owner_exists boolean;
BEGIN
  IF NEW.post_id IS NOT NULL AND NEW.vote_type = 1 THEN
    SELECT user_id, title INTO _post_owner_id, _post_title
    FROM public.posts
    WHERE id = NEW.post_id;

    -- Check that the post owner actually exists in auth.users
    IF _post_owner_id IS NOT NULL AND _post_owner_id != NEW.user_id THEN
      SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = _post_owner_id) INTO _owner_exists;
      IF _owner_exists THEN
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
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix notify_on_comment to handle demo posts with fake user IDs
CREATE OR REPLACE FUNCTION public.notify_on_comment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _post_owner_id uuid;
  _post_title text;
  _owner_exists boolean;
BEGIN
  SELECT user_id, title INTO _post_owner_id, _post_title
  FROM public.posts
  WHERE id = NEW.post_id;

  IF _post_owner_id IS NOT NULL AND _post_owner_id != NEW.user_id THEN
    SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = _post_owner_id) INTO _owner_exists;
    IF _owner_exists THEN
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
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger to notify all users when a new post is created
CREATE OR REPLACE FUNCTION public.notify_on_new_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _author_name text;
  _user_record record;
BEGIN
  -- Skip demo posts
  IF NEW.is_demo = true THEN
    RETURN NEW;
  END IF;

  -- Get author display name
  IF NEW.identity_type = 'anonymous' THEN
    _author_name := 'Anonymous';
  ELSE
    SELECT display_name INTO _author_name
    FROM public.profiles
    WHERE user_id = NEW.user_id;
    _author_name := COALESCE(_author_name, 'Someone');
  END IF;

  -- Notify all other users
  FOR _user_record IN
    SELECT DISTINCT p.user_id FROM public.profiles p
    WHERE p.user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, related_post_id)
    VALUES (
      _user_record.user_id,
      'new_post',
      _author_name || ' just posted something',
      LEFT(NEW.title, 80),
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER on_new_post_notify
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_post();
