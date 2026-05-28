import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luminary",
  description: "个人娱乐资源管理系统",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
