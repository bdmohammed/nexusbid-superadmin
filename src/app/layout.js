import "./globals.css";

export const metadata = {
  title: "TenderPro",

  description: "Tender Marketplace",
};

export default function RootLayout({ children }) {
  console.log("RootLayout children:", children);
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
