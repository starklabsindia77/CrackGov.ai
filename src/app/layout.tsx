import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "CrackGov.ai - AI-Powered Exam Preparation",
  description: "Personalized AI study plans, mock tests, and doubt solving for government exams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

