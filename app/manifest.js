export default function manifest() {
  return {
    name: "KeyFlow · AI Typing Practice",
    short_name: "KeyFlow",
    description: "专业、智能、沉浸式的打字训练平台。",
    start_url: "/",
    display: "standalone",
    background_color: "#050507",
    theme_color: "#7772ff",
    orientation: "any",
    categories: ["education", "productivity"],
    lang: "zh-CN",
    icons: [
      {
        src: "/keyflow-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}

