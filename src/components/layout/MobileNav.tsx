import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, HelpCircle, Users, PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/confessions", icon: MessageSquare, label: "Confess" },
  { path: "/create", icon: PenSquare, label: "Post", isAction: true },
  { path: "/questions", icon: HelpCircle, label: "Q&A" },
  { path: "/communities", icon: Users, label: "Groups" },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.isAction) {
            return (
              <Link key={item.path} to={user ? item.path : "/login"} className="flex flex-col items-center -mt-4">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center shadow-md">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5 min-w-[56px]">
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
