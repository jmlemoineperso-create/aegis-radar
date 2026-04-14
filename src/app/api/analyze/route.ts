import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "No prompt" }, { status: 400 });

    const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
    if (!GEMINI_KEY) return NextResponse.json({ error: "No Gemini API key configured" }, { status: 500 });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return NextResponse.json({
      content: [{ type: "text", text: text }]
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error: " + e.message }, { status: 500 });
  }
}
