import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "운동 메이트";
const SITE_DESCRIPTION =
  "세트 기반 운동 타이머 — 운동 시간, 휴식 시간, 세트 수를 자유롭게 설정하고 소리 알림으로 운동에만 집중하세요.";
const OG_IMAGE_URL =
  "https://health-mait.s3.ap-northeast-2.amazonaws.com/og-image.svg";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | 운동 타이머`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "운동 타이머",
    "인터벌 타이머",
    "복싱 타이머",
    "세트 타이머",
    "휴식 타이머",
    "운동 메이트",
    "workout timer",
    "interval timer",
    "HIIT timer",
    "tabata timer",
  ],
  authors: [{ name: "Health Mait" }],
  openGraph: {
    title: `${SITE_NAME} — 세트 기반 운동 타이머`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "운동 메이트 - 세트 기반 운동 타이머",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — 세트 기반 운동 타이머`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
