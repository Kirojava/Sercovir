import { Router, type IRouter } from "express";
import Parser from "rss-parser";
import https from "node:https";
import http from "node:http";
import zlib from "node:zlib";

const router: IRouter = Router();

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; Sercovir/1.0; +https://sercovir.com) Gecko/20100101 Firefox/122.0",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["dc:creator", "creator"],
    ],
  },
});

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceLabel: string;
  category: string;
  publishedAt: string;
  isBreaking: boolean;
}

interface PressReleaseItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceLabel: string;
  organization: string;
  publishedAt: string;
}

const NEWS_FEEDS = [
  { url: "https://feeds.reuters.com/reuters/worldNews", source: "reuters", label: "Reuters", category: "world" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "bbc", label: "BBC News", category: "world" },
  { url: "https://feeds.bbci.co.uk/news/rss.xml", source: "bbc", label: "BBC News", category: "general" },
  { url: "https://rss.cnn.com/rss/edition_world.rss", source: "cnn", label: "CNN", category: "world" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "aljazeera", label: "Al Jazeera", category: "world" },
  { url: "https://feeds.theguardian.com/theguardian/world/rss", source: "guardian", label: "The Guardian", category: "world" },
  { url: "https://feeds.skynews.com/feeds/rss/world.xml", source: "skynews", label: "Sky News", category: "world" },
  { url: "https://www.ft.com/?format=rss", source: "ft", label: "Financial Times", category: "finance" },
  { url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", source: "wsj", label: "Wall Street Journal", category: "world" },
  { url: "https://abcnews.go.com/abcnews/internationalheadlines", source: "abc", label: "ABC News", category: "international" },
  { url: "https://feeds.nbcnews.com/nbcnews/public/world", source: "nbc", label: "NBC News", category: "world" },
  { url: "https://www.npr.org/rss/rss.php?id=1004", source: "npr", label: "NPR News", category: "world" },
  { url: "https://rss.dw.com/xml/rss-en-world", source: "dw", label: "Deutsche Welle", category: "world" },
  { url: "https://www.france24.com/en/rss", source: "france24", label: "France 24", category: "world" },
];

const PRESS_RELEASE_FEEDS = [
  {
    url: "https://www.foreignaffairs.com/rss.xml",
    source: "foreignaffairs",
    label: "Foreign Affairs",
    org: "Council on Foreign Relations",
  },
  {
    url: "https://rss.politico.com/politics-news.xml",
    source: "politico",
    label: "POLITICO",
    org: "POLITICO",
  },
  {
    url: "https://rss.politico.com/congress.xml",
    source: "politico",
    label: "POLITICO Congress",
    org: "POLITICO",
  },
  {
    url: "https://feeds.skynews.com/feeds/rss/politics.xml",
    source: "skynews",
    label: "Sky News Politics",
    org: "Sky News",
  },
  {
    url: "https://feeds.theguardian.com/theguardian/politics/rss",
    source: "guardian",
    label: "The Guardian",
    org: "The Guardian",
  },
  {
    url: "https://feeds.bbci.co.uk/news/politics/rss.xml",
    source: "bbc",
    label: "BBC Politics",
    org: "BBC News",
  },
  {
    url: "https://rss.dw.com/xml/rss-en-world",
    source: "dw",
    label: "Deutsche Welle",
    org: "Deutsche Welle",
  },
  {
    url: "https://www.france24.com/en/politics/rss",
    source: "france24",
    label: "France 24 Politics",
    org: "France 24",
  },
  {
    url: "https://feeds.reuters.com/reuters/politicsNews",
    source: "reuters",
    label: "Reuters Politics",
    org: "Reuters",
  },
];

async function fetchUrlWithGunzip(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const req = protocol.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Sercovir/1.0; +https://sercovir.com)",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
          "Accept-Encoding": "gzip, deflate",
        },
        timeout: 10000,
      },
      (res) => {
        const encoding = res.headers["content-encoding"] || "";
        let stream: NodeJS.ReadableStream = res;

        if (encoding === "gzip") {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === "deflate") {
          stream = res.pipe(zlib.createInflate());
        } else if (encoding === "br") {
          stream = res.pipe(zlib.createBrotliDecompress());
        }

        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        stream.on("error", reject);
      },
    );
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function fetchFeed(feedInfo: typeof NEWS_FEEDS[0]): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedInfo.url);
    return (feed.items || []).slice(0, 15).map((item, i) => ({
      id: `${feedInfo.source}-${i}-${Date.now()}`,
      title: item.title || "Untitled",
      summary: item.contentSnippet || item.content || item.summary || "",
      link: item.link || "",
      source: feedInfo.source,
      sourceLabel: feedInfo.label,
      category: feedInfo.category,
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      isBreaking: false,
    }));
  } catch {
    return [];
  }
}

async function fetchPressFeed(feedInfo: typeof PRESS_RELEASE_FEEDS[0]): Promise<PressReleaseItem[]> {
  try {
    let feed;
    try {
      feed = await parser.parseURL(feedInfo.url);
    } catch {
      const xml = await fetchUrlWithGunzip(feedInfo.url);
      feed = await parser.parseString(xml);
    }
    return (feed.items || []).slice(0, 12).map((item, i) => ({
      id: `${feedInfo.source}-pr-${i}-${Date.now()}`,
      title: item.title || "Untitled",
      summary: item.contentSnippet || item.content || item.summary || "",
      link: item.link || "",
      source: feedInfo.source,
      sourceLabel: feedInfo.label,
      organization: feedInfo.org,
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

let newsCache: NewsItem[] = [];
let pressCache: PressReleaseItem[] = [];
let newsCacheTime = 0;
let pressCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function refreshNews(): Promise<NewsItem[]> {
  const now = Date.now();
  if (newsCache.length > 0 && now - newsCacheTime < CACHE_TTL) return newsCache;

  const results = await Promise.allSettled(NEWS_FEEDS.map(fetchFeed));
  const allItems: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allItems.push(...r.value);
  }

  allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const deduped = allItems.filter((item, idx) => {
    const t = item.title.toLowerCase().slice(0, 60);
    return allItems.findIndex(x => x.title.toLowerCase().slice(0, 60) === t) === idx;
  });

  newsCache = deduped;
  newsCacheTime = now;
  return deduped;
}

async function refreshPressReleases(): Promise<PressReleaseItem[]> {
  const now = Date.now();
  if (pressCache.length > 0 && now - pressCacheTime < CACHE_TTL) return pressCache;

  const results = await Promise.allSettled(PRESS_RELEASE_FEEDS.map(fetchPressFeed));
  const allItems: PressReleaseItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allItems.push(...r.value);
  }

  allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  pressCache = allItems;
  pressCacheTime = now;
  return allItems;
}

router.get("/live-feed", async (req, res): Promise<void> => {
  const source = req.query.source as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 60, 200);
  const items = await refreshNews();
  const filtered = source ? items.filter(x => x.source === source) : items;
  res.json(filtered.slice(0, limit));
});

router.get("/press-releases", async (req, res): Promise<void> => {
  const org = req.query.org as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 60, 100);
  const items = await refreshPressReleases();
  const filtered = org ? items.filter(x => x.source === org) : items;
  res.json(filtered.slice(0, limit));
});

router.get("/live-feed/sources", (_req, res): Promise<void> => {
  const unique = new Map<string, { id: string; label: string; category: string }>();
  for (const f of NEWS_FEEDS) {
    if (!unique.has(f.source)) unique.set(f.source, { id: f.source, label: f.label, category: f.category });
  }
  res.json(Array.from(unique.values()));
  return Promise.resolve();
});

export default router;
