import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '在线视频解析',
  description: '支持抖音、小红书、哔哩哔哩、微博、皮皮虾、汽水音乐等平台的视频解析工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}