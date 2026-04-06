import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { transcript, lang = "fr", company = "" } = await req.json();
    if (!transcript || transcript.trim().length < 20) {
      return NextResponse.json({ summary: transcript }, { status: 200 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    // If no API key, return a basic formatted version
    if (!apiKey) {
      const date = new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
      const prefix = lang === "fr" 
        ? `📝 Résumé de réunion — ${company} — ${date}\n\n`
        : `📝 Meeting summary — ${company} — ${date}\n\n`;
      return NextResponse.json({ summary: prefix + transcript.trim() });
    }

    // Use Claude to generate FL-focused summary
    const systemPrompt = lang === "fr"
      ? `Tu es une analyste senior Financial Lines (D&O, Crime, Cyber, PI/E&O, EPL, Risques Transactionnels) en assurance grandes entreprises. Tu résumes des conversations de réunion avec des courtiers et Risk Managers.

Génère un résumé structuré et concis de cette transcription de réunion. Le résumé doit :
1. Commencer par "📝 Résumé de réunion — ${company}" et la date du jour
2. Identifier les points clés discutés
3. Mettre en évidence les signaux pertinents pour les Financial Lines
4. Lister les actions à suivre
5. Noter les questions restées ouvertes

Sois factuel, professionnel, et concis. Utilise des puces. Ne dépasse pas 300 mots.`
      : `You are a senior Financial Lines (D&O, Crime, Cyber, PI/E&O, EPL, Transactional Risks) insurance analyst for large corporates. You summarize meeting conversations with brokers and Risk Managers.

Generate a structured, concise summary of this meeting transcript. The summary must:
1. Start with "📝 Meeting summary — ${company}" and today's date
2. Identify key points discussed
3. Highlight signals relevant to Financial Lines
4. List follow-up actions
5. Note open questions

Be factual, professional, and concise. Use bullet points. Stay under 300 words.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: `Voici la transcription de la réunion :\n\n${transcript}` }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ summary: transcript });
    }

    const data = await res.json();
    const summary = (data.content || []).map(b => b.text || "").join("");
    
    return NextResponse.json({ summary: summary || transcript });
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json({ summary: transcript || "" });
  }
}
