import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/components/AuthProvider";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frontend Interview Flashcards",
  description: "A fast, minimal flashcard app for frontend developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeRegistry>
          <ReactQueryProvider>
            <AuthProvider>
              <AppLayout>{children}</AppLayout>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
