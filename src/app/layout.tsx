import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NBA OBE Portal - Outcome Based Education Management",
  description: "Comprehensive web application for managing educational outcomes in accordance with NBA guidelines",
  keywords: ["NBA", "OBE", "Education", "Accreditation", "Outcomes", "Assessment"],
  authors: [{ name: "NBA OBE Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "NBA OBE Portal",
    description: "Comprehensive outcome based education management system",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NBA OBE Portal",
    description: "Comprehensive outcome based education management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
