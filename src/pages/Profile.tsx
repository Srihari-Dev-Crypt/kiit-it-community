import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Settings, 
  Shield, 
  LogOut,
  Loader2,
  Save
} from "lucide-react";
import { Link } from "react-router-dom";

const profileSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
  is_anonymous_default: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      is_anonymous_default: profile?.is_anonymous_default ?? true,
    },
  });

  const isAnonymousDefault = watch('is_anonymous_default');

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileForm) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: data.display_name,
          bio: data.bio,
          is_anonymous_default: data.is_anonymous_default,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-4">Sign in to view your profile</h2>
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
        <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
          <User className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {profile?.display_name || 'Anonymous User'}
          </h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1 gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex-1 gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit((data) => updateProfile.mutate(data))} className="space-y-6">
              <div className="p-6 rounded-xl glass border border-border/50 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    placeholder="How should we call you?"
                    {...register("display_name")}
                  />
                  {errors.display_name && (
                    <p className="text-sm text-destructive">{errors.display_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    className="resize-none"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                variant="gradient" 
                className="w-full gap-2"
                disabled={!isDirty || updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          )}
        </TabsContent>

        <TabsContent value="privacy">
          <div className="p-6 rounded-xl glass border border-border/50 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Default to Anonymous</div>
                <div className="text-sm text-muted-foreground">
                  New posts will be anonymous by default
                </div>
              </div>
              <Switch
                checked={isAnonymousDefault}
                onCheckedChange={(checked) => {
                  setValue('is_anonymous_default', checked, { shouldDirty: true });
                }}
              />
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-medium mb-2">Privacy Information</h3>
              <p className="text-sm text-muted-foreground">
                Your identity is protected on all anonymous posts. Only you can see 
                which posts belong to you. Moderators cannot see your identity on 
                anonymous posts.
              </p>
            </div>
          </div>

          <Button 
            type="button" 
            variant="gradient" 
            className="w-full gap-2 mt-4"
            disabled={!isDirty || updateProfile.isPending}
            onClick={handleSubmit((data) => updateProfile.mutate(data))}
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-4">
            <div className="p-6 rounded-xl glass border border-border/50">
              <h3 className="font-medium mb-4">Account</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="destructive" 
              className="w-full gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
