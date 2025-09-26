import axios from "axios";

export async function fetchRedditPosts(symbol) {
  const query = encodeURIComponent(symbol);
  const url = `https://www.reddit.com/search.json?q=${query}&limit=10&sort=new`;
  const response = await axios.get(url, { timeout: 10000, headers: { "User-Agent": "sentiment-forecaster/1.0" } });
  const children = response?.data?.data?.children || [];
  return children
    .map((c) => c?.data)
    .filter(Boolean)
    .map((d) => ({
      id: d.id,
      title: d.title,
      url: d.url_overridden_by_dest || `https://www.reddit.com${d.permalink}`,
      author: d.author,
      subreddit: d.subreddit,
      score: d.score,
      num_comments: d.num_comments,
      created_utc: d.created_utc,
    }));
}

export const getReddit = async (req, res) => {
  const { symbol } = req.params;
  try {
    const posts = await fetchRedditPosts(symbol);
    res.json({ symbol, posts });
  } catch (error) {
    console.error("Error fetching Reddit posts:", error.message);
    res.status(500).json({ error: "Failed to fetch Reddit posts" });
  }
};


