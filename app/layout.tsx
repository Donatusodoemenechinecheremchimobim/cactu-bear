import "./globals.css";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />
        <PageTransition>{children}</PageTransition>

        <div className="pointer-events-none fixed inset-0 opacity-[0.03] mix-blend-overlay bg-[url('/grain.png')]" />
      </body>
    </html>
  );
}
