import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "No prompt" }, { status: 400 });

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
    if (!ANTHROPIC_KEY) return NextResponse.json({ error: "No API key configured" }, { status: 500 });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
