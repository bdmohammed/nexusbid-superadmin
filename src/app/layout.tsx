import "./globals.css";

import type { ReactNode } from "react";
import Providers from "@/providers";

export const metadata = {
  title: "TenderPro",
  description: "Tender Marketplace",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
