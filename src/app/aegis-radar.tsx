"use client";
import { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext } from "react";

// ── Supabase REST helper (no library needed) ──
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const sbOk = !!(SB_URL && SB_KEY);
const sbFetch = async (table, method = "GET", body = null, query = "") => {
  if (!sbOk) return null;
  const url = `${SB_URL}/rest/v1/${table}${query}`;
  const headers = { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json", "Prefer": method === "POST" ? "return=representation" : method === "PATCH" ? "return=representation" : "" };
  try {
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  } catch (e) { return null; }
};

// ═══════════════════════════════════════════════════════════════
// AEGIS RADAR v8 — Fully Bilingual (FR/EN)
// 12 companies · 48 signals · 90 impacts · 12 notes
// All content translated · Protected login
// ═══════════════════════════════════════════════════════════════

// ── i18n ──
const T={
  onboarding_title:{en:"Track the signals that matter",fr:"Suivez les signaux qui comptent"},
  onboarding_sub:{en:"Follow key companies, spot the right signals, and prepare better Financial Lines conversations.",fr:"Suivez les entreprises clés, identifiez les bons signaux, et préparez de meilleures conversations Financial Lines."},
  onboarding_cta:{en:"Get started",fr:"Commencer"},
  email:{en:"Email",fr:"Email"},password:{en:"Password",fr:"Mot de passe"},
  login_err:{en:"Incorrect email or password",fr:"Email ou mot de passe incorrect"},
  dashboard_title:{en:"Executive Radar",fr:"Radar Exécutif"},
  dashboard_sub:{en:"Prioritized company signals for your Financial Lines portfolio.",fr:"Signaux prioritaires pour votre portefeuille Financial Lines."},
  greeting_morning:{en:"Good morning, Anne-Sophie",fr:"Bonjour, Anne-Sophie"},
  greeting_afternoon:{en:"Good afternoon, Anne-Sophie",fr:"Bon après-midi, Anne-Sophie"},
  greeting_evening:{en:"Good evening, Anne-Sophie",fr:"Bonsoir, Anne-Sophie"},
  dedication:{en:"© Designed & built by Jean-Maurice Lemoine",fr:"© Conçu et développé par Jean-Maurice Lemoine"},
  dedication_sub:{en:"For Anne-Sophie — because your work deserves the right tools.",fr:"Pour Anne-Sophie — parce que ton travail mérite les bons outils."},
  daily_digest:{en:"Daily Digest",fr:"Synthèse du jour"},
  digest_full_title:{en:"Daily Intelligence Brief",fr:"Brief de veille quotidien"},
  digest_full_sub:{en:"All activity across your monitored companies in the last 24 hours.",fr:"Toute l'activité de vos entreprises surveillées sur les dernières 24 heures."},
  no_activity:{en:"No activity detected in the last 24 hours.",fr:"Aucune activité détectée sur les dernières 24 heures."},
  next_refresh:{en:"Next auto-refresh in",fr:"Prochain rafraîchissement dans"},
  minutes:{en:"min",fr:"min"},
  live_monitoring:{en:"Live monitoring active",fr:"Veille active en temps réel"},
  view_digest:{en:"View full digest",fr:"Voir la synthèse complète"},
  copy_digest:{en:"Copy daily report",fr:"Copier le rapport quotidien"},
  signal_count:{en:"signals detected",fr:"signaux détectés"},
  companies_monitored:{en:"companies monitored",fr:"entreprises surveillées"},
  highest_risk:{en:"Highest risk",fr:"Risque le plus élevé"},
  risk_overview:{en:"Risk overview",fr:"Vue d'ensemble des risques"},
  recent_activity:{en:"Recent activity",fr:"Activité récente"},
  no_data_refresh:{en:"Tap the refresh button to start monitoring.",fr:"Appuyez sur le bouton refresh pour démarrer la veille."},
  critical_signal:{en:"critical signal",fr:"signal critique"},critical_signals:{en:"critical signals",fr:"signaux critiques"},
  across:{en:"across",fr:"sur"},companies_lc:{en:"companies",fr:"entreprises"},
  watchlist_label:{en:"Watchlist",fr:"Watchlist"},active:{en:"Active",fr:"Actifs"},critical_lbl:{en:"Critical",fr:"Critiques"},
  portfolio:{en:"Portfolio",fr:"Portefeuille"},portfolio_risk:{en:"Risk distribution",fr:"Répartition des risques"},portfolio_lines:{en:"Lines coverage",fr:"Couverture par ligne"},portfolio_top:{en:"Most exposed",fr:"Plus exposées"},priority_feed:{en:"Priority feed",fr:"Flux prioritaire"},
  view_grid:{en:"Grid",fr:"Grille"},view_list:{en:"List",fr:"Liste"},
  sort_recent:{en:"Most recent",fr:"Plus récent"},sort_important:{en:"Most important",fr:"Plus important"},sort_risk:{en:"Risk",fr:"Risque"},sort_alpha:{en:"A→Z",fr:"A→Z"},sort_signals:{en:"Signals",fr:"Signaux"},
  no_signals_match:{en:"No signals match",fr:"Aucun signal correspondant"},
  adjust_filters:{en:"Try adjusting your filters",fr:"Essayez d'ajuster vos filtres"},
  no_signals_yet:{en:"No relevant signals detected yet.",fr:"Aucun signal pertinent détecté pour le moment."},
  radar_will_update:{en:"Your radar will update as new events are added.",fr:"Votre radar se mettra à jour avec les nouveaux événements."},
  watchlist_title:{en:"Watchlist",fr:"Watchlist"},
  watchlist_sub:{en:"The companies you actively monitor.",fr:"Les entreprises que vous surveillez activement."},
  tracked:{en:"Tracked",fr:"Suivies"},
  add_company:{en:"Add a company",fr:"Ajouter une entreprise"},
  search_company:{en:"Search company name, ticker, or sector",fr:"Rechercher par nom, ticker ou secteur"},
  add_to_watchlist:{en:"Add to watchlist",fr:"Ajouter au suivi"},
  no_companies_yet:{en:"No companies yet.",fr:"Aucune entreprise pour le moment."},
  no_companies_sub:{en:"Add your first company to start tracking meaningful signals.",fr:"Ajoutez votre première entreprise pour commencer le suivi."},
  all_signals:{en:"All Signals",fr:"Tous les signaux"},
  filter_signals:{en:"Filter signals…",fr:"Filtrer les signaux…"},
  search_placeholder:{en:"Search signals, companies…",fr:"Rechercher signaux, entreprises…"},
  notes_title:{en:"Notes",fr:"Notes"},new_note:{en:"New",fr:"Nouveau"},
  new_note_title:{en:"New note",fr:"Nouvelle note"},
  company_optional:{en:"Company (optional)",fr:"Entreprise (optionnel)"},
  general:{en:"— General —",fr:"— Général —"},
  tag_label:{en:"Tag",fr:"Tag"},note_label:{en:"Note",fr:"Note"},
  note_placeholder:{en:"Write your observation, hypothesis, or follow-up point…",fr:"Notez votre observation, hypothèse ou point de suivi…"},
  save_note:{en:"Save note",fr:"Enregistrer"},note_saved:{en:"Note saved",fr:"Note enregistrée"},
  no_notes_yet:{en:"No notes yet.",fr:"Aucune note pour le moment."},
  no_notes_sub:{en:"Save your thoughts, hypotheses, or follow-up points here.",fr:"Enregistrez vos observations, hypothèses ou points de suivi ici."},
  add_first_note:{en:"Add first note",fr:"Ajouter une première note"},
  brief_title:{en:"Meeting Brief",fr:"Brief de réunion"},
  brief_sub:{en:"Prepare for your next broker or Risk Manager meeting.",fr:"Préparez votre prochaine réunion courtier ou Risk Manager."},
  generate:{en:"Generate",fr:"Générer"},generate_brief:{en:"Generate meeting brief",fr:"Générer le brief"},
  copy_brief:{en:"Copy brief",fr:"Copier le brief"},copied:{en:"Copied",fr:"Copié"},meetings:{en:"Meetings",fr:"Réunions"},add_meeting:{en:"New meeting",fr:"Nouvelle réunion"},meeting_company:{en:"Company",fr:"Entreprise"},meeting_date:{en:"Date \u0026 time",fr:"Date \u0026 heure"},meeting_type:{en:"Type",fr:"Type"},meeting_broker:{en:"Broker meeting",fr:"RDV Courtier"},meeting_rm:{en:"Risk Manager meeting",fr:"RDV Risk Manager"},meeting_internal:{en:"Internal",fr:"Interne"},meeting_notes:{en:"Preparation notes",fr:"Notes de préparation"},upcoming:{en:"Upcoming",fr:"À venir"},past_meetings:{en:"Past",fr:"Passées"},no_meetings:{en:"No meetings planned",fr:"Aucune réunion planifiée"},meeting_saved:{en:"Meeting saved",fr:"Réunion enregistrée"},meeting_deleted:{en:"Meeting deleted",fr:"Réunion supprimée"},export_cal:{en:"Add to calendar",fr:"Ajouter au calendrier"},brief_ready:{en:"Brief ready",fr:"Brief prêt"},days_left:{en:"days",fr:"jours"},today:{en:"Today",fr:"Aujourd'hui"},tomorrow:{en:"Tomorrow",fr:"Demain"},
  export_pdf:{en:"Export PDF",fr:"Exporter PDF"},
  share_brief:{en:"Share",fr:"Partager"},
  share_error:{en:"Sharing not available on this browser",fr:"Partage non disponible sur ce navigateur"},
  copied_clipboard:{en:"Copied to clipboard",fr:"Copié dans le presse-papier"},
  exec_summary:{en:"Executive summary",fr:"Synthèse"},
  key_signals:{en:"Key recent signals",fr:"Signaux récents clés"},
  fl_implications:{en:"Financial Lines implications",fr:"Implications Financial Lines"},
  discussion_angles:{en:"Discussion angles",fr:"Angles de discussion"},
  questions_to_ask:{en:"Questions to ask",fr:"Questions à poser"},
  next_steps:{en:"Next steps",fr:"Prochaines étapes"},
  to_be_defined:{en:"To be defined after meeting.",fr:"À définir après la réunion."},
  interlocutors:{en:"Key contacts",fr:"Interlocuteurs clés"},
  broker:{en:"Broker",fr:"Courtier"},
  risk_manager:{en:"Risk Manager",fr:"Risk Manager"},
  meeting_context:{en:"Meeting context",fr:"Contexte de réunion"},
  broker_angles:{en:"Points for broker discussion",fr:"Points pour la discussion courtier"},
  rm_angles:{en:"Points for Risk Manager",fr:"Points pour le Risk Manager"},
  prep_broker:{en:"Prepare for your broker or Risk Manager meeting with key FL signals and discussion points.",fr:"Préparez votre réunion courtier ou Risk Manager avec les signaux FL clés et points de discussion."},
  rec_title:{en:"Meeting Recording",fr:"Enregistrement de réunion"},
  rec_sub:{en:"Record your conversation. A Financial Lines summary will be generated automatically.",fr:"Enregistrez votre conversation. Un résumé Financial Lines sera généré automatiquement."},
  rec_start:{en:"Start recording",fr:"Démarrer l'enregistrement"},
  rec_stop:{en:"Stop & summarize",fr:"Arrêter et résumer"},
  rec_recording:{en:"Recording…",fr:"Enregistrement en cours…"},
  rec_processing:{en:"Generating FL summary…",fr:"Génération du résumé FL…"},
  rec_saved:{en:"Meeting summary saved as note",fr:"Résumé de réunion enregistré en note"},
  rec_error:{en:"Recording not available on this browser",fr:"Enregistrement non disponible sur ce navigateur"},
  rec_empty:{en:"No transcript captured. Try speaking louder or check microphone access.",fr:"Aucune transcription captée. Essayez de parler plus fort ou vérifiez l'accès au micro."},
  rec_btn:{en:"Record a meeting",fr:"Enregistrer une réunion"},
  dict_start:{en:"Tap to dictate",fr:"Appuyez pour dicter"},
  dict_stop:{en:"Stop dictation",fr:"Arrêter la dictée"},
  dict_listening:{en:"Listening…",fr:"Écoute en cours…"},
  formatting:{en:"Formatting…",fr:"Mise en forme…"},
  company_overview:{en:"Company overview",fr:"Vue d'ensemble"},
  latest_signals:{en:"Latest signals",fr:"Derniers signaux"},
  fl_relevance:{en:"Financial Lines relevance",fr:"Pertinence Financial Lines"},
  no_line_data:{en:"No line exposure data available yet.",fr:"Pas de données d'exposition disponibles."},
  what_happened:{en:"What happened",fr:"Ce qui s'est passé"},
  source_label:{en:"Source:",fr:"Source :"},
  lines_impacted:{en:"Potential lines impacted",fr:"Lignes potentiellement impactées"},
  why_matters:{en:"Why it matters",fr:"Pourquoi c'est important"},
  discussion_angle:{en:"Suggested discussion angle",fr:"Angle de discussion suggéré"},
  points_verify:{en:"Points to verify",fr:"Points à vérifier"},
  hyp_check:{en:"Hypotheses to check",fr:"Hypothèses à vérifier"},
  importance:{en:"Importance",fr:"Importance"},confidence:{en:"Confidence",fr:"Confiance"},
  settings_title:{en:"Settings",fr:"Paramètres"},
  profile:{en:"Profile",fr:"Profil"},language:{en:"Language",fr:"Langue"},
  preferred_lines:{en:"Preferred lines",fr:"Lignes préférées"},
  preferred_lines_sub:{en:"Select the Financial Lines you focus on.",fr:"Sélectionnez les lignes que vous suivez."},
  notifications:{en:"Notifications",fr:"Notifications"},
  daily_digest_toggle:{en:"Daily digest",fr:"Synthèse quotidienne"},
  critical_alerts:{en:"Critical alerts",fr:"Alertes critiques"},
  notif_coming:{en:"Browser notifications for critical signals. Tap to enable.",fr:"Notifications navigateur pour les signaux critiques. Appuyez pour activer."},
  about:{en:"About",fr:"À propos"},version:{en:"Version",fr:"Version"},
  sign_out:{en:"Sign out",fr:"Se déconnecter"},
  back:{en:"Back",fr:"Retour"},all:{en:"All",fr:"Tous"},
  signal:{en:"signal",fr:"signal"},signals_lc:{en:"signals",fr:"signaux"},
  note_lc:{en:"note",fr:"note"},notes_lc:{en:"notes",fr:"notes"},
  headquarters:{en:"Headquarters",fr:"Siège"},market_cap:{en:"Market Cap",fr:"Capitalisation"},
  employees:{en:"Employees",fr:"Effectifs"},risk_score:{en:"Risk score",fr:"Score de risque"},risk_history:{en:"Risk evolution",fr:"Évolution du risque"},risk_no_history:{en:"Score history will appear after updates.",fr:"L'historique apparaîtra après les mises à jour."},last_30_days:{en:"Last 30 days",fr:"30 derniers jours"},
  removed:{en:"removed",fr:"retiré"},added_wl:{en:"added to watchlist",fr:"ajouté au suivi"},
  select_companies:{en:"Select your companies",fr:"Sélectionnez vos entreprises"},
  select_companies_sub:{en:"Choose the companies you want to monitor.",fr:"Choisissez les entreprises à surveiller."},
  continue_btn:{en:"Continue",fr:"Continuer"},selected:{en:"selected",fr:"sélectionnée(s)"},
  skip:{en:"Skip for now",fr:"Passer pour le moment"},
  searching:{en:"Searching…",fr:"Recherche en cours…"},
  ext_results:{en:"Results from the web",fr:"Résultats depuis le web"},
  no_ext_results:{en:"No company found. Try a different name.",fr:"Aucune entreprise trouvée. Essayez un autre nom."},
  observation:{en:"Observation",fr:"Observation"},hypothesis_tag:{en:"Hypothesis",fr:"Hypothèse"},
  action:{en:"Action",fr:"Action"},question:{en:"Question",fr:"Question"},decision:{en:"Decision",fr:"Décision"},
  lbl_critical:{en:"Critical",fr:"Critique"},lbl_high:{en:"High",fr:"Élevé"},lbl_medium:{en:"Medium",fr:"Moyen"},lbl_low:{en:"Low",fr:"Faible"},
  verified:{en:"Verified",fr:"Vérifié"},likely:{en:"Likely",fr:"Probable"},hypothesis_fact:{en:"Hypothesis",fr:"Hypothèse"},needs_review:{en:"Needs review",fr:"À vérifier"},
  primary:{en:"Primary",fr:"Prioritaire"},secondary:{en:"Secondary",fr:"Secondaire"},watch:{en:"Watch",fr:"Veille"},
  lines_lc:{en:"lines",fr:"lignes"},
};

// ── localStorage helpers ──
const lsGet=(k,def)=>{try{const v=localStorage.getItem("signalis_"+k);return v?JSON.parse(v):def}catch(e){return def}};
const lsSet=(k,v)=>{try{localStorage.setItem("signalis_"+k,JSON.stringify(v))}catch(e){}};

const LangCtx=createContext({lang:"en",t:k=>k,setLang:()=>{}});
const useLang=()=>useContext(LangCtx);
function LangProvider({children}){const[lang,setLangRaw]=useState(()=>lsGet("lang","fr"));const setLang=useCallback(l=>{setLangRaw(l);lsSet("lang",l)},[]);const t=useCallback(k=>T[k]?.[lang]||T[k]?.en||k,[lang]);return <LangCtx.Provider value={{lang,t,setLang}}>{children}</LangCtx.Provider>}

// ── Bilingual text helper ──
// tx(obj, lang) returns the right language string
const tx=(v,lang)=>{if(!v)return"";if(typeof v==="string")return v;if(typeof v==="number")return String(v);if(typeof v==="object"){if(v[lang])return v[lang];if(v.en)return v.en;if(v.fr)return v.fr;return""}return String(v||"")};

// ── ENUMS ──
const CATS=[
  {id:"governance",label:{en:"Governance",fr:"Gouvernance"},s:{en:"Gov.",fr:"Gouv."},icon:"⚖️",c:"#818CF8"},
  {id:"regulatory_compliance",label:{en:"Regulatory",fr:"Réglementaire"},s:{en:"Reg.",fr:"Rég."},icon:"📋",c:"#A78BFA"},
  {id:"litigation_investigation",label:{en:"Litigation",fr:"Contentieux"},s:{en:"Lit.",fr:"Cont."},icon:"🔍",c:"#F472B6"},
  {id:"financial_stress_reporting",label:{en:"Financial",fr:"Financier"},s:{en:"Fin.",fr:"Fin."},icon:"📊",c:"#FBBF24"},
  {id:"mna_transactions",label:{en:"M&A",fr:"M&A"},s:{en:"M&A",fr:"M&A"},icon:"🤝",c:"#34D399"},
  {id:"cyber_data_breach",label:{en:"Cyber",fr:"Cyber"},s:{en:"Cyber",fr:"Cyber"},icon:"🛡️",c:"#F87171"},
  {id:"fraud_crime",label:{en:"Fraud",fr:"Fraude"},s:{en:"Fraud",fr:"Fraude"},icon:"🚨",c:"#FB923C"},
  {id:"esg_reputation",label:{en:"ESG",fr:"ESG"},s:{en:"ESG",fr:"ESG"},icon:"🌿",c:"#2DD4BF"},
  {id:"hr_culture",label:{en:"HR / Culture",fr:"RH / Culture"},s:{en:"HR",fr:"RH"},icon:"👥",c:"#9CA3AF"},
];
const LINES={do:"D&O",epl:"EPL",ptl:"PTL",fraud:{en:"Fraud",fr:"Fraude"},knr:{en:"K&R",fr:"K&R"},bbb:{en:"BBB Global Banking",fr:"BBB Globale de Banque"},rcpro:{en:"PI / Professional Liability",fr:"RCPro"},cyber:"Cyber",rcg:{en:"General Liability",fr:"RCG"},rc_env:{en:"Environmental Liability",fr:"RC Environnementale"},motor:"Motor",marine:{en:"Marine & Transport",fr:"Transports (Marine)"},property:{en:"Property",fr:"Dommages"},mna:{en:"M&A",fr:"M&A"},trade_credit:{en:"Trade Credit",fr:"Trade Crédit"},trade_finance:{en:"Trade Finance",fr:"Trade Finance"},gpa_bta:{en:"GPA & BTA",fr:"GPA & BTA"},affinity:{en:"Affinity",fr:"Affinitaires"},aviation:"Aviation"};
const lineLbl=(k,lang)=>{const v=LINES[k];return typeof v==="object"?v[lang]||v.en:v};
const LVL_C={critical:"#EF4444",high:"#F59E0B",medium:"#3B82F6",low:"#10B981"};
const LVL_BG={critical:"rgba(239,68,68,.1)",high:"rgba(245,158,11,.1)",medium:"rgba(59,130,246,.1)",low:"rgba(16,185,129,.1)"};
const LVL_T={critical:"#FCA5A5",high:"#FCD34D",medium:"#93C5FD",low:"#6EE7B7"};
const NOTE_C={observation:{c:"#FCD34D",bg:"rgba(245,158,11,.06)"},hypothesis:{c:"#C4B5FD",bg:"rgba(139,92,246,.06)"},action:{c:"#6EE7B7",bg:"rgba(16,185,129,.06)"},question:{c:"#93C5FD",bg:"rgba(59,130,246,.06)"},decision:{c:"#F472B6",bg:"rgba(244,114,182,.06)"}};
const noteTagLbl=(tag,t)=>({observation:t("observation"),hypothesis:t("hypothesis_tag"),action:t("action"),question:t("question"),decision:t("decision")}[tag]||tag);
const factLbl=(f,t)=>({verified:{l:t("verified"),c:"#6EE7B7",bg:"rgba(16,185,129,.1)"},likely:{l:t("likely"),c:"#FCD34D",bg:"rgba(245,158,11,.1)"},hypothesis:{l:t("hypothesis_fact"),c:"#C4B5FD",bg:"rgba(139,92,246,.1)"},needs_review:{l:t("needs_review"),c:"#9CA3AF",bg:"rgba(156,163,175,.1)"}}[f]||{l:f,c:"#9CA3AF",bg:"rgba(156,163,175,.1)"});
const scoreLbl=(s,t)=>s>=80?t("lbl_critical"):s>=60?t("lbl_high"):s>=40?t("lbl_medium"):t("lbl_low");

// ── COMPANIES (12) ──
const COMPANIES=[
  // ── CAC 40 ──
  {id:"r01",name:"LVMH",sector:{en:"Luxury Goods",fr:"Luxe"},hq:"Paris, France",ticker:"MC.PA",cap:"€328B",emp:"213 000",logo:"L",risk:38,trend:"stable",prio:"watch"},
  {id:"r02",name:"TotalEnergies",sector:{en:"Energy",fr:"Énergie"},hq:"Courbevoie, France",ticker:"TTE.PA",cap:"€148B",emp:"101 000",logo:"T",risk:52,trend:"rising",prio:"watch"},
  {id:"r03",name:"Sanofi",sector:{en:"Pharmaceuticals",fr:"Pharmaceutique"},hq:"Paris, France",ticker:"SAN.PA",cap:"€132B",emp:"91 000",logo:"S",risk:41,trend:"stable",prio:"watch"},
  {id:"r04",name:"L'Oréal",sector:{en:"Consumer Goods",fr:"Biens de consommation"},hq:"Clichy, France",ticker:"OR.PA",cap:"€218B",emp:"87 000",logo:"L",risk:28,trend:"stable",prio:"watch"},
  {id:"r05",name:"Schneider Electric",sector:{en:"Electrical Equipment",fr:"Équipements électriques"},hq:"Rueil-Malmaison, France",ticker:"SU.PA",cap:"€120B",emp:"150 000",logo:"S",risk:35,trend:"stable",prio:"watch"},
  {id:"r06",name:"Air Liquide",sector:{en:"Industrial Gases",fr:"Gaz industriels"},hq:"Paris, France",ticker:"AI.PA",cap:"€92B",emp:"67 000",logo:"A",risk:25,trend:"stable",prio:"watch"},
  {id:"r07",name:"BNP Paribas",sector:{en:"Banking",fr:"Banque"},hq:"Paris, France",ticker:"BNP.PA",cap:"€73B",emp:"183 000",logo:"B",risk:55,trend:"stable",prio:"watch"},
  {id:"r08",name:"AXA",sector:{en:"Insurance",fr:"Assurance"},hq:"Paris, France",ticker:"CS.PA",cap:"€72B",emp:"145 000",logo:"A",risk:42,trend:"stable",prio:"watch"},
  {id:"r09",name:"Hermès",sector:{en:"Luxury Goods",fr:"Luxe"},hq:"Paris, France",ticker:"RMS.PA",cap:"€220B",emp:"22 000",logo:"H",risk:22,trend:"stable",prio:"watch"},
  {id:"r10",name:"Safran",sector:{en:"Aerospace & Defence",fr:"Aéronautique & Défense"},hq:"Paris, France",ticker:"SAF.PA",cap:"€82B",emp:"83 000",logo:"S",risk:37,trend:"stable",prio:"watch"},
  {id:"r11",name:"EssilorLuxottica",sector:{en:"Medical Devices",fr:"Dispositifs médicaux"},hq:"Paris, France",ticker:"EL.PA",cap:"€95B",emp:"190 000",logo:"E",risk:30,trend:"stable",prio:"watch"},
  {id:"r12",name:"Dassault Systèmes",sector:{en:"Software",fr:"Logiciel"},hq:"Vélizy, France",ticker:"DSY.PA",cap:"€62B",emp:"24 000",logo:"D",risk:32,trend:"stable",prio:"watch"},
  {id:"r13",name:"Vinci",sector:{en:"Construction & Concessions",fr:"BTP & Concessions"},hq:"Nanterre, France",ticker:"DG.PA",cap:"€68B",emp:"272 000",logo:"V",risk:40,trend:"stable",prio:"watch"},
  {id:"r14",name:"Kering",sector:{en:"Luxury Goods",fr:"Luxe"},hq:"Paris, France",ticker:"KER.PA",cap:"€34B",emp:"49 000",logo:"K",risk:56,trend:"rising",prio:"watch"},
  {id:"r15",name:"Saint-Gobain",sector:{en:"Building Materials",fr:"Matériaux de construction"},hq:"Courbevoie, France",ticker:"SGO.PA",cap:"€46B",emp:"160 000",logo:"S",risk:36,trend:"stable",prio:"watch"},
  {id:"r16",name:"Société Générale",sector:{en:"Banking",fr:"Banque"},hq:"Paris, France",ticker:"GLE.PA",cap:"€22B",emp:"117 000",logo:"S",risk:58,trend:"rising",prio:"watch"},
  {id:"r17",name:"Danone",sector:{en:"Food & Beverages",fr:"Agroalimentaire"},hq:"Paris, France",ticker:"BN.PA",cap:"€42B",emp:"88 000",logo:"D",risk:43,trend:"stable",prio:"watch"},
  {id:"r18",name:"Engie",sector:{en:"Utilities",fr:"Services publics"},hq:"Courbevoie, France",ticker:"ENGI.PA",cap:"€38B",emp:"97 000",logo:"E",risk:45,trend:"stable",prio:"watch"},
  {id:"r19",name:"Capgemini",sector:{en:"IT Services",fr:"Services informatiques"},hq:"Paris, France",ticker:"CAP.PA",cap:"€32B",emp:"340 000",logo:"C",risk:39,trend:"stable",prio:"watch"},
  {id:"r20",name:"Pernod Ricard",sector:{en:"Spirits & Wine",fr:"Vins & Spiritueux"},hq:"Paris, France",ticker:"RI.PA",cap:"€38B",emp:"19 000",logo:"P",risk:34,trend:"stable",prio:"watch"},
  {id:"r21",name:"Michelin",sector:{en:"Tyres & Mobility",fr:"Pneumatiques & Mobilité"},hq:"Clermont-Ferrand, France",ticker:"ML.PA",cap:"€24B",emp:"132 000",logo:"M",risk:33,trend:"stable",prio:"watch"},
  {id:"r22",name:"Publicis Groupe",sector:{en:"Advertising & Media",fr:"Publicité & Médias"},hq:"Paris, France",ticker:"PUB.PA",cap:"€28B",emp:"98 000",logo:"P",risk:36,trend:"stable",prio:"watch"},
  {id:"r23",name:"Renault",sector:{en:"Automotive",fr:"Automobile"},hq:"Boulogne-Billancourt, France",ticker:"RNO.PA",cap:"€14B",emp:"105 000",logo:"R",risk:55,trend:"rising",prio:"watch"},
  {id:"r24",name:"Orange",sector:{en:"Telecommunications",fr:"Télécommunications"},hq:"Paris, France",ticker:"ORA.PA",cap:"€28B",emp:"127 000",logo:"O",risk:42,trend:"stable",prio:"watch"},
  {id:"r25",name:"Bouygues",sector:{en:"Construction & Telecom",fr:"BTP & Télécoms"},hq:"Paris, France",ticker:"EN.PA",cap:"€15B",emp:"200 000",logo:"B",risk:40,trend:"stable",prio:"watch"},
  {id:"r26",name:"Thales",sector:{en:"Defence & Technology",fr:"Défense & Technologie"},hq:"Paris, France",ticker:"HO.PA",cap:"€38B",emp:"81 000",logo:"T",risk:38,trend:"stable",prio:"watch"},
  {id:"r27",name:"Stellantis",sector:{en:"Automotive",fr:"Automobile"},hq:"Amsterdam, Netherlands",ticker:"STLAP.PA",cap:"€42B",emp:"281 000",logo:"S",risk:53,trend:"rising",prio:"watch"},
  {id:"r28",name:"Veolia",sector:{en:"Environmental Services",fr:"Services environnementaux"},hq:"Paris, France",ticker:"VIE.PA",cap:"€22B",emp:"220 000",logo:"V",risk:37,trend:"stable",prio:"watch"},
  {id:"r29",name:"Airbus",sector:{en:"Aerospace",fr:"Aéronautique"},hq:"Leiden, Netherlands",ticker:"AIR.PA",cap:"€109B",emp:"134 000",logo:"A",risk:42,trend:"stable",prio:"watch"},
  {id:"r30",name:"Legrand",sector:{en:"Electrical Products",fr:"Produits électriques"},hq:"Limoges, France",ticker:"LR.PA",cap:"€27B",emp:"40 000",logo:"L",risk:27,trend:"stable",prio:"watch"},
  {id:"r31",name:"Crédit Agricole",sector:{en:"Banking",fr:"Banque"},hq:"Montrouge, France",ticker:"ACA.PA",cap:"€38B",emp:"148 000",logo:"C",risk:48,trend:"stable",prio:"watch"},
  {id:"r32",name:"Alstom",sector:{en:"Rail Transport",fr:"Transport ferroviaire"},hq:"Saint-Ouen, France",ticker:"ALO.PA",cap:"€10B",emp:"80 000",logo:"A",risk:58,trend:"rising",prio:"watch"},
  {id:"r33",name:"Worldline",sector:{en:"Payment Services",fr:"Services de paiement"},hq:"Bezons, France",ticker:"WLN.PA",cap:"€3.2B",emp:"18 000",logo:"W",risk:65,trend:"rising",prio:"watch"},
  {id:"r34",name:"Edenred",sector:{en:"Payment Solutions",fr:"Solutions de paiement"},hq:"Issy-les-Moulineaux, France",ticker:"EDEN.PA",cap:"€12B",emp:"12 000",logo:"E",risk:32,trend:"stable",prio:"watch"},
  {id:"r35",name:"Vivendi",sector:{en:"Media & Entertainment",fr:"Médias & Divertissement"},hq:"Paris, France",ticker:"VIV.PA",cap:"€10B",emp:"37 000",logo:"V",risk:50,trend:"rising",prio:"watch"},
  // ── European Majors ──
  {id:"r40",name:"Allianz",sector:{en:"Insurance",fr:"Assurance"},hq:"Munich, Germany",ticker:"ALV.DE",cap:"€98B",emp:"159 000",logo:"A",risk:40,trend:"stable",prio:null},
  {id:"r41",name:"Siemens",sector:{en:"Industrials & Technology",fr:"Industrie & Technologie"},hq:"Munich, Germany",ticker:"SIE.DE",cap:"€142B",emp:"320 000",logo:"S",risk:35,trend:"stable",prio:null},
  {id:"r42",name:"SAP",sector:{en:"Enterprise Software",fr:"Logiciel d'entreprise"},hq:"Walldorf, Germany",ticker:"SAP.DE",cap:"€250B",emp:"108 000",logo:"S",risk:30,trend:"stable",prio:null},
  {id:"r43",name:"Deutsche Bank",sector:{en:"Banking",fr:"Banque"},hq:"Frankfurt, Germany",ticker:"DBK.DE",cap:"€30B",emp:"87 000",logo:"D",risk:58,trend:"rising",prio:null},
  {id:"r44",name:"BASF",sector:{en:"Chemicals",fr:"Chimie"},hq:"Ludwigshafen, Germany",ticker:"BAS.DE",cap:"€42B",emp:"112 000",logo:"B",risk:48,trend:"stable",prio:null},
  {id:"r45",name:"BMW",sector:{en:"Automotive",fr:"Automobile"},hq:"Munich, Germany",ticker:"BMW.DE",cap:"€68B",emp:"149 000",logo:"B",risk:40,trend:"stable",prio:null},
  {id:"r46",name:"Volkswagen",sector:{en:"Automotive",fr:"Automobile"},hq:"Wolfsburg, Germany",ticker:"VOW3.DE",cap:"€63B",emp:"673 000",logo:"V",risk:52,trend:"rising",prio:null},
  {id:"r50",name:"Unilever",sector:{en:"Consumer Goods",fr:"Biens de consommation"},hq:"London, UK",ticker:"ULVR.L",cap:"£112B",emp:"127 000",logo:"U",risk:33,trend:"stable",prio:null},
  {id:"r51",name:"Shell",sector:{en:"Energy",fr:"Énergie"},hq:"London, UK",ticker:"SHEL.L",cap:"£168B",emp:"86 000",logo:"S",risk:48,trend:"stable",prio:null},
  {id:"r52",name:"HSBC",sector:{en:"Banking",fr:"Banque"},hq:"London, UK",ticker:"HSBA.L",cap:"£134B",emp:"221 000",logo:"H",risk:50,trend:"stable",prio:null},
  {id:"r53",name:"AstraZeneca",sector:{en:"Pharmaceuticals",fr:"Pharmaceutique"},hq:"Cambridge, UK",ticker:"AZN.L",cap:"£180B",emp:"89 000",logo:"A",risk:38,trend:"stable",prio:null},
  {id:"r54",name:"BP",sector:{en:"Energy",fr:"Énergie"},hq:"London, UK",ticker:"BP.L",cap:"£72B",emp:"67 000",logo:"B",risk:52,trend:"rising",prio:null},
  {id:"r60",name:"Nestlé",sector:{en:"Food & Beverages",fr:"Agroalimentaire"},hq:"Vevey, Switzerland",ticker:"NESN.SW",cap:"CHF 240B",emp:"270 000",logo:"N",risk:30,trend:"stable",prio:null},
  {id:"r61",name:"Novartis",sector:{en:"Pharmaceuticals",fr:"Pharmaceutique"},hq:"Basel, Switzerland",ticker:"NOVN.SW",cap:"CHF 195B",emp:"78 000",logo:"N",risk:35,trend:"stable",prio:null},
  {id:"r62",name:"Roche",sector:{en:"Pharmaceuticals",fr:"Pharmaceutique"},hq:"Basel, Switzerland",ticker:"ROG.SW",cap:"CHF 205B",emp:"101 000",logo:"R",risk:33,trend:"stable",prio:null},
  {id:"r63",name:"Zurich Insurance",sector:{en:"Insurance",fr:"Assurance"},hq:"Zurich, Switzerland",ticker:"ZURN.SW",cap:"CHF 75B",emp:"56 000",logo:"Z",risk:32,trend:"stable",prio:null},
  // ── CAC 40 (compléments) ──
  {id:"r70",name:"STMicroelectronics",sector:{en:"Semiconductors",fr:"Semi-conducteurs"},hq:"Genève, Suisse",ticker:"STMPA.PA",cap:"€28B",emp:"50 000",logo:"S",risk:42,trend:"stable",prio:"watch"},
  {id:"r71",name:"ArcelorMittal",sector:{en:"Steel & Mining",fr:"Sidérurgie & Mines"},hq:"Luxembourg",ticker:"MT.PA",cap:"€22B",emp:"155 000",logo:"A",risk:52,trend:"rising",prio:"watch"},
  {id:"r72",name:"Carrefour",sector:{en:"Retail & Distribution",fr:"Grande Distribution"},hq:"Massy, France",ticker:"CA.PA",cap:"€12B",emp:"321 000",logo:"C",risk:45,trend:"stable",prio:"watch"},
  {id:"r73",name:"Bureau Veritas",sector:{en:"Testing & Certification",fr:"Inspection & Certification"},hq:"Neuilly-sur-Seine, France",ticker:"BVI.PA",cap:"€16B",emp:"83 000",logo:"B",risk:30,trend:"stable",prio:"watch"},
  {id:"r74",name:"Accor",sector:{en:"Hospitality",fr:"Hôtellerie"},hq:"Issy-les-Moulineaux, France",ticker:"AC.PA",cap:"€10B",emp:"290 000",logo:"A",risk:40,trend:"stable",prio:"watch"},
  {id:"r75",name:"Teleperformance",sector:{en:"Business Services",fr:"Services aux entreprises"},hq:"Paris, France",ticker:"TEP.PA",cap:"€8B",emp:"410 000",logo:"T",risk:55,trend:"rising",prio:"watch"},
  // ── CAC Next 20 ──
  {id:"r80",name:"Amundi",sector:{en:"Asset Management",fr:"Gestion d'actifs"},hq:"Paris, France",ticker:"AMUN.PA",cap:"€14B",emp:"5 500",logo:"A",risk:35,trend:"stable",prio:"watch"},
  {id:"r81",name:"Arkema",sector:{en:"Specialty Chemicals",fr:"Chimie de spécialité"},hq:"Colombes, France",ticker:"AKE.PA",cap:"€8B",emp:"21 000",logo:"A",risk:38,trend:"stable",prio:"watch"},
  {id:"r82",name:"Dassault Aviation",sector:{en:"Aerospace & Defence",fr:"Aéronautique & Défense"},hq:"Saint-Cloud, France",ticker:"AM.PA",cap:"€32B",emp:"13 000",logo:"D",risk:30,trend:"stable",prio:"watch"},
  {id:"r83",name:"Eiffage",sector:{en:"Construction & Concessions",fr:"BTP & Concessions"},hq:"Vélizy, France",ticker:"FGR.PA",cap:"€10B",emp:"79 000",logo:"E",risk:38,trend:"stable",prio:"watch"},
  {id:"r84",name:"Eurazeo",sector:{en:"Private Equity",fr:"Capital-investissement"},hq:"Paris, France",ticker:"RF.PA",cap:"€5B",emp:"400",logo:"E",risk:40,trend:"stable",prio:"watch"},
  {id:"r85",name:"Forvia (Faurecia)",sector:{en:"Automotive Parts",fr:"Équipementier automobile"},hq:"Nanterre, France",ticker:"FRVIA.PA",cap:"€4B",emp:"157 000",logo:"F",risk:58,trend:"rising",prio:"watch"},
  {id:"r86",name:"Gecina",sector:{en:"Real Estate (REIT)",fr:"Immobilier (Foncière)"},hq:"Paris, France",ticker:"GFC.PA",cap:"€8B",emp:"500",logo:"G",risk:35,trend:"stable",prio:"watch"},
  {id:"r87",name:"Getlink",sector:{en:"Transport Infrastructure",fr:"Infrastructure de transport"},hq:"Paris, France",ticker:"GET.PA",cap:"€9B",emp:"3 200",logo:"G",risk:32,trend:"stable",prio:"watch"},
  {id:"r88",name:"GTT",sector:{en:"LNG Engineering",fr:"Ingénierie GNL"},hq:"Saint-Rémy-lès-Chevreuse, France",ticker:"GTT.PA",cap:"€7B",emp:"900",logo:"G",risk:28,trend:"stable",prio:"watch"},
  {id:"r89",name:"Ipsen",sector:{en:"Pharmaceuticals",fr:"Pharmaceutique"},hq:"Boulogne-Billancourt, France",ticker:"IPN.PA",cap:"€10B",emp:"6 000",logo:"I",risk:36,trend:"stable",prio:"watch"},
  {id:"r90",name:"JCDecaux",sector:{en:"Outdoor Advertising",fr:"Communication extérieure"},hq:"Neuilly-sur-Seine, France",ticker:"DEC.PA",cap:"€6B",emp:"13 000",logo:"J",risk:35,trend:"stable",prio:"watch"},
  {id:"r91",name:"Klépierre",sector:{en:"Real Estate (REIT)",fr:"Immobilier (Foncière)"},hq:"Paris, France",ticker:"LI.PA",cap:"€9B",emp:"1 100",logo:"K",risk:38,trend:"stable",prio:"watch"},
  {id:"r92",name:"Sartorius Stedim Biotech",sector:{en:"Life Sciences Equipment",fr:"Équipements sciences de la vie"},hq:"Aubagne, France",ticker:"DIM.PA",cap:"€14B",emp:"15 000",logo:"S",risk:32,trend:"stable",prio:"watch"},
  {id:"r93",name:"SEB",sector:{en:"Consumer Goods",fr:"Petit électroménager"},hq:"Écully, France",ticker:"SK.PA",cap:"€7B",emp:"33 000",logo:"S",risk:33,trend:"stable",prio:"watch"},
  {id:"r94",name:"Sodexo",sector:{en:"Catering & Facilities",fr:"Restauration collective"},hq:"Issy-les-Moulineaux, France",ticker:"SW.PA",cap:"€13B",emp:"422 000",logo:"S",risk:36,trend:"stable",prio:"watch"},
  {id:"r95",name:"Sopra Steria",sector:{en:"IT Services",fr:"Services informatiques"},hq:"Paris, France",ticker:"SOP.PA",cap:"€5B",emp:"56 000",logo:"S",risk:35,trend:"stable",prio:"watch"},
  {id:"r96",name:"Unibail-Rodamco-Westfield",sector:{en:"Real Estate (REIT)",fr:"Immobilier (Foncière)"},hq:"Paris, France",ticker:"URW.PA",cap:"€10B",emp:"2 800",logo:"U",risk:52,trend:"rising",prio:"watch"},
  {id:"r97",name:"Valeo",sector:{en:"Automotive Parts",fr:"Équipementier automobile"},hq:"Paris, France",ticker:"FR.PA",cap:"€3B",emp:"109 000",logo:"V",risk:60,trend:"rising",prio:"watch"},
  {id:"r98",name:"Wendel",sector:{en:"Investment Company",fr:"Société d'investissement"},hq:"Paris, France",ticker:"MF.PA",cap:"€5B",emp:"300",logo:"W",risk:38,trend:"stable",prio:"watch"},
  {id:"r99",name:"Nexans",sector:{en:"Cables & Connectivity",fr:"Câbles & Connectivité"},hq:"Paris, France",ticker:"NEX.PA",cap:"€5B",emp:"29 000",logo:"N",risk:36,trend:"stable",prio:"watch"},
  // ── CAC Mid 60 (sélection) ──
  {id:"r100",name:"Atos",sector:{en:"IT Services",fr:"Services informatiques"},hq:"Bezons, France",ticker:"ATO.PA",cap:"€0.5B",emp:"95 000",logo:"A",risk:88,trend:"rising",prio:"watch"},
  {id:"r101",name:"Biomérieux",sector:{en:"Diagnostics",fr:"Diagnostics"},hq:"Marcy-l'Étoile, France",ticker:"BIM.PA",cap:"€15B",emp:"14 000",logo:"B",risk:28,trend:"stable",prio:"watch"},
  {id:"r102",name:"Bolloré",sector:{en:"Diversified Conglomerate",fr:"Conglomérat diversifié"},hq:"Odet, France",ticker:"BOL.PA",cap:"€15B",emp:"71 000",logo:"B",risk:45,trend:"stable",prio:"watch"},
  {id:"r103",name:"Coface",sector:{en:"Credit Insurance",fr:"Assurance-crédit"},hq:"Bois-Colombes, France",ticker:"COFA.PA",cap:"€3B",emp:"4 700",logo:"C",risk:38,trend:"stable",prio:"watch"},
  {id:"r104",name:"Covivio",sector:{en:"Real Estate",fr:"Immobilier"},hq:"Metz, France",ticker:"COV.PA",cap:"€5B",emp:"1 000",logo:"C",risk:42,trend:"stable",prio:"watch"},
  {id:"r105",name:"Fnac Darty",sector:{en:"Retail Electronics",fr:"Distribution spécialisée"},hq:"Ivry-sur-Seine, France",ticker:"FNAC.PA",cap:"€1.5B",emp:"25 000",logo:"F",risk:50,trend:"rising",prio:"watch"},
  {id:"r106",name:"Imerys",sector:{en:"Specialty Minerals",fr:"Minéraux de spécialité"},hq:"Paris, France",ticker:"NK.PA",cap:"€3B",emp:"14 000",logo:"I",risk:40,trend:"stable",prio:"watch"},
  {id:"r107",name:"Clariane (ex-Korian)",sector:{en:"Healthcare Services",fr:"Services de santé"},hq:"Paris, France",ticker:"CLARI.PA",cap:"€1B",emp:"57 000",logo:"C",risk:65,trend:"rising",prio:"watch"},
  {id:"r108",name:"Lagardère",sector:{en:"Media & Travel Retail",fr:"Médias & Travel Retail"},hq:"Paris, France",ticker:"MMB.PA",cap:"€5B",emp:"28 000",logo:"L",risk:42,trend:"stable",prio:"watch"},
  {id:"r109",name:"OVHcloud",sector:{en:"Cloud Computing",fr:"Cloud"},hq:"Roubaix, France",ticker:"OVH.PA",cap:"€2B",emp:"3 000",logo:"O",risk:52,trend:"rising",prio:"watch"},
  {id:"r110",name:"Plastic Omnium",sector:{en:"Automotive Parts",fr:"Équipementier automobile"},hq:"Levallois-Perret, France",ticker:"POM.PA",cap:"€2B",emp:"40 000",logo:"P",risk:48,trend:"stable",prio:"watch"},
  {id:"r111",name:"Rémy Cointreau",sector:{en:"Spirits",fr:"Spiritueux"},hq:"Cognac, France",ticker:"RCO.PA",cap:"€5B",emp:"2 000",logo:"R",risk:35,trend:"stable",prio:"watch"},
  {id:"r112",name:"Rexel",sector:{en:"Electrical Distribution",fr:"Distribution électrique"},hq:"Paris, France",ticker:"RXL.PA",cap:"€6B",emp:"27 000",logo:"R",risk:36,trend:"stable",prio:"watch"},
  {id:"r113",name:"Rubis",sector:{en:"Energy Distribution",fr:"Distribution d'énergie"},hq:"Paris, France",ticker:"RUI.PA",cap:"€3B",emp:"4 500",logo:"R",risk:40,trend:"stable",prio:"watch"},
  {id:"r114",name:"Soitec",sector:{en:"Semiconductors",fr:"Semi-conducteurs"},hq:"Bernin, France",ticker:"SOI.PA",cap:"€3B",emp:"2 200",logo:"S",risk:42,trend:"stable",prio:"watch"},
  {id:"r115",name:"Spie",sector:{en:"Technical Services",fr:"Services techniques"},hq:"Cergy, France",ticker:"SPIE.PA",cap:"€5B",emp:"50 000",logo:"S",risk:34,trend:"stable",prio:"watch"},
  {id:"r116",name:"Technip Energies",sector:{en:"Energy Engineering",fr:"Ingénierie énergétique"},hq:"Nanterre, France",ticker:"TE.PA",cap:"€5B",emp:"15 000",logo:"T",risk:38,trend:"stable",prio:"watch"},
  {id:"r117",name:"TF1",sector:{en:"Media & Broadcasting",fr:"Médias & Audiovisuel"},hq:"Boulogne-Billancourt, France",ticker:"TFI.PA",cap:"€2B",emp:"3 500",logo:"T",risk:38,trend:"stable",prio:"watch"},
  {id:"r118",name:"Trigano",sector:{en:"Leisure Vehicles",fr:"Véhicules de loisirs"},hq:"Paris, France",ticker:"TRI.PA",cap:"€4B",emp:"12 000",logo:"T",risk:32,trend:"stable",prio:"watch"},
  {id:"r119",name:"Ubisoft",sector:{en:"Video Games",fr:"Jeux vidéo"},hq:"Saint-Mandé, France",ticker:"UBI.PA",cap:"€2B",emp:"19 000",logo:"U",risk:62,trend:"rising",prio:"watch"},
  {id:"r120",name:"Vallourec",sector:{en:"Steel Tubes",fr:"Tubes acier"},hq:"Meudon, France",ticker:"VK.PA",cap:"€3B",emp:"18 000",logo:"V",risk:48,trend:"stable",prio:"watch"},
  {id:"r121",name:"Vicat",sector:{en:"Building Materials",fr:"Matériaux de construction"},hq:"L'Isle-d'Abeau, France",ticker:"VCT.PA",cap:"€2.5B",emp:"10 000",logo:"V",risk:35,trend:"stable",prio:"watch"},
  {id:"r122",name:"Eutelsat",sector:{en:"Satellite Communications",fr:"Communications par satellite"},hq:"Paris, France",ticker:"ETL.PA",cap:"€3B",emp:"1 200",logo:"E",risk:50,trend:"rising",prio:"watch"},
  {id:"r123",name:"Scor",sector:{en:"Reinsurance",fr:"Réassurance"},hq:"Paris, France",ticker:"SCR.PA",cap:"€5B",emp:"3 400",logo:"S",risk:42,trend:"stable",prio:"watch"},
  {id:"r124",name:"CNP Assurances",sector:{en:"Insurance",fr:"Assurance"},hq:"Paris, France",ticker:"CNP.PA",cap:"€16B",emp:"5 000",logo:"C",risk:32,trend:"stable",prio:"watch"},
  {id:"r125",name:"Nexity",sector:{en:"Real Estate Development",fr:"Promotion immobilière"},hq:"Paris, France",ticker:"NXI.PA",cap:"€0.8B",emp:"7 000",logo:"N",risk:68,trend:"rising",prio:"watch"},
  {id:"r126",name:"Elior",sector:{en:"Contract Catering",fr:"Restauration collective"},hq:"Paris, France",ticker:"ELIOR.PA",cap:"€1B",emp:"97 000",logo:"E",risk:55,trend:"rising",prio:"watch"},
  {id:"r127",name:"CGG",sector:{en:"Geosciences",fr:"Géosciences"},hq:"Paris, France",ticker:"CGG.PA",cap:"€0.8B",emp:"4 500",logo:"C",risk:52,trend:"stable",prio:"watch"},
  // ── Grandes entreprises françaises non cotées ──
  {id:"nc01",name:"La Poste",sector:{en:"Postal Services & Banking",fr:"Services postaux & Banque"},hq:"Paris, France",ticker:null,cap:"—",emp:"238 000",logo:"P",risk:42,trend:"stable",prio:"watch"},
  {id:"nc02",name:"SNCF",sector:{en:"Rail Transport",fr:"Transport ferroviaire"},hq:"Saint-Denis, France",ticker:null,cap:"—",emp:"275 000",logo:"S",risk:45,trend:"stable",prio:"watch"},
  {id:"nc03",name:"EDF",sector:{en:"Energy & Utilities",fr:"Énergie & Services publics"},hq:"Paris, France",ticker:null,cap:"—",emp:"165 000",logo:"E",risk:52,trend:"rising",prio:"watch"},
  {id:"nc04",name:"RATP",sector:{en:"Urban Transport",fr:"Transport urbain"},hq:"Paris, France",ticker:null,cap:"—",emp:"70 000",logo:"R",risk:40,trend:"stable",prio:"watch"},
  {id:"nc05",name:"Caisse des Dépôts",sector:{en:"Public Financial Institution",fr:"Institution financière publique"},hq:"Paris, France",ticker:null,cap:"—",emp:"6 000",logo:"C",risk:30,trend:"stable",prio:"watch"},
  {id:"nc06",name:"Lactalis",sector:{en:"Dairy & Food",fr:"Produits laitiers & Agroalimentaire"},hq:"Laval, France",ticker:null,cap:"—",emp:"85 000",logo:"L",risk:42,trend:"stable",prio:"watch"},
  {id:"nc07",name:"Auchan",sector:{en:"Retail & Distribution",fr:"Grande Distribution"},hq:"Croix, France",ticker:null,cap:"—",emp:"164 000",logo:"A",risk:55,trend:"rising",prio:"watch"},
  {id:"nc08",name:"Décathlon",sector:{en:"Sporting Goods Retail",fr:"Distribution sportive"},hq:"Villeneuve-d'Ascq, France",ticker:null,cap:"—",emp:"105 000",logo:"D",risk:30,trend:"stable",prio:"watch"},
  {id:"nc09",name:"Orano (ex-Areva)",sector:{en:"Nuclear Energy",fr:"Énergie nucléaire"},hq:"Châtillon, France",ticker:null,cap:"—",emp:"17 000",logo:"O",risk:48,trend:"stable",prio:"watch"},
  {id:"nc10",name:"Groupe BPCE",sector:{en:"Banking & Insurance",fr:"Banque & Assurance"},hq:"Paris, France",ticker:null,cap:"—",emp:"100 000",logo:"B",risk:45,trend:"stable",prio:"watch"},
  {id:"nc11",name:"Groupe Rocher",sector:{en:"Cosmetics",fr:"Cosmétiques"},hq:"La Gacilly, France",ticker:null,cap:"—",emp:"16 000",logo:"R",risk:28,trend:"stable",prio:"watch"},
  {id:"nc12",name:"MACIF",sector:{en:"Mutual Insurance",fr:"Assurance mutualiste"},hq:"Niort, France",ticker:null,cap:"—",emp:"10 000",logo:"M",risk:32,trend:"stable",prio:"watch"},
];

// ── SIGNALS (live only) ──
const SIGNALS=[
];

// ── IMPACTS (live only) ──
const IMPACTS=[];

// ── NOTES ──
const NOTES=[
];

// ── SOURCE URLS ──
const SRC_URL={"Reuters":"https://reuters.com","The Guardian":"https://theguardian.com","Le Monde":"https://lemonde.fr","Bloomberg":"https://bloomberg.com","Handelsblatt":"https://handelsblatt.com","Der Spiegel":"https://spiegel.de","Financial Times":"https://ft.com","Süddeutsche Zeitung":"https://sueddeutsche.de","New York Times":"https://nytimes.com","Les Echos":"https://lesechos.fr","Vogue Business":"https://voguebusiness.com","La Repubblica":"https://repubblica.it","Il Sole 24 Ore":"https://ilsole24ore.com","Corriere della Sera":"https://corriere.it","STAT News":"https://statnews.com","BMJ":"https://bmj.com","TechCrunch":"https://techcrunch.com","Wall Street Journal":"https://wsj.com","The Information":"https://theinformation.com","Berlingske":"https://berlingske.dk","Shipping Watch":"https://shippingwatch.com","BBC News":"https://bbc.co.uk","The Times":"https://thetimes.co.uk","El País":"https://elpais.com","El Confidencial":"https://elconfidencial.com","Cinco Días":"https://cincodias.elpais.com","Mediapart":"https://mediapart.fr","Le Figaro":"https://lefigaro.fr","Wired":"https://wired.com","Energate":"https://energate-messenger.de"};
const srcUrl=name=>{const n=typeof name==="object"?name.en:name;return SRC_URL[n]||null};

// ── SELECTORS ──
const getSigsStatic=cid=>SIGNALS.filter(s=>s.cid===cid).sort((a,b)=>b.imp-a.imp);
const getImps=sid=>IMPACTS.filter(i=>i.sid===sid);
const getNotesStatic=cid=>NOTES.filter(n=>n.cid===cid).sort((a,b)=>new Date(b.at)-new Date(a.at));
const getAllLines=sigs=>[...new Set(sigs.flatMap(s=>getImps(s.id).map(i=>i.line)))];

// ── UTILS ──
const getCat=(id,lang)=>{const c=CATS.find(x=>x.id===id);return c?{...c,label:c.label[lang]||c.label.en,s:c.s[lang]||c.s.en}:null};
const fD=iso=>{const ms=Date.now()-new Date(iso).getTime(),m=Math.floor(ms/60000),h=Math.floor(ms/3600000),d=Math.floor(ms/86400000);if(m<1)return"Now";if(m<60)return`${m}m`;if(h<24)return`${h}h`;if(d<7)return`${d}d`;return new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short"})};
const sC=s=>s>=80?"#EF4444":s>=60?"#F59E0B":s>=40?"#3B82F6":"#10B981";
const sBg=s=>s>=80?"rgba(239,68,68,.12)":s>=60?"rgba(245,158,11,.12)":s>=40?"rgba(59,130,246,.12)":"rgba(16,185,129,.12)";
const sT=s=>s>=80?"#FCA5A5":s>=60?"#FCD34D":s>=40?"#93C5FD":"#6EE7B7";
const tI=t=>t==="rising"?"↑":t==="declining"?"↓":"→";

// ── CSS ──
const css=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@400;500;600;700&display=swap');
:root{--bg:#070C18;--bg2:#0D1424;--bg3:#131B30;--bg4:#1A2440;--b:#1E2B45;--b2:#283A58;--t1:#F1F3F8;--t2:#C5CBD9;--t3:#8B96AD;--t4:#5A6580;--t5:#3D4A63;--gold:#C9A84C;--gold2:#D4B85C;--gbg:rgba(201,168,76,.06);--r:14px;--rs:10px;--mw:480px}
*{margin:0;padding:0;box-sizing:border-box}body,#root{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--t2);-webkit-font-smoothing:antialiased;min-height:100vh}
.app{max-width:var(--mw);margin:0 auto;min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px}
.fd{font-family:'Playfair Display',Georgia,serif}
.hsb::-webkit-scrollbar{display:none}.hsb{scrollbar-width:none}
@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes pd{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.fi{animation:fi .35s cubic-bezier(.22,1,.36,1) forwards}.fi1{animation-delay:.04s;opacity:0}.fi2{animation-delay:.08s;opacity:0}.fi3{animation-delay:.12s;opacity:0}.fi4{animation-delay:.16s;opacity:0}.fi5{animation-delay:.2s;opacity:0}
.pd{width:6px;height:6px;border-radius:50%;background:#34D399;animation:pd 2.5s ease-in-out infinite}
.card{background:var(--bg2);border:1px solid var(--b);border-radius:var(--r);transition:border-color .2s,transform .15s}.card:active{transform:scale(.988)}.card:hover{border-color:var(--b2)}
.card-el{background:linear-gradient(135deg,var(--bg3),var(--bg2));border:1px solid var(--b2);border-radius:var(--r)}
.cs{background:var(--bg3);border:1px solid var(--b);border-radius:var(--rs);padding:14px 16px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;font-family:inherit;cursor:pointer;transition:all .2s;white-space:nowrap}
.bp{padding:11px 22px;border-radius:var(--rs);font-size:13px;font-weight:600;color:var(--bg);background:linear-gradient(135deg,var(--gold),var(--gold2));box-shadow:0 1px 3px rgba(201,168,76,.2)}.bp:disabled{opacity:.4;cursor:not-allowed}.bp:hover:not(:disabled){box-shadow:0 2px 8px rgba(201,168,76,.35)}
.bg{padding:4px 0;background:transparent;color:var(--t3);font-size:13px;font-weight:500}
.bi{width:36px;height:36px;padding:0;border-radius:var(--rs);display:flex;align-items:center;justify-content:center;background:var(--bg3);border:1px solid var(--b);color:var(--t3);cursor:pointer;transition:all .2s}.bi:hover{background:var(--bg4);color:var(--t1)}
.chip{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:500;background:var(--bg3);color:var(--t3);border:1px solid var(--b);cursor:pointer;transition:all .2s;white-space:nowrap}.chip:hover{border-color:var(--b2)}.chip.on{background:var(--gbg);color:var(--gold2);border-color:rgba(201,168,76,.3)}
.badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.03em}
.ftag{display:inline-flex;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:2px 7px;border-radius:4px}
.inp{width:100%;padding:11px 16px;border-radius:var(--rs);background:var(--bg3);border:1px solid var(--b);color:var(--t1);font-family:inherit;font-size:14px;outline:none;transition:all .2s}.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1)}.inp::placeholder{color:var(--t5)}textarea.inp{resize:vertical;min-height:88px;line-height:1.6}
.lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em}
.dv{height:1px;background:var(--b);margin:20px 0}
.aline{height:2px;background:linear-gradient(90deg,var(--gold),rgba(212,184,92,.3),transparent);border-radius:1px}
.hdr{position:sticky;top:0;z-index:50;background:rgba(7,12,24,.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(30,43,69,.6);padding:14px 20px}
.tbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:var(--mw);display:flex;background:rgba(13,20,36,.96);backdrop-filter:blur(20px);border-top:1px solid var(--b);z-index:100;padding:0 0 env(safe-area-inset-bottom,6px)}
.tbar button{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 6px;color:var(--t5);background:none;border:none;cursor:pointer;transition:color .2s;font-family:inherit}.tbar button.on{color:var(--gold)}.tbar span{font-size:9px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.bsbg{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:flex-end;justify-content:center}
.bsm{width:100%;max-width:var(--mw);max-height:92vh;overflow-y:auto;background:var(--bg2);border-top:1px solid var(--b2);border-radius:18px 18px 0 0;padding:8px 22px 28px;animation:su .3s cubic-bezier(.22,1,.36,1)}
.toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%);background:var(--bg4);color:var(--t1);padding:10px 22px;border-radius:var(--r);font-size:13px;font-weight:500;box-shadow:0 8px 30px rgba(0,0,0,.4);border:1px solid var(--b2);z-index:300;animation:fi .2s ease}
.mono{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-weight:600;font-size:14px;color:var(--t1);background:linear-gradient(135deg,var(--bg4),var(--bg3));border:1px solid var(--b2);flex-shrink:0}
.sr{position:relative;display:flex;align-items:center;justify-content:center}.sr svg{position:absolute;top:0;left:0;transform:rotate(-90deg)}.sr-v{font-weight:700;z-index:1}
.prio-primary{border-left:3px solid var(--gold)}.prio-secondary{border-left:3px solid #60A5FA}.prio-watch{border-left:3px solid var(--b2)}
.lang-sw{display:flex;border-radius:var(--rs);overflow:hidden;border:1px solid var(--b)}.lang-sw button{flex:1;padding:8px 16px;font-size:13px;font-weight:500;border:none;cursor:pointer;transition:all .2s;font-family:inherit;background:var(--bg3);color:var(--t3)}.lang-sw button.on{background:var(--gbg);color:var(--gold2)}
.sig-grid{display:flex;flex-direction:column;gap:12px}
.co-grid{display:flex;flex-direction:column;gap:10px}
@media(min-width:768px){
  :root{--mw:720px}
  .hdr{padding:16px 28px}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .co-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .bsm{border-radius:18px 18px 0 0;max-width:600px;padding:12px 32px 32px}
  .tbar button{padding:12px 0 8px}.tbar span{font-size:10px}
}
@media(min-width:1024px){
  :root{--mw:960px}
  .hdr{padding:18px 36px}
  .sig-grid{grid-template-columns:1fr 1fr 1fr;gap:16px}
  .co-grid{grid-template-columns:1fr 1fr;gap:14px}
  .bsm{max-width:640px;border-radius:18px;margin-bottom:40px}
  .bsbg{align-items:center}
  .app{border-left:1px solid var(--b);border-right:1px solid var(--b)}
}`;

// ── ICONS ──
const ic=(d,w=20)=>(p)=><svg {...p} style={{width:w,height:w,...(p?.style||{})}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const I={
  radar:p=><svg {...p} style={{width:22,height:22,...(p?.style||{})}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4"/></svg>,
  home:ic("M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"),list:ic("M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"),bar:ic("M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4"),note:ic("M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8"),brief:ic("M2 3h20v14H2zM8 21h8M12 17v4"),search:ic("M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",18),plus:ic("M12 5v14M5 12h14",18),x:ic("M18 6L6 18M6 6l12 12",18),chL:ic("M15 18l-6-6 6-6",16),chR:ic("M9 18l6-6-6-6",16),filter:ic("M22 3H2l8 9.46V19l4 2V12.46z",16),bell:ic("M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"),copy:ic("M9 9h13v13H9zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",16),check:ic("M20 6L9 17l-5-5",16),lock:ic("M3 11h18v11H3zM7 11V7a5 5 0 0110 0v4"),
  star:p=><svg {...p} style={{width:16,height:16,...(p?.style||{})}} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  starO:p=><svg {...p} style={{width:16,height:16,...(p?.style||{})}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clock:ic("M12 12V6M16 14l-4-2M22 12a10 10 0 11-20 0 10 10 0 0120 0z",12),ext:ic("M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",10),settings:ic("M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"),logout:ic("M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"),
  refresh:ic("M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"),
  mic:ic("M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"),
  stop:ic("M6 4h4v16H6zM14 4h4v16h-4z"),
  share:ic("M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"),
  download:ic("M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"),
  calendar:ic("M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"),
};

function SR({s,sz=44,sw=3}){const r=(sz-sw*2)/2,c=2*Math.PI*r,o=c-(s/100)*c,col=sC(s);return (<div className="sr" style={{width:sz,height:sz}}><svg width={sz} height={sz}><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="var(--b)" strokeWidth={sw}/><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" style={{transition:"stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)"}}/></svg><span className="sr-v" style={{color:col,fontSize:sz*.29}}>{s}</span></div>)}

function RiskChart({data,h=100}){
  if(!data||data.length<2)return null;
  const w=300,pad=24,gw=w-pad*2,gh=h-pad*2;
  const scores=data.map(d=>d.score);
  const mn=Math.max(0,Math.min(...scores)-10),mx=Math.min(100,Math.max(...scores)+10);
  const pts=data.map((d,i)=>{const x=pad+i/(data.length-1)*gw;const y=pad+(1-(d.score-mn)/(mx-mn||1))*gh;return{x,y,s:d.score,d:d.date}});
  const line=pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
  const area=`${line} L${pts[pts.length-1].x},${h-pad} L${pts[0].x},${h-pad} Z`;
  const last=pts[pts.length-1];
  return (<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h}}>
    <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sC(last.s)} stopOpacity="0.2"/><stop offset="100%" stopColor={sC(last.s)} stopOpacity="0"/></linearGradient></defs>
    {[25,50,75].filter(v=>v>=mn&&v<=mx).map(v=>{const y=pad+(1-(v-mn)/(mx-mn||1))*gh;return (<g key={v}><line x1={pad} y1={y} x2={w-pad} y2={y} stroke="var(--b)" strokeWidth="0.5" strokeDasharray="3,3"/><text x={pad-4} y={y+3} fill="var(--t5)" fontSize="8" textAnchor="end">{v}</text></g>)})}
    <path d={area} fill="url(#rg)"/>
    <path d={line} fill="none" stroke={sC(last.s)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={i===pts.length-1?4:2} fill={i===pts.length-1?sC(p.s):"var(--bg2)"} stroke={sC(p.s)} strokeWidth="1.5"/>)}
    <text x={last.x+8} y={last.y+4} fill={sC(last.s)} fontSize="11" fontWeight="700">{last.s}</text>
    {data.length>1&&<><text x={pad} y={h-4} fill="var(--t5)" fontSize="8">{data[0].date.slice(5)}</text><text x={w-pad} y={h-4} fill="var(--t5)" fontSize="8" textAnchor="end">{data[data.length-1].date.slice(5)}</text></>}
  </svg>);
}

// ── APP ──
function App(){
  const{lang,t,setLang}=useLang();
  const[step,setStepRaw]=useState(()=>{try{return localStorage.getItem("signalis_step")||"login"}catch(e){return"login"}});
  const setStep=useCallback(s=>{setStepRaw(s);try{localStorage.setItem("signalis_step",s)}catch(e){}},[]);
  const[tab,setTabRaw]=useState(()=>{try{return localStorage.getItem("signalis_tab")||"dashboard"}catch(e){return"dashboard"}});
  const setTab=useCallback(t=>{setTabRaw(t);try{localStorage.setItem("signalis_tab",t)}catch(e){}},[]);
  const[loginEm,setLoginEm]=useState("");
  const[loginPw,setLoginPw]=useState("");
  const[loginErr,setLoginErr]=useState(false);
  const tryLogin=()=>{if(loginEm.toLowerCase()==="asprevel@gmail.com"&&loginPw==="3Oct2005"){setLoginErr(false);loadDB();setStep("select")}else{setLoginErr(true)}};
  const[cos,setCos]=useState(()=>{
    const savedPrios=lsGet("watchPrios",null);
    const savedExtras=lsGet("watchExtras",[]);
    if(!savedPrios)return COMPANIES;
    const base=COMPANIES.map(c=>({...c,prio:savedPrios[c.id]!==undefined?savedPrios[c.id]:c.prio}));
    return[...base,...savedExtras];
  });
  const[notes,setNotes]=useState(()=>{
    const savedNotes=lsGet("userNotes",[]);
    if(savedNotes.length>0)return[...savedNotes,...NOTES.filter(n=>!savedNotes.find(s=>s.id===n.id))];
    return NOTES;
  });
  const[dbLoaded,setDbLoaded]=useState(false);

  // ── Supabase persistence ──
  const USER_EMAIL="asprevel@gmail.com";

  const loadDB=useCallback(async()=>{
    if(!sbOk){setDbLoaded(true);return}
    try{
      const prefs=await sbFetch("user_prefs","GET",null,`?user_email=eq.${encodeURIComponent(USER_EMAIL)}&limit=1`);
      if(prefs&&prefs[0]){
        setLang(prefs[0].lang||"fr");
        if(prefs[0].selected_lines)setSelLines(prefs[0].selected_lines);
        if(prefs[0].auto_refresh!==undefined)setAutoRefresh(prefs[0].auto_refresh);
      }
      const wl=await sbFetch("watchlist","GET",null,`?user_email=eq.${encodeURIComponent(USER_EMAIL)}`);
      if(wl&&wl.length>0){
        setCos(prev=>{
          const updated=prev.map(c=>{const entry=wl.find(w=>w.company_id===c.id);return entry?{...c,prio:entry.priority||"watch"}:{...c,prio:null}});
          const staticIds=new Set(prev.map(c=>c.id));
          const extras=wl.filter(w=>!staticIds.has(w.company_id)).map(w=>({id:w.company_id,name:w.company_name,sector:w.company_sector||"—",hq:w.company_hq||"—",ticker:w.company_ticker,cap:w.company_cap||"—",emp:w.company_emp||"—",logo:w.company_logo||(w.company_name?w.company_name[0]:"?"),risk:w.company_risk||50,trend:w.company_trend||"stable",prio:w.priority||"watch"}));
          return[...updated,...extras];
        });
      }
      const dbNotes=await sbFetch("notes","GET",null,`?user_email=eq.${encodeURIComponent(USER_EMAIL)}&order=created_at.desc`);
      if(dbNotes&&dbNotes.length>0){
        const mapped=dbNotes.map(n=>({id:n.id,cid:n.company_id,text:n.content,tag:n.tag,at:n.created_at}));
        setNotes(prev=>[...mapped,...prev.filter(p=>!mapped.find(m=>m.id===p.id))]);
      }
      const liveDb=await sbFetch("live_signals","GET",null,`?user_email=eq.${encodeURIComponent(USER_EMAIL)}&order=fetched_at.desc&limit=50`);
      if(liveDb&&liveDb.length>0){
        const mapped=liveDb.map(s=>({id:s.id,cid:s.company_id,title:{en:s.title_en||"",fr:s.title_fr||""},sum:{en:s.summary_en||"",fr:s.summary_fr||""},src:s.source_name||"Web",at:s.fetched_at,cat:s.category||"governance",fact:s.factuality||"needs_review",imp:s.importance||50,conf:s.confidence||50,live:true,_impacts:s.impacts||[]}));
        const seen=new Set();const deduped=mapped.filter(s=>{const t=(s.title?.en||"").toLowerCase().trim();if(!t||seen.has(t))return false;seen.add(t);return true});
        setLiveSigs(deduped);
      }
      setDbLoaded(true);
    }catch(e){console.error("DB load error:",e);setDbLoaded(true)}
  },[]);

  const saveWatchlistDB=useCallback(async(company,prio)=>{
    if(!sbOk)return;
    try{
      if(prio){
        await sbFetch("watchlist","POST",{user_email:USER_EMAIL,company_id:company.id,company_name:company.name,company_sector:typeof company.sector==="object"?company.sector.en:company.sector,company_hq:company.hq,company_ticker:company.ticker,company_cap:company.cap,company_emp:company.emp,company_logo:company.logo,company_risk:company.risk,company_trend:company.trend,priority:prio},`?on_conflict=user_email,company_id`);
      }else{
        await sbFetch("watchlist","DELETE",null,`?user_email=eq.${encodeURIComponent(USER_EMAIL)}&company_id=eq.${encodeURIComponent(company.id)}`);
      }
    }catch(e){console.error("Save watchlist error:",e)}
  },[]);

  const saveNoteDB=useCallback(async(note)=>{
    if(!sbOk)return;
    try{
      await sbFetch("notes","POST",{user_email:USER_EMAIL,company_id:note.cid,content:typeof note.text==="string"?note.text:note.text?.en||"",tag:note.tag});
    }catch(e){console.error("Save note error:",e)}
  },[]);

  const savePrefsDB=useCallback(async(updates)=>{
    if(!sbOk)return;
    try{
      await sbFetch("user_prefs","PATCH",{...updates,updated_at:new Date().toISOString()},`?user_email=eq.${encodeURIComponent(USER_EMAIL)}`);
    }catch(e){console.error("Save prefs error:",e)}
  },[]);

  const saveLiveSignalsDB=useCallback(async(signals)=>{
    if(!sbOk||!signals.length)return;
    try{
      for(const s of signals){
        await sbFetch("live_signals","POST",{id:s.id,user_email:USER_EMAIL,company_id:s.cid,company_name:s.company||"",title_en:s.title?.en||"",title_fr:s.title?.fr||"",summary_en:s.sum?.en||s.summary?.en||"",summary_fr:s.sum?.fr||s.summary?.fr||"",source_name:s.src||s.source||"Web",category:s.cat||s.category||"governance",importance:s.imp||s.importance||50,confidence:s.conf||s.confidence||50,factuality:s.fact||s.factuality||"needs_review",impacts:s._impacts||s.impacts||[],fetched_at:s.at||new Date().toISOString()});
      }
    }catch(e){console.error("Save live signals error:",e)}
  },[]);
  const[selComp,setSC]=useState(null);
  const[selSig,setSS]=useState(null);
  const[showBrief,setSB]=useState(false);
  const[briefCid,setBC]=useState(null);
  const[showDigest,setSD]=useState(false);
  const[meetings,setMeetings]=useState(()=>lsGet("meetings",[]));
  const[showNewMeeting,setSNM]=useState(false);
  const[mtgCo,setMtgCo]=useState("");
  const[mtgDate,setMtgDate]=useState("");
  const[mtgType,setMtgType]=useState("broker");
  const[mtgNotes,setMtgNotes]=useState("");
  const[search,setSrch]=useState("");
  const[activeCat,setACat]=useState(null);
  const[showNewNote,setSNN]=useState(false);
  const[nText,setNT]=useState("");
  const[noteDictating,setNoteDictating]=useState(false);
  const noteDictRef=useRef(null);
  const startNoteDict=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){showT(t("rec_error"));return}
    const r=new SR();r.continuous=true;r.interimResults=true;r.lang=lang==="fr"?"fr-FR":"en-US";
    let base=nText;
    r.onresult=e=>{let final="",interim="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+" ";else interim=e.results[i][0].transcript}if(final)base+=final;setNT(base+interim)};
    r.onerror=()=>{};
    r.onend=()=>{if(noteDictating)try{r.start()}catch(e){}};
    noteDictRef.current=r;r.start();setNoteDictating(true);
  },[lang,nText,noteDictating,t]);
  const stopNoteDict=useCallback(()=>{if(noteDictRef.current){noteDictRef.current.onend=null;noteDictRef.current.stop();noteDictRef.current=null}setNoteDictating(false)},[]);
  const[nComp,setNC]=useState("");
  const[nTag,setNTg]=useState("observation");
  const[showSearch,setSSh]=useState(false);
  const[viewMode,setViewMode]=useState(()=>lsGet("viewMode","grid"));
  const[sortMode,setSortMode]=useState(()=>lsGet("sortMode","recent"));
  const[wlView,setWlView]=useState(()=>lsGet("wlView","grid"));
  const[wlSort,setWlSort]=useState(()=>lsGet("wlSort","risk"));
  const[toast,setToast]=useState(null);
  const[copied,setCopied]=useState(false);
  const[noteFilter,setNF]=useState(null);
  const[addSrch,setAS]=useState("");
  const ALL_LINES=["do","epl","ptl","fraud","knr","bbb","rcpro","cyber","rcg","rc_env","motor","marine","property","mna","trade_credit","trade_finance","gpa_bta","affinity","aviation"];
  const[selLines,setSelLines]=useState(()=>lsGet("selLines",ALL_LINES));
  const togLine=k=>{setSelLines(p=>{const n=p.includes(k)?p.filter(x=>x!==k):[...p,k];lsSet("selLines",n);savePrefsDB({selected_lines:n});return n})};

  // ── Voice recording ──
  const[showRec,setShowRec]=useState(false);
  const[isOffline,setIsOffline]=useState(false);
  useEffect(()=>{
    const on=()=>setIsOffline(false);const off=()=>setIsOffline(true);
    window.addEventListener("online",on);window.addEventListener("offline",off);
    setIsOffline(!navigator.onLine);
    return ()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off)};
  },[]);
  const[recCid,setRecCid]=useState(null);
  const[isRec,setIsRec]=useState(false);
  const[transcript,setTranscript]=useState("");
  const[recProcessing,setRecProcessing]=useState(false);
  const recognitionRef=useRef(null);
  const startRec=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){showT(t("rec_error"));return}
    const r=new SR();
    r.continuous=true;r.interimResults=true;r.lang=lang==="fr"?"fr-FR":"en-US";
    let finalT="";
    r.onresult=e=>{let interim="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)finalT+=e.results[i][0].transcript+" ";else interim=e.results[i][0].transcript}setTranscript(finalT+interim)};
    r.onerror=e=>{console.error("Speech error:",e.error)};
    r.onend=()=>{if(isRec)try{r.start()}catch(e){}};
    recognitionRef.current=r;
    r.start();setIsRec(true);setTranscript("");
  },[lang,isRec,t]);
  const stopRec=useCallback(async()=>{
    if(recognitionRef.current){recognitionRef.current.onend=null;recognitionRef.current.stop();recognitionRef.current=null}
    setIsRec(false);
    if(!transcript.trim()){showT(t("rec_empty"));return}
    setRecProcessing(true);
    let summary=transcript;
    // Try to summarize with Claude API
    try{
      const res=await fetch("/api/summarize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript,lang,company:cos.find(c=>c.id===recCid)?.name||""})});
      if(res.ok){const data=await res.json();if(data.summary)summary=data.summary}
    }catch(e){}
    // Save as note
    const note={id:`rec${Date.now()}`,cid:recCid,text:summary,tag:"observation",at:new Date().toISOString()};
    setNotes(p=>[note,...p]);saveNoteDB(note);
    setRecProcessing(false);setShowRec(false);setTranscript("");
    showT(t("rec_saved"));
  },[transcript,recCid,cos,lang,t,saveNoteDB]);
  const[liveSigs,setLiveSigs]=useState([]);
  const[riskHistory,setRiskHistory]=useState(()=>lsGet("riskHistory",{}));
  const[refreshing,setRefreshing]=useState(false);
  const[lastRefresh,setLastRefresh]=useState(null);
  const[newCount,setNewCount]=useState(0);
  const[autoRefresh,setAutoRefresh]=useState(()=>lsGet("autoRefresh",true));
  const[ollamaUrl,setOllamaUrl]=useState(()=>lsGet("ollamaUrl","http://localhost:11434"));
  const[ollamaModel,setOllamaModel]=useState(()=>lsGet("ollamaModel","mistral"));
  const[ollamaEnabled,setOllamaEnabled]=useState(()=>lsGet("ollamaEnabled",true));
  const[enriching,setEnriching]=useState(false);
  const INTERVALS=[{m:15,l:{en:"15 min",fr:"15 min"}},{m:30,l:{en:"30 min",fr:"30 min"}},{m:60,l:{en:"1h",fr:"1h"}},{m:120,l:{en:"2h",fr:"2h"}},{m:240,l:{en:"4h",fr:"4h"}}];
  const[refreshMin,setRefreshMin]=useState(()=>lsGet("refreshMin",60));
  const[refreshVal,setRefreshVal]=useState(()=>{const m=lsGet("refreshMin",60);return m>=60?m/60:m});
  const[refreshUnit,setRefreshUnit]=useState(()=>{const m=lsGet("refreshMin",60);return m>=60?"h":"m"});
  const applyRefresh=(val,unit)=>{const num=Math.max(1,parseInt(val)||1);const mins=unit==="h"?num*60:unit==="j"?num*1440:num;setRefreshMin(mins);lsSet("refreshMin",mins);setRefreshVal(num);setRefreshUnit(unit)};

  const showT=m=>{setToast(m);setTimeout(()=>setToast(null),2800)};
  const watched=useMemo(()=>cos.filter(c=>c.prio).sort((a,b)=>b.risk-a.risk),[cos]);
  const togW=useCallback((id,forcePrio)=>{
    setCos(p=>{
      const updated=p.map(c=>{
        if(c.id!==id)return c;
        const newPrio=forcePrio!==undefined?(c.prio?null:forcePrio):(c.prio?null:"watch");
        const newC={...c,prio:newPrio};
        saveWatchlistDB(newC,newPrio);
        return newC;
      });
      return updated;
    });
  },[saveWatchlistDB]);
  const addN=()=>{if(!nText.trim())return;if(noteDictating)stopNoteDict();const cleaned=nText.trim().replace(/\s+/g," ").replace(/ ([.,;:!?])/g,"$1");const sentences=cleaned.replace(/([.!?])\s+/g,"$1\n").split("\n").map(s=>s.trim()).filter(Boolean).map(s=>s.charAt(0).toUpperCase()+s.slice(1));const formatted=sentences.join(". ").replace(/\.\./g,".");const note={id:`n${Date.now()}`,cid:nComp||null,text:formatted,tag:nTag,at:new Date().toISOString()};setNotes(p=>[note,...p]);saveNoteDB(note);setNT("");setSNN(false);showT(t("note_saved"))};
  const deleteN=(id)=>{setNotes(p=>p.filter(n=>n.id!==id));if(sbOk)sbFetch("notes","DELETE",null,`?id=eq.${encodeURIComponent(id)}`).catch(()=>{});showT(lang==="fr"?"Note supprimée":"Note deleted")};

  // Meetings
  const addMeeting=()=>{if(!mtgCo||!mtgDate)return;const m={id:`mtg${Date.now()}`,cid:mtgCo,date:mtgDate,type:mtgType,notes:mtgNotes,createdAt:new Date().toISOString()};setMeetings(p=>{const n=[m,...p];lsSet("meetings",n);return n});setMtgCo("");setMtgDate("");setMtgType("broker");setMtgNotes("");setSNM(false);showT(t("meeting_saved"))};
  const deleteMeeting=(id)=>{setMeetings(p=>{const n=p.filter(m=>m.id!==id);lsSet("meetings",n);return n});showT(t("meeting_deleted"))};
  const exportICS=(mtg)=>{const co=cos.find(c=>c.id===mtg.cid);const name=co?.name||"Réunion";const d=new Date(mtg.date);const end=new Date(d.getTime()+3600000);const fmt=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SIGNALIS//FR\nBEGIN:VEVENT\nDTSTART:${fmt(d)}\nDTEND:${fmt(end)}\nSUMMARY:${mtg.type==="broker"?"RDV Courtier":"RDV RM"} — ${name}\nDESCRIPTION:${mtg.notes||"Préparé par SIGNALIS"}\nEND:VEVENT\nEND:VCALENDAR`;const blob=new Blob([ics],{type:"text/calendar"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`signalis-${name.replace(/\s/g,"-")}.ics`;a.click();URL.revokeObjectURL(url)};
  const upcomingMtgs=meetings.filter(m=>new Date(m.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const pastMtgs=meetings.filter(m=>new Date(m.date)<new Date()).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const mtgLabel=(mtg)=>{const d=new Date(mtg.date);const now=new Date();const diff=Math.ceil((d-now)/(86400000));if(diff===0)return{l:t("today"),c:"#F87171"};if(diff===1)return{l:t("tomorrow"),c:"#FBBF24"};if(diff>0)return{l:`${diff} ${t("days_left")}`,c:"#60A5FA"};return{l:fD(mtg.date),c:"var(--t5)"}};
  useEffect(()=>{lsSet("meetings",meetings)},[meetings]);

  // ── Live refresh ──
  // Ollama enrichment
  const enrichWithOllama=useCallback(async(signals)=>{
    if(!ollamaEnabled||signals.length===0)return;
    setEnriching(true);
    for(let i=0;i<signals.length;i+=3){
      const batch=signals.slice(i,i+3);
      try{
        const prompt=`Tu es expert assurance Financial Lines. Traduis et analyse ces signaux pour un Account Manager français.\n\n${batch.map((s,j)=>`[${j}] ${s.company||""}: ${tx(s.title,"en")}`).join("\n")}\n\nRéponds UNIQUEMENT en JSON array sans markdown:\n[{"i":0,"title_fr":"titre français","summary_fr":"résumé 2 phrases","category":"governance|regulatory_compliance|litigation_investigation|financial_stress_reporting|mna_transactions|cyber_data_breach|fraud_crime|esg_reputation|hr_culture","importance":50,"impacts":[{"line":"do","level":"medium","why_fr":"pourquoi FL","angle_fr":"angle discussion"}]}]`;
        const res=await fetch(ollamaUrl+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:ollamaModel,messages:[{role:"user",content:prompt}],stream:false,options:{temperature:0.3}})});
        if(!res.ok)continue;
        const data=await res.json();
        const raw=(data.message?.content||"").replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
        const arr=JSON.parse(raw);
        if(!Array.isArray(arr))continue;
        setLiveSigs(prev=>prev.map(s=>{
          const bIdx=batch.findIndex(b=>b.id===s.id);
          if(bIdx===-1)return s;
          const e=arr.find(x=>x.i===bIdx);
          if(!e)return s;
          return {...s,
            title:{en:tx(s.title,"en"),fr:e.title_fr||tx(s.title,"en")},
            sum:{en:tx(s.sum||s.summary,"en"),fr:e.summary_fr||""},
            cat:e.category||s.cat,
            imp:e.importance||s.imp,
            _impacts:(e.impacts||[]).map(imp=>({line:imp.line||"do",level:imp.level||"medium",why:{en:imp.why_en||imp.why_fr||"",fr:imp.why_fr||""},angle:{en:imp.angle_en||imp.angle_fr||"",fr:imp.angle_fr||""},vig:[],hyp:[]}))
          };
        }));
      }catch(e){console.error("Ollama error:",e)}
    }
    setEnriching(false);
    showT(lang==="fr"?"Enrichissement IA terminé":"AI enrichment complete");
  },[ollamaUrl,ollamaModel,ollamaEnabled,lang]);

  const refreshSignals=useCallback(async()=>{
    const wCos=cos.filter(c=>c.prio);
    if(wCos.length===0||refreshing)return;
    setRefreshing(true);
    try{
      const res=await fetch("/api/refresh",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({companies:wCos.map(c=>({name:c.name,sector:tx(c.sector,lang)})),lang})});
      if(!res.ok)throw new Error(await res.text());
      const data=await res.json();
      if(data.signals&&data.signals.length>0){
        const mapped=data.signals.map(s=>{const co=cos.find(c=>c.name.toLowerCase()===s.company.toLowerCase())||cos.find(c=>s.company.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]));return {id:s.id,cid:co?.id||null,title:s.title||{en:s.company,fr:s.company},sum:s.summary||{en:"",fr:""},src:s.source||"Web",at:s.fetchedAt||new Date().toISOString(),cat:s.category||"governance",fact:s.factuality||"needs_review",imp:s.importance||50,conf:s.confidence||50,live:true,_impacts:s.impacts||[]}}).filter(s=>s.cid);
        setLiveSigs(p=>{const existTitles=new Set(p.map(s=>tx(s.title,"en").toLowerCase().trim()));const fresh=mapped.filter(s=>{const t=tx(s.title,"en").toLowerCase().trim();return t&&!existTitles.has(t)});return[...fresh,...p]});
        saveLiveSignalsDB(mapped);
        setNewCount(p=>{const n=p+mapped.length;try{navigator.setAppBadge&&navigator.setAppBadge(n)}catch(e){}return n});
        // Push notification for critical signals
        const crits=mapped.filter(s=>s.imp>=80);
        if(crits.length>0&&typeof Notification!=="undefined"&&Notification.permission==="granted"){
          const co=cos.find(c=>c.id===crits[0].cid);
          new Notification("SIGNALIS",{body:`${lang==="fr"?"Signal critique":"Critical signal"}: ${co?.name||""} — ${tx(crits[0].title,lang)}`,icon:"/icon-192.png",badge:"/icon-192.png",tag:"signalis-"+crits[0].id});
          if(crits.length>1)new Notification("SIGNALIS",{body:`${lang==="fr"?`+ ${crits.length-1} autre(s) signal(aux) critique(s)`:`+ ${crits.length-1} more critical signal(s)`}`,icon:"/icon-192.png",tag:"signalis-batch"});
        }
        setLastRefresh(new Date().toISOString());
        showT(lang==="fr"?`${mapped.length} nouveau(x) signal(aux) détecté(s)`:`${mapped.length} new signal(s) detected`);
        // Record risk snapshots
        const today=new Date().toISOString().split("T")[0];
        setRiskHistory(prev=>{const h={...prev};cos.filter(c=>c.prio).forEach(c=>{const sigs=mapped.filter(s=>s.cid===c.id);const sigCount=sigs.length;const avgImp=sigCount>0?sigs.reduce((a,s)=>a+(s.imp||50),0)/sigCount:0;const boost=Math.min(30,sigCount*5+Math.max(0,avgImp-50)*0.3);const score=Math.min(100,Math.round((c.risk||50)+boost));if(!h[c.id])h[c.id]=[];const last=h[c.id][h[c.id].length-1];if(!last||last.date!==today){h[c.id].push({date:today,score});if(h[c.id].length>30)h[c.id]=h[c.id].slice(-30)}else{h[c.id][h[c.id].length-1].score=Math.max(last.score,score)}});lsSet("riskHistory",h);return h});
        // Enrich with Ollama (async, signals update in place)
        if(ollamaEnabled)setTimeout(()=>enrichWithOllama(mapped),500);
      }else{
        setLastRefresh(new Date().toISOString());
        showT(lang==="fr"?"Aucun nouveau signal":"No new signals");
      }
    }catch(e){console.error("Refresh error:",e);showT(lang==="fr"?"Erreur de rafraîchissement":"Refresh error")}
    setRefreshing(false);
  },[cos,lang,refreshing]);

  // Auto-refresh every hour
  const refreshRef=useRef(null);
  useEffect(()=>{
    if(autoRefresh&&step==="app"){
      refreshRef.current=setInterval(()=>refreshSignals(),refreshMin*60000);
      return ()=>clearInterval(refreshRef.current);
    }
  },[autoRefresh,step,refreshSignals,refreshMin]);

  // Auto-load DB if already logged in (page refresh)
  useEffect(()=>{
    if(step==="app"&&!dbLoaded)loadDB();
  },[step,dbLoaded,loadDB]);

  // Seed risk history with base scores and auto-refresh on app start
  const initialRefreshDone=useRef(false);
  useEffect(()=>{
    if(step==="app"&&!initialRefreshDone.current){
      initialRefreshDone.current=true;
      // Seed base scores for today if not already recorded
      const today=new Date().toISOString().split("T")[0];
      setRiskHistory(prev=>{
        const h={...prev};
        cos.filter(c=>c.prio).forEach(c=>{
          if(!h[c.id])h[c.id]=[];
          if(h[c.id].length===0||h[c.id][h[c.id].length-1].date!==today){
            h[c.id].push({date:today,score:c.risk||50});
          }
        });
        lsSet("riskHistory",h);
        return h;
      });
      // Auto-refresh after 2 seconds
      setTimeout(()=>refreshSignals(),2000);
    }
  },[step,cos,refreshSignals]);

  // Request notification permission
  useEffect(()=>{
    if(step==="app"&&typeof Notification!=="undefined"&&Notification.permission==="default"){
      setTimeout(()=>Notification.requestPermission(),3000);
    }
  },[step]);

  // Register Service Worker for offline support
  useEffect(()=>{
    if(typeof window!=="undefined"&&"serviceWorker"in navigator){
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
  },[]);

  // Persist watchlist to localStorage
  useEffect(()=>{
    if(step!=="login"){
      const prios={};cos.forEach(c=>{if(c.prio)prios[c.id]=c.prio});
      lsSet("watchPrios",prios);
      const staticIds=new Set(COMPANIES.map(c=>c.id));
      const extras=cos.filter(c=>!staticIds.has(c.id)&&c.prio);
      lsSet("watchExtras",extras);
    }
  },[cos,step]);

  // Persist user notes to localStorage
  useEffect(()=>{
    if(step!=="login"){
      const seedIds=new Set(NOTES.map(n=>n.id));
      const userNotes=notes.filter(n=>!seedIds.has(n.id));
      lsSet("userNotes",userNotes);
    }
  },[notes,step]);

  // Persist autoRefresh to localStorage
  useEffect(()=>{lsSet("autoRefresh",autoRefresh)},[autoRefresh]);

  // Merge static + live signals
  const allSignals=useMemo(()=>{
    const live=liveSigs.map(s=>({...s,impacts:undefined}));
    return[...SIGNALS,...live];
  },[liveSigs]);
  const liveImpacts=useMemo(()=>liveSigs.flatMap(s=>(s._impacts||[]).map(i=>({sid:s.id,line:i.line,lvl:i.level,why:i.why,angle:i.angle,vig:[],hyp:[]}))),[liveSigs]);
  const getImpsAll=useCallback(sid=>{const stat=IMPACTS.filter(i=>i.sid===sid);const live=liveImpacts.filter(i=>i.sid===sid);return[...stat,...live]},[liveImpacts]);
  const getLinesAll=useCallback(sigs=>[...new Set(sigs.flatMap(s=>getImpsAll(s.id).map(i=>i.line)))],[getImpsAll]);

  // getSigs and getNotes include live data
  const getSigs=useCallback(cid=>{
    const co=cos.find(c=>c.id===cid);
    const raw=allSignals.filter(s=>{
      if(s.cid===cid)return true;
      if(co&&s.company){const n=s.company.toLowerCase();return n===co.name.toLowerCase()||n.includes(co.name.toLowerCase().split(" ")[0])}
      return false;
    }).sort((a,b)=>(b.imp||0)-(a.imp||0));
    const seen=new Set();
    return raw.filter(s=>{const t=tx(s.title,"en").toLowerCase().trim();if(!t||seen.has(t))return false;seen.add(t);return true});
  },[allSignals,cos]);
  const getNotes=useCallback(cid=>notes.filter(n=>n.cid===cid).sort((a,b)=>new Date(b.at)-new Date(a.at)),[notes]);

  const filterSigs=useCallback(sigs=>{let s=[...sigs];if(activeCat)s=s.filter(x=>x.cat===activeCat);if(search){const q=search.toLowerCase();s=s.filter(x=>tx(x.title,lang).toLowerCase().includes(q)||tx(x.sum,lang).toLowerCase().includes(q))}const seen=new Set();s=s.filter(x=>{const t=tx(x.title,"en").toLowerCase().trim();if(!t||seen.has(t))return false;seen.add(t);return true});if(sortMode==="recent")return s.sort((a,b)=>new Date(b.at||0)-new Date(a.at||0));return s.sort((a,b)=>(b.imp||0)-(a.imp||0))},[activeCat,search,lang,sortMode]);
  const wlSigs=useMemo(()=>filterSigs(allSignals.filter(s=>cos.find(c=>c.id===s.cid)?.prio)),[cos,filterSigs,allSignals]);
  const allSigs=useMemo(()=>filterSigs(allSignals),[filterSigs,allSignals]);
  const digest=useMemo(()=>{const ws=allSignals.filter(s=>cos.find(c=>c.id===s.cid)?.prio);return {total:ws.length,crit:ws.filter(s=>s.imp>=80).length,comps:[...new Set(ws.map(s=>s.cid))].length}},[cos,allSignals]);
  const goTab=tb=>{setTab(tb);setSC(null);setSSh(false);setSrch("");setACat(null);setAS("");setExtRes([])};
  const fFull=()=>new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{weekday:"long",day:"numeric",month:"long"});
  const greeting=()=>{const h=new Date().getHours();return h<12?t("greeting_morning"):h<18?t("greeting_afternoon"):t("greeting_evening")};

  // ── External company search (Wikipedia) ──
  const[extRes,setExtRes]=useState([]);
  const[extLoading,setExtLoading]=useState(false);
  const extTimerRef=useState({current:null})[0];
  const searchExternal=useCallback((q)=>{
    if(extTimerRef.current)clearTimeout(extTimerRef.current);
    if(!q||q.length<3){setExtRes([]);return}
    extTimerRef.current=setTimeout(async()=>{
      setExtLoading(true);
      try{
        const r=await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=8&format=json&origin=*`);
        const d=await r.json();
        const names=d[1]||[];const descs=d[2]||[];
        const local=cos.map(c=>c.name.toLowerCase());
        const results=names.map((name,i)=>({name,desc:descs[i]||""})).filter(r=>!local.includes(r.name.toLowerCase())&&r.desc&&(r.desc.toLowerCase().includes("company")||r.desc.toLowerCase().includes("corporation")||r.desc.toLowerCase().includes("group")||r.desc.toLowerCase().includes("entreprise")||r.desc.toLowerCase().includes("bank")||r.desc.toLowerCase().includes("insur")||r.desc.toLowerCase().includes("pharma")||r.desc.toLowerCase().includes("energy")||r.desc.toLowerCase().includes("automotive")||r.desc.toLowerCase().includes("airline")||r.desc.toLowerCase().includes("telecom")||r.desc.toLowerCase().includes("manufacturer")||r.desc.toLowerCase().includes("conglomerat")||r.desc.toLowerCase().includes("multinational")||r.desc.toLowerCase().includes("plc")||r.desc.toLowerCase().includes("s.a.")||r.desc.toLowerCase().includes("ag ")||r.desc.toLowerCase().includes("ltd")||r.desc.includes("SE")));
        setExtRes(results.slice(0,5));
      }catch(e){setExtRes([])}
      setExtLoading(false);
    },500);
  },[cos]);
  const addExtCompany=(name,desc)=>{
    const id=`ext${Date.now()}`;
    const sector=desc.length>60?desc.substring(0,60)+"…":desc||"—";
    const newCo={id,name,sector,hq:"—",ticker:null,cap:"—",emp:"—",logo:name[0],risk:50,trend:"stable",prio:"watch"};
    setCos(p=>[...p,newCo]);
    saveWatchlistDB(newCo,"watch");
    setExtRes([]);setAS("");
    showT(`${name} ${t("added_wl")}`);
  };

  // ── LOGIN ──
  if(step==="login")return (
    <div className="fi" style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 28px",background:"radial-gradient(ellipse at 50% -10%,rgba(201,168,76,.07) 0%,transparent 55%),var(--bg)"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:12}}><I.radar/><span className="fd" style={{fontSize:30,fontWeight:700,color:"var(--t1)",letterSpacing:".04em"}}>SIGNALIS</span></div>
        <p className="lbl" style={{color:"var(--t4)",letterSpacing:".14em",fontSize:9}}>Financial Lines Intelligence</p>
        <div className="aline" style={{width:48,margin:"24px auto 0"}}/>
      </div>
      <div className="lang-sw" style={{width:200,marginBottom:32}}><button className={lang==="en"?"on":""} onClick={()=>setLang("en")}>English</button><button className={lang==="fr"?"on":""} onClick={()=>setLang("fr")}>Français</button></div>
      <div style={{width:"100%",maxWidth:320}}>
        <h2 className="fd" style={{fontSize:20,fontWeight:600,color:"var(--t1)",textAlign:"center",marginBottom:6}}>{t("onboarding_title")}</h2>
        <p style={{fontSize:13,color:"var(--t3)",textAlign:"center",lineHeight:1.55,marginBottom:32}}>{t("onboarding_sub")}</p>
        <div style={{marginBottom:18}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("email")}</label><input className="inp" type="email" placeholder="asprevel@gmail.com" value={loginEm} onChange={e=>{setLoginEm(e.target.value);setLoginErr(false)}} style={loginErr?{borderColor:"#EF4444"}:{}}/></div>
        <div style={{marginBottom:28}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("password")}</label><input className="inp" type="password" placeholder="••••••••" value={loginPw} onChange={e=>{setLoginPw(e.target.value);setLoginErr(false)}} onKeyDown={e=>e.key==="Enter"&&tryLogin()} style={loginErr?{borderColor:"#EF4444"}:{}}/>{loginErr&&<p style={{fontSize:12,color:"#FCA5A5",marginTop:8}}>{t("login_err")}</p>}</div>
        <button className="btn bp" style={{width:"100%",height:46}} onClick={tryLogin}><I.lock/>{t("onboarding_cta")}</button>
        <p style={{textAlign:"center",marginTop:24,fontSize:10,color:"var(--t5)"}}>© 2026 SIGNALIS — Jean-Maurice Lemoine</p>
      </div>
    </div>
  );

  // ── COMPANY SELECTION ──
  if(step==="select"){const selCount=cos.filter(c=>c.prio).length;return (
    <div className="fi" style={{minHeight:"100vh",padding:"40px 20px 100px",background:"var(--bg)"}}>
      <div style={{textAlign:"center",marginBottom:32}}><I.radar style={{margin:"0 auto 12px",display:"block",color:"var(--gold)"}}/><h2 className="fd" style={{fontSize:22,fontWeight:600,color:"var(--t1)",marginBottom:8}}>{t("select_companies")}</h2><p style={{fontSize:13,color:"var(--t3)",lineHeight:1.55}}>{t("select_companies_sub")}</p></div>
      <div className="co-grid" style={{marginBottom:24}}>{cos.map(c=>{const on=!!c.prio;return (<button key={c.id} className="card" style={{padding:"14px 18px",width:"100%",textAlign:"left",cursor:"pointer",borderColor:on?"rgba(201,168,76,.3)":"var(--b)",background:on?"var(--gbg)":"var(--bg2)"}} onClick={()=>togW(c.id,"watch")}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:22,height:22,borderRadius:6,border:`2px solid ${on?"var(--gold)":"var(--b2)"}`,background:on?"var(--gold)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{on&&<span style={{color:"var(--bg)",fontSize:14,fontWeight:700}}>✓</span>}</div><span className="mono" style={{width:28,height:28,fontSize:11}}>{c.logo}</span><div style={{flex:1,minWidth:0}}><h4 style={{fontSize:13,fontWeight:600,color:on?"var(--t1)":"var(--t2)"}}>{c.name}</h4><p style={{fontSize:11,color:"var(--t4)",marginTop:1}}>{tx(c.sector,lang)}</p></div><SR s={c.risk} sz={34} sw={2}/></div></button>)})}</div>
      <div className="tbar" style={{flexDirection:"column",gap:0,padding:"16px 20px"}}><button className="btn bp" style={{width:"100%",height:46}} onClick={()=>setStep("app")} disabled={selCount===0}>{t("continue_btn")} {selCount>0&&`(${selCount} ${t("selected")})`}</button><button className="btn" style={{width:"100%",marginTop:8,color:"var(--t4)",fontSize:12,background:"none"}} onClick={()=>setStep("app")}>{t("skip")}</button></div>
    </div>);}

  // ── SIGNAL CARD ──
  const SigCard=({s,d=0})=>{const cat=getCat(s.cat,lang);const co=cos.find(c=>c.id===s.cid)||cos.find(c=>s.company&&(c.name.toLowerCase()===s.company.toLowerCase()||s.company.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])));const imps=getImpsAll(s.id);return (
    <div className={`card fi ${d>0?`fi${Math.min(d,5)}`:""}`} style={{padding:"16px 18px",cursor:"pointer"}} onClick={()=>setSS(s)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>{cat?.icon}</span><span className="lbl" style={{color:cat?.c,fontSize:10}}>{cat?.label}</span></div><span className="badge" style={{background:sBg(s.imp),color:sT(s.imp)}}>{s.imp}</span></div>
      <h3 style={{fontSize:14,fontWeight:600,color:"var(--t1)",lineHeight:1.4,marginBottom:8}}>{tx(s.title,lang)}</h3>
      <p style={{fontSize:12,color:"var(--t3)",lineHeight:1.45,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{tx(s.sum,lang)}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:6}}>{co&&<span className="mono" style={{width:22,height:22,borderRadius:5,fontSize:10}}>{co.logo}</span>}<span style={{fontSize:11,fontWeight:500,color:"var(--gold2)"}}>{co?.name}</span><span style={{fontSize:10,color:"var(--t5)"}}>·</span><span style={{fontSize:10,color:"var(--t5)"}}>{tx(s.src,lang)}</span></div><span style={{fontSize:10,color:"var(--t5)",display:"flex",alignItems:"center",gap:4}}><I.clock/>{fD(s.at)}</span></div>
      {imps.length>0&&<div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>{imps.map((im,idx)=><span key={`${im.line}-${idx}`} style={{fontSize:10,padding:"2px 8px",borderRadius:12,background:LVL_BG[im.lvl]||"rgba(59,130,246,.1)",color:LVL_T[im.lvl]||"#93C5FD",border:`1px solid ${(LVL_C[im.lvl]||"#3B82F6")}22`}}>{lineLbl(im.line,lang)} · {im.lvl||"—"}</span>)}</div>}
    </div>)};

  // ── SIGNAL DETAIL ──
  const SigDet=({s,onClose})=>{if(!s)return null;const cat=getCat(s.cat,lang);const co=cos.find(c=>c.id===s.cid)||cos.find(c=>s.company&&(c.name.toLowerCase()===s.company.toLowerCase()||s.company.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])));const f=factLbl(s.fact,t);const imps=getImpsAll(s.id);return (
    <div className="bsbg" onClick={onClose}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingTop:8}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{cat?.icon}</span><span className="lbl" style={{color:cat?.c,fontSize:11}}>{cat?.label}</span></div><button className="bi" style={{width:32,height:32}} onClick={onClose}><I.x/></button></div>
      <h2 className="fd" style={{fontSize:20,fontWeight:600,color:"var(--t1)",lineHeight:1.35,marginBottom:14}}>{tx(s.title,lang)}</h2>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}><span className="badge" style={{background:sBg(s.imp),color:sT(s.imp)}}>{scoreLbl(s.imp,t)} · {s.imp}</span><span className="ftag" style={{background:f.bg,color:f.c}}>{f.l}</span><span style={{fontSize:11,color:"var(--t4)",display:"flex",alignItems:"center",gap:4}}><I.clock/>{fD(s.at)}</span></div>
      {co&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--bg3)",borderRadius:"var(--rs)",marginBottom:18,border:"1px solid var(--b)"}}><span className="mono" style={{width:28,height:28,fontSize:12}}>{co.logo}</span><span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{co.name}</span><span style={{fontSize:11,color:"var(--t4)",marginLeft:10}}>{tx(co.sector,lang)}</span></div>}
      <div className="dv"/>
      <div style={{marginBottom:22}}><h4 className="lbl" style={{color:"var(--t3)",marginBottom:10}}>{t("what_happened")}</h4><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.65}}>{tx(s.sum,lang)}</p></div>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:22}}><span style={{fontSize:11,color:"var(--t4)"}}>{t("source_label")}</span>{srcUrl(s.src)?<a href={srcUrl(s.src)} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"var(--gold)",fontWeight:500,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>{tx(s.src,lang)}<I.ext/></a>:<span style={{fontSize:11,color:"var(--gold)",fontWeight:500}}>{tx(s.src,lang)}</span>}</div>
      <div className="dv"/>
      <h4 className="lbl" style={{color:"var(--t3)",marginBottom:12}}>{t("lines_impacted")}</h4>
      {imps.map((im,idx)=><div key={`${im.line}-${idx}`} style={{marginBottom:idx<imps.length-1?12:22}}>
        <div style={{padding:"16px 18px",background:LVL_BG[im.lvl]||"rgba(59,130,246,.1)",borderRadius:"var(--rs)",border:`1px solid ${(LVL_C[im.lvl]||"#3B82F6")}18`,borderLeft:`3px solid ${LVL_C[im.lvl]||"#3B82F6"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h4 className="lbl" style={{color:LVL_T[im.lvl]||"#93C5FD"}}>{lineLbl(im.line,lang)}</h4><span className="badge" style={{background:`${(LVL_C[im.lvl]||"#3B82F6")}20`,color:LVL_T[im.lvl]||"#93C5FD",textTransform:"capitalize"}}>{im.lvl||"medium"}</span></div>
          <div style={{marginBottom:12}}><p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{t("why_matters")}</p><p style={{fontSize:13,color:"var(--t1)",lineHeight:1.6}}>{tx(im.why,lang)}</p></div>
          {im.angle&&<div style={{marginBottom:12}}><p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{t("discussion_angle")}</p><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.55}}>{tx(im.angle,lang)}</p></div>}
          {(im.vig||[]).length>0&&<div style={{marginBottom:(im.hyp||[]).length>0?12:0}}><p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{t("points_verify")}</p>{(im.vig||[]).map((v,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:3}}><span style={{color:LVL_T[im.lvl]||"var(--t3)",marginTop:1,flexShrink:0,fontSize:11}}>▸</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{tx(v,lang)}</span></div>)}</div>}
          {(im.hyp||[]).length>0&&<div><p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{t("hyp_check")}</p>{(im.hyp||[]).map((h,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:3}}><span className="ftag" style={{background:"rgba(139,92,246,.1)",color:"#C4B5FD",flexShrink:0,marginTop:1}}>H{i+1}</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{tx(h,lang)}</span></div>)}</div>}
        </div>
      </div>)}
      <div style={{display:"flex",gap:28,marginBottom:10}}><div><h4 className="lbl" style={{color:"var(--t4)",marginBottom:6}}>{t("importance")}</h4><SR s={s.imp||50} sz={50}/></div><div><h4 className="lbl" style={{color:"var(--t4)",marginBottom:6}}>{t("confidence")}</h4><SR s={s.conf||50} sz={50}/></div></div>
    </div></div>)};

  // ── BRIEF ──
  const BriefSheet=({cid,onClose})=>{
    const co=cos.find(c=>c.id===cid);
    const sigs=getSigs(cid)||[];
    const cn=getNotes(cid)||[];
    const lines=getLinesAll(sigs)||[];
    const allImps=[...IMPACTS,...liveImpacts];
    const sigIds=new Set(sigs.map(s=>s.id));
    const imps=allImps.filter(i=>sigIds.has(i.sid));
    const angles=imps.filter(i=>i.angle&&tx(i.angle,lang)).slice(0,4).map(i=>tx(i.angle,lang)).filter(Boolean);
    const questions=imps.flatMap(i=>(i.hyp||[])).slice(0,5).map(h=>tx(h,lang)).filter(Boolean);
    const actions=cn.filter(n=>n.tag==="action").map(n=>typeof n.text==="string"?n.text:tx(n.text,lang)).filter(Boolean);
    const brokerCtx=lang==="fr"?"INTERLOCUTEURS\nCourtier : Partager les signaux clés et discuter du positionnement du programme FL.\nRisk Manager : Valider la perception du risque et confirmer les mesures de prévention.":"KEY CONTACTS\nBroker: Share key signals and discuss FL programme positioning.\nRisk Manager: Validate risk perception and confirm prevention measures.";
    const txt=`${t("brief_title").toUpperCase()} — ${co?.name}\n${new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"long",year:"numeric"})}\n\n${t("exec_summary").toUpperCase()}\n${sigs.length} ${sigs.length>1?t("signals_lc"):t("signal")} · ${lines.length} ${t("lines_lc")} · ${scoreLbl(co?.risk,t)}\n\n${t("key_signals").toUpperCase()}\n${sigs.slice(0,5).map((s,i)=>`${i+1}. [${s.imp}] ${tx(s.title,lang)}`).join("\n")}\n\n${t("fl_implications").toUpperCase()}\n${lines.map(l=>lineLbl(l,lang)).join(", ")}\n\n${t("discussion_angles").toUpperCase()}\n${angles.map(a=>`• ${a}`).join("\n")}\n\n${brokerCtx}\n\n${t("questions_to_ask").toUpperCase()}\n${questions.map(q=>`• ${q}`).join("\n")}\n\n${t("next_steps").toUpperCase()}\n${actions.length>0?actions.map(a=>`• ${a}`).join("\n"):`• ${t("to_be_defined")}`}\n\n— SIGNALIS`;
    return (<div className="bsbg" onClick={onClose}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,paddingTop:8}}><h3 className="fd" style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("brief_title")}</h3><button className="bi" style={{width:32,height:32}} onClick={onClose}><I.x/></button></div>
      <p style={{fontSize:12,color:"var(--t4)",marginBottom:16}}>{t("brief_sub")}</p><div className="aline" style={{marginBottom:18}}/>
      {co&&<div className="cs" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:12}}><span className="mono" style={{width:36,height:36,fontSize:15}}>{co.logo}</span><div><h4 style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{co.name}</h4><p style={{fontSize:11,color:"var(--t4)",marginTop:2}}>{tx(co.sector,lang)}</p></div></div><SR s={co.risk} sz={46}/></div>}
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:8}}>{t("exec_summary")}</h4>
      <p style={{fontSize:13,color:"var(--t2)",marginBottom:20,lineHeight:1.55}}>{sigs.length} {sigs.length>1?t("signals_lc"):t("signal")} · {lines.length} {t("lines_lc")} · {scoreLbl(co?.risk,t)}</p>
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("key_signals")}</h4>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>{sigs.slice(0,5).map((s,idx)=><div key={s.id||idx} style={{display:"flex",gap:10,alignItems:"flex-start"}}><span className="badge" style={{background:sBg(s.imp||50),color:sT(s.imp||50),flexShrink:0,marginTop:2}}>{s.imp||50}</span><p style={{fontSize:13,fontWeight:500,color:"var(--t1)",lineHeight:1.4}}>{tx(s.title,lang)||s.company||"—"}</p></div>)}</div>
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("fl_implications")}</h4>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>{lines.map(l=><span key={l} className="chip on">{lineLbl(l,lang)}</span>)}</div>
      {angles.length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("discussion_angles")}</h4><div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>{angles.map((a,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"var(--gold)",marginTop:1,flexShrink:0}}>▸</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{a}</span></div>)}</div></>}
      {/* Broker / RM meeting context */}
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("interlocutors")}</h4>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <div className="cs" style={{flex:1,padding:"12px 14px"}}><p className="lbl" style={{color:"var(--t5)",fontSize:9,marginBottom:4}}>{t("broker")}</p><p style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{lang==="fr"?"Partager les signaux clés et discuter du positionnement du programme FL lors du prochain comité de renouvellement.":"Share key signals and discuss FL programme positioning at next renewal committee."}</p></div>
        <div className="cs" style={{flex:1,padding:"12px 14px"}}><p className="lbl" style={{color:"var(--t5)",fontSize:9,marginBottom:4}}>{t("risk_manager")}</p><p style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{lang==="fr"?"Valider la perception du risque et confirmer les mesures de prévention mises en place par l'entreprise.":"Validate risk perception and confirm prevention measures implemented by the company."}</p></div>
      </div>
      {questions.length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("questions_to_ask")}</h4><div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>{questions.map((q,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#A78BFA",marginTop:1,flexShrink:0}}>?</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{q}</span></div>)}</div></>}
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("next_steps")}</h4>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>{actions.length>0?actions.map((a,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#34D399",marginTop:1,flexShrink:0}}>→</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{a}</span></div>):<p style={{fontSize:12,color:"var(--t4)"}}>{t("to_be_defined")}</p>}</div>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button className="btn" style={{flex:1,height:44,background:"var(--bg3)",color:"var(--t2)",border:"1px solid var(--b)",borderRadius:"var(--rs)",fontSize:12,fontWeight:600}} onClick={()=>{navigator.clipboard?.writeText(txt);setCopied(true);showT(t("copied_clipboard"));setTimeout(()=>setCopied(false),1500)}}>{copied?<><I.check/>{t("copied")}</>:<><I.copy/>{t("copy_brief")}</>}</button>
        <button className="btn" style={{flex:1,height:44,background:"var(--bg3)",color:"var(--t2)",border:"1px solid var(--b)",borderRadius:"var(--rs)",fontSize:12,fontWeight:600}} onClick={()=>{
          const w=window.open("","_blank");if(!w)return;
          const sigHtml=sigs.slice(0,5).map(s=>`<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb"><span style="background:${sBg(s.imp||50)};color:${sT(s.imp||50)};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${s.imp||50}</span></td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px">${tx(s.title,lang)||s.company||"—"}</td></tr>`).join("");
          const lineHtml=lines.map(l=>`<span style="background:#f0f4ff;color:#1e40af;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;margin:2px">${lineLbl(l,lang)}</span>`).join(" ");
          const angleHtml=angles.length>0?angles.map(a=>`<li style="margin:4px 0;font-size:13px;color:#374151">${a}</li>`).join(""):"<li>—</li>";
          w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>SIGNALIS Brief — ${co?.name||""}</title><style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');body{font-family:'DM Sans',Arial,sans-serif;max-width:700px;margin:40px auto;padding:0 24px;color:#1f2937}h1{font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#111827;margin-bottom:4px}h2{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#b8860b;margin:24px 0 10px;font-weight:700;border-bottom:2px solid #f5e6b8;padding-bottom:4px}table{width:100%;border-collapse:collapse}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #b8860b;padding-bottom:16px;margin-bottom:24px}.logo{font-family:'Playfair Display';font-size:20px;font-weight:700;color:#b8860b}.date{font-size:12px;color:#6b7280}.company{background:#f8f9fc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:14px}.mono{width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#1e3a5f,#0f2440);color:white;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display';font-weight:700;font-size:16px}.score{width:44px;height:44px;border-radius:50%;border:3px solid ${sC(co?.risk||50)};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:${sC(co?.risk||50)}}.contacts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}.contact{background:#f8f9fc;border:1px solid #e5e7eb;border-radius:8px;padding:12px}.contact h4{font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:6px}.contact p{font-size:12px;color:#374151;line-height:1.5}@media print{body{margin:20px}@page{margin:1.5cm}}</style></head><body>
          <div class="header"><div><span class="logo">SIGNALIS</span><br><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#9ca3af">Financial Lines Intelligence</span></div><span class="date">${new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"long",year:"numeric"})}</span></div>
          <h1>${lang==="fr"?"Brief de réunion":"Meeting Brief"} — ${co?.name||""}</h1>
          <div class="company"><span class="mono">${co?.logo||"?"}</span><div><strong style="font-size:15px">${co?.name||""}</strong><br><span style="font-size:12px;color:#6b7280">${tx(co?.sector,lang)||""}</span></div><div style="margin-left:auto"><div class="score">${co?.risk||"—"}</div></div></div>
          <h2>${t("exec_summary")}</h2><p style="font-size:14px">${sigs.length} ${sigs.length>1?t("signals_lc"):t("signal")} · ${lines.length} ${t("lines_lc")} · ${scoreLbl(co?.risk||50,t)}</p>
          <h2>${t("key_signals")}</h2><table>${sigHtml}</table>
          <h2>${t("fl_implications")}</h2><div style="display:flex;flex-wrap:wrap;gap:4px">${lineHtml||"—"}</div>
          <h2>${t("discussion_angles")}</h2><ul style="padding-left:20px">${angleHtml}</ul>
          <h2>${t("interlocutors")}</h2><div class="contacts"><div class="contact"><h4>${t("broker")}</h4><p>${lang==="fr"?"Partager les signaux clés et discuter du positionnement du programme FL lors du prochain comité de renouvellement.":"Share key signals and discuss FL programme positioning at next renewal committee."}</p></div><div class="contact"><h4>${t("risk_manager")}</h4><p>${lang==="fr"?"Valider la perception du risque et confirmer les mesures de prévention mises en place par l'entreprise.":"Validate risk perception and confirm prevention measures implemented by the company."}</p></div></div>
          <h2>${t("next_steps")}</h2><p style="font-size:13px;color:#6b7280">${actions.length>0?actions.join(" · "):t("to_be_defined")}</p>
          <div style="margin-top:40px;padding-top:16px;border-top:2px solid #f5e6b8;display:flex;justify-content:space-between;align-items:center"><span style="font-size:10px;color:#9ca3af">© SIGNALIS — Jean-Maurice Lemoine</span><span style="font-size:10px;color:#9ca3af">${new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB")}</span></div>
          </body></html>`);
          w.document.close();setTimeout(()=>w.print(),500);
        }}><I.download/>{t("export_pdf")}</button>
        <button className="btn bp" style={{flex:1,height:44,fontSize:12}} onClick={()=>{
          const shareData={title:`SIGNALIS — ${co?.name||""}`,text:txt};
          if(navigator.share){navigator.share(shareData).catch(()=>{})}
          else{const mailto=`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(txt)}`;window.open(mailto)}
        }}><I.share/>{t("share_brief")}</button>
      </div>
    </div></div>)};

  // ── COMPANY PAGE ──
  const CompPage=({cid})=>{const co=cos.find(c=>c.id===cid);const sigs=getSigs(cid);const cn=getNotes(cid);const lines=getLinesAll(sigs);if(!co)return null;return (
    <div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><button className="btn bg" style={{gap:4}} onClick={()=>setSC(null)}><I.chL/>{t("back")}</button><div style={{display:"flex",gap:8}}><button className="bi" style={{width:34,height:34}} onClick={()=>togW(co.id)}>{co.prio?<I.star style={{color:"var(--gold)"}}/>:<I.starO/>}</button><button className="btn bp" style={{padding:"6px 14px",fontSize:12}} onClick={()=>{setBC(co.id);setSB(true);setCopied(false)}}><I.brief style={{width:14,height:14}}/>{t("generate_brief")}</button></div></div></div>
      <div style={{padding:"24px 20px"}}>
        <p className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{t("company_overview")}</p>
        <div className="fi" style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}><span className="mono" style={{width:44,height:44,fontSize:18}}>{co.logo}</span><div><h1 className="fd" style={{fontSize:24,fontWeight:700,color:"var(--t1)",lineHeight:1.2}}>{co.name}</h1><p style={{fontSize:13,color:"var(--t4)",marginTop:3}}>{tx(co.sector,lang)}</p></div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[{l:t("headquarters"),v:co.hq},{l:t("market_cap"),v:co.cap},{l:t("employees"),v:co.emp}].map(x=><div key={x.l} className="cs" style={{padding:"10px 12px"}}><p className="lbl" style={{color:"var(--t5)",fontSize:9,marginBottom:4}}>{x.l}</p><p style={{fontSize:12,color:"var(--t2)",fontWeight:500}}>{x.v||"—"}</p></div>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12,padding:"12px 16px",background:"var(--bg3)",borderRadius:"var(--rs)",border:"1px solid var(--b)"}}><SR s={co.risk} sz={42}/><div><p className="lbl" style={{color:"var(--t4)",fontSize:9}}>{t("risk_score")}</p><p style={{fontSize:13,fontWeight:600,color:sC(co.risk)}}>{scoreLbl(co.risk,t)} · {tI(co.trend)} {co.trend}</p></div></div>
          {riskHistory[co.id]&&riskHistory[co.id].length>=2?<div style={{marginTop:12,padding:"14px 16px",background:"var(--bg3)",borderRadius:"var(--rs)",border:"1px solid var(--b)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><p className="lbl" style={{color:"var(--t4)",fontSize:9}}>{t("risk_history")}</p><span style={{fontSize:9,color:"var(--t5)"}}>{t("last_30_days")}</span></div><RiskChart data={riskHistory[co.id]}/></div>:riskHistory[co.id]&&riskHistory[co.id].length===1?<p style={{fontSize:11,color:"var(--t5)",marginTop:8,fontStyle:"italic"}}>{t("risk_no_history")}</p>:null}
        </div>
        <div className="dv"/><h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("latest_signals")}</h3>
        <div className="sig-grid" style={{marginBottom:28}}>{sigs.map((s,i)=><SigCard key={s.id} s={s} d={i+1}/>)}{sigs.length===0&&<p style={{fontSize:13,color:"var(--t4)"}}>{t("no_signals_yet")}</p>}</div>
        <div className="dv"/><h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("fl_relevance")}</h3>
        {lines.length>0?<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:28}}>{lines.map(l=><span key={l} className="chip on">{lineLbl(l,lang)}</span>)}</div>:<p style={{fontSize:12,color:"var(--t4)",marginBottom:28}}>{t("no_line_data")}</p>}
        <div className="dv"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 className="lbl" style={{color:"var(--gold)"}}>{t("notes_title")}</h3><div style={{display:"flex",gap:6}}><button className="bi" style={{width:30,height:30,background:"rgba(239,68,68,.1)",borderColor:"rgba(239,68,68,.2)",color:"#FCA5A5"}} onClick={()=>{setRecCid(co.id);setShowRec(true);setTranscript("")}}><I.mic/></button><button className="bi" style={{width:30,height:30}} onClick={()=>{setNC(co.id);setSNN(true)}}><I.plus/></button></div></div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{cn.map(n=>{const cfg=NOTE_C[n.tag]||NOTE_C.observation;return (<div key={n.id} className="card" style={{padding:"14px 16px",position:"relative"}}><button style={{position:"absolute",top:6,right:6,width:20,height:20,borderRadius:5,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={()=>deleteN(n.id)}><I.x style={{width:10,height:10,color:"#F87171"}}/></button><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingRight:24}}><span className="ftag" style={{background:cfg.bg,color:cfg.c}}>{noteTagLbl(n.tag,t)}</span><span style={{fontSize:10,color:"var(--t5)"}}>{fD(n.at)}</span></div><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.55}}>{tx(n.text,lang)}</p></div>)})}{cn.length===0&&<p style={{fontSize:12,color:"var(--t4)"}}>{t("no_notes_sub")}</p>}</div>
      </div>
    </div>)};

  // ── PAGES ──
  const render=()=>{
    if(selComp)return <CompPage cid={selComp}/>;
    if(tab==="dashboard")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><I.radar/><span className="fd" style={{fontSize:18,fontWeight:700,color:"var(--t1)"}}>{t("dashboard_title")}</span>{autoRefresh&&<div className="pd" style={{marginLeft:4}}/>}</div><div style={{display:"flex",gap:8}}><button className="bi" style={{width:34,height:34}} onClick={()=>{setSSh(!showSearch);if(showSearch)setSrch("")}}>{showSearch?<I.x/>:<I.search/>}</button><button className="bi" style={{width:34,height:34}} onClick={()=>refreshSignals()} disabled={refreshing}><I.refresh style={{animation:refreshing?"spin 1s linear infinite":"none"}}/></button><button className="bi" style={{width:34,height:34,position:"relative"}} onClick={()=>{setNewCount(0);try{navigator.clearAppBadge&&navigator.clearAppBadge()}catch(e){}}}><I.bell/>{newCount>0&&<div style={{position:"absolute",top:3,right:3,minWidth:16,height:16,borderRadius:8,background:"#EF4444",border:"2px solid var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:700,color:"white"}}>{newCount>9?"9+":newCount}</span></div>}</button></div></div>{showSearch&&<input className="inp" style={{marginTop:12}} placeholder={t("search_placeholder")} value={search} onChange={e=>setSrch(e.target.value)} autoFocus/>}{lastRefresh&&<p style={{fontSize:10,color:"var(--t5)",marginTop:8,textAlign:"right"}}>{lang==="fr"?"Dernière mise à jour :":"Last update:"} {new Date(lastRefresh).toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</p>}</div>
      <div style={{padding:"18px 20px"}}><p className="fd" style={{fontSize:16,fontWeight:500,color:"var(--t1)",marginBottom:4}}>{greeting()}</p><p style={{fontSize:12,color:"var(--t4)",marginBottom:16}}>{t("dashboard_sub")}</p>
        <div className="card-el fi" style={{padding:"16px 18px",marginBottom:22,borderLeft:"3px solid var(--gold)",cursor:"pointer"}} onClick={()=>setSD(true)}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><p className="lbl" style={{color:"var(--gold)"}}>{t("daily_digest")} — {fFull()}</p>{autoRefresh&&<div className="pd"/>}</div>{liveSigs.length>0?<p style={{fontSize:14,color:"var(--t2)",lineHeight:1.45}}><strong style={{color:"var(--t1)"}}>{liveSigs.length}</strong> {t("signal_count")} · <strong style={{color:"var(--t1)"}}>{watched.length}</strong> {t("companies_monitored")}{digest.crit>0&&<> · <span style={{color:"#FCA5A5"}}>{digest.crit} {digest.crit>1?t("critical_signals"):t("critical_signal")}</span></>}</p>:<p style={{fontSize:13,color:"var(--t4)",lineHeight:1.45}}>{t("no_data_refresh")}</p>}{lastRefresh&&<p style={{fontSize:10,color:"var(--t5)",marginTop:6}}>{lang==="fr"?"Dernière mise à jour":"Last update"}: {new Date(lastRefresh).toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</p>}</div><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>{autoRefresh&&<span style={{fontSize:9,color:"var(--gold)",fontWeight:600}}>LIVE</span>}<I.chR style={{color:"var(--t5)"}}/></div></div></div>
        <div className="fi fi1" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>{[{l:t("watchlist_label"),v:watched.length,c:"var(--gold)"},{l:t("active"),v:digest.total,c:"#60A5FA"},{l:t("critical_lbl"),v:digest.crit,c:"#F87171"}].map(x=>(<div key={x.l} className="card" style={{padding:"14px 12px",textAlign:"center"}}><p style={{fontSize:22,fontWeight:700,color:x.c,lineHeight:1}}>{x.v}</p><p className="lbl" style={{color:"var(--t4)",marginTop:5,fontSize:9}}>{x.l}</p></div>))}</div>
        <div className="fi fi2 hsb" style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:22}}><button className={`chip ${!activeCat?"on":""}`} onClick={()=>setACat(null)}>{t("all")}</button>{CATS.map(c=>{const cc=getCat(c.id,lang);return <button key={c.id} className={`chip ${activeCat===c.id?"on":""}`} onClick={()=>setACat(activeCat===c.id?null:c.id)}>{cc?.icon} {cc?.s}</button>})}</div>

        {/* Portfolio overview */}
        {watched.length>0&&<div className="fi fi2" style={{marginBottom:22}}>
          <h3 className="lbl" style={{color:"var(--gold)",marginBottom:12}}>{t("portfolio")}</h3>
          {/* Risk distribution bar */}
          {(()=>{const buckets=[{l:lang==="fr"?"Critique":"Critical",c:"#EF4444",min:75,max:100},{l:lang==="fr"?"Élevé":"High",c:"#F59E0B",min:50,max:74},{l:lang==="fr"?"Moyen":"Medium",c:"#3B82F6",min:25,max:49},{l:lang==="fr"?"Faible":"Low",c:"#10B981",min:0,max:24}];const counts=buckets.map(b=>({...b,n:watched.filter(c=>(c.risk||50)>=b.min&&(c.risk||50)<=b.max).length}));const total=watched.length||1;return (
          <div className="cs" style={{padding:"14px 16px",marginBottom:12}}>
            <p className="lbl" style={{color:"var(--t4)",marginBottom:10,fontSize:9}}>{t("portfolio_risk")}</p>
            <div style={{display:"flex",borderRadius:6,overflow:"hidden",height:10,marginBottom:10}}>{counts.filter(b=>b.n>0).map(b=><div key={b.l} style={{width:`${(b.n/total)*100}%`,background:b.c,transition:"width .4s"}}/>)}</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>{counts.map(b=><div key={b.l} style={{textAlign:"center"}}><div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}><div style={{width:6,height:6,borderRadius:3,background:b.c}}/><span style={{fontSize:16,fontWeight:700,color:b.c}}>{b.n}</span></div><p style={{fontSize:8,color:"var(--t5)",marginTop:2}}>{b.l}</p></div>)}</div>
          </div>)})()}
          {/* Top exposed + Lines coverage side by side */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {/* Most exposed */}
            <div className="cs" style={{padding:"12px 14px"}}>
              <p className="lbl" style={{color:"var(--t4)",marginBottom:8,fontSize:9}}>{t("portfolio_top")}</p>
              {[...watched].sort((a,b)=>(b.risk||0)-(a.risk||0)).slice(0,5).map((c,i)=><div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:i<4?6:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:1}}><span style={{fontSize:10,color:"var(--t5)",width:12}}>{i+1}.</span><span style={{fontSize:11,fontWeight:500,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span></div>
                <span style={{fontSize:11,fontWeight:700,color:sC(c.risk||50),flexShrink:0}}>{c.risk||50}</span>
              </div>)}
            </div>
            {/* Lines coverage */}
            <div className="cs" style={{padding:"12px 14px"}}>
              <p className="lbl" style={{color:"var(--t4)",marginBottom:8,fontSize:9}}>{t("portfolio_lines")}</p>
              {(()=>{const allLines=wlSigs.flatMap(s=>getImpsAll(s.id).map(i=>i.line));const lineCounts={};allLines.forEach(l=>{lineCounts[l]=(lineCounts[l]||0)+1});const sorted=Object.entries(lineCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);return sorted.length>0?sorted.map(([l,n])=><div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:"var(--t2)"}}>{lineLbl(l,lang)}</span>
                <span style={{fontSize:10,fontWeight:600,color:"var(--gold)"}}>{n}</span>
              </div>):<p style={{fontSize:10,color:"var(--t5)",fontStyle:"italic"}}>{lang==="fr"?"Aucun signal":"No signals"}</p>})()}
            </div>
          </div>
        </div>}

        <div className="fi fi3" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 className="lbl" style={{color:"var(--t4)"}}>{t("priority_feed")}</h3>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}><button className="btn" style={{padding:"4px 10px",fontSize:10,background:sortMode==="recent"?"var(--gbg)":"var(--bg3)",color:sortMode==="recent"?"var(--gold)":"var(--t5)"}} onClick={()=>{setSortMode("recent");lsSet("sortMode","recent")}}>{t("sort_recent")}</button><button className="btn" style={{padding:"4px 10px",fontSize:10,background:sortMode==="important"?"var(--gbg)":"var(--bg3)",color:sortMode==="important"?"var(--gold)":"var(--t5)",borderLeft:"1px solid var(--b)"}} onClick={()=>{setSortMode("important");lsSet("sortMode","important")}}>{t("sort_important")}</button></div>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}><button className="btn" style={{padding:"4px 8px",background:viewMode==="grid"?"var(--gbg)":"var(--bg3)",color:viewMode==="grid"?"var(--gold)":"var(--t5)"}} onClick={()=>{setViewMode("grid");lsSet("viewMode","grid")}}>▦</button><button className="btn" style={{padding:"4px 8px",background:viewMode==="list"?"var(--gbg)":"var(--bg3)",color:viewMode==="list"?"var(--gold)":"var(--t5)",borderLeft:"1px solid var(--b)"}} onClick={()=>{setViewMode("list");lsSet("viewMode","list")}}>☰</button></div>
          </div>
        </div>
        {viewMode==="grid"?<div className="sig-grid">{wlSigs.map((s,i)=> <SigCard key={s.id||i} s={s} d={Math.min(i+1,5)}/>)}{wlSigs.length===0&&<div style={{textAlign:"center",padding:"56px 20px",gridColumn:"1/-1"}}><I.radar style={{width:40,height:40,color:"var(--b2)",margin:"0 auto 16px",display:"block"}}/><p style={{fontSize:15,color:"var(--t3)",marginBottom:4,fontWeight:500}}>{search||activeCat?t("no_signals_match"):t("no_signals_yet")}</p><p style={{fontSize:13,color:"var(--t5)"}}>{search||activeCat?t("adjust_filters"):t("radar_will_update")}</p></div>}</div>
        :<div style={{display:"flex",flexDirection:"column",gap:2}}>{wlSigs.map((s,i)=>{const cat=getCat(s.cat,lang);const co=cos.find(c=>c.id===s.cid)||cos.find(c=>s.company&&(c.name.toLowerCase()===s.company.toLowerCase()||s.company.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])));const imps=getImpsAll(s.id);return (
          <div key={s.id||i} className={`fi fi${Math.min(i+1,5)}`} style={{padding:"12px 16px",borderBottom:"1px solid var(--b)",cursor:"pointer",background:i%2===0?"transparent":"rgba(13,20,36,.4)"}} onClick={()=>setSS(s)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                <span className="badge" style={{background:sBg(s.imp||50),color:sT(s.imp||50),flexShrink:0}}>{s.imp||50}</span>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12,fontWeight:600,color:"var(--t1)",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx(s.title,lang)||s.company||"—"}</p>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                    <span style={{fontSize:10,color:"var(--gold2)",fontWeight:500}}>{co?.name||s.company||"—"}</span>
                    <span style={{fontSize:9,color:"var(--t5)"}}>·</span>
                    <span style={{fontSize:10,color:cat?.c||"var(--t4)"}}>{cat?.icon} {cat?.s||""}</span>
                    {imps.length>0&&<>{imps.slice(0,2).map((im,idx)=><span key={idx} style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:LVL_BG[im.lvl]||"rgba(59,130,246,.1)",color:LVL_T[im.lvl]||"#93C5FD"}}>{lineLbl(im.line,lang)}</span>)}</>}
                  </div>
                </div>
              </div>
              <span style={{fontSize:10,color:"var(--t5)",flexShrink:0,marginLeft:8}}>{s.at?fD(s.at):"—"}</span>
            </div>
          </div>)})}
          {wlSigs.length===0&&<div style={{textAlign:"center",padding:"56px 20px"}}><p style={{fontSize:15,color:"var(--t3)",marginBottom:4,fontWeight:500}}>{search||activeCat?t("no_signals_match"):t("no_signals_yet")}</p></div>}
        </div>}
      </div>
    </div>);

    if(tab==="watchlist")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><h2 className="fd" style={{fontSize:18,fontWeight:700,color:"var(--t1)"}}>{t("watchlist_title")}</h2><p style={{fontSize:12,color:"var(--t4)",marginTop:4}}>{t("watchlist_sub")}</p></div>
      <div style={{padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 className="lbl" style={{color:"var(--gold)"}}>{t("tracked")} ({watched.length})</h3>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}>{[{k:"risk",l:t("sort_risk")},{k:"alpha",l:t("sort_alpha")},{k:"signals",l:t("sort_signals")}].map(s=><button key={s.k} className="btn" style={{padding:"4px 10px",fontSize:10,background:wlSort===s.k?"var(--gbg)":"var(--bg3)",color:wlSort===s.k?"var(--gold)":"var(--t5)",borderRight:"1px solid var(--b)"}} onClick={()=>{setWlSort(s.k);lsSet("wlSort",s.k)}}>{s.l}</button>)}</div>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}><button className="btn" style={{padding:"4px 8px",background:wlView==="grid"?"var(--gbg)":"var(--bg3)",color:wlView==="grid"?"var(--gold)":"var(--t5)"}} onClick={()=>{setWlView("grid");lsSet("wlView","grid")}}>▦</button><button className="btn" style={{padding:"4px 8px",background:wlView==="list"?"var(--gbg)":"var(--bg3)",color:wlView==="list"?"var(--gold)":"var(--t5)",borderLeft:"1px solid var(--b)"}} onClick={()=>{setWlView("list");lsSet("wlView","list")}}>☰</button></div>
          </div>
        </div>
        {(()=>{const sorted=[...watched].sort((a,b)=>{if(wlSort==="alpha")return a.name.localeCompare(b.name);if(wlSort==="signals")return getSigs(b.id).length-getSigs(a.id).length;return(b.risk||0)-(a.risk||0)});
        return wlView==="grid"?
        <div className="co-grid" style={{marginBottom:28}}>{sorted.map((c,i)=>{const sc=getSigs(c.id).length;return (
          <div key={c.id} className={`card fi fi${Math.min(i+1,5)} prio-${c.prio}`} style={{padding:"16px 18px",position:"relative"}}>
            <button style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:6,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={(e)=>{e.stopPropagation();togW(c.id)}}><I.x style={{width:12,height:12,color:"#F87171"}}/></button>
            <button style={{width:"100%",textAlign:"left",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",color:"inherit",padding:0}} onClick={()=>setSC(c.id)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}><span className="mono">{c.logo}</span><div style={{minWidth:0}}><h4 style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{c.name}</h4><p style={{fontSize:12,color:"var(--t4)",marginTop:2}}>{tx(c.sector,lang)}</p><div style={{display:"flex",gap:8,marginTop:6}}><span style={{fontSize:10,color:"var(--t5)"}}>{sc} {sc>1?t("signals_lc"):t("signal")}</span><span className="lbl" style={{fontSize:8,color:c.prio==="primary"?"var(--gold)":c.prio==="secondary"?"#60A5FA":"var(--t5)"}}>{t(c.prio)}</span></div></div></div><SR s={c.risk} sz={40} sw={2.5}/></div>
            </button>
          </div>)})}
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:28}}>{sorted.map((c,i)=>{const sc=getSigs(c.id).length;const nc=getNotes(c.id).length;const lines=getLinesAll(getSigs(c.id));return (
          <div key={c.id} className={`fi fi${Math.min(i+1,5)}`} style={{padding:"10px 16px",borderBottom:"1px solid var(--b)",background:i%2===0?"transparent":"rgba(13,20,36,.4)",display:"flex",alignItems:"center",gap:10}}>
            <button style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",color:"inherit",padding:0,textAlign:"left"}} onClick={()=>setSC(c.id)}>
              <span className="mono" style={{width:28,height:28,fontSize:11,flexShrink:0}}>{c.logo}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><h4 style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{c.name}</h4>{c.ticker&&<span style={{fontSize:9,color:"var(--t5)"}}>{c.ticker}</span>}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:"var(--t4)"}}>{tx(c.sector,lang)}</span>
                  <span style={{fontSize:9,color:"var(--t5)"}}>·</span>
                  <span style={{fontSize:10,color:"var(--t5)"}}>{c.hq}</span>
                  {sc>0&&<><span style={{fontSize:9,color:"var(--t5)"}}>·</span><span style={{fontSize:10,color:"#60A5FA",fontWeight:500}}>{sc} {t("signals_lc")}</span></>}
                  {nc>0&&<><span style={{fontSize:9,color:"var(--t5)"}}>·</span><span style={{fontSize:10,color:"var(--gold2)"}}>{nc} {t("notes_lc")}</span></>}
                </div>
                {lines.length>0&&<div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{lines.slice(0,4).map(l=><span key={l} style={{fontSize:8,padding:"1px 6px",borderRadius:6,background:"rgba(96,165,250,.1)",color:"#93C5FD"}}>{lineLbl(l,lang)}</span>)}</div>}
              </div>
              <SR s={c.risk} sz={34} sw={2}/>
            </button>
            <button style={{width:20,height:20,borderRadius:5,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0,flexShrink:0}} onClick={()=>togW(c.id)}><I.x style={{width:10,height:10,color:"#F87171"}}/></button>
          </div>)})}
        </div>;})()}{watched.length===0&&<div style={{textAlign:"center",padding:"48px 20px"}}><p style={{fontSize:14,color:"var(--t3)",fontWeight:500,marginBottom:4}}>{t("no_companies_yet")}</p><p style={{fontSize:13,color:"var(--t5)"}}>{t("no_companies_sub")}</p></div>}
        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:10}}>{t("add_company")}</h3><input className="inp" style={{marginBottom:14}} placeholder={t("search_company")} value={addSrch} onChange={e=>{setAS(e.target.value);searchExternal(e.target.value)}}/>{(()=>{const localFiltered=cos.filter(c=>!c.prio).filter(c=>!addSrch||c.name.toLowerCase().includes(addSrch.toLowerCase())||(c.ticker||"").toLowerCase().includes(addSrch.toLowerCase())||tx(c.sector,lang).toLowerCase().includes(addSrch.toLowerCase()));return (<><div style={{display:"flex",flexDirection:"column",gap:10}}>{localFiltered.slice(0,10).map(c=>(<div key={c.id} className="card" style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><button style={{flex:1,textAlign:"left",background:"none",border:"none",cursor:"pointer",minWidth:0,fontFamily:"inherit",color:"inherit"}} onClick={()=>setSC(c.id)}><h4 style={{fontSize:13,fontWeight:500,color:"var(--t2)"}}>{c.name}</h4><p style={{fontSize:11,color:"var(--t4)"}}>{tx(c.sector,lang)}</p></button><button className="btn bp" style={{padding:"6px 14px",fontSize:12}} onClick={()=>togW(c.id)}><I.plus/>{t("add_to_watchlist")}</button></div>))}</div>{addSrch.length>=3&&<>{extLoading&&<p style={{fontSize:12,color:"var(--t4)",marginTop:14,textAlign:"center"}}>{t("searching")}</p>}{!extLoading&&extRes.length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginTop:18,marginBottom:10}}>{t("ext_results")}</h4><div style={{display:"flex",flexDirection:"column",gap:10}}>{extRes.map((r,i)=>(<div key={i} className="card" style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:"rgba(201,168,76,.15)"}}><div style={{flex:1,minWidth:0}}><h4 style={{fontSize:13,fontWeight:500,color:"var(--t1)"}}>{r.name}</h4><p style={{fontSize:11,color:"var(--t4)",marginTop:2,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.desc}</p></div><button className="btn bp" style={{padding:"6px 14px",fontSize:12,flexShrink:0,marginLeft:10}} onClick={()=>addExtCompany(r.name,r.desc)}><I.plus/>{lang==="fr"?"Ajouter":"Add"}</button></div>))}</div></>}{!extLoading&&extRes.length===0&&localFiltered.length===0&&addSrch.length>=3&&<p style={{fontSize:12,color:"var(--t4)",marginTop:14,textAlign:"center"}}>{t("no_ext_results")}</p>}</>}</>)})()}
      </div>
    </div>);

    if(tab==="signals")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h2 className="fd" style={{fontSize:18,fontWeight:700,color:"var(--t1)"}}>{t("all_signals")}</h2><button className="bi" style={{width:34,height:34}} onClick={()=>{setSSh(!showSearch);if(showSearch)setSrch("")}}>{showSearch?<I.x/>:<I.filter/>}</button></div>{showSearch&&<input className="inp" style={{marginBottom:12}} placeholder={t("filter_signals")} value={search} onChange={e=>setSrch(e.target.value)} autoFocus/>}<div className="hsb" style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}><button className={`chip ${!activeCat?"on":""}`} onClick={()=>setACat(null)}>{t("all")}</button>{CATS.map(c=>{const cc=getCat(c.id,lang);return <button key={c.id} className={`chip ${activeCat===c.id?"on":""}`} onClick={()=>setACat(activeCat===c.id?null:c.id)}>{cc?.icon} {cc?.s}</button>})}</div></div>
      <div style={{padding:"18px 20px"}}><div className="sig-grid">{allSigs.map((s,i)=><SigCard key={s.id} s={s} d={Math.min(i+1,5)}/>)}</div></div>
    </div>);

    if(tab==="notes")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 className="fd" style={{fontSize:18,fontWeight:700,color:"var(--t1)"}}>{t("notes_title")}</h2><button className="btn bp" style={{padding:"6px 14px",fontSize:12}} onClick={()=>setSNN(true)}><I.plus/>{t("new_note")}</button></div></div>
      <div style={{padding:"18px 20px"}}><div className="hsb" style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto"}}>{[null,"observation","hypothesis","action","question","decision"].map(tg=><button key={tg??"all"} className={`chip ${noteFilter===tg?"on":""}`} onClick={()=>setNF(tg)}>{tg?noteTagLbl(tg,t):t("all")}</button>)}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{(noteFilter?notes.filter(n=>n.tag===noteFilter):notes).map((n,i)=>{const cfg=NOTE_C[n.tag]||NOTE_C.observation;const co=n.cid?cos.find(c=>c.id===n.cid):null;return (<div key={n.id} className={`card fi fi${Math.min(i+1,5)}`} style={{padding:"16px 18px",position:"relative"}}><button style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:6,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={()=>deleteN(n.id)}><I.x style={{width:12,height:12,color:"#F87171"}}/></button><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingRight:28}}><div style={{display:"flex",alignItems:"center",gap:8}}><span className="ftag" style={{background:cfg.bg,color:cfg.c}}>{noteTagLbl(n.tag,t)}</span>{co&&<span style={{fontSize:11,fontWeight:500,color:"var(--gold2)"}}>{co.name}</span>}</div><span style={{fontSize:10,color:"var(--t5)"}}>{fD(n.at)}</span></div><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.6}}>{typeof n.text==="object"?tx(n.text,lang):n.text}</p></div>)})}{notes.length===0&&<div style={{textAlign:"center",padding:"60px 20px"}}><p style={{fontSize:15,color:"var(--t3)",fontWeight:500,marginBottom:4}}>{t("no_notes_yet")}</p><p style={{fontSize:13,color:"var(--t5)",marginBottom:20}}>{t("no_notes_sub")}</p><button className="btn bp" onClick={()=>setSNN(true)}><I.plus/>{t("add_first_note")}</button></div>}</div>
      </div>
    </div>);

    if(tab==="brief")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h2 className="fd" style={{fontSize:18,fontWeight:700,color:"var(--t1)"}}>{t("brief_title")}</h2><p style={{fontSize:12,color:"var(--t4)",marginTop:4}}>{t("brief_sub")}</p></div><button className="btn bp" style={{padding:"7px 14px",fontSize:12}} onClick={()=>setSNM(true)}><I.calendar/>{t("add_meeting")}</button></div></div>
      <div style={{padding:"18px 20px"}}>
        {/* Upcoming meetings */}
        {upcomingMtgs.length>0&&<><h3 className="lbl" style={{color:"var(--gold)",marginBottom:12}}><I.calendar style={{width:14,height:14,display:"inline",marginRight:6}}/>{t("upcoming")} ({upcomingMtgs.length})</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>{upcomingMtgs.map((mtg,i)=>{const co=cos.find(c=>c.id===mtg.cid);const ml=mtgLabel(mtg);const d=new Date(mtg.date);return (
          <div key={mtg.id} className={`card fi fi${Math.min(i+1,5)}`} style={{padding:"16px 18px",borderLeft:`3px solid ${ml.c}`,position:"relative"}}>
            <button style={{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:5,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={()=>deleteMeeting(mtg.id)}><I.x style={{width:10,height:10,color:"#F87171"}}/></button>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingRight:24}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:700,color:ml.c,textTransform:"uppercase"}}>{ml.l}</span>
                  <span className="ftag" style={{background:mtg.type==="broker"?"rgba(201,168,76,.15)":"rgba(96,165,250,.15)",color:mtg.type==="broker"?"var(--gold)":"#93C5FD"}}>{mtg.type==="broker"?t("meeting_broker"):mtg.type==="rm"?t("meeting_rm"):t("meeting_internal")}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  {co&&<><span className="mono" style={{width:24,height:24,fontSize:10}}>{co.logo}</span><span style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{co.name}</span></>}
                </div>
                <p style={{fontSize:11,color:"var(--t4)"}}>{d.toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{weekday:"long",day:"numeric",month:"long"})} · {d.toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</p>
                {mtg.notes&&<p style={{fontSize:11,color:"var(--t5)",marginTop:4,fontStyle:"italic"}}>{mtg.notes}</p>}
              </div>
            </div>
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <button className="btn" style={{flex:1,padding:"6px",fontSize:11,background:"var(--bg3)",color:"var(--t3)",border:"1px solid var(--b)",borderRadius:"var(--rs)"}} onClick={()=>{setBC(mtg.cid);setSB(true);setCopied(false)}}><I.brief style={{width:12,height:12}}/>{t("generate")}</button>
              <button className="btn" style={{flex:1,padding:"6px",fontSize:11,background:"var(--bg3)",color:"var(--t3)",border:"1px solid var(--b)",borderRadius:"var(--rs)"}} onClick={()=>exportICS(mtg)}><I.download style={{width:12,height:12}}/>{t("export_cal")}</button>
            </div>
          </div>)})}</div></>}

        {/* Past meetings */}
        {pastMtgs.length>0&&<><h3 className="lbl" style={{color:"var(--t5)",marginBottom:10}}>{t("past_meetings")} ({pastMtgs.length})</h3>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:24}}>{pastMtgs.slice(0,5).map(mtg=>{const co=cos.find(c=>c.id===mtg.cid);return (
          <div key={mtg.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",borderBottom:"1px solid var(--b)",opacity:.6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>{co&&<span className="mono" style={{width:22,height:22,fontSize:9}}>{co.logo}</span>}<span style={{fontSize:12,color:"var(--t3)"}}>{co?.name||"—"}</span><span style={{fontSize:10,color:"var(--t5)"}}>{fD(mtg.date)}</span></div>
            <button style={{width:18,height:18,borderRadius:4,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.1)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={()=>deleteMeeting(mtg.id)}><I.x style={{width:9,height:9,color:"#F87171"}}/></button>
          </div>)})}</div></>}

        {meetings.length===0&&<div style={{textAlign:"center",padding:"32px 20px",marginBottom:24}}><I.calendar style={{width:32,height:32,color:"var(--b2)",margin:"0 auto 12px",display:"block"}}/><p style={{fontSize:13,color:"var(--t4)",marginBottom:12}}>{t("no_meetings")}</p><button className="btn bp" style={{padding:"8px 18px",fontSize:12}} onClick={()=>setSNM(true)}><I.plus/>{t("add_meeting")}</button></div>}

        {/* Company list for quick brief */}
        <div className="dv" style={{marginBottom:18}}/>
        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{t("brief_title")} — {t("generate")}</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{[...watched].sort((a,b)=>a.name.localeCompare(b.name)).map((c,i)=>{const sc=getSigs(c.id).length;const nc=getNotes(c.id).length;return (<div key={c.id} className={`card fi fi${Math.min(i+1,5)}`} style={{padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12,flex:1,cursor:"pointer"}} onClick={()=>setSC(c.id)}><span className="mono">{c.logo}</span><div><h4 style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{c.name}</h4><p style={{fontSize:11,color:"var(--t4)",marginTop:2}}>{sc} {sc>1?t("signals_lc"):t("signal")} · {nc} {nc>1?t("notes_lc"):t("note_lc")}</p></div></div><button className="btn bp" style={{padding:"7px 16px",fontSize:12}} onClick={()=>{setBC(c.id);setSB(true);setCopied(false)}}>{t("generate")}</button></div>)})}</div>
      </div>
    </div>);

    if(tab==="settings")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><h2 className="fd" style={{fontSize:18,fontWeight:700,color:"var(--t1)"}}>{t("settings_title")}</h2></div>
      <div style={{padding:"24px 20px"}}>
        <h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("profile")}</h3>
        <div className="card" style={{padding:"18px",marginBottom:28}}><div style={{display:"flex",alignItems:"center",gap:14}}><div className="mono" style={{width:44,height:44,fontSize:16,background:"linear-gradient(135deg,var(--gold),rgba(201,168,76,.6))",color:"var(--bg)"}}>AS</div><div><p style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>Anne-Sophie</p><p style={{fontSize:12,color:"var(--t4)",marginTop:2}}>Senior Account Manager — Financial Lines France</p></div></div></div>
        <h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("language")}</h3>
        <div className="lang-sw" style={{marginBottom:28}}><button className={lang==="en"?"on":""} onClick={()=>{setLang("en");savePrefsDB({lang:"en"})}}>English</button><button className={lang==="fr"?"on":""} onClick={()=>{setLang("fr");savePrefsDB({lang:"fr"})}}>Français</button></div>
        <h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("preferred_lines")}</h3>
        <div className="card" style={{padding:"16px 18px",marginBottom:28}}><p style={{fontSize:12,color:"var(--t4)",marginBottom:12}}>{t("preferred_lines_sub")}</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{Object.entries(LINES).map(([k])=>{const checked=selLines.includes(k);return (<label key={k} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}} onClick={()=>togLine(k)}><div style={{width:16,height:16,borderRadius:4,border:`2px solid ${checked?"var(--gold)":"var(--b2)"}`,background:checked?"var(--gbg)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>{checked&&<span style={{color:"var(--gold)",fontSize:10,fontWeight:700}}>✓</span>}</div><span style={{fontSize:12,color:checked?"var(--t1)":"var(--t3)",transition:"color .2s"}}>{lineLbl(k,lang)}</span></label>)})}</div></div>
        <h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("notifications")}</h3>
        <div className="card" style={{padding:"16px 18px",marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}} onClick={()=>{setAutoRefresh(!autoRefresh);savePrefsDB({auto_refresh:!autoRefresh})}}><span style={{fontSize:13,color:"var(--t2)"}}>{lang==="fr"?"Rafraîchissement automatique":"Auto-refresh"}</span><div style={{width:36,height:20,borderRadius:10,background:autoRefresh?"var(--gold)":"var(--b2)",padding:2,cursor:"pointer",transition:"background .2s"}}><div style={{width:16,height:16,borderRadius:8,background:autoRefresh?"white":"var(--t4)",marginLeft:autoRefresh?16:0,transition:"margin-left .2s"}}/></div></div>
          {autoRefresh&&<div style={{marginBottom:14}}><p className="lbl" style={{color:"var(--t5)",marginBottom:8,fontSize:9}}>{lang==="fr"?"Fréquence de mise à jour":"Update frequency"}</p><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}><input type="number" className="inp" style={{width:70,textAlign:"center",padding:"8px 10px"}} value={refreshVal} min={1} onChange={e=>applyRefresh(e.target.value,refreshUnit)}/><div style={{display:"flex",borderRadius:"var(--rs)",overflow:"hidden",border:"1px solid var(--b)"}}>{[{k:"m",l:"min"},{k:"h",l:lang==="fr"?"heure(s)":"hour(s)"},{k:"j",l:lang==="fr"?"jour(s)":"day(s)"}].map(u=><button key={u.k} className="btn" style={{padding:"8px 14px",fontSize:12,background:refreshUnit===u.k?"var(--gbg)":"var(--bg3)",color:refreshUnit===u.k?"var(--gold)":"var(--t4)",borderRight:"1px solid var(--b)"}} onClick={()=>applyRefresh(refreshVal,u.k)}>{u.l}</button>)}</div></div><p style={{fontSize:10,color:"var(--t5)",marginBottom:4}}>{lang==="fr"?"Suggestions :":"Suggestions:"}</p><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[{v:15,u:"m",l:"15 min"},{v:30,u:"m",l:"30 min"},{v:1,u:"h",l:"1h"},{v:2,u:"h",l:"2h"},{v:4,u:"h",l:"4h"},{v:1,u:"j",l:lang==="fr"?"1 jour":"1 day"}].map(s=><button key={s.l} className="btn" style={{padding:"4px 10px",fontSize:10,borderRadius:12,background:"var(--bg3)",color:"var(--t4)",border:"1px solid var(--b)"}} onClick={()=>{setRefreshVal(s.v);setRefreshUnit(s.u);applyRefresh(s.v,s.u)}}>{s.l}</button>)}</div></div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:"var(--t2)"}}>{t("critical_alerts")}</span><div style={{width:36,height:20,borderRadius:10,background:lsGet("critAlerts",false)?"var(--gold)":"var(--b2)",padding:2,cursor:"pointer",transition:"background .2s"}} onClick={()=>{const next=!lsGet("critAlerts",false);lsSet("critAlerts",next);if(next&&typeof Notification!=="undefined"&&Notification.permission!=="granted"){Notification.requestPermission().then(p=>{if(p!=="granted"){lsSet("critAlerts",false);showT(lang==="fr"?"Notifications refusées par le navigateur":"Notifications denied by browser")}else{showT(lang==="fr"?"Alertes critiques activées":"Critical alerts enabled")}})}else if(next){showT(lang==="fr"?"Alertes critiques activées":"Critical alerts enabled")}else{showT(lang==="fr"?"Alertes critiques désactivées":"Critical alerts disabled")}}}><div style={{width:16,height:16,borderRadius:8,background:lsGet("critAlerts",false)?"white":"var(--t4)",marginLeft:lsGet("critAlerts",false)?16:0,transition:"margin-left .2s"}}/></div></div>
          <p style={{fontSize:11,color:"var(--t5)",marginTop:12}}>{t("notif_coming")}</p>
        </div>
        <h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{lang==="fr"?"IA Locale (Ollama)":"Local AI (Ollama)"}</h3>
        <div className="card" style={{padding:"16px 18px",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:13,color:"var(--t2)"}}>{lang==="fr"?"Enrichissement IA":"AI Enrichment"}</span>
            <div style={{width:36,height:20,borderRadius:10,background:ollamaEnabled?"var(--gold)":"var(--b2)",padding:2,cursor:"pointer",transition:"background .2s"}} onClick={()=>{const v=!ollamaEnabled;setOllamaEnabled(v);lsSet("ollamaEnabled",v);showT(v?(lang==="fr"?"IA activée":"AI enabled"):(lang==="fr"?"IA désactivée":"AI disabled"))}}><div style={{width:16,height:16,borderRadius:8,background:ollamaEnabled?"white":"var(--t4)",marginLeft:ollamaEnabled?16:0,transition:"margin-left .2s"}}/></div>
          </div>
          {ollamaEnabled&&<>
            <div style={{marginBottom:12}}><label className="lbl" style={{color:"var(--t5)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"Adresse Ollama":"Ollama URL"}</label><input className="inp" value={ollamaUrl} onChange={e=>{setOllamaUrl(e.target.value);lsSet("ollamaUrl",e.target.value)}} placeholder="http://localhost:11434"/></div>
            <div style={{marginBottom:12}}><label className="lbl" style={{color:"var(--t5)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"Modèle":"Model"}</label><input className="inp" value={ollamaModel} onChange={e=>{setOllamaModel(e.target.value);lsSet("ollamaModel",e.target.value)}} placeholder="mistral"/></div>
            <button className="btn" style={{width:"100%",padding:"8px",fontSize:12,background:"var(--bg3)",color:"var(--t3)",border:"1px solid var(--b)",borderRadius:"var(--rs)"}} onClick={async()=>{try{const r=await fetch(ollamaUrl+"/api/tags");if(r.ok){const d=await r.json();showT(`${lang==="fr"?"Connecté":"Connected"} — ${(d.models||[]).length} ${lang==="fr"?"modèle(s)":"model(s)"}`)}else showT(lang==="fr"?"Erreur de connexion":"Connection error")}catch(e){showT(lang==="fr"?"Ollama non accessible. Vérifiez qu'il est lancé.":"Ollama unreachable. Check it's running.")}}}>{lang==="fr"?"Tester la connexion":"Test connection"}</button>
            {enriching&&<p style={{fontSize:11,color:"var(--gold)",marginTop:10,textAlign:"center"}}>{lang==="fr"?"Enrichissement en cours...":"Enriching signals..."}</p>}
          </>}
        </div>
        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:14}}>{t("about")}</h3>
        <div className="card" style={{padding:"16px 18px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><span style={{fontSize:13,color:"var(--t3)"}}>{t("version")}</span><span style={{fontSize:13,color:"var(--t4)"}}>1.0.0</span></div>
          <div className="dv" style={{margin:"8px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><span style={{fontSize:13,color:"var(--t3)"}}>{lang==="fr"?"Base de données":"Database"}</span><span style={{fontSize:13,color:sbOk?"#6EE7B7":"var(--t5)"}}>{sbOk?(lang==="fr"?"Connectée":"Connected"):(lang==="fr"?"Hors-ligne":"Offline")}</span></div>
          {lastRefresh&&<><div className="dv" style={{margin:"8px 0"}}/><div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><span style={{fontSize:13,color:"var(--t3)"}}>{lang==="fr"?"Dernière mise à jour":"Last refresh"}</span><span style={{fontSize:13,color:"var(--t4)"}}>{new Date(lastRefresh).toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</span></div></>}
        </div>
        <p style={{textAlign:"center",fontSize:11,color:"var(--t5)",marginBottom:28}}>© 2026 SIGNALIS — Jean-Maurice Lemoine</p>
        <button className="btn" style={{width:"100%",background:"rgba(239,68,68,.08)",color:"#FCA5A5",border:"1px solid rgba(239,68,68,.15)",borderRadius:"var(--rs)"}} onClick={()=>{try{["step","tab","lang","selLines","autoRefresh","watchPrios","watchExtras","userNotes"].forEach(k=>localStorage.removeItem("signalis_"+k))}catch(e){}setStep("login");setTab("dashboard");setLoginEm("");setLoginPw("");setLoginErr(false)}}><I.logout/>{t("sign_out")}</button>
      </div>
    </div>);
    return null;
  };

  return (<>
    {isOffline&&<div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"var(--mw)",zIndex:999,background:"rgba(245,158,11,.15)",borderBottom:"1px solid rgba(245,158,11,.3)",padding:"6px 20px",textAlign:"center"}}><span style={{fontSize:11,color:"#FCD34D",fontWeight:600}}>{lang==="fr"?"Mode hors-ligne — données en cache":"Offline mode — cached data"}</span></div>}
    {render()}
    <nav className="tbar">{[{id:"dashboard",l:lang==="fr"?"Tableau":"Dashboard",Ic:I.home},{id:"watchlist",l:"Watchlist",Ic:I.list},{id:"notes",l:"Notes",Ic:I.note},{id:"brief",l:"Brief",Ic:I.calendar},{id:"settings",l:lang==="fr"?"Param.":"Settings",Ic:I.settings}].map(x=>(<button key={x.id} className={tab===x.id&&!selComp?"on":""} onClick={()=>goTab(x.id)}><x.Ic/><span>{x.l}</span></button>))}</nav>
    {selSig&&<SigDet s={selSig} onClose={()=>setSS(null)}/>}
    {showBrief&&briefCid&&<BriefSheet cid={briefCid} onClose={()=>{setSB(false);setBC(null)}}/>}
    {/* New meeting modal */}
    {showNewMeeting&&<div className="bsbg" onClick={()=>setSNM(false)}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,paddingTop:8}}><h3 className="fd" style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("add_meeting")}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>setSNM(false)}><I.x/></button></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("meeting_company")}</label><select className="inp" value={mtgCo} onChange={e=>setMtgCo(e.target.value)} style={{appearance:"auto"}}><option value="">{lang==="fr"?"Sélectionner...":"Select..."}</option>{[...watched].sort((a,b)=>a.name.localeCompare(b.name)).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("meeting_date")}</label><input className="inp" type="datetime-local" value={mtgDate} onChange={e=>setMtgDate(e.target.value)}/></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("meeting_type")}</label><div style={{display:"flex",gap:6}}>{[{k:"broker",l:t("meeting_broker")},{k:"rm",l:t("meeting_rm")},{k:"internal",l:t("meeting_internal")}].map(tp=><button key={tp.k} className={`chip ${mtgType===tp.k?"on":""}`} onClick={()=>setMtgType(tp.k)}>{tp.l}</button>)}</div></div>
      <div style={{marginBottom:20}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("meeting_notes")}</label><textarea className="inp" placeholder={lang==="fr"?"Points à aborder, contexte...":"Topics to discuss, context..."} value={mtgNotes} onChange={e=>setMtgNotes(e.target.value)} rows={3}/></div>
      <button className="btn bp" style={{width:"100%",height:46}} onClick={addMeeting} disabled={!mtgCo||!mtgDate}>{t("save_note")}</button>
    </div></div>}
    {showNewNote&&<div className="bsbg" onClick={()=>{if(noteDictating)stopNoteDict();setSNN(false)}}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,paddingTop:8}}><h3 className="fd" style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("new_note_title")}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>{if(noteDictating)stopNoteDict();setSNN(false)}}><I.x/></button></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("company_optional")}</label><select className="inp" value={nComp} onChange={e=>setNC(e.target.value)} style={{appearance:"auto"}}><option value="">{t("general")}</option>{cos.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("tag_label")}</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["observation","hypothesis","action","question","decision"].map(tg=><button key={tg} className={`chip ${nTag===tg?"on":""}`} onClick={()=>setNTg(tg)}>{noteTagLbl(tg,t)}</button>)}</div></div>
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><label className="lbl" style={{color:"var(--t4)"}}>{t("note_label")}</label><button className="btn" style={{padding:"4px 12px",fontSize:11,borderRadius:16,background:noteDictating?"rgba(239,68,68,.15)":"rgba(201,168,76,.1)",color:noteDictating?"#FCA5A5":"var(--gold)",border:`1px solid ${noteDictating?"rgba(239,68,68,.3)":"rgba(201,168,76,.2)"}`}} onClick={noteDictating?stopNoteDict:startNoteDict}>{noteDictating?<><div style={{width:6,height:6,borderRadius:"50%",background:"#EF4444",animation:"pd 1s ease-in-out infinite",marginRight:4}}/>{t("dict_stop")}</>:<><I.mic style={{width:14,height:14}}/>{t("dict_start")}</>}</button></div>{noteDictating&&<p style={{fontSize:10,color:"#FCA5A5",marginBottom:6}}>{t("dict_listening")}</p>}<textarea className="inp" placeholder={t("note_placeholder")} value={nText} onChange={e=>setNT(e.target.value)} rows={4} style={{borderColor:noteDictating?"rgba(239,68,68,.3)":"var(--b)"}}/></div>
      <button className="btn bp" style={{width:"100%",height:46}} onClick={()=>{if(noteDictating)stopNoteDict();addN()}} disabled={!nText.trim()}>{t("save_note")}</button>
    </div></div>}
    {/* Daily Digest sheet */}
    {showDigest&&<div className="bsbg" onClick={()=>setSD(false)}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,paddingTop:8}}><h3 className="fd" style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("digest_full_title")}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>setSD(false)}><I.x/></button></div>
      <p style={{fontSize:12,color:"var(--t4)",marginBottom:4}}>{t("digest_full_sub")}</p>
      <p style={{fontSize:10,color:"var(--t5)",marginBottom:16}}>{fFull()} {lastRefresh?`· ${lang==="fr"?"MAJ":"Updated"} ${new Date(lastRefresh).toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}`:""}</p>
      <div className="aline" style={{marginBottom:18}}/>
      {/* Stats bar */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>{[{l:t("watchlist_label"),v:watched.length,c:"var(--gold)"},{l:t("signals_lc"),v:liveSigs.length,c:"#60A5FA"},{l:t("critical_lbl"),v:liveSigs.filter(s=>s.imp>=80).length,c:"#F87171"}].map(x=><div key={x.l} className="cs" style={{textAlign:"center",padding:"10px"}}><p style={{fontSize:20,fontWeight:700,color:x.c}}>{x.v}</p><p className="lbl" style={{color:"var(--t4)",marginTop:3,fontSize:9}}>{x.l}</p></div>)}</div>
      {/* Risk overview — top companies */}
      {watched.length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("risk_overview")}</h4><div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{watched.slice(0,8).map(co=>{const coSigs=liveSigs.filter(s=>{const n=s.company||"";return n.toLowerCase()===co.name.toLowerCase()||n.toLowerCase().includes(co.name.toLowerCase().split(" ")[0])});return (<div key={co.id} className="cs" style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}><span className="mono" style={{width:26,height:26,fontSize:10}}>{co.logo}</span><div style={{minWidth:0}}><p style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{co.name}</p><p style={{fontSize:10,color:"var(--t4)",marginTop:1}}>{coSigs.length} {coSigs.length>1?t("signals_lc"):t("signal")}</p></div></div><SR s={co.risk} sz={32} sw={2}/></div>)})}</div></>}
      {/* Recent signals timeline */}
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("recent_activity")}</h4>
      {liveSigs.length>0?<div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>{liveSigs.slice(0,10).map((s,idx)=>{const cat=getCat(s.cat,lang);const co=cos.find(c=>{const n=s.company||"";return c.name.toLowerCase()===n.toLowerCase()||n.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])});return (<div key={s.id||idx} className="card" style={{padding:"12px 16px",cursor:"pointer"}} onClick={()=>{setSS(s);setSD(false)}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>{cat?.icon||"📋"}</span>{co&&<span style={{fontSize:11,fontWeight:500,color:"var(--gold2)"}}>{co.name}</span>}{!co&&s.company&&<span style={{fontSize:11,fontWeight:500,color:"var(--gold2)"}}>{s.company}</span>}</div><span className="badge" style={{background:sBg(s.imp||50),color:sT(s.imp||50)}}>{s.imp||50}</span></div><p style={{fontSize:12,color:"var(--t1)",lineHeight:1.4}}>{tx(s.title,lang)||s.company||"—"}</p><p style={{fontSize:10,color:"var(--t5)",marginTop:6}}>{tx(s.src||s.source,lang)||"Yahoo Finance"} · {s.at?fD(s.at):"—"}</p></div>)})}</div>:<div style={{textAlign:"center",padding:"32px 16px"}}><p style={{fontSize:13,color:"var(--t4)",marginBottom:8}}>{t("no_activity")}</p><button className="btn bp" style={{padding:"8px 18px",fontSize:12}} onClick={()=>{setSD(false);refreshSignals()}}><I.refresh/>{lang==="fr"?"Lancer la veille":"Start monitoring"}</button></div>}
      {/* Copy digest */}
      {liveSigs.length>0&&<button className="btn bp" style={{width:"100%",height:46}} onClick={()=>{const header=`${t("digest_full_title").toUpperCase()}\n${fFull()}\n\n`;const stats=`${watched.length} ${t("companies_monitored")} · ${liveSigs.length} ${t("signal_count")}\n\n`;const sigs=liveSigs.slice(0,15).map(s=>`• [${s.imp}] ${s.company||""}: ${tx(s.title,lang)}`).join("\n");const full=`${header}${stats}${t("recent_activity").toUpperCase()}\n${sigs}\n\n— SIGNALIS`;navigator.clipboard?.writeText(full);showT(t("copied_clipboard"))}}><I.copy/>{t("copy_digest")}</button>}
    </div></div>}
    {/* Recording overlay */}
    {showRec&&<div className="bsbg" onClick={()=>{if(!isRec&&!recProcessing){setShowRec(false);setTranscript("")}}}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingTop:8}}><h3 className="fd" style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("rec_title")}</h3>{!isRec&&!recProcessing&&<button className="bi" style={{width:32,height:32}} onClick={()=>{setShowRec(false);setTranscript("")}}><I.x/></button>}</div>
      <p style={{fontSize:12,color:"var(--t4)",marginBottom:20}}>{t("rec_sub")}</p>
      {cos.find(c=>c.id===recCid)&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--bg3)",borderRadius:"var(--rs)",marginBottom:20,border:"1px solid var(--b)"}}><span className="mono" style={{width:28,height:28,fontSize:12}}>{cos.find(c=>c.id===recCid)?.logo}</span><span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{cos.find(c=>c.id===recCid)?.name}</span></div>}
      {/* Transcript area */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--b)",borderRadius:"var(--rs)",padding:"16px",minHeight:120,maxHeight:280,overflowY:"auto",marginBottom:20}}>
        {recProcessing?<div style={{textAlign:"center",padding:"32px 0"}}><div className="pd" style={{margin:"0 auto 12px"}}/><p style={{fontSize:13,color:"var(--gold)"}}>{t("rec_processing")}</p></div>
        :isRec?<>{transcript?<p style={{fontSize:13,color:"var(--t2)",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{transcript}</p>:<p style={{fontSize:13,color:"var(--t5)",fontStyle:"italic"}}>{lang==="fr"?"En écoute…":"Listening…"}</p>}<div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}><div style={{width:8,height:8,borderRadius:"50%",background:"#EF4444",animation:"pd 1s ease-in-out infinite"}}/><span style={{fontSize:11,color:"#FCA5A5"}}>{t("rec_recording")}</span></div></>
        :transcript?<p style={{fontSize:13,color:"var(--t2)",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{transcript}</p>
        :<p style={{fontSize:13,color:"var(--t5)",textAlign:"center",padding:"24px 0"}}>{lang==="fr"?"Appuyez sur le bouton pour démarrer":"Press the button to start"}</p>}
      </div>
      {/* Controls */}
      {recProcessing?null
      :isRec?<button className="btn" style={{width:"100%",height:50,background:"rgba(239,68,68,.12)",color:"#FCA5A5",border:"1px solid rgba(239,68,68,.2)",borderRadius:"var(--rs)",fontSize:14,fontWeight:600}} onClick={stopRec}><I.stop/>{t("rec_stop")}</button>
      :transcript?<div style={{display:"flex",gap:10}}><button className="btn" style={{flex:1,height:46,background:"var(--bg3)",color:"var(--t3)",border:"1px solid var(--b2)",borderRadius:"var(--rs)"}} onClick={()=>{setTranscript("");startRec()}}><I.mic/>{lang==="fr"?"Recommencer":"Restart"}</button><button className="btn bp" style={{flex:1,height:46}} onClick={stopRec}><I.check/>{lang==="fr"?"Enregistrer le résumé":"Save summary"}</button></div>
      :<button className="btn bp" style={{width:"100%",height:50,fontSize:14}} onClick={startRec}><I.mic/>{t("rec_start")}</button>}
    </div></div>}
    {toast&&<div className="toast">{toast}</div>}
  </>);
}

export default function AegisRadar(){return (<><style>{css}</style><div className="app"><LangProvider><App/></LangProvider></div></>)}
