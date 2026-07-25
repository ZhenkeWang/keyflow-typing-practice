import "./styles/tokens.css";
import "./globals.css";

export const metadata = {
  title: "Keyflow · 打字速度练习",
  description: "一个简洁、专注的在线打字速度测试工具。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
