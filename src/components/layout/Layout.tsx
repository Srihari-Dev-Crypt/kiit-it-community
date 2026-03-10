import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-5s' }} />
      </div>

      <Navbar />

      <main className="relative z-10 pt-16 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      {!isAuthPage && <MobileNav />}
    </div>
  );
}
