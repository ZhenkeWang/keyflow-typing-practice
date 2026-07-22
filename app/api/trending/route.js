const FALLBACK = {
  news: [
    "城市公共空间正在变得更加开放与友好",
    "人工智能工具逐渐融入普通人的日常工作",
    "绿色出行和低碳生活成为越来越多人的选择",
    "年轻人开始重新发现阅读与线下交流的乐趣",
    "社区服务正在用数字技术解决生活中的小问题",
  ],
  hot: ["人工智能", "夏日旅行", "健康生活", "城市更新", "文化展览", "体育赛事", "数字创作"],
  tech: [
    "Developers are exploring smaller and more efficient language models",
    "Open source tools continue to reshape modern software workflows",
    "New interfaces are making complex technology easier to understand",
  ],
};

function clean(value = "") {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRss(xml) {
  return [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>/g)]
    .map((match) => clean(match[1]).replace(/\s+-\s+[^-]+$/, ""))
    .filter((item) => item.length > 8);
}

async function getNews(query = "") {
  const base = query ? `https://news.google.com/rss/search?q=${encodeURIComponent(query)}` : "https://news.google.com/rss";
  const url = `${base}${query ? "&" : "?"}hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 Keyflow typing practice" } });
  if (!response.ok) throw new Error("News source unavailable");
  return parseRss(await response.text());
}

async function getHotTopics() {
  const date = new Date(Date.now() - 172800000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/zh.wikipedia/all-access/${year}/${month}/${day}`;
  const response = await fetch(url, { headers: { "User-Agent": "Keyflow/1.0 (typing practice)" } });
  if (!response.ok) throw new Error("Trending source unavailable");
  const data = await response.json();
  const blocked = /^(首页|Main_Page|特殊:|Special:|Wikipedia:|维基百科:|Portal:)/i;
  return (data.items?.[0]?.articles || [])
    .map((item) => decodeURIComponent(item.article).replaceAll("_", " "))
    .filter((item) => !blocked.test(item) && !/^[0-9]+$/.test(item))
    .slice(0, 24);
}

async function getTech() {
  const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  if (!idsResponse.ok) throw new Error("Technology source unavailable");
  const ids = (await idsResponse.json()).slice(0, 20);
  const stories = await Promise.all(ids.map(async (id) => {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    return response.ok ? response.json() : null;
  }));
  return stories.map((item) => clean(item?.title)).filter(Boolean);
}

export async function GET(request) {
  const source = new URL(request.url).searchParams.get("source") || "news";
  let items = [];
  try {
    if (source === "hot") {
      try { items = await getHotTopics(); }
      catch { items = await getNews("热门 话题"); }
    }
    else if (source === "tech") items = await getTech();
    else items = await getNews();
  } catch {
    items = [];
  }

  if (items.length < 3) items = FALLBACK[source] || FALLBACK.news;
  return Response.json(
    { source, items: items.slice(0, 24), updatedAt: new Date().toISOString(), fallback: items === FALLBACK[source] },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } }
  );
}
