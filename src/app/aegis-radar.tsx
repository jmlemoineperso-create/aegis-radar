"use client";
import { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext } from "react";

// ── Supabase REST helper (no library needed) ──
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uexaflnvlzatfizfyrtq.supabase.co";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleGFmbG52bHphdGZpemZ5cnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Mzc4NDcsImV4cCI6MjA5MTAxMzg0N30.ZH-WRExhivSVNUawPjP2N62BBIl4j8sAnbrE6G1u-AI";
const sbOk = !!(SB_URL && SB_KEY);
const sbFetch = async (table, method = "GET", body = null, query = "") => {
  if (!sbOk) return null;
  const url = `${SB_URL}/rest/v1/${table}${query}`;
  const isUpsert = method === "POST" && query.includes("on_conflict");
  const prefer = method === "POST" ? (isUpsert ? "return=representation,resolution=merge-duplicates" : "return=representation") : method === "PATCH" ? "return=representation" : "";
  const headers = { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json" };
  if (prefer) headers["Prefer"] = prefer;
  try {
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  } catch (e) { return null; }
};

// ═══════════════════════════════════════════════════════════════
// AIG Lines Intelligence — Fully Bilingual (FR/EN)
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
  dashboard_title:{en:"Lines Intelligence",fr:"Lines Intelligence"},
  dashboard_sub:{en:"Prioritized company signals for your Financial Lines portfolio.",fr:"Signaux prioritaires pour votre portefeuille Financial Lines."},
  greeting_morning:{en:"Good morning, Anne-Sophie",fr:"Bonjour, Anne-Sophie"},
  greeting_afternoon:{en:"Good afternoon, Anne-Sophie",fr:"Bon après-midi, Anne-Sophie"},
  greeting_evening:{en:"Good evening, Anne-Sophie",fr:"Bonsoir, Anne-Sophie"},
  dedication:{en:"© 2026 AIG — Lines Intelligence",fr:"© 2026 AIG — Lines Intelligence"},
  dedication_sub:{en:"Premium intelligence for Financial Lines professionals.",fr:"Veille premium pour les professionnels Financial Lines."},
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
  copy_brief:{en:"Copy brief",fr:"Copier le brief"},copied:{en:"Copied",fr:"Copié"},meetings:{en:"Meetings",fr:"Réunions"},add_meeting:{en:"New meeting",fr:"Nouvelle réunion"},meeting_company:{en:"Company",fr:"Entreprise"},meeting_date:{en:"Date \u0026 time",fr:"Date \u0026 heure"},meeting_type:{en:"Type",fr:"Type"},meeting_broker:{en:"Broker meeting",fr:"RDV Courtier"},meeting_rm:{en:"Risk Manager meeting",fr:"RDV Risk Manager"},meeting_internal:{en:"Internal",fr:"Interne"},meeting_other:{en:"Other",fr:"Autre"},contact_name:{en:"Contact name",fr:"Nom du contact"},contact_phone:{en:"Phone",fr:"Téléphone"},contact_email:{en:"Email",fr:"Email"},contact_role:{en:"Role / Function",fr:"Fonction"},contact_history:{en:"Modification history",fr:"Historique des modifications"},meeting_notes:{en:"Preparation notes",fr:"Notes de préparation"},upcoming:{en:"Upcoming",fr:"À venir"},past_meetings:{en:"Past",fr:"Passées"},no_meetings:{en:"No meetings planned",fr:"Aucune réunion planifiée"},meeting_saved:{en:"Meeting saved",fr:"Réunion enregistrée"},meeting_deleted:{en:"Meeting deleted",fr:"Réunion supprimée"},export_cal:{en:"Add to calendar",fr:"Ajouter au calendrier"},brief_ready:{en:"Brief ready",fr:"Brief prêt"},days_left:{en:"days",fr:"jours"},today:{en:"Today",fr:"Aujourd'hui"},tomorrow:{en:"Tomorrow",fr:"Demain"},
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
  // ── NEW FEATURES i18n ──
  auto_brief:{en:"Auto-briefs ready",fr:"Briefs auto prêts"},
  auto_brief_sub:{en:"Meeting in less than 24h — brief generated automatically",fr:"Réunion dans moins de 24h — brief généré automatiquement"},
  commercial_opps:{en:"Commercial opportunities",fr:"Opportunités commerciales"},
  renewal_window:{en:"Renewal in",fr:"Renouvellement dans"},
  days:{en:"days",fr:"jours"},
  propose:{en:"Propose",fr:"Proposer"},
  inactivity_alert:{en:"Inactivity alerts",fr:"Alertes d'inactivité"},
  no_interaction_since:{en:"No interaction for",fr:"Aucune interaction depuis"},
  plan_action:{en:"Plan a meeting",fr:"Planifier une réunion"},
  weekly_summary:{en:"Weekly summary",fr:"Résumé hebdomadaire"},
  weekly_summary_sub:{en:"Overview of last 7 days across your portfolio",fr:"Synthèse des 7 derniers jours sur votre portefeuille"},
  copy_weekly:{en:"Copy weekly report",fr:"Copier le rapport hebdo"},
  email_template:{en:"Email template",fr:"Modèle d'email"},
  email_to_broker:{en:"Email to broker",fr:"Email au courtier"},
  email_to_rm:{en:"Email to Risk Manager",fr:"Email au Risk Manager"},
  copy_email:{en:"Copy email",fr:"Copier l'email"},
  stock_alert:{en:"Market alert",fr:"Alerte marché"},
  stock_drop:{en:"Significant price movement",fr:"Mouvement de cours significatif"},
  actions_center:{en:"Actions center",fr:"Centre d'actions"},
  smart_alerts:{en:"Smart alerts",fr:"Alertes intelligentes"},
  kpi_title:{en:"Monthly KPIs",fr:"KPIs du mois"},
  briefs_generated:{en:"briefs generated",fr:"briefs générés"},
  meetings_prepared:{en:"meetings prepared",fr:"réunions préparées"},
  signals_processed:{en:"signals processed",fr:"signaux traités"},
  opps_detected:{en:"opportunities detected",fr:"opportunités détectées"},
};

// ── localStorage helpers ──
let _lsPrefix="signalis_";
const lsGet=(k,def)=>{try{const v=localStorage.getItem(_lsPrefix+k);if(v)return JSON.parse(v);const old=localStorage.getItem("signalis_"+k);if(old)return JSON.parse(old);return def}catch(e){return def}};
const lsSet=(k,v)=>{try{localStorage.setItem(_lsPrefix+k,JSON.stringify(v))}catch(e){}};
const setUserPrefix=(email)=>{_lsPrefix="u_"+(email||"default").replace(/[^a-z0-9]/gi,"_")+"_";};

const LangCtx=createContext({lang:"en",t:k=>k,setLang:()=>{}});
const useLang=()=>useContext(LangCtx);
function LangProvider({children}){const[lang,setLangRaw]=useState(()=>lsGet("lang","fr"));const setLang=useCallback(l=>{setLangRaw(l);lsSet("lang",l)},[]);const t=useCallback(k=>T[k]?.[lang]||T[k]?.en||k,[lang]);return <LangCtx.Provider value={{lang,t,setLang}}>{children}</LangCtx.Provider>}

// ── Bilingual text helper ──
// tx(obj, lang) returns the right language string
const cleanHtml=(s)=>{if(!s||typeof s!=="string")return s;return s.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,"\"").replace(/&#39;/g,"'").replace(/&nbsp;/g," ").replace(/<[^>]*>/g,"").replace(/https?:\/\/\S+/g,"").replace(/\s+/g," ").trim()};
const tx=(v,lang)=>{if(!v)return"";if(typeof v==="string")return cleanHtml(v);if(typeof v==="number")return String(v);if(typeof v==="object"){if(v[lang])return cleanHtml(v[lang]);if(v.en)return cleanHtml(v.en);if(v.fr)return cleanHtml(v.fr);return""}return String(v||"")};

// Company logos via Clearbit
const DOMAINS={"LVMH":"lvmh.com","TotalEnergies":"totalenergies.com","Sanofi":"sanofi.com","L'Oréal":"loreal.com","Schneider Electric":"se.com","Air Liquide":"airliquide.com","BNP Paribas":"bnpparibas.com","AXA":"axa.com","Hermès":"hermes.com","Safran":"safran-group.com","EssilorLuxottica":"essilorluxottica.com","Dassault Systèmes":"3ds.com","Vinci":"vinci.com","Kering":"kering.com","Saint-Gobain":"saint-gobain.com","Société Générale":"societegenerale.com","Danone":"danone.com","Engie":"engie.com","Capgemini":"capgemini.com","Pernod Ricard":"pernod-ricard.com","Michelin":"michelin.com","Publicis Groupe":"publicisgroupe.com","Renault":"renaultgroup.com","Orange":"orange.com","Bouygues":"bouygues.com","Thales":"thalesgroup.com","Stellantis":"stellantis.com","Veolia":"veolia.com","Airbus":"airbus.com","Legrand":"legrand.com","Crédit Agricole":"credit-agricole.com","Alstom":"alstom.com","Worldline":"worldline.com","Edenred":"edenred.com","Vivendi":"vivendi.com","Allianz":"allianz.com","Siemens":"siemens.com","SAP":"sap.com","Deutsche Bank":"db.com","BASF":"basf.com","BMW":"bmw.com","Volkswagen":"volkswagen.com","Unilever":"unilever.com","Shell":"shell.com","HSBC":"hsbc.com","AstraZeneca":"astrazeneca.com","BP":"bp.com","Nestlé":"nestle.com","Novartis":"novartis.com","Roche":"roche.com","Zurich Insurance":"zurich.com","STMicroelectronics":"st.com","ArcelorMittal":"arcelormittal.com","Carrefour":"carrefour.com","Bureau Veritas":"bureauveritas.com","Accor":"group.accor.com","Teleperformance":"teleperformance.com","Amundi":"amundi.com","Arkema":"arkema.com","Dassault Aviation":"dassault-aviation.com","Eiffage":"eiffage.com","Eurazeo":"eurazeo.com","Forvia (Faurecia)":"forvia.com","Gecina":"gecina.fr","Getlink":"getlinkgroup.com","GTT":"gtt.fr","Ipsen":"ipsen.com","JCDecaux":"jcdecaux.com","Klépierre":"klepierre.com","Sartorius Stedim Biotech":"sartorius.com","SEB":"groupeseb.com","Sodexo":"sodexo.com","Sopra Steria":"soprasteria.com","Unibail-Rodamco-Westfield":"urw.com","Valeo":"valeo.com","Wendel":"wendelgroup.com","Nexans":"nexans.com","Atos":"atos.net","Biomérieux":"biomerieux.com","Bolloré":"bollore.com","Coface":"coface.com","Covivio":"covivio.eu","Fnac Darty":"fnacdarty.com","Imerys":"imerys.com","Clariane (ex-Korian)":"clariane.com","Lagardère":"lagardere.com","OVHcloud":"ovhcloud.com","Plastic Omnium":"plasticomnium.com","Rémy Cointreau":"remy-cointreau.com","Rexel":"rexel.com","Rubis":"rubis.fr","Soitec":"soitec.com","Spie":"spie.com","Technip Energies":"technipenergies.com","TF1":"groupe-tf1.fr","Trigano":"trigano.fr","Ubisoft":"ubisoft.com","Vallourec":"vallourec.com","Vicat":"vicat.fr","Eutelsat":"eutelsat.com","Scor":"scor.com","CNP Assurances":"cnp.fr","Nexity":"nexity.fr","Elior":"eliorgroup.com","CGG":"cgg.com","La Poste":"lapostegroupe.com","SNCF":"sncf.com","EDF":"edf.fr","RATP":"ratp.fr","Caisse des Dépôts":"caissedesdepots.fr","Lactalis":"lactalis.fr","Auchan":"auchan.com","Décathlon":"decathlon.com","Orano (ex-Areva)":"orano.group","Groupe BPCE":"groupebpce.com","Groupe Rocher":"groupe-rocher.com","MACIF":"macif.fr"};
const logoUrl=(name)=>{const d=DOMAINS[name];return d?`https://logo.clearbit.com/${d}`:null};

// ── ENUMS ──
const CATS=[
  {id:"governance",label:{en:"Governance",fr:"Gouvernance"},s:{en:"Gov.",fr:"Gouv."},icon:"",c:"#5B21B6"},
  {id:"regulatory_compliance",label:{en:"Regulatory",fr:"Réglementaire"},s:{en:"Reg.",fr:"Rég."},icon:"",c:"#002B5C"},
  {id:"litigation_investigation",label:{en:"Litigation",fr:"Contentieux"},s:{en:"Lit.",fr:"Cont."},icon:"",c:"#9D174D"},
  {id:"financial_stress_reporting",label:{en:"Financial",fr:"Financier"},s:{en:"Fin.",fr:"Fin."},icon:"",c:"#92400E"},
  {id:"mna_transactions",label:{en:"M&A",fr:"M&A"},s:{en:"M&A",fr:"M&A"},icon:"",c:"#065F46"},
  {id:"cyber_data_breach",label:{en:"Cyber",fr:"Cyber"},s:{en:"Cyber",fr:"Cyber"},icon:"",c:"#991B1B"},
  {id:"fraud_crime",label:{en:"Fraud",fr:"Fraude"},s:{en:"Fraud",fr:"Fraude"},icon:"",c:"#9A3412"},
  {id:"esg_reputation",label:{en:"ESG",fr:"ESG"},s:{en:"ESG",fr:"ESG"},icon:"",c:"#115E59"},
  {id:"hr_culture",label:{en:"HR / Culture",fr:"RH / Culture"},s:{en:"HR",fr:"RH"},icon:"",c:"#374151"},
];
const LINES={do:"D&O",epl:"EPL",ptl:"PTL",fraud:{en:"Fraud",fr:"Fraude"},crime:{en:"Crime / Fidelity",fr:"Crime / Fidélité"},knr:{en:"K&R",fr:"K&R"},bbb:{en:"BBB Global Banking",fr:"BBB Globale de Banque"},rcpro:{en:"PI / Professional Liability",fr:"RCPro"},cyber:"Cyber",rcg:{en:"General Liability",fr:"RCG"},rc_env:{en:"Environmental Liability",fr:"RC Environnementale"},motor:"Motor",marine:{en:"Marine & Transport",fr:"Transports (Marine)"},property:{en:"Property",fr:"Dommages"},mna:{en:"M&A / W&I",fr:"M&A / W&I"},trade_credit:{en:"Trade Credit",fr:"Trade Crédit"},trade_finance:{en:"Trade Finance",fr:"Trade Finance"},gpa_bta:{en:"GPA & BTA",fr:"GPA & BTA"},affinity:{en:"Affinity",fr:"Affinitaires"},aviation:"Aviation",pi:{en:"PI / E&O",fr:"RCPro / E&O"},professional:{en:"PI / Professional",fr:"RCPro"},employment:"EPL",directors:"D&O",officers:"D&O",liability:{en:"General Liability",fr:"RCG"},environmental:{en:"Environmental",fr:"RC Env."},transactional:{en:"W&I / Transactional",fr:"W&I / Transactionnel"}};
const lineLbl=(k,lang)=>{const v=LINES[k];if(!v)return (k||"").toUpperCase();return typeof v==="object"?v[lang]||v.en:v};
const LVL_C={critical:"#DC2626",high:"#D97706",medium:"#2563EB",low:"#16A34A"};
const LVL_BG={critical:"rgba(220,38,38,.08)",high:"rgba(217,119,6,.08)",medium:"rgba(37,99,235,.08)",low:"rgba(22,163,74,.08)"};
const LVL_T={critical:"#991B1B",high:"#92400E",medium:"#1E40AF",low:"#166534"};
const NOTE_C={observation:{c:"#92400E",bg:"rgba(217,119,6,.06)"},hypothesis:{c:"#5B21B6",bg:"rgba(91,33,182,.06)"},action:{c:"#166534",bg:"rgba(22,163,74,.06)"},question:{c:"#1E40AF",bg:"rgba(59,130,246,.06)"},decision:{c:"#9D174D",bg:"rgba(157,23,77,.06)"}};
const noteTagLbl=(tag,t)=>({observation:t("observation"),hypothesis:t("hypothesis_tag"),action:t("action"),question:t("question"),decision:t("decision")}[tag]||tag);
const factLbl=(f,t)=>({verified:{l:t("verified"),c:"#166534",bg:"rgba(22,163,74,.08)"},likely:{l:t("likely"),c:"#92400E",bg:"rgba(217,119,6,.08)"},hypothesis:{l:t("hypothesis_fact"),c:"#5B21B6",bg:"rgba(91,33,182,.08)"},needs_review:{l:t("needs_review"),c:"#374151",bg:"rgba(55,65,81,.08)"}}[f]||{l:f,c:"#374151",bg:"rgba(55,65,81,.08)"});
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
const SRC_URL={"Reuters":"https://reuters.com","The Guardian":"https://theguardian.com","Le Monde":"https://lemonde.fr","Le Monde.fr":"https://lemonde.fr","Bloomberg":"https://bloomberg.com","Financial Times":"https://ft.com","New York Times":"https://nytimes.com","Les Echos":"https://lesechos.fr","Investir Les Echos":"https://investir.lesechos.fr","Le Figaro":"https://lefigaro.fr","Mediapart":"https://mediapart.fr","BFM":"https://bfmtv.com","BFM Bourse":"https://bfmbourse.com","Boursorama":"https://boursorama.com","La Tribune":"https://latribune.fr","Ouest-France":"https://ouest-france.fr","Yahoo Finance":"https://finance.yahoo.com","Yahoo Finance France":"https://fr.finance.yahoo.com","ABC Bourse":"https://abcbourse.com","Boursier.com":"https://boursier.com","Option Finance":"https://optionfinance.fr","Idéal Investisseur":"https://ideal-investisseur.fr","L'Agefi":"https://agefi.fr","Zonebourse":"https://zonebourse.com","Zonebourse Suisse":"https://zonebourse.com","marketscreener.com":"https://marketscreener.com","Investing.com":"https://investing.com","TradingView":"https://tradingview.com","Daf-Mag.fr":"https://daf-mag.fr","Le Journal des Entreprises":"https://lejournaldesentreprises.com","BODACC":"https://bodacc.fr","AMF":"https://amf-france.org","CNIL":"https://cnil.fr","TechCrunch":"https://techcrunch.com","Wall Street Journal":"https://wsj.com","BBC News":"https://bbc.co.uk","Wired":"https://wired.com","Il Sole 24 Ore":"https://ilsole24ore.com","Handelsblatt":"https://handelsblatt.com","El País":"https://elpais.com"};
const srcUrl=name=>{const n=typeof name==="object"?name.en:name;return SRC_URL[n]||null};
const fixBodaccUrl=(url,company)=>{if(!url)return url;if(url.includes("bodacc.fr/pages/home")||url==="https://www.bodacc.fr"||url==="https://bodacc.fr"){return "https://www.bodacc.fr/pages/annonces-commerciales/?q="+encodeURIComponent(company||"")}return url};

// ── SELECTORS ──
const getSigsStatic=cid=>SIGNALS.filter(s=>s.cid===cid).sort((a,b)=>b.imp-a.imp);
const getImps=sid=>IMPACTS.filter(i=>i.sid===sid);
const getNotesStatic=cid=>NOTES.filter(n=>n.cid===cid).sort((a,b)=>new Date(b.at)-new Date(a.at));
const getAllLines=sigs=>[...new Set(sigs.flatMap(s=>getImps(s.id).flatMap(i=>(i.line||"").split("|").map(l=>l.trim()).filter(Boolean))))];

// ── UTILS ──
const getCat=(id,lang)=>{const c=CATS.find(x=>x.id===id);return c?{...c,label:c.label[lang]||c.label.en,s:c.s[lang]||c.s.en}:null};
const fD=(iso,lang2)=>{if(!iso)return"—";const d=new Date(iso);const now=new Date();const diffH=Math.floor((now.getTime()-d.getTime())/3600000);const isToday=d.toDateString()===now.toDateString();const yesterday=new Date(now);yesterday.setDate(yesterday.getDate()-1);const isYesterday=d.toDateString()===yesterday.toDateString();const time=d.toLocaleTimeString(lang2==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"});if(isToday)return(lang2==="fr"?"Auj. ":"Today ")+time;if(isYesterday)return(lang2==="fr"?"Hier ":"Yest. ")+time;return d.toLocaleDateString(lang2==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short"})+", "+time};
const sC=s=>s>=80?"#DC2626":s>=60?"#D97706":s>=40?"#2563EB":"#16A34A";
const sBg=s=>s>=80?"rgba(220,38,38,.08)":s>=60?"rgba(217,119,6,.08)":s>=40?"rgba(37,99,235,.08)":"rgba(16,185,129,.12)";
const sT=s=>s>=80?"#991B1B":s>=60?"#92400E":s>=40?"#1E40AF":"#166534";
const tI=t=>t==="rising"?"↑":t==="declining"?"↓":"→";

// ── CSS ──
const css=`:root{--bg:#F3F5F7;--bg2:#FFFFFF;--bg3:#F3F5F7;--bg4:#E2E6EB;--b:#E2E6EB;--b2:#CDD3DA;--t1:#263348;--t2:#3D4E63;--t3:#5C6B7D;--t4:#7D8A9A;--t5:#A8B1BD;--gold:#002B5C;--gold2:#0072CE;--gbg:rgba(0,114,206,.06);--r:14px;--rs:10px;--mw:480px}
*{margin:0;padding:0;box-sizing:border-box}body,#root{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;background:var(--bg);color:var(--t2);-webkit-font-smoothing:antialiased;min-height:100vh}
.app{max-width:var(--mw);margin:0 auto;min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#CDD3DA;border-radius:3px}
.fd{font-family:inherit;font-weight:600}
.hsb::-webkit-scrollbar{display:none}.hsb{scrollbar-width:none;-webkit-overflow-scrolling:touch}
@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes pd{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.fi{animation:fi .35s cubic-bezier(.22,1,.36,1) forwards}.fi1{animation-delay:.04s;opacity:0}.fi2{animation-delay:.08s;opacity:0}.fi3{animation-delay:.12s;opacity:0}.fi4{animation-delay:.16s;opacity:0}.fi5{animation-delay:.2s;opacity:0}
.pd{width:6px;height:6px;border-radius:50%;background:#0072CE;animation:pd 2.5s ease-in-out infinite}
.card{background:var(--bg2);border:1px solid var(--b);border-radius:var(--r);transition:border-color .2s,transform .15s}.card:hover{border-color:var(--b2)}
.card-el{background:#FFFFFF;border:1px solid #CDD3DA;border-radius:var(--r)}
.cs{background:var(--bg3);border:1px solid var(--b);border-radius:var(--rs);padding:14px 16px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;font-family:inherit;cursor:pointer;transition:all .2s;white-space:nowrap}
.bp{padding:11px 22px;border-radius:var(--rs);font-size:13px;font-weight:600;color:var(--bg);background:linear-gradient(135deg,var(--gold),var(--gold2));box-shadow:0 1px 3px rgba(0,114,206,.2)}.bp:disabled{opacity:.4;cursor:not-allowed}.bp:hover:not(:disabled){box-shadow:0 2px 8px rgba(0,114,206,.35)}
.bg{padding:4px 0;background:transparent;color:var(--t3);font-size:13px;font-weight:500}
.bi{width:36px;height:36px;padding:0;border-radius:var(--rs);display:flex;align-items:center;justify-content:center;background:var(--bg3);border:1px solid var(--b);color:var(--t3);cursor:pointer;transition:all .2s}.bi:hover{background:var(--bg4);color:var(--t1)}
.chip{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:500;background:var(--bg3);color:var(--t3);border:1px solid var(--b);cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}.chip:hover{border-color:var(--b2)}.chip.on{background:var(--gbg);color:var(--gold2);border-color:rgba(0,114,206,.3)}
.badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.03em}
.ftag{display:inline-flex;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:2px 7px;border-radius:4px}
.inp{width:100%;padding:11px 16px;border-radius:var(--rs);background:var(--bg3);border:1px solid var(--b);color:var(--t1);font-family:inherit;font-size:14px;outline:none;transition:all .2s}.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(0,114,206,.1)}.inp::placeholder{color:var(--t5)}textarea.inp{resize:vertical;min-height:88px;line-height:1.6}
.lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em}
.dv{height:1px;background:var(--b);margin:20px 0}
.aline{height:2px;background:linear-gradient(90deg,var(--gold),rgba(0,114,206,.3),transparent);border-radius:1px}
.hdr{position:sticky;top:0;z-index:50;background:#002B5C;border-bottom:1px solid #001E42;padding:14px 20px;color:#fff}.hdr h2,.hdr h3,.hdr span,.hdr p{color:rgba(255,255,255,.85)}.hdr .lbl{color:rgba(255,255,255,.5)}.hdr .bi{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8)}.hdr .bi:hover{background:rgba(255,255,255,.18)}.hdr .inp{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fff}.hdr .inp::placeholder{color:rgba(255,255,255,.4)}.hdr .inp:focus{border-color:rgba(255,255,255,.3);box-shadow:none}.hdr .chip{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15);color:rgba(255,255,255,.7)}.hdr .chip.on{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}.hdr .bg{color:rgba(255,255,255,.8)}.hdr .bp{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.2)}.hdr .bp:hover{background:rgba(255,255,255,.25)}
.tbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:var(--mw);display:flex;background:rgba(255,255,255,.97);backdrop-filter:blur(12px);border-top:1px solid #E2E6EB;z-index:100;padding:0 0 env(safe-area-inset-bottom,6px)}
.tbar button{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 6px;color:#A8B1BD;background:none;border:none;cursor:pointer;transition:color .2s;font-family:inherit}.tbar button.on{color:#002B5C}.tbar span{font-size:9px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.bsbg{position:fixed;inset:0;background:rgba(0,43,92,.25);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:10px 0}
.bsm{width:100%;max-width:var(--mw);max-height:85vh;overflow-y:auto;background:#FFFFFF;border-top:1px solid #CDD3DA;border-radius:14px 14px 0 0;padding:8px 22px 28px;animation:su .3s cubic-bezier(.22,1,.36,1)}
.toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%);background:#002B5C;color:#FFFFFF;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 4px 16px rgba(0,43,92,.18);border:none;z-index:300;animation:fi .2s ease}
.mono{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:inherit;font-weight:600;font-weight:600;font-size:14px;color:var(--t1);background:linear-gradient(135deg,var(--bg4),var(--bg3));border:1px solid var(--b2);flex-shrink:0}
.sr{position:relative;display:flex;align-items:center;justify-content:center}.sr svg{position:absolute;top:0;left:0;transform:rotate(-90deg)}.sr-v{font-weight:700;z-index:1}
.prio-primary{border-left:3px solid #002B5C}.prio-secondary{border-left:3px solid #0072CE}.prio-watch{border-left:3px solid var(--b2)}
.lang-sw{display:flex;border-radius:var(--rs);overflow:hidden;border:1px solid var(--b)}.lang-sw button{flex:1;padding:8px 16px;font-size:13px;font-weight:500;border:none;cursor:pointer;transition:all .2s;font-family:inherit;background:var(--bg3);color:var(--t3)}.lang-sw button.on{background:rgba(0,114,206,.06);color:#002B5C}
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
@media(max-width:400px){
  .chip{padding:4px 8px;font-size:10px;gap:3px}
  .btn.bp{padding:6px 10px;font-size:11px}
  .card{padding:12px 14px}
  .tbar button{min-width:0}.tbar span{font-size:7px;letter-spacing:.02em}
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

function Logo({name,sz=24,fallback}){
  const d=DOMAINS[name];
  const[failed,setFailed]=useState(0);
  const sources=d?[
    `https://logo.clearbit.com/${d}`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${d}&size=128`,
    `https://www.google.com/s2/favicons?domain=${d}&sz=${Math.max(sz*2,64)}`
  ]:[];
  if(!d||failed>=sources.length)return <span className="mono" style={{width:sz,height:sz,fontSize:sz*.42}}>{fallback||(name||"?").charAt(0)}</span>;
  return <img src={sources[failed]} alt="" style={{width:sz,height:sz,borderRadius:sz*.18,objectFit:"contain",background:"white",padding:1,flexShrink:0}} onError={()=>setFailed(f=>f+1)}/>;
}

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
  const[loginLoading,setLoginLoading]=useState(false);
  const[authToken,setAuthToken]=useState(()=>{try{const v=localStorage.getItem("signalis_authToken");return v?JSON.parse(v):null}catch(e){return null}});
  const[authEmail,setAuthEmail]=useState(()=>{try{const v=localStorage.getItem("signalis_authEmail");const email=v?JSON.parse(v):"";if(email)setUserPrefix(email);return email}catch(e){return""}});

  const tryLogin=async()=>{
    if(!loginEm||!loginPw)return;
    setLoginLoading(true);setLoginErr(false);
    try{
      // Try Supabase Auth sign-in
      const res=await fetch(`${SB_URL}/auth/v1/token?grant_type=password`,{
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SB_KEY},
        body:JSON.stringify({email:loginEm.toLowerCase().trim(),password:loginPw})
      });
      if(res.ok){
        const data=await res.json();
        const email=data.user?.email||loginEm.toLowerCase().trim();
        setAuthToken(data.access_token);
        setAuthEmail(email);
        setUserPrefix(email);
        try{localStorage.setItem("signalis_authToken",JSON.stringify(data.access_token));localStorage.setItem("signalis_authEmail",JSON.stringify(email))}catch(e){}
        setLoginErr(false);loadDB(email);setStep("select");
      }else{
        // If Supabase Auth fails, try legacy login
        if(loginEm.toLowerCase().trim()==="asprevel@gmail.com"&&loginPw==="3Oct2005"){
          setAuthEmail("asprevel@gmail.com");setUserPrefix("asprevel@gmail.com");
          try{localStorage.setItem("signalis_authEmail",JSON.stringify("asprevel@gmail.com"))}catch(e){};
          setLoginErr(false);loadDB("asprevel@gmail.com");setStep("select");
        }else{
          setLoginErr(true);
        }
      }
    }catch(e){
      // Offline fallback: legacy login
      if(loginEm.toLowerCase().trim()==="asprevel@gmail.com"&&loginPw==="3Oct2005"){
        setAuthEmail("asprevel@gmail.com");setUserPrefix("asprevel@gmail.com");
        try{localStorage.setItem("signalis_authEmail",JSON.stringify("asprevel@gmail.com"))}catch(e){};
        setLoginErr(false);loadDB("asprevel@gmail.com");setStep("select");
      }else{setLoginErr(true)}
    }
    setLoginLoading(false);
  };

  const[accessRequested,setAccessRequested]=useState(false);
  const[pendingRequests,setPendingRequests]=useState([]);
  const[approvedPwd,setApprovedPwd]=useState(null);
  const isAdmin=authEmail?.toLowerCase()==="jmlemoineperso@gmail.com";

  // ── Activity logging ──
  const logActivity=useCallback(async(action,detail="")=>{
    if(!sbOk||!authEmail)return;
    try{await sbFetch("user_activity","POST",{user_email:authEmail,action,detail:detail.substring(0,500),created_at:new Date().toISOString()})}catch(e){}
  },[authEmail]);

  // ── Tickets ──
  const[showTicket,setShowTicket]=useState(false);
  const[showExport,setShowExport]=useState(false);
  const[showGuide,setShowGuide]=useState(false);
  const[pendingUpdates,setPendingUpdates]=useState([]);
  const[showPending,setShowPending]=useState(false);
  const[guideSection,setGuideSection]=useState(0);
  const[expFormat,setExpFormat]=useState("csv");
  const[expType,setExpType]=useState("signals");
  const[expDateFrom,setExpDateFrom]=useState("");
  const[expDateTo,setExpDateTo]=useState("");
  const[expCompany,setExpCompany]=useState("");
  const[expCat,setExpCat]=useState("");
  const[expLine,setExpLine]=useState("");
  const[ticketText,setTicketText]=useState("");
  const[ticketImg,setTicketImg]=useState(null);
  const[ticketSending,setTicketSending]=useState(false);
  const[adminLogs,setAdminLogs]=useState([]);
  const[adminTickets,setAdminTickets]=useState([]);

  const submitTicket=async()=>{
    if(!ticketText.trim())return;
    setTicketSending(true);
    try{
      await sbFetch("tickets","POST",{
        user_email:authEmail,
        message:ticketText.trim(),
        screenshot:ticketImg,
        status:"open",
        created_at:new Date().toISOString()
      });
      setTicketText("");setTicketImg(null);setShowTicket(false);
      showT(lang==="fr"?"Ticket envoyé !":"Ticket sent!");
      logActivity("ticket","Ticket soumis");
    }catch(e){showT(lang==="fr"?"Erreur":"Error")}
    setTicketSending(false);
  };

  const handleTicketImg=(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>2*1024*1024){showT(lang==="fr"?"Image trop lourde (max 2Mo)":"Image too large (max 2MB)");return}
    const reader=new FileReader();
    reader.onload=(ev)=>setTicketImg(ev.target?.result);
    reader.readAsDataURL(file);
  };

  // ── Export data ──
  const doExport=()=>{
    let data=[];
    const watched=cos.filter(c=>c.prio);
    const allSigList=[...liveSigs];

    // Filter signals
    if(expType==="signals"||expType==="all"){
      let sigs=[...allSigList];
      if(expCompany)sigs=sigs.filter(s=>(s.company||"").toLowerCase().includes(expCompany.toLowerCase()));
      if(expCat)sigs=sigs.filter(s=>s.cat===expCat);
      if(expLine)sigs=sigs.filter(s=>(s._impacts||[]).some(i=>(i.line||"").includes(expLine)));
      if(expDateFrom)sigs=sigs.filter(s=>new Date(s.at)>=new Date(expDateFrom));
      if(expDateTo)sigs=sigs.filter(s=>new Date(s.at)<=new Date(expDateTo+"T23:59:59"));
      data.push(...sigs.map(s=>({type:"Signal",date:s.at?new Date(s.at).toLocaleDateString("fr-FR"):"",company:s.company||"",title:tx(s.title,lang),summary:tx(s.sum,lang),source:tx(s.src,lang),category:getCat(s.cat,lang)?.label||s.cat||"",importance:s.imp||50,confidence:s.conf||50,lines:(s._impacts||[]).map(i=>lineLbl(i.line,lang)).join(", ")})));
    }
    if(expType==="notes"||expType==="all"){
      let ns=[...notes];
      if(expCompany)ns=ns.filter(n=>{const co=cos.find(c=>c.id===n.cid);return co&&co.name.toLowerCase().includes(expCompany.toLowerCase())});
      if(expDateFrom)ns=ns.filter(n=>new Date(n.at)>=new Date(expDateFrom));
      if(expDateTo)ns=ns.filter(n=>new Date(n.at)<=new Date(expDateTo+"T23:59:59"));
      data.push(...ns.map(n=>{const co=cos.find(c=>c.id===n.cid);return{type:"Note",date:n.at?new Date(n.at).toLocaleDateString("fr-FR"):"",company:co?.name||"",title:typeof n.text==="object"?tx(n.text,lang):n.text,summary:"",source:"",category:n.tag||"",importance:"",confidence:"",lines:""}}));
    }
    if(expType==="watchlist"||expType==="all"){
      let wl=[...watched];
      if(expCompany)wl=wl.filter(c=>c.name.toLowerCase().includes(expCompany.toLowerCase()));
      data.push(...wl.map(c=>{const dos=getDossier(c.id);return{type:"Watchlist",date:"",company:c.name,title:tx(c.sector,lang),summary:dos?.broker||"",source:dos?.rm||"",category:dos?.renewal||"",importance:c.risk||50,confidence:getSigs(c.id).length,lines:getLinesAll(getSigs(c.id)).map(l=>lineLbl(l,lang)).join(", ")}}));
    }

    if(data.length===0){showT(lang==="fr"?"Aucune donnée à exporter":"No data to export");return}

    if(expFormat==="csv"){
      const headers=["Type","Date","Entreprise","Titre","Résumé","Source","Catégorie","Importance","Confiance","Lignes"];
      const rows=data.map(d=>headers.map(h=>{const map={Type:d.type,Date:d.date,Entreprise:d.company,Titre:d.title,Résumé:d.summary,Source:d.source,Catégorie:d.category,Importance:d.importance,Confiance:d.confidence,Lignes:d.lines};const v=String(map[h]||"");return'"'+v.replace(/"/g,'""')+'"'}).join(","));
      const csv="\uFEFF"+headers.join(",")+"\n"+rows.join("\n");
      const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=`AIG_Lines_Intelligence_${expType}_${new Date().toISOString().split("T")[0]}.csv`;a.click();
      URL.revokeObjectURL(url);
    }else{
      // PDF via print
      const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>AIG Lines Intelligence — Export</title><style>body{font-family:Segoe UI,sans-serif;padding:40px;color:#263348}h1{color:#002B5C;font-size:20px;border-bottom:2px solid #002B5C;padding-bottom:8px}h2{color:#0072CE;font-size:14px;margin-top:20px}.meta{font-size:11px;color:#7D8A9A;margin-bottom:20px}table{width:100%;border-collapse:collapse;font-size:11px;margin-top:10px}th{background:#002B5C;color:#fff;padding:6px 8px;text-align:left}td{padding:5px 8px;border-bottom:1px solid #E2E6EB}tr:nth-child(even){background:#FAFBFC}.footer{margin-top:30px;text-align:center;font-size:10px;color:#A8B1BD}</style></head><body><h1>AIG — Lines Intelligence</h1><p class="meta">Export ${expType} — ${new Date().toLocaleDateString("fr-FR")}${expCompany?" — "+expCompany:""}${expCat?" — "+getCat(expCat,lang)?.label:""}${expDateFrom?" — Du "+expDateFrom:""}</p><table><thead><tr><th>Type</th><th>Date</th><th>Entreprise</th><th>Titre</th><th>Catégorie</th><th>Imp.</th><th>Lignes</th></tr></thead><tbody>${data.map(d=>"<tr><td>"+d.type+"</td><td>"+d.date+"</td><td>"+d.company+"</td><td>"+(d.title||"").substring(0,80)+"</td><td>"+d.category+"</td><td>"+d.importance+"</td><td>"+d.lines+"</td></tr>").join("")}</tbody></table><p class="footer">© 2026 AIG — Lines Intelligence · ${data.length} enregistrements</p></body></html>`;
      const w=window.open("","_blank");if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),500)}
    }
    showT(lang==="fr"?`${data.length} enregistrements exportés`:`${data.length} records exported`);
    logActivity("export",`${expType} ${expFormat} (${data.length})`);
    setShowExport(false);
  };

  const loadAdminLogs=async()=>{
    const logs=await sbFetch("user_activity","GET",null,"?order=created_at.desc&limit=50");
    if(logs)setAdminLogs(logs);
  };
  const loadAdminTickets=async()=>{
    const tix=await sbFetch("tickets","GET",null,"?order=created_at.desc&limit=30");
    if(tix)setAdminTickets(tix);
  };

  // ── Admin ticket alarm (polls every 30s, plays alarm until dismissed) ──
  const[ticketAlarm,setTicketAlarm]=useState(null);
  const lastTicketCount=useRef(0);
  const alarmAudioRef=useRef(null);

  const playAlarm=useCallback(()=>{
    try{
      const ctx=new (window.AudioContext||window.webkitAudioContext)();
      const playTone=()=>{
        if(!alarmAudioRef.current)return;
        const osc=ctx.createOscillator();
        const gain=ctx.createGain();
        osc.connect(gain);gain.connect(ctx.destination);
        osc.type="square";
        osc.frequency.setValueAtTime(880,ctx.currentTime);
        osc.frequency.setValueAtTime(660,ctx.currentTime+0.15);
        osc.frequency.setValueAtTime(880,ctx.currentTime+0.3);
        gain.gain.setValueAtTime(0.3,ctx.currentTime);
        gain.gain.setValueAtTime(0,ctx.currentTime+0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime+0.5);
        if(alarmAudioRef.current)setTimeout(playTone,800);
      };
      alarmAudioRef.current=ctx;
      playTone();
      // Vibrate pattern (if supported)
      if(navigator.vibrate)navigator.vibrate([500,300,500,300,500,300,500,300,500]);
    }catch(e){}
  },[]);

  const stopAlarm=useCallback(()=>{
    if(alarmAudioRef.current){
      try{alarmAudioRef.current.close()}catch(e){}
      alarmAudioRef.current=null;
    }
    if(navigator.vibrate)navigator.vibrate(0);
    setTicketAlarm(null);
  },[]);

  // Poll for new tickets (admin only, every 30s)
  useEffect(()=>{
    if(!isAdmin||step!=="app")return;
    const poll=async()=>{
      try{
        const openTix=await sbFetch("tickets","GET",null,"?status=eq.open&order=created_at.desc&limit=5");
        if(!openTix)return;
        if(lastTicketCount.current>0&&openTix.length>lastTicketCount.current){
          // New ticket detected!
          const newest=openTix[0];
          setTicketAlarm(newest);
          playAlarm();
          // Also push notification
          if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
            new Notification("AIG Lines Intelligence — Ticket",{body:`${newest.user_email}: ${newest.message?.substring(0,100)}`,icon:"/icon-192.png",tag:"ticket-"+newest.id,requireInteraction:true});
          }
        }
        lastTicketCount.current=openTix.length;
      }catch(e){}
    };
    poll();
    const interval=setInterval(poll,30000);
    return()=>clearInterval(interval);
  },[isAdmin,step,playAlarm]);
  const closeTicket=async(id)=>{
    await sbFetch("tickets","PATCH",{status:"closed"},`?id=eq.${id}`);
    setAdminTickets(prev=>prev.map(t=>t.id===id?{...t,status:"closed"}:t));
    showT(lang==="fr"?"Ticket fermé":"Ticket closed");
  };

  const loadPendingRequests=useCallback(async()=>{
    if(!isAdmin||!sbOk)return;
    const reqs=await sbFetch("access_requests","GET",null,"?status=eq.pending&order=requested_at.desc");
    if(reqs)setPendingRequests(reqs);
  },[isAdmin]);

  const approveRequest=async(email)=>{
    const pwd=Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,4).toUpperCase()+"!";
    try{
      const res=await fetch(`${SB_URL}/auth/v1/signup`,{
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SB_KEY},
        body:JSON.stringify({email:email.toLowerCase().trim(),password:pwd})
      });
      if(res.ok){
        await sbFetch("access_requests","PATCH",{status:"approved"},`?email=eq.${encodeURIComponent(email)}`);
        setPendingRequests(prev=>prev.filter(r=>r.email!==email));
        setApprovedPwd({email,pwd});
        showT(lang==="fr"?`Compte créé pour ${email}`:`Account created for ${email}`);
      }else{
        const err=await res.json();
        showT(err.error_description||err.msg||(lang==="fr"?"Erreur":"Error"));
      }
    }catch(e){showT(lang==="fr"?"Erreur réseau":"Network error")}
  };

  const rejectRequest=async(email)=>{
    await sbFetch("access_requests","PATCH",{status:"rejected"},`?email=eq.${encodeURIComponent(email)}`);
    setPendingRequests(prev=>prev.filter(r=>r.email!==email));
    showT(lang==="fr"?"Demande refusée":"Request rejected");
  };
  const requestAccess=async()=>{
    if(!loginEm||!loginEm.includes("@"))return;
    setLoginLoading(true);
    try{
      // Save request to Supabase
      await sbFetch("access_requests","POST",{
        email:loginEm.toLowerCase().trim(),
        requested_at:new Date().toISOString(),
        status:"pending"
      });
      // Open mailto to notify admin
      const subject=encodeURIComponent("AIG Lines Intelligence — Demande d'accès");
      const body=encodeURIComponent(`Nouvelle demande d'accès à AIG Lines Intelligence.\n\nEmail : ${loginEm}\nDate : ${new Date().toLocaleString("fr-FR")}\n\nPour autoriser cet utilisateur :\n1. Va sur https://supabase.com/dashboard → SIGNALIS → Authentication → Add user\n2. Email : ${loginEm}\n3. Mot de passe temporaire\n4. Auto Confirm → Save`);
      window.open(`mailto:jmlemoineperso@gmail.com?subject=${subject}&body=${body}`,"_self");
      setAccessRequested(true);
      showT(lang==="fr"?"Demande envoyée !":"Request sent!");
    }catch(e){
      showT(lang==="fr"?"Erreur, réessayez":"Error, try again");
    }
    setLoginLoading(false);
  };

  const logout=()=>{
    setAuthToken(null);setAuthEmail("");setStep("login");
    try{localStorage.removeItem("signalis_authToken");localStorage.removeItem("signalis_authEmail");localStorage.removeItem("signalis_step")}catch(e){}
    _lsPrefix="signalis_";
  };
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
  const USER_EMAIL=authEmail||"asprevel@gmail.com";

  const loadDB=useCallback(async(email)=>{
    const ue=email||authEmail||"asprevel@gmail.com";
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
      // Charge les dossiers clients depuis Supabase (sync multi-appareils)
      const dbDossiers=await sbFetch("client_dossiers","GET",null,`?user_email=eq.${encodeURIComponent(USER_EMAIL)}`);
      if(dbDossiers&&dbDossiers.length>0){
        const mappedDos={};
        dbDossiers.forEach(d=>{if(d.company_id&&d.data)mappedDos[d.company_id]=d.data});
        setClientDossiers(prev=>{
          // Merge : Supabase a priorité sur localStorage (source de vérité)
          const merged={...prev,...mappedDos};
          try{lsSet("clientDossiers",merged)}catch(e){}
          return merged;
        });
      }
      const liveDb=await sbFetch("live_signals","GET",null,`?order=fetched_at.desc&limit=500`);
      if(liveDb&&liveDb.length>0){
        const mapped=liveDb.map(s=>({id:s.id,cid:s.company_id,company:s.company_name||"",title:{en:s.title_en||"",fr:s.title_fr||""},sum:{en:s.summary_en||"",fr:s.summary_fr||""},src:s.source_name||"Web",url:s.source_url||null,img:s.image_url||null,at:s.fetched_at,cat:s.category||"governance",fact:s.factuality||"needs_review",imp:s.importance||50,conf:s.confidence||50,live:true,_impacts:s.impacts||[]}));
        const seen=new Set();const deduped=mapped.filter(s=>{const t=(s.title?.en||"").toLowerCase().trim();if(!t||seen.has(t))return false;seen.add(t);return true});
        setLiveSigs(deduped);
      }
      setDbLoaded(true);
    }catch(e){console.error("DB load error:",e);setDbLoaded(true)}
  },[]);

  // ── LIVE POLLING — rafraîchit les signaux toutes les 30 secondes ──
  useEffect(()=>{
    if(!sbOk||!dbLoaded)return;
    const poll=async()=>{
      try{
        const liveDb=await sbFetch("live_signals","GET",null,`?order=fetched_at.desc&limit=500`);
        if(liveDb&&liveDb.length>0){
          const mapped=liveDb.map(s=>({id:s.id,cid:s.company_id,company:s.company_name||"",title:{en:s.title_en||"",fr:s.title_fr||""},sum:{en:s.summary_en||"",fr:s.summary_fr||""},src:s.source_name||"Web",url:s.source_url||null,img:s.image_url||null,at:s.fetched_at,cat:s.category||"governance",fact:s.factuality||"needs_review",imp:s.importance||50,conf:s.confidence||50,live:true,_impacts:s.impacts||[]}));
          const seen=new Set();const deduped=mapped.filter(s=>{const t=(s.title?.en||"").toLowerCase().trim();if(!t||seen.has(t))return false;seen.add(t);return true});
          setLiveSigs(prev=>{
            if(deduped.length===prev.length&&deduped[0]?.id===prev[0]?.id)return prev;
            setLastRefresh(new Date().toISOString());
            return deduped;
          });
        }
      }catch(e){}
    };
    const iv=setInterval(poll,30000);
    return()=>clearInterval(iv);
  },[sbOk,dbLoaded]);

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
  const[showBriefHist,setSBH]=useState(false);
  const[meetings,setMeetings]=useState(()=>lsGet("meetings",[]));
  const[showNewMeeting,setSNM]=useState(false);
  const[mtgCo,setMtgCo]=useState("");
  const[mtgDate,setMtgDate]=useState("");
  const[mtgType,setMtgType]=useState("broker");
  const[mtgNotes,setMtgNotes]=useState("");
  const[mtgContactName,setMtgCN]=useState("");
  const[mtgContactPhone,setMtgCP]=useState("");
  const[mtgContactEmail,setMtgCE]=useState("");
  const[mtgContactRole,setMtgCR]=useState("");
  const[mtgDictating,setMtgDictating]=useState(false);
  const mtgDictRef=useRef(null);
  const startMtgDict=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){showT(lang==="fr"?"Dictée non supportée":"Dictation not supported");return}
    const r=new SR();r.lang=lang==="fr"?"fr-FR":"en-US";r.continuous=true;r.interimResults=false;
    r.onresult=(e)=>{const t=Array.from(e.results).slice(e.resultIndex).map(r=>r[0].transcript).join(" ");setMtgNotes(p=>p+(p?" ":"")+t)};
    r.onend=()=>{if(mtgDictating)try{r.start()}catch(e){}};
    r.start();mtgDictRef.current=r;setMtgDictating(true);
  },[lang,mtgDictating]);
  const stopMtgDict=useCallback(()=>{if(mtgDictRef.current){mtgDictRef.current.onend=null;mtgDictRef.current.stop();mtgDictRef.current=null}setMtgDictating(false);
    setMtgNotes(p=>{const cleaned=p.trim().replace(/\s+/g," ").replace(/ ([.,;:!?])/g,"$1");const sentences=cleaned.replace(/([.!?])\s+/g,"$1\n").split("\n").map(s=>s.trim()).filter(Boolean).map(s=>s.charAt(0).toUpperCase()+s.slice(1));return sentences.join(". ").replace(/\.\./g,".")});
  },[]);
  const[contacts,setContacts]=useState(()=>lsGet("contacts",[]));
  const[briefHistory,setBriefHistory]=useState(()=>lsGet("briefHistory",[]));
  const[clientDossiers,setClientDossiers]=useState(()=>lsGet("clientDossiers",{}));
  const[editingDossier,setEditingDossier]=useState(null);
  // Ref miroir pour accès synchrone depuis le handler WebSocket (qui a [] comme deps)
  const editingDossierRef=useRef(null);
  useEffect(()=>{editingDossierRef.current=editingDossier},[editingDossier]);
  const[brokerOpen,setBrokerOpen]=useState(false);
  const[dossierDraft,setDossierDraft]=useState({broker:"",rm:"",rmLastName:"",rmFirstName:"",rmPhone:"",rmMobile:"",rmEmail:"",renewal:"",premium:"",program:"",sinistres:"",context:"",programLines:[],contacts:[]});
  const defaultDossier={broker:"",rm:"",rmLastName:"",rmFirstName:"",rmPhone:"",rmMobile:"",rmEmail:"",renewal:"",premium:"",program:"",sinistres:"",context:"",programLines:[],contacts:[]};
  const[dossierFiles,setDossierFiles]=useState(()=>lsGet("dossierFiles",{}));
  const fileInputRef=useRef(null);
  const openDossier=(cid)=>{const d=clientDossiers[cid]||defaultDossier;setDossierDraft({...defaultDossier,...d});setEditingDossier(cid)};
  const saveDossier=()=>{if(!editingDossier)return;setClientDossiers(prev=>{const n={...prev,[editingDossier]:{...dossierDraft,updatedAt:new Date().toISOString()}};lsSet("clientDossiers",n);if(sbOk)sbFetch("client_dossiers","POST",{id:editingDossier,user_email:USER_EMAIL,company_id:editingDossier,data:n[editingDossier]}).catch(()=>{});return n});setEditingDossier(null);showT(lang==="fr"?"Dossier sauvegardé":"Dossier saved");logActivity("dossier_save","Dossier mis à jour")};
  const handleFileUpload=(e)=>{
    const files=Array.from(e.target.files||[]);if(!files.length||!editingDossier)return;
    const maxSize=5*1024*1024;
    files.forEach(file=>{
      if(file.size>maxSize){showT(lang==="fr"?"Fichier trop volumineux (max 5Mo)":"File too large (max 5MB)");return}
      const reader=new FileReader();
      reader.onload=(ev)=>{
        const entry={id:"f"+Date.now()+Math.random().toString(36).slice(2,6),name:file.name,size:file.size,type:file.type,data:ev.target.result,uploadedAt:new Date().toISOString()};
        setDossierFiles(prev=>{const n={...prev};if(!n[editingDossier])n[editingDossier]=[];n[editingDossier]=[entry,...n[editingDossier]];lsSet("dossierFiles",n);return n});
        showT(lang==="fr"?file.name+" ajouté":"Added "+file.name);
      };
      reader.readAsDataURL(file);
    });
    if(e.target)e.target.value="";
  };
  const deleteFile=(cid,fid)=>{setDossierFiles(prev=>{const n={...prev};if(n[cid])n[cid]=n[cid].filter(f=>f.id!==fid);lsSet("dossierFiles",n);return n});showT(lang==="fr"?"Fichier supprimé":"File deleted")};
  const downloadFile=(f)=>{const a=document.createElement("a");a.href=f.data;a.download=f.name;a.click()};
  const fmtSize=(b)=>b<1024?b+"B":b<1048576?Math.round(b/1024)+"Ko":Math.round(b/1048576*10)/10+"Mo";
  const fileIcon=(name)=>{const ext=(name||"").split(".").pop().toLowerCase();if(["pdf"].includes(ext))return "PDF";if(["xlsx","xls","csv"].includes(ext))return "XLS";if(["doc","docx"].includes(ext))return "DOC";if(["png","jpg","jpeg","gif"].includes(ext))return "IMG";if(["txt"].includes(ext))return "TXT";return "DOC"};
  const fileIconColor=(name)=>{const ext=(name||"").split(".").pop().toLowerCase();if(["pdf"].includes(ext))return {bg:"#FEF2F2",tx:"#991B1B"};if(["xlsx","xls","csv"].includes(ext))return {bg:"#F0FDF4",tx:"#166534"};if(["doc","docx"].includes(ext))return {bg:"#EFF6FF",tx:"#1E40AF"};if(["png","jpg","jpeg","gif"].includes(ext))return {bg:"#FFFBEB",tx:"#92400E"};return {bg:"#F3F4F6",tx:"#374151"}};
  const getDossier=(cid)=>clientDossiers[cid]||null;
  const saveBrief=(cid,content)=>{const co=cos.find(c=>c.id===cid);setBriefHistory(prev=>{const n=[{id:`br${Date.now()}`,cid,company:co?.name||"",date:new Date().toISOString(),signalCount:getSigs(cid).length,lines:getLinesAll(getSigs(cid)),risk:co?.risk||50,preview:content.slice(0,200)},...prev].slice(0,100);lsSet("briefHistory",n);return n})};
  const getBriefHistory=(cid)=>briefHistory.filter(b=>b.cid===cid);
  const getLastBriefDate=(cid)=>{const h=getBriefHistory(cid);return h.length>0?h[0].date:null};
  const getNewSignalsSinceLastBrief=(cid)=>{const lastDate=getLastBriefDate(cid);if(!lastDate)return[];return getSigs(cid).filter(s=>s.at&&new Date(s.at)>new Date(lastDate))};
  const[contactSuggestions,setCSugg]=useState([]);
  const searchContacts=(q)=>{if(!q||q.length<2){setCSugg([]);return}const ql=q.toLowerCase();setCSugg(contacts.filter(c=>c.name.toLowerCase().includes(ql)||c.email?.toLowerCase().includes(ql)||(c.company||"").toLowerCase().includes(ql)).slice(0,5))};
  const saveContact=(name,phone,email,role,company)=>{if(!name)return;setContacts(prev=>{const existing=prev.findIndex(c=>c.name.toLowerCase()===name.toLowerCase());const now=new Date().toISOString();if(existing>=0){const c={...prev[existing]};const changes=[];if(phone&&phone!==c.phone){changes.push({field:"phone",old:c.phone,new:phone,at:now});c.phone=phone}if(email&&email!==c.email){changes.push({field:"email",old:c.email,new:email,at:now});c.email=email}if(role&&role!==c.role){changes.push({field:"role",old:c.role,new:role,at:now});c.role=role}if(company&&company!==c.company){changes.push({field:"company",old:c.company,new:company,at:now});c.company=company}c.history=[...(c.history||[]),...changes];c.updatedAt=now;const n=[...prev];n[existing]=c;lsSet("contacts",n);return n}const n=[{id:`ct${Date.now()}`,name,phone,email,role,company,createdAt:now,updatedAt:now,history:[]},...prev];lsSet("contacts",n);return n})};
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
  const[showPresentation,setShowPresentation]=useState(null);
  const[analysisResult,setAnalysisResult]=useState(null);
  const[analysisLoading,setAnalysisLoading]=useState(false);
  const[showAnalysis,setShowAnalysis]=useState(false);

  const runAnalysis=async(cid)=>{
    const co=cos.find(c=>c.id===cid);if(!co)return;
    setAnalysisLoading(true);setShowAnalysis(true);setAnalysisResult(null);
    const sigs=getSigs(cid);
    const dos=getDossier(cid);
    const cn=getNotes(cid);
    const lines=getLinesAll(sigs);

    // ── Anonymization mapping ──
    const anonMap={};const deAnonMap={};let idx=1;
    const anon=(real,prefix)=>{if(!real||real==="N/A")return real;const key=real.trim();if(anonMap[key])return anonMap[key];const code=prefix+"-"+String.fromCharCode(64+idx);idx++;anonMap[key]=code;deAnonMap[code]=key;return code};
    const anonCo=anon(co.name,"ENTREPRISE");
    const anonBroker=dos?.broker?anon(dos.broker,"COURTIER"):null;
    const anonRm=dos?.rm?anon(dos.rm,"CONTACT"):null;
    const insurers=[...new Set((dos?.programLines||[]).flatMap(p=>(p.layers||[]).map(l=>l.insurer)).filter(Boolean))];
    insurers.forEach((ins,i)=>anon(ins,"ASSUREUR"));
    const contacts=(dos?.contacts||[]).filter(c=>c.name);
    contacts.forEach(c=>anon(c.name,"PERSONNE"));

    // ── Build anonymized prompt ──
    const anonProgram=(dos?.programLines||[]).map(p=>p.line+": "+(p.layers||[]).map(l=>(anonMap[l.insurer]||l.insurer)+" "+l.from+"-"+l.to+"M\u20ac ("+(l.share||100)+"%)").join(", ")).join("\n");
    const anonSigs=sigs.slice(0,15).map(s=>"- ["+(s.imp||50)+"] "+tx(s.title,lang)+" ("+tx(s.src,lang)+", "+(s.at?new Date(s.at).toLocaleDateString("fr-FR"):"")+")" ).join("\n");
    const anonNotes=cn.slice(0,5).map(n=>"- ["+n.tag+"] "+(typeof n.text==="object"?tx(n.text,lang):n.text)).join("\n");

    const prompt=`Tu es un expert senior en assurance grandes entreprises. Tu analyses une entreprise pour un Account Manager.
IMPORTANT: Les noms sont anonymisés. Utilise les codes fournis dans ta réponse.

ENTREPRISE: ${anonCo}
SECTEUR: ${tx(co.sector,lang)}
SIÈGE: ${co.hq||"Europe"}
CAPITALISATION: ${co.cap||"N/A"}
EFFECTIFS: ${co.emp||"N/A"}
SCORE DE RISQUE ACTUEL: ${co.risk||50}/100

DOSSIER CLIENT:
Courtier: ${anonBroker||"N/A"} | Risk Manager: ${anonRm||"N/A"} | Renouvellement: ${dos?.renewal||"N/A"} | Prime: ${dos?.premium||"N/A"} | Programme: ${dos?.program||"N/A"} | Sinistralité: ${dos?.sinistres||"N/A"} | Contexte: ${dos?.context||"N/A"}
${anonProgram?"STRUCTURE PROGRAMME:\n"+anonProgram:""}

SIGNAUX RÉCENTS (${sigs.length}):
${anonSigs}

LIGNES IMPACTÉES: ${lines.map(l=>lineLbl(l,lang)).join(", ")||"Aucune"}

NOTES INTERNES (${cn.length}):
${anonNotes}

Produis une ANALYSE STRATÉGIQUE STRUCTURÉE en JSON avec exactement cette structure:
{
  "past": {"title":"Rétrospective","period":"12 derniers mois","summary":"...(3-4 phrases)","key_events":["événement 1","événement 2","événement 3"],"risk_trajectory":"hausse|stable|baisse"},
  "present": {"title":"Situation actuelle","summary":"...(3-4 phrases)","risk_level":"critique|élevé|moyen|faible","strengths":["point fort 1","point fort 2"],"concerns":["préoccupation 1","préoccupation 2"],"policy_adequacy":"...(évaluation du programme en place)"},
  "scenarios":[
    {"name":"Scénario optimiste","probability":25,"description":"...(2-3 phrases)","impact_risk":-15,"impact_lines":{"do":"stable","cyber":"baisse"},"recommendation":"..."},
    {"name":"Scénario central","probability":50,"description":"...(2-3 phrases)","impact_risk":0,"impact_lines":{"do":"hausse modérée"},"recommendation":"..."},
    {"name":"Scénario pessimiste","probability":25,"description":"...(2-3 phrases)","impact_risk":20,"impact_lines":{"do":"hausse forte","cyber":"hausse"},"recommendation":"..."}
  ],
  "actions":["action prioritaire 1","action prioritaire 2","action prioritaire 3"],
  "commercial_angle":"...(angle pour le prochain rdv courtier/RM)"
}

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks.`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const text = (data.content || []).map(c => c.text || "").join("");
      const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      // ── De-anonymize: replace codes with real names ──
      let result = clean;
      for (const [code, real] of Object.entries(deAnonMap)) {
        result = result.split(code).join(real);
      }

      const parsed = JSON.parse(result);
      setAnalysisResult(parsed);
      logActivity("analysis", co.name + " — Analyse stratégique");
    } catch (e) {
      setAnalysisResult({ error: lang === "fr" ? "Erreur d'analyse. Réessayez." : "Analysis error. Try again." });
    }
    setAnalysisLoading(false);
  };
  const[brokerView,setBrokerView]=useState(false);
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
  const[fontScale,setFontScale]=useState(()=>lsGet("fontScale",1.1));
  const[ollamaUrl,setOllamaUrl]=useState(()=>lsGet("ollamaUrl","http://localhost:11434"));
  const[ollamaModel,setOllamaModel]=useState(()=>lsGet("ollamaModel","mistral"));
  const[ollamaEnabled,setOllamaEnabled]=useState(()=>lsGet("ollamaEnabled",true));
  const[enriching,setEnriching]=useState(false);
  const[scoreThresholds,setScoreThresholds]=useState(()=>lsGet("scoreThresholds",{critical:80,high:60,medium:40}));
  const defaultKeywords={
    critical:[
      // Fraude & Crime
      "fraude avérée","fraud confirmed","détournement de fonds","embezzlement","blanchiment","money laundering","corruption","pot-de-vin","bribery",
      // Cyber
      "ransomware","data breach","fuite de données","violation de données","cyber-attaque majeure",
      // Gouvernance
      "démission CEO","CEO resignation","révocation dirigeant","mise en examen","criminal charges","garde à vue","arrestation",
      // Juridique
      "class action","action de groupe","condamnation","criminal conviction","inculpation","indictment","perquisition","raid",
      // Financier
      "insolvabilité","insolvency","liquidation judiciaire","cessation de paiement","défaut de paiement","default","faillite","bankruptcy",
      // Compliance
      "whistleblower","lanceur d'alerte","violation RGPD","GDPR violation","sanction AMF","sanction SEC","délit d'initié","insider trading"
    ],
    high:[
      // Gouvernance
      "restructuration","restructuring","changement de direction","board shakeup","conflit d'intérêts","conflict of interest","gouvernance contestée",
      // Juridique
      "enquête","investigation","procès","lawsuit","litige","litigation","mise en demeure","plainte déposée","complaint filed","arbitrage","arbitration",
      // Régulateur
      "sanction","amende","fine","penalty","downgrade","avertissement régulateur","regulatory warning","non-conformité","non-compliance","rappel produit","product recall",
      // Financier
      "avertissement sur résultats","profit warning","perte nette","net loss","dette critique","credit watch","dégradation notation","rating downgrade",
      // RH & Social
      "licenciement massif","mass layoff","plan social","PSE","grève","strike","harcèlement","harassment","discrimination",
      // Cyber
      "cyber-attaque","hack","incident de sécurité","security incident","vulnérabilité critique",
      // M&A
      "OPA hostile","hostile takeover","rupture de contrat","contract breach","litige post-acquisition",
      // Environnement
      "pollution majeure","marée noire","oil spill","catastrophe industrielle","amende environnementale"
    ],
    medium:[
      // Financier
      "résultats trimestriels","quarterly results","chiffre d'affaires","revenue","bénéfice net","net profit","prévisions","guidance","dividende","dividend",
      // M&A
      "acquisition","merger","fusion","cession","divestiture","prise de participation","stake acquisition","joint venture","IPO","introduction en bourse",
      // Gouvernance
      "nomination","appointment","assemblée générale","AGM","vote des actionnaires","shareholder vote","nouveau CEO","new CEO","succession",
      // ESG & Compliance
      "ESG","RSE","CSR","compliance","conformité","audit","contrôle interne","internal control","rapport de durabilité","sustainability report",
      // Partenariat
      "partenariat","partnership","contrat majeur","major contract","accord commercial",
      // Rating
      "rating","notation","outlook stable","perspective positive","upgrade"
    ],
    low:[
      // Communication
      "communiqué","press release","conférence","conference","événement","event","salon professionnel","trade show",
      // Marketing & Image
      "sponsoring","mécénat","prix","award","distinction","classement","ranking","certification",
      // Publications
      "rapport annuel","annual report","document de référence","lettre aux actionnaires",
      // RH positif
      "recrutement","hiring","formation","training","label employeur","great place to work",
      // Divers
      "innovation","brevet","patent","lancement produit","product launch","expansion","ouverture site"
    ]
  };
  const[scoreKeywords,setScoreKeywords]=useState(()=>lsGet("scoreKeywords",defaultKeywords));
  const[editingKwLevel,setEditingKwLevel]=useState(null);
  const[newKw,setNewKw]=useState("");
  const kwCatalog=[
    {cat:"D&O / Gouvernance",kws:["démission CEO","CEO resignation","révocation dirigeant","changement de direction","board shakeup","conflit d'intérêts","conflict of interest","gouvernance contestée","assemblée générale","AGM","vote des actionnaires","shareholder vote","nouveau CEO","succession","administrateur indépendant","conseil d'administration","mandat social","say on pay","rémunération excessive","golden parachute","cumul des mandats","abus de bien social","faute de gestion"]},
    {cat:"Fraude / Crime",kws:["fraude avérée","fraud confirmed","détournement de fonds","embezzlement","blanchiment","money laundering","corruption","pot-de-vin","bribery","abus de confiance","faux et usage de faux","escroquerie","extorsion","recel","délit d'initié","insider trading","manipulation de cours","falsification comptable","accounting fraud"]},
    {cat:"Cyber / Data",kws:["ransomware","data breach","fuite de données","violation de données","cyber-attaque majeure","cyber-attaque","hack","incident de sécurité","security incident","vulnérabilité critique","phishing","DDoS","violation RGPD","GDPR violation","vol de données","exfiltration","compromission","zero-day"]},
    {cat:"Juridique / Litiges",kws:["class action","action de groupe","condamnation","criminal conviction","inculpation","indictment","perquisition","raid","mise en examen","garde à vue","arrestation","procès","lawsuit","litige","litigation","mise en demeure","plainte déposée","complaint filed","arbitrage","arbitration","jugement","verdict","dommages et intérêts","appel","recours collectif"]},
    {cat:"Régulateur / Compliance",kws:["sanction AMF","sanction SEC","sanction ACPR","amende","fine","penalty","downgrade","avertissement régulateur","regulatory warning","non-conformité","non-compliance","rappel produit","product recall","lanceur d'alerte","whistleblower","contrôle ACPR","enquête AMF","infraction","suspension de cotation","interdiction"]},
    {cat:"Financier / Reporting",kws:["insolvabilité","insolvency","liquidation judiciaire","cessation de paiement","défaut de paiement","default","faillite","bankruptcy","avertissement sur résultats","profit warning","perte nette","net loss","dette critique","credit watch","dégradation notation","rating downgrade","résultats trimestriels","chiffre d'affaires","bénéfice net","dividende","prévisions","guidance","trésorerie","cash flow","endettement","leverage","covenant breach"]},
    {cat:"M&A / Transactions",kws:["acquisition","merger","fusion","cession","divestiture","prise de participation","stake acquisition","joint venture","IPO","introduction en bourse","OPA hostile","hostile takeover","rupture de contrat","litige post-acquisition","garantie de passif","W&I claim","earn-out","due diligence","closing","signing","offre publique","retrait de cote"]},
    {cat:"RH / EPL",kws:["licenciement massif","mass layoff","plan social","PSE","grève","strike","harcèlement","harassment","discrimination","harcèlement moral","harcèlement sexuel","prud'hommes","conditions de travail","accident du travail","burn-out","diversité","inclusion","droit du travail","représentants du personnel","CSE","syndicat"]},
    {cat:"ESG / Environnement",kws:["ESG","RSE","CSR","pollution majeure","marée noire","oil spill","catastrophe industrielle","amende environnementale","empreinte carbone","carbon footprint","taxonomie","biodiversité","devoir de vigilance","CSRD","rapport durabilité","sustainability report","greenwashing","transition énergétique","risque climatique","TCFD"]},
    {cat:"RCPro / E&O",kws:["erreur professionnelle","professional negligence","manquement","défaut de conseil","duty of care","responsabilité professionnelle","professional liability","faute professionnelle","malpractice","préjudice client","obligation de moyen","obligation de résultat"]},
    {cat:"Business / Général",kws:["partenariat","partnership","contrat majeur","major contract","accord commercial","rating","notation","upgrade","outlook","nomination","appointment","communiqué","press release","innovation","brevet","patent","lancement produit","expansion","recrutement","formation","certification"]}
  ];
  const allUsedKws=new Set(Object.values(scoreKeywords).flat().map(k=>k.toLowerCase()));
  const getKwSuggestions=(q)=>{const ql=(q||"").toLowerCase();return kwCatalog.flatMap(c=>c.kws.filter(k=>!allUsedKws.has(k.toLowerCase())&&(!ql||k.toLowerCase().includes(ql))).map(k=>({kw:k,cat:c.cat}))).slice(0,15)};
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
  const deleteN=(id)=>{setNotes(p=>p.filter(n=>n.id!==id));if(sbOk)sbFetch("notes","DELETE",null,`?id=eq.${encodeURIComponent(id)}`).catch(()=>{});showT(lang==="fr"?"Note supprimée":"Note deleted");logActivity("note_delete","Note supprimée")};

  // Meetings
  const addMeeting=()=>{if(mtgDictating)stopMtgDict();if(!mtgCo||!mtgDate)return;const co=cos.find(c=>c.id===mtgCo);const m={id:`mtg${Date.now()}`,cid:mtgCo,date:mtgDate,type:mtgType,notes:mtgNotes,createdAt:new Date().toISOString(),contact:mtgType==="autre"?{name:mtgContactName,phone:mtgContactPhone,email:mtgContactEmail,role:mtgContactRole}:null};if(mtgType==="autre"&&mtgContactName)saveContact(mtgContactName,mtgContactPhone,mtgContactEmail,mtgContactRole,co?.name||"");setMeetings(p=>{const n=[m,...p];lsSet("meetings",n);return n});setMtgCo("");setMtgDate("");setMtgType("broker");setMtgNotes("");setMtgCN("");setMtgCP("");setMtgCE("");setMtgCR("");setCSugg([]);setSNM(false);showT(t("meeting_saved"))};
  const deleteMeeting=(id)=>{setMeetings(p=>{const n=p.filter(m=>m.id!==id);lsSet("meetings",n);return n});showT(t("meeting_deleted"))};
  const exportICS=(mtg)=>{const co=cos.find(c=>c.id===mtg.cid);const name=co?.name||"Réunion";const d=new Date(mtg.date);const end=new Date(d.getTime()+3600000);const fmt=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");const summary=mtg.type==="broker"?"RDV Courtier":mtg.type==="rm"?"RDV RM":mtg.type==="autre"?`RDV ${mtg.contact?.name||""}`.trim():"Réunion interne";const desc=[mtg.notes,mtg.contact?`Contact: ${mtg.contact.name||""} ${mtg.contact.phone||""} ${mtg.contact.email||""}`.trim():null,"Préparé par AIG Lines Intelligence"].filter(Boolean).join("\\n");const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AIG-FL-Intelligence//FR\nBEGIN:VEVENT\nDTSTART:${fmt(d)}\nDTEND:${fmt(end)}\nSUMMARY:${summary} — ${name}\nDESCRIPTION:${desc}\nEND:VEVENT\nEND:VCALENDAR`;const blob=new Blob([ics],{type:"text/calendar"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`aigfl-${name.replace(/\s/g,"-")}.ics`;a.click();URL.revokeObjectURL(url)};
  const upcomingMtgs=meetings.filter(m=>new Date(m.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const pastMtgs=meetings.filter(m=>new Date(m.date)<new Date()).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const mtgLabel=(mtg)=>{const d=new Date(mtg.date);const now=new Date();const diff=Math.ceil((d-now)/(86400000));if(diff===0)return{l:t("today"),c:"#991B1B"};if(diff===1)return{l:t("tomorrow"),c:"#92400E"};if(diff>0)return{l:`${diff} ${t("days_left")}`,c:"#0072CE"};return{l:fD(mtg.date,lang),c:"var(--t5)"}};
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
    if(refreshing||!sbOk)return;
    setRefreshing(true);
    try{
      const liveDb=await sbFetch("live_signals","GET",null,`?order=fetched_at.desc&limit=500`);
      if(liveDb&&liveDb.length>0){
        const mapped=liveDb.map(s=>({id:s.id,cid:s.company_id,company:s.company_name||"",title:{en:s.title_en||"",fr:s.title_fr||""},sum:{en:s.summary_en||"",fr:s.summary_fr||""},src:s.source_name||"Web",url:s.source_url||null,img:s.image_url||null,at:s.fetched_at,cat:s.category||"governance",fact:s.factuality||"needs_review",imp:s.importance||50,conf:s.confidence||50,live:true,_impacts:s.impacts||[]}));
        const seen=new Set();const deduped=mapped.filter(s=>{const t=(s.title?.en||"").toLowerCase().trim();if(!t||seen.has(t))return false;seen.add(t);return true});
        const prevCount=liveSigs.length;
        setLiveSigs(deduped);
        setLastRefresh(new Date().toISOString());
        const newCount2=deduped.length-prevCount;
        if(newCount2>0){
          setNewCount(p=>{const n=p+newCount2;try{navigator.setAppBadge&&navigator.setAppBadge(n)}catch(e){}return n});
          // Push notification for critical signals
          const crits=deduped.filter(s=>s.imp>=scoreThresholds.critical);
          if(crits.length>0&&typeof Notification!=="undefined"&&Notification.permission==="granted"){
            const co=cos.find(c=>c.id===crits[0].cid);
            new Notification("AIG FL Intelligence",{body:`${lang==="fr"?"Signal critique":"Critical signal"}: ${co?.name||""} — ${tx(crits[0].title,lang)}`,icon:"/icon-192.png",badge:"/icon-192.png",tag:"aigfl-"+crits[0].id});
          }
          showT(lang==="fr"?`${deduped.length} signaux chargés (${newCount2} nouveaux)`:`${deduped.length} signals loaded (${newCount2} new)`);logActivity("refresh",`${deduped.length} signals loaded`);
        }else{
          showT(lang==="fr"?`${deduped.length} signaux à jour`:`${deduped.length} signals up to date`);
        }
        // Record risk snapshots
        const today=new Date().toISOString().split("T")[0];
        setRiskHistory(prev=>{const h={...prev};cos.filter(c=>c.prio).forEach(c=>{const sigs=deduped.filter(s=>s.cid===c.id);const sigCount=sigs.length;const avgImp=sigCount>0?sigs.reduce((a,s)=>a+(s.imp||50),0)/sigCount:0;const boost=Math.min(30,sigCount*5+Math.max(0,avgImp-50)*0.3);const score=Math.min(100,Math.round((c.risk||50)+boost));if(!h[c.id])h[c.id]=[];const last=h[c.id][h[c.id].length-1];if(!last||last.date!==today){h[c.id].push({date:today,score});if(h[c.id].length>30)h[c.id]=h[c.id].slice(-30)}else{h[c.id][h[c.id].length-1].score=Math.max(last.score,score)}});lsSet("riskHistory",h);return h});
      }else{
        setLastRefresh(new Date().toISOString());
        showT(lang==="fr"?"Aucun signal en base":"No signals in database");
      }
    }catch(e){console.error("Refresh error:",e);
      // Silencieux sur erreur intermittente (mobile, changement réseau).
      // N'affiche le toast qu'après 2 échecs consécutifs.
      const fails=(window.__aigRefreshFails||0)+1;
      window.__aigRefreshFails=fails;
      if(fails>=2){showT(lang==="fr"?"Connexion instable — retry en cours":"Unstable connection — retrying");}
    }
    // Reset compteur si succès
    if(refreshing===false)window.__aigRefreshFails=0;
    setRefreshing(false);
  },[cos,lang,refreshing,liveSigs.length,scoreThresholds]);

  // ── Supabase Realtime (instant signal delivery) ──
  const wsRef=useRef(null);
  const heartbeatRef=useRef(null);
  const wsReconnectRef=useRef(null);

  const connectRealtime=useCallback(()=>{
    if(!sbOk||wsRef.current)return;
    try{
      const wsUrl=SB_URL.replace("https://","wss://").replace("http://","ws://")+`/realtime/v1/websocket?apikey=${SB_KEY}&vsn=1.0.0`;
      const ws=new WebSocket(wsUrl);
      wsRef.current=ws;

      ws.onopen=()=>{
        // Join channel for live_signals table
        ws.send(JSON.stringify({
          topic:"realtime:public:live_signals",
          event:"phx_join",
          payload:{config:{broadcast:{self:false},presence:{key:""},postgres_changes:[{event:"INSERT",schema:"public",table:"live_signals"}]}},
          ref:"1"
        }));
        // Join channel for client_dossiers (INSERT + UPDATE + DELETE)
        ws.send(JSON.stringify({
          topic:"realtime:public:client_dossiers",
          event:"phx_join",
          payload:{config:{broadcast:{self:false},presence:{key:""},postgres_changes:[{event:"*",schema:"public",table:"client_dossiers"}]}},
          ref:"2"
        }));
        // Join channel for notes (INSERT + UPDATE + DELETE)
        ws.send(JSON.stringify({
          topic:"realtime:public:notes",
          event:"phx_join",
          payload:{config:{broadcast:{self:false},presence:{key:""},postgres_changes:[{event:"*",schema:"public",table:"notes"}]}},
          ref:"3"
        }));
        // Join channel for watchlist (INSERT + UPDATE + DELETE)
        ws.send(JSON.stringify({
          topic:"realtime:public:watchlist",
          event:"phx_join",
          payload:{config:{broadcast:{self:false},presence:{key:""},postgres_changes:[{event:"*",schema:"public",table:"watchlist"}]}},
          ref:"4"
        }));
        // Heartbeat every 30s
        heartbeatRef.current=setInterval(()=>{
          if(ws.readyState===WebSocket.OPEN){
            ws.send(JSON.stringify({topic:"phoenix",event:"heartbeat",payload:{},ref:String(Date.now())}));
          }
        },30000);
      };

      ws.onmessage=(ev)=>{
        try{
          const msg=JSON.parse(ev.data);
          if(msg.event==="postgres_changes"&&msg.payload?.data){
            const data=msg.payload.data;
            const rec=data.record;
            const oldRec=data.old_record;
            const table=data.table;
            const type=data.type; // INSERT | UPDATE | DELETE

            // ── LIVE_SIGNALS : INSERT only ──
            if(table==="live_signals"&&rec){
              const newSig={id:rec.id,cid:rec.company_id,company:rec.company_name||"",title:{en:rec.title_en||"",fr:rec.title_fr||""},sum:{en:rec.summary_en||"",fr:rec.summary_fr||""},src:rec.source_name||"Web",url:rec.source_url||null,img:rec.image_url||null,at:rec.fetched_at,cat:rec.category||"governance",fact:rec.factuality||"needs_review",imp:rec.importance||50,conf:rec.confidence||50,live:true,_impacts:rec.impacts||[]};
              setLiveSigs(prev=>{
                const t=(newSig.title?.en||"").toLowerCase().trim();
                if(prev.some(s=>(s.title?.en||"").toLowerCase().trim()===t))return prev;
                return[newSig,...prev];
              });
              setNewCount(p=>{const n=p+1;try{navigator.setAppBadge&&navigator.setAppBadge(n)}catch(e){}return n});
              if(rec.importance>=75&&typeof Notification!=="undefined"&&Notification.permission==="granted"){
                new Notification("AIG Lines Intelligence",{body:`${rec.company_name}: ${rec.title_fr||rec.title_en}`,icon:"/icon-192.png",tag:"sig-"+rec.id});
              }
            }

            // ── CLIENT_DOSSIERS : INSERT / UPDATE / DELETE ──
            if(table==="client_dossiers"){
              const cid=(rec?.company_id)||(oldRec?.company_id);
              if(cid){
                // Ne pas écraser si on édite actuellement ce dossier
                if(editingDossierRef.current===cid)return;
                setClientDossiers(prev=>{
                  const n={...prev};
                  if(type==="DELETE"){delete n[cid]}
                  else if(rec?.data){n[cid]=rec.data}
                  try{lsSet("clientDossiers",n)}catch(e){}
                  return n;
                });
              }
            }

            // ── NOTES : INSERT / UPDATE / DELETE ──
            if(table==="notes"){
              if(type==="DELETE"&&oldRec?.id){
                setNotes(prev=>prev.filter(n=>n.id!==oldRec.id));
              }else if(rec){
                const mapped={id:rec.id,cid:rec.company_id,text:rec.content,tag:rec.tag,at:rec.created_at};
                setNotes(prev=>{
                  const idx=prev.findIndex(n=>n.id===mapped.id);
                  if(idx>=0){const copy=[...prev];copy[idx]=mapped;return copy}
                  return[mapped,...prev];
                });
              }
            }

            // ── WATCHLIST : INSERT / UPDATE / DELETE ──
            if(table==="watchlist"){
              const cid=(rec?.company_id)||(oldRec?.company_id);
              if(cid){
                if(type==="DELETE"){
                  setCos(prev=>prev.map(c=>c.id===cid?{...c,prio:null}:c));
                }else if(rec){
                  setCos(prev=>{
                    const exists=prev.some(c=>c.id===cid);
                    if(exists)return prev.map(c=>c.id===cid?{...c,prio:rec.priority||"watch"}:c);
                    // Company not in state yet (added from another device) : add it
                    return[...prev,{id:rec.company_id,name:rec.company_name,sector:rec.company_sector||"—",hq:rec.company_hq||"—",ticker:rec.company_ticker,cap:rec.company_cap||"—",emp:rec.company_emp||"—",logo:rec.company_logo||(rec.company_name?rec.company_name[0]:"?"),risk:rec.company_risk||50,trend:rec.company_trend||"stable",prio:rec.priority||"watch"}];
                  });
                }
              }
            }
          }
        }catch(e){}
      };

      ws.onclose=()=>{
        wsRef.current=null;
        if(heartbeatRef.current)clearInterval(heartbeatRef.current);
        // Reconnect after 5s
        wsReconnectRef.current=setTimeout(connectRealtime,5000);
      };

      ws.onerror=()=>{ws.close()};
    }catch(e){}
  },[]);

  useEffect(()=>{
    if(step==="app"&&sbOk){
      connectRealtime();
      return()=>{
        if(wsRef.current)wsRef.current.close();
        if(heartbeatRef.current)clearInterval(heartbeatRef.current);
        if(wsReconnectRef.current)clearTimeout(wsReconnectRef.current);
        wsRef.current=null;
      };
    }
  },[step,connectRealtime]);

  // Fallback polling (every 2 min if realtime fails)
  const refreshRef=useRef(null);
  useEffect(()=>{
    if(autoRefresh&&step==="app"){
      refreshRef.current=setInterval(()=>refreshSignals(),120000);
      return ()=>clearInterval(refreshRef.current);
    }
  },[autoRefresh,step,refreshSignals]);

  // Auto-load DB if already logged in (page refresh)
  useEffect(()=>{
    if(step==="app"&&!dbLoaded)loadDB(authEmail);
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

  // ── Detect RM/management changes in signals → suggest updates ──
  const pendingChecked=useRef(false);
  useEffect(()=>{
    if(step!=="app"||pendingChecked.current||liveSigs.length===0)return;
    pendingChecked.current=true;
    const rmKeywords=["risk manager","directeur des risques","directrice des risques","chief risk officer","responsable gestion des risques","responsable des risques"];
    const dismissed=lsGet("dismissedUpdates")||[];
    const suggestions=[];
    const recent=liveSigs.filter(s=>{const age=(Date.now()-new Date(s.at).getTime())/86400000;return age<7});
    recent.forEach(s=>{
      if(dismissed.includes(s.id))return;
      const title=(tx(s.title,lang)||"").toLowerCase();
      const sum=(tx(s.sum,lang)||"").toLowerCase();
      const full=title+" "+sum;
      const hasRmKeyword=rmKeywords.some(kw=>full.includes(kw));
      if(!hasRmKeyword)return;
      const co=cos.find(c=>c.id===s.cid||((s.company||"").toLowerCase().includes(c.name.toLowerCase().split(" ")[0])));
      if(!co||!co.prio)return;
      // Only alert if dossier has a RM and the current RM name is NOT in the article
      const dos=getDossier(co.id);
      const currentRm=(dos?.rm||"").trim().toLowerCase();
      if(!currentRm)return; // No RM on file → nothing to compare
      // If current RM name appears in the article → same person, no change
      const rmParts=currentRm.split(" ").filter(p=>p.length>2);
      const currentRmInArticle=rmParts.length>0&&rmParts.every(part=>full.includes(part));
      if(currentRmInArticle)return; // Same RM mentioned → no change
      suggestions.push({id:s.id,company:co.name,cid:co.id,currentRm:dos.rm,title:tx(s.title,lang),summary:tx(s.sum,lang),source:tx(s.src,lang),date:s.at,type:"rm_change"});
    });
    if(suggestions.length>0){setPendingUpdates(suggestions);setShowPending(true)}
  },[step,liveSigs,cos,lang]);

  const dismissUpdate=(id)=>{
    const dismissed=lsGet("dismissedUpdates")||[];
    dismissed.push(id);
    lsSet("dismissedUpdates",dismissed);
    setPendingUpdates(prev=>prev.filter(u=>u.id!==id));
  };
  const acceptUpdate=(u)=>{
    setSC(u.cid);
    setTimeout(()=>openDossier(u.cid),300);
    dismissUpdate(u.id);
    setShowPending(false);
  };

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
  const liveImpacts=useMemo(()=>liveSigs.flatMap(s=>(s._impacts||[]).flatMap(i=>{const lines=(i.line||"").split("|").map(l=>l.trim()).filter(Boolean);if(lines.length<=1)return[{sid:s.id,line:i.line||"",lvl:i.level,why:i.why,angle:i.angle,vig:[],hyp:[]}];return lines.map(l=>({sid:s.id,line:l,lvl:i.level,why:i.why,angle:i.angle,vig:[],hyp:[]}))})),[liveSigs]);
  const getImpsAll=useCallback(sid=>{const stat=IMPACTS.filter(i=>i.sid===sid);const live=liveImpacts.filter(i=>i.sid===sid);return[...stat,...live]},[liveImpacts]);
  const getLinesAll=useCallback(sigs=>[...new Set(sigs.flatMap(s=>getImpsAll(s.id).flatMap(i=>(i.line||"").split("|").map(l=>l.trim()).filter(Boolean))))],[getImpsAll]);

  // getSigs and getNotes include live data
  const getSigs=useCallback(cid=>{
    const co=cos.find(c=>c.id===cid);
    const raw=allSignals.filter(s=>{
      if(s.cid===cid)return true;
      if(co&&s.company){
        const n=s.company.toLowerCase().trim();
        const coName=co.name.toLowerCase().trim();
        if(n===coName)return true;
        // Only match by first word if it's long enough to be unique
        const firstWord=coName.split(" ")[0];
        if(firstWord.length>=5&&n.includes(firstWord))return true;
      }
      return false;
    }).sort((a,b)=>(b.imp||0)-(a.imp||0));
    const seen=new Set();
    return raw.filter(s=>{const t=tx(s.title,"en").toLowerCase().trim();if(!t||seen.has(t))return false;seen.add(t);return true});
  },[allSignals,cos]);
  const getNotes=useCallback(cid=>notes.filter(n=>n.cid===cid).sort((a,b)=>new Date(b.at)-new Date(a.at)),[notes]);

  const filterSigs=useCallback(sigs=>{let s=[...sigs];if(activeCat)s=s.filter(x=>x.cat===activeCat);if(search){const q=search.toLowerCase();s=s.filter(x=>tx(x.title,lang).toLowerCase().includes(q)||tx(x.sum,lang).toLowerCase().includes(q))}const seen=new Set();s=s.filter(x=>{const t=tx(x.title,"en").toLowerCase().trim();if(!t||seen.has(t))return false;seen.add(t);return true});if(sortMode==="company"){return s.sort((a,b)=>{const ca=(a.company||"").toLowerCase();const cb=(b.company||"").toLowerCase();if(ca!==cb)return ca.localeCompare(cb);return(b.imp||0)-(a.imp||0)})}if(sortMode==="recent")return s.sort((a,b)=>new Date(b.at||0)-new Date(a.at||0));return s.sort((a,b)=>(b.imp||0)-(a.imp||0))},[activeCat,search,lang,sortMode]);
  const wlSigs=useMemo(()=>{
    const watchedIds=new Set(cos.filter(c=>c.prio).map(c=>c.id));
    const watchedNames=cos.filter(c=>c.prio).map(c=>({id:c.id,name:c.name.toLowerCase(),first:c.name.split(" ")[0].toLowerCase()}));
    const matched=allSignals.filter(s=>{
      if(s.cid&&watchedIds.has(s.cid))return true;
      if(s.company){
        const cn=s.company.toLowerCase();
        for(const w of watchedNames){
          if(cn===w.name||cn.includes(w.name)||w.name.includes(cn))return true;
          if(w.first.length>=5&&cn.includes(w.first))return true;
        }
      }
      return false;
    });
    return filterSigs(matched);
  },[cos,filterSigs,allSignals]);
  const allSigs=useMemo(()=>filterSigs(allSignals),[filterSigs,allSignals]);
  const digest=useMemo(()=>{
    const watchedIds=new Set(cos.filter(c=>c.prio).map(c=>c.id));
    const watchedNames=cos.filter(c=>c.prio).map(c=>c.name.toLowerCase());
    const ws=allSignals.filter(s=>{
      if(s.cid&&watchedIds.has(s.cid))return true;
      if(s.company){const cn=s.company.toLowerCase();for(const w of watchedNames){if(cn.includes(w)||w.includes(cn))return true}}
      return false;
    });
    return{total:ws.length,crit:ws.filter(s=>s.imp>=scoreThresholds.critical).length,comps:[...new Set(ws.map(s=>s.cid))].length};
  },[cos,allSignals,scoreThresholds]);
  const goTab=tb=>{setTab(tb);setSC(null);setSSh(false);setSrch("");setACat(null);setAS("");setExtRes([])};
  const fFull=()=>new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{weekday:"long",day:"numeric",month:"long"});
  const greeting=()=>{const h=new Date().getHours();return h<12?t("greeting_morning"):h<18?t("greeting_afternoon"):t("greeting_evening")};

  // ═══ SMART FEATURES ═══

  // ── Feature 1: Auto pre-meeting brief (meetings within 24h) ──
  const upcomingBriefs=useMemo(()=>{
    const now=Date.now();const h24=24*60*60*1000;
    return meetings.filter(m=>{const d=new Date(m.date).getTime();return d>now&&d-now<h24}).map(m=>{
      const co=cos.find(c=>c.id===m.cid);const sigs=getSigs(m.cid);const lines=getLinesAll(sigs);
      return{...m,co,sigs,lines,sigCount:sigs.length,critCount:sigs.filter(s=>(s.imp||0)>=scoreThresholds.critical).length};
    });
  },[meetings,cos,getSigs,getLinesAll,scoreThresholds]);

  // ── Feature 2: Commercial window detection (renewal date in dossier + recent signals) ──
  const commercialOpps=useMemo(()=>{
    const opps=[];const now=new Date();
    watched.forEach(co=>{
      const dossier=getDossier(co.id);
      if(!dossier?.renewal)return;
      const renewalDate=new Date(dossier.renewal);
      const daysUntil=Math.ceil((renewalDate-now)/(86400000));
      if(daysUntil<0||daysUntil>90)return;
      const sigs=getSigs(co.id);
      const recentCrit=sigs.filter(s=>(s.imp||0)>=scoreThresholds.high);
      if(recentCrit.length===0&&daysUntil>45)return;
      const impactedLines=getLinesAll(recentCrit);
      const urgency=daysUntil<=30?"critical":daysUntil<=60?"high":"medium";
      opps.push({co,dossier,daysUntil,recentCrit,impactedLines,urgency,renewalDate});
    });
    return opps.sort((a,b)=>a.daysUntil-b.daysUntil);
  },[watched,getDossier,getSigs,getLinesAll,scoreThresholds]);

  // ── Feature 3: Inactivity alerts (companies with no interaction >45 days) ──
  const inactivityAlerts=useMemo(()=>{
    const now=Date.now();const THRESHOLD=45*86400000;
    return watched.map(co=>{
      const coNotes=getNotes(co.id);
      const coMeetings=meetings.filter(m=>m.cid===co.id);
      const lastBrief=getLastBriefDate(co.id);
      const interactions=[
        ...coNotes.map(n=>new Date(n.at).getTime()),
        ...coMeetings.map(m=>new Date(m.createdAt||m.date).getTime()),
        lastBrief?new Date(lastBrief).getTime():0
      ].filter(Boolean);
      const lastInteraction=interactions.length>0?Math.max(...interactions):0;
      const daysSince=lastInteraction?Math.floor((now-lastInteraction)/86400000):0;
      if(daysSince<45&&lastInteraction>0)return null;
      if(!lastInteraction)return{co,daysSince:0,lastInteraction:0,noRecord:true};
      return{co,daysSince,lastInteraction,noRecord:false};
    }).filter(Boolean).sort((a,b)=>b.daysSince-a.daysSince);
  },[watched,getNotes,meetings,getLastBriefDate]);

  // ── Feature 4: Weekly summary ──
  const[showWeekly,setShowWeekly]=useState(false);
  const weeklyData=useMemo(()=>{
    const now=Date.now();const w7=7*86400000;
    const recentSigs=allSignals.filter(s=>{
      const co=cos.find(c=>c.id===s.cid);
      if(!co?.prio)return false;
      const sigDate=s.at?new Date(s.at).getTime():0;
      return now-sigDate<w7;
    });
    const byCo={};recentSigs.forEach(s=>{
      const co=cos.find(c=>c.id===s.cid);
      const name=co?.name||s.company||"Unknown";
      if(!byCo[name])byCo[name]={signals:[],crit:0};
      byCo[name].signals.push(s);
      if((s.imp||0)>=scoreThresholds.critical)byCo[name].crit++;
    });
    const byCat={};recentSigs.forEach(s=>{byCat[s.cat]=(byCat[s.cat]||0)+1});
    const byLine={};recentSigs.forEach(s=>{getImpsAll(s.id).forEach(i=>{(i.line||"").split("|").map(l=>l.trim()).filter(Boolean).forEach(l=>{byLine[l]=(byLine[l]||0)+1})})});
    return{total:recentSigs.length,crit:recentSigs.filter(s=>(s.imp||0)>=scoreThresholds.critical).length,byCo,byCat,byLine,meetingsThisWeek:meetings.filter(m=>{const d=new Date(m.date).getTime();return d>now-w7&&d<now+w7}).length};
  },[allSignals,cos,scoreThresholds,meetings,getImpsAll]);

  const copyWeekly=()=>{
    const lines=[];
    lines.push(`RÉSUMÉ HEBDOMADAIRE — AIG FL INTELLIGENCE`);
    lines.push(`Semaine du ${new Date(Date.now()-7*86400000).toLocaleDateString("fr-FR")} au ${new Date().toLocaleDateString("fr-FR")}`);
    lines.push(``);
    lines.push(`${weeklyData.total} signaux détectés dont ${weeklyData.crit} critique(s)`);
    lines.push(`${weeklyData.meetingsThisWeek} réunion(s) cette semaine`);
    lines.push(``);
    lines.push(`SIGNAUX PAR ENTREPRISE :`);
    Object.entries(weeklyData.byCo).sort((a,b)=>b[1].signals.length-a[1].signals.length).forEach(([name,data])=>{
      lines.push(`  • ${name}: ${data.signals.length} signal(s)${data.crit>0?` (${data.crit} critique(s))`:""}`);
    });
    lines.push(``);
    lines.push(`LIGNES FL IMPACTÉES :`);
    Object.entries(weeklyData.byLine).sort((a,b)=>b[1]-a[1]).forEach(([l,n])=>{
      lines.push(`  • ${lineLbl(l,lang)}: ${n} signal(s)`);
    });
    lines.push(``);
    lines.push(`— AIG Lines Intelligence`);
    navigator.clipboard?.writeText(lines.join("\n"));
    showT(t("copied_clipboard"));
  };

  // ── Feature 5: Email template generator ──
  const[emailSignal,setEmailSignal]=useState(null);
  const[emailType,setEmailType]=useState("broker");
  const generateEmail=(sig,type)=>{
    const co=cos.find(c=>c.id===sig.cid)||{name:sig.company||""};
    const cat=getCat(sig.cat,lang);
    const imps=getImpsAll(sig.id);
    const dossier=getDossier(sig.cid);
    if(type==="broker"){
      var body="Objet : "+co.name+" — Signal FL à votre attention ("+(cat?.label||sig.cat)+")\n\n";
      body+="Bonjour"+(dossier?.broker?" "+dossier.broker:"")+",\n\n";
      body+="Je souhaitais attirer votre attention sur un signal récent concernant "+co.name+" qui pourrait avoir des implications pour le programme Financial Lines :\n\n";
      body+="▸ "+tx(sig.title,lang)+"\n";
      body+="▸ Source : "+(tx(sig.src||sig.source,lang)||"Presse")+" — "+(sig.at?new Date(sig.at).toLocaleDateString("fr-FR"):"")+"\n";
      body+="▸ Niveau : "+scoreLbl(sig.imp||50,t)+"\n";
      body+="▸ Lignes potentiellement impactées : "+(imps.map(function(i){return lineLbl(i.line,lang)}).join(", ")||"À évaluer")+"\n\n";
      if(imps.length>0){body+="Analyse FL :\n"+imps.map(function(i){return "• "+tx(i.why,lang)}).filter(Boolean).join("\n")+"\n\n"}
      body+="Je vous propose d'en discuter lors de notre prochain échange afin d'évaluer les ajustements éventuels à envisager.\n\n";
      body+="Cordialement,\nAnne-Sophie Revel\nSenior Account Manager — Financial Lines\nAIG France";
      return body;
    }else{
      var body2="Objet : Point de vigilance FL — "+co.name+"\n\n";
      body2+="Bonjour"+(dossier?.rm?" "+dossier.rm:"")+",\n\n";
      body2+="Dans le cadre de notre veille Financial Lines, nous avons identifié un signal qui concerne "+co.name+" :\n\n";
      body2+="▸ "+tx(sig.title,lang)+"\n";
      body2+="▸ Catégorie : "+(cat?.label||sig.cat)+"\n";
      body2+="▸ Niveau d'importance : "+scoreLbl(sig.imp||50,t)+"\n\n";
      if(imps.length>0){body2+="Implications potentielles :\n"+imps.map(function(i){return "• "+lineLbl(i.line,lang)+": "+tx(i.why,lang)}).filter(Boolean).join("\n")+"\n\n"}
      if(imps.length>0){body2+="Angles de discussion proposés :\n"+imps.map(function(i){return "• "+tx(i.angle,lang)}).filter(Boolean).join("\n")+"\n\n"}
      body2+="Nous restons à votre disposition pour en discuter.\n\n";
      body2+="Cordialement,\nAnne-Sophie Revel\nSenior Account Manager — Financial Lines\nAIG France";
      return body2;
    }
  };

  // ── Feature 6: Monthly KPIs ──
  const monthlyKpis=useMemo(()=>{
    const now=Date.now();const m30=30*86400000;
    return{
      briefs:briefHistory.filter(b=>now-new Date(b.date).getTime()<m30).length,
      meetings:meetings.filter(m=>now-new Date(m.createdAt||m.date).getTime()<m30).length,
      signals:allSignals.filter(s=>{const d=s.at?new Date(s.at).getTime():0;return now-d<m30&&cos.find(c=>c.id===s.cid)?.prio}).length,
      opps:commercialOpps.length
    };
  },[briefHistory,meetings,allSignals,cos,commercialOpps]);



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
    <div className="fi" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"#F3F5F7"}}>
      <div style={{background:"#FFFFFF",border:"1px solid #E2E6EB",borderRadius:12,padding:"40px 32px",width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{display:"inline-block",border:"2px solid #002B5C",padding:"4px 14px",fontSize:18,fontWeight:700,color:"#002B5C",marginBottom:8,borderRadius:2}}>AIG</div>
        <div style={{fontSize:15,fontWeight:600,color:"#002B5C",marginBottom:4}}>Lines Intelligence</div>
        <div style={{fontSize:13,color:"#7D8A9A",marginBottom:28}}>{lang==="fr"?"Connexion sécurisée":"Secure login"}</div>
        <div style={{marginBottom:14}}>
          <input className="inp" type="email" placeholder={t("email")} value={loginEm} onChange={e=>{setLoginEm(e.target.value);setLoginErr(false)}} style={Object.assign({marginBottom:10},loginErr?{borderColor:"#DC2626"}:{})}/>
          <input className="inp" type="password" placeholder={t("password")} value={loginPw} onChange={e=>{setLoginPw(e.target.value);setLoginErr(false)}} onKeyDown={e=>e.key==="Enter"&&tryLogin()} style={loginErr?{borderColor:"#DC2626"}:{}}/>
        </div>
        {loginErr&&<p style={{fontSize:12,color:"#991B1B",marginBottom:10}}>{t("login_err")}</p>}
        <button className="btn bp" style={{width:"100%",height:46,borderRadius:6,opacity:loginLoading?.6:1}} onClick={tryLogin} disabled={loginLoading}>{loginLoading?(lang==="fr"?"Connexion...":"Signing in..."):(lang==="fr"?"Se connecter":"Sign in")}</button>
        <button style={{background:"none",border:"none",fontSize:12,color:"#0072CE",cursor:"pointer",marginTop:12,display:"block",width:"100%"}} onClick={requestAccess} disabled={accessRequested||!loginEm}>{accessRequested?(lang==="fr"?"Demande envoyée ✓":"Request sent ✓"):(lang==="fr"?"Demander un accès":"Request access")}</button>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:20}}>
          <button style={{background:"none",border:"none",fontSize:12,color:lang==="en"?"#002B5C":"#A8B1BD",fontWeight:lang==="en"?600:400,cursor:"pointer"}} onClick={()=>setLang("en")}>EN</button>
          <span style={{color:"#CDD3DA",fontSize:12}}>|</span>
          <button style={{background:"none",border:"none",fontSize:12,color:lang==="fr"?"#002B5C":"#A8B1BD",fontWeight:lang==="fr"?600:400,cursor:"pointer"}} onClick={()=>setLang("fr")}>FR</button>
        </div>
        <p style={{fontSize:11,color:"#A8B1BD",marginTop:16}}>&copy; 2026 AIG — Lines Intelligence</p>
      </div>
    </div>
  );

  // ── COMPANY SELECTION ──
  if(step==="select"){const selCount=cos.filter(c=>c.prio).length;return (
    <div className="fi" style={{minHeight:"100vh",padding:"40px 20px 100px",background:"var(--bg)"}}>
      <div style={{textAlign:"center",marginBottom:32}}><div style={{margin:"0 auto 12px",display:"flex",justifyContent:"center"}}><span style={{border:"2px solid var(--gold)",padding:"4px 14px",fontSize:18,fontWeight:700,color:"var(--gold)",borderRadius:2}}>AIG</span></div><h2 style={{fontSize:22,fontWeight:600,color:"var(--t1)",marginBottom:8}}>{t("select_companies")}</h2><p style={{fontSize:13,color:"var(--t3)",lineHeight:1.55}}>{t("select_companies_sub")}</p></div>
      <div className="co-grid" style={{marginBottom:24}}>{cos.map(c=>{const on=!!c.prio;return (<button key={c.id} className="card" style={{padding:"14px 18px",width:"100%",textAlign:"left",cursor:"pointer",borderColor:on?"rgba(0,114,206,.3)":"var(--b)",background:on?"var(--gbg)":"var(--bg2)"}} onClick={()=>togW(c.id,"watch")}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:22,height:22,borderRadius:6,border:`2px solid ${on?"var(--gold)":"var(--b2)"}`,background:on?"var(--gold)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{on&&<span style={{color:"var(--bg)",fontSize:14,fontWeight:700}}>✓</span>}</div><Logo name={c.name} sz={28} fallback={c.logo}/><div style={{flex:1,minWidth:0}}><h4 style={{fontSize:13,fontWeight:600,color:on?"var(--t1)":"var(--t2)"}}>{c.name}</h4><p style={{fontSize:11,color:"var(--t4)",marginTop:1}}>{tx(c.sector,lang)}</p></div><SR s={c.risk} sz={34} sw={2}/></div></button>)})}</div>
      <div className="tbar" style={{flexDirection:"column",gap:0,padding:"16px 20px"}}><button className="btn bp" style={{width:"100%",height:46}} onClick={()=>setStep("app")} disabled={selCount===0}>{t("continue_btn")} {selCount>0&&`(${selCount} ${t("selected")})`}</button><button className="btn" style={{width:"100%",marginTop:8,color:"var(--t4)",fontSize:12,background:"none"}} onClick={()=>setStep("app")}>{t("skip")}</button></div>
    </div>);}

  // ── SIGNAL CARD ──
  const SigCard=({s,d=0})=>{const cat=getCat(s.cat,lang);const co=cos.find(c=>c.id===s.cid)||cos.find(c=>s.company&&(c.name.toLowerCase()===s.company.toLowerCase()||s.company.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])));const imps=getImpsAll(s.id);return (
    <div className={`card fi ${d>0?`fi${Math.min(d,5)}`:""}`} style={{padding:"16px 18px",cursor:"pointer"}} onClick={()=>setSS(s)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>{cat?.icon}</span><span className="lbl" style={{color:cat?.c,fontSize:10}}>{cat?.label}</span></div><span className="badge" style={{background:sBg(s.imp),color:sT(s.imp)}}>{scoreLbl(s.imp,t)}</span></div>
      <div style={{display:"flex",gap:12}}>
        <div style={{flex:1,minWidth:0}}>
          <h3 style={{fontSize:14,fontWeight:600,color:"var(--t1)",lineHeight:1.4,marginBottom:8}}>{tx(s.title,lang)}</h3>
          <p style={{fontSize:12,color:"var(--t3)",lineHeight:1.45,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{tx(s.sum,lang)}</p>
        </div>
        {s.img&&<div style={{width:80,height:60,flexShrink:0,borderRadius:6,overflow:"hidden",background:"var(--bg3)"}}><img src={s.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.parentElement.style.display="none"}}/></div>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:6}}>{co&&<Logo name={co.name} sz={20} fallback={co.logo}/>}<span style={{fontSize:11,fontWeight:500,color:"var(--gold2)"}}>{co?.name}</span><span style={{fontSize:10,color:"var(--t5)"}}>·</span>{(tx(s.src,lang)||"").includes(" | ")?<span style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:"rgba(0,114,206,.06)",color:"var(--gold2)",fontWeight:600}}>{(tx(s.src,lang)||"").split(" | ").length} sources</span>:<span style={{fontSize:10,color:"var(--t5)"}}>{tx(s.src,lang)}</span>}</div><span style={{fontSize:10,color:"var(--t5)",display:"flex",alignItems:"center",gap:4}}><I.clock/>{fD(s.at,lang)}</span></div>
      {imps.length>0&&<div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>{imps.map((im,idx)=><span key={`${im.line}-${idx}`} style={{fontSize:10,padding:"2px 8px",borderRadius:12,background:LVL_BG[im.lvl]||"rgba(37,99,235,.08)",color:LVL_T[im.lvl]||"#1E40AF",border:`1px solid ${(LVL_C[im.lvl]||"#3B82F6")}22`}}>{lineLbl(im.line,lang)} · {im.lvl||"—"}</span>)}</div>}
    </div>)};

  // ── SIGNAL DETAIL ──
  const SigDet=({s,onClose})=>{if(!s)return null;const cat=getCat(s.cat,lang);const co=cos.find(c=>c.id===s.cid)||cos.find(c=>s.company&&(c.name.toLowerCase()===s.company.toLowerCase()||s.company.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])));const f=factLbl(s.fact,t);const imps=getImpsAll(s.id);return (
    <div className="bsbg" onClick={onClose}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingTop:8}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{cat?.icon}</span><span className="lbl" style={{color:cat?.c,fontSize:11}}>{cat?.label}</span></div><button className="bi" style={{width:32,height:32}} onClick={onClose}><I.x/></button></div>
      <h2 style={{fontSize:20,fontWeight:600,color:"var(--t1)",lineHeight:1.35,marginBottom:14}}>{tx(s.title,lang)}</h2>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}><span className="badge" style={{background:sBg(s.imp),color:sT(s.imp)}}>{scoreLbl(s.imp,t)} · {s.imp}</span><span className="ftag" style={{background:f.bg,color:f.c}}>{f.l}</span><span style={{fontSize:11,color:"var(--t4)",display:"flex",alignItems:"center",gap:4}}><I.clock/>{fD(s.at,lang)}</span></div>
      {s.img&&<div style={{marginBottom:16,borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}><img src={s.img} alt="" style={{width:"100%",height:"auto",maxHeight:220,objectFit:"cover",display:"block"}} onError={e=>{e.target.style.display="none"}}/></div>}
      {co&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--bg3)",borderRadius:"var(--rs)",marginBottom:18,border:"1px solid var(--b)"}}><Logo name={co.name} sz={28} fallback={co.logo}/><span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{co.name}</span><span style={{fontSize:11,color:"var(--t4)",marginLeft:10}}>{tx(co.sector,lang)}</span></div>}
      <div className="dv"/>
      <div style={{marginBottom:22}}><h4 className="lbl" style={{color:"var(--t3)",marginBottom:10}}>{t("what_happened")}</h4><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.65}}>{tx(s.sum,lang)}</p></div>
      <div style={{marginBottom:22}}><span style={{fontSize:11,color:"var(--t4)",marginRight:6}}>{t("source_label")}</span><div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>{(()=>{const srcNames=(tx(s.src,lang)||"").split(" | ");const srcUrls=(s.url||"").split(" | ");return srcNames.map((srcName,idx)=>{const rawUrl=srcUrls[idx]?.trim()||srcUrl(srcName.trim());const url=fixBodaccUrl(rawUrl,s.company);return url?<a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"var(--gold2)",fontWeight:500,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",background:"rgba(0,114,206,.05)",borderRadius:4,border:"1px solid rgba(0,114,206,.1)"}}>{srcName.trim()}<I.ext/></a>:<span key={idx} style={{fontSize:11,color:"var(--gold2)",fontWeight:500,padding:"2px 8px",background:"rgba(0,114,206,.05)",borderRadius:4,border:"1px solid rgba(0,114,206,.1)"}}>{srcName.trim()}</span>})})()}</div></div>
      <div className="dv"/>
      <h4 className="lbl" style={{color:"var(--t3)",marginBottom:12}}>{t("lines_impacted")}</h4>
      {imps.map((im,idx)=><div key={`${im.line}-${idx}`} style={{marginBottom:idx<imps.length-1?12:22}}>
        <div style={{padding:"16px 18px",background:LVL_BG[im.lvl]||"rgba(37,99,235,.08)",borderRadius:"var(--rs)",border:`1px solid ${(LVL_C[im.lvl]||"#3B82F6")}18`,borderLeft:`3px solid ${LVL_C[im.lvl]||"#3B82F6"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h4 className="lbl" style={{color:LVL_T[im.lvl]||"#1E40AF"}}>{lineLbl(im.line,lang)}</h4><span className="badge" style={{background:`${(LVL_C[im.lvl]||"#3B82F6")}20`,color:LVL_T[im.lvl]||"#1E40AF",textTransform:"capitalize"}}>{im.lvl||"medium"}</span></div>
          <div style={{marginBottom:12}}><p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{t("why_matters")}</p><p style={{fontSize:13,color:"var(--t1)",lineHeight:1.6}}>{tx(im.why,lang)}</p></div>
          {im.angle&&<div style={{marginBottom:12}}><p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{t("discussion_angle")}</p><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.55}}>{tx(im.angle,lang)}</p></div>}
          {(im.vig||[]).length>0&&<div style={{marginBottom:(im.hyp||[]).length>0?12:0}}><p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{t("points_verify")}</p>{(im.vig||[]).map((v,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:3}}><span style={{color:LVL_T[im.lvl]||"var(--t3)",marginTop:1,flexShrink:0,fontSize:11}}>▸</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{tx(v,lang)}</span></div>)}</div>}
          {(im.hyp||[]).length>0&&<div><p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{t("hyp_check")}</p>{(im.hyp||[]).map((h,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:3}}><span className="ftag" style={{background:"rgba(91,33,182,.08)",color:"#5B21B6",flexShrink:0,marginTop:1}}>H{i+1}</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{tx(h,lang)}</span></div>)}</div>}
        </div>
      </div>)}
      <div style={{display:"flex",gap:28,marginBottom:10}}><div><h4 className="lbl" style={{color:"var(--t4)",marginBottom:6}}>{t("importance")}</h4><SR s={s.imp||50} sz={50}/></div><div><h4 className="lbl" style={{color:"var(--t4)",marginBottom:6}}>{t("confidence")}</h4><SR s={s.conf||50} sz={50}/></div></div>
      {(s.url||(()=>{const srcNames=(tx(s.src,lang)||"").split(" | ");return srcUrl(srcNames[0]?.trim())})())&&<a href={fixBodaccUrl(s.url?.split(" | ")[0]||srcUrl((tx(s.src,lang)||"").split(" | ")[0]?.trim()),s.company)} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"12px",fontSize:13,fontWeight:600,color:"#fff",background:"var(--gold)",borderRadius:8,textAlign:"center",textDecoration:"none",marginTop:12}}>{lang==="fr"?"Lire l'article complet":"Read full article"}</a>}
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
    const dos=getDossier(cid);
    const history=getBriefHistory(cid);
    const lastDate=getLastBriefDate(cid);
    const newSince=getNewSignalsSinceLastBrief(cid);
    const brokerCtx=lang==="fr"?"INTERLOCUTEURS\nCourtier : Partager les signaux clés et discuter du positionnement du programme FL.\nRisk Manager : Valider la perception du risque et confirmer les mesures de prévention.":"KEY CONTACTS\nBroker: Share key signals and discuss FL programme positioning.\nRisk Manager: Validate risk perception and confirm prevention measures.";
    const txt=`${t("brief_title").toUpperCase()} — ${co?.name}\n${new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"long",year:"numeric"})}\n\n${t("exec_summary").toUpperCase()}\n${sigs.length} ${sigs.length>1?t("signals_lc"):t("signal")} · ${lines.length} ${t("lines_lc")} · ${scoreLbl(co?.risk,t)}\n\n${t("key_signals").toUpperCase()}\n${sigs.slice(0,5).map((s,i)=>`${i+1}. [${s.imp}] ${tx(s.title,lang)}`).join("\n")}\n\n${t("fl_implications").toUpperCase()}\n${lines.map(l=>lineLbl(l,lang)).join(", ")}\n\n${t("discussion_angles").toUpperCase()}\n${angles.map(a=>`• ${a}`).join("\n")}\n\n${brokerCtx}\n\n${t("questions_to_ask").toUpperCase()}\n${questions.map(q=>`• ${q}`).join("\n")}\n\n${t("next_steps").toUpperCase()}\n${actions.length>0?actions.map(a=>`• ${a}`).join("\n"):`• ${t("to_be_defined")}`}\n\n— AIG Lines Intelligence`;

    return (<div className="bsbg" onClick={onClose}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,paddingTop:8}}><h3 style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("brief_title")}</h3><button className="bi" style={{width:32,height:32}} onClick={onClose}><I.x/></button></div>
      <p style={{fontSize:12,color:"var(--t4)",marginBottom:16}}>{t("brief_sub")}</p><div className="aline" style={{marginBottom:18}}/>

      {co&&<div className="cs" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:12}}><Logo name={co.name} sz={36} fallback={co.logo}/><div><h4 style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{co.name}</h4><p style={{fontSize:11,color:"var(--t4)",marginTop:2}}>{tx(co.sector,lang)}</p></div></div><SR s={co.risk} sz={46}/></div>}

      {/* Nouveaux signaux depuis le dernier brief */}
      {lastDate&&newSince.length>0&&<div style={{padding:"12px 14px",background:"rgba(52,211,153,.06)",borderRadius:"var(--rs)",border:"1px solid rgba(52,211,153,.15)",marginBottom:18}}>
        <p style={{fontSize:11,fontWeight:700,color:"#16A34A",marginBottom:6}}>{lang==="fr"?`${newSince.length} nouveau(x) signal(aux) depuis le dernier brief`:`${newSince.length} new signal(s) since last brief`} <span style={{fontWeight:400,color:"var(--t5)"}}>({fD(lastDate,lang)})</span></p>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>{newSince.slice(0,3).map((s,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"center"}}><span className="badge" style={{background:sBg(s.imp||50),color:sT(s.imp||50),fontSize:9,padding:"1px 5px"}}>{s.imp||50}</span><span style={{fontSize:11,color:"var(--t2)"}}>{tx(s.title,lang)}</span></div>)}{newSince.length>3&&<p style={{fontSize:10,color:"var(--t5)",marginTop:2}}>+ {newSince.length-3} {lang==="fr"?"autre(s)":"more"}</p>}
        </div>
      </div>}
      {lastDate&&newSince.length===0&&<div style={{padding:"10px 14px",background:"rgba(96,165,250,.06)",borderRadius:"var(--rs)",border:"1px solid rgba(96,165,250,.12)",marginBottom:18}}>
        <p style={{fontSize:11,color:"#1E40AF"}}>✓ {lang==="fr"?"Aucun nouveau signal depuis le dernier brief":"No new signals since last brief"} ({fD(lastDate,lang)})</p>
      </div>}

      {/* Brief history toggle */}
      {history.length>1&&<button style={{width:"100%",padding:"8px",marginBottom:18,background:"var(--bg3)",border:"1px solid var(--b)",borderRadius:"var(--rs)",cursor:"pointer",color:"var(--t4)",fontSize:11,fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>setSBH(!showBriefHist)}>
        <span>{lang==="fr"?`${history.length} briefs précédents`:`${history.length} previous briefs`}</span><I.chR style={{width:12,height:12,transform:showBriefHist?"rotate(90deg)":"none",transition:"transform .2s"}}/>
      </button>}
      {showBriefHist&&<div style={{marginBottom:18,maxHeight:200,overflow:"auto"}}>{history.slice(1).map((b,i)=><div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderBottom:"1px solid var(--b)",opacity:.7+(i===0?.3:0)}}>
        <div><p style={{fontSize:11,color:"var(--t2)"}}>{fD(b.date,lang)}</p><p style={{fontSize:9,color:"var(--t5)"}}>{b.signalCount} {lang==="fr"?"signaux":"signals"} · {lang==="fr"?"Score":"Score"} {b.risk}</p></div>
        <div style={{display:"flex",gap:3}}>{(b.lines||[]).slice(0,3).map(l=><span key={l} style={{fontSize:7,padding:"1px 5px",borderRadius:5,background:"rgba(96,165,250,.1)",color:"#1E40AF"}}>{lineLbl(l,lang)}</span>)}</div>
      </div>)}</div>}

      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:8}}>{t("exec_summary")}</h4>
      <p style={{fontSize:13,color:"var(--t2)",marginBottom:20,lineHeight:1.55}}>{sigs.length} {sigs.length>1?t("signals_lc"):t("signal")} · {lines.length} {t("lines_lc")} · {scoreLbl(co?.risk,t)}</p>
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("key_signals")}</h4>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>{sigs.slice(0,5).map((s,idx)=><div key={s.id||idx} style={{display:"flex",gap:10,alignItems:"flex-start"}}><span className="badge" style={{background:sBg(s.imp||50),color:sT(s.imp||50),flexShrink:0,marginTop:2}}>{s.imp||50}</span><p style={{fontSize:13,fontWeight:500,color:"var(--t1)",lineHeight:1.4}}>{tx(s.title,lang)||s.company||"—"}</p></div>)}</div>
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("fl_implications")}</h4>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>{lines.map(l=><span key={l} className="chip on">{lineLbl(l,lang)}</span>)}</div>
      {angles.length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("discussion_angles")}</h4><div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>{angles.map((a,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"var(--gold)",marginTop:1,flexShrink:0}}>▸</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{a}</span></div>)}</div></>}
      {/* Dossier client */}
      {dos&&(dos.broker||dos.rm||dos.renewal||dos.premium||dos.program||dos.sinistres||dos.context)&&<>
        <h4 className="lbl" style={{color:"#A78BFA",marginBottom:10}}>{lang==="fr"?"Dossier client":"Client file"}</h4>
        <div className="cs" style={{padding:"14px 16px",marginBottom:20}}>
          {(dos.broker||dos.rm)&&<div style={{display:"flex",gap:16,marginBottom:10}}>{dos.broker&&<div><p className="lbl" style={{color:"var(--t5)",fontSize:8,marginBottom:2}}>{lang==="fr"?"Courtier":"Broker"}</p><p style={{fontSize:12,color:"var(--t2)",fontWeight:500}}>{dos.broker}</p></div>}{dos.rm&&<div><p className="lbl" style={{color:"var(--t5)",fontSize:8,marginBottom:2}}>Risk Manager</p><p style={{fontSize:12,color:"var(--t2)",fontWeight:500}}>{dos.rm}</p>{(dos.rmPhone||dos.rmMobile)&&<p style={{fontSize:10,color:"var(--t4)",marginTop:2}}>{dos.rmPhone&&<a href={"tel:"+dos.rmPhone} style={{color:"var(--t4)",textDecoration:"none"}}>{dos.rmPhone}</a>}{dos.rmPhone&&dos.rmMobile?" · ":""}{dos.rmMobile&&<a href={"tel:"+dos.rmMobile} style={{color:"var(--t4)",textDecoration:"none"}}>{dos.rmMobile}</a>}</p>}{dos.rmEmail&&<p style={{fontSize:10,marginTop:1}}><a href={"mailto:"+dos.rmEmail} style={{color:"var(--gold2)",textDecoration:"none"}}>{dos.rmEmail}</a></p>}</div>}</div>}
          {(dos.renewal||dos.premium)&&<div style={{display:"flex",gap:16,marginBottom:10}}>{dos.renewal&&<div><p className="lbl" style={{color:"var(--t5)",fontSize:8,marginBottom:2}}>{lang==="fr"?"Renouvellement":"Renewal"}</p><p style={{fontSize:12,color:"#D97706",fontWeight:600}}>{new Date(dos.renewal).toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"long",year:"numeric"})}</p></div>}{dos.premium&&<div><p className="lbl" style={{color:"var(--t5)",fontSize:8,marginBottom:2}}>{lang==="fr"?"Prime":"Premium"}</p><p style={{fontSize:12,color:"var(--t2)",fontWeight:500}}>{dos.premium}</p></div>}</div>}
          {dos.program&&<div style={{marginBottom:8}}><p className="lbl" style={{color:"var(--t5)",fontSize:8,marginBottom:2}}>{lang==="fr"?"Programme FL":"FL Programme"}</p><p style={{fontSize:11,color:"var(--t2)",lineHeight:1.5}}>{dos.program}</p></div>}
          {dos.sinistres&&<div style={{marginBottom:8}}><p className="lbl" style={{color:"var(--t5)",fontSize:8,marginBottom:2}}>{lang==="fr"?"Sinistralité":"Claims"}</p><p style={{fontSize:11,color:"var(--t2)",lineHeight:1.5}}>{dos.sinistres}</p></div>}
          {dos.context&&<div><p className="lbl" style={{color:"var(--t5)",fontSize:8,marginBottom:2}}>{lang==="fr"?"Contexte":"Context"}</p><p style={{fontSize:11,color:"var(--t2)",lineHeight:1.5}}>{dos.context}</p></div>}
        </div>
      </>}
      {!dos&&<div style={{padding:"10px 14px",background:"rgba(139,92,246,.04)",borderRadius:"var(--rs)",border:"1px dashed rgba(139,92,246,.15)",marginBottom:20,textAlign:"center"}}><p style={{fontSize:11,color:"var(--t5)"}}>{lang==="fr"?"Ajoutez un dossier client pour enrichir ce brief":"Add a client file to enrich this brief"}</p><button className="btn" style={{padding:"4px 12px",fontSize:10,color:"#5B21B6",background:"rgba(91,33,182,.08)",border:"1px solid rgba(139,92,246,.2)",borderRadius:6,marginTop:6}} onClick={()=>{onClose();setTimeout(()=>openDossier(cid),300)}}>+ {lang==="fr"?"Créer le dossier":"Create file"}</button></div>}
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("interlocutors")}</h4>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <div className="cs" style={{flex:1,padding:"12px 14px"}}><p className="lbl" style={{color:"var(--t5)",fontSize:9,marginBottom:4}}>{t("broker")}</p><p style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{lang==="fr"?"Partager les signaux clés et discuter du positionnement du programme FL lors du prochain comité de renouvellement.":"Share key signals and discuss FL programme positioning at next renewal committee."}</p></div>
        <div className="cs" style={{flex:1,padding:"12px 14px"}}><p className="lbl" style={{color:"var(--t5)",fontSize:9,marginBottom:4}}>{t("risk_manager")}</p><p style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{lang==="fr"?"Valider la perception du risque et confirmer les mesures de prévention mises en place par l'entreprise.":"Validate risk perception and confirm prevention measures implemented by the company."}</p></div>
      </div>
      {questions.length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("questions_to_ask")}</h4><div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>{questions.map((q,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#A78BFA",marginTop:1,flexShrink:0}}>?</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{q}</span></div>)}</div></>}
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("next_steps")}</h4>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>{actions.length>0?actions.map((a,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#16A34A",marginTop:1,flexShrink:0}}>→</span><span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{a}</span></div>):<p style={{fontSize:12,color:"var(--t4)"}}>{t("to_be_defined")}</p>}</div>

      {/* Vision — Ce que AIG FL Intelligence pourrait faire avec les outils de l'entreprise */}
      <div className="aline" style={{marginBottom:18}}/>
      <div style={{padding:"16px 18px",background:"linear-gradient(135deg,rgba(0,114,206,.04),rgba(139,92,246,.04))",borderRadius:"var(--rs)",border:"1px dashed rgba(0,114,206,.2)",marginBottom:20}}>
        <p style={{fontSize:10,fontWeight:700,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>{lang==="fr"?"AIG FL Intelligence pourrait aller plus loin":"AIG FL Intelligence could go further"}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {icon:"📧",l:lang==="fr"?"Connexion email":"Email integration",d:lang==="fr"?"Intégrer automatiquement les derniers échanges avec le courtier et le Risk Manager dans le brief.":"Auto-integrate latest exchanges with broker and Risk Manager into the brief."},
            {icon:"💼",l:lang==="fr"?"Connexion CRM":"CRM integration",d:lang==="fr"?"Historique client complet, polices en cours, sinistres, taux de prime — tout dans le brief.":"Full client history, active policies, claims, premium rates — all in the brief."},
            {icon:"📁",l:lang==="fr"?"SharePoint / Drive":"SharePoint / Drive",d:lang==="fr"?"Documents partagés de l'équipe, rapports d'audit, comptes-rendus de comités.":"Shared team documents, audit reports, committee minutes."},
            {icon:"📅",l:lang==="fr"?"Calendrier":"Calendar sync",d:lang==="fr"?"Synchronisation Outlook — briefs automatiques avant chaque réunion planifiée.":"Outlook sync — automatic briefs before each scheduled meeting."},
          ].map(v=><div key={v.l} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:16,flexShrink:0}}>{v.icon}</span>
            <div><p style={{fontSize:11,fontWeight:600,color:"var(--t2)"}}>{v.l}</p><p style={{fontSize:10,color:"var(--t4)",lineHeight:1.4}}>{v.d}</p></div>
          </div>)}
        </div>
        <p style={{fontSize:9,color:"var(--t5)",marginTop:10,fontStyle:"italic",textAlign:"center"}}>{lang==="fr"?"Ces fonctionnalités nécessitent une connexion aux outils de l'entreprise.":"These features require connection to enterprise tools."}</p>
      </div>

      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button className="btn" style={{flex:1,height:44,background:"var(--bg3)",color:"var(--t2)",border:"1px solid var(--b)",borderRadius:"var(--rs)",fontSize:12,fontWeight:600}} onClick={()=>{saveBrief(cid,txt);navigator.clipboard?.writeText(txt);setCopied(true);showT(t("copied_clipboard"));setTimeout(()=>setCopied(false),1500)}}>{copied?<><I.check/>{t("copied")}</>:<><I.copy/>{t("copy_brief")}</>}</button>
        <button className="btn" style={{flex:1,height:44,background:"var(--bg3)",color:"var(--t2)",border:"1px solid var(--b)",borderRadius:"var(--rs)",fontSize:12,fontWeight:600}} onClick={()=>{
          const w=window.open("","_blank");if(!w)return;
          const sigHtml=sigs.slice(0,5).map(s=>`<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb"><span style="background:${sBg(s.imp||50)};color:${sT(s.imp||50)};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${s.imp>=80?"Critique":s.imp>=60?"Élevé":s.imp>=40?"Moyen":"Faible"}</span></td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px">${tx(s.title,lang)||s.company||"—"}</td></tr>`).join("");
          const lineHtml=lines.map(l=>`<span style="background:#f0f4ff;color:#1e40af;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;margin:2px">${lineLbl(l,lang)}</span>`).join(" ");
          const angleHtml=angles.length>0?angles.map(a=>`<li style="margin:4px 0;font-size:13px;color:#374151">${a}</li>`).join(""):"<li>—</li>";
          w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>AIG FL Intelligence Brief — ${co?.name||""}</title><style>body{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;max-width:700px;margin:40px auto;padding:0 24px;color:#1f2937}h1{font-family:inherit;font-weight:600;font-size:24px;color:#111827;margin-bottom:4px}h2{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#002B5C;margin:24px 0 10px;font-weight:700;border-bottom:2px solid #E2E6EB;padding-bottom:4px}table{width:100%;border-collapse:collapse}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #002B5C;padding-bottom:16px;margin-bottom:24px}.logo{font-family:inherit;font-weight:700;font-size:20px;font-weight:700;color:#002B5C}.date{font-size:12px;color:#6b7280}.company{background:#f8f9fc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:14px}.mono{width:40px;height:40px;border-radius:8px;background:#002B5C;color:white;display:flex;align-items:center;justify-content:center;font-family:inherit;font-weight:700;font-weight:700;font-size:16px}.score{width:44px;height:44px;border-radius:50%;border:3px solid ${sC(co?.risk||50)};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:${sC(co?.risk||50)}}.contacts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}.contact{background:#f8f9fc;border:1px solid #e5e7eb;border-radius:8px;padding:12px}.contact h4{font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:6px}.contact p{font-size:12px;color:#374151;line-height:1.5}@media print{body{margin:20px}@page{margin:1.5cm}}</style></head><body>
          <div class="header"><div><span class="logo">AIG</span><br><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#9ca3af">Lines Intelligence</span></div><span class="date">${new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"long",year:"numeric"})}</span></div>
          <h1>${lang==="fr"?"Brief de réunion":"Meeting Brief"} — ${co?.name||""}</h1>
          <div class="company"><span class="mono">${co?.logo||"?"}</span><div><strong style="font-size:15px">${co?.name||""}</strong><br><span style="font-size:12px;color:#6b7280">${tx(co?.sector,lang)||""}</span></div><div style="margin-left:auto"><div class="score">${co?.risk||"—"}</div></div></div>
          <h2>${t("exec_summary")}</h2><p style="font-size:14px">${sigs.length} ${sigs.length>1?t("signals_lc"):t("signal")} · ${lines.length} ${t("lines_lc")} · ${scoreLbl(co?.risk||50,t)}</p>
          <h2>${t("key_signals")}</h2><table>${sigHtml}</table>
          <h2>${t("fl_implications")}</h2><div style="display:flex;flex-wrap:wrap;gap:4px">${lineHtml||"—"}</div>
          <h2>${t("discussion_angles")}</h2><ul style="padding-left:20px">${angleHtml}</ul>
          <h2>${t("interlocutors")}</h2><div class="contacts"><div class="contact"><h4>${t("broker")}</h4><p>${lang==="fr"?"Partager les signaux clés et discuter du positionnement du programme FL lors du prochain comité de renouvellement.":"Share key signals and discuss FL programme positioning at next renewal committee."}</p></div><div class="contact"><h4>${t("risk_manager")}</h4><p>${lang==="fr"?"Valider la perception du risque et confirmer les mesures de prévention mises en place par l'entreprise.":"Validate risk perception and confirm prevention measures implemented by the company."}</p></div></div>
          <h2>${t("next_steps")}</h2><p style="font-size:13px;color:#6b7280">${actions.length>0?actions.join(" · "):t("to_be_defined")}</p>
          <div style="margin-top:40px;padding-top:16px;border-top:2px solid #E2E6EB;display:flex;justify-content:space-between;align-items:center"><span style="font-size:10px;color:#9ca3af">© 2026 AIG — Lines Intelligence</span><span style="font-size:10px;color:#9ca3af">${new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB")}</span></div>
          </body></html>`);
          w.document.close();setTimeout(()=>w.print(),500);
        }}><I.download/>{t("export_pdf")}</button>
        <button className="btn bp" style={{flex:1,height:44,fontSize:12}} onClick={()=>{
          const shareData={title:`AIG FL Intelligence — ${co?.name||""}`,text:txt};
          if(navigator.share){navigator.share(shareData).catch(()=>{})}
          else{const mailto=`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(txt)}`;window.open(mailto)}
        }}><I.share/>{t("share_brief")}</button>
      </div>
    </div></div>)};

  // ── COMPANY PAGE ──
  const CompPage=({cid})=>{const co=cos.find(c=>c.id===cid);const sigs=getSigs(cid);const cn=getNotes(cid);const lines=getLinesAll(sigs);if(!co)return null;return (
    <div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><button className="btn bg" style={{gap:4,color:"rgba(255,255,255,.8)"}} onClick={()=>setSC(null)}><I.chL/>{t("back")}</button><div style={{display:"flex",gap:8}}><button className="bi" style={{width:34,height:34}} onClick={()=>togW(co.id)}>{co.prio?<I.star style={{color:"var(--gold)"}}/>:<I.starO/>}</button><button className="btn bp" style={{padding:"6px 14px",fontSize:12}} onClick={()=>{setBC(co.id);setSB(true);setCopied(false)}}><I.brief style={{width:14,height:14}}/>{t("generate_brief")}</button><button className="btn" style={{padding:"6px 14px",fontSize:12,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)"}} onClick={()=>setShowPresentation(co.id)}><I.ext style={{width:14,height:14}}/>{lang==="fr"?"Présenter":"Present"}</button><button className="btn" style={{padding:"6px 14px",fontSize:12,background:"rgba(22,163,74,.06)",color:"#166534",border:"1px solid rgba(22,163,74,.2)"}} onClick={()=>runAnalysis(co.id)}>{lang==="fr"?"Analyse IA":"AI Analysis"}</button></div></div></div>
      <div style={{padding:"24px 20px"}}>
        <p className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{t("company_overview")}</p>
        <div className="fi" style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}><Logo name={co.name} sz={44} fallback={co.logo}/><div><h1 style={{fontSize:24,fontWeight:700,color:"var(--t1)",lineHeight:1.2}}>{co.name}</h1><p style={{fontSize:13,color:"var(--t4)",marginTop:3}}>{tx(co.sector,lang)}</p></div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[{l:t("headquarters"),v:co.hq},{l:t("market_cap"),v:co.cap},{l:t("employees"),v:co.emp}].map(x=><div key={x.l} className="cs" style={{padding:"10px 12px"}}><p className="lbl" style={{color:"var(--t5)",fontSize:9,marginBottom:4}}>{x.l}</p><p style={{fontSize:12,color:"var(--t2)",fontWeight:500}}>{x.v||"—"}</p></div>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12,padding:"12px 16px",background:"var(--bg3)",borderRadius:"var(--rs)",border:"1px solid var(--b)"}}><SR s={co.risk} sz={42}/><div><p className="lbl" style={{color:"var(--t4)",fontSize:9}}>{t("risk_score")}</p><p style={{fontSize:13,fontWeight:600,color:sC(co.risk)}}>{scoreLbl(co.risk,t)} · {tI(co.trend)} {co.trend}</p></div></div>
          {riskHistory[co.id]&&riskHistory[co.id].length>=2?<div style={{marginTop:12,padding:"14px 16px",background:"var(--bg3)",borderRadius:"var(--rs)",border:"1px solid var(--b)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><p className="lbl" style={{color:"var(--t4)",fontSize:9}}>{t("risk_history")}</p><span style={{fontSize:9,color:"var(--t5)"}}>{t("last_30_days")}</span></div><RiskChart data={riskHistory[co.id]}/></div>:riskHistory[co.id]&&riskHistory[co.id].length===1?<p style={{fontSize:11,color:"var(--t5)",marginTop:8,fontStyle:"italic"}}>{t("risk_no_history")}</p>:null}
        </div>
        {/* Réunions liées à cette entreprise */}
        {(()=>{const coMtgs=meetings.filter(m=>m.cid===co.id);const upcoming=coMtgs.filter(m=>new Date(m.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date));const past=coMtgs.filter(m=>new Date(m.date)<new Date()).sort((a,b)=>new Date(b.date)-new Date(a.date));if(coMtgs.length===0)return null;return (<>
          <div className="dv"/><h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}><I.calendar style={{width:12,height:12,display:"inline",marginRight:6}}/>{lang==="fr"?"Réunions":"Meetings"}</h3>
          {upcoming.length>0&&<div style={{marginBottom:14}}>{upcoming.map(mtg=>{const ml=mtgLabel(mtg);const d=new Date(mtg.date);return (<div key={mtg.id} className="card" style={{padding:"12px 16px",marginBottom:8,borderLeft:`3px solid ${ml.c}`,cursor:"pointer"}} onClick={()=>{setBC(co.id);setSB(true);setCopied(false)}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:700,color:ml.c}}>{ml.l}</span>
                  <span className="ftag" style={{background:mtg.type==="broker"?"rgba(0,114,206,.15)":mtg.type==="autre"?"rgba(139,92,246,.15)":"rgba(96,165,250,.15)",color:mtg.type==="broker"?"var(--gold)":mtg.type==="autre"?"#5B21B6":"#1E40AF",fontSize:9}}>{mtg.type==="broker"?t("meeting_broker"):mtg.type==="rm"?t("meeting_rm"):mtg.type==="autre"?t("meeting_other"):t("meeting_internal")}</span>
                </div>
                <p style={{fontSize:12,color:"var(--t2)"}}>{d.toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{weekday:"short",day:"numeric",month:"short"})} · {d.toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</p>
                {mtg.notes&&<p style={{fontSize:10,color:"var(--t5)",marginTop:3,fontStyle:"italic"}}>{mtg.notes.slice(0,80)}{mtg.notes.length>80?"...":""}</p>}
                {mtg.contact&&mtg.contact.name&&<p style={{fontSize:10,color:"#5B21B6",marginTop:3}}>👤 {mtg.contact.name}{mtg.contact.role?` — ${mtg.contact.role}`:""}</p>}
              </div>
              <I.chR style={{color:"var(--t5)",flexShrink:0}}/>
            </div>
          </div>)})}
          </div>}
          {past.length>0&&<div style={{marginBottom:14}}>
            <p className="lbl" style={{color:"var(--t5)",fontSize:9,marginBottom:8}}>{lang==="fr"?"Réunions passées":"Past meetings"}</p>
            {past.slice(0,3).map(mtg=>{const d=new Date(mtg.date);return (<div key={mtg.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderBottom:"1px solid var(--b)",opacity:.7,cursor:"pointer"}} onClick={()=>{setBC(co.id);setSB(true);setCopied(false)}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:10,color:"var(--t4)"}}>{d.toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short"})}</span>
                <span className="ftag" style={{background:"rgba(107,114,128,.1)",color:"var(--t5)",fontSize:8}}>{mtg.type==="broker"?t("meeting_broker"):mtg.type==="rm"?t("meeting_rm"):mtg.type==="autre"?t("meeting_other"):t("meeting_internal")}</span>
                {mtg.contact&&mtg.contact.name&&<span style={{fontSize:9,color:"var(--t5)"}}>· {mtg.contact.name}</span>}
              </div>
              <I.chR style={{width:10,height:10,color:"var(--t5)"}}/>
            </div>)})}{past.length>3&&<p style={{fontSize:10,color:"var(--t5)",marginTop:6,textAlign:"center"}}>+ {past.length-3} {lang==="fr"?"autre(s)":"more"}</p>}
          </div>}
          <button className="btn" style={{width:"100%",padding:"8px",fontSize:11,background:"var(--bg3)",color:"var(--gold)",border:"1px solid rgba(0,114,206,.2)",borderRadius:"var(--rs)",marginBottom:14}} onClick={()=>{setMtgCo(co.id);setSNM(true)}}><I.plus style={{width:12,height:12}}/>{lang==="fr"?"Planifier une réunion":"Schedule a meeting"}</button>
        </>)})()}

        {/* ═══ CONTACTS CLÉS ═══ */}
        {(()=>{const dos=getDossier(cid);const contacts=dos?.contacts||[];if(contacts.length===0)return null;return(
          <><div className="dv"/><h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{lang==="fr"?"CONTACTS CLÉS":"KEY CONTACTS"}</h3>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8,marginBottom:20}}>
            {contacts.map((ct,i)=>(
              <div key={i} className="card" style={{padding:12,minWidth:140,flexShrink:0,textAlign:"center"}}>
                {ct.photo?<img src={ct.photo} style={{width:48,height:48,borderRadius:24,objectFit:"cover",border:"2px solid var(--b)",margin:"0 auto 8px",display:"block"}} alt=""/>
                :<div style={{width:48,height:48,borderRadius:24,background:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",color:"#fff",fontSize:18,fontWeight:600}}>{(ct.name||"?")[0]?.toUpperCase()}</div>}
                <p style={{fontSize:12,fontWeight:600,color:"var(--t1)",marginBottom:2}}>{ct.name}</p>
                <p style={{fontSize:10,color:"var(--gold2)",marginBottom:4}}>{ct.title}</p>
                {ct.email&&<a href={"mailto:"+ct.email} style={{fontSize:9,color:"var(--t4)",textDecoration:"none",display:"block"}}>{ct.email}</a>}
                {ct.phone&&<a href={"tel:"+ct.phone} style={{fontSize:9,color:"var(--t4)",textDecoration:"none",display:"block",marginTop:2}}>{ct.phone}</a>}
              </div>
            ))}
          </div></>
        )})()}

        {/* ═══ PROGRAMME D'ASSURANCE (Tower Chart) ═══ */}
        {(()=>{const dos=getDossier(cid);const pl=dos?.programLines||[];if(pl.length===0)return(
          <><div className="dv"/><div className="card" style={{padding:18,marginBottom:20,textAlign:"center"}}>
            <h3 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{lang==="fr"?"PROGRAMME D'ASSURANCE":"INSURANCE PROGRAMME"}</h3>
            <p style={{fontSize:12,color:"var(--t4)",marginBottom:12}}>{lang==="fr"?"Aucune structure de programme renseignée":"No programme structure entered"}</p>
            <button className="btn" style={{padding:"6px 14px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)"}} onClick={()=>openDossier(cid)}>{lang==="fr"?"Configurer le programme":"Configure programme"}</button>
          </div></>);
          // All amounts in M€
          const maxCap=Math.max(...pl.map(p=>(p.layers||[]).reduce((a,l)=>Math.max(a,l.to||0),0)),1);
          const chartH=280;
          const INSURER_COLORS={"AIG":"#002B5C","Zurich":"#0072CE","Allianz":"#003781","AXA":"#00008F","Chubb":"#8B0000","MSIG":"#E4002B","Tokio Marine":"#DC143C","Generali":"#C8102E","Swiss Re":"#4A4A4A","Munich Re":"#0066B3","Hannover Re":"#009639","SCOR":"#003DA5","Berkshire":"#4B0082","Lloyd's":"#1A1A1A","HDI":"#0099CC","QBE":"#FF6600","Liberty":"#004B87","Markel":"#6B21A8","Beazley":"#065F46","Hiscox":"#92400E"};
          const getColor=(name,idx)=>{if(!name)return["#A8B1BD","#7D8A9A","#5C6B7D","#3D4E63"][idx%4];const upper=(name||"").toUpperCase();for(const[k,v] of Object.entries(INSURER_COLORS)){if(upper.includes(k.toUpperCase()))return v}return["#0072CE","#D97706","#16A34A","#7C3AED","#DC2626","#0891B2","#4338CA","#B45309"][idx%8]};
          // Y-axis ticks
          const ticks=[];const step=maxCap<=10?2:maxCap<=50?10:maxCap<=100?20:maxCap<=500?100:Math.ceil(maxCap/5/100)*100;
          for(let v=0;v<=maxCap;v+=step)ticks.push(v);if(ticks[ticks.length-1]<maxCap)ticks.push(Math.ceil(maxCap));
          const yMax=ticks[ticks.length-1]||maxCap;
          return(<><div className="dv"/><h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{lang==="fr"?"PROGRAMME D'ASSURANCE":"INSURANCE PROGRAMME"}</h3>
          <div className="card" style={{padding:20,marginBottom:20,overflow:"auto"}}>
            <div style={{display:"flex",minWidth:pl.length*60+40}}>
              {/* Y-axis */}
              <div style={{width:36,flexShrink:0,height:chartH,position:"relative"}}>
                {ticks.map(v=><span key={v} style={{position:"absolute",bottom:(v/yMax)*chartH-5,right:4,fontSize:8,color:"var(--t5)",whiteSpace:"nowrap"}}>{v}{v>0?"M":""}</span>)}
                <span style={{position:"absolute",top:-16,left:0,fontSize:8,color:"var(--t5)"}}>M€</span>
              </div>
              {/* Columns */}
              <div style={{flex:1,display:"flex",gap:8}}>
                {pl.map((p,pi)=>{const layers=[...(p.layers||[])].sort((a,b)=>(a.from||0)-(b.from||0));const colMax=layers.reduce((a,l)=>Math.max(a,l.to||0),0);
                  // Build breakpoints
                  const bpSet=new Set();layers.forEach(l=>{bpSet.add(l.from||0);bpSet.add(l.to||0)});
                  const breakpoints=[...bpSet].sort((a,b)=>a-b);
                  // Calculate horizontal position for each layer from the lowest band it appears in
                  // Width = absolute share (50% share = 50% width), not relative to total
                  const layerPos=new Map();
                  for(let i=0;i<breakpoints.length-1;i++){
                    const bFrom=breakpoints[i],bTo=breakpoints[i+1];
                    const active=layers.filter(l=>(l.from||0)<=bFrom&&(l.to||0)>=bTo);
                    let cumLeft=0;
                    active.forEach(l=>{
                      const idx=layers.indexOf(l);
                      const w=(l.share||100); // absolute %, 50 share = 50% width
                      if(!layerPos.has(idx))layerPos.set(idx,{left:cumLeft,width:w});
                      cumLeft+=w;
                    });
                  }
                  return(
                  <div key={pi} style={{flex:1,minWidth:50}}>
                    <div style={{height:chartH,position:"relative",borderLeft:"1px solid var(--b)",borderBottom:"1px solid var(--b)"}}>
                      {ticks.map(v=>v>0&&<div key={v} style={{position:"absolute",bottom:(v/yMax)*100+"%",left:0,right:0,borderTop:"1px dashed rgba(0,43,92,.08)",zIndex:1}}/>)}
                      {layers.map((l,li)=>{
                        const pos=layerPos.get(li)||{left:0,width:100};
                        const bottom=((l.from||0)/yMax)*100;
                        const height=Math.max(((l.to-l.from)/yMax)*100,1.5);
                        const hPx=Math.max((l.to-l.from)/yMax*chartH,6);
                        const isAig=(l.insurer||"").toUpperCase().includes("AIG");
                        const bg=getColor(l.insurer,li);
                        const isTop=l.to===colMax;
                        return(
                        <div key={li} style={{position:"absolute",bottom:bottom+"%",height:height+"%",left:pos.left+"%",width:pos.width+"%",background:bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"none",boxSizing:"border-box",borderRadius:isTop?"4px 4px 0 0":"0",cursor:"default",zIndex:2,padding:"2px 4px",boxShadow:isAig?"inset 0 0 0 2px rgba(255,215,0,.55)":"none"}} title={l.insurer+" \u2014 "+(l.share||100)+"% \u2014 "+l.from+"\u2192"+l.to+"M\u20ac"}>
                          {hPx>24&&<span style={{fontSize:pos.width<40?10:12,color:"#fff",fontWeight:isAig?700:600,lineHeight:1.15,textAlign:"center"}}>{l.insurer||"?"}{l.share&&l.share<100?" "+l.share+"%":l.share===100||!l.share?" 100%":""}</span>}
                          {hPx>40&&<span style={{fontSize:pos.width<40?8:10,color:"rgba(255,255,255,.85)",lineHeight:1.1,marginTop:2,textAlign:"center"}}>{l.from}→{l.to}M€</span>}
                          {hPx<=24&&hPx>10&&<span style={{fontSize:8,color:"#fff",fontWeight:isAig?700:500}}>{l.insurer?.substring(0,4)||"?"}</span>}
                        </div>)
                      })}
                    </div>
                    <div style={{textAlign:"center",marginTop:6}}>
                      <span style={{fontSize:9,fontWeight:600,color:"var(--t2)"}}>{lineLbl(p.line,lang)}</span>
                      <p style={{fontSize:7,color:"var(--t5)",marginTop:1}}>{colMax}M€</p>
                    </div>
                  </div>
                )})}

              </div>
            </div>
            {/* Legend */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16,justifyContent:"center",borderTop:"1px solid var(--b)",paddingTop:12}}>
              {[...new Set(pl.flatMap(p=>(p.layers||[]).map(l=>l.insurer)))].filter(Boolean).map((ins,i)=>{const isAig=ins.toUpperCase().includes("AIG");return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 6px",borderRadius:4,background:isAig?"rgba(0,43,92,.06)":"transparent"}}>
                  <div style={{width:10,height:10,borderRadius:2,background:getColor(ins,i)}}/>
                  <span style={{fontSize:9,color:"var(--t2)",fontWeight:isAig?600:400}}>{ins}</span>
                </div>
              )})}
            </div>
            <button className="btn" style={{padding:"6px 14px",fontSize:10,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",borderRadius:16,display:"block",margin:"14px auto 0"}} onClick={()=>openDossier(cid)}>{lang==="fr"?"Modifier le programme":"Edit programme"}</button>
          </div></>)})()}

        <div className="dv"/><h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("latest_signals")}</h3>
        <div className="sig-grid" style={{marginBottom:28}}>{sigs.map((s,i)=><SigCard key={s.id} s={s} d={i+1}/>)}{sigs.length===0&&<p style={{fontSize:13,color:"var(--t4)"}}>{t("no_signals_yet")}</p>}</div>
        <div className="dv"/><h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("fl_relevance")}</h3>
        {lines.length>0?<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:28}}>{lines.map(l=><span key={l} className="chip on">{lineLbl(l,lang)}</span>)}</div>:<p style={{fontSize:12,color:"var(--t4)",marginBottom:28}}>{t("no_line_data")}</p>}
        <div className="dv"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 className="lbl" style={{color:"var(--gold)"}}>{t("notes_title")}</h3><div style={{display:"flex",gap:6}}><button className="bi" style={{width:30,height:30,background:"rgba(220,38,38,.08)",borderColor:"rgba(239,68,68,.2)",color:"#991B1B"}} onClick={()=>{setRecCid(co.id);setShowRec(true);setTranscript("")}}><I.mic/></button><button className="bi" style={{width:30,height:30}} onClick={()=>{setNC(co.id);setSNN(true)}}><I.plus/></button></div></div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{cn.map(n=>{const cfg=NOTE_C[n.tag]||NOTE_C.observation;return (<div key={n.id} className="card" style={{padding:"14px 16px",position:"relative"}}><button style={{position:"absolute",top:6,right:6,width:20,height:20,borderRadius:5,background:"rgba(239,68,68,.08)",border:"1px solid rgba(220,38,38,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={()=>deleteN(n.id)}><I.x style={{width:10,height:10,color:"#DC2626"}}/></button><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingRight:24}}><span className="ftag" style={{background:cfg.bg,color:cfg.c}}>{noteTagLbl(n.tag,t)}</span><span style={{fontSize:10,color:"var(--t5)"}}>{fD(n.at,lang)}</span></div><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.55}}>{tx(n.text,lang)}</p></div>)})}{cn.length===0&&<p style={{fontSize:12,color:"var(--t4)"}}>{t("no_notes_sub")}</p>}</div>

        {/* ═══ ENRICHIR LA BASE ═══ */}
        <div className="dv"/>
        <h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{lang==="fr"?"ENRICHIR LA BASE":"ENRICH DATABASE"}</h3>
        <div className="card" style={{padding:18,marginBottom:20}}>
          <p style={{fontSize:12,color:"var(--t4)",marginBottom:12}}>{lang==="fr"?"Ajoutez des informations pour améliorer l'analyse de cette entreprise. Documents, rapports, notes de réunion, informations marché...":"Add information to improve analysis. Documents, reports, meeting notes, market intelligence..."}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn" style={{padding:"8px 14px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",flex:1}} onClick={()=>openDossier(co.id)}><I.note style={{width:12,height:12,marginRight:4}}/>{lang==="fr"?"Dossier client":"Client file"}</button>
            <button className="btn" style={{padding:"8px 14px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",flex:1}} onClick={()=>{setNC(co.id);setSNN(true)}}><I.plus style={{width:12,height:12,marginRight:4}}/>{lang==="fr"?"Ajouter une note":"Add note"}</button>
            <label className="btn" style={{padding:"8px 14px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",flex:1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><I.ext style={{width:12,height:12,marginRight:4}}/>{lang==="fr"?"Importer un fichier":"Upload file"}<input type="file" accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.txt,.png,.jpg,.jpeg,.pptx" style={{display:"none"}} onChange={e=>{if(editingDossier){handleFileUpload(e)}else{openDossier(co.id);setTimeout(()=>{const inp=document.querySelector('input[type=file]');if(inp)inp.click()},300)}}}/></label>
          </div>
        </div>
      </div>
    </div>)};

  // ── PAGES ──
  const render=()=>{
    if(selComp)return <CompPage cid={selComp}/>;
    if(tab==="dashboard")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{border:"1.5px solid rgba(255,255,255,.8)",padding:"1px 6px",fontSize:13,fontWeight:700,color:"#fff",borderRadius:2,flexShrink:0}}>AIG</span><span style={{fontSize:14,fontWeight:400,color:"rgba(255,255,255,.85)"}}>{t("dashboard_title")}</span>{autoRefresh&&<div className="pd" style={{marginLeft:4}}/>}</div><div style={{display:"flex",gap:8}}><button className="bi" style={{width:34,height:34}} onClick={()=>{setSSh(!showSearch);if(showSearch)setSrch("")}}>{showSearch?<I.x/>:<I.search/>}</button><button className="bi" style={{width:34,height:34}} onClick={()=>refreshSignals()} disabled={refreshing}><I.refresh style={{animation:refreshing?"spin 1s linear infinite":"none"}}/></button><button className="bi" style={{width:34,height:34,position:"relative"}} onClick={()=>{setNewCount(0);try{navigator.clearAppBadge&&navigator.clearAppBadge()}catch(e){}}}><I.bell/>{newCount>0&&<div style={{position:"absolute",top:3,right:3,minWidth:16,height:16,borderRadius:8,background:"#DC2626",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:700,color:"white"}}>{newCount>9?"9+":newCount}</span></div>}</button></div></div>{showSearch&&<input className="inp" style={{marginTop:12}} placeholder={t("search_placeholder")} value={search} onChange={e=>setSrch(e.target.value)} autoFocus/>}{lastRefresh&&<p style={{fontSize:10,color:"rgba(255,255,255,.45)",marginTop:8,textAlign:"right"}}>{lang==="fr"?"Dernière mise à jour :":"Last update:"} {new Date(lastRefresh).toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</p>}</div>
      <div style={{padding:"18px 20px"}}><p style={{fontSize:16,fontWeight:500,color:"var(--t1)",marginBottom:4}}>{greeting()}</p><p style={{fontSize:12,color:"var(--t4)",marginBottom:16}}>{t("dashboard_sub")}</p>
        <div className="card-el fi" style={{padding:"16px 18px",marginBottom:22,borderLeft:"3px solid var(--gold)",cursor:"pointer"}} onClick={()=>setSD(true)}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><p className="lbl" style={{color:"var(--gold)"}}>{t("daily_digest")} — {fFull()}</p>{sbOk&&<div className="pd"/>}</div>{liveSigs.length>0?<p style={{fontSize:14,color:"var(--t2)",lineHeight:1.45}}><strong style={{color:"var(--t1)"}}>{liveSigs.length}</strong> {t("signal_count")} · <strong style={{color:"var(--t1)"}}>{watched.length}</strong> {t("companies_monitored")}{digest.crit>0&&<> · <span style={{color:"#991B1B"}}>{digest.crit} {digest.crit>1?t("critical_signals"):t("critical_signal")}</span></>}</p>:<p style={{fontSize:13,color:"var(--t4)",lineHeight:1.45}}>{t("no_data_refresh")}</p>}{lastRefresh&&<p style={{fontSize:10,color:"var(--t5)",marginTop:6}}>{lang==="fr"?"Dernière mise à jour":"Last update"}: {new Date(lastRefresh).toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</p>}</div><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>{sbOk&&<span style={{fontSize:9,color:"#0072CE",fontWeight:600}}>LIVE</span>}<I.chR style={{color:"var(--t5)"}}/></div></div></div>
        <div className="fi fi1" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>{[{l:t("watchlist_label"),v:watched.length,c:"var(--gold)"},{l:t("active"),v:digest.total,c:"#0072CE"},{l:t("critical_lbl"),v:digest.crit,c:"#991B1B"}].map(x=>(<div key={x.l} className="card" style={{padding:"14px 12px",textAlign:"center"}}><p style={{fontSize:22,fontWeight:700,color:x.c,lineHeight:1}}>{x.v}</p><p className="lbl" style={{color:"var(--t4)",marginTop:5,fontSize:9}}>{x.l}</p></div>))}</div>
        <div className="fi fi2 hsb" style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:22}}><button className={`chip ${!activeCat?"on":""}`} onClick={()=>setACat(null)}>{t("all")}</button>{CATS.map(c=>{const cc=getCat(c.id,lang);return <button key={c.id} className={`chip ${activeCat===c.id?"on":""}`} onClick={()=>setACat(activeCat===c.id?null:c.id)}>{cc?.icon} {cc?.s}</button>})}</div>

        {/* Portfolio overview */}
        {watched.length>0&&<div className="fi fi2" style={{marginBottom:22}}>
          <h3 className="lbl" style={{color:"var(--gold)",marginBottom:12}}>{t("portfolio")}</h3>
          {/* Risk distribution bar */}
          {(()=>{const buckets=[{l:lang==="fr"?"Critique":"Critical",c:"#DC2626",min:75,max:100},{l:lang==="fr"?"Élevé":"High",c:"#D97706",min:50,max:74},{l:lang==="fr"?"Moyen":"Medium",c:"#3B82F6",min:25,max:49},{l:lang==="fr"?"Faible":"Low",c:"#16A34A",min:0,max:24}];const counts=buckets.map(b=>({...b,n:watched.filter(c=>(c.risk||50)>=b.min&&(c.risk||50)<=b.max).length}));const total=watched.length||1;return (
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
              {(()=>{const allLines=wlSigs.flatMap(s=>getImpsAll(s.id).flatMap(i=>(i.line||"").split("|").map(l=>l.trim()).filter(Boolean)));const lineCounts={};allLines.forEach(l=>{lineCounts[l]=(lineCounts[l]||0)+1});const sorted=Object.entries(lineCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);return sorted.length>0?sorted.map(([l,n])=><div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:"var(--t2)"}}>{lineLbl(l,lang)}</span>
                <span style={{fontSize:10,fontWeight:600,color:"var(--gold)"}}>{n}</span>
              </div>):<p style={{fontSize:10,color:"var(--t5)",fontStyle:"italic"}}>{lang==="fr"?"Aucun signal":"No signals"}</p>})()}
            </div>
          </div>
        </div>}


        {/* ═══ SMART ALERTS SECTION ═══ */}
        {(upcomingBriefs.length>0||commercialOpps.length>0||inactivityAlerts.length>0)&&<div className="fi fi2" style={{marginBottom:22}}>
          <h3 className="lbl" style={{color:"var(--gold)",marginBottom:12}}>{t("smart_alerts")}</h3>

          {/* Auto pre-meeting briefs */}
          {upcomingBriefs.map(m=>{const lbl=mtgLabel(m);return (
            <div key={m.id} className="card" style={{padding:"14px 18px",marginBottom:10,borderLeft:"3px solid #DC2626",cursor:"pointer"}} onClick={()=>{setBC(m.cid);setSB(true)}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Logo name={m.co?.name} sz={22} fallback={m.co?.logo}/>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{m.co?.name}</span>
                </div>
                <span className="badge" style={{background:"rgba(220,38,38,.08)",color:"#991B1B"}}>{lbl.l}</span>
              </div>
              <p style={{fontSize:12,color:"var(--t2)",marginBottom:4}}>{t("auto_brief_sub")}</p>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,color:"var(--t4)"}}>{m.sigCount} {m.sigCount>1?t("signals_lc"):t("signal")} · {m.critCount} {t("critical_lbl").toLowerCase()}</span>
              </div>
            </div>
          )})}

          {/* Commercial windows */}
          {commercialOpps.length>0&&commercialOpps.map(opp=>{const urgCol=opp.urgency==="critical"?"#DC2626":opp.urgency==="high"?"#D97706":"#2563EB";const urgBg=opp.urgency==="critical"?"rgba(220,38,38,.08)":opp.urgency==="high"?"rgba(217,119,6,.08)":"rgba(37,99,235,.08)";return (
            <div key={opp.co.id} className="card" style={{padding:"14px 18px",marginBottom:10,borderLeft:`3px solid ${urgCol}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Logo name={opp.co.name} sz={22} fallback={opp.co.logo}/>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{opp.co.name}</span>
                </div>
                <span className="badge" style={{background:urgBg,color:urgCol}}>{t("renewal_window")} {opp.daysUntil}j</span>
              </div>
              <p style={{fontSize:12,color:"var(--t2)",marginBottom:6}}>{opp.recentCrit.length} {lang==="fr"?"signal(s) récent(s)":"recent signal(s)"} · {opp.impactedLines.map(l=>lineLbl(l,lang)).join(", ")||"—"}</p>
              <div style={{display:"flex",gap:8}}>
                <button className="btn" style={{padding:"4px 12px",fontSize:11,borderRadius:16,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)"}} onClick={()=>{setBC(opp.co.id);setSB(true)}}>{t("generate_brief")}</button>
                {opp.recentCrit[0]&&<button className="btn" style={{padding:"4px 12px",fontSize:11,borderRadius:16,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)"}} onClick={()=>{setEmailSignal(opp.recentCrit[0]);setEmailType("broker")}}>{t("email_to_broker")}</button>}
              </div>
            </div>
          )})}

          {/* Inactivity alerts */}
          {inactivityAlerts.slice(0,3).map(alert=>(
            <div key={alert.co.id} className="card" style={{padding:"12px 18px",marginBottom:10,borderLeft:"3px solid #D97706"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Logo name={alert.co.name} sz={22} fallback={alert.co.logo}/>
                  <div>
                    <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{alert.co.name}</span>
                    <p style={{fontSize:11,color:"#92400E"}}>{alert.noRecord?(lang==="fr"?"Aucune interaction enregistrée":"No interaction recorded"):t("no_interaction_since")+" "+alert.daysSince+" "+t("days")}</p>
                  </div>
                </div>
                <button className="btn" style={{padding:"4px 12px",fontSize:11,borderRadius:16,background:"rgba(217,119,6,.08)",color:"#92400E",border:"1px solid rgba(217,119,6,.15)"}} onClick={()=>{setMtgCo(alert.co.id);setSNM(true)}}>{t("plan_action")}</button>
              </div>
            </div>
          ))}
        </div>}

        {/* ═══ MONTHLY KPIs ═══ */}
        <div className="fi fi2" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:22}}>
          {[
            {v:monthlyKpis.briefs,l:t("briefs_generated"),c:"var(--gold)"},
            {v:monthlyKpis.meetings,l:t("meetings_prepared"),c:"var(--gold2)"},
            {v:monthlyKpis.signals,l:t("signals_processed"),c:"#0072CE"},
            {v:monthlyKpis.opps,l:t("opps_detected"),c:"#16A34A"}
          ].map(x=>(
            <div key={x.l} className="cs" style={{padding:"10px 8px",textAlign:"center"}}>
              <p style={{fontSize:20,fontWeight:700,color:x.c,lineHeight:1}}>{x.v}</p>
              <p style={{fontSize:8,color:"var(--t4)",marginTop:4,lineHeight:1.2}}>{x.l}</p>
            </div>
          ))}
        </div>

        {/* ═══ WEEKLY SUMMARY CARD ═══ */}
        <div className="card fi fi2" style={{padding:"14px 18px",marginBottom:22,cursor:"pointer"}} onClick={()=>setShowWeekly(true)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <p className="lbl" style={{color:"var(--gold)",marginBottom:4}}>{t("weekly_summary")}</p>
              <p style={{fontSize:12,color:"var(--t3)"}}>{weeklyData.total} {t("signal_count")} · {weeklyData.crit} {t("critical_lbl").toLowerCase()}</p>
            </div>
            <I.chR style={{color:"var(--t5)"}}/>
          </div>
        </div>

        <div className="fi fi3" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 className="lbl" style={{color:"var(--t4)"}}>{t("priority_feed")}</h3>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}><button className="btn" style={{padding:"4px 10px",fontSize:10,background:sortMode==="recent"?"var(--gbg)":"var(--bg3)",color:sortMode==="recent"?"var(--gold)":"var(--t5)"}} onClick={()=>{setSortMode("recent");lsSet("sortMode","recent")}}>{t("sort_recent")}</button><button className="btn" style={{padding:"4px 10px",fontSize:10,background:sortMode==="important"?"var(--gbg)":"var(--bg3)",color:sortMode==="important"?"var(--gold)":"var(--t5)",borderLeft:"1px solid var(--b)"}} onClick={()=>{setSortMode("important");lsSet("sortMode","important")}}>{t("sort_important")}</button><button className="btn" style={{padding:"4px 10px",fontSize:10,background:sortMode==="company"?"var(--gbg)":"var(--bg3)",color:sortMode==="company"?"var(--gold)":"var(--t5)",borderLeft:"1px solid var(--b)"}} onClick={()=>{setSortMode("company");lsSet("sortMode","company")}}>{lang==="fr"?"Entreprise":"Company"}</button></div>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}><button className="btn" style={{padding:"4px 8px",background:viewMode==="grid"?"var(--gbg)":"var(--bg3)",color:viewMode==="grid"?"var(--gold)":"var(--t5)"}} onClick={()=>{setViewMode("grid");lsSet("viewMode","grid")}}>▦</button><button className="btn" style={{padding:"4px 8px",background:viewMode==="list"?"var(--gbg)":"var(--bg3)",color:viewMode==="list"?"var(--gold)":"var(--t5)",borderLeft:"1px solid var(--b)"}} onClick={()=>{setViewMode("list");lsSet("viewMode","list")}}>☰</button></div>
          </div>
        </div>
        {viewMode==="grid"?<div className="sig-grid">{sortMode==="company"?(()=>{let lastCo="";return wlSigs.map((s,i)=>{const coName=s.company||"";const showHeader=coName!==lastCo;lastCo=coName;const co=cos.find(c=>c.id===s.cid)||cos.find(c=>c.name===coName);return (<div key={s.id||i} style={{gridColumn:showHeader?"1/-1":undefined}}>{showHeader&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 0 8px",borderBottom:"2px solid var(--b)",marginBottom:8}}>{co&&<Logo name={co.name} sz={24} fallback={co.logo}/>}<span style={{fontSize:14,fontWeight:600,color:"var(--gold)"}}>{coName}</span><span style={{fontSize:11,color:"var(--t5)"}}>{wlSigs.filter(x=>x.company===coName).length} {lang==="fr"?"signal(s)":"signal(s)"}</span></div>}<SigCard s={s} d={Math.min(i+1,5)}/></div>)})})():wlSigs.map((s,i)=> <SigCard key={s.id||i} s={s} d={Math.min(i+1,5)}/>)}{wlSigs.length===0&&<div style={{textAlign:"center",padding:"56px 20px",gridColumn:"1/-1"}}><div style={{width:40,height:40,borderRadius:8,background:"var(--b)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{fontSize:12,fontWeight:700,color:"var(--t4)"}}>AIG</span></div><p style={{fontSize:15,color:"var(--t3)",marginBottom:4,fontWeight:500}}>{search||activeCat?t("no_signals_match"):t("no_signals_yet")}</p><p style={{fontSize:13,color:"var(--t5)"}}>{search||activeCat?t("adjust_filters"):t("radar_will_update")}</p></div>}</div>
        :<div style={{display:"flex",flexDirection:"column",gap:2}}>{wlSigs.map((s,i)=>{const cat=getCat(s.cat,lang);const co=cos.find(c=>c.id===s.cid)||cos.find(c=>s.company&&(c.name.toLowerCase()===s.company.toLowerCase()||s.company.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])));const imps=getImpsAll(s.id);return (
          <div key={s.id||i} className={`fi fi${Math.min(i+1,5)}`} style={{padding:"12px 16px",borderBottom:"1px solid var(--b)",cursor:"pointer",background:i%2===0?"transparent":"rgba(0,43,92,.03)"}} onClick={()=>setSS(s)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                <span className="badge" style={{background:sBg(s.imp||50),color:sT(s.imp||50),flexShrink:0}}>{s.imp||50}</span>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12,fontWeight:600,color:"var(--t1)",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx(s.title,lang)||s.company||"—"}</p>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                    <Logo name={co?.name||s.company} sz={16} fallback={co?.logo}/>
                    <span style={{fontSize:10,color:"var(--gold2)",fontWeight:500}}>{co?.name||s.company||"—"}</span>
                    <span style={{fontSize:9,color:"var(--t5)"}}>·</span>
                    <span style={{fontSize:10,color:cat?.c||"var(--t4)"}}>{cat?.icon} {cat?.s||""}</span>
                    {imps.length>0&&<>{imps.slice(0,2).map((im,idx)=><span key={idx} style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:LVL_BG[im.lvl]||"rgba(37,99,235,.08)",color:LVL_T[im.lvl]||"#1E40AF"}}>{lineLbl(im.line,lang)}</span>)}</>}
                  </div>
                </div>
              </div>
              <span style={{fontSize:10,color:"var(--t5)",flexShrink:0,marginLeft:8}}>{s.at?fD(s.at,lang):"—"}</span>
            </div>
          </div>)})}
          {wlSigs.length===0&&<div style={{textAlign:"center",padding:"56px 20px"}}><p style={{fontSize:15,color:"var(--t3)",marginBottom:4,fontWeight:500}}>{search||activeCat?t("no_signals_match"):t("no_signals_yet")}</p></div>}
        </div>}
      </div>
    </div>);

    if(tab==="watchlist")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><h2 style={{fontSize:18,fontWeight:700,color:"#fff"}}>{t("watchlist_title")}</h2><p style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:4}}>{t("watchlist_sub")}</p></div>
      <div style={{padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 className="lbl" style={{color:"var(--gold)"}}>{t("tracked")} ({watched.length})</h3>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}>{[{k:"risk",l:t("sort_risk")},{k:"alpha",l:t("sort_alpha")},{k:"signals",l:t("sort_signals")},{k:"broker",l:lang==="fr"?"Courtier":"Broker"}].map(s=><button key={s.k} className="btn" style={{padding:"4px 10px",fontSize:10,background:wlSort===s.k?"var(--gbg)":"var(--bg3)",color:wlSort===s.k?"var(--gold)":"var(--t5)",borderRight:"1px solid var(--b)"}} onClick={()=>{setWlSort(s.k);lsSet("wlSort",s.k)}}>{s.l}</button>)}</div>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"1px solid var(--b)"}}><button className="btn" style={{padding:"4px 8px",background:wlView==="grid"?"var(--gbg)":"var(--bg3)",color:wlView==="grid"?"var(--gold)":"var(--t5)"}} onClick={()=>{setWlView("grid");lsSet("wlView","grid")}}>▦</button><button className="btn" style={{padding:"4px 8px",background:wlView==="list"?"var(--gbg)":"var(--bg3)",color:wlView==="list"?"var(--gold)":"var(--t5)",borderLeft:"1px solid var(--b)"}} onClick={()=>{setWlView("list");lsSet("wlView","list")}}>☰</button></div>
          </div>
        </div>
        {(()=>{const sorted=[...watched].sort((a,b)=>{if(wlSort==="alpha")return a.name.localeCompare(b.name);if(wlSort==="signals")return getSigs(b.id).length-getSigs(a.id).length;if(wlSort==="broker"){const ba=(getDossier(a.id)?.broker||"ZZZ").toLowerCase();const bb=(getDossier(b.id)?.broker||"ZZZ").toLowerCase();if(ba!==bb)return ba.localeCompare(bb);return a.name.localeCompare(b.name)}return(b.risk||0)-(a.risk||0)});
        return wlView==="grid"?
        <div style={{marginBottom:28}}>{(()=>{let lastBroker="";const groups=[];let current=null;sorted.forEach((c,i)=>{const dos=getDossier(c.id);const broker=dos?.broker||"";if(wlSort==="broker"&&broker!==lastBroker){current={broker,items:[]};groups.push(current);lastBroker=broker}else if(!current){current={broker:null,items:[]};groups.push(current)}current.items.push({c,i})});return groups.map((g,gi)=>(<div key={gi}>
          {wlSort==="broker"&&<div style={{padding:"10px 16px",background:"rgba(0,114,206,.04)",borderBottom:"2px solid var(--b)",marginTop:gi>0?16:0,marginBottom:10,borderRadius:6}}><span style={{fontSize:12,fontWeight:700,color:"var(--gold)"}}>{g.broker||( lang==="fr"?"Sans courtier":"No broker")}</span><span style={{fontSize:10,color:"var(--t5)",marginLeft:8}}>{g.items.length} {lang==="fr"?"entreprise(s)":"company(ies)"}</span></div>}
          <div className="co-grid">{g.items.map(({c,i})=>{const sc=getSigs(c.id).length;return (
            <div key={c.id} className={`card fi fi${Math.min(i+1,5)} prio-${c.prio}`} style={{padding:"16px 18px",position:"relative"}}>
              <button style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:6,background:"rgba(239,68,68,.08)",border:"1px solid rgba(220,38,38,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={(e)=>{e.stopPropagation();togW(c.id)}}><I.x style={{width:12,height:12,color:"#DC2626"}}/></button>
              <button style={{width:"100%",textAlign:"left",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",color:"inherit",padding:0}} onClick={()=>setSC(c.id)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}><Logo name={c.name} sz={24} fallback={c.logo}/><div style={{minWidth:0}}><h4 style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{c.name}</h4><p style={{fontSize:12,color:"var(--t4)",marginTop:2}}>{tx(c.sector,lang)}</p><div style={{display:"flex",gap:8,marginTop:6}}><span style={{fontSize:10,color:"var(--t5)"}}>{sc} {sc>1?t("signals_lc"):t("signal")}</span><span className="lbl" style={{fontSize:8,color:c.prio==="primary"?"var(--gold)":c.prio==="secondary"?"#0072CE":"var(--t5)"}}>{t(c.prio)}</span></div></div></div><SR s={c.risk} sz={40} sw={2.5}/></div>
              </button>
            </div>)})}</div>
        </div>))})()}</div>
        :<div style={{marginBottom:28}}>
        <div style={{display:"grid",gridTemplateColumns:"32px 1fr 80px 50px 50px 36px 22px",alignItems:"center",gap:8,padding:"6px 16px",borderBottom:"2px solid var(--b)"}}><span/><span className="lbl" style={{fontSize:8,color:"var(--t5)"}}>{lang==="fr"?"ENTREPRISE":"COMPANY"}</span><span className="lbl" style={{fontSize:8,color:"var(--t5)"}}>{lang==="fr"?"LIGNES":"LINES"}</span><span className="lbl" style={{fontSize:8,color:"var(--t5)",textAlign:"center"}}>{lang==="fr"?"SIG.":"SIG."}</span><span className="lbl" style={{fontSize:8,color:"var(--t5)",textAlign:"center"}}>NOTES</span><span className="lbl" style={{fontSize:8,color:"var(--t5)",textAlign:"center"}}>{lang==="fr"?"RISQ.":"RISK"}</span><span/></div>
        {(()=>{let lastBroker="";return sorted.map((c,i)=>{const sc=getSigs(c.id).length;const nc=getNotes(c.id).length;const lines=getLinesAll(getSigs(c.id));const dos=getDossier(c.id);const broker=dos?.broker||"";const showBrokerHeader=wlSort==="broker"&&broker!==lastBroker;if(wlSort==="broker")lastBroker=broker;return (<div key={c.id}>
          {showBrokerHeader&&<div style={{padding:"10px 16px",background:"rgba(0,114,206,.04)",borderBottom:"2px solid var(--b)",marginTop:i>0?12:0}}><span style={{fontSize:12,fontWeight:700,color:"var(--gold)"}}>{broker||( lang==="fr"?"Sans courtier":"No broker")}</span><span style={{fontSize:10,color:"var(--t5)",marginLeft:8}}>{sorted.filter(x=>(getDossier(x.id)?.broker||"")===broker).length} {lang==="fr"?"entreprise(s)":"company(ies)"}</span></div>}
          <div className={`fi fi${Math.min(i+1,5)}`} style={{padding:"10px 16px",borderBottom:"1px solid var(--b)",background:i%2===0?"transparent":"rgba(0,43,92,.03)",display:"grid",gridTemplateColumns:"32px 1fr 80px 50px 50px 36px 22px",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setSC(c.id)}>
              <Logo name={c.name} sz={28} fallback={c.logo}/>
              <div style={{minWidth:0}}>
                <h4 style={{fontSize:12,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</h4>
                <p style={{fontSize:9,color:"var(--t4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>{tx(c.sector,lang)}</p>
              </div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"flex-start"}}>{lines.length>0?lines.slice(0,2).map(l=><span key={l} style={{fontSize:7,padding:"1px 5px",borderRadius:5,background:"rgba(96,165,250,.1)",color:"#1E40AF",whiteSpace:"nowrap"}}>{lineLbl(l,lang)}</span>):<span style={{fontSize:7,color:"var(--t5)"}}>—</span>}</div>
              <div style={{textAlign:"center"}}><span style={{fontSize:11,color:sc>0?"#0072CE":"var(--t5)",fontWeight:sc>0?600:400}}>{sc}</span><p style={{fontSize:7,color:"var(--t5)",marginTop:1}}>{t("signals_lc")}</p></div>
              <div style={{textAlign:"center"}}><span style={{fontSize:11,color:nc>0?"var(--gold2)":"var(--t5)",fontWeight:nc>0?600:400}}>{nc}</span><p style={{fontSize:7,color:"var(--t5)",marginTop:1}}>{t("notes_lc")}</p></div>
              <SR s={c.risk} sz={32} sw={2}/>
              <button style={{width:20,height:20,borderRadius:5,background:"rgba(239,68,68,.08)",border:"1px solid rgba(220,38,38,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={e=>{e.stopPropagation();togW(c.id)}}><I.x style={{width:9,height:9,color:"#DC2626"}}/></button>
          </div></div>)})})()}
        </div>;})()}{watched.length===0&&<div style={{textAlign:"center",padding:"48px 20px"}}><p style={{fontSize:14,color:"var(--t3)",fontWeight:500,marginBottom:4}}>{t("no_companies_yet")}</p><p style={{fontSize:13,color:"var(--t5)"}}>{t("no_companies_sub")}</p></div>}
        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:10}}>{t("add_company")}</h3><input className="inp" style={{marginBottom:14}} placeholder={t("search_company")} value={addSrch} onChange={e=>{setAS(e.target.value);searchExternal(e.target.value)}}/>{(()=>{const localFiltered=cos.filter(c=>!c.prio).filter(c=>!addSrch||c.name.toLowerCase().includes(addSrch.toLowerCase())||(c.ticker||"").toLowerCase().includes(addSrch.toLowerCase())||tx(c.sector,lang).toLowerCase().includes(addSrch.toLowerCase()));return (<><div style={{display:"flex",flexDirection:"column",gap:10}}>{localFiltered.slice(0,10).map(c=>(<div key={c.id} className="card" style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><button style={{flex:1,textAlign:"left",background:"none",border:"none",cursor:"pointer",minWidth:0,fontFamily:"inherit",color:"inherit"}} onClick={()=>setSC(c.id)}><h4 style={{fontSize:13,fontWeight:500,color:"var(--t2)"}}>{c.name}</h4><p style={{fontSize:11,color:"var(--t4)"}}>{tx(c.sector,lang)}</p></button><button className="btn bp" style={{padding:"6px 14px",fontSize:12}} onClick={()=>togW(c.id)}><I.plus/>{t("add_to_watchlist")}</button></div>))}</div>{addSrch.length>=3&&<>{extLoading&&<p style={{fontSize:12,color:"var(--t4)",marginTop:14,textAlign:"center"}}>{t("searching")}</p>}{!extLoading&&extRes.length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginTop:18,marginBottom:10}}>{t("ext_results")}</h4><div style={{display:"flex",flexDirection:"column",gap:10}}>{extRes.map((r,i)=>(<div key={i} className="card" style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:"rgba(0,114,206,.15)"}}><div style={{flex:1,minWidth:0}}><h4 style={{fontSize:13,fontWeight:500,color:"var(--t1)"}}>{r.name}</h4><p style={{fontSize:11,color:"var(--t4)",marginTop:2,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.desc}</p></div><button className="btn bp" style={{padding:"6px 14px",fontSize:12,flexShrink:0,marginLeft:10}} onClick={()=>addExtCompany(r.name,r.desc)}><I.plus/>{lang==="fr"?"Ajouter":"Add"}</button></div>))}</div></>}{!extLoading&&extRes.length===0&&localFiltered.length===0&&addSrch.length>=3&&<p style={{fontSize:12,color:"var(--t4)",marginTop:14,textAlign:"center"}}>{t("no_ext_results")}</p>}</>}</>)})()}
      </div>
    </div>);

    if(tab==="signals")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h2 style={{fontSize:18,fontWeight:700,color:"#fff"}}>{t("all_signals")}</h2><button className="bi" style={{width:34,height:34}} onClick={()=>{setSSh(!showSearch);if(showSearch)setSrch("")}}>{showSearch?<I.x/>:<I.filter/>}</button></div>{showSearch&&<input className="inp" style={{marginBottom:12}} placeholder={t("filter_signals")} value={search} onChange={e=>setSrch(e.target.value)} autoFocus/>}<div className="hsb" style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}><button className={`chip ${!activeCat?"on":""}`} onClick={()=>setACat(null)}>{t("all")}</button>{CATS.map(c=>{const cc=getCat(c.id,lang);return <button key={c.id} className={`chip ${activeCat===c.id?"on":""}`} onClick={()=>setACat(activeCat===c.id?null:c.id)}>{cc?.icon} {cc?.s}</button>})}</div></div>
      <div style={{padding:"18px 20px"}}><div className="sig-grid">{allSigs.map((s,i)=><SigCard key={s.id} s={s} d={Math.min(i+1,5)}/>)}</div></div>
    </div>);

    if(tab==="notes")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:18,fontWeight:700,color:"#fff"}}>{t("notes_title")}</h2><button className="btn bp" style={{padding:"6px 14px",fontSize:12}} onClick={()=>setSNN(true)}><I.plus/>{t("new_note")}</button></div></div>
      <div style={{padding:"18px 20px"}}><div className="hsb" style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto"}}>{[null,"observation","hypothesis","action","question","decision"].map(tg=><button key={tg??"all"} className={`chip ${noteFilter===tg?"on":""}`} onClick={()=>setNF(tg)}>{tg?noteTagLbl(tg,t):t("all")}</button>)}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{(noteFilter?notes.filter(n=>n.tag===noteFilter):notes).map((n,i)=>{const cfg=NOTE_C[n.tag]||NOTE_C.observation;const co=n.cid?cos.find(c=>c.id===n.cid):null;return (<div key={n.id} className={`card fi fi${Math.min(i+1,5)}`} style={{padding:"16px 18px",position:"relative"}}><button style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:6,background:"rgba(239,68,68,.08)",border:"1px solid rgba(220,38,38,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={()=>deleteN(n.id)}><I.x style={{width:12,height:12,color:"#DC2626"}}/></button><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingRight:28}}><div style={{display:"flex",alignItems:"center",gap:8}}><span className="ftag" style={{background:cfg.bg,color:cfg.c}}>{noteTagLbl(n.tag,t)}</span>{co&&<span style={{fontSize:11,fontWeight:500,color:"var(--gold2)"}}>{co.name}</span>}</div><span style={{fontSize:10,color:"var(--t5)"}}>{fD(n.at,lang)}</span></div><p style={{fontSize:13,color:"var(--t2)",lineHeight:1.6}}>{typeof n.text==="object"?tx(n.text,lang):n.text}</p></div>)})}{notes.length===0&&<div style={{textAlign:"center",padding:"60px 20px"}}><p style={{fontSize:15,color:"var(--t3)",fontWeight:500,marginBottom:4}}>{t("no_notes_yet")}</p><p style={{fontSize:13,color:"var(--t5)",marginBottom:20}}>{t("no_notes_sub")}</p><button className="btn bp" onClick={()=>setSNN(true)}><I.plus/>{t("add_first_note")}</button></div>}</div>
      </div>
    </div>);

    if(tab==="brief")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h2 style={{fontSize:18,fontWeight:700,color:"#fff"}}>{t("brief_title")}</h2><p style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:4}}>{t("brief_sub")}</p></div><button className="btn bp" style={{padding:"7px 14px",fontSize:12}} onClick={()=>setSNM(true)}><I.calendar/>{t("add_meeting")}</button></div></div>
      <div style={{padding:"18px 20px"}}>
        {/* Upcoming meetings */}
        {upcomingMtgs.length>0&&<><h3 className="lbl" style={{color:"var(--gold)",marginBottom:12}}><I.calendar style={{width:14,height:14,display:"inline",marginRight:6}}/>{t("upcoming")} ({upcomingMtgs.length})</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>{upcomingMtgs.map((mtg,i)=>{const co=cos.find(c=>c.id===mtg.cid);const ml=mtgLabel(mtg);const d=new Date(mtg.date);return (
          <div key={mtg.id} className={`card fi fi${Math.min(i+1,5)}`} style={{padding:"16px 18px",borderLeft:`3px solid ${ml.c}`,position:"relative"}}>
            <button style={{position:"absolute",top:8,right:8,width:20,height:20,borderRadius:5,background:"rgba(239,68,68,.08)",border:"1px solid rgba(220,38,38,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={()=>deleteMeeting(mtg.id)}><I.x style={{width:10,height:10,color:"#DC2626"}}/></button>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingRight:24}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:700,color:ml.c,textTransform:"uppercase"}}>{ml.l}</span>
                  <span className="ftag" style={{background:mtg.type==="broker"?"rgba(0,114,206,.15)":mtg.type==="autre"?"rgba(139,92,246,.15)":"rgba(96,165,250,.15)",color:mtg.type==="broker"?"var(--gold)":mtg.type==="autre"?"#5B21B6":"#1E40AF"}}>{mtg.type==="broker"?t("meeting_broker"):mtg.type==="rm"?t("meeting_rm"):mtg.type==="autre"?t("meeting_other"):t("meeting_internal")}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  {co&&<><Logo name={co.name} sz={24} fallback={co.logo}/><span style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{co.name}</span></>}
                </div>
                <p style={{fontSize:11,color:"var(--t4)"}}>{d.toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{weekday:"long",day:"numeric",month:"long"})} · {d.toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</p>
                {mtg.notes&&<p style={{fontSize:11,color:"var(--t5)",marginTop:4,fontStyle:"italic"}}>{mtg.notes}</p>}
                {mtg.contact&&mtg.contact.name&&<div style={{marginTop:6,padding:"6px 10px",background:"rgba(91,33,182,.06)",borderRadius:6,border:"1px solid rgba(139,92,246,.12)"}}>
                  <p style={{fontSize:11,fontWeight:600,color:"#5B21B6"}}>{mtg.contact.name}{mtg.contact.role&&<span style={{fontWeight:400,color:"var(--t4)"}}> — {mtg.contact.role}</span>}</p>
                  <div style={{display:"flex",gap:10,marginTop:3}}>{mtg.contact.phone&&<span style={{fontSize:10,color:"var(--t4)"}}>📞 {mtg.contact.phone}</span>}{mtg.contact.email&&<span style={{fontSize:10,color:"var(--t4)"}}>✉️ {mtg.contact.email}</span>}</div>
                </div>}
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
            <div style={{display:"flex",alignItems:"center",gap:8}}>{co&&<Logo name={co.name} sz={22} fallback={co.logo}/>}<span style={{fontSize:12,color:"var(--t3)"}}>{co?.name||"—"}</span><span style={{fontSize:10,color:"var(--t5)"}}>{fD(mtg.date,lang)}</span></div>
            <button style={{width:18,height:18,borderRadius:4,background:"rgba(239,68,68,.06)",border:"1px solid rgba(220,38,38,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}} onClick={()=>deleteMeeting(mtg.id)}><I.x style={{width:9,height:9,color:"#DC2626"}}/></button>
          </div>)})}</div></>}

        {meetings.length===0&&<div style={{textAlign:"center",padding:"32px 20px",marginBottom:24}}><I.calendar style={{width:32,height:32,color:"var(--b2)",margin:"0 auto 12px",display:"block"}}/><p style={{fontSize:13,color:"var(--t4)",marginBottom:12}}>{t("no_meetings")}</p><button className="btn bp" style={{padding:"8px 18px",fontSize:12}} onClick={()=>setSNM(true)}><I.plus/>{t("add_meeting")}</button></div>}

        {/* Company list for quick brief */}
        <div className="dv" style={{marginBottom:18}}/>
        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{t("brief_title")} — {t("generate")}</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{[...watched].sort((a,b)=>a.name.localeCompare(b.name)).map((c,i)=>{const sc=getSigs(c.id).length;const nc=getNotes(c.id).length;const lb=getLastBriefDate(c.id);const ns=getNewSignalsSinceLastBrief(c.id).length;const bh=getBriefHistory(c.id).length;const dos=getDossier(c.id);return (<div key={c.id} className={`card fi fi${Math.min(i+1,5)}`} style={{padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,flex:1,cursor:"pointer"}} onClick={()=>setSC(c.id)}><Logo name={c.name} sz={24} fallback={c.logo}/><div><h4 style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{c.name}</h4><p style={{fontSize:11,color:"var(--t4)",marginTop:2}}>{sc} {sc>1?t("signals_lc"):t("signal")} · {nc} {nc>1?t("notes_lc"):t("note_lc")}{lb&&<span style={{color:"var(--t5)"}}> · Brief {fD(lb,lang)}</span>}{ns>0&&<span style={{color:"#16A34A",fontWeight:600}}> · {ns}</span>}</p></div></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button className="btn" style={{padding:"5px 10px",fontSize:10,background:dos?"rgba(91,33,182,.08)":"var(--bg3)",color:dos?"#5B21B6":"var(--t5)",border:`1px solid ${dos?"rgba(139,92,246,.2)":"var(--b)"}`,borderRadius:6}} onClick={()=>openDossier(c.id)}>{dos?"/":"+"} {lang==="fr"?"Dossier":"File"}</button>
              <button className="btn bp" style={{padding:"7px 16px",fontSize:12}} onClick={()=>{setBC(c.id);setSB(true);setCopied(false)}}>{t("generate")}</button>
            </div>
          </div>
        </div>)})}</div>
      </div>
    </div>);

    if(tab==="settings")return (<div style={{paddingBottom:100}}>
      <div className="hdr"><h2 style={{fontSize:18,fontWeight:700,color:"#fff"}}>{t("settings_title")}</h2></div>
      <div style={{padding:"24px 20px"}}>
        <h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{t("profile")}</h3>
        <div className="card" style={{padding:"18px",marginBottom:28}}><div style={{display:"flex",alignItems:"center",gap:14}}><div className="mono" style={{width:44,height:44,fontSize:16,background:"var(--gold)",color:"#fff"}}>{(authEmail||"AS").substring(0,2).toUpperCase()}</div><div><p style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{authEmail||"Anne-Sophie"}</p><p style={{fontSize:12,color:"var(--t4)",marginTop:2}}>Senior Account Manager — Financial Lines France</p></div></div></div>
        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{lang==="fr"?"AFFICHAGE":"DISPLAY"}</h3>
        <div className="card" style={{padding:"16px 18px",marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:13,color:"var(--t2)"}}>{lang==="fr"?"Taille du texte":"Text size"}</span>
            <span style={{fontSize:12,color:"var(--gold2)",fontWeight:600}}>{Math.round(fontScale*100)}%</span>
          </div>
          <input type="range" min="0.85" max="1.4" step="0.05" value={fontScale} onChange={e=>{const v=parseFloat(e.target.value);setFontScale(v);lsSet("fontScale",v)}} style={{width:"100%",accentColor:"#002B5C"}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:10,color:"var(--t5)"}}>A</span>
            <span style={{fontSize:14,color:"var(--t5)",fontWeight:600}}>A</span>
          </div>
        </div>

        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{lang==="fr"?"AIDE":"HELP"}</h3>
        <button className="btn" style={{width:"100%",padding:"12px",fontSize:13,color:"var(--gold)",background:"rgba(0,43,92,.04)",border:"1px solid rgba(0,43,92,.12)",borderRadius:8,cursor:"pointer",marginBottom:28}} onClick={()=>{setShowGuide(true);setGuideSection(0)}}><I.search style={{width:14,height:14,marginRight:6}}/>{lang==="fr"?"Guide d'utilisation":"User guide"}</button>

        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{lang==="fr"?"EXPORT & DONNÉES":"EXPORT & DATA"}</h3>
        <button className="btn" style={{width:"100%",padding:"12px",fontSize:13,color:"var(--gold2)",background:"rgba(0,114,206,.04)",border:"1px solid rgba(0,114,206,.12)",borderRadius:8,cursor:"pointer",marginBottom:28}} onClick={()=>setShowExport(true)}><I.ext style={{width:14,height:14,marginRight:6}}/>{lang==="fr"?"Exporter mes données":"Export my data"}</button>

        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{lang==="fr"?"SUPPORT":"SUPPORT"}</h3>
        <button className="btn" style={{width:"100%",padding:"12px",fontSize:13,color:"var(--gold2)",background:"rgba(0,114,206,.04)",border:"1px solid rgba(0,114,206,.12)",borderRadius:8,cursor:"pointer",marginBottom:12}} onClick={()=>setShowTicket(true)}><I.note style={{width:14,height:14,marginRight:6}}/>{lang==="fr"?"Signaler un problème":"Report an issue"}</button>

        <button className="btn" style={{width:"100%",padding:"12px",fontSize:13,color:"#DC2626",background:"rgba(220,38,38,.04)",border:"1px solid rgba(220,38,38,.12)",borderRadius:8,cursor:"pointer",marginBottom:28}} onClick={logout}><I.logout style={{width:14,height:14,marginRight:6}}/>{lang==="fr"?"Se déconnecter":"Sign out"}</button>

        {isAdmin&&<>
        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:12}}>{lang==="fr"?"ADMINISTRATION":"ADMINISTRATION"}</h3>
        <div className="card" style={{padding:18,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h4 style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{lang==="fr"?"Demandes d'accès":"Access requests"}</h4>
            <button className="btn" style={{padding:"4px 12px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",borderRadius:16}} onClick={loadPendingRequests}>{lang==="fr"?"Actualiser":"Refresh"}</button>
          </div>
          {pendingRequests.length===0&&<p style={{fontSize:12,color:"var(--t4)"}}>{lang==="fr"?"Aucune demande en attente":"No pending requests"}</p>}
          {pendingRequests.map((r,i)=>(
            <div key={r.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<pendingRequests.length-1?"1px solid var(--b)":"none"}}>
              <div>
                <p style={{fontSize:13,fontWeight:500,color:"var(--t1)"}}>{r.email}</p>
                <p style={{fontSize:10,color:"var(--t5)"}}>{r.requested_at?new Date(r.requested_at).toLocaleString("fr-FR"):""}</p>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="btn bp" style={{padding:"4px 12px",fontSize:11}} onClick={()=>approveRequest(r.email)}>{lang==="fr"?"Approuver":"Approve"}</button>
                <button className="btn" style={{padding:"4px 12px",fontSize:11,color:"#991B1B",background:"rgba(220,38,38,.06)",border:"1px solid rgba(220,38,38,.12)"}} onClick={()=>rejectRequest(r.email)}>{lang==="fr"?"Refuser":"Reject"}</button>
              </div>
            </div>
          ))}
        </div>
        {approvedPwd&&<div className="card" style={{padding:18,marginBottom:28,borderColor:"rgba(22,163,74,.3)",background:"rgba(22,163,74,.03)"}}>
          <p style={{fontSize:13,fontWeight:600,color:"#166534",marginBottom:8}}>{lang==="fr"?"Compte créé !":"Account created!"}</p>
          <p style={{fontSize:12,color:"var(--t2)",marginBottom:4}}>{lang==="fr"?"Email":"Email"} : <strong>{approvedPwd.email}</strong></p>
          <p style={{fontSize:12,color:"var(--t2)",marginBottom:8}}>{lang==="fr"?"Mot de passe":"Password"} : <strong>{approvedPwd.pwd}</strong></p>
          <p style={{fontSize:11,color:"var(--t4)"}}>{lang==="fr"?"Communiquez ces identifiants à l'utilisateur.":"Share these credentials with the user."}</p>
          <button className="btn" style={{marginTop:8,padding:"4px 12px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",borderRadius:16}} onClick={()=>{navigator.clipboard?.writeText(`Email: ${approvedPwd.email}\nMot de passe: ${approvedPwd.pwd}\nURL: https://aegis-radar-uj5k.vercel.app`);showT(lang==="fr"?"Copié !":"Copied!")}}>{lang==="fr"?"Copier les identifiants":"Copy credentials"}</button>
        </div>}

        <div className="card" style={{padding:18,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h4 style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{lang==="fr"?"Tickets support":"Support tickets"}</h4>
            <button className="btn" style={{padding:"4px 12px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",borderRadius:16}} onClick={loadAdminTickets}>{lang==="fr"?"Actualiser":"Refresh"}</button>
          </div>
          {adminTickets.length===0&&<p style={{fontSize:12,color:"var(--t4)"}}>{lang==="fr"?"Aucun ticket":"No tickets"}</p>}
          {adminTickets.map((t,i)=>(
            <div key={t.id||i} style={{padding:"12px 0",borderBottom:i<adminTickets.length-1?"1px solid var(--b)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:500,color:"var(--t1)"}}>{t.user_email}</span>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:8,background:t.status==="open"?"rgba(220,38,38,.08)":"rgba(22,163,74,.08)",color:t.status==="open"?"#991B1B":"#166534"}}>{t.status==="open"?(lang==="fr"?"Ouvert":"Open"):(lang==="fr"?"Fermé":"Closed")}</span>
                  {t.status==="open"&&<button className="btn" style={{padding:"2px 8px",fontSize:10,color:"#166534",background:"rgba(22,163,74,.06)",border:"1px solid rgba(22,163,74,.15)"}} onClick={()=>closeTicket(t.id)}>{lang==="fr"?"Fermer":"Close"}</button>}
                </div>
              </div>
              <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.4,marginBottom:4}}>{t.message}</p>
              {t.screenshot&&<img src={t.screenshot} style={{maxWidth:"100%",maxHeight:200,borderRadius:6,border:"1px solid var(--b)",marginTop:6}} alt="screenshot"/>}
              <p style={{fontSize:10,color:"var(--t5)",marginTop:4}}>{t.created_at?new Date(t.created_at).toLocaleString("fr-FR"):""}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{padding:18,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h4 style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{lang==="fr"?"Logs d'activité":"Activity logs"}</h4>
            <button className="btn" style={{padding:"4px 12px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",borderRadius:16}} onClick={loadAdminLogs}>{lang==="fr"?"Actualiser":"Refresh"}</button>
          </div>
          {adminLogs.length===0&&<p style={{fontSize:12,color:"var(--t4)"}}>{lang==="fr"?"Cliquez Actualiser":"Click Refresh"}</p>}
          <div style={{maxHeight:300,overflow:"auto"}}>
          {adminLogs.map((l,i)=>(
            <div key={l.id||i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"6px 0",borderBottom:"1px solid var(--b)"}}>
              <span style={{fontSize:10,color:"var(--t5)",whiteSpace:"nowrap",minWidth:110}}>{l.created_at?new Date(l.created_at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</span>
              <span style={{fontSize:10,fontWeight:500,color:"var(--gold2)",minWidth:80}}>{l.user_email?.split("@")[0]}</span>
              <span style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:"rgba(0,114,206,.06)",color:"var(--gold)",whiteSpace:"nowrap"}}>{l.action}</span>
              <span style={{fontSize:10,color:"var(--t3)",flex:1}}>{l.detail}</span>
            </div>
          ))}
          </div>
        </div>
        </>}
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
        <h3 className="lbl" style={{color:"var(--gold)",marginBottom:14}}>{lang==="fr"?"Scores & Critères":"Scores & Criteria"}</h3>
        <div className="card" style={{padding:"16px 18px",marginBottom:24}}>
          <p className="lbl" style={{color:"var(--t5)",marginBottom:14,fontSize:9}}>{lang==="fr"?"Chaque signal est classé selon les mots-clés détectés. Personnalisez les critères de chaque niveau.":"Each signal is classified by detected keywords. Customize criteria for each level."}</p>
          {[
            {k:"critical",c:"#DC2626",l:lang==="fr"?"Critique":"Critical",d:lang==="fr"?"Impact direct FL. Action immédiate.":"Direct FL impact. Immediate action.",range:`${scoreThresholds.critical}–100`},
            {k:"high",c:"#92400E",l:lang==="fr"?"Élevé":"High",d:lang==="fr"?"Signal significatif. Discussion courtier/RM.":"Significant. Broker/RM discussion.",range:`${scoreThresholds.high}–${scoreThresholds.critical-1}`},
            {k:"medium",c:"#3B82F6",l:lang==="fr"?"Moyen":"Medium",d:lang==="fr"?"Contexte utile. À surveiller.":"Useful context. Monitor.",range:`${scoreThresholds.medium}–${scoreThresholds.high-1}`},
            {k:"low",c:"#6B7280",l:lang==="fr"?"Faible":"Low",d:lang==="fr"?"Information générale.":"General information.",range:`0–${scoreThresholds.medium-1}`},
          ].map(x=><div key={x.k} style={{marginBottom:16,padding:"12px 14px",background:`${x.c}08`,borderRadius:"var(--rs)",border:`1px solid ${x.c}18`,borderLeft:`3px solid ${x.c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,fontWeight:700,color:x.c}}>{x.l}</span><span style={{fontSize:9,color:"var(--t5)",background:"var(--bg3)",padding:"1px 6px",borderRadius:8}}>{x.range}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input type="range" min={x.k==="critical"?60:x.k==="high"?30:x.k==="medium"?10:0} max={x.k==="critical"?95:x.k==="high"?79:x.k==="medium"?59:39} value={scoreThresholds[x.k]||0} onChange={e=>{if(x.k==="low")return;const v=parseInt(e.target.value);setScoreThresholds(p=>{const n={...p,[x.k]:v};lsSet("scoreThresholds",n);return n})}} style={{width:60,accentColor:x.c}} disabled={x.k==="low"}/>
                <span style={{fontSize:11,fontWeight:700,color:x.c,width:22}}>{scoreThresholds[x.k]||0}</span>
              </div>
            </div>
            <p style={{fontSize:9,color:"var(--t4)",marginBottom:8}}>{x.d}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
              {(scoreKeywords[x.k]||[]).map((kw,i)=><span key={i} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:`${x.c}15`,color:x.c,border:`1px solid ${x.c}25`,display:"flex",alignItems:"center",gap:4}}>
                {kw}
                <button style={{background:"none",border:"none",cursor:"pointer",padding:0,color:x.c,fontSize:12,lineHeight:1,opacity:.6}} onClick={()=>{setScoreKeywords(p=>{const n={...p,[x.k]:p[x.k].filter((_,j)=>j!==i)};lsSet("scoreKeywords",n);return n})}}>×</button>
              </span>)}
            </div>
            {editingKwLevel===x.k?<div style={{position:"relative"}}>
              <div style={{display:"flex",gap:6,marginBottom:4}}>
                <input className="inp" style={{flex:1,padding:"4px 10px",fontSize:11}} placeholder={lang==="fr"?"Rechercher ou taper un critère...":"Search or type a keyword..."} value={newKw} onChange={e=>setNewKw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newKw.trim()){setScoreKeywords(p=>{const n={...p,[x.k]:[...p[x.k],newKw.trim()]};lsSet("scoreKeywords",n);return n});setNewKw("")}}} autoFocus/>
                <button className="btn" style={{padding:"4px 8px",fontSize:10,color:"var(--t5)",background:"var(--bg3)",border:"1px solid var(--b)",borderRadius:6}} onClick={()=>{setNewKw("");setEditingKwLevel(null)}}>✕</button>
              </div>
              <div style={{maxHeight:180,overflow:"auto",display:"flex",flexDirection:"column",gap:2}}>
                {getKwSuggestions(newKw).map((s,i)=><button key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 10px",background:"var(--bg3)",border:"1px solid var(--b)",borderRadius:6,cursor:"pointer",fontFamily:"inherit",color:"inherit",textAlign:"left"}} onClick={()=>{setScoreKeywords(p=>{const n={...p,[x.k]:[...p[x.k],s.kw]};lsSet("scoreKeywords",n);return n});setNewKw("")}}>
                  <span style={{fontSize:11,color:"var(--t2)"}}>{s.kw}</span>
                  <span style={{fontSize:8,color:"var(--t5)",marginLeft:8}}>{s.cat}</span>
                </button>)}
                {getKwSuggestions(newKw).length===0&&newKw&&<p style={{fontSize:10,color:"var(--t5)",padding:"4px 10px",fontStyle:"italic"}}>{lang==="fr"?"Appuyez Entrée pour ajouter ce critère personnalisé":"Press Enter to add this custom keyword"}</p>}
              </div>
            </div>
            :<button style={{fontSize:10,color:"var(--t5)",background:"none",border:`1px dashed ${x.c}30`,borderRadius:6,padding:"3px 10px",cursor:"pointer"}} onClick={()=>setEditingKwLevel(x.k)}>+ {lang==="fr"?"Ajouter un critère":"Add keyword"}</button>}
          </div>)}
          <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn" style={{padding:"4px 12px",fontSize:10,color:"var(--t5)",background:"var(--bg3)",border:"1px solid var(--b)",borderRadius:6}} onClick={()=>{setScoreKeywords(defaultKeywords);lsSet("scoreKeywords",defaultKeywords);showT(lang==="fr"?"Critères réinitialisés":"Criteria reset")}}>{lang==="fr"?"Réinitialiser":"Reset defaults"}</button></div>
        </div>
        <h3 className="lbl" style={{color:"var(--t4)",marginBottom:14}}>{t("about")}</h3>
        <div className="card" style={{padding:"16px 18px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><span style={{fontSize:13,color:"var(--t3)"}}>{t("version")}</span><span style={{fontSize:13,color:"var(--t4)"}}>1.0.0</span></div>
          <div className="dv" style={{margin:"8px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><span style={{fontSize:13,color:"var(--t3)"}}>{lang==="fr"?"Base de données":"Database"}</span><span style={{fontSize:13,color:sbOk?"#166534":"var(--t5)"}}>{sbOk?(lang==="fr"?"Connectée":"Connected"):(lang==="fr"?"Hors-ligne":"Offline")}</span></div>
          {lastRefresh&&<><div className="dv" style={{margin:"8px 0"}}/><div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><span style={{fontSize:13,color:"var(--t3)"}}>{lang==="fr"?"Dernière mise à jour":"Last refresh"}</span><span style={{fontSize:13,color:"var(--t4)"}}>{new Date(lastRefresh).toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}</span></div></>}
        </div>
        <p style={{textAlign:"center",fontSize:11,color:"var(--t5)",marginBottom:28}}>© 2026 AIG — Lines Intelligence</p>
        <button className="btn" style={{width:"100%",background:"rgba(239,68,68,.08)",color:"#991B1B",border:"1px solid rgba(220,38,38,.12)",borderRadius:"var(--rs)"}} onClick={()=>{try{["step","tab","lang","selLines","autoRefresh","watchPrios","watchExtras","userNotes"].forEach(k=>localStorage.removeItem("signalis_"+k))}catch(e){}setStep("login");setTab("dashboard");setLoginEm("");setLoginPw("");setLoginErr(false)}}><I.logout/>{t("sign_out")}</button>
      </div>
    </div>);
    return null;
  };

  return (<div style={{zoom:fontScale}}>
    {isOffline&&<div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"var(--mw)",zIndex:999,background:"rgba(245,158,11,.15)",borderBottom:"1px solid rgba(245,158,11,.3)",padding:"6px 20px",textAlign:"center"}}><span style={{fontSize:11,color:"#92400E",fontWeight:600}}>{lang==="fr"?"Mode hors-ligne — données en cache":"Offline mode — cached data"}</span></div>}
    {render()}
    <nav className="tbar">{[{id:"dashboard",l:lang==="fr"?"Tableau":"Dashboard",Ic:I.home},{id:"watchlist",l:"Watchlist",Ic:I.list},{id:"notes",l:"Notes",Ic:I.note},{id:"brief",l:"Brief",Ic:I.calendar},{id:"settings",l:lang==="fr"?"Param.":"Settings",Ic:I.settings}].map(x=>(<button key={x.id} className={tab===x.id&&!selComp?"on":""} onClick={()=>goTab(x.id)}><x.Ic/><span>{x.l}</span></button>))}</nav>
    {selSig&&<SigDet s={selSig} onClose={()=>setSS(null)}/>}
    {showBrief&&briefCid&&<BriefSheet cid={briefCid} onClose={()=>{setSB(false);setBC(null)}}/>}
    {/* Client dossier modal */}
    {editingDossier&&<div className="bsbg" onClick={()=>setEditingDossier(null)}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,paddingTop:8}}><h3 style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{lang==="fr"?"Dossier client":"Client file"}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>setEditingDossier(null)}><I.x/></button></div>
      {(()=>{const co=cos.find(c=>c.id===editingDossier);return co?<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--bg3)",borderRadius:"var(--rs)",marginBottom:16,border:"1px solid var(--b)"}}><Logo name={co.name} sz={28} fallback={co.logo}/><div><span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{co.name}</span><p style={{fontSize:10,color:"var(--t4)"}}>{tx(co.sector,lang)}</p></div></div>:null})()}
      <p style={{fontSize:10,color:"var(--t5)",marginBottom:14}}>{lang==="fr"?"Ces informations enrichiront les prochains briefs de réunion.":"This information will enrich future meeting briefs."}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div style={{position:"relative"}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"Courtier référent":"Lead broker"}</label>
        {(()=>{const BROKERS=[
          {n:"Aon",d:"aon.com"},{n:"April",d:"april.fr"},{n:"Artémis Courtage",d:"artemis-courtage.com"},{n:"Assurances Crédit Mutuel",d:"creditmutuel.fr"},
          {n:"Bessé",d:"bfrenchgroupe.com"},{n:"BMS Group",d:"bmsgroup.com"},{n:"Brown & Brown",d:"bbinsurance.com"},
          {n:"CAC Grands Risques",d:"cac-group.com"},{n:"CAMCA",d:"camca.fr"},{n:"Coface",d:"coface.com"},{n:"Delvaux",d:"delvaux-assurances.fr"},{n:"Diot-Siaci",d:"dfranceiot-siaci.com"},
          {n:"Eurobrokers",d:"eurobrokers.fr"},{n:"Filhet-Allard",d:"filhetallard.com"},
          {n:"Gallagher",d:"ajg.com"},{n:"Gras Savoye",d:"grassavoye.com"},{n:"Grassi",d:"grassi.fr"},
          {n:"Henner",d:"henner.com"},{n:"Howden",d:"howdengroup.com"},{n:"Hub International",d:"hubinternational.com"},
          {n:"Kereis",d:"kereis-group.com"},{n:"Kyu Associés",d:"kyu.fr"},
          {n:"Lockton",d:"lockton.com"},{n:"Lyonel Vidal",d:"lyonelvidal.com"},
          {n:"Magnacarta",d:"magnacarta.fr"},{n:"Marsh",d:"marsh.com"},{n:"McGill",d:"mcgill-associes.fr"},{n:"Miller",d:"miller-insurance.com"},{n:"Monceau Assurances",d:"monceau.com"},
          {n:"Neoassur",d:"neoassur.com"},{n:"Nord Europe Assurances",d:"nea-courtage.com"},
          {n:"Odealim",d:"odealim.com"},
          {n:"Périclès",d:"pericles-groupe.com"},{n:"Pretium",d:"pretium.fr"},
          {n:"Riskattitude",d:"riskattitude.com"},{n:"Roederer",d:"roederer.fr"},
          {n:"SATEC",d:"satec.fr"},{n:"Servyr",d:"servyr.com"},{n:"Siaci Saint Honoré",d:"sifranceaci.com"},{n:"SPB",d:"spb.eu"},
          {n:"Thélem Assurances",d:"thelem-assurances.fr"},{n:"Tokio Marine HCC",d:"tmhcc.com"},
          {n:"Verlingue",d:"verlingue.fr"},{n:"Verspieren",d:"verspieren.com"},
          {n:"Willis Towers Watson",d:"wtwco.com"},
          {n:"Zurich Courtage",d:"zurich.fr"}
        ].sort((a,b)=>a.n.localeCompare(b.n));
        const brokerFiltered=BROKERS.filter(b=>!dossierDraft.broker||b.n.toLowerCase().includes((dossierDraft.broker||"").toLowerCase()));
        const selectedBroker=BROKERS.find(b=>b.n===dossierDraft.broker);
        return(<>
          <div style={{display:"flex",alignItems:"center",gap:8,position:"relative"}}>
            {selectedBroker&&<img src={"https://www.google.com/s2/favicons?domain="+selectedBroker.d+"&sz=32"} alt="" style={{width:22,height:22,borderRadius:4,position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",zIndex:1,pointerEvents:"none"}} onError={e=>{e.target.style.display="none"}}/>}
            <input className="inp" style={{flex:1,paddingLeft:selectedBroker?38:12}} value={dossierDraft.broker} onChange={e=>{setDossierDraft(p=>({...p,broker:e.target.value}));setBrokerOpen(true)}} onFocus={()=>setBrokerOpen(true)} placeholder={lang==="fr"?"Rechercher un courtier...":"Search broker..."}/>
            {dossierDraft.broker&&<button style={{background:"none",border:"none",fontSize:14,color:"var(--t5)",cursor:"pointer",padding:0}} onClick={()=>{setDossierDraft(p=>({...p,broker:""}));setBrokerOpen(true)}}>×</button>}
          </div>
          {brokerOpen&&<div style={{position:"absolute",zIndex:10,left:0,right:0,top:"100%",maxHeight:200,overflow:"auto",background:"#fff",border:"1px solid var(--b)",borderRadius:8,boxShadow:"0 4px 16px rgba(0,43,92,.1)",marginTop:4}}>
            {brokerFiltered.map(b=>(
              <button key={b.n} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"none",border:"none",borderBottom:"1px solid var(--b)",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}} onClick={()=>{setDossierDraft(p=>({...p,broker:b.n}));setBrokerOpen(false)}}>
                <img src={"https://www.google.com/s2/favicons?domain="+b.d+"&sz=32"} alt="" style={{width:20,height:20,borderRadius:4,flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                <span style={{fontSize:12,color:"var(--t1)"}}>{b.n}</span>
              </button>
            ))}
            {brokerFiltered.length===0&&<p style={{fontSize:11,color:"var(--t4)",padding:"8px 12px"}}>{lang==="fr"?"Courtier non listé — tapez le nom":"Broker not listed — type the name"}</p>}
          </div>}
        </>)})()}</div>
        <div><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>Risk Manager</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
            <input className="inp" style={{fontSize:11}} value={dossierDraft.rmLastName||""} onChange={e=>setDossierDraft(p=>({...p,rmLastName:e.target.value,rm:(e.target.value+" "+(p.rmFirstName||"")).trim()}))} placeholder={lang==="fr"?"Nom":"Last name"}/>
            <input className="inp" style={{fontSize:11}} value={dossierDraft.rmFirstName||""} onChange={e=>setDossierDraft(p=>({...p,rmFirstName:e.target.value,rm:((p.rmLastName||"")+" "+e.target.value).trim()}))} placeholder={lang==="fr"?"Prénom":"First name"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
            <input className="inp" style={{fontSize:11}} value={dossierDraft.rmPhone||""} onChange={e=>setDossierDraft(p=>({...p,rmPhone:e.target.value}))} placeholder={lang==="fr"?"Tél. direct":"Direct phone"}/>
            <input className="inp" style={{fontSize:11}} value={dossierDraft.rmMobile||""} onChange={e=>setDossierDraft(p=>({...p,rmMobile:e.target.value}))} placeholder={lang==="fr"?"Portable":"Mobile"}/>
          </div>
          <div style={{display:"flex",gap:6}}>
            <input className="inp" style={{flex:1,fontSize:11}} value={dossierDraft.rmEmail||""} onChange={e=>setDossierDraft(p=>({...p,rmEmail:e.target.value}))} placeholder="Email"/>
            <button style={{padding:"4px 8px",fontSize:9,color:"var(--gold2)",background:"rgba(0,114,206,.06)",border:"1px solid rgba(0,114,206,.15)",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}} onClick={()=>{const co=cos.find(c=>c.id===editingDossier);const q=encodeURIComponent('"Risk Manager" "'+((co?.name)||"")+'" site:linkedin.com OR site:amrae.fr');window.open("https://www.google.com/search?q="+q,"_blank")}}><I.search style={{width:10,height:10,marginRight:3}}/>{lang==="fr"?"Rechercher":"Search"}</button>
          </div>
        </div>
      </div>

      <div className="dv" style={{marginBottom:12}}/>
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{lang==="fr"?"CONTACTS CLÉS":"KEY CONTACTS"}</h4>
      {(dossierDraft.contacts||[]).map((ct,ci)=>(
        <div key={ci} style={{display:"flex",gap:10,alignItems:"flex-start",padding:10,border:"1px solid var(--b)",borderRadius:8,marginBottom:8,background:"var(--bg3)"}}>
          <div style={{flexShrink:0,position:"relative"}}>
            {ct.photo?<img src={ct.photo} style={{width:48,height:48,borderRadius:8,objectFit:"cover",border:"1px solid var(--b)"}} alt=""/>:<div style={{width:48,height:48,borderRadius:8,background:"var(--b)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,color:"var(--t4)"}}>{(ct.name||"?")[0]?.toUpperCase()}</span></div>}
            <label style={{position:"absolute",bottom:-4,right:-4,width:20,height:20,borderRadius:10,background:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"2px solid #fff"}}><span style={{fontSize:10,color:"#fff"}}>+</span><input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const file=e.target.files?.[0];if(!file||file.size>1024*1024)return;const reader=new FileReader();reader.onload=ev=>{const n=[...(dossierDraft.contacts||[])];n[ci]={...n[ci],photo:ev.target?.result};setDossierDraft(p=>({...p,contacts:n}))};reader.readAsDataURL(file)}}/></label>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
            <input className="inp" style={{fontSize:11,padding:"4px 8px"}} placeholder={lang==="fr"?"Nom et prénom":"Full name"} value={ct.name||""} onChange={e=>{const n=[...(dossierDraft.contacts||[])];n[ci]={...n[ci],name:e.target.value};setDossierDraft(p=>({...p,contacts:n}))}}/>
            <input className="inp" style={{fontSize:11,padding:"4px 8px"}} placeholder={lang==="fr"?"Titre / Fonction":"Title / Role"} value={ct.title||""} onChange={e=>{const n=[...(dossierDraft.contacts||[])];n[ci]={...n[ci],title:e.target.value};setDossierDraft(p=>({...p,contacts:n}))}}/>
            <input className="inp" style={{fontSize:11,padding:"4px 8px"}} placeholder={lang==="fr"?"Email":"Email"} value={ct.email||""} onChange={e=>{const n=[...(dossierDraft.contacts||[])];n[ci]={...n[ci],email:e.target.value};setDossierDraft(p=>({...p,contacts:n}))}}/>
            <input className="inp" style={{fontSize:11,padding:"4px 8px"}} placeholder={lang==="fr"?"Téléphone":"Phone"} value={ct.phone||""} onChange={e=>{const n=[...(dossierDraft.contacts||[])];n[ci]={...n[ci],phone:e.target.value};setDossierDraft(p=>({...p,contacts:n}))}}/>
          </div>
          <button style={{width:18,height:18,borderRadius:4,background:"rgba(220,38,38,.06)",border:"1px solid rgba(220,38,38,.12)",fontSize:11,color:"#991B1B",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0}} onClick={()=>{const n=[...(dossierDraft.contacts||[])];n.splice(ci,1);setDossierDraft(p=>({...p,contacts:n}))}}>×</button>
        </div>
      ))}
      <button className="btn" style={{padding:"6px 14px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",borderRadius:6,marginBottom:16}} onClick={()=>{const n=[...(dossierDraft.contacts||[])];n.push({name:"",title:"",email:"",phone:"",photo:null});setDossierDraft(p=>({...p,contacts:n}))}}>+ {lang==="fr"?"Ajouter un contact":"Add contact"}</button>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"Date de renouvellement":"Renewal date"}</label><input className="inp" type="date" value={dossierDraft.renewal} onChange={e=>setDossierDraft(p=>({...p,renewal:e.target.value}))}/></div>
        <div><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"Prime estimée":"Estimated premium"}</label><input className="inp" value={dossierDraft.premium} onChange={e=>setDossierDraft(p=>({...p,premium:e.target.value}))} placeholder="ex: 850K€"/></div>
      </div>
      <div style={{marginBottom:12}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"Programme FL en place":"Current FL programme"}</label><textarea className="inp" value={dossierDraft.program} onChange={e=>setDossierDraft(p=>({...p,program:e.target.value}))} rows={2} placeholder={lang==="fr"?"D&O: 50M€ / Cyber: 10M€ / EPL: 25M€...":"D&O: €50M / Cyber: €10M / EPL: €25M..."}/></div>
      <div style={{marginBottom:12}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"Sinistralité / historique":"Claims history"}</label><textarea className="inp" value={dossierDraft.sinistres} onChange={e=>setDossierDraft(p=>({...p,sinistres:e.target.value}))} rows={2} placeholder={lang==="fr"?"Sinistres notables, tendances, fréquence...":"Notable claims, trends, frequency..."}/></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"Contexte / informations clés":"Context / key information"}</label><textarea className="inp" value={dossierDraft.context} onChange={e=>setDossierDraft(p=>({...p,context:e.target.value}))} rows={3} placeholder={lang==="fr"?"Informations stratégiques, enjeux particuliers, historique de la relation, points de vigilance...":"Strategic information, specific issues, relationship history, vigilance points..."}/></div>

      <div className="dv" style={{marginBottom:16}}/>
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:12}}>{lang==="fr"?"STRUCTURE DU PROGRAMME":"PROGRAMME STRUCTURE"}</h4>
      <p style={{fontSize:10,color:"var(--t4)",marginBottom:12}}>{lang==="fr"?"Ajoutez les lignes souscrites avec les tranches et assureurs. Montants en M€.":"Add subscribed lines with layers and insurers. Amounts in M€."}</p>

      {(dossierDraft.programLines||[]).map((pl,pi)=>(
        <div key={pi} style={{border:"1px solid var(--b)",borderRadius:8,padding:12,marginBottom:10,background:"var(--bg3)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <select style={{fontSize:12,padding:"4px 8px",borderRadius:4,border:"1px solid var(--b)",background:"#fff",color:"var(--t1)"}} value={pl.line} onChange={e=>{const n=[...(dossierDraft.programLines||[])];n[pi]={...n[pi],line:e.target.value};setDossierDraft(p=>({...p,programLines:n}))}}>
              <option value="">{lang==="fr"?"Sélectionner...":"Select..."}</option>
              {Object.keys(LINES).map(k=><option key={k} value={k}>{lineLbl(k,lang)}</option>)}
            </select>
            <button style={{fontSize:10,color:"#991B1B",background:"rgba(220,38,38,.06)",border:"1px solid rgba(220,38,38,.12)",borderRadius:4,padding:"2px 8px",cursor:"pointer"}} onClick={()=>{const n=[...(dossierDraft.programLines||[])];n.splice(pi,1);setDossierDraft(p=>({...p,programLines:n}))}}>{lang==="fr"?"Supprimer":"Delete"}</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 65px 65px 45px 20px",gap:6,marginBottom:6,alignItems:"center"}}>
            <span style={{fontSize:8,color:"var(--t5)",fontWeight:600}}>{lang==="fr"?"ASSUREUR":"INSURER"}</span>
            <span style={{fontSize:8,color:"var(--t5)",fontWeight:600}}>{lang==="fr"?"DE M€":"FROM M€"}</span>
            <span style={{fontSize:8,color:"var(--t5)",fontWeight:600}}>{lang==="fr"?"À M€":"TO M€"}</span>
            <span style={{fontSize:8,color:"var(--t5)",fontWeight:600}}>%</span>
            <span/>
          </div>
          {(()=>{const INSURERS=[{n:"AIG",d:"aig.com"},{n:"Allianz",d:"allianz.com"},{n:"Arch",d:"archinsurance.com"},{n:"Aviva",d:"aviva.com"},{n:"AXA XL",d:"axaxl.com"},{n:"Beazley",d:"beazley.com"},{n:"Berkshire",d:"berkshirehathaway.com"},{n:"Canopius",d:"canopius.com"},{n:"Chubb",d:"chubb.com"},{n:"CNA",d:"cna.com"},{n:"Coface",d:"coface.com"},{n:"Convex",d:"convexinsurance.com"},{n:"Euler Hermes",d:"allianz-trade.com"},{n:"Everest Re",d:"everestre.com"},{n:"Generali",d:"generali.com"},{n:"Hannover Re",d:"hannover-re.com"},{n:"HDI Global",d:"hdi.global"},{n:"Hiscox",d:"hiscox.com"},{n:"Liberty",d:"libertymutual.com"},{n:"Lloyd's",d:"lloyds.com"},{n:"Mapfre",d:"mapfre.com"},{n:"Markel",d:"markel.com"},{n:"MSIG",d:"msig-global.com"},{n:"Munich Re",d:"munichre.com"},{n:"QBE",d:"qbe.com"},{n:"SCOR",d:"scor.com"},{n:"Sompo",d:"sompo-intl.com"},{n:"Starr",d:"starrcompanies.com"},{n:"Swiss Re",d:"swissre.com"},{n:"Tokio Marine",d:"tokiomarinehd.com"},{n:"Travelers",d:"travelers.com"},{n:"Zurich",d:"zurich.com"}].sort((a,b)=>a.n.localeCompare(b.n));return(pl.layers||[]).map((l,li)=>{const selIns=INSURERS.find(ins=>ins.n===l.insurer);const insFiltered=INSURERS.filter(ins=>!l.insurer||ins.n.toLowerCase().includes((l.insurer||"").toLowerCase()));return(
            <div key={li} style={{position:"relative",marginBottom:6}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 65px 65px 45px 20px",gap:6,alignItems:"center"}}>
                <div style={{position:"relative"}}>{selIns&&<img src={"https://www.google.com/s2/favicons?domain="+selIns.d+"&sz=32"} alt="" style={{width:18,height:18,borderRadius:3,position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",zIndex:1,pointerEvents:"none"}} onError={e=>{e.target.style.display="none"}}/>}<input className="inp" style={{fontSize:12,padding:"6px 8px",paddingLeft:selIns?32:8}} placeholder="AIG, Zurich..." value={l.insurer||""} onChange={e=>{const n=[...(dossierDraft.programLines||[])];const layers=[...(n[pi].layers||[])];layers[li]={...layers[li],insurer:e.target.value,_insOpen:true};n[pi]={...n[pi],layers};setDossierDraft(p=>({...p,programLines:n}))}} onFocus={()=>{const n=[...(dossierDraft.programLines||[])];const layers=[...(n[pi].layers||[])];layers[li]={...layers[li],_insOpen:true};n[pi]={...n[pi],layers};setDossierDraft(p=>({...p,programLines:n}))}} onBlur={()=>setTimeout(()=>{const n=[...(dossierDraft.programLines||[])];const layers=[...(n[pi].layers||[])];if(layers[li]){layers[li]={...layers[li],_insOpen:false};n[pi]={...n[pi],layers};setDossierDraft(p=>({...p,programLines:n}))}},200)}/>{l._insOpen&&<div style={{position:"absolute",zIndex:20,left:0,right:0,top:"100%",maxHeight:150,overflow:"auto",background:"#fff",border:"1px solid var(--b)",borderRadius:6,boxShadow:"0 4px 12px rgba(0,43,92,.1)",marginTop:2}}>{insFiltered.map(ins=>(<button key={ins.n} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"none",border:"none",borderBottom:"1px solid var(--b)",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}} onMouseDown={e=>{e.preventDefault();const n=[...(dossierDraft.programLines||[])];const layers=[...(n[pi].layers||[])];layers[li]={...layers[li],insurer:ins.n,_insOpen:false};n[pi]={...n[pi],layers};setDossierDraft(p=>({...p,programLines:n}))}}><img src={"https://www.google.com/s2/favicons?domain="+ins.d+"&sz=32"} alt="" style={{width:16,height:16,borderRadius:3,flexShrink:0}} onError={e=>{e.target.style.display="none"}}/><span style={{fontSize:11,color:"var(--t1)"}}>{ins.n}</span></button>))}</div>}</div>
                <input className="inp" type="number" step="0.5" style={{fontSize:12,padding:"6px 6px",textAlign:"center"}} placeholder="0" value={l.from||""} onChange={e=>{const n=[...(dossierDraft.programLines||[])];const layers=[...(n[pi].layers||[])];layers[li]={...layers[li],from:Number(e.target.value)};n[pi]={...n[pi],layers};setDossierDraft(p=>({...p,programLines:n}))}}/>
                <input className="inp" type="number" step="0.5" style={{fontSize:12,padding:"6px 6px",textAlign:"center"}} placeholder="5" value={l.to||""} onChange={e=>{const n=[...(dossierDraft.programLines||[])];const layers=[...(n[pi].layers||[])];layers[li]={...layers[li],to:Number(e.target.value)};n[pi]={...n[pi],layers};setDossierDraft(p=>({...p,programLines:n}))}}/>
                <input className="inp" type="number" min="0" max="100" style={{fontSize:12,padding:"6px 4px",textAlign:"center"}} placeholder="100" value={l.share||""} onChange={e=>{
                  const raw=Number(e.target.value);
                  // Clamp 0-100
                  let v=Math.max(0,Math.min(100,raw));
                  // Calcul du max disponible sur la tranche (100 - somme des autres layers qui se chevauchent)
                  const currentLayers=pl.layers||[];
                  const thisFrom=l.from||0,thisTo=l.to||0;
                  const othersShareOnOverlap=currentLayers.reduce((sum,other,otherIdx)=>{
                    if(otherIdx===li)return sum;
                    const oFrom=other.from||0,oTo=other.to||0;
                    // Overlap si les plages se croisent
                    const overlap=Math.max(0,Math.min(thisTo,oTo)-Math.max(thisFrom,oFrom));
                    return overlap>0?sum+(other.share||0):sum;
                  },0);
                  const maxAvail=Math.max(0,100-othersShareOnOverlap);
                  let clamped=false;
                  if(v>maxAvail){v=maxAvail;clamped=true}
                  if(raw!==v&&raw>0){
                    if(clamped)showT(lang==="fr"?`Ajusté à ${v}% (max disponible sur la tranche)`:`Adjusted to ${v}% (max available on tranche)`);
                    else if(raw>100)showT(lang==="fr"?"Ajusté à 100% (maximum)":"Adjusted to 100% (maximum)");
                    else if(raw<0)showT(lang==="fr"?"Ajusté à 0% (minimum)":"Adjusted to 0% (minimum)");
                  }
                  const n=[...(dossierDraft.programLines||[])];
                  const layers=[...(n[pi].layers||[])];
                  layers[li]={...layers[li],share:v};
                  n[pi]={...n[pi],layers};
                  setDossierDraft(p=>({...p,programLines:n}));
                }}/>
                <button style={{width:20,height:20,borderRadius:4,background:"rgba(220,38,38,.06)",border:"1px solid rgba(220,38,38,.12)",fontSize:12,color:"#991B1B",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}} onClick={()=>{const n=[...(dossierDraft.programLines||[])];const layers=[...(n[pi].layers||[])];layers.splice(li,1);n[pi]={...n[pi],layers};setDossierDraft(p=>({...p,programLines:n}))}}>×</button>
              </div>
            </div>)})})()}
          <button style={{fontSize:10,color:"var(--gold2)",background:"rgba(0,114,206,.04)",border:"1px solid rgba(0,114,206,.1)",borderRadius:4,padding:"4px 12px",cursor:"pointer",marginTop:6}} onClick={()=>{const n=[...(dossierDraft.programLines||[])];const layers=[...(n[pi].layers||[])];const lastTo=layers.length>0?layers[layers.length-1].to||0:0;layers.push({insurer:"",from:lastTo,to:lastTo,share:100});n[pi]={...n[pi],layers};setDossierDraft(p=>({...p,programLines:n}))}}>+ {lang==="fr"?"Ajouter une tranche":"Add layer"}</button>
        </div>
      ))}
      <button className="btn" style={{padding:"6px 14px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",borderRadius:6,marginBottom:16}} onClick={()=>{const n=[...(dossierDraft.programLines||[])];n.push({line:"",layers:[{insurer:"AIG",from:0,to:0,share:100}]});setDossierDraft(p=>({...p,programLines:n}))}}>+ {lang==="fr"?"Ajouter une ligne":"Add line"}</button>
      {/* Documents */}
      <div style={{marginBottom:16}}>
        <label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8,fontSize:9}}>{lang==="fr"?"Documents joints":"Attached documents"}</label>
        {(dossierFiles[editingDossier]||[]).length>0&&<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
          {(dossierFiles[editingDossier]||[]).map(f=>{const ic=fileIconColor(f.name);return (
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--bg3)",border:"1px solid var(--b)",borderRadius:6}}>
              <div style={{width:32,height:32,borderRadius:4,background:ic.bg,color:ic.tx,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0}}>{fileIcon(f.name)}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:12,fontWeight:500,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</p>
                <p style={{fontSize:10,color:"var(--t5)"}}>{fmtSize(f.size)} — {fD(f.uploadedAt,lang)}</p>
              </div>
              <button style={{background:"none",border:"none",cursor:"pointer",padding:4}} onClick={()=>downloadFile(f)}><I.download style={{width:14,height:14,color:"var(--gold2)"}}/></button>
              <button style={{background:"none",border:"none",cursor:"pointer",padding:4}} onClick={()=>deleteFile(editingDossier,f.id)}><I.x style={{width:12,height:12,color:"#991B1B"}}/></button>
            </div>
          )})}
        </div>}
        <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.txt,.png,.jpg,.jpeg,.pptx" multiple style={{display:"none"}} onChange={handleFileUpload}/>
        <button className="btn" style={{width:"100%",padding:"12px",fontSize:12,color:"var(--gold2)",background:"rgba(0,114,206,.04)",border:"1px dashed rgba(0,114,206,.2)",borderRadius:6,cursor:"pointer"}} onClick={()=>fileInputRef.current?.click()}>+ {lang==="fr"?"Ajouter un document (.pdf, .xlsx, .doc...)":"Add a document (.pdf, .xlsx, .doc...)"}</button>
      </div>
      {clientDossiers[editingDossier]?.updatedAt&&<p style={{fontSize:9,color:"var(--t5)",marginBottom:10,fontStyle:"italic"}}>{lang==="fr"?"Dernière mise à jour":"Last updated"}: {fD(clientDossiers[editingDossier].updatedAt,lang)}</p>}
      <button className="btn bp" style={{width:"100%",height:46}} onClick={saveDossier}>{lang==="fr"?"Sauvegarder le dossier":"Save dossier"}</button>
    </div></div>}
    {/* New meeting modal */}
    {showNewMeeting&&<div className="bsbg" onClick={()=>{if(mtgDictating)stopMtgDict();setSNM(false)}}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,paddingTop:8}}><h3 style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("add_meeting")}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>{if(mtgDictating)stopMtgDict();setSNM(false)}}><I.x/></button></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("meeting_company")}</label><select className="inp" value={mtgCo} onChange={e=>setMtgCo(e.target.value)} style={{appearance:"auto"}}><option value="">{lang==="fr"?"Sélectionner...":"Select..."}</option>{[...watched].sort((a,b)=>a.name.localeCompare(b.name)).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("meeting_date")}</label><input className="inp" type="datetime-local" value={mtgDate} onChange={e=>setMtgDate(e.target.value)}/></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("meeting_type")}</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[{k:"broker",l:t("meeting_broker")},{k:"rm",l:t("meeting_rm")},{k:"internal",l:t("meeting_internal")},{k:"autre",l:t("meeting_other")}].map(tp=><button key={tp.k} className={`chip ${mtgType===tp.k?"on":""}`} onClick={()=>setMtgType(tp.k)}>{tp.l}</button>)}</div></div>
      {mtgType==="autre"&&<div style={{padding:"14px 16px",background:"var(--bg3)",borderRadius:"var(--rs)",border:"1px solid var(--b)",marginBottom:16}}>
        <div style={{marginBottom:12,position:"relative"}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{t("contact_name")}</label><input className="inp" value={mtgContactName} onChange={e=>{setMtgCN(e.target.value);searchContacts(e.target.value)}} placeholder={lang==="fr"?"Nom et prénom...":"Full name..."}/>
          {contactSuggestions.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:10,background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:"0 0 8px 8px",maxHeight:160,overflow:"auto"}}>{contactSuggestions.map(c=><button key={c.id} style={{width:"100%",padding:"8px 12px",background:"none",border:"none",borderBottom:"1px solid var(--b)",cursor:"pointer",textAlign:"left",fontFamily:"inherit",color:"inherit"}} onClick={()=>{setMtgCN(c.name);setMtgCP(c.phone||"");setMtgCE(c.email||"");setMtgCR(c.role||"");setCSugg([])}}><p style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{c.name}</p><p style={{fontSize:10,color:"var(--t4)"}}>{[c.role,c.company,c.phone].filter(Boolean).join(" · ")}</p>{c.history&&c.history.length>0&&<p style={{fontSize:8,color:"var(--t5)",marginTop:2}}>📝 {lang==="fr"?"Modifié le":"Modified"} {new Date(c.updatedAt).toLocaleDateString(lang==="fr"?"fr-FR":"en-GB")}</p>}</button>)}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{t("contact_phone")}</label><input className="inp" type="tel" value={mtgContactPhone} onChange={e=>setMtgCP(e.target.value)} placeholder="06 12 34 56 78"/></div>
          <div><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{t("contact_email")}</label><input className="inp" type="email" value={mtgContactEmail} onChange={e=>setMtgCE(e.target.value)} placeholder="prenom.nom@..."/></div>
        </div>
        <div><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{t("contact_role")}</label><input className="inp" value={mtgContactRole} onChange={e=>setMtgCR(e.target.value)} placeholder={lang==="fr"?"Ex : Directeur des risques, Courtier senior...":"E.g.: Risk Director, Senior Broker..."}/></div>
      </div>}
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><label className="lbl" style={{color:"var(--t4)"}}>{t("meeting_notes")}</label><button className="btn" style={{padding:"4px 12px",fontSize:11,borderRadius:16,background:mtgDictating?"rgba(220,38,38,.12)":"rgba(0,114,206,.1)",color:mtgDictating?"#991B1B":"var(--gold)",border:`1px solid ${mtgDictating?"rgba(239,68,68,.3)":"rgba(0,114,206,.2)"}`}} onClick={mtgDictating?stopMtgDict:startMtgDict}>{mtgDictating?<><div style={{width:6,height:6,borderRadius:"50%",background:"#DC2626",animation:"pd 1s ease-in-out infinite",marginRight:4}}/>{lang==="fr"?"Arrêter":"Stop"}</>:<><I.mic style={{width:14,height:14}}/>{lang==="fr"?"Dicter":"Dictate"}</>}</button></div>{mtgDictating&&<p style={{fontSize:10,color:"#991B1B",marginBottom:6}}>{lang==="fr"?"Parlez, la note se rédige...":"Speak, the note is being written..."}</p>}<textarea className="inp" placeholder={lang==="fr"?"Points à aborder, contexte...":"Topics to discuss, context..."} value={mtgNotes} onChange={e=>setMtgNotes(e.target.value)} rows={3} style={{borderColor:mtgDictating?"rgba(239,68,68,.3)":"var(--b)"}}/></div>
      <button className="btn bp" style={{width:"100%",height:46}} onClick={addMeeting} disabled={!mtgCo||!mtgDate}>{t("save_note")}</button>

      {mtgCo&&mtgDate&&(()=>{
        const co=cos.find(c=>c.id===mtgCo);
        const dos=getDossier(mtgCo);
        const sigs=getSigs(mtgCo).slice(0,3);
        // Collect all known emails
        const emails=[];
        if(dos?.rmEmail)emails.push({name:dos.rm||"RM",email:dos.rmEmail,role:"Risk Manager"});
        if(dos?.contacts)(dos.contacts||[]).forEach(c=>{if(c.email)emails.push({name:c.name,email:c.email,role:c.title||""})});
        // Build meeting description
        const desc=`Réunion ${co?.name||""}\n\nContexte :\n${sigs.map(s=>"• "+tx(s.title,lang)).join("\n")||"Pas de signaux récents"}\n\n${mtgNotes?"Notes :\n"+mtgNotes+"\n\n":""}— AIG Lines Intelligence`;
        const title=`${mtgType==="broker"?"Comité courtier":"Réunion"} — ${co?.name||""} — AIG Lines Intelligence`;
        const startDate=new Date(mtgDate);
        const endDate=new Date(startDate.getTime()+3600000);
        const fmtOWA=(d)=>d.toISOString().replace(/[-:]/g,"").split(".")[0];
        const outlookUrl=`https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(desc)}&startdt=${fmtOWA(startDate)}&enddt=${fmtOWA(endDate)}${emails.length>0?"&to="+encodeURIComponent(emails.map(e=>e.email).join(";")):""}`;

        return(<div style={{marginTop:12}}>
          {emails.length>0&&<div style={{marginBottom:10}}>
            <p className="lbl" style={{color:"var(--t4)",marginBottom:6,fontSize:9}}>{lang==="fr"?"PARTICIPANTS SUGGÉRÉS":"SUGGESTED ATTENDEES"}</p>
            {emails.map((e,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
              <div style={{width:6,height:6,borderRadius:3,background:"var(--gold)",flexShrink:0}}/>
              <span style={{fontSize:11,color:"var(--t2)",fontWeight:500}}>{e.name}</span>
              <span style={{fontSize:10,color:"var(--t4)"}}>{e.role}</span>
              <span style={{fontSize:10,color:"var(--gold2)",marginLeft:"auto"}}>{e.email}</span>
            </div>)}
          </div>}
          <div style={{display:"flex",gap:8}}>
            <button className="btn" style={{flex:1,padding:"10px",fontSize:12,background:"#0072CE",color:"#fff",border:"none",borderRadius:6,fontWeight:600}} onClick={()=>{addMeeting();window.open(outlookUrl,"_blank")}}>
              <span style={{marginRight:6}}>📅</span>{lang==="fr"?"Ouvrir dans Outlook":"Open in Outlook"}
            </button>
            <button className="btn" style={{padding:"10px 14px",fontSize:12,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)",borderRadius:6}} onClick={()=>{
              const icsContent=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//AIG Lines Intelligence//FR","BEGIN:VEVENT","DTSTART:"+fmtOWA(startDate)+"Z","DTEND:"+fmtOWA(endDate)+"Z","SUMMARY:"+title,"DESCRIPTION:"+desc.replace(/\n/g,"\\n"),...emails.map(e=>"ATTENDEE;CN="+e.name+":mailto:"+e.email),"END:VEVENT","END:VCALENDAR"].join("\r\n");
              const blob=new Blob([icsContent],{type:"text/calendar"});
              const url=URL.createObjectURL(blob);
              const a=document.createElement("a");a.href=url;a.download=`${co?.name||"meeting"}.ics`;a.click();
              URL.revokeObjectURL(url);
              addMeeting();
            }}>.ics</button>
          </div>
        </div>)
      })()}
    </div></div>}
    {showNewNote&&<div className="bsbg" onClick={()=>{if(noteDictating)stopNoteDict();setSNN(false)}}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,paddingTop:8}}><h3 style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("new_note_title")}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>{if(noteDictating)stopNoteDict();setSNN(false)}}><I.x/></button></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("company_optional")}</label><select className="inp" value={nComp} onChange={e=>setNC(e.target.value)} style={{appearance:"auto"}}><option value="">{t("general")}</option>{cos.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div style={{marginBottom:16}}><label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:8}}>{t("tag_label")}</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["observation","hypothesis","action","question","decision"].map(tg=><button key={tg} className={`chip ${nTag===tg?"on":""}`} onClick={()=>setNTg(tg)}>{noteTagLbl(tg,t)}</button>)}</div></div>
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><label className="lbl" style={{color:"var(--t4)"}}>{t("note_label")}</label><button className="btn" style={{padding:"4px 12px",fontSize:11,borderRadius:16,background:noteDictating?"rgba(220,38,38,.12)":"rgba(0,114,206,.1)",color:noteDictating?"#991B1B":"var(--gold)",border:`1px solid ${noteDictating?"rgba(239,68,68,.3)":"rgba(0,114,206,.2)"}`}} onClick={noteDictating?stopNoteDict:startNoteDict}>{noteDictating?<><div style={{width:6,height:6,borderRadius:"50%",background:"#DC2626",animation:"pd 1s ease-in-out infinite",marginRight:4}}/>{t("dict_stop")}</>:<><I.mic style={{width:14,height:14}}/>{t("dict_start")}</>}</button></div>{noteDictating&&<p style={{fontSize:10,color:"#991B1B",marginBottom:6}}>{t("dict_listening")}</p>}<textarea className="inp" placeholder={t("note_placeholder")} value={nText} onChange={e=>setNT(e.target.value)} rows={4} style={{borderColor:noteDictating?"rgba(239,68,68,.3)":"var(--b)"}}/></div>
      <button className="btn bp" style={{width:"100%",height:46}} onClick={()=>{if(noteDictating)stopNoteDict();addN()}} disabled={!nText.trim()}>{t("save_note")}</button>
    </div></div>}
    {/* Daily Digest sheet */}
    {showDigest&&<div className="bsbg" onClick={()=>setSD(false)}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,paddingTop:8}}><h3 style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("digest_full_title")}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>setSD(false)}><I.x/></button></div>
      <p style={{fontSize:12,color:"var(--t4)",marginBottom:4}}>{t("digest_full_sub")}</p>
      <p style={{fontSize:10,color:"var(--t5)",marginBottom:16}}>{fFull()} {lastRefresh?`· ${lang==="fr"?"MAJ":"Updated"} ${new Date(lastRefresh).toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"})}`:""}</p>
      <div className="aline" style={{marginBottom:18}}/>
      {/* Stats bar */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>{[{l:t("watchlist_label"),v:watched.length,c:"var(--gold)"},{l:t("signals_lc"),v:liveSigs.length,c:"#0072CE"},{l:t("critical_lbl"),v:liveSigs.filter(s=>s.imp>=scoreThresholds.critical).length,c:"#991B1B"}].map(x=><div key={x.l} className="cs" style={{textAlign:"center",padding:"10px"}}><p style={{fontSize:20,fontWeight:700,color:x.c}}>{x.v}</p><p className="lbl" style={{color:"var(--t4)",marginTop:3,fontSize:9}}>{x.l}</p></div>)}</div>
      {/* Risk overview — top companies */}
      {watched.length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("risk_overview")}</h4><div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{watched.slice(0,8).map(co=>{const coSigs=liveSigs.filter(s=>{const n=s.company||"";return n.toLowerCase()===co.name.toLowerCase()||n.toLowerCase().includes(co.name.toLowerCase().split(" ")[0])});return (<div key={co.id} className="cs" style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}><Logo name={co.name} sz={26} fallback={co.logo}/><div style={{minWidth:0}}><p style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{co.name}</p><p style={{fontSize:10,color:"var(--t4)",marginTop:1}}>{coSigs.length} {coSigs.length>1?t("signals_lc"):t("signal")}</p></div></div><SR s={co.risk} sz={32} sw={2}/></div>)})}</div></>}
      {/* Recent signals timeline */}
      <h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{t("recent_activity")}</h4>
      {liveSigs.length>0?<div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>{liveSigs.slice(0,10).map((s,idx)=>{const cat=getCat(s.cat,lang);const co=cos.find(c=>{const n=s.company||"";return c.name.toLowerCase()===n.toLowerCase()||n.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])});return (<div key={s.id||idx} className="card" style={{padding:"12px 16px",cursor:"pointer"}} onClick={()=>{setSS(s);setSD(false)}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:6}}>{co&&<span style={{fontSize:11,fontWeight:500,color:"var(--gold2)"}}>{co.name}</span>}{!co&&s.company&&<span style={{fontSize:11,fontWeight:500,color:"var(--gold2)"}}>{s.company}</span>}</div><span className="badge" style={{background:sBg(s.imp||50),color:sT(s.imp||50)}}>{scoreLbl(s.imp||50,t)}</span></div><p style={{fontSize:12,color:"var(--t1)",lineHeight:1.4}}>{tx(s.title,lang)||s.company||"—"}</p><p style={{fontSize:10,color:"var(--t5)",marginTop:6}}>{tx(s.src||s.source,lang)||"Yahoo Finance"} · {s.at?fD(s.at,lang):"—"}</p></div>)})}</div>:<div style={{textAlign:"center",padding:"32px 16px"}}><p style={{fontSize:13,color:"var(--t4)",marginBottom:8}}>{t("no_activity")}</p><button className="btn bp" style={{padding:"8px 18px",fontSize:12}} onClick={()=>{setSD(false);refreshSignals()}}><I.refresh/>{lang==="fr"?"Lancer la veille":"Start monitoring"}</button></div>}
      {/* Copy digest */}
      {liveSigs.length>0&&<button className="btn bp" style={{width:"100%",height:46}} onClick={()=>{const header=`${t("digest_full_title").toUpperCase()}\n${fFull()}\n\n`;const stats=`${watched.length} ${t("companies_monitored")} · ${liveSigs.length} ${t("signal_count")}\n\n`;const sigs=liveSigs.slice(0,15).map(s=>`• [${s.imp}] ${s.company||""}: ${tx(s.title,lang)}`).join("\n");const full=`${header}${stats}${t("recent_activity").toUpperCase()}\n${sigs}\n\n— AIG Lines Intelligence`;navigator.clipboard?.writeText(full);showT(t("copied_clipboard"))}}><I.copy/>{t("copy_digest")}</button>}
    </div></div>}
    {/* Recording overlay */}
    {showRec&&<div className="bsbg" onClick={()=>{if(!isRec&&!recProcessing){setShowRec(false);setTranscript("")}}}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingTop:8}}><h3 style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("rec_title")}</h3>{!isRec&&!recProcessing&&<button className="bi" style={{width:32,height:32}} onClick={()=>{setShowRec(false);setTranscript("")}}><I.x/></button>}</div>
      <p style={{fontSize:12,color:"var(--t4)",marginBottom:20}}>{t("rec_sub")}</p>
      {cos.find(c=>c.id===recCid)&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--bg3)",borderRadius:"var(--rs)",marginBottom:20,border:"1px solid var(--b)"}}><Logo name={cos.find(c=>c.id===recCid)?.name} sz={28} fallback={cos.find(c=>c.id===recCid)?.logo}/><span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{cos.find(c=>c.id===recCid)?.name}</span></div>}
      {/* Transcript area */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--b)",borderRadius:"var(--rs)",padding:"16px",minHeight:120,maxHeight:280,overflowY:"auto",marginBottom:20}}>
        {recProcessing?<div style={{textAlign:"center",padding:"32px 0"}}><div className="pd" style={{margin:"0 auto 12px"}}/><p style={{fontSize:13,color:"var(--gold)"}}>{t("rec_processing")}</p></div>
        :isRec?<>{transcript?<p style={{fontSize:13,color:"var(--t2)",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{transcript}</p>:<p style={{fontSize:13,color:"var(--t5)",fontStyle:"italic"}}>{lang==="fr"?"En écoute…":"Listening…"}</p>}<div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}><div style={{width:8,height:8,borderRadius:"50%",background:"#DC2626",animation:"pd 1s ease-in-out infinite"}}/><span style={{fontSize:11,color:"#991B1B"}}>{t("rec_recording")}</span></div></>
        :transcript?<p style={{fontSize:13,color:"var(--t2)",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{transcript}</p>
        :<p style={{fontSize:13,color:"var(--t5)",textAlign:"center",padding:"24px 0"}}>{lang==="fr"?"Appuyez sur le bouton pour démarrer":"Press the button to start"}</p>}
      </div>
      {/* Controls */}
      {recProcessing?null
      :isRec?<button className="btn" style={{width:"100%",height:50,background:"rgba(220,38,38,.08)",color:"#991B1B",border:"1px solid rgba(239,68,68,.2)",borderRadius:"var(--rs)",fontSize:14,fontWeight:600}} onClick={stopRec}><I.stop/>{t("rec_stop")}</button>
      :transcript?<div style={{display:"flex",gap:10}}><button className="btn" style={{flex:1,height:46,background:"var(--bg3)",color:"var(--t3)",border:"1px solid var(--b2)",borderRadius:"var(--rs)"}} onClick={()=>{setTranscript("");startRec()}}><I.mic/>{lang==="fr"?"Recommencer":"Restart"}</button><button className="btn bp" style={{flex:1,height:46}} onClick={stopRec}><I.check/>{lang==="fr"?"Enregistrer le résumé":"Save summary"}</button></div>
      :<button className="btn bp" style={{width:"100%",height:50,fontSize:14}} onClick={startRec}><I.mic/>{t("rec_start")}</button>}
    </div></div>}

    {/* ═══ EMAIL TEMPLATE SHEET ═══ */}
    {emailSignal&&<div className="bsbg" onClick={()=>setEmailSignal(null)}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingTop:8}}><h3 style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("email_template")}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>setEmailSignal(null)}><I.x/></button></div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        <button className={`chip ${emailType==="broker"?"on":""}`} onClick={()=>setEmailType("broker")}>{t("email_to_broker")}</button>
        <button className={`chip ${emailType==="rm"?"on":""}`} onClick={()=>setEmailType("rm")}>{t("email_to_rm")}</button>
      </div>
      <div style={{background:"var(--bg3)",border:"1px solid var(--b)",borderRadius:"var(--rs)",padding:16,maxHeight:320,overflowY:"auto",marginBottom:16}}>
        <pre style={{fontSize:12,color:"var(--t2)",lineHeight:1.6,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>{generateEmail(emailSignal,emailType)}</pre>
      </div>
      <button className="btn bp" style={{width:"100%",height:46}} onClick={()=>{navigator.clipboard?.writeText(generateEmail(emailSignal,emailType));showT(t("copied_clipboard"));setEmailSignal(null)}}><I.copy/>{t("copy_email")}</button>
    </div></div>}
    {/* ═══ WEEKLY SUMMARY SHEET ═══ */}
    {showWeekly&&<div className="bsbg" onClick={()=>setShowWeekly(false)}><div className="bsm" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,paddingTop:8}}><h3 style={{fontSize:18,fontWeight:600,color:"var(--t1)"}}>{t("weekly_summary")}</h3><button className="bi" style={{width:32,height:32}} onClick={()=>setShowWeekly(false)}><I.x/></button></div>
      <p style={{fontSize:12,color:"var(--t4)",marginBottom:16}}>{t("weekly_summary_sub")}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {[{l:lang==="fr"?"Signaux":"Signals",v:weeklyData.total,c:"var(--gold)"},{l:lang==="fr"?"Critiques":"Critical",v:weeklyData.crit,c:"#991B1B"},{l:lang==="fr"?"Réunions":"Meetings",v:weeklyData.meetingsThisWeek,c:"#0072CE"}].map(x=><div key={x.l} className="cs" style={{textAlign:"center",padding:10}}><p style={{fontSize:20,fontWeight:700,color:x.c}}>{x.v}</p><p className="lbl" style={{color:"var(--t4)",marginTop:3,fontSize:9}}>{x.l}</p></div>)}
      </div>
      {Object.keys(weeklyData.byCo).length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{lang==="fr"?"Par entreprise":"By company"}</h4>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>{Object.entries(weeklyData.byCo).sort((a,b)=>b[1].signals.length-a[1].signals.length).slice(0,8).map(([name,data])=>(
        <div key={name} className="cs" style={{padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Logo name={name} sz={22} fallback={name[0]}/><span style={{fontSize:12,fontWeight:500,color:"var(--t1)"}}>{name}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:"var(--gold)"}}>{data.signals.length}</span>{data.crit>0&&<span className="badge" style={{background:"rgba(220,38,38,.08)",color:"#991B1B",fontSize:9,padding:"1px 5px"}}>{data.crit} crit.</span>}</div>
        </div>
      ))}</div></>}
      {Object.keys(weeklyData.byLine).length>0&&<><h4 className="lbl" style={{color:"var(--gold)",marginBottom:10}}>{lang==="fr"?"Lignes FL impactées":"FL lines impacted"}</h4>
      <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16}}>{Object.entries(weeklyData.byLine).sort((a,b)=>b[1]-a[1]).map(([l,n])=>(
        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
          <span style={{fontSize:12,color:"var(--t2)"}}>{lineLbl(l,lang)}</span>
          <span style={{fontSize:12,fontWeight:600,color:"var(--gold)"}}>{n}</span>
        </div>
      ))}</div></>}
      <button className="btn bp" style={{width:"100%",height:46}} onClick={copyWeekly}><I.copy/>{t("copy_weekly")}</button>
    </div></div>}
    {/* ═══ MISES À JOUR SUGGÉRÉES ═══ */}
    {showPending&&pendingUpdates.length>0&&<div className="bsbg" onClick={()=>setShowPending(false)}><div className="bsm" onClick={e=>e.stopPropagation()} style={{maxWidth:440}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,paddingTop:8}}>
        <h3 style={{fontSize:16,fontWeight:600,color:"var(--t1)"}}>{lang==="fr"?"Changement de Risk Manager détecté":"Risk Manager change detected"}</h3>
        <button className="bi" style={{width:32,height:32}} onClick={()=>setShowPending(false)}><I.x/></button>
      </div>
      <p style={{fontSize:12,color:"var(--t4)",marginBottom:16}}>{lang==="fr"?"Des changements de Risk Manager ont été détectés dans l'actualité récente. Souhaitez-vous mettre à jour vos fiches ?":"Risk Manager changes were detected in recent news. Would you like to update your files?"}</p>
      {pendingUpdates.map((u,i)=>(
        <div key={u.id} style={{border:"1px solid var(--b)",borderRadius:8,padding:14,marginBottom:10,background:"var(--bg3)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Logo name={u.company} sz={24}/>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{u.company}</p>
                <p style={{fontSize:9,color:"var(--t5)"}}>{u.source} — {u.date?new Date(u.date).toLocaleDateString(lang==="fr"?"fr-FR":"en-GB"):""}</p>
              </div>
            </div>
            <span className="ftag" style={{background:"rgba(91,33,182,.08)",color:"#5B21B6",flexShrink:0}}>Risk Manager</span>
          </div>
          <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.45,marginBottom:6}}>{u.title}</p>
          {u.currentRm&&<p style={{fontSize:11,color:"#991B1B",marginBottom:6}}>{lang==="fr"?"RM actuel sur la fiche":"Current RM on file"} : <strong>{u.currentRm}</strong></p>}
          {u.summary&&<p style={{fontSize:11,color:"var(--t3)",lineHeight:1.4,marginBottom:10}}>{(u.summary||"").substring(0,150)}</p>}
          <div style={{display:"flex",gap:8}}>
            <button className="btn bp" style={{flex:1,padding:"8px",fontSize:11}} onClick={()=>acceptUpdate(u)}>{lang==="fr"?"Mettre à jour la fiche":"Update file"}</button>
            <button className="btn" style={{padding:"8px 14px",fontSize:11,background:"rgba(220,38,38,.04)",color:"#991B1B",border:"1px solid rgba(220,38,38,.12)"}} onClick={()=>dismissUpdate(u.id)}>{lang==="fr"?"Ignorer":"Dismiss"}</button>
          </div>
        </div>
      ))}
      <button className="btn" style={{width:"100%",padding:"8px",fontSize:11,color:"var(--t4)",background:"transparent",border:"1px solid var(--b)",marginTop:4}} onClick={()=>{pendingUpdates.forEach(u=>dismissUpdate(u.id));setShowPending(false)}}>{lang==="fr"?"Tout ignorer":"Dismiss all"}</button>
    </div></div>}

    {/* ═══ GUIDE D'UTILISATION ═══ */}
    {showGuide&&(()=>{const sections=lang==="fr"?[
      {title:"Bienvenue",content:"AIG Lines Intelligence est votre outil de veille et d'intelligence stratégique. Il surveille en temps réel l'actualité de vos entreprises et identifie les signaux pertinents pour toutes les lignes d'assurance.",tips:["L'app se met à jour automatiquement toutes les 15 minutes","Les signaux apparaissent instantanément dès qu'ils sont détectés","Vous pouvez installer l'app sur votre téléphone comme une app native"]},
      {title:"Tableau de bord",content:"Votre cockpit exécutif. En un coup d'œil, visualisez l'état de votre portefeuille : nombre de signaux, entreprises actives, signaux critiques, répartition des risques.",tips:["La synthèse du jour résume l'activité en une phrase","Les 5 entreprises les plus exposées sont mises en avant","Cliquez sur la synthèse pour voir le digest détaillé","Filtrez par catégorie (Gouvernance, Cyber, M&A...) avec les chips"]},
      {title:"Watchlist",content:"Votre portefeuille d'entreprises surveillées. 117 entreprises sont pré-chargées (CAC 40, SBF 120, européennes). Vous pouvez en ajouter ou en retirer à tout moment.",tips:["Triez par Risque, A→Z, Signaux ou Courtier","La vue Courtier regroupe les entreprises par broker","Utilisez la barre de recherche pour ajouter une entreprise","Chaque entreprise affiche son nombre de signaux et son score de risque"]},
      {title:"Fiche entreprise",content:"Le dossier complet de chaque entreprise : score de risque avec évolution 30 jours, signaux récents, lignes impactées, programme d'assurance, dossier client, notes.",tips:["'Générer le brief' crée un résumé de réunion en un clic","'Présenter' ouvre un mode plein écran projetable en réunion","'Analyse IA' lance une analyse stratégique complète avec 3 scénarios","Le programme d'assurance visualise les tranches et assureurs en graphique"]},
      {title:"Signaux",content:"Chaque signal représente un événement détecté (article de presse, annonce BODACC, sanction AMF/CNIL, alerte boursière). Il est catégorisé, scoré et relié aux lignes d'assurance impactées.",tips:["Le badge indique l'importance : Critique (rouge), Élevé (orange), Moyen (bleu), Faible (vert)","Cliquez sur la source pour lire l'article original","Quand plusieurs médias couvrent le même sujet, les sources sont regroupées","Les dates affichent l'heure de publication de l'article"]},
      {title:"Notes",content:"Prenez des notes sur chaque entreprise ou de façon globale. Chaque note a un tag : Observation, Hypothèse, Action, Question, Décision.",tips:["Utilisez le micro pour dicter vos notes","Les notes enrichissent automatiquement les briefs de réunion","Filtrez par tag pour retrouver rapidement vos actions ou hypothèses"]},
      {title:"Brief de réunion",content:"Générez un brief en un clic pour préparer vos rendez-vous. Il inclut les signaux récents, les lignes impactées, les angles de discussion, et vos notes.",tips:["Le brief est copié automatiquement dans le presse-papier","Vous pouvez aussi l'exporter en PDF","L'historique des briefs est conservé dans l'onglet Brief","Planifiez des réunions directement avec export calendrier (.ics)"]},
      {title:"Dossier client",content:"Pour chaque entreprise, renseignez le courtier référent, le risk manager, la date de renouvellement, la prime, le programme en place, la sinistralité et le contexte.",tips:["Sélectionnez le courtier dans la liste déroulante (46 cabinets)","Configurez la structure du programme (tranches, assureurs, montants en M€)","Le graphique du programme se met à jour automatiquement","Importez des documents (PDF, Excel, Word) dans le dossier"]},
      {title:"Analyse IA",content:"L'analyse stratégique utilise Claude (IA) pour croiser les signaux, le dossier client et le contexte économique. Elle produit une vue Passé / Présent / Projections.",tips:["3 scénarios sont proposés : optimiste, central, pessimiste","Chaque scénario indique la probabilité et l'impact sur le score de risque","Les actions prioritaires sont numérotées","L'angle commercial vous prépare pour le prochain rendez-vous"]},
      {title:"Paramètres",content:"Personnalisez votre expérience : langue, lignes préférées, fréquence de rafraîchissement, seuils de scoring. Exportez vos données en CSV ou PDF.",tips:["Sélectionnez les lignes que vous suivez dans 'Lignes préférées'","'Exporter mes données' permet de filtrer par date, entreprise, catégorie","'Signaler un problème' envoie un ticket avec capture écran à l'administrateur"]}
    ]:[
      {title:"Welcome",content:"AIG Lines Intelligence is your strategic intelligence tool. It monitors news in real-time for your companies and identifies relevant signals for all insurance lines.",tips:["The app updates automatically every 15 minutes","Signals appear instantly when detected","You can install the app on your phone as a native app"]},
      {title:"Dashboard",content:"Your executive cockpit. See your portfolio status at a glance: signal count, active companies, critical signals, risk distribution.",tips:["Daily synthesis summarizes activity in one sentence","Top 5 most exposed companies are highlighted","Click the synthesis to see the detailed digest","Filter by category using the chips"]},
      {title:"Watchlist",content:"Your monitored company portfolio. 117 companies are pre-loaded. Add or remove at any time.",tips:["Sort by Risk, A→Z, Signals or Broker","Broker view groups companies by broker","Use search to add a company"]},
      {title:"Company Profile",content:"Complete company file: risk score with 30-day evolution, recent signals, impacted lines, insurance programme, client file, notes.",tips:["'Generate brief' creates a meeting summary in one click","'Present' opens fullscreen mode for meetings","'AI Analysis' runs a complete strategic analysis with 3 scenarios"]},
      {title:"Signals",content:"Each signal is a detected event (news article, BODACC announcement, AMF/CNIL sanction, stock alert). Categorized, scored and linked to impacted insurance lines.",tips:["Click on the source to read the original article","Multiple sources covering the same topic are grouped","Dates show the article publication time"]},
      {title:"Notes",content:"Take notes on each company or globally. Each note has a tag: Observation, Hypothesis, Action, Question, Decision.",tips:["Use the microphone to dictate notes","Notes automatically enrich meeting briefs"]},
      {title:"Meeting Brief",content:"Generate a brief in one click. Includes recent signals, impacted lines, discussion angles, and your notes.",tips:["Brief is automatically copied to clipboard","Export to PDF available","Schedule meetings with calendar export (.ics)"]},
      {title:"Client File",content:"For each company, enter the broker, risk manager, renewal date, premium, programme, claims history and context.",tips:["Select broker from dropdown (46 firms)","Configure programme structure (layers, insurers, amounts in M€)"]},
      {title:"AI Analysis",content:"Strategic analysis using Claude AI. Crosses signals, client file and economic context. Produces Past / Present / Projections view.",tips:["3 scenarios: optimistic, base case, pessimistic","Each scenario shows probability and risk score impact"]},
      {title:"Settings",content:"Customize: language, preferred lines, refresh frequency, scoring thresholds. Export data in CSV or PDF.",tips:["Select your lines in 'Preferred lines'","'Report an issue' sends a ticket with screenshot to admin"]}
    ];const s=sections[guideSection]||sections[0];const total=sections.length;return(
    <div style={{position:"fixed",inset:0,background:"#fff",zIndex:500,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#002B5C",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{border:"1.5px solid rgba(255,255,255,.8)",padding:"1px 6px",fontSize:11,fontWeight:700,color:"#fff",borderRadius:2}}>AIG</span>
          <span style={{fontSize:14,color:"rgba(255,255,255,.85)"}}>{lang==="fr"?"Guide d'utilisation":"User guide"}</span>
        </div>
        <button style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,padding:"4px 12px",fontSize:12,color:"#fff",cursor:"pointer"}} onClick={()=>setShowGuide(false)}>{lang==="fr"?"Fermer":"Close"}</button>
      </div>

      <div style={{flex:1,overflow:"auto",padding:"24px 20px",maxWidth:480,margin:"0 auto",width:"100%"}}>
        <div style={{display:"flex",gap:4,marginBottom:20}}>
          {sections.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=guideSection?"#002B5C":"#E2E6EB",cursor:"pointer"}} onClick={()=>setGuideSection(i)}/>)}
        </div>

        <p style={{fontSize:10,color:"#7D8A9A",marginBottom:6}}>{guideSection+1} / {total}</p>
        <h2 style={{fontSize:22,fontWeight:600,color:"#002B5C",marginBottom:16}}>{s.title}</h2>

        <div style={{background:"#FAFBFC",borderRadius:8,padding:16,marginBottom:20,border:"1px solid #E2E6EB",minHeight:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <p style={{fontSize:12,color:"#A8B1BD",fontStyle:"italic"}}>{lang==="fr"?"Capture écran à venir":"Screenshot coming soon"}</p>
        </div>

        <p style={{fontSize:14,color:"#3D4E63",lineHeight:1.6,marginBottom:20}}>{s.content}</p>

        <div style={{background:"rgba(0,114,206,.03)",borderRadius:8,padding:14,border:"1px solid rgba(0,114,206,.1)"}}>
          <p style={{fontSize:9,fontWeight:600,color:"#0072CE",marginBottom:8,letterSpacing:"0.1em"}}>{lang==="fr"?"ASTUCES":"TIPS"}</p>
          {s.tips.map((tip,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:"#0072CE",fontSize:12,flexShrink:0}}>•</span><p style={{fontSize:12,color:"#3D4E63",lineHeight:1.45}}>{tip}</p></div>)}
        </div>
      </div>

      <div style={{padding:"12px 20px",borderTop:"1px solid #E2E6EB",display:"flex",justifyContent:"space-between",flexShrink:0}}>
        <button className="btn" style={{padding:"8px 20px",fontSize:13,background:guideSection>0?"rgba(0,43,92,.06)":"transparent",color:guideSection>0?"#002B5C":"#A8B1BD",border:"1px solid "+(guideSection>0?"rgba(0,43,92,.12)":"transparent"),borderRadius:6}} onClick={()=>setGuideSection(Math.max(0,guideSection-1))} disabled={guideSection===0}>{lang==="fr"?"Précédent":"Previous"}</button>
        {guideSection<total-1?<button className="btn bp" style={{padding:"8px 20px",fontSize:13}} onClick={()=>setGuideSection(guideSection+1)}>{lang==="fr"?"Suivant":"Next"}</button>
        :<button className="btn bp" style={{padding:"8px 20px",fontSize:13}} onClick={()=>setShowGuide(false)}>{lang==="fr"?"Commencer":"Get started"}</button>}
      </div>
    </div>)})()}

    {/* ═══ ANALYSE STRATÉGIQUE ═══ */}
    {showAnalysis&&<div className="bsbg" onClick={()=>{setShowAnalysis(false);setAnalysisResult(null)}}><div className="bsm" onClick={e=>e.stopPropagation()} style={{maxWidth:500,maxHeight:"90vh",overflow:"auto"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingTop:8}}>
        <h3 style={{fontSize:16,fontWeight:600,color:"var(--t1)"}}>{lang==="fr"?"Analyse stratégique IA":"AI Strategic Analysis"}</h3>
        <button className="bi" style={{width:32,height:32}} onClick={()=>{setShowAnalysis(false);setAnalysisResult(null)}}><I.x/></button>
      </div>

      {analysisLoading&&<div style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{width:40,height:40,border:"3px solid var(--b)",borderTopColor:"var(--gold)",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
        <p style={{fontSize:14,color:"var(--t2)",fontWeight:500,marginBottom:4}}>{lang==="fr"?"Analyse en cours...":"Analyzing..."}</p>
        <p style={{fontSize:12,color:"var(--t4)"}}>{lang==="fr"?"Claude analyse les signaux, le dossier client et le contexte économique":"Claude is analyzing signals, client file and economic context"}</p>
      </div>}

      {analysisResult&&analysisResult.error&&<div style={{textAlign:"center",padding:"40px 20px"}}>
        <p style={{fontSize:14,color:"#991B1B"}}>{analysisResult.error}</p>
        <button className="btn bp" style={{marginTop:12,padding:"8px 20px",fontSize:12}} onClick={()=>{const cid=selComp;if(cid)runAnalysis(cid)}}>{lang==="fr"?"Réessayer":"Retry"}</button>
      </div>}

      {analysisResult&&!analysisResult.error&&<div>
        {/* PASSÉ */}
        {analysisResult.past&&<div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:28,height:28,borderRadius:6,background:"rgba(0,114,206,.08)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14}}>&#8592;</span></div>
            <div><h4 style={{fontSize:13,fontWeight:600,color:"var(--gold)"}}>{analysisResult.past.title||"Rétrospective"}</h4><span style={{fontSize:10,color:"var(--t5)"}}>{analysisResult.past.period}</span></div>
            <span style={{marginLeft:"auto",fontSize:10,padding:"2px 8px",borderRadius:8,background:analysisResult.past.risk_trajectory==="hausse"?"rgba(220,38,38,.08)":analysisResult.past.risk_trajectory==="baisse"?"rgba(22,163,74,.08)":"rgba(0,114,206,.08)",color:analysisResult.past.risk_trajectory==="hausse"?"#991B1B":analysisResult.past.risk_trajectory==="baisse"?"#166534":"#1E40AF"}}>{analysisResult.past.risk_trajectory==="hausse"?"Risque en hausse":analysisResult.past.risk_trajectory==="baisse"?"Risque en baisse":"Risque stable"}</span>
          </div>
          <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.5,marginBottom:8}}>{analysisResult.past.summary}</p>
          {analysisResult.past.key_events?.map((e,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:3}}><span style={{color:"var(--gold)",fontSize:11,flexShrink:0}}>•</span><span style={{fontSize:11,color:"var(--t3)"}}>{e}</span></div>)}
        </div>}

        {/* PRÉSENT */}
        {analysisResult.present&&<div style={{marginBottom:20,background:"rgba(0,43,92,.02)",borderRadius:8,padding:14,border:"1px solid var(--b)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:28,height:28,borderRadius:6,background:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12,color:"#fff",fontWeight:700}}>!</span></div>
            <h4 style={{fontSize:13,fontWeight:600,color:"var(--gold)"}}>{analysisResult.present.title||"Situation actuelle"}</h4>
            <span style={{marginLeft:"auto",fontSize:10,padding:"2px 8px",borderRadius:8,fontWeight:600,background:analysisResult.present.risk_level==="critique"?"rgba(220,38,38,.1)":analysisResult.present.risk_level==="élevé"?"rgba(217,119,6,.1)":analysisResult.present.risk_level==="faible"?"rgba(22,163,74,.1)":"rgba(37,99,235,.1)",color:analysisResult.present.risk_level==="critique"?"#991B1B":analysisResult.present.risk_level==="élevé"?"#92400E":analysisResult.present.risk_level==="faible"?"#166534":"#1E40AF"}}>{analysisResult.present.risk_level}</span>
          </div>
          <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.5,marginBottom:10}}>{analysisResult.present.summary}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><p style={{fontSize:9,fontWeight:600,color:"#166534",marginBottom:4}}>{lang==="fr"?"FORCES":"STRENGTHS"}</p>{analysisResult.present.strengths?.map((s,i)=><p key={i} style={{fontSize:10,color:"#166534",marginBottom:2}}>+ {s}</p>)}</div>
            <div><p style={{fontSize:9,fontWeight:600,color:"#991B1B",marginBottom:4}}>{lang==="fr"?"PRÉOCCUPATIONS":"CONCERNS"}</p>{analysisResult.present.concerns?.map((c,i)=><p key={i} style={{fontSize:10,color:"#991B1B",marginBottom:2}}>- {c}</p>)}</div>
          </div>
          {analysisResult.present.policy_adequacy&&<div style={{marginTop:10,padding:"8px 10px",background:"rgba(0,114,206,.04)",borderRadius:6}}><p style={{fontSize:9,fontWeight:600,color:"var(--gold)",marginBottom:3}}>{lang==="fr"?"ADÉQUATION DU PROGRAMME":"POLICY ADEQUACY"}</p><p style={{fontSize:11,color:"var(--t2)",lineHeight:1.4}}>{analysisResult.present.policy_adequacy}</p></div>}
        </div>}

        {/* SCÉNARIOS */}
        {analysisResult.scenarios&&<div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:28,height:28,borderRadius:6,background:"rgba(124,58,237,.08)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14}}>&#8594;</span></div>
            <h4 style={{fontSize:13,fontWeight:600,color:"var(--gold)"}}>{lang==="fr"?"Projections":"Projections"}</h4>
          </div>
          {analysisResult.scenarios.map((sc,i)=>{const colors=[{bg:"rgba(22,163,74,.05)",border:"rgba(22,163,74,.2)",title:"#166534"},{bg:"rgba(37,99,235,.05)",border:"rgba(37,99,235,.2)",title:"#1E40AF"},{bg:"rgba(220,38,38,.05)",border:"rgba(220,38,38,.2)",title:"#991B1B"}];const c=colors[i]||colors[1];return(
            <div key={i} style={{border:"1px solid "+c.border,borderRadius:8,padding:12,marginBottom:8,background:c.bg}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <h5 style={{fontSize:12,fontWeight:600,color:c.title}}>{sc.name}</h5>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:10,color:"var(--t4)"}}>{sc.probability}%</span>
                  <div style={{width:40,height:6,borderRadius:3,background:"var(--b)"}}><div style={{width:sc.probability+"%",height:"100%",borderRadius:3,background:c.title}}/></div>
                  {sc.impact_risk!==0&&<span style={{fontSize:10,fontWeight:600,color:sc.impact_risk>0?"#991B1B":"#166534"}}>{sc.impact_risk>0?"+":""}{sc.impact_risk} pts</span>}
                </div>
              </div>
              <p style={{fontSize:11,color:"var(--t2)",lineHeight:1.4,marginBottom:6}}>{sc.description}</p>
              {sc.impact_lines&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>{Object.entries(sc.impact_lines).map(([l,v])=><span key={l} style={{fontSize:8,padding:"1px 6px",borderRadius:6,background:"rgba(0,43,92,.06)",color:"var(--t3)"}}>{lineLbl(l,lang)}: {v}</span>)}</div>}
              <p style={{fontSize:10,color:c.title,fontStyle:"italic"}}>{sc.recommendation}</p>
            </div>
          )})}
        </div>}

        {/* ACTIONS */}
        {analysisResult.actions&&<div style={{marginBottom:16}}>
          <p style={{fontSize:9,fontWeight:600,color:"var(--gold)",marginBottom:6}}>{lang==="fr"?"ACTIONS PRIORITAIRES":"PRIORITY ACTIONS"}</p>
          {analysisResult.actions.map((a,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:4}}><span style={{color:"var(--gold)",fontWeight:700,fontSize:12,flexShrink:0}}>{i+1}.</span><span style={{fontSize:11,color:"var(--t2)"}}>{a}</span></div>)}
        </div>}

        {/* ANGLE COMMERCIAL */}
        {analysisResult.commercial_angle&&<div style={{background:"rgba(0,43,92,.04)",borderRadius:8,padding:12,borderLeft:"3px solid var(--gold)"}}>
          <p style={{fontSize:9,fontWeight:600,color:"var(--gold)",marginBottom:4}}>{lang==="fr"?"ANGLE COMMERCIAL":"COMMERCIAL ANGLE"}</p>
          <p style={{fontSize:12,color:"var(--t1)",lineHeight:1.5}}>{analysisResult.commercial_angle}</p>
        </div>}

        <div style={{display:"flex",gap:8,marginTop:16}}>
        <button className="btn" style={{flex:1,padding:"8px",fontSize:11,background:"rgba(0,114,206,.06)",color:"var(--gold2)",border:"1px solid rgba(0,114,206,.15)"}} onClick={()=>{const text="ANALYSE STRATÉGIQUE — "+(cos.find(c=>c.id===selComp)?.name||"")+"\n\n"+JSON.stringify(analysisResult,null,2);navigator.clipboard?.writeText(text);showT(lang==="fr"?"Analyse copiée":"Analysis copied")}}>{lang==="fr"?"Copier":"Copy"}</button>
        <button className="btn" style={{flex:1,padding:"8px",fontSize:11,background:"var(--gold)",color:"#fff",border:"none"}} onClick={()=>{const co=cos.find(c=>c.id===selComp);const r=analysisResult;if(!r)return;const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Analyse stratégique — ${co?.name||""}</title><style>body{font-family:Segoe UI,sans-serif;padding:40px;color:#263348;max-width:800px;margin:0 auto}h1{color:#002B5C;font-size:20px;border-bottom:2px solid #002B5C;padding-bottom:8px}h2{color:#0072CE;font-size:15px;margin-top:20px}h3{color:#002B5C;font-size:13px;margin-top:14px}.meta{font-size:11px;color:#7D8A9A}.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:600}.green{background:#D1FAE5;color:#065F46}.orange{background:#FFFBEB;color:#92400E}.red{background:#FEF2F2;color:#991B1B}.blue{background:#EFF6FF;color:#1E40AF}.section{margin-bottom:18px;padding:16px;border:1px solid #E2E6EB;border-radius:8px}.scenario{padding:12px;border-radius:6px;margin-bottom:8px}.s-opt{background:#F0FDF4;border-left:3px solid #16A34A}.s-mid{background:#EFF6FF;border-left:3px solid #2563EB}.s-pes{background:#FEF2F2;border-left:3px solid #DC2626}ul{padding-left:18px}li{margin-bottom:4px;font-size:13px}.footer{margin-top:30px;text-align:center;font-size:10px;color:#A8B1BD;border-top:1px solid #E2E6EB;padding-top:10px}@media print{body{padding:20px}}</style></head><body><h1>AIG — Analyse stratégique</h1><p class="meta">${co?.name||""} · ${new Date().toLocaleDateString("fr-FR")} · Confidentiel</p>${r.past?`<div class="section"><h2>← Rétrospective <span class="badge ${r.past.risk_trajectory==="hausse"?"red":r.past.risk_trajectory==="baisse"?"green":"blue"}">${r.past.risk_trajectory==="hausse"?"Risque en hausse":r.past.risk_trajectory==="baisse"?"Risque en baisse":"Risque stable"}</span></h2><p>${r.past.summary||""}</p><ul>${(r.past.key_events||[]).map(e=>"<li>"+e+"</li>").join("")}</ul></div>`:""} ${r.present?`<div class="section"><h2>! Situation actuelle <span class="badge ${r.present.risk_level==="critique"?"red":r.present.risk_level==="élevé"?"orange":r.present.risk_level==="faible"?"green":"blue"}">${r.present.risk_level||""}</span></h2><p>${r.present.summary||""}</p><h3>Forces</h3><ul>${(r.present.strengths||[]).map(s=>"<li>"+s+"</li>").join("")}</ul><h3>Préoccupations</h3><ul>${(r.present.concerns||[]).map(c=>"<li>"+c+"</li>").join("")}</ul>${r.present.policy_adequacy?"<h3>Adéquation du programme</h3><p>"+r.present.policy_adequacy+"</p>":""}</div>`:""} ${r.scenarios?`<div class="section"><h2>→ Projections</h2>${r.scenarios.map((s,i)=>'<div class="scenario '+(i===0?"s-opt":i===1?"s-mid":"s-pes")+'"><strong>'+s.name+' ('+s.probability+'%)</strong>'+(s.impact_risk?` <span class="badge ${s.impact_risk>0?"red":"green"}">${s.impact_risk>0?"+":""}${s.impact_risk} pts</span>`:"")+`<p>${s.description||""}</p><p><em>${s.recommendation||""}</em></p></div>`).join("")}</div>`:""} ${r.actions?`<div class="section"><h2>Actions prioritaires</h2><ol>${r.actions.map(a=>"<li>"+a+"</li>").join("")}</ol></div>`:""} ${r.commercial_angle?`<div class="section" style="border-left:3px solid #002B5C"><h2>Angle commercial</h2><p>${r.commercial_angle}</p></div>`:""}<p class="footer">© 2026 AIG — Lines Intelligence · Document confidentiel</p></body></html>`;const w=window.open("","_blank");if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),500)}}}>{lang==="fr"?"Exporter PDF":"Export PDF"}</button>
        </div>
      </div>}
    </div></div>}

    {/* ═══ EXPORT MODAL ═══ */}
    {showExport&&<div className="bsbg" onClick={()=>setShowExport(false)}><div className="bsm" onClick={e=>e.stopPropagation()} style={{maxWidth:440}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingTop:8}}>
        <h3 style={{fontSize:16,fontWeight:600,color:"var(--t1)"}}>{lang==="fr"?"Exporter mes données":"Export my data"}</h3>
        <button className="bi" style={{width:32,height:32}} onClick={()=>setShowExport(false)}><I.x/></button>
      </div>

      <label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"TYPE DE DONNÉES":"DATA TYPE"}</label>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {[{k:"signals",l:lang==="fr"?"Signaux":"Signals"},{k:"notes",l:"Notes"},{k:"watchlist",l:"Watchlist"},{k:"all",l:lang==="fr"?"Tout":"All"}].map(o=>
          <button key={o.k} className={"chip "+(expType===o.k?"on":"")} onClick={()=>setExpType(o.k)}>{o.l}</button>
        )}
      </div>

      <label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"FORMAT":"FORMAT"}</label>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{k:"csv",l:"CSV (Excel)"},{k:"pdf",l:"PDF"}].map(o=>
          <button key={o.k} className={"chip "+(expFormat===o.k?"on":"")} onClick={()=>setExpFormat(o.k)}>{o.l}</button>
        )}
      </div>

      <label className="lbl" style={{color:"var(--t4)",display:"block",marginBottom:6,fontSize:9}}>{lang==="fr"?"FILTRES (optionnels)":"FILTERS (optional)"}</label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <div><label style={{fontSize:9,color:"var(--t5)"}}>{lang==="fr"?"Du":"From"}</label><input className="inp" type="date" value={expDateFrom} onChange={e=>setExpDateFrom(e.target.value)} style={{fontSize:11}}/></div>
        <div><label style={{fontSize:9,color:"var(--t5)"}}>{lang==="fr"?"Au":"To"}</label><input className="inp" type="date" value={expDateTo} onChange={e=>setExpDateTo(e.target.value)} style={{fontSize:11}}/></div>
      </div>
      <input className="inp" style={{marginBottom:8,fontSize:11}} placeholder={lang==="fr"?"Filtrer par entreprise...":"Filter by company..."} value={expCompany} onChange={e=>setExpCompany(e.target.value)}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        <select className="inp" style={{fontSize:11}} value={expCat} onChange={e=>setExpCat(e.target.value)}>
          <option value="">{lang==="fr"?"Toutes catégories":"All categories"}</option>
          {CATS.map(c=><option key={c.id} value={c.id}>{getCat(c.id,lang)?.label}</option>)}
        </select>
        <select className="inp" style={{fontSize:11}} value={expLine} onChange={e=>setExpLine(e.target.value)}>
          <option value="">{lang==="fr"?"Toutes lignes":"All lines"}</option>
          {Object.keys(LINES).map(k=><option key={k} value={k}>{lineLbl(k,lang)}</option>)}
        </select>
      </div>

      <button className="btn bp" style={{width:"100%",height:42}} onClick={doExport}>
        {lang==="fr"?"Exporter":"Export"} ({expFormat.toUpperCase()})
      </button>
    </div></div>}

    {/* ═══ TICKET ALARM OVERLAY ═══ */}
    {ticketAlarm&&<div style={{position:"fixed",inset:0,background:"rgba(153,27,27,.95)",zIndex:600,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}} onClick={e=>e.stopPropagation()}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,animation:"pd 1s ease-in-out infinite"}}>
        <I.bell style={{width:40,height:40,color:"#fff"}}/>
      </div>
      <h2 style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:8,textAlign:"center"}}>{lang==="fr"?"NOUVEAU TICKET":"NEW TICKET"}</h2>
      <p style={{fontSize:14,color:"rgba(255,255,255,.8)",marginBottom:6,textAlign:"center"}}>{ticketAlarm.user_email}</p>
      <p style={{fontSize:16,color:"#fff",marginBottom:24,textAlign:"center",maxWidth:320,lineHeight:1.5}}>{ticketAlarm.message?.substring(0,200)}</p>
      {ticketAlarm.screenshot&&<img src={ticketAlarm.screenshot} style={{maxWidth:"80%",maxHeight:200,borderRadius:8,border:"2px solid rgba(255,255,255,.3)",marginBottom:24}} alt="screenshot"/>}
      <button style={{padding:"16px 48px",fontSize:16,fontWeight:700,color:"#991B1B",background:"#fff",border:"none",borderRadius:12,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,.3)"}} onClick={stopAlarm}>{lang==="fr"?"J'AI VU — Couper l'alarme":"DISMISS — Stop alarm"}</button>
    </div>}
    {/* ═══ TICKET MODAL ═══ */}
    {showTicket&&<div className="bsbg" onClick={()=>setShowTicket(false)}><div className="bsm" onClick={e=>e.stopPropagation()} style={{maxWidth:420}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><div style={{width:40,height:4,borderRadius:2,background:"var(--b2)"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingTop:8}}>
        <h3 style={{fontSize:16,fontWeight:600,color:"var(--t1)"}}>{lang==="fr"?"Signaler un problème":"Report an issue"}</h3>
        <button className="bi" style={{width:32,height:32}} onClick={()=>setShowTicket(false)}><I.x/></button>
      </div>
      <textarea className="inp" placeholder={lang==="fr"?"Décrivez le problème rencontré...":"Describe the issue..."} value={ticketText} onChange={e=>setTicketText(e.target.value)} rows={4} style={{marginBottom:12}}/>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:12,color:"var(--t4)",display:"block",marginBottom:6}}>{lang==="fr"?"Capture écran (optionnel)":"Screenshot (optional)"}</label>
        <input type="file" accept="image/*" onChange={handleTicketImg} style={{fontSize:12,color:"var(--t3)"}}/>
        {ticketImg&&<div style={{marginTop:8,position:"relative"}}>
          <img src={ticketImg} style={{maxWidth:"100%",maxHeight:150,borderRadius:6,border:"1px solid var(--b)"}} alt="preview"/>
          <button style={{position:"absolute",top:4,right:4,width:20,height:20,borderRadius:10,background:"rgba(0,0,0,.5)",border:"none",color:"#fff",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setTicketImg(null)}>×</button>
        </div>}
      </div>
      <button className="btn bp" style={{width:"100%",height:42,opacity:ticketSending?.6:1}} onClick={submitTicket} disabled={ticketSending||!ticketText.trim()}>
        {ticketSending?(lang==="fr"?"Envoi...":"Sending..."):(lang==="fr"?"Envoyer le ticket":"Send ticket")}
      </button>
    </div></div>}
    {/* ═══ PRESENTATION MODE ═══ */}
    {showPresentation&&(()=>{const co=cos.find(c=>c.id===showPresentation);if(!co)return null;const sigs=getSigs(showPresentation);const lines=getLinesAll(sigs);const dos=getDossier(showPresentation);const imps=[...IMPACTS,...liveImpacts].filter(i=>sigs.some(s=>s.id===i.sid));return(
    <div style={{position:"fixed",inset:0,background:"#fff",zIndex:500,overflow:"auto",padding:"40px 60px"}} onClick={e=>e.target===e.currentTarget&&setShowPresentation(null)}>
      <button style={{position:"fixed",top:16,right:16,background:"#002B5C",color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",zIndex:501}} onClick={()=>setShowPresentation(null)}>{lang==="fr"?"Fermer":"Close"}</button>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:32}}>
          <Logo name={co.name} sz={56} fallback={co.logo}/>
          <div>
            <h1 style={{fontSize:32,fontWeight:600,color:"#002B5C",marginBottom:4}}>{co.name}</h1>
            <p style={{fontSize:16,color:"#5C6B7D"}}>{tx(co.sector,lang)} — {co.hq}</p>
          </div>
          <div style={{marginLeft:"auto",textAlign:"center"}}>
            <div style={{fontSize:36,fontWeight:700,color:sC(co.risk)}}>{co.risk}</div>
            <p style={{fontSize:11,color:"#7D8A9A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Score risque</p>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:32}}>
          <div style={{background:"#F3F5F7",borderRadius:8,padding:20,textAlign:"center"}}><p style={{fontSize:28,fontWeight:700,color:"#002B5C"}}>{sigs.length}</p><p style={{fontSize:12,color:"#7D8A9A"}}>{lang==="fr"?"Signaux actifs":"Active signals"}</p></div>
          <div style={{background:"#F3F5F7",borderRadius:8,padding:20,textAlign:"center"}}><p style={{fontSize:28,fontWeight:700,color:"#DC2626"}}>{sigs.filter(s=>(s.imp||0)>=80).length}</p><p style={{fontSize:12,color:"#7D8A9A"}}>{lang==="fr"?"Critiques":"Critical"}</p></div>
          <div style={{background:"#F3F5F7",borderRadius:8,padding:20,textAlign:"center"}}><p style={{fontSize:28,fontWeight:700,color:"#0072CE"}}>{lines.length}</p><p style={{fontSize:12,color:"#7D8A9A"}}>{lang==="fr"?"Lignes impactées":"Lines impacted"}</p></div>
        </div>
        {dos&&<div style={{background:"#F3F5F7",borderRadius:8,padding:20,marginBottom:32}}>
          <h3 style={{fontSize:14,fontWeight:600,color:"#002B5C",marginBottom:12}}>{lang==="fr"?"Dossier client":"Client file"}</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:13,color:"#3D4E63"}}>
            {dos.broker&&<p><strong>{lang==="fr"?"Courtier":"Broker"}:</strong> {dos.broker}</p>}
            {dos.rm&&<p><strong>Risk Manager:</strong> {dos.rm}</p>}
            {dos.renewal&&<p><strong>{lang==="fr"?"Renouvellement":"Renewal"}:</strong> {dos.renewal}</p>}
            {dos.premium&&<p><strong>{lang==="fr"?"Prime":"Premium"}:</strong> {dos.premium}</p>}
          </div>
          {dos.program&&<p style={{fontSize:13,color:"#3D4E63",marginTop:8}}><strong>{lang==="fr"?"Programme":"Programme"}:</strong> {dos.program}</p>}
        </div>}
        {lines.length>0&&<div style={{marginBottom:32}}>
          <h3 style={{fontSize:14,fontWeight:600,color:"#002B5C",marginBottom:12}}>{lang==="fr"?"Lignes impactées":"Impacted lines"}</h3>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{lines.map(l=><span key={l} style={{padding:"6px 14px",borderRadius:20,background:"rgba(0,114,206,.06)",color:"#002B5C",fontSize:13,fontWeight:500,border:"1px solid rgba(0,114,206,.15)"}}>{lineLbl(l,lang)}</span>)}</div>
        </div>}
        <h3 style={{fontSize:14,fontWeight:600,color:"#002B5C",marginBottom:12}}>{lang==="fr"?"Signaux prioritaires":"Priority signals"}</h3>
        {sigs.slice(0,8).map((s,i)=>{const cat=getCat(s.cat,lang);return(
          <div key={s.id||i} style={{padding:"14px 18px",borderLeft:"3px solid "+(sC(s.imp||50)),marginBottom:8,background:"#FAFBFC",borderRadius:"0 8px 8px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:14,fontWeight:600,color:"#263348"}}>{tx(s.title,lang)}</span>
              <span style={{fontSize:11,fontWeight:700,color:sC(s.imp||50)}}>{scoreLbl(s.imp||50,t)}</span>
            </div>
            <p style={{fontSize:12,color:"#5C6B7D"}}>{tx(s.sum,lang)}</p>
            <div style={{display:"flex",gap:8,marginTop:6}}><span style={{fontSize:10,color:"#7D8A9A"}}>{cat?.label}</span><span style={{fontSize:10,color:"#7D8A9A"}}>·</span><span style={{fontSize:10,color:"#7D8A9A"}}>{tx(s.src,lang)}</span><span style={{fontSize:10,color:"#7D8A9A"}}>·</span><span style={{fontSize:10,color:"#7D8A9A"}}>{fD(s.at,lang)}</span></div>
          </div>
        )})}
        <div style={{textAlign:"center",marginTop:40,color:"#A8B1BD",fontSize:11}}>&copy; 2026 AIG — Lines Intelligence</div>
      </div>
    </div>)})()}
    {toast&&<div className="toast">{toast}</div>}
  </div>);
}

export default function AegisRadar(){return (<><style>{css}</style><div className="app"><LangProvider><App/></LangProvider></div></>)}
