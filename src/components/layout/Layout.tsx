import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  // Global real-time subscriptions
  useRealtimeNotifications();
  useRealtimePosts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative pt-16 pb-20 md:pb-0">
        {children}
      </main>
      {!isAuthPage && <MobileNav />}
    </div>
  );
}
