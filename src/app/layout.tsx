import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VLM Playground",
  description: "Vision Language Model Playground",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
