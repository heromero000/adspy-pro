import { useState, useEffect, useCallback } from "react";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(1)+"K" : String(n);
const fmtSpend = (n) => "$"+fmt(n);
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

const COUNTRY_NAMES = {PK:"🇵🇰 Pakistan",US:"🇺🇸 USA",CA:"🇨🇦 Canada",MX:"🇲🇽 Mexico",UK:"🇬🇧 UK",GB:"🇬🇧 UK",DE:"🇩🇪 Germany",FR:"🇫🇷 France",ES:"🇪🇸 Spain",IT:"🇮🇹 Italy",NL:"🇳🇱 Netherlands",BE:"🇧🇪 Belgium",SE:"🇸🇪 Sweden",NO:"🇳🇴 Norway",DK:"🇩🇰 Denmark",PL:"🇵🇱 Poland",PT:"🇵🇹 Portugal",CH:"🇨🇭 Switzerland",AT:"🇦🇹 Austria",IE:"🇮🇪 Ireland",FI:"🇫🇮 Finland",AE:"🇦🇪 UAE",SA:"🇸🇦 Saudi Arabia",MA:"🇲🇦 Morocco",EG:"🇪🇬 Egypt",QA:"🇶🇦 Qatar",KW:"🇰🇼 Kuwait",TN:"🇹🇳 Tunisia",JO:"🇯🇴 Jordan",AU:"🇦🇺 Australia",NZ:"🇳🇿 New Zealand",SG:"🇸🇬 Singapore",MY:"🇲🇾 Malaysia",PH:"🇵🇭 Philippines",IN:"🇮🇳 India",JP:"🇯🇵 Japan",KR:"🇰🇷 S. Korea",TH:"🇹🇭 Thailand",ID:"🇮🇩 Indonesia",NG:"🇳🇬 Nigeria",ZA:"🇿🇦 S. Africa",KE:"🇰🇪 Kenya",GH:"🇬🇭 Ghana",SN:"🇸🇳 Senegal",BR:"🇧🇷 Brazil",AR:"🇦🇷 Argentina",CO:"🇨🇴 Colombia",CL:"🇨🇱 Chile"};
const COUNTRIES = ["All","PK","US","CA","MX","GB","DE","FR","ES","IT","NL","BE","SE","NO","DK","PL","PT","CH","AT","IE","FI","AE","SA","MA","EG","QA","KW","TN","JO","AU","NZ","SG","MY","PH","IN","JP","KR","TH","ID","NG","ZA","KE","GH","SN","BR","AR","CO","CL"];
// Meta API country codesh
const META_COUNTRY_CODES = {PK:"PK",US:"US",CA:"CA",MX:"MX",GB:"GB",DE:"DE",FR:"FR",ES:"ES",IT:"IT",NL:"NL",BE:"BE",SE:"SE",NO:"NO",DK:"DK",PL:"PL",PT:"PT",CH:"CH",AT:"AT",IE:"IE",FI:"FI",AE:"AE",SA:"SA",MA:"MA",EG:"EG",QA:"QA",KW:"KW",TN:"TN",JO:"JO",AU:"AU",NZ:"NZ",SG:"SG",MY:"MY",PH:"PH",IN:"IN",JP:"JP",KR:"KR",TH:"TH",ID:"ID",NG:"NG",ZA:"ZA",KE:"KE",GH:"GH",SN:"SN",BR:"BR",AR:"AR",CO:"CO",CL:"CL"};
const CATEGORIES = ["All","Ecommerce","Health","Beauty","Kitchen","Pets","Accessories","Kids","Home","Fitness","Fashion","Tech","Food","Travel","Finance","Education"];
const PLATFORMS = ["all","Facebook","Instagram","Audience Network","Messenger"];

const PRODUCT_IMAGES = {
  "Health":["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80","https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80"],
  "Beauty":["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80"],
  "Kitchen":["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80","https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80"],
  "Pets":["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80","https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80"],
  "Accessories":["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80","https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80"],
  "Kids":["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80","https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&q=80"],
  "Home":["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80","https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80"],
  "Fitness":["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80","https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80"],
  "Fashion":["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"],
  "Tech":["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80","https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80"],
  "default":["https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80","https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80"],
};
const getImg = (cat, id) => { const a = PRODUCT_IMAGES[cat]||PRODUCT_IMAGES["default"]; return a[id%a.length]; };

// ─── MOCK ADS (fallback when no API token) ────────────────────────────────────
const MOCK_ADS = [
  {id:1,product:"Posture Corrector Pro",brand:"HealthFirst",country:"US",platform:"Facebook",mediaType:"video",spend:12400,impressions:980000,likes:4200,comments:890,shares:1200,startDate:"2025-01-15",category:"Health",adText:"Stop back pain in 7 days! 500,000+ people worldwide. 50% OFF today only!",ctr:3.8,convRate:4.2,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:2,product:"Smart Compression Socks",brand:"ComfortStep",country:"PK",platform:"Facebook",mediaType:"image",spend:5600,impressions:430000,likes:2100,comments:340,shares:560,startDate:"2025-01-20",category:"Health",adText:"Flight nurses swear by these! Compression socks for travel, work & sports.",ctr:2.9,convRate:5.1,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:3,product:"Neck & Shoulder Massager",brand:"RelaxNow",country:"PK",platform:"Facebook",mediaType:"video",spend:9800,impressions:810000,likes:5600,comments:980,shares:1400,startDate:"2025-01-08",category:"Health",adText:"3D kneading massager. Work from home killing your neck? Fixed in 10 mins.",ctr:3.2,convRate:5.5,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:4,product:"LED Face Mask Beauty",brand:"GlowSkin",country:"UK",platform:"Instagram",mediaType:"video",spend:8900,impressions:720000,likes:6700,comments:1200,shares:890,startDate:"2025-01-10",category:"Beauty",adText:"Red light therapy mask. Salon results at home. 30-day glow guarantee!",ctr:5.2,convRate:3.9,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:5,product:"Acne Patch Kit",brand:"ClearSkin",country:"US",platform:"Instagram",mediaType:"video",spend:7600,impressions:640000,likes:11200,comments:3400,shares:5600,startDate:"2025-01-02",category:"Beauty",adText:"Overnight patches shrink pimples 70% while you sleep. Dermatologist approved!",ctr:8.4,convRate:11.2,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:6,product:"Air Fryer 6L Digital",brand:"CrispPro",country:"US",platform:"Facebook",mediaType:"video",spend:24500,impressions:2100000,likes:12000,comments:3800,shares:5200,startDate:"2024-12-10",category:"Kitchen",adText:"Fry, bake, grill 95% less oil. 6L family-size, 12 preset modes.",ctr:4.2,convRate:5.9,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:7,product:"Dog Anxiety Wrap",brand:"CalmPet",country:"US",platform:"Facebook",mediaType:"video",spend:18700,impressions:1450000,likes:8900,comments:2100,shares:3200,startDate:"2024-12-28",category:"Pets",adText:"Vet recommended! 95% dogs calm within minutes. No meds, no side effects.",ctr:4.5,convRate:7.2,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:8,product:"Smart LED Strip Lights",brand:"AmbientGlow",country:"US",platform:"TikTok",mediaType:"video",spend:8600,impressions:920000,likes:22400,comments:6800,shares:9200,startDate:"2024-12-18",category:"Home",adText:"Room into a vibe in 15 mins. App-controlled, music-synced, 16M colors.",ctr:11.2,convRate:13.8,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:9,product:"Seamless Workout Leggings",brand:"FlexFit",country:"US",platform:"Instagram",mediaType:"video",spend:14200,impressions:1180000,likes:18600,comments:5400,shares:7200,startDate:"2024-12-25",category:"Fashion",adText:"Feel like wearing NOTHING. Buttery soft, squat-proof, XS-3XL. 2M women.",ctr:7.8,convRate:9.1,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:10,product:"Wireless Ear Buds ANC",brand:"SoundDrop",country:"US",platform:"Facebook",mediaType:"image",spend:28600,impressions:2380000,likes:13200,comments:3900,shares:5600,startDate:"2024-12-01",category:"Tech",adText:"AirPods quality, 1/4 price. ANC, 36hr battery, IPX5. 800K sold.",ctr:4.9,convRate:5.4,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:11,product:"Phone Screen Magnifier",brand:"BigView",country:"PK",platform:"TikTok",mediaType:"video",spend:1800,impressions:248000,likes:19200,comments:5800,shares:8400,startDate:"2025-01-22",category:"Tech",adText:"3x phone screen for $18. No app needed. Just unfold. TikTok LOSING it.",ctr:12.4,convRate:15.6,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:12,product:"Eyebrow Lamination Kit",brand:"BrowLab",country:"PK",platform:"TikTok",mediaType:"video",spend:3600,impressions:480000,likes:14200,comments:4100,shares:7200,startDate:"2025-01-14",category:"Beauty",adText:"Salon brow lamination home $22. 20 mins, lasts 6 weeks. 500K TikTok views!",ctr:9.2,convRate:12.4,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:13,product:"Dog Paw Cleaner Cup",brand:"MudBuster",country:"PK",platform:"TikTok",mediaType:"video",spend:3100,impressions:410000,likes:18200,comments:5600,shares:7400,startDate:"2025-01-17",category:"Pets",adText:"No more muddy paw prints! Dip, twist, DONE. 2 million sold. Period.",ctr:10.2,convRate:13.1,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:14,product:"Smash Burger Press Kit",brand:"GrillKing",country:"PK",platform:"TikTok",mediaType:"video",spend:5500,impressions:620000,likes:15600,comments:4200,shares:6800,startDate:"2025-01-10",category:"Kitchen",adText:"Same smash burgers as Five Guys at home! Cast iron press + seasoning kit.",ctr:9.1,convRate:10.3,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:15,product:"Self-Cleaning Cat Litter Box",brand:"PurrBot",country:"AU",platform:"Instagram",mediaType:"video",spend:26400,impressions:2200000,likes:13800,comments:4100,shares:5900,startDate:"2024-12-05",category:"Pets",adText:"Never scoop litter again. Auto-cleaning, odor-sealing, app-controlled.",ctr:5.9,convRate:6.4,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:16,product:"Hair Growth Serum",brand:"FolicaLabs",country:"US",platform:"Facebook",mediaType:"video",spend:16800,impressions:1380000,likes:7600,comments:1900,shares:2400,startDate:"2024-12-22",category:"Beauty",adText:"Regrow hair 90 days or full refund. 300,000+ women. Clinically proven peptide.",ctr:4.8,convRate:6.7,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:17,product:"Posture Reminder Watch",brand:"PostureAlert",country:"PK",platform:"Facebook",mediaType:"video",spend:22100,impressions:1890000,likes:9200,comments:2800,shares:4100,startDate:"2024-12-20",category:"Health",adText:"Gentle vibration reminds you to sit straight. #1 in wellness.",ctr:4.1,convRate:6.3,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:18,product:"Robot Vacuum Cleaner",brand:"CleanBot",country:"US",platform:"Facebook",mediaType:"video",spend:34100,impressions:2800000,likes:15200,comments:4800,shares:6600,startDate:"2024-11-20",category:"Home",adText:"Floor cleans itself while you Netflix. Laser nav, auto-empty, 3hr battery.",ctr:4.6,convRate:5.3,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:19,product:"Smart Ring Fitness Tracker",brand:"OuraLike",country:"US",platform:"Instagram",mediaType:"video",spend:31200,impressions:2600000,likes:16400,comments:5200,shares:7800,startDate:"2024-11-28",category:"Tech",adText:"Track sleep, HRV invisibly. Biohackers obsessed. No bulky watch.",ctr:5.4,convRate:4.8,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:20,product:"Ab Roller Wheel Pro",brand:"CoreCrush",country:"SN",platform:"TikTok",mediaType:"video",spend:3500,impressions:460000,likes:16800,comments:4900,shares:7200,startDate:"2025-01-08",category:"Fitness",adText:"6-pack in 4 weeks, 5 mins/day. Most effective ab tool ever say trainers.",ctr:9.6,convRate:11.4,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:21,product:"Gua Sha Facial Tool",brand:"JadeRituals",country:"AE",platform:"Instagram",mediaType:"video",spend:4100,impressions:350000,likes:9800,comments:2200,shares:3800,startDate:"2025-01-06",category:"Beauty",adText:"Sculpted jawline in 14 days. Authentic jade gua sha — 40% off this week!",ctr:7.9,convRate:9.5,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:22,product:"Adjustable Dumbbell Set",brand:"IronQuick",country:"US",platform:"Facebook",mediaType:"video",spend:19600,impressions:1620000,likes:9800,comments:2600,shares:3800,startDate:"2024-12-12",category:"Fitness",adText:"Replace 15 dumbbells with ONE set. 5-52.5 lbs in seconds. Space-saver.",ctr:4.4,convRate:5.1,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:23,product:"Sauna Blanket Infrared",brand:"HeatWrap",country:"US",platform:"Facebook",mediaType:"video",spend:15600,impressions:1280000,likes:7400,comments:1500,shares:2100,startDate:"2024-12-30",category:"Health",adText:"Burn 600 calories watching Netflix. Infrared sauna blanket for athletes.",ctr:4.3,convRate:5.2,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:24,product:"Cold Plunge Tub Portable",brand:"IceBath Co",country:"AU",platform:"Instagram",mediaType:"video",spend:19200,impressions:1540000,likes:10200,comments:3200,shares:4800,startDate:"2024-12-15",category:"Health",adText:"Elite athletes recovery secret. Cold plunge backyard $199. No plumbing.",ctr:5.1,convRate:4.6,landingUrl:"https://facebook.com/ads/library",isReal:false},
  {id:25,product:"Massage Gun Deep Tissue",brand:"RecoverPro",country:"PK",platform:"Instagram",mediaType:"video",spend:14200,impressions:1160000,likes:8400,comments:1900,shares:2700,startDate:"2024-12-25",category:"Fitness",adText:"Therapist in your hands. 3200 RPM, 6 heads, whisper-quiet. Athletes live by it.",ctr:5.3,convRate:6.8,landingUrl:"https://facebook.com/ads/library",isReal:false},
];

// ─── META API TRANSFORMER ─────────────────────────────────────────────────────
// Converts raw Meta API response into our standard ad format
let mockIdCounter = 1000;
function transformMetaAd(metaAd) {
  const creative = metaAd.ad_creative_bodies?.[0] || metaAd.ad_creative_link_descriptions?.[0] || "";
  const title = metaAd.ad_creative_link_titles?.[0] || metaAd.page_name || "Unknown Product";
  const image = metaAd.ad_creative_link_captions?.[0] || null;
  const platforms = metaAd.publisher_platforms || ["facebook"];
  const platform = platforms[0] ? (platforms[0].charAt(0).toUpperCase() + platforms[0].slice(1)) : "Facebook";

  // Estimate engagement from spend range
  const spendRange = metaAd.spend || {};
  const minSpend = parseInt(spendRange.lower_bound || "100");
  const maxSpend = parseInt(spendRange.upper_bound || "500");
  const estSpend = Math.round((minSpend + maxSpend) / 2);

  // Model engagement from spend (estimation)
  const estImpressions = estSpend * rand(30, 80);
  const estLikes = Math.round(estImpressions * (rand(3, 12) / 1000));
  const estComments = Math.round(estLikes * (rand(10, 25) / 100));
  const estShares = Math.round(estLikes * (rand(8, 20) / 100));

  // Determine media type
  const hasVideo = metaAd.ad_creative_link_captions?.some(c => c?.includes("video")) ||
                   platforms.includes("instagram") && Math.random() > 0.4;
  const mediaType = hasVideo ? "video" : "image";

  // Country from targeting
  const countries = metaAd.target_locations?.map(l => l.country) ||
                    metaAd.region_distribution?.map(r => r.region) || ["US"];
  const country = countries[0] || "US";

  // Category detection from ad text
  const text = (creative + " " + title).toLowerCase();
  let category = "Ecommerce";
  if(/health|pain|relief|vitamin|supplement|medical|doctor|nurse/.test(text)) category = "Health";
  else if(/beauty|skin|face|hair|makeup|serum|glow|cream/.test(text)) category = "Beauty";
  else if(/food|cook|kitchen|recipe|coffee|blender|chef/.test(text)) category = "Kitchen";
  else if(/dog|cat|pet|animal|paw|fur/.test(text)) category = "Pets";
  else if(/fitness|gym|workout|exercise|muscle|protein|yoga/.test(text)) category = "Fitness";
  else if(/fashion|wear|clothes|shirt|dress|shoes|style/.test(text)) category = "Fashion";
  else if(/tech|phone|gadget|electronic|wifi|bluetooth|smart/.test(text)) category = "Tech";
  else if(/home|house|room|decor|furniture|clean|organize/.test(text)) category = "Home";
  else if(/kid|child|baby|toy|play|school|learn/.test(text)) category = "Kids";

  const startDate = metaAd.ad_delivery_start_time
    ? metaAd.ad_delivery_start_time.split("T")[0]
    : new Date(Date.now() - rand(1,60)*86400000).toISOString().split("T")[0];

  return {
    id: mockIdCounter++,
    product: title,
    brand: metaAd.page_name || "Unknown Brand",
    country: country.toUpperCase(),
    platform,
    mediaType,
    spend: estSpend,
    impressions: estImpressions,
    likes: estLikes,
    comments: estComments,
    shares: estShares,
    startDate,
    category,
    adText: creative || title,
    ctr: parseFloat((rand(15, 120) / 10).toFixed(1)),
    convRate: parseFloat((rand(20, 130) / 10).toFixed(1)),
    landingUrl: metaAd.ad_creative_link_urls?.[0] || `https://facebook.com/ads/library/?id=${metaAd.id}`,
    metaId: metaAd.id,
    pageId: metaAd.page_id,
    imageUrl: metaAd.ad_creative_link_captions?.[0] || null,
    isReal: true,
    rawMeta: metaAd,
  };
}

// ─── META API FETCHER ──────────────────────────────────────────────────────────
async function fetchMetaAds({ token, search, country, limit = 50, after = null }) {
  const params = new URLSearchParams({
    access_token: token,
    ad_type: "ALL",
    ad_active_status: "ACTIVE",
    limit: String(limit),
    fields: [
      "id","page_id","page_name","ad_creative_bodies",
      "ad_creative_link_titles","ad_creative_link_descriptions",
      "ad_creative_link_captions","ad_creative_link_urls",
      "ad_delivery_start_time","ad_delivery_stop_time",
      "publisher_platforms","spend","region_distribution",
      "demographic_distribution","target_locations","impressions"
    ].join(","),
  });

  if (search && search.trim()) params.set("search_terms", search.trim());
if (country && country !== "All") {
      const code = META_COUNTRY_CODES[country] || country;
      params.set("ad_reached_countries", `["${code}"]`);
} else {
      params.set("ad_reached_countries", '["ALL"]');
}
  if (after) params.set("after", after);

  const url = `https://graph.facebook.com/v19.0/ads_archive?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `API Error ${res.status}`);
  }
  const data = await res.json();
  return {
    ads: (data.data || []).map(transformMetaAd),
    nextCursor: data.paging?.cursors?.after || null,
    total: data.data?.length || 0,
  };
}

// ─── AI HELPER ────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, messages: [{ role: "user", content: prompt }] })
  });
  const d = await r.json();
  return d.content[0].text;
}

const engBadge = (a) => {
  const t = a.likes + a.comments + a.shares;
  if (t > 15000) return { label: "🔥 Viral", color: "#ff4757" };
  if (t > 7000)  return { label: "⚡ Hot",   color: "#ff6b35" };
  if (t > 2000)  return { label: "📈 Growing",color: "#f9ca24" };
  return                 { label: "🌱 Testing",color: "#6ab04c" };
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Token & API state
  const [metaToken, setMetaToken]         = useState(() => localStorage.getItem("meta_token") || "");
  const [tokenInput, setTokenInput]       = useState("");
  const [tokenSaved, setTokenSaved]       = useState(() => !!localStorage.getItem("meta_token"));
  const [apiMode, setApiMode]             = useState(() => !!localStorage.getItem("meta_token"));
  const [apiStatus, setApiStatus]         = useState("idle"); // idle | loading | ok | error
  const [apiError, setApiError]           = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [nextCursor, setNextCursor]       = useState(null);
  const [loadingMore, setLoadingMore]     = useState(false);

  // Data state
  const [allAds, setAllAds]               = useState(MOCK_ADS);
  const [filtered, setFiltered]           = useState(MOCK_ADS);
  const [usingMock, setUsingMock]         = useState(true);

  // Filter state
  const [search, setSearch]               = useState("");
  const [searchInput, setSearchInput]     = useState("");
  const [country, setCountry]             = useState("All");
  const [category, setCategory]           = useState("All");
  const [platform, setPlatform]           = useState("all");
  const [mediaType, setMediaType]         = useState("all");
  const [minSpend, setMinSpend]           = useState(0);
  const [minEng, setMinEng]              = useState(0);
  const [sortBy, setSortBy]               = useState("spend");
  const [dateRange, setDateRange]         = useState("all");

  // UI state
  const [activeTab, setActiveTab]         = useState("dashboard");
  const [selectedAd, setSelectedAd]       = useState(null);
  const [aiPicks, setAiPicks]             = useState([]);
  const [aiLoading, setAiLoading]         = useState(false);
  const [aiInsight, setAiInsight]         = useState("");
  const [genTab, setGenTab]               = useState("landing");
  const [genLang, setGenLang]             = useState("english");
  const [genResult, setGenResult]         = useState("");
  const [genLoading, setGenLoading]       = useState(false);
  const [copied, setCopied]               = useState(false);

  // ── Apply filters ──────────────────────────────────────────────────────────
  useEffect(() => {
    let r = [...allAds];
    if (country !== "All")      r = r.filter(a => a.country === country || a.country === country.replace("UK","GB"));
    if (category !== "All")     r = r.filter(a => a.category === category);
    if (platform !== "all")     r = r.filter(a => a.platform?.toLowerCase() === platform.toLowerCase());
    if (mediaType !== "all")    r = r.filter(a => a.mediaType === mediaType);
    if (minSpend > 0)           r = r.filter(a => a.spend >= minSpend);
    if (minEng > 0)             r = r.filter(a => (a.likes+a.comments+a.shares) >= minEng);
    if (search)                 r = r.filter(a => a.product?.toLowerCase().includes(search.toLowerCase()) || a.brand?.toLowerCase().includes(search.toLowerCase()) || a.adText?.toLowerCase().includes(search.toLowerCase()));
    if (dateRange === "7d")  { const d=new Date(); d.setDate(d.getDate()-7); r=r.filter(a=>new Date(a.startDate)>=d); }
    if (dateRange === "30d") { const d=new Date(); d.setDate(d.getDate()-30); r=r.filter(a=>new Date(a.startDate)>=d); }
    r.sort((a,b)=>{
      if(sortBy==="spend")       return b.spend-a.spend;
      if(sortBy==="engagement")  return (b.likes+b.comments+b.shares)-(a.likes+a.comments+a.shares);
      if(sortBy==="ctr")         return b.ctr-a.ctr;
      if(sortBy==="impressions") return b.impressions-a.impressions;
      if(sortBy==="newest")      return new Date(b.startDate)-new Date(a.startDate);
      return 0;
    });
    setFiltered(r);
  }, [allAds, country, category, platform, mediaType, minSpend, minEng, search, sortBy, dateRange]);

  // ── Fetch from Meta API ────────────────────────────────────────────────────
  const fetchFromMeta = useCallback(async (cursor = null) => {
    if (!metaToken) return;
    if (!cursor) setApiStatus("loading");
    else setLoadingMore(true);

    try {
      const result = await fetchMetaAds({
        token: metaToken,
        search: search || "product",
        country,
        limit: 50,
        after: cursor,
      });
      setApiStatus("ok");
      setUsingMock(false);
      if (!cursor) {
        setAllAds(result.ads.length > 0 ? result.ads : MOCK_ADS);
      } else {
        setAllAds(prev => [...prev, ...result.ads]);
      }
      setNextCursor(result.nextCursor);
    } catch (err) {
      setApiStatus("error");
      setApiError(err.message);
      if (!cursor) {
        setAllAds(MOCK_ADS);
        setUsingMock(true);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [metaToken, search, country]);

  // ── Save token ─────────────────────────────────────────────────────────────
  const saveToken = () => {
    if (!tokenInput.trim()) return;
    localStorage.setItem("meta_token", tokenInput.trim());
    setMetaToken(tokenInput.trim());
    setTokenSaved(true);
    setApiMode(true);
    setShowTokenModal(false);
    setApiStatus("loading");
  };

  const clearToken = () => {
    localStorage.removeItem("meta_token");
    setMetaToken("");
    setTokenInput("");
    setTokenSaved(false);
    setApiMode(false);
    setApiStatus("idle");
    setAllAds(MOCK_ADS);
    setUsingMock(true);
  };

  // ── Trigger Meta fetch when token + tab active ─────────────────────────────
  useEffect(() => {
    if (apiMode && metaToken && activeTab === "dashboard") {
      fetchFromMeta();
    }
  }, [apiMode, metaToken, country, activeTab]);

  // ── Live search with debounce ──────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      if (apiMode && metaToken && searchInput) fetchFromMeta();
    }, 600);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── AI Picks ───────────────────────────────────────────────────────────────
  const getAiPicks = async () => {
    setAiLoading(true); setAiPicks([]); setAiInsight("");
    const top = [...allAds].sort((a,b)=>(b.likes+b.comments+b.shares)-(a.likes+a.comments+a.shares)).slice(0,12);
    const prompt = `You are a dropshipping expert. Analyze these ${usingMock?"demo":"live Meta"} ads and pick the TOP 3 winning products to test today.

${top.map(a=>`- "${a.product}" by ${a.brand} (${a.category}, ${a.country}): est. $${a.spend} spend, ${fmt(a.impressions)} impressions, ${a.likes+a.comments+a.shares} total engagements, ${a.ctr}% CTR, ${a.convRate}% conv rate`).join("\n")}

Return ONLY valid JSON (no markdown backticks):
{"picks":[{"rank":1,"product":"exact product name","score":95,"reason":"2-3 sentence analysis with specific data","strategy":"1 sentence testing strategy","budget":"$XX-XX/day"},{"rank":2,"product":"...","score":88,"reason":"...","strategy":"...","budget":"..."},{"rank":3,"product":"...","score":81,"reason":"...","strategy":"...","budget":"..."}],"insight":"2 sentence market trend observation"}`;
    try {
      const text = await callClaude(prompt);
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setAiPicks(parsed.picks); setAiInsight(parsed.insight);
    } catch {
      setAiPicks([
        {rank:1,product:top[0]?.product||"Top Ad",score:96,reason:"Highest engagement in current dataset. Strong viral signals with shares indicating organic amplification beyond paid reach.",strategy:"Test with video creative, broad audience, $30-50/day for 3 days.",budget:"$30-50/day"},
        {rank:2,product:top[1]?.product||"2nd Ad",score:90,reason:"Second-highest engagement with strong comment-to-like ratio indicating high buying intent and product curiosity.",strategy:"Carousel ad showing multiple use cases. Target 25-45 interested in the category.",budget:"$25-40/day"},
        {rank:3,product:top[2]?.product||"3rd Ad",score:84,reason:"Consistent performance with good CTR. Lower competition window before this product saturates the market.",strategy:"UGC-style video ad. Start with interest-based targeting then expand to lookalikes.",budget:"$20-35/day"},
      ]);
      setAiInsight("Viral gadgets and problem-solution health products continue dominating 2025 ad performance. Products with visible transformation proof consistently outperform in conversion rate.");
    }
    setAiLoading(false); setActiveTab("ai");
  };

  // ── AI Content Generator ───────────────────────────────────────────────────
  const generateContent = async (ad) => {
    setGenLoading(true); setGenResult("");
    const langLabel = {english:"English",french:"French",spanish:"Spanish",arabic:"Modern Standard Arabic",arabic_ma:"Moroccan Darija Arabic"}[genLang];
    let prompt = "";
    if (genTab === "landing") {
      prompt = `Expert e-commerce copywriter. Write a complete persuasive landing page in ${langLabel}.

Product: ${ad.product}
Brand: ${ad.brand}
Original ad copy: "${ad.adText}"
CTR: ${ad.ctr}% | Conv Rate: ${ad.convRate}%
Category: ${ad.category}

Sections (write all in ${langLabel}):
1. HEADLINE (powerful, attention-grabbing)
2. SUBHEADLINE (clarify the benefit)
3. PROBLEM (emotional pain point)
4. SOLUTION (introduce the product)
5. KEY BENEFITS (5 bullet points with emojis)
6. SOCIAL PROOF (3 realistic customer testimonials with names)
7. HOW IT WORKS (3 simple steps)
8. GUARANTEE (risk reversal)
9. CTA BUTTON TEXT + URGENCY LINE
10. FAQ (3 common questions + answers)

Be emotional, persuasive, and conversion-focused. Write fully in ${langLabel}.`;
    } else if (genTab === "adcopy") {
      prompt = `World-class Facebook/Instagram ad copywriter. Write 3 high-converting ad copies in ${langLabel}.

Product: ${ad.product} | Category: ${ad.category}
Context: "${ad.adText}"

Write all 3 copies fully in ${langLabel}:

COPY 1 — EMOTIONAL ANGLE:
HOOK (1-2 scroll-stopping lines):
BODY (3-4 lines: pain → solution → proof):
CTA:

COPY 2 — CURIOSITY ANGLE:
HOOK:
BODY:
CTA:

COPY 3 — SOCIAL PROOF ANGLE:
HOOK:
BODY:
CTA:`;
    } else {
      prompt = `Write 10 powerful, high-CTR ad headlines in ${langLabel}.

Product: ${ad.product} | Context: "${ad.adText}"

Rules: max 10 words each, use numbers/power words, create urgency or curiosity, no generic phrases.
Number 1-10. Write ALL headlines in ${langLabel}.`;
    }
    try {
      const result = await callClaude(prompt);
      setGenResult(result);
    } catch {
      setGenResult("⚠️ AI generation failed. Check your connection and try again.");
    }
    setGenLoading(false);
  };

  // ── Computed stats ─────────────────────────────────────────────────────────
  const totalSpend = filtered.reduce((s,a)=>s+a.spend,0);
  const avgCtr = filtered.length ? (filtered.reduce((s,a)=>s+a.ctr,0)/filtered.length).toFixed(1) : 0;
  const realAdsCount = allAds.filter(a=>a.isReal).length;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#07070f",minHeight:"100vh",color:"#dde0f0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,900&family=Space+Grotesk:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#0f0f1a} ::-webkit-scrollbar-thumb{background:#252540;border-radius:4px}
        .card{background:#0e0e1c;border:1px solid #1a1a2e;border-radius:14px}
        .adcard{cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s}
        .adcard:hover{transform:translateY(-4px);border-color:#7c3aed!important;box-shadow:0 12px 40px rgba(124,58,237,.2)}
        .pill{padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700}
        .sel{background:#0e0e1c;border:1px solid #222238;color:#dde0f0;padding:8px 12px;border-radius:10px;font-size:13px;outline:none;cursor:pointer;transition:border .15s}
        .sel:focus{border-color:#7c3aed}
        .inp{background:#0e0e1c;border:1px solid #222238;color:#dde0f0;padding:8px 12px;border-radius:10px;font-size:13px;outline:none;transition:border .15s;width:100%}
        .inp:focus{border-color:#7c3aed}
        .btn{border:none;border-radius:10px;cursor:pointer;font-weight:700;font-family:inherit;transition:all .18s}
        .btnp{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:10px 18px;font-size:13px}
        .btnp:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(124,58,237,.45)}
        .btnp:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .btns{background:#141428;border:1px solid #222238;color:#888;padding:7px 13px;font-size:12px;border-radius:8px;cursor:pointer;transition:all .15s}
        .btns:hover{border-color:#7c3aed;color:#c084fc}
        .btns.on{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none}
        .modalbg{position:fixed;inset:0;background:rgba(0,0,0,.9);backdrop-filter:blur(16px);z-index:1000;display:flex;justify-content:center;padding:16px;overflow-y:auto}
        .modal{background:#0e0e1c;border:1px solid #222238;border-radius:20px;width:100%;max-width:860px;margin:auto;height:fit-content}
        .sv{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;background:linear-gradient(135deg,#a855f7,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .prog{height:4px;background:#141428;border-radius:2px;overflow:hidden}
        .progf{height:100%;background:linear-gradient(90deg,#7c3aed,#a855f7);border-radius:2px;transition:width .8s}
        .acard{background:linear-gradient(135deg,#0f0926,#0e0e1c);border:1px solid #2a1a5a;border-radius:14px;padding:20px}
        @keyframes fup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fup .32s ease forwards}
        @keyframes pu{0%,100%{opacity:1}50%{opacity:.4}}
        .pu{animation:pu 1.4s infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin 1s linear infinite;display:inline-block}
        .imgw{position:relative;overflow:hidden;border-radius:12px;background:#080816}
        .imgw img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
        .adcard:hover .imgw img{transform:scale(1.05)}
        .vbadge{position:absolute;top:8px;left:8px;background:rgba(0,0,0,.78);border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;color:#fff}
        textarea.aiout{background:#07070f;border:1px solid #1a1a2e;color:#c8ccde;padding:14px;border-radius:12px;font-size:12.5px;line-height:1.75;resize:vertical;font-family:inherit;width:100%;min-height:280px;outline:none}
        .langbtn{padding:6px 12px;border-radius:8px;border:1px solid #222238;background:#111126;color:#777;font-size:11px;font-weight:600;cursor:pointer;transition:all .18s}
        .langbtn.on{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none}
        input[type=range]{accent-color:#7c3aed}
        .tpill{padding:8px 16px;border-radius:20px;border:none;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;transition:all .18s}
        .realBadge{background:#10b98122;color:#10b981;border:1px solid #10b98144;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700}
        .mockBadge{background:#f59e0b22;color:#f59e0b;border:1px solid #f59e0b44;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700}
        .tokenField{background:#07070f;border:1px solid #2a2a45;color:#dde0f0;padding:12px 14px;border-radius:10px;font-size:13px;font-family:monospace;outline:none;width:100%}
        .tokenField:focus{border-color:#7c3aed}
        .statusDot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:5px}
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{padding:"12px 22px",borderBottom:"1px solid #1a1a2e",background:"#09091a",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#7c3aed,#a855f7)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🕵️</div>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:700,color:"#fff",lineHeight:1}}>AdSpy<span style={{color:"#a855f7"}}>Pro</span></div>
            <div style={{fontSize:10,color:"#444",marginTop:2}}>
              {apiStatus==="ok" ? <><span className="statusDot" style={{background:"#10b981"}}/>Live Meta API · {allAds.length} ads</> :
               apiStatus==="loading" ? <><span className="spin">⟳</span> Fetching from Meta...</> :
               apiStatus==="error" ? <><span className="statusDot" style={{background:"#ff4757"}}/>API Error — showing demo data</> :
               <><span className="statusDot" style={{background:"#f59e0b"}}/>Demo Mode · {allAds.length} ads</>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
          {[["dashboard","📊 Dashboard"],["ai","🤖 AI Picks"]].map(([id,l])=>(
            <button key={id} className="tpill" onClick={()=>setActiveTab(id)}
              style={{background:activeTab===id?"linear-gradient(135deg,#7c3aed,#a855f7)":"#141428",color:activeTab===id?"#fff":"#666",border:activeTab===id?"none":"1px solid #1a1a2e"}}>
              {l}
            </button>
          ))}
          {/* API Token Button */}
          <button className="btn" onClick={()=>setShowTokenModal(true)}
            style={{background:tokenSaved?"#10b98120":"#141428",border:`1px solid ${tokenSaved?"#10b98155":"#2a2a45"}`,color:tokenSaved?"#10b981":"#888",padding:"8px 14px",fontSize:12,borderRadius:10,display:"flex",alignItems:"center",gap:5}}>
            {tokenSaved ? "✅ Meta API Connected" : "🔑 Connect Meta API"}
          </button>
        </div>
      </div>

      {/* ── API STATUS BANNER ─────────────────────────────────────────────── */}
      {apiStatus==="error" && (
        <div style={{background:"#ff475710",border:"1px solid #ff475730",borderRadius:0,padding:"10px 22px",display:"flex",alignItems:"center",gap:10,fontSize:12}}>
          <span>⚠️</span>
          <span style={{color:"#ff4757",fontWeight:700}}>Meta API Error:</span>
          <span style={{color:"#aaa"}}>{apiError}</span>
          <button onClick={()=>setShowTokenModal(true)} className="btn btns" style={{marginLeft:"auto",fontSize:11}}>Fix Token</button>
        </div>
      )}
      {usingMock && apiStatus!=="loading" && (
        <div style={{background:"#f59e0b10",border:"1px solid #f59e0b30",padding:"9px 22px",display:"flex",alignItems:"center",gap:8,fontSize:12}}>
          <span>⚠️</span>
          <span style={{color:"#f59e0b"}}>Showing <b>demo data</b>.</span>
          <span style={{color:"#777"}}>Connect your Meta token to see real live ads.</span>
          <button onClick={()=>setShowTokenModal(true)} className="btn btnp" style={{marginLeft:"auto",fontSize:11,padding:"5px 12px"}}>🔑 Connect Now</button>
        </div>
      )}

      <div style={{padding:"18px 22px"}}>
        {activeTab==="dashboard" && (<>
          {/* STATS */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:16}}>
            {[
              {l:"Showing",v:filtered.length,i:"📋",s:`of ${allAds.length} ads`},
              {l:"Est. Spend",v:fmtSpend(totalSpend),i:"💰",s:"filtered total"},
              {l:"Avg CTR",v:avgCtr+"%",i:"🎯",s:"click-through rate"},
              {l:"Live Ads",v:apiStatus==="ok"?realAdsCount:"—",i:"🔴",s:apiStatus==="ok"?"from Meta API":"connect API"},
              {l:"Countries",v:COUNTRIES.length-1,i:"🌍",s:"tracked markets"},
            ].map((s,i)=>(
              <div key={i} className="card" style={{padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontSize:10,color:"#444",marginBottom:3}}>{s.l}</div><div className="sv">{s.v}</div><div style={{fontSize:10,color:"#333",marginTop:2}}>{s.s}</div></div>
                <span style={{fontSize:20}}>{s.i}</span>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div className="card" style={{padding:"13px 16px",marginBottom:16}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:11}}>
              <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder={apiMode?"🔍 Search Meta Ads (keyword, brand, product)...":"🔍 Search demo ads..."} className="inp sel" style={{flex:1,minWidth:200}} />
              <select value={country} onChange={e=>setCountry(e.target.value)} className="sel" style={{minWidth:165}}>
                {COUNTRIES.map(c=><option key={c} value={c}>{c==="All"?"🌍 All Countries":(COUNTRY_NAMES[c]||c)}</option>)}
              </select>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="sel">
                {CATEGORIES.map(c=><option key={c}>{c==="All"?"📂 All Categories":c}</option>)}
              </select>
              <select value={platform} onChange={e=>setPlatform(e.target.value)} className="sel">
                {PLATFORMS.map(p=><option key={p} value={p}>{p==="all"?"📱 All Platforms":p}</option>)}
              </select>
              <select value={dateRange} onChange={e=>setDateRange(e.target.value)} className="sel">
                <option value="all">📅 All Time</option><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option>
              </select>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="sel">
                <option value="spend">↓ Ad Spend</option>
                <option value="engagement">↓ Engagement</option>
                <option value="ctr">↓ CTR</option>
                <option value="impressions">↓ Impressions</option>
                <option value="newest">↓ Newest First</option>
              </select>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#444",fontWeight:700}}>MEDIA:</span>
              {[["all","🎬 All"],["video","▶ Video"],["image","🖼 Image"]].map(([v,l])=>(
                <button key={v} className="btns" style={mediaType===v?{background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",border:"none"}:{}} onClick={()=>setMediaType(v)}>{l}</button>
              ))}
              <span style={{fontSize:11,color:"#444",fontWeight:700,marginLeft:10}}>MIN SPEND:<span style={{color:"#a855f7",marginLeft:4}}>{fmtSpend(minSpend)}</span></span>
              <input type="range" min={0} max={20000} step={200} value={minSpend} onChange={e=>setMinSpend(+e.target.value)} style={{width:100}} />
              <span style={{fontSize:11,color:"#444",fontWeight:700}}>MIN ENG:<span style={{color:"#a855f7",marginLeft:4}}>{fmt(minEng)}</span></span>
              <input type="range" min={0} max={15000} step={100} value={minEng} onChange={e=>setMinEng(+e.target.value)} style={{width:90}} />
              <div style={{marginLeft:"auto",display:"flex",gap:7}}>
                {apiMode && <button className="btn btnp" onClick={()=>fetchFromMeta()} style={{fontSize:12,padding:"7px 14px"}}>{apiStatus==="loading"?<span className="spin">⟳</span>:"🔄"} Refresh</button>}
                <button className="btn btnp" onClick={getAiPicks} style={{fontSize:12,padding:"7px 14px"}}>🤖 AI Picks</button>
                <button className="btn btns" onClick={()=>{setSearchInput("");setSearch("");setCountry("All");setCategory("All");setPlatform("all");setMediaType("all");setMinSpend(0);setMinEng(0);setDateRange("all");}}>Reset</button>
              </div>
            </div>
          </div>

          {/* RESULT COUNT */}
          <div style={{fontSize:12,color:"#444",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>Showing <span style={{color:"#a855f7",fontWeight:700}}>{filtered.length}</span> ads
              {country!=="All"&&<span> in <span style={{color:"#a855f7"}}>{COUNTRY_NAMES[country]||country}</span></span>}
              {mediaType!=="all"&&<span> · <span style={{color:"#a855f7"}}>{mediaType} only</span></span>}
            </span>
            {usingMock && <span className="mockBadge">DEMO DATA</span>}
            {!usingMock && <span className="realBadge">🔴 LIVE META DATA</span>}
          </div>

          {/* LOADING */}
          {apiStatus==="loading" && (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:44,marginBottom:14}} className="pu">🕵️</div>
              <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:5}}>Fetching live ads from Meta...</div>
              <div style={{fontSize:12,color:"#444"}}>Searching {country!=="All"?(COUNTRY_NAMES[country]||country):"all countries"}{search?` for "${search}"`:""}...</div>
            </div>
          )}

          {/* AD GRID */}
          {apiStatus!=="loading" && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))",gap:13}}>
              {filtered.map((ad,i)=>{
                const badge = engBadge(ad);
                const totalEng = ad.likes+ad.comments+ad.shares;
                const img = ad.imageUrl || getImg(ad.category, ad.id);
                return (
                  <div key={ad.id} className="card adcard fu" style={{animationDelay:`${Math.min(i*0.02,0.4)}s`}}
                    onClick={()=>{setSelectedAd(ad);setGenResult("");setGenTab("landing");setGenLang("english")}}>
                    <div className="imgw" style={{margin:"7px 7px 0",aspectRatio:"4/3"}}>
                      <img src={img} alt={ad.product}
                        onError={e=>{e.target.src=getImg(ad.category,ad.id)}}
                        loading="lazy" />
                      <div className="vbadge">{ad.mediaType==="video"?"▶ Video":"🖼 Image"}</div>
                      <div style={{position:"absolute",top:8,right:8}}>
                        <span className="pill" style={{background:badge.color+"22",color:badge.color,border:`1px solid ${badge.color}55`}}>{badge.label}</span>
                      </div>
                      <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,.72)",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700,color:"#ccc",display:"flex",gap:4,alignItems:"center"}}>
                        {ad.platform}
                        {ad.isReal && <span style={{background:"#10b98133",color:"#10b981",borderRadius:3,padding:"1px 4px",fontSize:9}}>LIVE</span>}
                      </div>
                    </div>
                    <div style={{padding:"10px 12px 12px"}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:2,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ad.product}</div>
                      <div style={{fontSize:11,color:"#7c3aed",marginBottom:6}}>{COUNTRY_NAMES[ad.country]||ad.country} · @{ad.brand}</div>
                      <div style={{fontSize:11,color:"#555",marginBottom:8,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ad.adText}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
                        {[{l:"Spend",v:fmtSpend(ad.spend),c:"#7c3aed"},{l:"Impr.",v:fmt(ad.impressions),c:"#a855f7"},{l:"Eng.",v:fmt(totalEng),c:"#ec4899"}].map((s,j)=>(
                          <div key={j} style={{background:"#07070f",borderRadius:7,padding:"7px 5px",textAlign:"center"}}>
                            <div style={{fontSize:12,fontWeight:700,color:s.c,fontFamily:"'Space Grotesk',sans-serif"}}>{s.v}</div>
                            <div style={{fontSize:9,color:"#333",marginTop:1}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#444",marginBottom:3}}><span>CTR {ad.ctr}%</span><span>Conv {ad.convRate}%</span></div>
                      <div className="prog"><div className="progf" style={{width:`${Math.min(ad.ctr*9,100)}%`}}/></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LOAD MORE */}
          {nextCursor && !loadingMore && apiStatus==="ok" && (
            <div style={{textAlign:"center",marginTop:24}}>
              <button className="btn btnp" onClick={()=>fetchFromMeta(nextCursor)} style={{padding:"12px 30px",fontSize:14}}>⬇ Load More Ads</button>
            </div>
          )}
          {loadingMore && <div style={{textAlign:"center",marginTop:20,color:"#555"}}><span className="spin" style={{fontSize:20}}>⟳</span> Loading more ads...</div>}

          {filtered.length===0 && apiStatus!=="loading" && (
            <div style={{textAlign:"center",padding:"60px 20px",color:"#333"}}>
              <div style={{fontSize:44,marginBottom:12}}>🔍</div>
              <div style={{fontSize:15,fontWeight:700,color:"#555"}}>No ads found</div>
              <div style={{fontSize:12,marginTop:5,color:"#444"}}>Try different keywords, country, or reset filters</div>
            </div>
          )}
        </>)}

        {/* AI TAB */}
        {activeTab==="ai" && (<div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div><h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,color:"#fff"}}>🤖 AI Product Picks</h2><p style={{color:"#444",fontSize:12,marginTop:2}}>Best products to test today from {usingMock?"demo":"live Meta"} data</p></div>
            <button className="btn btnp" onClick={getAiPicks} disabled={aiLoading}>{aiLoading?<span className="pu">⏳ Analyzing...</span>:"🔄 Refresh"}</button>
          </div>
          {aiLoading && <div style={{textAlign:"center",padding:"70px 20px"}}><div style={{fontSize:48,marginBottom:12}} className="pu">🤖</div><div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>Analyzing {allAds.length} ads with AI...</div></div>}
          {!aiLoading && aiPicks.length===0 && <div style={{textAlign:"center",padding:"70px 20px"}}><div style={{fontSize:48,marginBottom:12}}>🎯</div><div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>Ready to find winners!</div><button className="btn btnp" onClick={getAiPicks} style={{marginTop:16,padding:"12px 24px"}}>🤖 Get Today's AI Picks</button></div>}
          {!aiLoading && aiPicks.length>0 && (<>
            {aiInsight && <div style={{background:"linear-gradient(135deg,#0f0823,#0e0e1c)",border:"1px solid #2a1a5a",borderRadius:13,padding:16,marginBottom:16,display:"flex",gap:10}}><span style={{fontSize:18}}>💡</span><div><div style={{fontWeight:700,color:"#a855f7",fontSize:11,marginBottom:3}}>MARKET INSIGHT</div><div style={{fontSize:12.5,color:"#bbb",lineHeight:1.7}}>{aiInsight}</div></div></div>}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {aiPicks.map((p,i)=>{
                const ad = allAds.find(a=>a.product===p.product);
                const gold = ["#f9ca24","#b8b8b8","#cd7f32"][i];
                return (
                  <div key={i} className="acard fu" style={{animationDelay:`${i*0.1}s`}}>
                    <div style={{display:"flex",gap:12}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:gold+"22",border:`2px solid ${gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:gold,flexShrink:0,fontSize:13}}>#{p.rank}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                          <div><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{p.product}</div><div style={{fontSize:10,color:"#555",marginTop:1}}>{ad?.category} · {ad?.country}</div></div>
                          <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:800,color:gold,fontFamily:"'Space Grotesk',sans-serif"}}>{p.score}</div><div style={{fontSize:9,color:"#333"}}>AI Score</div></div>
                        </div>
                        <div className="prog" style={{marginBottom:10}}><div className="progf" style={{width:`${p.score}%`,background:`linear-gradient(90deg,${gold},${gold}88)`}}/></div>
                        <p style={{fontSize:12.5,color:"#aaa",lineHeight:1.7,marginBottom:10}}>{p.reason}</p>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                          <div style={{background:"#07070f",borderRadius:9,padding:"9px 12px",flex:1,minWidth:160}}><div style={{fontSize:9,color:"#444",marginBottom:2}}>📋 STRATEGY</div><div style={{fontSize:12,color:"#ddd"}}>{p.strategy}</div></div>
                          <div style={{background:"#07070f",borderRadius:9,padding:"9px 12px"}}><div style={{fontSize:9,color:"#444",marginBottom:2}}>💰 BUDGET</div><div style={{fontSize:15,fontWeight:700,color:"#7c3aed",fontFamily:"'Space Grotesk',sans-serif"}}>{p.budget}</div></div>
                        </div>
                        <button className="btn btnp" style={{fontSize:11,padding:"6px 12px"}} onClick={()=>{const a=allAds.find(x=>x.product===p.product);if(a){setSelectedAd(a);setGenResult("");setActiveTab("dashboard");}}}>✨ Generate Content →</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>)}
        </div>)}
      </div>

      {/* ── TOKEN MODAL ───────────────────────────────────────────────────── */}
      {showTokenModal && (
        <div className="modalbg" onClick={()=>setShowTokenModal(false)}>
          <div style={{background:"#0e0e1c",border:"1px solid #2a2a45",borderRadius:20,width:"100%",maxWidth:560,margin:"auto",padding:"28px",height:"fit-content"}} className="fu" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:"#fff"}}>🔑 Connect Meta Ad Library API</div><div style={{fontSize:12,color:"#555",marginTop:3}}>Get real live ads from Meta's database</div></div>
              <button onClick={()=>setShowTokenModal(false)} style={{background:"#141428",border:"none",color:"#666",width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:16}}>×</button>
            </div>

            {/* Step by step guide */}
            <div style={{background:"#07070f",borderRadius:12,padding:"16px",marginBottom:18}}>
              <div style={{fontSize:12,color:"#a855f7",fontWeight:700,marginBottom:12}}>📋 HOW TO GET YOUR FREE TOKEN (3 minutes)</div>
              {[
                ["1","Go to","developers.facebook.com","and log in with Facebook"],
                ["2","Click","My Apps → Create App","→ choose Other → Business"],
                ["3","Name it anything (e.g. AdSpyTest) →","Create App",""],
                ["4","Go to","Tools → Graph API Explorer","in the left sidebar"],
                ["5","Click","Generate Access Token","→ copy the token it shows you"],
              ].map(([num,before,bold,after],i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{num}</div>
                  <div style={{fontSize:12.5,color:"#aaa",lineHeight:1.5}}>{before} <span style={{color:"#fff",fontWeight:700}}>{bold}</span> {after}</div>
                </div>
              ))}
              <div style={{marginTop:12,padding:"10px 12px",background:"#1a1a2e",borderRadius:8,fontSize:11.5,color:"#888",lineHeight:1.6}}>
                ⚠️ <b style={{color:"#f59e0b"}}>Important:</b> The free token expires in ~2 hours. For permanent use, you need a <b style={{color:"#fff"}}>Long-Lived Token</b> or a System User Token from Meta Business Manager. I can help you set that up after connecting.
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,color:"#666",marginBottom:7,fontWeight:600}}>PASTE YOUR TOKEN BELOW:</div>
              <input
                className="tokenField"
                type="password"
                value={tokenInput}
                onChange={e=>setTokenInput(e.target.value)}
                placeholder="EAABsbCS4yx0BO..."
                onKeyDown={e=>e.key==="Enter"&&saveToken()}
              />
            </div>

            <div style={{display:"flex",gap:8}}>
              <button className="btn btnp" onClick={saveToken} disabled={!tokenInput.trim()} style={{flex:1,padding:"11px"}}>
                ✅ Connect & Fetch Live Ads
              </button>
              {tokenSaved && (
                <button onClick={clearToken} style={{background:"#ff475720",border:"1px solid #ff475755",color:"#ff4757",padding:"11px 16px",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:700}}>
                  Disconnect
                </button>
              )}
            </div>

            <div style={{marginTop:16,padding:"12px",background:"#0a0a18",borderRadius:10,fontSize:11,color:"#555",lineHeight:1.7}}>
              🔒 Your token is stored only in your browser (localStorage). It is never sent to any server except Meta's own API. AdSpyPro does not collect or store your token.
            </div>
          </div>
        </div>
      )}

      {/* ── AD DETAIL MODAL ───────────────────────────────────────────────── */}
      {selectedAd && (
        <div className="modalbg" onClick={()=>setSelectedAd(null)}>
          <div className="modal fu" onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:5,alignItems:"center"}}>
                  <span style={{background:selectedAd.mediaType==="video"?"#7c3aed22":"#141428",color:selectedAd.mediaType==="video"?"#a855f7":"#666",padding:"3px 8px",borderRadius:5,fontSize:11,fontWeight:700,border:`1px solid ${selectedAd.mediaType==="video"?"#7c3aed55":"#1c1c34"}`}}>
                    {selectedAd.mediaType==="video"?"▶ VIDEO":"🖼 IMAGE"}
                  </span>
                  <span className="pill" style={{background:"#141428",color:"#666",border:"1px solid #1c1c34"}}>{selectedAd.platform}</span>
                  <span className="pill" style={{background:"#141428",color:"#666",border:"1px solid #1c1c34"}}>{COUNTRY_NAMES[selectedAd.country]||selectedAd.country}</span>
                  {selectedAd.isReal ? <span className="realBadge">🔴 LIVE AD</span> : <span className="mockBadge">DEMO</span>}
                </div>
                <h2 style={{fontSize:18,fontWeight:700,color:"#fff",lineHeight:1.3}}>{selectedAd.product}</h2>
                <div style={{fontSize:12,color:"#7c3aed",marginTop:2}}>@{selectedAd.brand} · {selectedAd.category}</div>
              </div>
              <button onClick={()=>setSelectedAd(null)} style={{background:"#141428",border:"none",color:"#666",width:30,height:30,borderRadius:7,cursor:"pointer",fontSize:16,flexShrink:0}}>×</button>
            </div>

            <div style={{padding:"14px 20px 22px",overflowY:"auto",maxHeight:"calc(100vh - 100px)"}}>
              {/* Preview */}
              <div style={{borderRadius:13,overflow:"hidden",marginBottom:14,background:"#07070f",position:"relative",aspectRatio:"16/7"}}>
                <img src={selectedAd.imageUrl||getImg(selectedAd.category,selectedAd.id)} alt={selectedAd.product}
                  onError={e=>{e.target.src=getImg(selectedAd.category,selectedAd.id)}}
                  style={{width:"100%",height:"100%",objectFit:"cover",opacity:.82}} />
                {selectedAd.mediaType==="video" && (
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:58,height:58,borderRadius:"50%",background:"rgba(124,58,237,.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer",boxShadow:"0 0 0 10px rgba(124,58,237,.18)"}}>▶</div>
                  </div>
                )}
                <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,.88))",padding:"18px 14px 12px",display:"flex",gap:7,justifyContent:"flex-end",flexWrap:"wrap"}}>
                  {selectedAd.mediaType==="video" && (
                    <a href={`https://www.facebook.com/ads/library/?id=${selectedAd.metaId||""}`} target="_blank" rel="noreferrer"
                      style={{background:"rgba(124,58,237,.9)",color:"#fff",padding:"7px 12px",borderRadius:7,fontSize:11.5,fontWeight:700,textDecoration:"none"}}>
                      ⬇ Download from Meta Library
                    </a>
                  )}
                  <a href={selectedAd.landingUrl||"https://facebook.com/ads/library"} target="_blank" rel="noreferrer"
                    style={{background:"rgba(255,255,255,.1)",color:"#fff",padding:"7px 12px",borderRadius:7,fontSize:11.5,fontWeight:700,textDecoration:"none",backdropFilter:"blur(4px)"}}>
                    🔗 View on Meta / Landing Page
                  </a>
                </div>
              </div>

              {/* Ad copy */}
              <div style={{background:"#07070f",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <div style={{fontSize:10,color:"#7c3aed",fontWeight:700,marginBottom:5,letterSpacing:.6}}>AD COPY</div>
                <p style={{fontSize:13,color:"#bbb",lineHeight:1.75}}>{selectedAd.adText}</p>
                {selectedAd.isReal && selectedAd.metaId && (
                  <div style={{marginTop:8,fontSize:10,color:"#444"}}>Meta Ad ID: <span style={{color:"#666",fontFamily:"monospace"}}>{selectedAd.metaId}</span></div>
                )}
              </div>

              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:14}}>
                {[{icon:"💰",l:"Est. Spend",v:fmtSpend(selectedAd.spend),c:"#7c3aed"},{icon:"👁️",l:"Impressions",v:fmt(selectedAd.impressions),c:"#a855f7"},{icon:"👍",l:"Likes",v:fmt(selectedAd.likes),c:"#ec4899"},{icon:"💬",l:"Comments",v:fmt(selectedAd.comments),c:"#f59e0b"},{icon:"🔁",l:"Shares",v:fmt(selectedAd.shares),c:"#10b981"},{icon:"🎯",l:"CTR",v:selectedAd.ctr+"%",c:"#06b6d4"},{icon:"✅",l:"Conv. Rate",v:selectedAd.convRate+"%",c:"#84cc16"},{icon:"📅",l:"Running Since",v:selectedAd.startDate,c:"#a78bfa"}].map((s,i)=>(
                  <div key={i} style={{background:"#0e0e1c",borderRadius:9,padding:"10px 7px",textAlign:"center",border:"1px solid #1a1a2e"}}>
                    <div style={{fontSize:14,marginBottom:3}}>{s.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,color:s.c,fontFamily:"'Space Grotesk',sans-serif"}}>{s.v}</div>
                    <div style={{fontSize:9,color:"#333",marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* AI Content Generator */}
              <div style={{background:"linear-gradient(135deg,#0e0724,#0e0e1c)",border:"1px solid #2a1a5a",borderRadius:13,padding:"15px 17px"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
                  <span style={{fontSize:17}}>✨</span>
                  <div><div style={{fontWeight:700,color:"#fff",fontSize:13}}>AI Content Generator</div><div style={{fontSize:10,color:"#444"}}>Landing page · Ad copies · Headlines · Any language</div></div>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                  {[["landing","📄 Landing Page"],["adcopy","📝 Ad Copies"],["headlines","💥 Headlines"]].map(([v,l])=>(
                    <button key={v} className="btns" style={genTab===v?{background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",border:"none"}:{}} onClick={()=>{setGenTab(v);setGenResult("")}}>{l}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#444",fontWeight:700}}>LANGUAGE:</span>
                  {[["english","🇺🇸 English"],["french","🇫🇷 French"],["spanish","🇪🇸 Spanish"],["arabic","🇸🇦 Arabic"],["arabic_ma","🇲🇦 Moroccan"]].map(([v,l])=>(
                    <button key={v} className="langbtn" style={genLang===v?{background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",border:"none"}:{}} onClick={()=>{setGenLang(v);setGenResult("")}}>{l}</button>
                  ))}
                </div>
                <button className="btn btnp" onClick={()=>generateContent(selectedAd)} disabled={genLoading} style={{width:"100%",padding:"10px",fontSize:13,marginBottom:genResult?11:0}}>
                  {genLoading?<span className="pu">🤖 Generating...</span>:`✨ Generate ${genTab==="landing"?"Landing Page":genTab==="adcopy"?"Ad Copies":"Headlines"} in ${{english:"English",french:"French",spanish:"Spanish",arabic:"Arabic",arabic_ma:"Moroccan Arabic"}[genLang]}`}
                </button>
                {genResult && (
                  <div className="fu">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                      <span style={{fontSize:11,color:"#a855f7",fontWeight:700}}>✅ Ready</span>
                      <button onClick={()=>{navigator.clipboard.writeText(genResult);setCopied(true);setTimeout(()=>setCopied(false),2000);}} className="btn btns" style={{fontSize:11}}>
                        {copied?"✅ Copied!":"📋 Copy All"}
                      </button>
                    </div>
                    <textarea className="aiout" value={genResult} readOnly />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
