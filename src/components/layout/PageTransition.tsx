import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useNavigationDirection } from "@/hooks/useNavigationDirection";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const direction = useNavigationDirection();
  const slideX = direction === "forward" ? 60 : -60;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: slideX,
        scale: 0.97,
        filter: "blur(8px)",
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={{
        opacity: 0,
        x: -slideX,
        scale: 0.97,
        filter: "blur(8px)",
      }}
      transition={{
        type: "tween",
        ease: [0.25, 0.46, 0.45, 0.94],
        duration: 0.35,
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
