"use client";

import { useGlobalState } from "@/store/useGlobalStore";
import { useEffect } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useGlobalState((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(resolvedTheme: "light" | "dark") {
      root.classList.toggle("dark", resolvedTheme === "dark");
    }

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches ? "dark" : "light");

      function handleChange(e: MediaQueryListEvent) {
        applyTheme(e.matches ? "dark" : "light");
      }
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
