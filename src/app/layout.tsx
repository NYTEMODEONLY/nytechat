import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "../lib/registry";

// Use Geist Mono for the retro terminal feel
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nytechat - retro terminal AI chat interface",
  description: "Jack in. Converse with nytemode AI through the void. Green phosphor glow. The system awaits your input.",
  metadataBase: new URL("https://nytechat.vercel.app"),
  applicationName: "nytechat",
  authors: [{ name: "nytemode Team", url: "https://nytemode.com" }],
  keywords: ["AI", "chat", "terminal", "retro", "cyberpunk", "terminal interface", "nytemode", "text-based UI", "green terminal", "amber terminal"],
  creator: "nytemode",
  publisher: "nytemode",
  category: "technology",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  icons: {
    icon: "/terminal-icon.svg",
    apple: "/terminal-icon.svg",
    shortcut: "/terminal-icon.svg",
  },
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NyteChat"
  },
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    url: "https://nytechat.vercel.app/",
    title: "nytechat - retro terminal AI chat interface",
    description: "Enter the grid. Command line access to neural networks. nytemode awaits in digital space.",
    siteName: "nytechat",
    images: [
      {
        url: "https://nytechat.vercel.app/nytechat-og.png", 
        width: 1200,
        height: 630,
        alt: "NyteChat Terminal Interface"
      }
    ]
  },
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "nytechat - retro terminal AI chat",
    description: "HACK THE PLANET. Dialogue with AI through phosphor glow. Type. Connect. Crash the system.",
    creator: "@nytemodeonly",
    images: ["https://nytechat.vercel.app/nytechat-og.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${geistMono.variable}`} suppressHydrationWarning>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
