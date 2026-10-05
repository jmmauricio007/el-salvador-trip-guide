const SITE_CONTEXT = `
El Salvador Trip Guide is a multilingual travel-planning website at https://elsalvadortripguide.com.
The site offers an interactive map, destination guides, bus guidance, itineraries, tourist transportation, car rentals, eSIMs, airport transfers, hospitals, consular contacts, surf guides, Bitcoin information and partner listings.

Principal destinations include El Tunco, El Zonte, Punta Roca, El Sunzal, Lake Coatepeque, Santa Ana Volcano, Ruta de las Flores, Suchitoto, San Salvador Historic Center, Joya de Ceren, Los Cobanos, Alegria Lagoon, Rio Sapo, Conchagua Volcano, El Cuco, Las Flores and Punta Mango.

Useful internal pages:
- Interactive map: /#explore
- Personalized itinerary: /#planner
- Travel guides: /travel-guides
- Bus guide: /el-salvador-bus-guide
- Travel services: /travel-services
- Surf guide: /surf-spots-el-salvador
- Tourist transportation: /tourist-transportation-el-salvador
- Embassies and consular help: /embassies-consular-help-el-salvador
- Partner or listing claim: /partners
- Contact: info@elsalvadortripguide.com

Emergency guidance: never diagnose or provide medical treatment. For an immediate emergency, tell the traveler to contact local emergency services. Encourage users to verify schedules, prices, entry rules, road conditions and business hours directly because they can change.
`;

const ALLOWED_ORIGINS = new Set([
  "https://elsalvadortripguide.com",
  "https://www.elsalvadortripguide.com"
]);
const requestLog = new Map();

function isAllowedOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return ALLOWED_ORIGINS.has(origin) || url.hostname === "localhost" || url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000;
  const recent = (requestLog.get(ip) || []).filter(time => time > windowStart);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > 12;
}

function getText(output) {
  if (typeof output?.output_text === "string") return output.output_text.trim();
  return (output?.output || [])
    .flatMap(item => item.content || [])
    .filter(item => item.type === "output_text")
    .map(item => item.text)
    .join("\n")
    .trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  if (isRateLimited(ip)) return res.status(429).json({ error: "Too many requests" });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "Assistant is not configured yet" });
  }

  const message = String(req.body?.message || "").trim().slice(0, 1200);
  const language = ["en", "es", "fr"].includes(req.body?.language) ? req.body.language : "en";
  const pageTitle = String(req.body?.pageTitle || "").slice(0, 160);
  const pagePath = String(req.body?.pagePath || "/").slice(0, 240);
  const pageContext = String(req.body?.pageContext || "").replace(/\s+/g, " ").slice(0, 5000);

  if (!message) return res.status(400).json({ error: "Message required" });

  const languageName = { en: "English", es: "Spanish", fr: "French" }[language];
  const instructions = `You are the El Salvador Trip Guide travel assistant. Reply in ${languageName}, unless the visitor clearly asks for another language. Be welcoming, practical and concise. Use only the supplied website information and stable general travel knowledge. Never invent bus numbers, prices, schedules, opening hours, safety guarantees or entry requirements. If current information is needed, say it should be verified and provide the most relevant internal page. Do not claim you searched the live internet. Recommend at most three options. When useful, include one or two relative website links beginning with /. Clearly say you are an AI assistant if asked. For medical, legal, immigration or safety emergencies, provide general guidance only and direct the visitor to official help. Do not request payment-card, passport or health information.`;

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
        store: false,
        max_output_tokens: 350,
        instructions,
        input: `${SITE_CONTEXT}\nCurrent page: ${pageTitle} (${pagePath})\nVisible page information: ${pageContext}\n\nVisitor question: ${message}`
      })
    });

    if (!apiResponse.ok) {
      const detail = await apiResponse.text();
      console.error("OpenAI response error", apiResponse.status, detail.slice(0, 500));
      return res.status(502).json({ error: "Assistant temporarily unavailable" });
    }

    const data = await apiResponse.json();
    const answer = getText(data);
    if (!answer) return res.status(502).json({ error: "Empty assistant response" });
    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Chat endpoint error", error);
    return res.status(500).json({ error: "Assistant temporarily unavailable" });
  }
}
