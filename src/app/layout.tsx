import type { Metadata } from "next";
import { Noto_Sans_TC, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { getSiteSetting } from "@/lib/db";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sexlab.com.tw";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: siteUrl,
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
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ga4Id = await getSiteSetting("ga4_measurement_id");

  return (
    <html lang="zh-TW">
      <body
        className={`${notoSansTC.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
