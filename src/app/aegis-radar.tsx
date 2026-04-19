// ═══════════════════════════════════════════════════════════════
// AIG FL Intelligence — Worker v4.2 (+ Sources institutionnelles)
// BODACC + AMF + CNIL + deduplication + keyword filter
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = "https://uexaflnvlzatfizfyrtq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleGFmbG52bHphdGZpemZ5cnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Mzc4NDcsImV4cCI6MjA5MTAxMzg0N30.ZH-WRExhivSVNUawPjP2N62BBIl4j8sAnbrE6G1u-AI";
const USER_EMAIL = "asprevel@gmail.com";

// ── CONFIG ──
const OLLAMA_URL = "http://localhost:11434";
const OLLAMA_MODEL = "qwen2.5:7b";  // better quality, fits 8GB VRAM for classification
const BATCH_SIZE = 5;               // Up from 3
const CYCLE_MINUTES_DAY = 15;       // 6h-22h (quasi temps réel)
const CYCLE_MINUTES_NIGHT = 120;    // 22h-6h
const MAX_SIGNALS_PER_SOURCE = 2;   // Limit per source per company
const MAX_ENRICHMENT_PER_CYCLE = 200; // Cap enrichment to avoid long cycles

// ── INSURANCE KEYWORDS (all lines, pre-filter before Ollama) ──
const FL_KEYWORDS = {
  critical: [
    // Fraude & Crime
    "fraude","fraud","détournement","embezzlement","blanchiment","money laundering",
    "corruption","bribery","ransomware","data breach","fuite de données","cyber-attaque",
    // Gouvernance
    "démission ceo","ceo resignation","mise en examen","criminal charges","arrestation",
    // Juridique
    "class action","action de groupe","condamnation","inculpation","perquisition",
    // Financier
    "insolvabilité","insolvency","liquidation judiciaire","faillite","bankruptcy","défaut de paiement",
    // Compliance
    "whistleblower","lanceur d'alerte","violation rgpd","sanction amf","délit d'initié",
    // Dommages / Property
    "explosion industrielle","incendie majeur","effondrement","catastrophe naturelle majeure",
    // Aviation
    "crash aérien","accident aérien mortel",
    // Marine
    "naufrage","marée noire","oil spill",
    // K&R
    "enlèvement","kidnapping","prise d'otage"
  ],
  high: [
    // Gouvernance & D&O
    "restructuration massive","plan de restructuration","conflit d'intérêts avéré",
    "enquête judiciaire","enquête pénale","enquête amf","enquête sec",
    "procès en cours","procès contre","lawsuit filed","litige majeur",
    "sanction financière","sanction amf","sanction acpr","amende record","amende million",
    "pénalité","downgrade","non-conformité grave",
    "profit warning","avertissement sur résultats","perte nette record",
    "dette critique","surendettement",
    // EPL / RH
    "licenciement massif","plan social annoncé","layoff announced",
    "grève générale","grève illimitée","harcèlement sexuel","harcèlement moral",
    "discrimination systémique","prud'hommes","tribunal du travail",
    // Cyber
    "cyberattaque","attaque informatique","hack confirmed","incident de sécurité",
    // M&A
    "opa hostile","hostile takeover",
    // RC Environnementale
    "pollution grave","catastrophe industrielle","contamination","déversement toxique",
    "amende environnementale","infraction environnementale","mise en demeure icpe",
    // Dommages / Property
    "incendie usine","incendie entrepôt","inondation site","explosion","sinistre majeur",
    "tempête","ouragan","tremblement de terre","séisme",
    // Motor
    "accident flotte","rappel véhicules","rappel massif","défaut sécurité véhicule",
    // Marine / Transport
    "avarie majeure","collision maritime","blocage port","cargo perdu","conteneur perdu",
    // Aviation
    "incident aérien","interdiction de vol","suspension certificat","alerte sécurité aérienne",
    // RCG
    "dommage corporel","défaut de produit","product liability","rappel produit","product recall",
    "mise en cause responsabilité","accident mortel",
    // Trade Crédit
    "défaillance client majeur","impayé significatif","cessation paiement client",
    // GPA / BTA
    "accident du travail mortel","accident du travail grave"
  ],
  medium: [
    // M&A / Transactional
    "acquisition stratégique","merger","fusion","cession","divestiture","joint venture","ipo",
    // Gouvernance
    "nomination ceo","nomination dg","nomination directeur","nomination risk manager","directeur des risques","chief risk officer","CRO nommé","assemblée générale contestée",
    "changement de direction","plan de succession","confiance des investisseurs",
    "governance contestée","notation dégradée","outlook négatif","negative outlook","warning",
    // Compliance
    "esg controversé","compliance failure","audit interne","manquement",
    // Assurance (toutes lignes)
    "d&o","epl","rcpro","responsabilité civile","sinistre","claims",
    "couverture d'assurance","prime d'assurance","risque opérationnel",
    "renouvellement programme","warranty","indemnity",
    "contentieux","tribunal","procédure judiciaire","arbitrage",
    // RC Environnementale
    "pollution","dépollution","icpe","site pollué","risque environnemental",
    "empreinte carbone","devoir de vigilance","csrd",
    // Dommages
    "incendie","inondation","dégâts","sinistre climatique","intempéries",
    // Motor
    "flotte automobile","parc véhicules","sinistre auto","accident de la route",
    // Marine
    "transport maritime","fret","logistique portuaire","avarie","assurance maritime",
    // Aviation
    "flotte aérienne","maintenance aéronautique","certification aéronautique","easa","dgac",
    // RCG
    "responsabilité produit","sécurité consommateur","norme de sécurité","retrait du marché",
    // Trade Crédit
    "retard de paiement","créance douteuse","risque client","assurance-crédit","coface",
    // GPA / BTA
    "accident du travail","maladie professionnelle","prévoyance","invalidité",
    // K&R
    "extorsion","menace","rançon","sécurité des personnes","zone à risque"
  ]
};

const ALL_KEYWORDS = [
  ...FL_KEYWORDS.critical,
  ...FL_KEYWORDS.high,
  ...FL_KEYWORDS.medium
];

// ── SUPABASE HELPERS ──
async function sbFetch(table, method = "GET", body = null, query = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const prefer = method === "POST" ? "return=minimal,resolution=merge-duplicates" 
    : method === "DELETE" ? "return=minimal" 
    : method === "PATCH" ? "return=representation" : "";
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
  };
  if (prefer) headers["Prefer"] = prefer;
  try {
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) {
      // PATCH DEBUG: log full error details
      const errText = await res.text().catch(() => "(no body)");
      console.log(`  [SB ERR ${res.status}] ${method} ${table}${query ? query.slice(0, 80) : ""}`);
      console.log(`  [SB ERR body] ${errText.slice(0, 500)}`);
      if (body && method === "POST") {
        const sample = Array.isArray(body) ? body[0] : body;
        console.log(`  [SB ERR sample] ${JSON.stringify(sample).slice(0, 400)}`);
      }
      return null;
    }
    if (method === "DELETE" || prefer.includes("minimal")) return true;
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  } catch (e) {
    console.log(`  [SB EXCEPTION] ${e.message}`);
    return null;
  }
}

// ── LOAD EXISTING SIGNAL TITLES (for deduplication) ──
async function loadExistingTitles() {
  console.log("  Loading existing signals from Supabase for dedup...");
  const titles = new Set();
  let offset = 0;
  const PAGE = 1000;
  while (true) {
    const existing = await sbFetch("live_signals", "GET", null,
      `?user_email=eq.${encodeURIComponent(USER_EMAIL)}&select=title_en,title_fr&limit=${PAGE}&offset=${offset}`);
    if (!existing || existing.length === 0) break;
    existing.forEach(s => {
      if (s.title_en) titles.add(s.title_en.toLowerCase().trim());
      if (s.title_fr && s.title_fr !== s.title_en) titles.add(s.title_fr.toLowerCase().trim());
    });
    if (existing.length < PAGE) break;
    offset += PAGE;
  }
  console.log(`  ${titles.size} existing titles loaded`);
  return titles;
}

// ── RSS FETCH ──
async function fetchRSS(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AIG-FL-Worker/4.0)" }
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    return await res.text();
  } catch (e) {
    clearTimeout(timer);
    return "";
  }
}

// ── PARSE RSS ITEMS ──
function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i) || [])[1] || "";
    const link = (block.match(/<link>(.*?)<\/link>/i) || [])[1] || "";
    const pubDate = (block.match(/<pubDate>(.*?)<\/pubDate>/i) || [])[1] || "";
    const source = (block.match(/<source[^>]*>(.*?)<\/source>/i) || [])[1] || "";
    const desc = (block.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/i) || [])[1] || "";
    // Extract image URL from media:content, enclosure, or img tags
    const imgMedia = (block.match(/<media:content[^>]+url=["']([^"']+)/i) || [])[1] || "";
    const imgEnc = (block.match(/<enclosure[^>]+url=["']([^"']+)/i) || [])[1] || "";
    const imgDesc = (desc.match(/<img[^>]+src=["']([^"']+)/i) || [])[1] || "";
    const imageUrl = imgMedia || imgEnc || imgDesc || "";
    if (title.trim()) {
      const clean = (s) => s.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,"\"").replace(/&#39;/g,"'").replace(/&nbsp;/g," ").replace(/<[^>]*>/g,"").replace(/https?:\/\/\S+/g,"").replace(/\s+/g," ").trim();
      items.push({
        title: clean(title),
        link: link.trim(),
        pubDate: pubDate.trim(),
        source: clean(source),
        description: clean(desc).substring(0, 500),
        image: imageUrl.trim()
      });
    }
  }
  return items;
}

// ── KEYWORD SCORING ──
function scoreByKeywords(title, description = "") {
  const text = (title + " " + description).toLowerCase();
  for (const kw of FL_KEYWORDS.critical) {
    if (text.includes(kw)) return { score: 85, level: "critical", keyword: kw };
  }
  for (const kw of FL_KEYWORDS.high) {
    if (text.includes(kw)) return { score: 65, level: "high", keyword: kw };
  }
  for (const kw of FL_KEYWORDS.medium) {
    if (text.includes(kw)) return { score: 45, level: "medium", keyword: kw };
  }
  return { score: 0, level: "none", keyword: null };
}

// ── MATCH COMPANY ──
function matchCompany(title, companies) {
  const titleLower = title.toLowerCase();
  for (const co of companies) {
    const name = co.company_name || co.name || "";
    if (!name) continue;
    // Exact match
    if (titleLower.includes(name.toLowerCase())) return co;
    // First word match (for multi-word names like "Société Générale")
    const firstWord = name.split(" ")[0].toLowerCase();
    if (firstWord.length >= 4 && titleLower.includes(firstWord)) return co;
  }
  return null;
}

// ── SOURCES ──
// Companies with ambiguous names - add context to search
const DISAMBIGUATE = {
  "Michelin": "Michelin pneumatique",
  "Orange": "Orange telecom",
  "Shell": "Shell energy petroleum",
  "Accor": "Accor hôtellerie",
  "Vinci": "Vinci BTP construction",
  "Hermès": "Hermès luxe",
  "Bolloré": "Bolloré groupe",
  "SEB": "SEB électroménager",
  "Rubis": "Rubis énergie",
  "Nexans": "Nexans câbles",
  "Spie": "Spie services techniques",
  "GTT": "GTT GNL ingénierie",
  "Wendel": "Wendel investissement",
};

function buildSourceURLs(companyName, sector) {
  const searchName = DISAMBIGUATE[companyName] || companyName;
  const encoded = encodeURIComponent(searchName);
  return [
    { name: "Yahoo Finance", url: `https://news.google.com/rss/search?q=${encoded}+finance&hl=fr&gl=FR&ceid=FR:fr` },
    { name: "Google News FR", url: `https://news.google.com/rss/search?q=${encoded}&hl=fr&gl=FR&ceid=FR:fr` },
    { name: "Google News EN", url: `https://news.google.com/rss/search?q=${encoded}&hl=en&gl=US&ceid=US:en` },
    { name: "Reuters", url: `https://news.google.com/rss/search?q=${encoded}+site:reuters.com&hl=en&gl=US&ceid=US:en` },
    { name: "Les Echos", url: `https://news.google.com/rss/search?q=${encoded}+site:lesechos.fr&hl=fr&gl=FR&ceid=FR:fr` },
    { name: "Boursorama", url: `https://news.google.com/rss/search?q=${encoded}+site:boursorama.com&hl=fr&gl=FR&ceid=FR:fr` },
  ];
}

// ── OLLAMA ENRICHMENT ──
async function enrichBatch(signals) {
  const prompt = `Classify these insurance signals. Return ONLY a JSON array, no text.

${signals.map((s, j) => `[${j}] ${s.company}: ${s.title}`).join("\n")}

JSON format: [{"i":0,"fr":"titre en français","cat":"governance|regulatory|litigation|financial|mna|cyber|fraud|esg|hr|property|motor|marine|aviation|env","imp":50,"line":"do|epl|cyber|rcpro|crime|mna|property|motor|marine|aviation|rcg|rc_env|trade_credit|gpa_bta|knr"}]
cat: governance=board/management, regulatory=fines/compliance, litigation=lawsuits, financial=results/debt, mna=acquisitions, cyber=data/hack, fraud=fraud/corruption, esg=environment/reputation, hr=employment, property=fire/damage/natural disaster, motor=fleet/vehicles, marine=shipping/cargo, aviation=aircraft/flight, env=pollution/contamination
imp: 80-100=critical, 60-79=high, 40-59=medium
line: do=D&O, epl=employment, cyber=cyber, rcpro=professional liability, crime=crime/fraud, mna=M&A/W&I, property=property/damage, motor=motor/fleet, marine=marine/transport, aviation=aviation, rcg=general liability, rc_env=environmental liability, trade_credit=trade credit, gpa_bta=group accident, knr=kidnap&ransom`;

  try {
    const res = await fetch(OLLAMA_URL + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        options: { temperature: 0.1, num_predict: 2048 }
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = (data.message?.content || "")
      .replace(/```json\s*/g, "").replace(/```\s*/g, "")
      .replace(/\/\/.*/g, "") // Remove JS comments
      .trim();
    // Try to extract JSON array even if surrounded by text
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (e) {
    return null;
  }
}

// ── SAVE TO SUPABASE (batch) ──
async function saveSignals(signals) {
  let saved = 0;
  const BATCH = 50;
  for (let i = 0; i < signals.length; i += BATCH) {
    const batch = signals.slice(i, i + BATCH).map(s => ({
      id: s.id,
      user_email: USER_EMAIL,
      company_id: s.cid,
      company_name: s.company || "",
      title_en: s.title_en || s.title || "",
      title_fr: s.title_fr || "",
      summary_en: s.summary_en || "",
      summary_fr: s.summary_fr || "",
      source_name: s.source || "Web",
      source_url: s.source_url || null,
      image_url: s.image_url || null,
      category: s.category || "governance",
      importance: s.importance || 50,
      confidence: s.confidence || 50,
      factuality: "needs_review",
      impacts: s.impacts || [],
      fetched_at: s.fetched_at || new Date().toISOString()
    }));
    const result = await sbFetch("live_signals", "POST", batch);
    if (result) saved += batch.length;
  }
  return saved;
}

// ── CHECK OLLAMA ──
async function checkOllama() {
  try {
    const res = await fetch(OLLAMA_URL + "/api/tags");
    if (!res.ok) return false;
    const data = await res.json();
    const models = (data.models || []).map(m => m.name);
    console.log(`  Ollama    : OK (${models.join(", ")})`);
    if (!models.some(m => m.includes(OLLAMA_MODEL.split(":")[0]))) {
      console.log(`  ⚠ Model ${OLLAMA_MODEL} not found. Available: ${models.join(", ")}`);
      return false;
    }
    return true;
  } catch (e) {
    console.log("  Ollama    : OFFLINE");
    return false;
  }
}

// ══════════════════════════════════════════
// MAIN CYCLE
// ══════════════════════════════════════════
async function runCycle() {
  const startTime = Date.now();
  const now = new Date();
  console.log(`\n${"=".repeat(52)}`);
  console.log(`${now.toLocaleTimeString("fr-FR")} - Cycle de veille v4`);
  console.log(`${"=".repeat(52)}\n`);

  // Mémoire longue : consolidation auto dimanche 03:00
  await maybeRunConsolidation();

  // [1] Load watchlist
  console.log("[1] Chargement watchlist...");
  const watchlist = await sbFetch("watchlist", "GET", null,
    `?user_email=eq.${encodeURIComponent(USER_EMAIL)}`);
  if (!watchlist || watchlist.length === 0) {
    console.log("  Aucune entreprise suivie");
    return;
  }
  console.log(`  ${watchlist.length} entreprise(s)\n`);

  // [2] Load existing titles for deduplication
  console.log("[2] Chargement titres existants (déduplication)...");
  const existingTitles = await loadExistingTitles();

  // [3] Scan sources
  console.log(`\n[3] Scan multi-sources (${watchlist.length} entreprises)...`);
  const allItems = [];
  const sourceCounts = {};
  let scanned = 0;

  for (const co of watchlist) {
    const name = co.company_name || "";
    if (!name) continue;
    const sources = buildSourceURLs(name, co.company_sector || "");

    for (const src of sources) {
      const xml = await fetchRSS(src.url);
      if (!xml) continue;
      const items = parseRSSItems(xml);

      let added = 0;
      for (const item of items) {
        if (added >= MAX_SIGNALS_PER_SOURCE) break;

        // Check title dedup against existing
        const titleLower = item.title.toLowerCase().trim();
        if (existingTitles.has(titleLower)) continue;

        // Check FL keyword relevance
        const kwScore = scoreByKeywords(item.title, item.description);
        if (kwScore.level === "none") continue; // Skip non-relevant signals

        // Filter out off-topic signals for ambiguous companies
        const OFF_TOPIC = {
          "Michelin": ["guide michelin","étoile michelin","michelin star","restaurant","gastronomie","chef étoilé","gastronomique","bib gourmand"],
          "Orange": ["orange mécanique","clockwork orange","agent orange","orange juice"],
          "Vinci": ["léonard de vinci","da vinci","vinci code"],
          "Hermès": ["hermès trismégiste","myth"],
        };
        const offTopicWords = OFF_TOPIC[name];
        if (offTopicWords) {
          const titleAndDesc = (item.title + " " + (item.description || "")).toLowerCase();
          if (offTopicWords.some(w => titleAndDesc.includes(w))) continue;
        }

        const srcName = item.source || src.name;
        sourceCounts[srcName] = (sourceCounts[srcName] || 0) + 1;

        const isFrSource = ["Boursorama","Les Echos","Investir Les Echos","Le Figaro","Le Monde","Boursier.com","BFM","BFM Bourse","Capital.fr","L'Agefi","Ouest-France","Idéal Investisseur","Mediapart","franceinfo","ABC Bourse","Option Finance","La Tribune","Zonebourse","Daf-Mag.fr","Libération","La Poste Groupe","Caisse des Dépôts","Challenges","Sud Ouest","Groupe SNCF","RATP","Meilleurtaux"].some(fr => srcName.includes(fr));

        allItems.push({
          id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          cid: co.company_id,
          company: name,
          title: item.title,
          title_en: item.title,
          title_fr: item.title,
          summary_en: item.description || "",
          summary_fr: isFrSource ? (item.description || "") : "",
          source: srcName,
          source_url: item.link,
          image_url: item.image || "",
          fetched_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          category: "governance",
          importance: kwScore.score,
          confidence: 50,
          impacts: [],
          _kwLevel: kwScore.level,
          _kwMatch: kwScore.keyword
        });

        existingTitles.add(titleLower); // Prevent intra-cycle duplicates
        added++;
      }
    }
    scanned++;
    if (scanned % 20 === 0) process.stdout.write(`  ${scanned}/${watchlist.length} entreprises...\r`);
  }

  console.log(`  ${scanned}/${watchlist.length} entreprises scannées`);

  // [3b] Scan institutional sources (BODACC, AMF, CNIL)
  console.log(`\n[3b] Sources institutionnelles (BODACC, AMF, CNIL)...`);
  let instCount = 0;

  // ── BODACC: procédures collectives, liquidations, modifications ──
  for (const co of watchlist) {
    const name = co.company_name || "";
    if (!name) continue;
    try {
      const url = `https://bodacc-datadila.opendatasoft.com/api/records/1.0/search/?dataset=annonces-commerciales&q=${encodeURIComponent(name)}&rows=3&sort=dateparution`;
      const res = await fetchRSS(url, 10000);
      if (!res) continue;
      const data = JSON.parse(res);
      if (!data.records || data.records.length === 0) continue;
      for (const rec of data.records) {
        const fields = rec.fields || {};
        const recordId = rec.recordid || "";
        const numAnnonce = fields.numeroannonce || "";
        const title = `${fields.familleavis || "Annonce"}: ${name} — ${fields.typeavis || "BODACC"}`;
        const titleLower = title.toLowerCase().trim();
        if (existingTitles.has(titleLower)) continue;
        
        // Build specific BODACC URL targeting the exact announcement
        const bodaccUrl = numAnnonce
          ? `https://www.bodacc.fr/pages/annonces-commerciales/?q=${encodeURIComponent(numAnnonce)}`
          : recordId
            ? `https://bodacc-datadila.opendatasoft.com/explore/dataset/annonces-commerciales/table/?refine.recordid=${encodeURIComponent(recordId)}`
            : `https://www.bodacc.fr/pages/annonces-commerciales/?q=${encodeURIComponent(name)}`;
        
        // BODACC signals are always FL-relevant (liquidation, modification, etc.)
        const isCritical = (fields.familleavis || "").toLowerCase().includes("procédure") || 
                           (fields.typeavis || "").toLowerCase().includes("liquidation");
        const isHigh = (fields.familleavis || "").toLowerCase().includes("vente") ||
                       (fields.typeavis || "").toLowerCase().includes("modification");
        
        allItems.push({
          id: `bodacc_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
          cid: co.company_id, company: name,
          title, title_en: title, title_fr: title,
          summary_en: `${fields.typeavis || ""} — ${fields.familleavis || ""} — Tribunal: ${fields.tribunal || "N/A"}${numAnnonce ? " — Annonce n°"+numAnnonce : ""}`,
          summary_fr: `${fields.typeavis || ""} — ${fields.familleavis || ""} — Tribunal: ${fields.tribunal || "N/A"}${numAnnonce ? " — Annonce n°"+numAnnonce : ""}`,
          source: "BODACC", source_url: bodaccUrl,
          fetched_at: fields.dateparution ? new Date(fields.dateparution).toISOString() : new Date().toISOString(),
          category: isCritical ? "litigation_investigation" : "financial_stress_reporting",
          importance: isCritical ? 90 : isHigh ? 70 : 55,
          confidence: 95, impacts: [],
          _kwLevel: isCritical ? "critical" : "high", _kwMatch: "BODACC"
        });
        existingTitles.add(titleLower);
        sourceCounts["BODACC"] = (sourceCounts["BODACC"] || 0) + 1;
        instCount++;
      }
    } catch (e) {}
  }

  // ── AMF: sanctions, decisions ──
  try {
    const amfXml = await fetchRSS("https://www.amf-france.org/fr/flux-rss/display/23", 10000);
    if (amfXml) {
      const amfItems = parseRSSItems(amfXml);
      for (const item of amfItems.slice(0, 20)) {
        const titleLower = item.title.toLowerCase().trim();
        if (existingTitles.has(titleLower)) continue;
        
        // Match against watchlist companies
        const matchedCo = watchlist.find(co => {
          const name = (co.company_name || "").toLowerCase();
          return name.length >= 4 && (titleLower.includes(name) || item.description?.toLowerCase().includes(name));
        });
        
        allItems.push({
          id: `amf_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
          cid: matchedCo?.company_id || null, company: matchedCo?.company_name || "AMF",
          title: item.title, title_en: item.title, title_fr: item.title,
          summary_en: (item.description || "").substring(0, 300),
          summary_fr: (item.description || "").substring(0, 300),
          source: "AMF", source_url: item.link || "https://www.amf-france.org",
          fetched_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          category: "regulatory_compliance",
          importance: 80, confidence: 99, impacts: [{line:"do",level:"high",why:{fr:"Sanction AMF"},angle:{fr:""}}],
          _kwLevel: "high", _kwMatch: "AMF sanction"
        });
        existingTitles.add(titleLower);
        sourceCounts["AMF"] = (sourceCounts["AMF"] || 0) + 1;
        instCount++;
      }
    }
  } catch (e) {}

  // ── CNIL: sanctions RGPD ──
  try {
    const cnilXml = await fetchRSS("https://www.cnil.fr/fr/rss.xml", 10000);
    if (cnilXml) {
      const cnilItems = parseRSSItems(cnilXml);
      // Filter only sanctions-related items
      const sanctionItems = cnilItems.filter(item => {
        const t = (item.title + " " + (item.description || "")).toLowerCase();
        return t.includes("sanction") || t.includes("amende") || t.includes("mise en demeure") || t.includes("manquement");
      });
      for (const item of sanctionItems.slice(0, 10)) {
        const titleLower = item.title.toLowerCase().trim();
        if (existingTitles.has(titleLower)) continue;
        
        const matchedCo = watchlist.find(co => {
          const name = (co.company_name || "").toLowerCase();
          return name.length >= 4 && (titleLower.includes(name) || item.description?.toLowerCase().includes(name));
        });
        
        allItems.push({
          id: `cnil_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
          cid: matchedCo?.company_id || null, company: matchedCo?.company_name || "CNIL",
          title: item.title, title_en: item.title, title_fr: item.title,
          summary_en: (item.description || "").substring(0, 300),
          summary_fr: (item.description || "").substring(0, 300),
          source: "CNIL", source_url: item.link || "https://www.cnil.fr",
          fetched_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          category: "regulatory_compliance",
          importance: 75, confidence: 99, impacts: [{line:"cyber",level:"high",why:{fr:"Sanction RGPD/CNIL"},angle:{fr:""}}],
          _kwLevel: "high", _kwMatch: "CNIL sanction"
        });
        existingTitles.add(titleLower);
        sourceCounts["CNIL"] = (sourceCounts["CNIL"] || 0) + 1;
        instCount++;
      }
    }
  } catch (e) {}

  console.log(`  ${instCount} signaux institutionnels ajoutés`);

  // [3d] Stock price alerts (Yahoo Finance)
  console.log(`\n[3d] Alertes cours de bourse...`);
  let stockAlerts = 0;
  for (const co of watchlist) {
    const ticker = co.company_ticker;
    if (!ticker) continue;
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000 });
      if (!res.ok) continue;
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta || !meta.regularMarketPrice || !meta.previousClose) continue;
      
      const price = meta.regularMarketPrice;
      const prevClose = meta.previousClose;
      const change = ((price - prevClose) / prevClose) * 100;
      const absChange = Math.abs(change);
      
      if (absChange < 5) continue; // Only alert on significant moves
      
      const name = co.company_name || "";
      const isDropp = change < 0;
      const title = isDropp
        ? `${name} : chute de ${absChange.toFixed(1)}% (${price.toFixed(2)} ${meta.currency || "EUR"})`
        : `${name} : hausse de ${absChange.toFixed(1)}% (${price.toFixed(2)} ${meta.currency || "EUR"})`;
      
      const titleLower = title.toLowerCase().trim();
      if (existingTitles.has(titleLower)) continue;
      
      allItems.push({
        id: `stock_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        cid: co.company_id, company: name,
        title, title_en: title, title_fr: title,
        summary_en: `${name} stock ${isDropp ? "dropped" : "surged"} ${absChange.toFixed(1)}% to ${price.toFixed(2)} ${meta.currency || "EUR"} (prev: ${prevClose.toFixed(2)})`,
        summary_fr: `L'action ${name} a ${isDropp ? "chuté" : "bondi"} de ${absChange.toFixed(1)}% à ${price.toFixed(2)} ${meta.currency || "EUR"} (clôture préc. : ${prevClose.toFixed(2)})`,
        source: "Yahoo Finance", source_url: `https://finance.yahoo.com/quote/${ticker}`,
        fetched_at: new Date().toISOString(),
        category: "financial_stress_reporting",
        importance: absChange >= 10 ? 90 : absChange >= 7 ? 75 : 60,
        confidence: 99, 
        impacts: [{line: "do", level: absChange >= 10 ? "critical" : "high", why: {fr: `Variation cours ${absChange.toFixed(1)}%`}, angle: {fr: ""}}],
        _kwLevel: absChange >= 10 ? "critical" : "high", _kwMatch: "stock alert"
      });
      existingTitles.add(titleLower);
      sourceCounts["Yahoo Finance (Stock)"] = (sourceCounts["Yahoo Finance (Stock)"] || 0) + 1;
      stockAlerts++;
    } catch (e) {}
  }
  console.log(`  ${stockAlerts} alertes cours détectées`);

  // Deduplicate by title within this batch
  const seen = new Set();
  const unique = allItems.filter(s => {
    const key = s.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // [3c] Group similar signals (same company, same topic = synthesis)
  console.log(`\n[3c] Regroupement des signaux similaires...`);
  const STOP_WORDS = new Set(["le","la","les","de","du","des","un","une","en","et","à","au","aux","par","pour","sur","dans","avec","son","sa","ses","ce","cette","ces","que","qui","dont","ou","the","a","an","of","in","on","for","and","to","is","at","by","with","from","its","has","are","was","will","be","as","it","not","but","or","this","that","s","d","l","n"]);
  
  function getSignificantWords(text) {
    return (text || "").toLowerCase()
      .replace(/[^a-zàâäéèêëïîôùûüÿçœæ0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
  }
  
  function similarity(wordsA, wordsB) {
    if (wordsA.length === 0 || wordsB.length === 0) return 0;
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    let common = 0;
    for (const w of setA) if (setB.has(w)) common++;
    return common / Math.min(setA.size, setB.size);
  }

  // Group by company, then cluster similar titles
  const byCompany = {};
  unique.forEach(s => {
    const key = s.cid || s.company || "_unknown";
    if (!byCompany[key]) byCompany[key] = [];
    byCompany[key].push({ ...s, _words: getSignificantWords(s.title) });
  });

  const grouped = [];
  let mergeCount = 0;

  for (const [compKey, signals] of Object.entries(byCompany)) {
    const used = new Set();
    for (let i = 0; i < signals.length; i++) {
      if (used.has(i)) continue;
      const cluster = [signals[i]];
      used.add(i);
      
      for (let j = i + 1; j < signals.length; j++) {
        if (used.has(j)) continue;
        const sim = similarity(signals[i]._words, signals[j]._words);
        if (sim >= 0.5) {
          cluster.push(signals[j]);
          used.add(j);
        }
      }

      if (cluster.length === 1) {
        // Single signal, no merge needed
        const s = cluster[0];
        delete s._words;
        grouped.push(s);
      } else {
        // Merge cluster into one signal
        mergeCount += cluster.length - 1;
        // Keep the one with highest importance as primary
        cluster.sort((a, b) => (b.importance || 0) - (a.importance || 0));
        const primary = cluster[0];
        const allSources = [...new Set(cluster.map(s => s.source).filter(Boolean))];
        const allUrls = cluster.map(s => s.source_url).filter(Boolean);
        const allSummaries = cluster.map(s => s.summary_en || s.title).filter(Boolean);
        
        // Build synthesis summary
        const synthesis = allSummaries.length > 1 
          ? allSummaries.slice(0, 3).join(" | ").substring(0, 600)
          : allSummaries[0] || "";

        delete primary._words;
        grouped.push({
          ...primary,
          source: allSources.join(" | "),
          source_url: allUrls.length > 0 ? allUrls.join(" | ") : primary.source_url,
          _allUrls: allUrls,
          summary_en: synthesis,
          importance: Math.max(...cluster.map(s => s.importance || 0)),
          confidence: Math.min(99, Math.max(...cluster.map(s => s.confidence || 50)) + allSources.length * 5),
          _sourceCount: allSources.length
        });
      }
    }
  }

  console.log(`  ${mergeCount} signaux fusionnés → ${grouped.length} signaux uniques (était ${unique.length})`);

  // Sort by importance (critical first)
  grouped.sort((a, b) => b.importance - a.importance);

  console.log(`  ${grouped.length} signaux FL pertinents (après dédup + filtre keywords)`);
  console.log(`  Sources :`);
  Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([name, count]) => console.log(`    ${name}: ${count}`));

  if (grouped.length === 0) {
    console.log("\n  Aucun nouveau signal pertinent");
    return;
  }

  // [4] Enrich with Ollama (cap at MAX_ENRICHMENT_PER_CYCLE)
  const toEnrich = grouped.slice(0, MAX_ENRICHMENT_PER_CYCLE);
  const skipCount = grouped.length - toEnrich.length;
  console.log(`\n[4] Enrichissement IA (${OLLAMA_MODEL})...`);
  if (skipCount > 0) console.log(`  ⚠ ${skipCount} signaux non enrichis (cap ${MAX_ENRICHMENT_PER_CYCLE})`);

  const totalBatches = Math.ceil(toEnrich.length / BATCH_SIZE);
  let enriched = 0;

  for (let i = 0; i < toEnrich.length; i += BATCH_SIZE) {
    const batch = toEnrich.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    process.stdout.write(`  Enrichissement ${batchNum}/${totalBatches} (${Math.round(batchNum/totalBatches*100)}%)\r`);

    const result = await enrichBatch(batch);
    if (result && Array.isArray(result)) {
      for (const entry of result) {
        const sig = batch[entry.i];
        if (!sig) continue;
        if (entry.fr) sig.title_fr = entry.fr;
        const catMap = {governance:"governance",regulatory:"regulatory_compliance",litigation:"litigation_investigation",financial:"financial_stress_reporting",mna:"mna_transactions",cyber:"cyber_data_breach",fraud:"fraud_crime",esg:"esg_reputation",hr:"hr_culture",property:"financial_stress_reporting",motor:"litigation_investigation",marine:"litigation_investigation",aviation:"litigation_investigation",env:"esg_reputation"};
        if (entry.cat) sig.category = catMap[entry.cat] || entry.cat;
        if (entry.imp) sig.importance = Math.max(sig.importance, entry.imp);
        if (entry.line) sig.impacts = [{line: entry.line, level: entry.imp >= 80 ? "critical" : entry.imp >= 60 ? "high" : "medium", why: {fr: ""}, angle: {fr: ""}}];
        enriched++;
      }
    }
  }
  console.log(`\n  Enrichissement terminé : ${enriched}/${toEnrich.length}`);

  // [5] Save to Supabase
  console.log(`\n[5] Sauvegarde Supabase...`);
  const saved = await saveSignals(grouped);
  console.log(`  ${saved}/${grouped.length} sauvegardés`);

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n${"=".repeat(52)}`);
  console.log(`Terminé en ${elapsed}s. ${grouped.length} signaux (${enriched} enrichis).`);

  // Schedule next cycle
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour < 6;
  const nextMinutes = isNight ? CYCLE_MINUTES_NIGHT : CYCLE_MINUTES_DAY;
  const nextTime = new Date(Date.now() + nextMinutes * 60000);
  console.log(`Prochain cycle : ${nextTime.toLocaleTimeString("fr-FR")} (${nextMinutes}min)`);
  console.log(`${"=".repeat(52)}`);
}

// ══════════════════════════════════════════
// MÉMOIRE LONGUE — Consolidation hebdomadaire
// Dimanche 03:00 : archive signaux >7j + génère synthèses mensuelles
// ══════════════════════════════════════════

// Extrait les lignes FL uniques depuis les impacts
function extractLinesFromImpacts(impacts) {
  if (!impacts || !Array.isArray(impacts)) return [];
  const lines = new Set();
  impacts.forEach(imp => { if (imp && imp.line) lines.add(imp.line); });
  return Array.from(lines);
}

// ARCHIVAGE : live_signals (>7j) → company_memory
async function archiveOldSignals() {
  console.log("\n[MEM 1] Archivage des signaux > 7 jours...");
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let offset = 0;
  const PAGE = 500;
  let totalArchived = 0;

  while (true) {
    const oldSignals = await sbFetch(
      "live_signals", "GET", null,
      `?user_email=eq.${encodeURIComponent(USER_EMAIL)}&fetched_at=lt.${cutoff}&select=*&limit=${PAGE}&offset=${offset}`
    );
    if (!oldSignals || oldSignals.length === 0) break;

    const ids = oldSignals.map(s => `"${s.id}"`).join(",");
    const existing = await sbFetch(
      "company_memory", "GET", null,
      `?user_email=eq.${encodeURIComponent(USER_EMAIL)}&origin_signal_id=in.(${ids})&select=origin_signal_id`
    );
    const archivedIds = new Set((existing || []).map(e => e.origin_signal_id));

    const toArchive = oldSignals
      .filter(s => !archivedIds.has(s.id))
      .map(s => ({
        id: `mem_${s.id}`,
        user_email: s.user_email,
        company_id: s.company_id,
        company_name: s.company_name,
        event_date: s.fetched_at,
        title_fr: s.title_fr,
        title_en: s.title_en,
        summary_fr: s.summary_fr,
        summary_en: s.summary_en,
        category: s.category,
        importance: s.importance,
        confidence: s.confidence,
        factuality: s.factuality,
        source_name: s.source_name,
        source_url: s.source_url,
        image_url: s.image_url,
        impacts: s.impacts || [],
        impacted_lines: extractLinesFromImpacts(s.impacts),
        origin_signal_id: s.id,
        memory_type: "archived_signal"
      }));

    if (toArchive.length > 0) {
      const BATCH = 50;
      for (let i = 0; i < toArchive.length; i += BATCH) {
        const batch = toArchive.slice(i, i + BATCH);
        const result = await sbFetch("company_memory", "POST", batch);
        if (result) totalArchived += batch.length;
      }
    }

    if (oldSignals.length < PAGE) break;
    offset += PAGE;
  }

  console.log(`  ${totalArchived} signaux archivés en mémoire longue`);
  return totalArchived;
}

// GÉNÉRATION IA : narratif mensuel par entreprise
async function generateCompanySynthesis(cid, cname, entries, period, pStart, pEnd) {
  const sorted = [...entries].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  const context = sorted.map(e => {
    const date = new Date(e.event_date).toLocaleDateString("fr-FR");
    return `[${date}] ${e.category} (importance ${e.importance}) - ${e.title_fr || e.title_en}`;
  }).join("\n");

  const prompt = `Tu es un analyste senior spécialisé en assurance Financial Lines (D&O, Cyber, RC Pro, Crime).

Voici les événements marquants pour ${cname} durant la période ${period} :

${context}

Rédige une synthèse stratégique narrative de 150-250 mots en français qui :
1. Identifie les 2-3 thèmes dominants de la période
2. Analyse les implications pour le programme Financial Lines
3. Évalue la tendance de risque (en hausse / stable / en baisse)
4. Mentionne les points de vigilance pour les prochains mois

Réponds en JSON strict avec cette structure exacte :
{"synthesis":"texte narratif","key_themes":["theme1","theme2"],"risk_evolution":"rising","vigilance_points":["point1","point2"]}`;

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL, prompt, stream: false, format: "json",
        options: { temperature: 0.4, num_predict: 800 }
      })
    });

    if (!res.ok) { console.log(`  [SYNTH ERR] Ollama ${res.status} pour ${cname}`); return null; }

    const data = await res.json();
    let parsed;
    try { parsed = JSON.parse(data.response); } catch (e) { console.log(`  [SYNTH ERR] JSON invalide pour ${cname}`); return null; }

    const criticals = entries.filter(e => e.importance >= 80).length;
    const avgScore = Math.round(entries.reduce((sum, e) => sum + (e.importance || 50), 0) / entries.length);

    return {
      user_email: USER_EMAIL,
      company_id: cid,
      company_name: cname,
      period,
      period_start: pStart.toISOString().slice(0, 10),
      period_end: pEnd.toISOString().slice(0, 10),
      synthesis_text: parsed.synthesis || "",
      key_themes: parsed.key_themes || [],
      key_events: sorted.filter(e => e.importance >= 70).slice(0, 5).map(e => ({
        date: e.event_date, title: e.title_fr || e.title_en, importance: e.importance
      })),
      risk_evolution: parsed.risk_evolution || "stable",
      risk_score_avg: avgScore,
      signals_count: entries.length,
      critical_count: criticals,
      model_used: OLLAMA_MODEL
    };
  } catch (e) {
    console.log(`  [SYNTH EXCEPTION] ${cname}: ${e.message}`);
    return null;
  }
}

// SYNTHÈSE MENSUELLE : groupe par entreprise → narratif IA
async function generateMonthlySyntheses() {
  console.log("\n[MEM 2] Génération des synthèses mensuelles...");
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const periodKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  console.log(`  Période cible : ${periodKey}`);

  const memEntries = await sbFetch(
    "company_memory", "GET", null,
    `?user_email=eq.${encodeURIComponent(USER_EMAIL)}` +
    `&event_date=gte.${prevMonth.toISOString()}` +
    `&event_date=lte.${prevMonthEnd.toISOString()}` +
    `&select=*&limit=5000`
  );

  if (!memEntries || memEntries.length === 0) {
    console.log("  Aucune entrée à synthétiser");
    return 0;
  }

  const byCompany = {};
  memEntries.forEach(m => {
    if (!byCompany[m.company_id]) byCompany[m.company_id] = { name: m.company_name, entries: [] };
    byCompany[m.company_id].entries.push(m);
  });

  console.log(`  ${Object.keys(byCompany).length} entreprises candidates`);

  const existing = await sbFetch(
    "company_synthesis", "GET", null,
    `?user_email=eq.${encodeURIComponent(USER_EMAIL)}&period=eq.${periodKey}&select=company_id`
  );
  const already = new Set((existing || []).map(e => e.company_id));

  let generated = 0;
  for (const [cid, data] of Object.entries(byCompany)) {
    if (already.has(cid)) continue;
    if (data.entries.length < 2) continue;

    const synthesis = await generateCompanySynthesis(cid, data.name, data.entries, periodKey, prevMonth, prevMonthEnd);
    if (synthesis) {
      const result = await sbFetch("company_synthesis", "POST", [synthesis]);
      if (result) {
        generated++;
        console.log(`  ✓ ${data.name} (${data.entries.length} événements)`);
      }
    }
  }

  console.log(`  ${generated} synthèses générées pour ${periodKey}`);
  return generated;
}

// ORCHESTRATEUR : batch hebdomadaire complet
async function runMemoryConsolidation() {
  console.log("\n" + "=".repeat(52));
  console.log("MÉMOIRE LONGUE — Consolidation hebdomadaire");
  console.log("=".repeat(52));

  try {
    const archived = await archiveOldSignals();
    const syntheses = await generateMonthlySyntheses();
    console.log(`\n✓ Consolidation terminée : ${archived} archivés, ${syntheses} synthèses générées`);
    return { archived, syntheses, status: "success" };
  } catch (e) {
    console.log(`\n✗ Erreur consolidation: ${e.message}`);
    return { archived: 0, syntheses: 0, status: "failed", error: e.message };
  }
}

// DÉCLENCHEUR : vérifie si c'est dimanche 03:00
let lastConsolidationRun = null;
async function maybeRunConsolidation() {
  const now = new Date();
  if (now.getDay() !== 0) return; // 0 = dimanche
  if (now.getHours() !== 3) return;
  if (lastConsolidationRun) {
    const hoursSince = (now - lastConsolidationRun) / 3600000;
    if (hoursSince < 12) return;
  }
  lastConsolidationRun = now;
  await runMemoryConsolidation();
}

// ══════════════════════════════════════════
// STARTUP
// ══════════════════════════════════════════
async function main() {
  console.log(`
+----------------------------------------------+
|  AIG FL Intelligence — Worker v4.2            |
|  RSS + BODACC + AMF + CNIL + Bourse + Ollama   |
+----------------------------------------------+
`);
  console.log(`  Modèle    : ${OLLAMA_MODEL} (GPU 8GB)`);
  console.log(`  Batch     : ${BATCH_SIZE} signaux/batch`);
  console.log(`  Max/cycle : ${MAX_ENRICHMENT_PER_CYCLE} enrichissements`);
  console.log(`  Fréquence : ${CYCLE_MINUTES_DAY}min jour / ${CYCLE_MINUTES_NIGHT}min nuit`);

  const ollamaOk = await checkOllama();
  const sbTest = await sbFetch("watchlist", "GET", null, `?user_email=eq.${encodeURIComponent(USER_EMAIL)}&limit=1`);
  console.log(`  Supabase  : ${sbTest ? "OK" : "ERREUR"}`);

  if (!ollamaOk) {
    console.log("\n  ⚠ Ollama non disponible. Démarrage sans enrichissement IA.");
  }

  console.log("\n  Démarrage...\n");

  // Purge signals older than 30 days
  console.log("\n  Purge des signaux > 30 jours...");
  try {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
    await sbFetch("live_signals", "DELETE", null,
      `?user_email=eq.${encodeURIComponent(USER_EMAIL)}&fetched_at=lt.${cutoff}`);
    console.log("  Purge OK");
  } catch (e) { console.log("  Purge skipped"); }

  // Run first cycle
  await runCycle();

  // Schedule recurring cycles
  const scheduleNext = () => {
    const hour = new Date().getHours();
    const isNight = hour >= 22 || hour < 6;
    const minutes = isNight ? CYCLE_MINUTES_NIGHT : CYCLE_MINUTES_DAY;
    setTimeout(async () => {
      await runCycle();
      scheduleNext();
    }, minutes * 60000);
  };
  scheduleNext();
}

main().catch(console.error);
