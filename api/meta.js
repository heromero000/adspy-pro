// api/meta.js - Vercel Serverless Proxy for Meta Ad Library API
// Fixes CORS: browser calls /api/meta, this calls Meta server-side

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token, search, country, limit = 50, after } = req.body;

  if (!token) {
    return res.status(400).json({ error: "No Meta token provided" });
  }

  const AVAILABLE_FIELDS = [
    "id","page_id","page_name","ad_creative_bodies",
    "ad_creative_link_titles","ad_creative_link_descriptions",
    "ad_creative_link_urls","ad_delivery_start_time",
    "ad_delivery_stop_time","publisher_platforms","ad_snapshot_url"
  ].join(",");

  const params = new URLSearchParams({
    access_token: token,
    ad_type: "ALL",
    ad_active_status: "ACTIVE",
    limit: String(limit),
    fields: AVAILABLE_FIELDS,
  });

  if (search && search.trim()) params.set("search_terms", search.trim());
  if (country && country !== "All") {
    params.set("ad_reached_countries", JSON.stringify([country]));
  }
  if (after) params.set("after", after);

  try {
    const metaUrl = `https://graph.facebook.com/v21.0/ads_archive?${params.toString()}`;
    const metaRes = await fetch(metaUrl, {
      headers: { "User-Agent": "AdSpyPro/1.0" },
    });
    const data = await metaRes.json();

    if (data.error) {
      const hint = getErrorHint(data.error.code);
      return res.status(400).json({ error: data.error.message, hint, code: data.error.code });
    }

    return res.status(200).json({
      ads: data.data || [],
      nextCursor: data.paging?.cursors?.after || null,
      total: (data.data || []).length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}

function getErrorHint(code) {
  const hints = {
    190: "Token expired. Generate a new token at developers.facebook.com",
    200: "Permission denied. Make sure your app has Ad Library API access.",
    100: "Invalid parameter. Check your search terms or country code.",
    4: "App request limit reached. Wait a few minutes.",
    17: "User request limit reached. Wait a few minutes.",
    368: "Temporarily blocked. Check your Meta app settings.",
  };
  return hints[code] || "Check your token and try again.";
}
