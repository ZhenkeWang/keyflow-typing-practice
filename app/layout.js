import "./styles/tokens.css";
import "./globals.css";
import "./styles/saas.css";

export const metadata = {
  metadataBase: new URL("https://keyflow-typing-practice.barkzoombie.chatgpt.site"),
  title: {
    default: "KeyFlow · AI 个性化打字训练",
    template: "%s · KeyFlow",
  },
  description: "通过专业打字训练、成长数据与 AI 分析，提升速度、准确率、节奏和代码输入能力。",
  keywords: ["打字练习", "typing practice", "WPM", "AI typing coach", "代码打字", "KeyFlow"],
  applicationName: "KeyFlow",
  alternates: { canonical: "/" },
  openGraph: {
    title: "KeyFlow · Enter the flow",
    description: "专业打字训练、成长数据与 AI 个性化分析。",
    url: "/",
    siteName: "KeyFlow",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyFlow · AI Typing Practice",
    description: "Type faster. Think clearer. Enter the flow.",
  },
  icons: {
    icon: "/keyflow-icon.svg",
    apple: "/keyflow-icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#050507" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
