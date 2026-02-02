import type { Metadata } from "next";
import { Noto_Sans_TC, Geist_Mono } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "愛愛實驗室 | 性知識與情趣生活分享",
    template: "%s | 愛愛實驗室",
  },
  description:
    "愛愛實驗室提供專業的性知識、情趣用品評測與親密關係指南，讓你的愛愛生活更精彩。",
  keywords: ["性知識", "情趣用品", "愛愛", "親密關係", "性教育", "情趣生活"],
  authors: [{ name: "愛愛實驗室" }],
  creator: "愛愛實驗室",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://sexlab.com.tw",
    siteName: "愛愛實驗室",
    title: "愛愛實驗室 | 性知識與情趣生活分享",
    description:
      "愛愛實驗室提供專業的性知識、情趣用品評測與親密關係指南，讓你的愛愛生活更精彩。",
  },
  twitter: {
    card: "summary_large_image",
    title: "愛愛實驗室 | 性知識與情趣生活分享",
    description:
      "愛愛實驗室提供專業的性知識、情趣用品評測與親密關係指南，讓你的愛愛生活更精彩。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${notoSansTC.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
