import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


export const metadata: Metadata = {
  title: "ReviveFlow War Room",
  description: "Autonomous Multi-Agent Payment Recovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 font-sans">
        {/* Load Razorpay SDK globally */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        {children}
      </body>
    </html>
  );
}