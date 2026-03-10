import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  HelpCircle,
  Users,
  PenSquare,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  FileText,
  Bot
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/confessions", icon: MessageSquare, label: "Confessions" },
  { path: "/questions", icon: HelpCircle, label: "Q&A" },
  { path: "/communities", icon: Users, label: "Communities" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoImage} alt="KIIT IT Logo" className="h-12 -my-1 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_hsl(265_80%_58%/0.5)]" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-muted/40 rounded-full px-1.5 py-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 rounded-full transition-all duration-200 text-sm font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                <Link to="/create">
                  <Button variant="gradient" size="sm" className="hidden sm:flex gap-2 rounded-full shadow-md shadow-primary/20">
                    <PenSquare className="h-4 w-4" />
                    Create
                  </Button>
                </Link>
                <Link to="/notifications">
                  <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary pulse-dot" />
                  </Button>
                </Link>
                <Link to="/ai-chat">
                  <Button variant="ghost" size="icon" title="AI Chat" className="rounded-full h-9 w-9">
                    <Bot className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/my-posts">
                  <Button variant="ghost" size="icon" title="My Posts" className="rounded-full h-9 w-9 hidden sm:flex">
                    <FileText className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="hidden md:flex rounded-full h-9 w-9 hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-full text-sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="gradient" size="sm" className="rounded-full shadow-md shadow-primary/20 text-sm">
                    Sign up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40 fade-in">
            <div className="flex flex-col gap-1">
              {user && (
                <>
                  <Link to="/ai-chat" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg h-11 text-sm">
                      <Bot className="h-4 w-4" />
                      AI Chat
                    </Button>
                  </Link>
                  <Link to="/my-posts" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg h-11 text-sm">
                      <FileText className="h-4 w-4" />
                      My Posts
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 rounded-lg h-11 text-sm"
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
