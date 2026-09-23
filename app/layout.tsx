import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "COFIT-2020 Ganzenbord",
  description: "Beweegspel voor Fysio Harlingen — gooi, beweeg en doe de oefeningen.",
  applicationName: "COFIT",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "COFIT",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#d5e4c8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${nunito.className} h-full antialiased`}>
      <body className="h-full overflow-hidden">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
