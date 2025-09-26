import axios from "axios";

export async function fetchPerplexityNews(symbol) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing PERPLEXITY_API_KEY in environment");
  }

  const systemPrompt =
    "You are a news extractor. Return ONLY valid JSON array of up to 5 recent articles about the given stock symbol. Each item must include title, url, source, publishedAt (ISO). No markdown, no extra text.";

  const userPrompt = `Return top recent news for ${symbol} stock.`;

  const response = await axios.post(
    "https://api.perplexity.ai/chat/completions",
    {
      model: "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  const content = response?.data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Unexpected Perplexity response format");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_e) {
    const match = content.match(/\[([\s\S]*?)\]/);
    if (!match) throw new Error("Failed to parse Perplexity JSON content");
    parsed = JSON.parse(`[${match[1]}]`);
  }

  const articles = (Array.isArray(parsed) ? parsed : [])
    .slice(0, 5)
    .map((a) => ({
      title: a.title ?? "",
      link: a.url ?? a.link ?? "",
      publisher: a.source ?? a.publisher ?? "",
      published: a.publishedAt ?? a.published ?? "",
    }))
    .filter((a) => a.title && a.link);

  return articles;
}

export const getNews = async (req, res) => {
  const { symbol } = req.params;

  try {
    const articles = await fetchPerplexityNews(symbol);
    if (!articles.length) {
      return res.status(404).json({ error: "No news found" });
    }
    res.json({ symbol, articles });
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.status(500).json({ error: "Failed to fetch news articles" });
  }
};


