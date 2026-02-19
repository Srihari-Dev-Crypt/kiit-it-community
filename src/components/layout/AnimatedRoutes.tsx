import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Confessions from "@/pages/Confessions";
import Questions from "@/pages/Questions";
import Communities from "@/pages/Communities";
import CreatePost from "@/pages/CreatePost";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import PostDetail from "@/pages/PostDetail";
import MyPosts from "@/pages/MyPosts";
import AIChatbot from "@/pages/AIChatbot";
import NotFound from "@/pages/NotFound";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/confessions" element={<PageTransition><ProtectedRoute><Confessions /></ProtectedRoute></PageTransition>} />
        <Route path="/questions" element={<PageTransition><ProtectedRoute><Questions /></ProtectedRoute></PageTransition>} />
        <Route path="/communities" element={<PageTransition><ProtectedRoute><Communities /></ProtectedRoute></PageTransition>} />
        <Route path="/create" element={<PageTransition><ProtectedRoute><CreatePost /></ProtectedRoute></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><ProtectedRoute><Notifications /></ProtectedRoute></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
        <Route path="/post/:id" element={<PageTransition><ProtectedRoute><PostDetail /></ProtectedRoute></PageTransition>} />
        <Route path="/my-posts" element={<PageTransition><ProtectedRoute><MyPosts /></ProtectedRoute></PageTransition>} />
        <Route path="/ai-chat" element={<PageTransition><ProtectedRoute><AIChatbot /></ProtectedRoute></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
