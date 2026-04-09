import { NextResponse } from "next/server";

const TICKER_MAP = {
  "LVMH": "MC.PA", "TotalEnergies": "TTE.PA", "Sanofi": "SAN.PA",
  "L'Oréal": "OR.PA", "Schneider Electric": "SU.PA", "Air Liquide": "AI.PA",
  "BNP Paribas": "BNP.PA", "AXA": "CS.PA", "Hermès": "RMS.PA",
  "Safran": "SAF.PA", "EssilorLuxottica": "EL.PA", "Dassault Systèmes": "DSY.PA",
  "Vinci": "DG.PA", "Kering": "KER.PA", "Saint-Gobain": "SGO.PA",
  "Société Générale": "GLE.PA", "Danone": "BN.PA", "Engie": "ENGI.PA",
  "Capgemini": "CAP.PA", "Pernod Ricard": "RI.PA", "Michelin": "ML.PA",
  "Publicis Groupe": "PUB.PA", "Renault": "RNO.PA", "Orange": "ORA.PA",
  "Bouygues": "EN.PA", "Thales": "HO.PA", "Stellantis": "STLAP.PA",
  "Veolia": "VIE.PA", "Airbus": "AIR.PA", "Legrand": "LR.PA",
  "Crédit Agricole": "ACA.PA", "Alstom": "ALO.PA", "Worldline": "WLN.PA",
  "Edenred": "EDEN.PA", "Vivendi": "VIV.PA", "Allianz": "ALV.DE",
  "Siemens": "SIE.DE", "SAP": "SAP.DE", "Deutsche Bank": "DBK.DE",
  "BASF": "BAS.DE", "BMW": "BMW.DE", "Volkswagen": "VOW3.DE",
  "Unilever": "ULVR.L", "Shell": "SHEL.L", "HSBC": "HSBA.L",
  "AstraZeneca": "AZN.L", "BP": "BP.L", "Nestlé": "NESN.SW",
  "Novartis": "NOVN.SW", "Roche": "ROG.SW", "Zurich Insurance": "ZURN.SW",
  "STMicroelectronics": "STMPA.PA", "ArcelorMittal": "MT.PA", "Carrefour": "CA.PA",
  "Bureau Veritas": "BVI.PA", "Accor": "AC.PA", "Teleperformance": "TEP.PA",
  "Amundi": "AMUN.PA", "Arkema": "AKE.PA", "Dassault Aviation": "AM.PA",
  "Eiffage": "FGR.PA", "Eurazeo": "RF.PA", "Forvia (Faurecia)": "FRVIA.PA",
  "Gecina": "GFC.PA", "Getlink": "GET.PA", "GTT": "GTT.PA",
  "Ipsen": "IPN.PA", "JCDecaux": "DEC.PA", "Klépierre": "LI.PA",
  "Sartorius Stedim Biotech": "DIM.PA", "SEB": "SK.PA", "Sodexo": "SW.PA",
  "Sopra Steria": "SOP.PA", "Unibail-Rodamco-Westfield": "URW.PA",
  "Valeo": "FR.PA", "Wendel": "MF.PA", "Nexans": "NEX.PA",
  "Atos": "ATO.PA", "Biomérieux": "BIM.PA", "Bolloré": "BOL.PA",
  "Coface": "COFA.PA", "Covivio": "COV.PA", "Fnac Darty": "FNAC.PA",
  "Imerys": "NK.PA", "Clariane (ex-Korian)": "CLARI.PA",
  "Lagardère": "MMB.PA", "OVHcloud": "OVH.PA", "Plastic Omnium": "POM.PA",
  "Rémy Cointreau": "RCO.PA", "Rexel": "RXL.PA", "Rubis": "RUI.PA",
  "Soitec": "SOI.PA", "Spie": "SPIE.PA", "Technip Energies": "TE.PA",
  "TF1": "TFI.PA", "Trigano": "TRI.PA", "Ubisoft": "UBI.PA",
  "Vallourec": "VK.PA", "Vicat": "VCT.PA", "Eutelsat": "ETL.PA",
  "Scor": "SCR.PA", "CNP Assurances": "CNP.PA", "Nexity": "NXI.PA",
  "Elior": "ELIOR.PA", "CGG": "CGG.PA",
};

const FL_KW = {
  governance: ["ceo","cfo","coo","cto","board","director","resign","appoint","governance","chairman","pdg","démission","nomination","shareholder","vote","proxy","agm","assemblée","annual meeting","activist","executive","management change","leadership","succession","compensation","remuneration","rémunération","bonus"],
  regulatory_compliance: ["regulator","fine","penalty","compliance","investigation","probe","sanction","gdpr","amende","enquête","regulatory","antitrust","competition","autorité","aml","anti-money","sec ","fca ","amf ","bafin","eba","ecb","bce","audit","inspecteur","enforcement","violation","infringement","consent order","mise en demeure"],
  litigation_investigation: ["lawsuit","litigation","court","sue","trial","settlement","class action","procès","contentieux","plaintiff","defendant","arbitration","damages","tribunal","verdict","ruling","appeal","injunction","indictment","criminal charge"],
  financial_stress_reporting: ["debt","credit rating","downgrade","upgrade","loss","restructuring","restatement","earnings","profit warning","dette","perte","revenue","results","quarterly","annual results","forecast","guidance","outlook","analyst","price target","share price","stock","market cap","valuation","dividend","buyback","rachat","cash flow","margin","ebitda","rating","moody","fitch","s&p","bond","refinanc","capital increase","augmentation de capital","profit","bénéfice","chiffre d'affaires","résultats","prévision","objectif de cours","action","cours","capitalisation","investissement","investment"],
  mna_transactions: ["acquisition","merger","takeover","deal","acquire","bid","fusion","rachat","opa","ipo","spin-off","divestiture","cession","joint venture","partnership","partenariat","stake","participation","listing","introduction en bourse","consolidation"],
  cyber_data_breach: ["cyber","hack","breach","ransomware","data leak","security incident","cyberattaque","fuite","piratage","phishing","malware","vulnerability","data protection","encryption","privacy","outage","panne","it failure","système d'information"],
  fraud_crime: ["fraud","corruption","bribery","embezzlement","money laundering","whistleblower","fraude","blanchiment","misconduct","forgery","false accounting","insider trading","délit d'initié","abus de biens","détournement","escroquerie"],
  esg_reputation: ["esg","climate","environmental","sustainability","pollution","emissions","carbon","environnement","climat","green","renewable","social responsibility","csr","rse","biodiversity","waste","déchet","net zero","transition énergétique","deforestation","human rights","droits humains","supply chain","fournisseur","reputation","scandale","controversy"],
  hr_culture: ["layoff","strike","harassment","discrimination","workplace","employee","labor","licenciement","grève","harcèlement","restructuration sociale","plan social","hiring","recrutement","talent","diversity","diversité","inclusion","safety","sécurité au travail","accident","workers","salariés","syndicat","union","prud'hom"],
};

function detectCat(text) {
  const t = text.toLowerCase();
  let best = "financial_stress_reporting", bestN = 0;
  for (const [cat, kws] of Object.entries(FL_KW)) {
    const n = kws.filter(k => t.includes(k)).length;
    if (n > bestN) { bestN = n; best = cat; }
  }
  return best;
}

function detectImp(text) {
  const t = text.toLowerCase();
  const crit = ["fraud","ransomware","investigation","resign","class action","corruption","whistleblower","data breach","restructuring","downgrade","criminal"];
  const high = ["lawsuit","layoff","downgrade","acquisition","restructuring","penalty","probe","merger","takeover","sanction","fine","hack"];
  const med = ["earnings","results","analyst","price target","dividend","rating","esg","compliance","partnership"];
  const c = crit.filter(w => t.includes(w)).length;
  const h = high.filter(w => t.includes(w)).length;
  const m = med.filter(w => t.includes(w)).length;
  if (c >= 2) return 88 + Math.floor(Math.random() * 10);
  if (c >= 1) return 75 + Math.floor(Math.random() * 13);
  if (h >= 1) return 62 + Math.floor(Math.random() * 16);
  if (m >= 1) return 48 + Math.floor(Math.random() * 14);
  return 35 + Math.floor(Math.random() * 20);
}

function detectLines(cat, text) {
  const t = text.toLowerCase();
  const lines = [];
  const primary = { governance:"do", regulatory_compliance:"do", litigation_investigation:"rcpro", financial_stress_reporting:"do", mna_transactions:"mna", cyber_data_breach:"cyber", fraud_crime:"fraud", esg_reputation:"do", hr_culture:"epl" };
  lines.push(primary[cat] || "do");
  if (t.includes("cyber") || t.includes("hack") || t.includes("breach") || t.includes("data")) lines.push("cyber");
  if (t.includes("fraud") || t.includes("corruption") || t.includes("embezzlement") || t.includes("whistleblower")) lines.push("fraud");
  if (t.includes("merger") || t.includes("acquisition") || t.includes("takeover") || t.includes("ipo") || t.includes("spin")) lines.push("mna");
  if (t.includes("employee") || t.includes("layoff") || t.includes("harassment") || t.includes("strike") || t.includes("discrimination")) lines.push("epl");
  if (t.includes("liability") || t.includes("professional") || t.includes("negligence") || t.includes("malpractice")) lines.push("rcpro");
  if (t.includes("environment") || t.includes("pollution") || t.includes("emission") || t.includes("climate")) lines.push("rc_env");
  if (t.includes("transport") || t.includes("shipping") || t.includes("cargo") || t.includes("vessel") || t.includes("maritime")) lines.push("marine");
  if (t.includes("vehicle") || t.includes("automotive") || t.includes("car ") || t.includes("fleet") || t.includes("motor")) lines.push("motor");
  if (t.includes("property") || t.includes("building") || t.includes("fire") || t.includes("damage") || t.includes("facility")) lines.push("property");
  if (t.includes("credit") || t.includes("trade finance") || t.includes("export") || t.includes("import")) lines.push("trade_credit");
  if (t.includes("aviation") || t.includes("airline") || t.includes("aircraft") || t.includes("flight")) lines.push("aviation");
  return [...new Set(lines)];
}

const LINE_MAP = { governance:"do", regulatory_compliance:"do", litigation_investigation:"rcpro", financial_stress_reporting:"do", mna_transactions:"mna", cyber_data_breach:"cyber", fraud_crime:"fraud", esg_reputation:"do", hr_culture:"epl" };

async function fetchYahoo(ticker) {
  try {
    const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml)) !== null && items.length < 4) {
      const x = m[1];
      const title = (x.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || x.match(/<title>(.*?)<\/title>/) || [])[1] || "";
      const desc = (x.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || x.match(/<description>(.*?)<\/description>/) || [])[1] || "";
      const pubDate = (x.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || "";
      const source = (x.match(/<source[^>]*>(.*?)<\/source>/) || [])[1] || "Yahoo Finance";
      if (title) items.push({ title: title.trim(), desc: desc.trim(), pubDate, source });
    }
    return items;
  } catch (e) { return []; }
}

async function enhanceWithClaude(signals) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || signals.length === 0) return signals;
  try {
    const prompt = `Analyze these news headlines for Financial Lines insurance (D&O, Crime, Cyber, PI/E&O, EPL) relevance. For each, provide a French translation of the title, and a one-sentence FL impact analysis in both EN and FR.

${signals.map((s, i) => `${i}. [${s.company}] ${s.title_en}`).join("\n")}

Respond ONLY with a JSON array:
[{"i":0,"fr":"titre en français","why_en":"FL impact","why_fr":"impact FL","imp":0-100}]
No markdown. Return [] if none relevant.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2048, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) return signals;
    const data = await res.json();
    let text = (data.content || []).map(b => b.text || "").join("");
    text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) return signals;
    return signals.map((s, idx) => {
      const e = arr.find(x => x.i === idx);
      if (!e) return s;
      return { ...s, title: { en: s.title_en, fr: e.fr || s.title_en }, summary: { ...s.summary, fr: e.fr || s.summary.fr }, importance: e.imp || s.importance, impacts: [{ ...s.impacts[0], why: { en: e.why_en || s.impacts[0].why.en, fr: e.why_fr || s.impacts[0].why.fr } }] };
    });
  } catch (e) { return signals; }
}

export async function POST(req) {
  try {
    const { companies, lang = "fr" } = await req.json();
    if (!companies || companies.length === 0) return NextResponse.json({ error: "No companies" }, { status: 400 });

    const batch = companies.slice(0, 6);
    const allSigs = [];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const results = await Promise.all(batch.map(async (co) => {
      const ticker = co.ticker || TICKER_MAP[co.name] || null;
      if (!ticker) return [];
      const news = await fetchYahoo(ticker);
      return news.filter(n => !n.pubDate || new Date(n.pubDate).getTime() > weekAgo).slice(0, 3).map(n => {
        const text = `${n.title} ${n.desc}`;
        const cat = detectCat(text);
        const imp = detectImp(text);
        const lines = detectLines(cat, text);
        const level = imp >= 85 ? "critical" : imp >= 70 ? "high" : imp >= 50 ? "medium" : "low";
        return {
          id: `yf-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          company: co.name, title_en: n.title,
          title: { en: n.title, fr: n.title },
          summary: { en: n.desc || n.title, fr: n.desc || n.title },
          source: n.source || "Yahoo Finance",
          category: cat, importance: imp, confidence: 72,
          factuality: "needs_review",
          impacts: lines.map((l,i) => ({ line: l, level: i === 0 ? level : "medium", why: { en: `Detected for ${co.name}. Review for FL relevance.`, fr: `Détecté pour ${co.name}. À analyser pour pertinence FL.` }, angle: { en: "", fr: "" } })),
          live: true, fetchedAt: new Date().toISOString(),
        };
      });
    }));

    results.forEach(r => allSigs.push(...r));
    const enhanced = await enhanceWithClaude(allSigs);

    return NextResponse.json({ signals: enhanced, timestamp: new Date().toISOString(), count: enhanced.length, source: "yahoo_finance" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
