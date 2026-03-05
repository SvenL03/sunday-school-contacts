import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sunday School Contacts",
  description: "Import contacts from Excel into iPhone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <header className="bg-white border-b border-blue-100 shadow-sm">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                ✝
              </div>
              <div>
                <h1 className="text-lg font-semibold text-blue-900 leading-tight">
                  Sunday School Contacts
                </h1>
                <p className="text-xs text-blue-400">
                  Import your class contacts into iPhone
                </p>
              </div>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
          <footer className="text-center text-xs text-blue-300 pb-8">
            All processing happens in your browser — nothing is uploaded.
          </footer>
        </div>
      </body>
    </html>
  );
}
