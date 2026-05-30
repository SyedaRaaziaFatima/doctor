import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Doctor Hub",
  description: "Healthcare consultation, appointment booking, and medical history management system."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
