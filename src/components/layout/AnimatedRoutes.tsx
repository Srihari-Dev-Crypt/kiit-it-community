import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
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
import NotFound from "@/pages/NotFound";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/confessions" element={<PageTransition><Confessions /></PageTransition>} />
        <Route path="/questions" element={<PageTransition><Questions /></PageTransition>} />
        <Route path="/communities" element={<PageTransition><Communities /></PageTransition>} />
        <Route path="/create" element={<PageTransition><CreatePost /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/post/:id" element={<PageTransition><PostDetail /></PageTransition>} />
        <Route path="/my-posts" element={<PageTransition><MyPosts /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
