import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  Send,
  EyeOff,
  Eye,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content is too long"),
  post_type: z.enum(['confession', 'question', 'rant', 'advice', 'discussion']),
  community_id: z.string().optional(),
  is_anonymous: z.boolean(),
  pseudonym: z.string().max(30).optional(),
});

type PostForm = z.infer<typeof postSchema>;

const postTypes = [
  { value: 'confession', label: 'Confession', icon: EyeOff, description: 'Share something anonymously' },
  { value: 'question', label: 'Question', icon: HelpCircle, description: 'Ask for help or advice' },
  { value: 'discussion', label: 'Discussion', icon: MessageSquare, description: 'Start a conversation' },
  { value: 'advice', label: 'Advice', icon: Lightbulb, description: 'Share your wisdom' },
  { value: 'rant', label: 'Rant', icon: Megaphone, description: 'Let it all out' },
];

export default function CreatePost() {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') as PostForm['post_type'] || 'discussion';
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      post_type: defaultType,
      is_anonymous: true,
    },
  });

  const isAnonymous = watch('is_anonymous');
  const postType = watch('post_type');

  const { data: communities } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("communities").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: PostForm) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        title: data.title,
        content: data.content,
        post_type: data.post_type,
        community_id: data.community_id || null,
        identity_type: data.is_anonymous ? 'anonymous' : (data.pseudonym ? 'pseudonymous' : 'named'),
        pseudonym: data.is_anonymous ? null : data.pseudonym,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["confessions"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["recent-posts"] });
      toast({
        title: "Post created!",
        description: "Your post is now live.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in to create a post</h2>
        <Link to="/login">
          <Button variant="gradient">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create a Post</h1>
          <p className="text-muted-foreground text-sm">Share what's on your mind</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => createPost.mutate(data))} className="space-y-6">
        {/* Post Type Selection */}
        <div className="space-y-3">
          <Label>Post Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {postTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = postType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValue('post_type', type.value as PostForm['post_type'])}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Community Selection */}
        <div className="space-y-2">
          <Label htmlFor="community">Community (optional)</Label>
          <Select onValueChange={(value) => setValue('community_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a community" />
            </SelectTrigger>
            <SelectContent>
              {communities?.map((community) => (
                <SelectItem key={community.id} value={community.id}>
                  {community.icon} {community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Give your post a title..."
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="What's on your mind?"
            className="min-h-[200px] resize-none"
            {...register("content")}
          />
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="p-4 rounded-lg glass border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAnonymous ? (
                <EyeOff className="h-5 w-5 text-primary" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <div className="font-medium">Post Anonymously</div>
                <div className="text-sm text-muted-foreground">
                  Your identity will be hidden
                </div>
              </div>
            </div>
            <Switch
              checked={isAnonymous}
              onCheckedChange={(checked) => setValue('is_anonymous', checked)}
            />
          </div>

          {!isAnonymous && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Label htmlFor="pseudonym">Pseudonym (optional)</Label>
              <Input
                id="pseudonym"
                placeholder="Choose a display name for this post"
                {...register("pseudonym")}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use your account display name
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="gradient" 
          size="lg" 
          className="w-full gap-2"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5" />
              Publish Post
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
