import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════
   AIG Financial Lines Intelligence
   Premium PWA — Executive Cockpit
   © 2026 AIG — Financial Lines Intelligence
   ═══════════════════════════════════════════ */

// ── Design Tokens ──
const T = {
  navy: "#002B5C", navyDk: "#001E42", navyLt: "#003D80",
  accent: "#0072CE", accentLt: "#3D9BE0", accentBg: "#E8F2FC",
  accentA: "rgba(0,114,206,.06)",
  w: "#FFFFFF", n50: "#FAFBFC", n100: "#F3F5F7", n200: "#E2E6EB",
  n300: "#CDD3DA", n400: "#A8B1BD", n500: "#7D8A9A", n600: "#5C6B7D",
  n700: "#3D4E63", n800: "#263348", n900: "#141E2B",
};

const SEV = {
  Critique: { bg: "#FEF2F2", tx: "#991B1B", bd: "#DC2626" },
  "Élevé": { bg: "#FFFBEB", tx: "#92400E", bd: "#D97706" },
  Moyen: { bg: "#EFF6FF", tx: "#1E40AF", bd: "#2563EB" },
  Faible: { bg: "#F0FDF4", tx: "#166534", bd: "#16A34A" },
  Info: { bg: "#E8F2FC", tx: "#002B5C", bd: "#0072CE" },
};

const CATS = {
  Gouvernance: { bg: "#EDE9FE", tx: "#5B21B6" },
  "Réglementaire": { bg: "#E8F2FC", tx: "#002B5C" },
  Contentieux: { bg: "#FCE7F3", tx: "#9D174D" },
  Financier: { bg: "#FEF3C7", tx: "#92400E" },
  "M&A": { bg: "#D1FAE5", tx: "#065F46" },
  Cyber: { bg: "#FEE2E2", tx: "#991B1B" },
  Fraude: { bg: "#FFEDD5", tx: "#9A3412" },
  ESG: { bg: "#CCFBF1", tx: "#115E59" },
  "RH / Culture": { bg: "#F3F4F6", tx: "#374151" },
};

const FACT = {
  "Vérifié": { bg: "#D1FAE5", tx: "#065F46" },
  Probable: { bg: "#FFFBEB", tx: "#92400E" },
  "Hypothèse": { bg: "#EDE9FE", tx: "#5B21B6" },
  "À vérifier": { bg: "#F3F4F6", tx: "#374151" },
};

const FL_LINES = ["D&O / RCMS", "Crime / Fidelity", "Cyber", "PI / E&O", "EPL", "W&I / Transactional"];

// ── Demo Companies ──
const COMPANIES = [
  { id: "totalenergies", name: "TotalEnergies", sector: "Énergie", country: "FR", cac40: true, ticker: "TTE.PA" },
  { id: "lvmh", name: "LVMH", sector: "Luxe", country: "FR", cac40: true, ticker: "MC.PA" },
  { id: "bnp", name: "BNP Paribas", sector: "Banque", country: "FR", cac40: true, ticker: "BNP.PA" },
  { id: "axa", name: "AXA", sector: "Assurance", country: "FR", cac40: true, ticker: "CS.PA" },
  { id: "sanofi", name: "Sanofi", sector: "Pharma", country: "FR", cac40: true, ticker: "SAN.PA" },
  { id: "airbus", name: "Airbus", sector: "Aéronautique", country: "FR", cac40: true, ticker: "AIR.PA" },
  { id: "schneider", name: "Schneider Electric", sector: "Industrie", country: "FR", cac40: true, ticker: "SU.PA" },
  { id: "danone", name: "Danone", sector: "Agroalimentaire", country: "FR", cac40: true, ticker: "BN.PA" },
  { id: "loreal", name: "L'Oréal", sector: "Cosmétiques", country: "FR", cac40: true, ticker: "OR.PA" },
  { id: "safran", name: "Safran", sector: "Aéronautique", country: "FR", cac40: true, ticker: "SAF.PA" },
  { id: "stellantis", name: "Stellantis", sector: "Automobile", country: "NL", cac40: true, ticker: "STLAP.PA" },
  { id: "societe-generale", name: "Société Générale", sector: "Banque", country: "FR", cac40: true, ticker: "GLE.PA" },
  { id: "engie", name: "Engie", sector: "Énergie", country: "FR", cac40: true, ticker: "ENGI.PA" },
  { id: "capgemini", name: "Capgemini", sector: "IT Services", country: "FR", cac40: true, ticker: "CAP.PA" },
  { id: "vinci", name: "Vinci", sector: "BTP", country: "FR", cac40: true, ticker: "DG.PA" },
  { id: "orange", name: "Orange", sector: "Télécom", country: "FR", cac40: true, ticker: "ORA.PA" },
  { id: "saint-gobain", name: "Saint-Gobain", sector: "Matériaux", country: "FR", cac40: true, ticker: "SGO.PA" },
  { id: "renault", name: "Renault", sector: "Automobile", country: "FR", cac40: true, ticker: "RNO.PA" },
  { id: "carrefour", name: "Carrefour", sector: "Distribution", country: "FR", cac40: true, ticker: "CA.PA" },
  { id: "veolia", name: "Veolia", sector: "Environnement", country: "FR", cac40: true, ticker: "VIE.PA" },
  { id: "siemens", name: "Siemens", sector: "Industrie", country: "DE", cac40: false, ticker: "SIE.DE" },
  { id: "allianz", name: "Allianz", sector: "Assurance", country: "DE", cac40: false, ticker: "ALV.DE" },
  { id: "unilever", name: "Unilever", sector: "Biens de consommation", country: "GB", cac40: false, ticker: "ULVR.L" },
  { id: "nestle", name: "Nestlé", sector: "Agroalimentaire", country: "CH", cac40: false, ticker: "NESN.SW" },
];

// ── Demo Signals ──
const now = Date.now();
const DAY = 86400000;
const SIGNALS = [
  {
    id: "s1", companyId: "totalenergies", title: "Enquête anti-corruption ouverte au Nigeria",
    summary: "Le Serious Fraud Office britannique a ouvert une enquête préliminaire concernant des paiements suspects liés à des contrats d'exploration au Nigeria. TotalEnergies a confirmé coopérer pleinement.",
    source: "Reuters", sourceUrl: "https://reuters.com", date: now - DAY * 1,
    category: "Contentieux", severity: "Critique", confidence: "Vérifié",
    flAnalysis: "Impact direct D&O : les administrateurs pourraient faire l'objet de poursuites personnelles. Risque Crime/Fidelity si des employés sont impliqués. Exposition potentielle à des sanctions réglementaires multijuridictionnelles.",
    lines: ["D&O / RCMS", "Crime / Fidelity"], commercialAngle: "Revoir les limites D&O et envisager un Side-A dédié. Proposer une extension Crime couvrant les amendes et pénalités.",
    vigilance: ["Vérifier les clauses d'exclusion corruption dans la police actuelle", "Surveiller l'extension aux juridictions US (FCPA)"],
    hypotheses: ["D'autres filiales africaines pourraient être concernées", "Le montant des amendes potentielles pourrait dépasser 500M EUR"],
  },
  {
    id: "s2", companyId: "lvmh", title: "Changement de gouvernance : nouveau DG adjoint nommé",
    summary: "LVMH a annoncé la nomination d'un nouveau Directeur Général Adjoint en charge de la stratégie et du digital, issu du secteur tech. Cette nomination intervient dans le cadre du plan de succession.",
    source: "Les Echos", sourceUrl: "https://lesechos.fr", date: now - DAY * 2,
    category: "Gouvernance", severity: "Moyen", confidence: "Vérifié",
    flAnalysis: "Changement dans la gouvernance clé — à surveiller pour l'impact sur la couverture D&O. La transition de leadership peut créer une période de vulnérabilité accrue.",
    lines: ["D&O / RCMS"], commercialAngle: "Opportunité de proposer une revue de la couverture D&O lors du prochain renouvellement. Présenter l'offre Key Person.",
    vigilance: ["Vérifier que le nouveau dirigeant est bien couvert par la police existante"],
    hypotheses: ["Plan de succession plus large en préparation pour 2027"],
  },
  {
    id: "s3", companyId: "bnp", title: "Amende CNIL pour traitement illicite de données clients",
    summary: "La CNIL a prononcé une amende de 10M EUR à l'encontre de BNP Paribas pour manquements dans le traitement des données personnelles de ses clients, notamment l'absence de consentement explicite.",
    source: "CNIL", sourceUrl: "https://cnil.fr", date: now - DAY * 3,
    category: "Réglementaire", severity: "Élevé", confidence: "Vérifié",
    flAnalysis: "Exposition Cyber directe (amende RGPD). Le montant reste modéré mais crée un précédent. Impact D&O si les administrateurs n'avaient pas mis en place les contrôles adéquats.",
    lines: ["Cyber", "D&O / RCMS"], commercialAngle: "Proposer une extension de la couverture Cyber incluant les frais de défense réglementaire. Revoir les sous-limites amendes RGPD.",
    vigilance: ["Vérifier si d'autres plaintes sont en cours", "Surveiller l'appel potentiel"],
    hypotheses: ["D'autres filiales européennes pourraient recevoir des amendes similaires"],
  },
  {
    id: "s4", companyId: "capgemini", title: "Cyberattaque ransomware sur la filiale UK",
    summary: "Capgemini a révélé qu'une attaque par ransomware a touché ses systèmes au Royaume-Uni, affectant temporairement les services de plusieurs clients. L'entreprise a activé son plan de réponse aux incidents.",
    source: "Financial Times", sourceUrl: "https://ft.com", date: now - DAY * 1,
    category: "Cyber", severity: "Critique", confidence: "Vérifié",
    flAnalysis: "Sinistre Cyber probable avec notification d'incident. Responsabilité potentielle envers les clients affectés (PI/E&O). Les coûts de réponse à incident et de restauration peuvent être significatifs.",
    lines: ["Cyber", "PI / E&O"], commercialAngle: "Déclencher la notification sinistre si Capgemini est assuré chez nous. Sinon, opportunité commerciale forte au prochain renouvellement.",
    vigilance: ["Évaluer l'exposition aux données clients sensibles", "Vérifier les obligations contractuelles de notification"],
    hypotheses: ["L'attaque pourrait s'étendre à d'autres géographies", "Des class actions clients sont possibles"],
  },
  {
    id: "s5", companyId: "stellantis", title: "Licenciement massif de 4 500 employés en Italie",
    summary: "Stellantis a annoncé un plan de restructuration prévoyant la suppression de 4 500 postes dans ses usines italiennes d'ici fin 2026, dans le cadre de sa transition vers l'électrique.",
    source: "Corriere della Sera", sourceUrl: "https://corriere.it", date: now - DAY * 4,
    category: "RH / Culture", severity: "Élevé", confidence: "Vérifié",
    flAnalysis: "Risque EPL significatif en Italie — le droit du travail italien protège fortement les salariés. Possibilité de recours collectifs. Impact D&O si la restructuration est contestée par les actionnaires.",
    lines: ["EPL", "D&O / RCMS"], commercialAngle: "Proposer une extension EPL couvrant les juridictions européennes. Revoir les limites D&O en anticipation de contentieux actionnaires.",
    vigilance: ["Suivre les réactions syndicales", "Vérifier la couverture EPL multi-juridictionnelle"],
    hypotheses: ["D'autres usines européennes pourraient être concernées", "Actions actionnaires possibles si le cours chute"],
  },
  {
    id: "s6", companyId: "danone", title: "Acquisition stratégique dans le segment santé intestinale",
    summary: "Danone a annoncé l'acquisition d'une biotech américaine spécialisée dans les probiotiques de nouvelle génération pour 1.2Mds EUR, renforçant son positionnement santé.",
    source: "Bloomberg", sourceUrl: "https://bloomberg.com", date: now - DAY * 2,
    category: "M&A", severity: "Moyen", confidence: "Vérifié",
    flAnalysis: "Opportunité W&I transactionnelle. Le montant justifie une couverture dédiée. Vérifier l'exposition D&O liée aux déclarations de due diligence.",
    lines: ["W&I / Transactional", "D&O / RCMS"], commercialAngle: "Proposer immédiatement une couverture W&I. Contacter le courtier pour présenter notre capacité M&A.",
    vigilance: ["Vérifier les approbations réglementaires pendantes", "Évaluer les risques de propriété intellectuelle"],
    hypotheses: ["D'autres acquisitions bolt-on possibles dans le pipeline"],
  },
  {
    id: "s7", companyId: "societe-generale", title: "Plainte pour discrimination salariale déposée par un collectif",
    summary: "Un collectif de 200 cadres féminins de Société Générale a déposé une plainte collective pour discrimination salariale systémique, alléguant un écart de rémunération de 15% à poste équivalent.",
    source: "Le Monde", sourceUrl: "https://lemonde.fr", date: now - DAY * 5,
    category: "RH / Culture", severity: "Élevé", confidence: "Vérifié",
    flAnalysis: "Exposition EPL majeure — la plainte collective augmente significativement l'enjeu financier. Impact réputationnel pouvant affecter le cours et déclencher des actions D&O.",
    lines: ["EPL", "D&O / RCMS"], commercialAngle: "Vérifier les limites EPL actuelles. Proposer une revue de couverture urgente.",
    vigilance: ["Suivre la médiatisation de l'affaire", "Évaluer le risque de contagion au secteur bancaire"],
    hypotheses: ["D'autres établissements bancaires pourraient faire face à des plaintes similaires"],
  },
  {
    id: "s8", companyId: "engie", title: "Rapport ESG contesté par des ONG environnementales",
    summary: "Plusieurs ONG ont publié un rapport détaillé contestant les chiffres d'émissions CO2 publiés par Engie dans son rapport de durabilité 2025, alléguant une sous-estimation de 30%.",
    source: "Mediapart", sourceUrl: "https://mediapart.fr", date: now - DAY * 3,
    category: "ESG", severity: "Moyen", confidence: "Probable",
    flAnalysis: "Risque de greenwashing pouvant mener à des poursuites D&O sous CSRD. Les investisseurs ESG pourraient réagir négativement, créant une exposition securities claims.",
    lines: ["D&O / RCMS"], commercialAngle: "Alerter le courtier sur le risque CSRD. Proposer un avenant D&O couvrant explicitement les claims ESG/greenwashing.",
    vigilance: ["Surveiller la réponse officielle d'Engie", "Vérifier l'exposition aux class actions investisseurs"],
    hypotheses: ["L'AMF pourrait ouvrir une enquête", "D'autres entreprises du secteur énergie pourraient être ciblées"],
  },
  {
    id: "s9", companyId: "airbus", title: "Fraude interne détectée dans la division hélicoptères",
    summary: "Airbus a révélé avoir détecté un schéma de surfacturation impliquant plusieurs cadres de sa division Helicopters, pour un montant estimé à 45M EUR sur trois ans.",
    source: "La Tribune", sourceUrl: "https://latribune.fr", date: now - DAY * 1,
    category: "Fraude", severity: "Critique", confidence: "Vérifié",
    flAnalysis: "Sinistre Crime/Fidelity caractérisé — fraude interne par des employés. Exposition D&O si les contrôles internes étaient défaillants. Potentiel impact sur les contrats publics de défense.",
    lines: ["Crime / Fidelity", "D&O / RCMS"], commercialAngle: "Vérifier la couverture Crime existante et les sous-limites. Proposer une extension spécifique fraude interne.",
    vigilance: ["Évaluer l'impact sur les habilitations défense", "Vérifier les obligations de déclaration DPA"],
    hypotheses: ["Le montant réel pourrait être supérieur", "D'autres divisions pourraient être affectées"],
  },
  {
    id: "s10", companyId: "sanofi", title: "Rappel massif d'un médicament cardiovasculaire",
    summary: "Sanofi a initié un rappel mondial de son traitement cardiovasculaire Cardiox après la détection d'un problème de qualité dans la production. Aucun effet indésirable grave n'a été rapporté à ce stade.",
    source: "ANSM", sourceUrl: "https://ansm.sante.fr", date: now - DAY * 2,
    category: "Réglementaire", severity: "Élevé", confidence: "Vérifié",
    flAnalysis: "Exposition PI/E&O et produit significative. Les coûts de rappel et le risque de class actions patients peuvent être majeurs. Impact D&O si les actionnaires allèguent un manque de contrôle qualité.",
    lines: ["PI / E&O", "D&O / RCMS"], commercialAngle: "Surveiller l'évolution pour notification sinistre éventuelle. Proposer une revue des limites PI.",
    vigilance: ["Suivre les rapports d'effets indésirables", "Surveiller les dépôts de plaintes aux US"],
    hypotheses: ["Des effets secondaires pourraient émerger", "L'EMA pourrait lancer une investigation"],
  },
];

// ── Demo Meetings ──
const MEETINGS = [
  { id: "m1", companyId: "totalenergies", type: "Courtier", contact: "Pierre Dupont — Marsh", date: now + DAY * 3, notes: "Renouvellement D&O Q3. Discuter extension Crime.", status: "upcoming" },
  { id: "m2", companyId: "bnp", type: "Risk Manager", contact: "Marie Laurent — BNP Paribas", date: now + DAY * 7, notes: "Revue programme Cyber post-amende CNIL.", status: "upcoming" },
  { id: "m3", companyId: "capgemini", type: "Interne", contact: "Équipe Souscription Cyber", date: now + DAY * 1, notes: "Analyse impact ransomware UK.", status: "upcoming" },
];

// ── Utilities ──
const fmt = (ts) => new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (ts) => new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const ago = (ts) => {
  const d = Math.floor((now - ts) / DAY);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return "Hier";
  return `Il y a ${d}j`;
};
const mono = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const coById = (id) => COMPANIES.find(c => c.id === id);

// ── Styles (CSS-in-JS for single-file artifact) ──
const css = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif; background:${T.n100}; color:${T.n700}; font-size:14px; line-height:1.6; -webkit-font-smoothing:antialiased; }
  .app { max-width:480px; margin:0 auto; min-height:100vh; display:flex; flex-direction:column; }
  @media(min-width:768px){ .app{max-width:720px} }
  @media(min-width:1024px){ .app{max-width:960px} }

  /* Header */
  .hdr { background:${T.navy}; padding:14px 16px; display:flex; align-items:center; gap:12px; position:sticky; top:0; z-index:100; }
  .hdr-logo { border:1.5px solid #fff; padding:2px 7px; color:#fff; font-size:15px; font-weight:700; letter-spacing:0.02em; border-radius:2px; flex-shrink:0; }
  .hdr-title { color:#fff; font-size:14px; font-weight:400; opacity:.85; flex:1; }
  .hdr-btn { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); color:rgba(255,255,255,.8); border-radius:6px; padding:6px 10px; font-size:13px; cursor:pointer; }
  .hdr-btn:hover { background:rgba(255,255,255,.18); }

  /* Search bar in header */
  .hdr-search { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); color:#fff; border-radius:6px; padding:7px 12px; font-size:13px; width:100%; outline:none; }
  .hdr-search::placeholder { color:rgba(255,255,255,.45); }
  .hdr-search:focus { background:rgba(255,255,255,.15); border-color:rgba(255,255,255,.3); }

  /* Tab Bar */
  .tbar { display:flex; background:rgba(255,255,255,.97); backdrop-filter:blur(12px); border-top:1px solid ${T.n200}; position:fixed; bottom:0; left:0; right:0; z-index:100; }
  .tbar-item { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 4px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:${T.n400}; cursor:pointer; border:none; background:none; transition:color .15s; }
  .tbar-item.active { color:${T.navy}; }
  .tbar-item svg { width:20px; height:20px; }

  /* Content */
  .content { flex:1; padding:16px; padding-bottom:80px; }

  /* Cards */
  .card { background:${T.w}; border:1px solid ${T.n200}; border-radius:8px; padding:18px 20px; margin-bottom:12px; transition:border-color .15s; }
  .card:hover { border-color:${T.n300}; }
  .card-title { font-size:15px; font-weight:600; color:${T.n800}; margin-bottom:4px; }
  .card-meta { font-size:12px; color:${T.n500}; }

  /* Badges */
  .badge { display:inline-block; font-size:10px; font-weight:700; border-radius:20px; padding:3px 10px; }
  .ftag { display:inline-block; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; border-radius:4px; padding:2px 8px; }

  /* Monogram */
  .mono { background:${T.navy}; color:${T.w}; font-weight:600; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; font-size:13px; flex-shrink:0; }
  .mono-sm { width:28px; height:28px; font-size:11px; }

  /* Buttons */
  .bp { background:${T.navy}; color:#fff; border:none; border-radius:6px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; transition:background .15s; }
  .bp:hover { background:${T.navyLt}; }
  .btn-sec { background:${T.w}; border:1px solid ${T.n300}; color:${T.navy}; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; }
  .btn-sec:hover { border-color:${T.n400}; }
  .btn-ghost { background:transparent; border:none; color:${T.accent}; font-size:13px; font-weight:500; cursor:pointer; padding:6px 8px; }
  .btn-accent { background:${T.accent}; color:#fff; border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; }

  /* Chips */
  .chip { display:inline-block; background:${T.w}; border:1px solid ${T.n200}; color:${T.n600}; border-radius:20px; padding:5px 14px; font-size:12px; font-weight:500; cursor:pointer; transition:all .15s; }
  .chip.active { background:${T.accentA}; color:${T.navy}; border-color:rgba(0,114,206,.25); }

  /* Input */
  .inp { background:${T.w}; border:1px solid ${T.n200}; border-radius:6px; padding:10px 14px; font-size:14px; color:${T.n800}; outline:none; width:100%; font-family:inherit; }
  .inp:focus { border-color:${T.accent}; box-shadow:0 0 0 3px rgba(0,114,206,.08); }
  textarea.inp { resize:vertical; min-height:80px; }

  /* Bottom sheet overlay */
  .overlay { position:fixed; inset:0; background:rgba(0,43,92,.25); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:flex-end; justify-content:center; }
  .bsm { background:${T.w}; border-radius:14px 14px 0 0; max-height:85vh; overflow-y:auto; width:100%; max-width:480px; padding:20px; }
  @media(min-width:768px){ .bsm{border-radius:12px; margin-bottom:40px; max-width:600px; } .overlay{align-items:center;} }
  .bsm-handle { width:36px; height:4px; background:${T.n300}; border-radius:2px; margin:0 auto 16px; }

  /* Toast */
  .toast { position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:${T.navy}; color:#fff; border-radius:8px; padding:10px 20px; font-size:13px; box-shadow:0 4px 16px rgba(0,43,92,.18); z-index:300; }

  /* Sections */
  .sec-title { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:${T.n500}; margin-bottom:10px; margin-top:22px; }
  .sec-title:first-child { margin-top:0; }
  .divider { border:none; border-top:1px solid ${T.n200}; margin:14px 0; }

  /* Signal detail */
  .sig-block { margin-top:14px; }
  .sig-block-title { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:${T.n500}; margin-bottom:6px; }
  .sig-block p { font-size:13px; color:${T.n700}; line-height:1.6; }
  .sig-block li { font-size:13px; color:${T.n700}; margin-left:16px; margin-bottom:4px; list-style:disc; }

  /* Grid */
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(min-width:1024px){ .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;} }

  /* KPI */
  .kpi { text-align:center; padding:14px; }
  .kpi-val { font-size:28px; font-weight:600; color:${T.navy}; }
  .kpi-label { font-size:11px; color:${T.n500}; text-transform:uppercase; letter-spacing:0.08em; margin-top:2px; }

  /* Scroll horizontal */
  .hscroll { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; -webkit-overflow-scrolling:touch; }
  .hscroll::-webkit-scrollbar { display:none; }

  /* Animations */
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .fade-in { animation:fadeIn .25s ease-out; }

  /* Login */
  .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:${T.n100}; padding:20px; }
  .login-card { background:${T.w}; border:1px solid ${T.n200}; border-radius:12px; padding:40px 32px; width:100%; max-width:380px; text-align:center; }
  .login-logo { display:inline-block; border:2px solid ${T.navy}; padding:4px 12px; font-size:20px; font-weight:700; color:${T.navy}; margin-bottom:8px; }
  .login-subtitle { font-size:14px; color:${T.n600}; margin-bottom:28px; }

  /* Company list item */
  .co-item { display:flex; align-items:center; gap:12px; padding:12px 0; cursor:pointer; }
  .co-item+.co-item { border-top:1px solid ${T.n200}; }

  /* Stat row */
  .stat-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; font-size:13px; }
  .stat-row+.stat-row { border-top:1px solid ${T.n200}; }
  .stat-label { color:${T.n600}; }
  .stat-val { color:${T.n800}; font-weight:600; }

  /* Brief */
  .brief-section { margin-bottom:16px; }
  .brief-section h4 { font-size:13px; font-weight:600; color:${T.navy}; margin-bottom:6px; }
  .brief-section p, .brief-section li { font-size:13px; color:${T.n700}; line-height:1.6; }

  /* No results */
  .empty { text-align:center; padding:40px 20px; color:${T.n500}; font-size:14px; }
`;

// ── Icons (inline SVG) ──
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    home: <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    signal: <svg {...p}><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>,
    building: <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V18h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>,
    calendar: <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    digest: <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    star: <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={color} stroke="none"/></svg>,
    starO: <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    back: <svg {...p}><polyline points="15 18 9 12 15 6"/></svg>,
    x: <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    copy: <svg {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
    note: <svg {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    plus: <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    filter: <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    logout: <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    brief: <svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    check: <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    alert: <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    clock: <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  };
  return icons[name] || null;
};

// ── Main App ──
export default function AigFlIntelligence() {
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [tab, setTab] = useState("home");
  const [watchlist, setWatchlist] = useState(["totalenergies", "bnp", "capgemini", "stellantis", "danone", "airbus", "sanofi", "engie", "societe-generale", "lvmh"]);
  const [notes, setNotes] = useState({});
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Tous");
  const [sevFilter, setSevFilter] = useState("Tous");
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showBrief, setShowBrief] = useState(null);
  const [showDigest, setShowDigest] = useState(false);
  const [showAddCo, setShowAddCo] = useState(false);
  const [showNote, setShowNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [toast, setToast] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [briefCompany, setBriefCompany] = useState(null);

  const toastTimer = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  };

  const toggleWatch = (id) => {
    setWatchlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
    showToast(watchlist.includes(id) ? "Retiré de la watchlist" : "Ajouté à la watchlist");
  };

  // Filtered signals
  const filteredSignals = useMemo(() => {
    let s = SIGNALS.filter(sig => watchlist.includes(sig.companyId));
    if (catFilter !== "Tous") s = s.filter(x => x.category === catFilter);
    if (sevFilter !== "Tous") s = s.filter(x => x.severity === sevFilter);
    if (search) {
      const q = search.toLowerCase();
      s = s.filter(x => x.title.toLowerCase().includes(q) || x.summary.toLowerCase().includes(q) || coById(x.companyId)?.name.toLowerCase().includes(q));
    }
    return s.sort((a, b) => b.date - a.date);
  }, [watchlist, catFilter, sevFilter, search]);

  const signalsForCompany = (id) => SIGNALS.filter(s => s.companyId === id).sort((a, b) => b.date - a.date);
  const meetingsForCompany = (id) => MEETINGS.filter(m => m.companyId === id);

  const copyBrief = (companyId) => {
    const co = coById(companyId);
    const sigs = signalsForCompany(companyId);
    const meets = meetingsForCompany(companyId);
    let brief = `BRIEF DE PRÉPARATION — ${co.name}\n`;
    brief += `Généré le ${fmt(now)}\n\n`;
    brief += `═══ SIGNAUX ACTIFS (${sigs.length}) ═══\n\n`;
    sigs.forEach((s, i) => {
      brief += `${i + 1}. [${s.severity}] ${s.title}\n`;
      brief += `   ${s.summary}\n`;
      brief += `   Lignes impactées : ${s.lines.join(", ")}\n`;
      brief += `   Angle commercial : ${s.commercialAngle}\n\n`;
    });
    if (meets.length) {
      brief += `═══ RÉUNIONS ═══\n`;
      meets.forEach(m => {
        brief += `- ${fmt(m.date)} | ${m.type} | ${m.contact}\n`;
      });
    }
    brief += `\n— AIG Financial Lines Intelligence`;
    navigator.clipboard?.writeText(brief);
    showToast("Brief copié");
  };

  // ── Login Screen ──
  if (!auth) {
    return (
      <>
        <style>{css}</style>
        <div className="login-wrap">
          <div className="login-card fade-in">
            <div className="login-logo">AIG</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Financial Lines Intelligence</div>
            <div className="login-subtitle">Connexion sécurisée</div>
            <div style={{ marginBottom: 14 }}>
              <input className="inp" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 10 }} />
              <input className="inp" type="password" placeholder="Mot de passe" value={pw} onChange={e => setPw(e.target.value)} />
            </div>
            {loginErr && <div style={{ color: "#991B1B", fontSize: 12, marginBottom: 10 }}>{loginErr}</div>}
            <button className="bp" style={{ width: "100%" }} onClick={() => {
              if (email === "asprevel@gmail.com" && pw === "3Oct2005") { setAuth(true); setLoginErr(""); }
              else setLoginErr("Identifiants incorrects");
            }}>Se connecter</button>
            <div style={{ fontSize: 11, color: T.n500, marginTop: 16 }}>&copy; 2026 AIG — Financial Lines Intelligence</div>
          </div>
        </div>
      </>
    );
  }

  // ── Stats for dashboard ──
  const watchedSignals = SIGNALS.filter(s => watchlist.includes(s.companyId));
  const critCount = watchedSignals.filter(s => s.severity === "Critique").length;
  const highCount = watchedSignals.filter(s => s.severity === "Élevé").length;
  const todayCount = watchedSignals.filter(s => now - s.date < DAY).length;

  // ── Signal Detail Sheet ──
  const renderSignalDetail = () => {
    if (!selectedSignal) return null;
    const s = selectedSignal;
    const co = coById(s.companyId);
    const sevS = SEV[s.severity] || SEV.Info;
    const catS = CATS[s.category] || {};
    const factS = FACT[s.confidence] || {};
    return (
      <div className="overlay" onClick={() => setSelectedSignal(null)}>
        <div className="bsm fade-in" onClick={e => e.stopPropagation()}>
          <div className="bsm-handle" />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div className="mono mono-sm">{mono(co.name)}</div>
            <div>
              <div style={{ fontSize: 12, color: T.n500 }}>{co.name}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.n800 }}>{s.title}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <span className="badge" style={{ background: sevS.bg, color: sevS.tx }}>{s.severity}</span>
            <span className="ftag" style={{ background: catS.bg, color: catS.tx }}>{s.category}</span>
            <span className="badge" style={{ background: factS.bg, color: factS.tx }}>{s.confidence}</span>
          </div>
          <div style={{ fontSize: 13, color: T.n600, marginBottom: 4 }}>{s.source} — {ago(s.date)} ({fmt(s.date)})</div>
          <hr className="divider" />
          <p style={{ fontSize: 14, color: T.n700, lineHeight: 1.7 }}>{s.summary}</p>
          <div className="sig-block">
            <div className="sig-block-title">Analyse Financial Lines</div>
            <p>{s.flAnalysis}</p>
          </div>
          <div className="sig-block">
            <div className="sig-block-title">Lignes impactées</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {s.lines.map(l => <span key={l} className="chip active" style={{ fontSize: 11 }}>{l}</span>)}
            </div>
          </div>
          <div className="sig-block">
            <div className="sig-block-title">Angle commercial</div>
            <p>{s.commercialAngle}</p>
          </div>
          <div className="sig-block">
            <div className="sig-block-title">Points de vigilance</div>
            <ul>{s.vigilance.map((v, i) => <li key={i}>{v}</li>)}</ul>
          </div>
          <div className="sig-block">
            <div className="sig-block-title">Hypothèses à vérifier</div>
            <ul>{s.hypotheses.map((h, i) => <li key={i}>{h}</li>)}</ul>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn-sec" style={{ flex: 1 }} onClick={() => { setShowNote(s.id); setSelectedSignal(null); }}>
              <Icon name="note" size={14} /> Ajouter une note
            </button>
            <button className="bp" style={{ flex: 1 }} onClick={() => setSelectedSignal(null)}>Fermer</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Company Profile Sheet ──
  const renderCompanyProfile = () => {
    if (!selectedCompany) return null;
    const co = selectedCompany;
    const sigs = signalsForCompany(co.id);
    const meets = meetingsForCompany(co.id);
    const isWatched = watchlist.includes(co.id);
    return (
      <div className="overlay" onClick={() => setSelectedCompany(null)}>
        <div className="bsm fade-in" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh" }}>
          <div className="bsm-handle" />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div className="mono" style={{ width: 48, height: 48, fontSize: 16 }}>{mono(co.name)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: T.navy }}>{co.name}</div>
              <div style={{ fontSize: 12, color: T.n500 }}>{co.sector} — {co.country}{co.cac40 ? " — CAC 40" : ""}</div>
            </div>
            <button onClick={() => toggleWatch(co.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Icon name={isWatched ? "star" : "starO"} color={isWatched ? T.accent : T.n400} size={24} />
            </button>
          </div>

          <div className="grid-2" style={{ marginBottom: 18 }}>
            <div className="card kpi" style={{ marginBottom: 0 }}>
              <div className="kpi-val">{sigs.length}</div>
              <div className="kpi-label">Signaux actifs</div>
            </div>
            <div className="card kpi" style={{ marginBottom: 0 }}>
              <div className="kpi-val">{sigs.filter(s => s.severity === "Critique" || s.severity === "Élevé").length}</div>
              <div className="kpi-label">Alertes critiques</div>
            </div>
          </div>

          {meets.length > 0 && (
            <>
              <div className="sec-title">Réunions à venir</div>
              {meets.map(m => (
                <div key={m.id} className="card" style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.n800 }}>{m.type} — {fmtShort(m.date)}</div>
                  <div style={{ fontSize: 12, color: T.n500 }}>{m.contact}</div>
                </div>
              ))}
            </>
          )}

          <div className="sec-title">Signaux récents</div>
          {sigs.map(s => {
            const sevS = SEV[s.severity] || SEV.Info;
            const catS = CATS[s.category] || {};
            return (
              <div key={s.id} className="card" style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => { setSelectedCompany(null); setSelectedSignal(s); }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <span className="badge" style={{ background: sevS.bg, color: sevS.tx }}>{s.severity}</span>
                  <span className="ftag" style={{ background: catS.bg, color: catS.tx }}>{s.category}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.n800 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: T.n500, marginTop: 2 }}>{ago(s.date)}</div>
              </div>
            );
          })}
          {sigs.length === 0 && <div className="empty">Aucun signal pour cette entreprise</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn-sec" style={{ flex: 1 }} onClick={() => { copyBrief(co.id); }}>
              <Icon name="copy" size={14} /> Copier brief
            </button>
            <button className="bp" style={{ flex: 1 }} onClick={() => setSelectedCompany(null)}>Fermer</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Note Sheet ──
  const renderNoteSheet = () => {
    if (!showNote) return null;
    return (
      <div className="overlay" onClick={() => setShowNote(null)}>
        <div className="bsm fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
          <div className="bsm-handle" />
          <div style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 14 }}>Note interne</div>
          <textarea className="inp" placeholder="Votre analyse, hypothèse ou action..." value={noteText} onChange={e => setNoteText(e.target.value)} style={{ marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-sec" style={{ flex: 1 }} onClick={() => setShowNote(null)}>Annuler</button>
            <button className="bp" style={{ flex: 1 }} onClick={() => {
              setNotes(n => ({ ...n, [showNote]: [...(n[showNote] || []), { text: noteText, date: now }] }));
              setNoteText("");
              setShowNote(null);
              showToast("Note enregistrée");
            }}>Enregistrer</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Add Company Sheet ──
  const renderAddCompany = () => {
    if (!showAddCo) return null;
    const notWatched = COMPANIES.filter(c => !watchlist.includes(c.id));
    const [q, setQ] = useState("");
    const filtered = q ? notWatched.filter(c => c.name.toLowerCase().includes(q.toLowerCase())) : notWatched;
    return (
      <div className="overlay" onClick={() => setShowAddCo(false)}>
        <div className="bsm fade-in" onClick={e => e.stopPropagation()}>
          <div className="bsm-handle" />
          <div style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 14 }}>Ajouter à la watchlist</div>
          <input className="inp" placeholder="Rechercher une entreprise..." value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 14 }} />
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {filtered.map(c => (
              <div key={c.id} className="co-item" onClick={() => { toggleWatch(c.id); setShowAddCo(false); }}>
                <div className="mono mono-sm">{mono(c.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.n800 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: T.n500 }}>{c.sector} — {c.country}</div>
                </div>
                <Icon name="plus" size={18} color={T.accent} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Meeting Brief Generator ──
  const renderBriefSheet = () => {
    if (!briefCompany) return null;
    const co = coById(briefCompany);
    const sigs = signalsForCompany(briefCompany);
    const meets = meetingsForCompany(briefCompany);
    return (
      <div className="overlay" onClick={() => setBriefCompany(null)}>
        <div className="bsm fade-in" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh" }}>
          <div className="bsm-handle" />
          <div style={{ fontSize: 17, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Brief de préparation</div>
          <div style={{ fontSize: 13, color: T.n500, marginBottom: 18 }}>{co.name} — Généré le {fmt(now)}</div>

          <div className="brief-section">
            <h4>Synthèse Executive</h4>
            <p>{sigs.length} signal(s) actif(s) dont {sigs.filter(s => s.severity === "Critique").length} critique(s) et {sigs.filter(s => s.severity === "Élevé").length} élevé(s). Lignes impactées : {[...new Set(sigs.flatMap(s => s.lines))].join(", ") || "Aucune"}.</p>
          </div>

          {sigs.map((s, i) => (
            <div key={s.id} className="brief-section" style={{ background: T.n50, padding: 14, borderRadius: 8, marginBottom: 10 }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge" style={{ background: SEV[s.severity]?.bg, color: SEV[s.severity]?.tx, fontSize: 9 }}>{s.severity}</span>
                {s.title}
              </h4>
              <p style={{ marginBottom: 6 }}>{s.summary}</p>
              <p><strong style={{ color: T.navy }}>Angle :</strong> {s.commercialAngle}</p>
            </div>
          ))}

          {meets.length > 0 && (
            <div className="brief-section">
              <h4>Réunions planifiées</h4>
              {meets.map(m => <p key={m.id}>{fmtShort(m.date)} — {m.type} avec {m.contact}</p>)}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn-sec" style={{ flex: 1 }} onClick={() => setBriefCompany(null)}>Fermer</button>
            <button className="bp" style={{ flex: 1 }} onClick={() => { copyBrief(briefCompany); setBriefCompany(null); }}>
              Copier le brief
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Daily Digest ──
  const renderDigest = () => {
    if (!showDigest) return null;
    const bySev = {};
    watchedSignals.forEach(s => { bySev[s.severity] = (bySev[s.severity] || 0) + 1; });
    const byCat = {};
    watchedSignals.forEach(s => { byCat[s.category] = (byCat[s.category] || 0) + 1; });
    return (
      <div className="overlay" onClick={() => setShowDigest(false)}>
        <div className="bsm fade-in" onClick={e => e.stopPropagation()}>
          <div className="bsm-handle" />
          <div style={{ fontSize: 17, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Digest quotidien</div>
          <div style={{ fontSize: 13, color: T.n500, marginBottom: 18 }}>{fmt(now)}</div>

          <div className="grid-2" style={{ marginBottom: 18 }}>
            <div className="card kpi" style={{ marginBottom: 0 }}>
              <div className="kpi-val">{watchedSignals.length}</div>
              <div className="kpi-label">Signaux totaux</div>
            </div>
            <div className="card kpi" style={{ marginBottom: 0 }}>
              <div className="kpi-val" style={{ color: "#991B1B" }}>{critCount}</div>
              <div className="kpi-label">Critiques</div>
            </div>
          </div>

          <div className="sec-title">Par sévérité</div>
          {Object.entries(bySev).map(([sev, count]) => (
            <div key={sev} className="stat-row">
              <span className="badge" style={{ background: SEV[sev]?.bg, color: SEV[sev]?.tx }}>{sev}</span>
              <span className="stat-val">{count}</span>
            </div>
          ))}

          <div className="sec-title">Par catégorie</div>
          {Object.entries(byCat).map(([cat, count]) => (
            <div key={cat} className="stat-row">
              <span className="ftag" style={{ background: CATS[cat]?.bg, color: CATS[cat]?.tx }}>{cat}</span>
              <span className="stat-val">{count}</span>
            </div>
          ))}

          <div className="sec-title">Signaux critiques à traiter</div>
          {watchedSignals.filter(s => s.severity === "Critique").map(s => {
            const co = coById(s.companyId);
            return (
              <div key={s.id} className="card" style={{ padding: "12px 16px", cursor: "pointer", borderLeft: `3px solid ${SEV.Critique.bd}` }} onClick={() => { setShowDigest(false); setSelectedSignal(s); }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.n800 }}>{co.name} — {s.title}</div>
                <div style={{ fontSize: 12, color: T.n500 }}>{s.lines.join(", ")}</div>
              </div>
            );
          })}

          <button className="bp" style={{ width: "100%", marginTop: 18 }} onClick={() => setShowDigest(false)}>Fermer</button>
        </div>
      </div>
    );
  };

  // ── Signal Card ──
  const SignalCard = ({ s }) => {
    const co = coById(s.companyId);
    const sevS = SEV[s.severity] || SEV.Info;
    const catS = CATS[s.category] || {};
    return (
      <div className="card fade-in" style={{ cursor: "pointer", padding: "16px 18px" }} onClick={() => setSelectedSignal(s)}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div className="mono mono-sm">{mono(co.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
              <span className="badge" style={{ background: sevS.bg, color: sevS.tx }}>{s.severity}</span>
              <span className="ftag" style={{ background: catS.bg, color: catS.tx }}>{s.category}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.n800, marginBottom: 3 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: T.n500 }}>{co.name} — {ago(s.date)} — {s.source}</div>
            <div style={{ fontSize: 12, color: T.n600, marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {s.lines.map(l => <span key={l} style={{ background: T.accentBg, color: T.accent, padding: "1px 6px", borderRadius: 3, fontSize: 10, fontWeight: 600 }}>{l}</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── TAB: Home ──
  const renderHome = () => (
    <div className="fade-in">
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.navy, letterSpacing: "-0.01em" }}>Tableau de bord</div>
        <div style={{ fontSize: 13, color: T.n500 }}>{fmt(now)} — {watchlist.length} entreprises suivies</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="card kpi" style={{ marginBottom: 0, borderLeft: `3px solid ${SEV.Critique.bd}` }}>
          <div className="kpi-val" style={{ color: "#991B1B" }}>{critCount}</div>
          <div className="kpi-label">Critiques</div>
        </div>
        <div className="card kpi" style={{ marginBottom: 0, borderLeft: `3px solid ${SEV["Élevé"].bd}` }}>
          <div className="kpi-val" style={{ color: "#92400E" }}>{highCount}</div>
          <div className="kpi-label">Élevés</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18, cursor: "pointer" }} onClick={() => setShowDigest(true)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>Digest quotidien</div>
            <div style={{ fontSize: 12, color: T.n500 }}>{watchedSignals.length} signaux — {todayCount} nouveau(x) aujourd'hui</div>
          </div>
          <Icon name="digest" size={20} color={T.accent} />
        </div>
      </div>

      <div className="sec-title">Signaux prioritaires</div>
      {watchedSignals.filter(s => s.severity === "Critique" || s.severity === "Élevé").sort((a, b) => b.date - a.date).slice(0, 5).map(s => <SignalCard key={s.id} s={s} />)}

      <div className="sec-title">Réunions à venir</div>
      {MEETINGS.slice(0, 3).map(m => {
        const co = coById(m.companyId);
        return (
          <div key={m.id} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="mono mono-sm">{mono(co.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.n800 }}>{co.name} — {m.type}</div>
                <div style={{ fontSize: 12, color: T.n500 }}>{fmtShort(m.date)} — {m.contact}</div>
              </div>
              <button className="btn-ghost" onClick={() => setBriefCompany(m.companyId)} style={{ fontSize: 11 }}>Brief</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── TAB: Signals ──
  const renderSignals = () => (
    <div className="fade-in">
      <div style={{ fontSize: 22, fontWeight: 600, color: T.navy, marginBottom: 14 }}>Signaux</div>

      <input className="inp" placeholder="Rechercher un signal..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />

      <div className="hscroll" style={{ marginBottom: 8 }}>
        {["Tous", ...Object.keys(SEV)].map(s => (
          <span key={s} className={`chip ${sevFilter === s ? "active" : ""}`} onClick={() => setSevFilter(s)}>{s}</span>
        ))}
      </div>
      <div className="hscroll" style={{ marginBottom: 16 }}>
        {["Tous", ...Object.keys(CATS)].map(c => (
          <span key={c} className={`chip ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</span>
        ))}
      </div>

      <div style={{ fontSize: 12, color: T.n500, marginBottom: 10 }}>{filteredSignals.length} signal(s)</div>

      {filteredSignals.map(s => <SignalCard key={s.id} s={s} />)}
      {filteredSignals.length === 0 && <div className="empty">Aucun signal ne correspond aux filtres</div>}
    </div>
  );

  // ── TAB: Companies ──
  const renderCompanies = () => {
    const watched = COMPANIES.filter(c => watchlist.includes(c.id));
    return (
      <div className="fade-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: T.navy }}>Entreprises</div>
          <button className="btn-sec" onClick={() => setShowAddCo(true)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="plus" size={14} /> Ajouter
          </button>
        </div>
        <div style={{ fontSize: 12, color: T.n500, marginBottom: 14 }}>{watched.length} entreprise(s) suivie(s)</div>

        {watched.map(c => {
          const sigs = signalsForCompany(c.id);
          const hasCrit = sigs.some(s => s.severity === "Critique");
          return (
            <div key={c.id} className="card" style={{ padding: "14px 16px", cursor: "pointer", borderLeft: hasCrit ? `3px solid ${SEV.Critique.bd}` : undefined }} onClick={() => setSelectedCompany(c)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="mono mono-sm">{mono(c.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.n800 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: T.n500 }}>{c.sector} — {sigs.length} signal(s)</div>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }} onClick={(e) => { e.stopPropagation(); setBriefCompany(c.id); }}>Brief</button>
                  <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleWatch(c.id); }}>
                    <Icon name="star" color={T.accent} size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── TAB: Meetings ──
  const renderMeetings = () => (
    <div className="fade-in">
      <div style={{ fontSize: 22, fontWeight: 600, color: T.navy, marginBottom: 14 }}>Réunions</div>

      <div className="sec-title">À venir</div>
      {MEETINGS.filter(m => m.date > now).map(m => {
        const co = coById(m.companyId);
        return (
          <div key={m.id} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div className="mono mono-sm">{mono(co.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.n800 }}>{co.name}</div>
                <div style={{ fontSize: 13, color: T.n600, marginBottom: 4 }}>{m.type} — {m.contact}</div>
                <div style={{ fontSize: 12, color: T.n500, display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="clock" size={12} color={T.n500} /> {fmt(m.date)}
                </div>
                {m.notes && <div style={{ fontSize: 12, color: T.n600, marginTop: 6, fontStyle: "italic" }}>{m.notes}</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn-sec" style={{ flex: 1, fontSize: 12 }} onClick={() => setBriefCompany(m.companyId)}>Préparer le brief</button>
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowNote(m.id)}>Note</button>
            </div>
          </div>
        );
      })}

      {MEETINGS.filter(m => m.date > now).length === 0 && <div className="empty">Aucune réunion planifiée</div>}
    </div>
  );

  // ── Main Render ──
  const tabContent = {
    home: renderHome,
    signals: renderSignals,
    companies: renderCompanies,
    meetings: renderMeetings,
  };

  const tabs = [
    { id: "home", label: "Tableau", icon: "home" },
    { id: "signals", label: "Signaux", icon: "signal" },
    { id: "companies", label: "Sociétés", icon: "building" },
    { id: "meetings", label: "Réunions", icon: "calendar" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="hdr">
          <div className="hdr-logo">AIG</div>
          <div className="hdr-title">Financial Lines Intelligence</div>
          <button className="hdr-btn" onClick={() => setShowDigest(true)} title="Digest">
            <Icon name="digest" size={16} color="rgba(255,255,255,.8)" />
          </button>
          <button className="hdr-btn" onClick={() => { setAuth(false); setEmail(""); setPw(""); }} title="Déconnexion">
            <Icon name="logout" size={16} color="rgba(255,255,255,.8)" />
          </button>
        </div>

        <div className="content">
          {tabContent[tab]?.()}
        </div>

        <div className="tbar">
          {tabs.map(t => (
            <button key={t.id} className={`tbar-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={20} color={tab === t.id ? T.navy : T.n400} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {renderSignalDetail()}
      {renderCompanyProfile()}
      {renderNoteSheet()}
      {renderBriefSheet()}
      {renderDigest()}
      {showAddCo && renderAddCompany()}

      {toast && <div className="toast fade-in">{toast}</div>}
    </>
  );
}
