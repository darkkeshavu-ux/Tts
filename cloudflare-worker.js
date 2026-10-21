const GEMINI_MODEL = "gemini-2.5-flash";
const ALLOWED_ORIGIN = "https://darkkeshavu-ux.github.io";

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN || /^http:\/\/localhost(:\d+)?$/.test(origin || "");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(origin) } });
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (url.pathname === "/health" && request.method === "GET") return json({ ok: true, service: "VoxGlow API" }, 200, origin);
    if (url.pathname !== "/api/chat") return json({ error: "Not found" }, 404, origin);
    if (request.method !== "POST") return json({ error: "Use POST for chat." }, 405, origin);
    if (origin && origin !== ALLOWED_ORIGIN && !/^http:\/\/localhost(:\d+)?$/.test(origin)) return json({ error: "This website is not allowed to use the VoxGlow API." }, 403, origin);
    if (!env.GEMINI_API_KEY) return json({ error: "Backend setup incomplete: add GEMINI_API_KEY as a Worker secret." }, 500, origin);
    let body;
    try { body = await request.json(); } catch { return json({ error: "Please send a valid JSON message." }, 400, origin); }
    if (!Array.isArray(body.messages) || body.messages.length === 0) return json({ error: "Type a message first." }, 400, origin);
    const messages = body.messages.slice(-16).filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string" && m.content.trim()).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content.slice(0, 1500) }] }));
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length) return json({ error: "Please send a new message." }, 400, origin);
    const lang = body.language === "hi" ? "Hindi" : body.language === "en" ? "English" : "the language the user writes in (Hindi or English)";
    const payload = {
      system_instruction: { parts: [{ text: "You are VoxGlow, a friendly, helpful AI voice companion. Reply in " + lang + ". If the user mixes Hindi and English, you may naturally code-switch. Keep most answers concise and easy to understand when spoken aloud. Be respectful. Never claim to be a human. Do not ask for passwords, OTPs, or private secrets." }] },
      contents: messages,
      generationConfig: { temperature: 0.8, maxOutputTokens: 700 }
    };
    try {
      const result = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify(payload)
      });
      const data = await result.json();
      if (!result.ok) {
        const detail = data?.error?.message || "AI service request failed.";
        return json({ error: result.status === 429 ? "Free AI usage limit reached. Wait a little and try again." : result.status === 400 ? "The AI rejected this request. Check your API key and try again." : "AI service error: " + detail.slice(0, 180) }, 502, origin);
      }
      const reply = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
      if (!reply) return json({ error: "The AI did not return a text reply. Try again." }, 502, origin);
      return json({ reply }, 200, origin);
    } catch {
      return json({ error: "Could not reach the AI service. Check your connection and try again." }, 502, origin);
    }
  }
};