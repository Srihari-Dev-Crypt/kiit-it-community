import { useState } from "react";
import { Check, Copy, Facebook, Mail, Share2, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareMenuProps {
  postId: string;
  title: string;
  className?: string;
  size?: "sm" | "default";
}

export function ShareMenu({ postId, title, className, size = "sm" }: ShareMenuProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const postUrl = `${window.location.origin}/post/${postId}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Post link copied to clipboard" });
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    } catch {
      toast({ variant: "destructive", title: "Failed to copy", description: "Could not copy link to clipboard" });
    }
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: copied ? Check : Copy,
      onClick: handleCopyLink,
      className: copied ? "text-primary" : "",
    },
    {
      name: "Twitter",
      icon: Twitter,
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
          "_blank",
          "noopener,noreferrer"
        );
        setOpen(false);
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer"
        );
        setOpen(false);
      },
    },
    {
      name: "Email",
      icon: Mail,
      onClick: () => {
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        setOpen(false);
      },
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={cn(
            "gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all group/btn",
            className
          )}
        >
          <Share2 className="h-4 w-4 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="flex flex-col gap-1">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                option.className
              )}
              onClick={option.onClick}
            >
              <option.icon className="h-4 w-4" />
              {option.name === "Copy Link" && copied ? "Copied!" : option.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
