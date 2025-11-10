import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}