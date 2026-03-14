import { createContext, useContext, useRef, useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";

type Direction = "forward" | "back";

const routeOrder = [
  "/", "/login", "/signup", "/confessions", "/questions",
  "/communities", "/create", "/notifications", "/profile",
  "/my-posts", "/ai-chat",
];

const NavigationDirectionContext = createContext<Direction>("forward");

export function NavigationDirectionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [direction, setDirection] = useState<Direction>("forward");
  const historyStack = useRef<string[]>([]);

  useEffect(() => {
    const stack = historyStack.current;
    const current = location.pathname;

    // If going back to the previous page in our stack
    if (stack.length >= 2 && stack[stack.length - 2] === current) {
      stack.pop();
      setDirection("back");
    } else {
      // Check route order for implicit direction
      const prevPath = stack[stack.length - 1];
      const prevIndex = routeOrder.indexOf(prevPath);
      const currIndex = routeOrder.indexOf(current);

      if (prevIndex !== -1 && currIndex !== -1 && currIndex < prevIndex) {
        setDirection("back");
      } else {
        setDirection("forward");
      }
      stack.push(current);
    }
  }, [location.pathname]);

  return (
    <NavigationDirectionContext.Provider value={direction}>
      {children}
    </NavigationDirectionContext.Provider>
  );
}

export function useNavigationDirection() {
  return useContext(NavigationDirectionContext);
}
