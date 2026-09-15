import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import ToastContainer from "@/components/ui/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Palettiq",
  description: "A color design system created for UI/UX designers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ThemeProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-gray-50 dark:bg-zinc-900`}
      >
        <body className="min-h-full flex flex-col custom-scrollbar">
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
