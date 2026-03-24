"use client";

import { useState, useEffect, useRef } from "react";

const PLATFORMS = ["Instagram", "TikTok", "LinkedIn", "Blog", "Twitter"];

const ACCENT_SETS = [
  { bg: "#FFF4F2", border: "#D4857A", tag: "#D4857A", tagBg: "#FFE9E5" },
  { bg: "#F8F1FB", border: "#9B72AA", tag: "#9B72AA", tagBg: "#F0E4F6" },
  { bg: "#F1F7F3", border: "#6B937A", tag: "#6B937A", tagBg: "#E1EDE5" },
];

/* ── Settings Modal ── */
function SettingsModal({ brand, audience, tone, competitors, onSave, onClose }) {
  const [db, setDb] = useState(brand); const [da, setDa] = useState(audience); const [dt, setDt] = useState(tone);
  const [dc, setDc] = useState(() => { const a = [...competitors]; while (a.length < 3) a.push(""); return a; });
  const uc = (i, v) => { const n = [...dc]; n[i] = v; setDc(n); };
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}><h2 style={styles.modalTitle}>Settings</h2><button style={styles.closeBtn} onClick={onClose}>✕</button></div>
        <div style={styles.settingsSection}><label style={styles.settingsLabel}>Brand</label><p style={styles.settingsHint}>Brand name or URL. Bento researches your visual identity.</p><input style={styles.textInput} value={db} onChange={e => setDb(e.target.value)} placeholder="https://www.forhers.com/" /></div>
        <div style={styles.settingsSection}><label style={styles.settingsLabel}>Target Audience</label><textarea style={styles.brandTextarea} value={da} onChange={e => setDa(e.target.value)} placeholder="Women 25–44 seeking convenient, discreet, and affordable telehealth services for mental health, dermatology, sexual health, and weight loss" rows={2} /></div>
        <div style={styles.settingsSection}><label style={styles.settingsLabel}>Tone of Voice</label><input style={styles.textInput} value={dt} onChange={e => setDt(e.target.value)} placeholder="Empowering, modern, direct, approachable — not clinical or salesy" /></div>
        <div style={styles.settingsSection}><label style={styles.settingsLabel}>Competitors <span style={styles.optionalTag}>optional — up to 3</span></label>{dc.map((c, i) => <input key={i} style={{ ...styles.textInput, marginBottom: 8 }} value={c} onChange={e => uc(i, e.target.value)} placeholder={`Competitor ${i + 1}`} />)}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.primaryBtn, opacity: db.trim() && da.trim() && dt.trim() ? 1 : 0.4 }} onClick={() => { if (db.trim() && da.trim() && dt.trim()) { onSave(db.trim(), da.trim(), dt.trim(), dc.filter(c => c.trim())); onClose(); } }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ── Onboarding ── */
function Onboarding({ onComplete }) {
  const [b, setB] = useState(""); const [a, setA] = useState(""); const [t, setT] = useState("");
  const [c, setC] = useState(["", "", ""]);
  const uc = (i, v) => { const n = [...c]; n[i] = v; setC(n); };
  return (
    <div style={styles.onboarding}>
      <div style={styles.onboardingCard}>
        <div style={styles.onboardingBento}><div style={styles.obCell1}/><div style={styles.obCell2}/><div style={styles.obCell3}/><div style={styles.obCell4}/></div>
        <h1 style={styles.obTitle}>Bento</h1><p style={styles.obSub}>Content ideas, neatly packed.</p>
        <div style={styles.obSection}><label style={styles.obLabel}>Brand</label><p style={styles.obHint}>Brand name or website URL. Bento researches your branding and visual identity.</p><input style={styles.textInput} value={b} onChange={e => setB(e.target.value)} placeholder="https://www.forhers.com/" /></div>
        <div style={styles.obSection}><label style={styles.obLabel}>Target Audience</label><textarea style={styles.brandTextarea} value={a} onChange={e => setA(e.target.value)} placeholder="Women 25–44 seeking convenient, discreet, and affordable telehealth services for mental health, dermatology, sexual health, and weight loss" rows={2} /></div>
        <div style={styles.obSection}><label style={styles.obLabel}>Tone of Voice</label><input style={styles.textInput} value={t} onChange={e => setT(e.target.value)} placeholder="Empowering, modern, direct, approachable — not clinical or salesy" /></div>
        <div style={styles.obSection}><label style={styles.obLabel}>Competitors <span style={styles.optionalTag}>optional — up to 3</span></label><p style={styles.obHint}>Bento will study their content to help you differentiate.</p>{c.map((v, i) => <input key={i} style={{ ...styles.textInput, marginBottom: 8 }} value={v} onChange={e => uc(i, e.target.value)} placeholder={`Competitor ${i + 1}`} />)}</div>
        <button style={{ ...styles.primaryBtn, marginTop: 16, width: "100%", opacity: b.trim() && a.trim() && t.trim() ? 1 : 0.4 }} onClick={() => { if (b.trim() && a.trim() && t.trim()) onComplete(b.trim(), a.trim(), t.trim(), c.filter(v => v.trim())); }}>Get started →</button>
      </div>
    </div>
  );
}

/* ── Display Components ── */
function ResearchPoint({ text }) {
  return (<span>{text.split(/(<key>.*?<\/key>)/g).map((p, i) => p.startsWith("<key>") ? <span key={i} style={styles.keyHighlight}>{p.replace(/<\/?key>/g, "")}</span> : <span key={i}>{p}</span>)}</span>);
}
function SourceLink({ source }) {
  const m = source.match(/(https?:\/\/[^\s)]+)/);
  if (m) { const u = m[1]; const l = source.replace(u, "").replace(/[—\-–]\s*$/, "").replace(/\s*[—\-–]\s*/, "").trim(); const s = u.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/"); return (<span style={styles.sourceText}>{l && <>{l} — </>}<a href={u} target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>{s}</a></span>); }
  return <span style={styles.sourceText}>{source}</span>;
}
function BriefContent({ content }) {
  const lines = content.split(/\n|(?=(?:Headline|Body|Visual|Caption|Voiceover|On-screen text|Audio|Text|Hook|CTA|Format|Timing|Scene|H2|Key points|Takeaway):)/gi);
  const parsed = []; let cur = null;
  for (const l of lines) { const m = l.match(/^(Headline|Body|Visual|Caption|Voiceover|On-screen text|Audio|Text|Hook|CTA|Format|Timing|Scene|H2|Key points|Takeaway)\s*:\s*(.*)/i); if (m) { if (cur) parsed.push(cur); cur = { label: m[1], text: m[2].trim() }; } else if (l.trim()) { if (cur) cur.text += " " + l.trim(); else parsed.push({ label: null, text: l.trim() }); } }
  if (cur) parsed.push(cur);
  if (parsed.some(p => p.label)) return (<div style={styles.briefStructured}>{parsed.map((p, i) => <div key={i} style={styles.briefLine}>{p.label && <span style={styles.briefLabel}>{p.label}:</span>}<span style={styles.briefValue}>{p.text}</span></div>)}</div>);
  return <p style={styles.stepContent}>{content}</p>;
}
function BulletedText({ text }) {
  if (!text) return null;
  const bullets = text.split("•").map(s => s.trim()).filter(Boolean);
  if (bullets.length <= 1) return <p style={styles.vdText}>{text}</p>;
  return (<div style={styles.bulletList}>{bullets.map((b, i) => <div key={i} style={styles.bulletItem}><span style={styles.bulletDot}/><span style={styles.bulletText}>{b}</span></div>)}</div>);
}
function VisualDirection({ vd }) {
  if (!vd) return null;
  const refs = vd.references || vd.reference_accounts || [];
  const hasUrls = refs.some(r => r.handle && r.handle.match(/https?:\/\//));
  const refTitle = hasUrls ? "Reference articles" : "Study these accounts";

  return (
    <div style={styles.vdSection}>
      <div style={styles.compartmentLabel}><span>🎨</span> Visual Direction</div>
      <div style={styles.vdGrid}>
        <div style={styles.vdCard}><div style={styles.vdCardLabel}>Mood</div><p style={styles.vdMood}>{vd.mood}</p></div>
        <div style={styles.vdCard}><div style={styles.vdCardLabel}>Layout</div><BulletedText text={vd.layout} /></div>
        <div style={styles.vdCard}><div style={styles.vdCardLabel}>Imagery & Icons</div><BulletedText text={vd.imagery_and_icons} /></div>
        {refs.length > 0 && <div style={styles.vdCard}><div style={styles.vdCardLabel}>{refTitle}</div><div style={styles.refList}>{refs.map((r, i) => {
          const urlMatch = r.handle && r.handle.match(/(https?:\/\/[^\s]+)/);
          if (urlMatch) {
            const url = urlMatch[1];
            const label = r.handle.replace(url, "").replace(/[—\-–]\s*$/, "").replace(/\s*[—\-–]\s*/, "").trim();
            const shortUrl = url.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/");
            return (<div key={i} style={styles.refItem}>
              <a href={url} target="_blank" rel="noopener noreferrer" style={styles.refLink}>{label || shortUrl}</a>
              <span style={styles.refNote}>{r.note}</span>
            </div>);
          }
          return (<div key={i} style={styles.refItem}><span style={styles.refHandle}>{r.handle}</span><span style={styles.refNote}>{r.note}</span></div>);
        })}</div></div>}
      </div>
    </div>
  );
}
function MoodBoard({ tabId, ideaIndex, moodBoards, setMoodBoards }) {
  const [inputUrl, setInputUrl] = useState(""); const [inputNote, setInputNote] = useState("");
  const key = `${tabId}-${ideaIndex}`;
  const boards = moodBoards[key] || [];
  const addItem = () => { if (!inputUrl.trim()) return; const n = { ...moodBoards }; if (!n[key]) n[key] = []; n[key] = [...n[key], { url: inputUrl.trim(), note: inputNote.trim() }]; setMoodBoards(n); setInputUrl(""); setInputNote(""); };
  const removeItem = (idx) => { const n = { ...moodBoards }; n[key] = n[key].filter((_, i) => i !== idx); setMoodBoards(n); };
  const getDomain = (u) => { try { return u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]; } catch { return "link"; } };
  return (
    <div style={styles.moodSection}>
      <div style={styles.compartmentLabel}><span>📌</span> My Mood Board</div>
      {boards.length > 0 && <div style={styles.moodGrid}>{boards.map((item, i) => <div key={i} style={styles.moodItem}><div style={styles.moodItemTop}><a href={item.url} target="_blank" rel="noopener noreferrer" style={styles.moodLink}>{getDomain(item.url)} ↗</a><button style={styles.moodRemove} onClick={() => removeItem(i)}>✕</button></div>{item.note && <span style={styles.moodNote}>{item.note}</span>}</div>)}</div>}
      <div style={styles.moodInput}>
        <input style={{ ...styles.textInput, flex: 2 }} value={inputUrl} onChange={e => setInputUrl(e.target.value)} placeholder="Paste a link..." onKeyDown={e => { if (e.key === "Enter") addItem(); }} />
        <input style={{ ...styles.textInput, flex: 1.5 }} value={inputNote} onChange={e => setInputNote(e.target.value)} placeholder="Note (optional)" onKeyDown={e => { if (e.key === "Enter") addItem(); }} />
        <button style={styles.moodAddBtn} onClick={addItem}>+ Add</button>
      </div>
    </div>
  );
}

function IdeaCard({ idea, index, tabId, moodBoards, setMoodBoards }) {
  const colors = ACCENT_SETS[index % 3];
  return (
    <div style={{ ...styles.bentoBox, borderColor: colors.border }}>
      <div style={{ ...styles.bentoTop, background: colors.bg }}><div style={{ ...styles.formatTag, background: colors.tagBg, color: colors.tag }}>{idea.format}</div><h3 style={styles.angleTitle}>{idea.angle}</h3></div>
      <div style={styles.bentoGrid}>
        <div style={styles.bentoLeft}><div style={styles.compartmentLabel}><span>🔬</span> Research</div><div style={styles.researchStack}>{idea.research.map((r, i) => <div key={i} style={styles.researchCard}><p style={styles.researchText}><ResearchPoint text={r.point} /></p><SourceLink source={r.source} /></div>)}</div></div>
        <div style={styles.bentoRight}><div style={styles.compartmentLabel}><span>📋</span> Content Brief</div><div style={styles.briefStack}>{idea.brief.map((b, i) => <div key={i} style={styles.briefStep}><div style={{ ...styles.stepLabel, color: colors.tag, background: colors.tagBg }}>{b.step}</div><BriefContent content={b.content} /></div>)}</div></div>
      </div>
      <VisualDirection vd={idea.visual_direction} />
      <MoodBoard tabId={tabId} ideaIndex={index} moodBoards={moodBoards} setMoodBoards={setMoodBoards} />
      <div style={{ ...styles.bentoBottom, borderTopColor: colors.border }}><span style={styles.whyLabel}>✨ Why this works</span><p style={styles.whyText}>{idea.why}</p></div>
    </div>
  );
}

function LoadingState() {
  const msgs = ["Researching your brand...", "Studying the topic...", "Analyzing competitors...", "Crafting detailed briefs...", "Building visual direction...", "Packing your bento..."];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(n => (n + 1) % msgs.length), 3000); return () => clearInterval(t); }, []);
  return (<div style={styles.loadingWrap}><div style={styles.loaderBox}>{[0,1,2,3].map(i => <div key={i} style={{ ...styles.loaderCell, animationDelay: `${i * 0.15}s` }} />)}</div><p style={styles.loadingMsg}>{msgs[i]}</p></div>);
}

/* ── Tab Content ── */
function TabContent({ tab, brand, audience, tone, competitors, moodBoards, setMoodBoards, updateTab, requestGenerate }) {
  const resultsRef = useRef(null);

  const handleGenerate = () => {
    if (!tab.topic.trim() || !brand.trim()) return;
    requestGenerate(tab.id, tab.topic, tab.platform, resultsRef);
  };

  return (
    <div>
      <div style={styles.inputCard}>
        <div style={styles.inputGrid}>
          <div style={styles.topicCol}><label style={styles.inputLabel}>Topic or keyword</label><input style={styles.textInput} value={tab.topic} onChange={e => updateTab(tab.id, { topic: e.target.value })} placeholder="foods for weight management" onKeyDown={e => { if (e.key === "Enter") handleGenerate(); }} /></div>
          <div style={styles.platformCol}><label style={styles.inputLabel}>Platform</label><select style={styles.selectInput} value={tab.platform} onChange={e => updateTab(tab.id, { platform: e.target.value })}>{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div style={styles.btnCol}><button style={{ ...styles.generateBtn, opacity: tab.topic.trim() && !tab.loading ? 1 : 0.4, cursor: tab.topic.trim() && !tab.loading ? "pointer" : "not-allowed" }} onClick={handleGenerate} disabled={!tab.topic.trim() || tab.loading}>{tab.loading ? "Packing..." : "Pack my bento 🍱"}</button></div>
        </div>
        {competitors.length > 0 && <div style={styles.activeComps}><span style={styles.activeCompsLabel}>Analyzing:</span>{competitors.map((c, i) => <span key={i} style={styles.compChip}>{c}</span>)}</div>}
      </div>

      {tab.queued && (
        <div style={styles.queuedWrap}>
          <p style={styles.queuedText}>⏳ Waiting for other tab to finish generating...</p>
          <p style={styles.queuedSub}>Your request is queued and will start automatically.</p>
        </div>
      )}
      {tab.loading && !tab.queued && <LoadingState />}
      {tab.error && <div style={styles.errorBox}>{tab.error}</div>}

      {tab.ideas && (
        <div ref={resultsRef} style={styles.results}>
          <p style={styles.resultsLabel}><span style={{ fontWeight: 700 }}>3 ideas</span> for <span style={styles.topicHighlight}>"{tab.topic}"</span> on <span style={styles.topicHighlight}>{tab.platform}</span>{competitors.length > 0 && <span style={{ color: "#A39888" }}> · informed by {competitors.join(", ")}</span>}</p>
          {tab.ideas.map((idea, i) => <IdeaCard key={i} idea={idea} index={i} tabId={tab.id} moodBoards={moodBoards} setMoodBoards={setMoodBoards} />)}
        </div>
      )}

      {!tab.loading && !tab.ideas && !tab.error && (
        <div style={styles.empty}><div style={styles.emptyBento}><div style={{ ...styles.emptyCell, opacity: 0.15 }} /><div style={{ ...styles.emptyCell, opacity: 0.1 }} /><div style={{ ...styles.emptyCell, opacity: 0.08 }} /><div style={{ ...styles.emptyCell, opacity: 0.05 }} /></div><p style={styles.emptyText}>Your bento is empty. Enter a topic to start packing.</p></div>
      )}
    </div>
  );
}

/* ── Main ── */
let tabCounter = 1;
function createTab() {
  return { id: `tab-${tabCounter++}`, name: "New", topic: "", platform: "Instagram", ideas: null, loading: false, queued: false, error: null };
}

export default function Bento() {
  const [brand, setBrand] = useState(""); const [audience, setAudience] = useState(""); const [tone, setTone] = useState("");
  const [competitors, setCompetitors] = useState([]); const [showSettings, setShowSettings] = useState(false);
  const [onboarded, setOnboarded] = useState(false); const [moodBoards, setMoodBoards] = useState({});
  const [tabs, setTabs] = useState([createTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const isGeneratingRef = useRef(false);
  const queueRef = useRef([]);

  const updateTab = (id, updates) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const addTab = () => {
    const newTab = createTab();
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };
  const closeTab = (id) => {
    if (tabs.length === 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[Math.max(0, idx - 1)].id);
    }
  };

  // ── Queue system: one generation at a time ──
  const runGenerate = async (tabId, topic, platform, resultsRef) => {
    isGeneratingRef.current = true;
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, loading: true, queued: false, error: null, ideas: null } : t));
    try {
      const response = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, brand, audience, tone, competitors }),
      });
      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ideas: data.ideas, loading: false, name: topic.length > 25 ? topic.substring(0, 25) + "..." : topic } : t));
      setTimeout(() => { resultsRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    } catch (err) {
      console.error(err);
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, error: "Something went wrong. Please try again.", loading: false } : t));
    } finally {
      isGeneratingRef.current = false;
      // Process next in queue
      if (queueRef.current.length > 0) {
        const next = queueRef.current.shift();
        runGenerate(next.tabId, next.topic, next.platform, next.resultsRef);
      }
    }
  };

  const requestGenerate = (tabId, topic, platform, resultsRef) => {
    if (isGeneratingRef.current) {
      // Queue it
      queueRef.current = queueRef.current.filter(q => q.tabId !== tabId); // remove existing queue entry for same tab
      queueRef.current.push({ tabId, topic, platform, resultsRef });
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, queued: true, loading: true, error: null, ideas: null } : t));
    } else {
      runGenerate(tabId, topic, platform, resultsRef);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  if (!onboarded) {
    return (<div style={styles.app}><Onboarding onComplete={(b, a, t, c) => { setBrand(b); setAudience(a); setTone(t); setCompetitors(c); setOnboarded(true); }} /></div>);
  }

  return (
    <div style={styles.app}>
      {showSettings && <SettingsModal brand={brand} audience={audience} tone={tone} competitors={competitors} onSave={(b, a, t, c) => { setBrand(b); setAudience(a); setTone(t); setCompetitors(c); }} onClose={() => setShowSettings(false)} />}
      <header style={styles.header}>
        <div style={styles.headerLeft}><div style={styles.headerBento}><div style={{ ...styles.hbCell, background: "#D4857A" }} /><div style={{ ...styles.hbCell, background: "#9B72AA" }} /><div style={{ ...styles.hbCell, background: "#6B937A" }} /><div style={{ ...styles.hbCell, background: "#E8C869" }} /></div><span style={styles.headerName}>Bento</span></div>
        <button style={styles.settingsBtn} onClick={() => setShowSettings(true)}>Settings ⚙</button>
      </header>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        <div style={styles.tabList}>
          {tabs.map(tab => (
            <div key={tab.id} style={{ ...styles.tab, ...(tab.id === activeTabId ? styles.tabActive : {}) }} onClick={() => setActiveTabId(tab.id)}>
              <span style={styles.tabName}>
                {tab.loading && !tab.queued && <span style={styles.tabSpinner}>⟳</span>}
                {tab.queued && <span style={{ fontSize: 12 }}>⏳</span>}
                {tab.name}
              </span>
              {tabs.length > 1 && (
                <button style={styles.tabClose} onClick={e => { e.stopPropagation(); closeTab(tab.id); }}>✕</button>
              )}
            </div>
          ))}
          <button style={styles.tabAdd} onClick={addTab}>+ New</button>
        </div>
      </div>

      <main style={styles.main}>
        <TabContent
          key={activeTab.id}
          tab={activeTab}
          brand={brand}
          audience={audience}
          tone={tone}
          competitors={competitors}
          moodBoards={moodBoards}
          setMoodBoards={setMoodBoards}
          updateTab={updateTab}
          requestGenerate={requestGenerate}
        />
      </main>
    </div>
  );
}

/* ── Styles ── */
const styles = {
  app: { fontFamily: "'Instrument Sans', 'Helvetica Neue', sans-serif", minHeight: "100vh", background: "#FAF8F5", color: "#1C1917" },
  onboarding: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  onboardingCard: { maxWidth: 560, width: "100%", textAlign: "left", padding: "44px 40px", background: "#FFF", borderRadius: 20, border: "1px solid #E8E2D9", boxShadow: "0 8px 40px rgba(0,0,0,0.04)" },
  onboardingBento: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, width: 48, height: 48, margin: "0 auto 20px", borderRadius: 10, overflow: "hidden" },
  obCell1: { background: "#D4857A", borderRadius: "6px 2px 2px 2px" }, obCell2: { background: "#9B72AA", borderRadius: "2px 6px 2px 2px" },
  obCell3: { background: "#6B937A", borderRadius: "2px 2px 2px 6px" }, obCell4: { background: "#E8C869", borderRadius: "2px 2px 6px 2px" },
  obTitle: { fontSize: 34, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em", textAlign: "center" },
  obSub: { fontSize: 15, color: "#A39888", margin: "0 0 28px", fontStyle: "italic", textAlign: "center" },
  obSection: { marginBottom: 20 }, obLabel: { display: "block", fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 6 },
  obHint: { fontSize: 12, color: "#A39888", marginBottom: 10, lineHeight: 1.4 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 32px", borderBottom: "1px solid #E8E2D9", background: "#FFFEFB", position: "sticky", top: 0, zIndex: 20 },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerBento: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 22, height: 22, borderRadius: 4, overflow: "hidden" },
  hbCell: { borderRadius: 2 }, headerName: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" },
  settingsBtn: { background: "none", border: "1px solid #DDD5CA", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#78716C", cursor: "pointer", fontFamily: "inherit" },

  // Tab Bar
  tabBar: { borderBottom: "1px solid #E8E2D9", background: "#FFFEFB", padding: "0 32px", position: "sticky", top: 53, zIndex: 19 },
  tabList: { display: "flex", alignItems: "center", gap: 2, overflowX: "auto" },
  tab: { display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "#A39888", cursor: "pointer", borderBottom: "2px solid transparent", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" },
  tabActive: { color: "#1C1917", fontWeight: 700, borderBottomColor: "#C07A8E" },
  tabName: { display: "flex", alignItems: "center", gap: 4 },
  tabSpinner: { display: "inline-block", animation: "spin 1s linear infinite", fontSize: 12 },
  tabClose: { background: "none", border: "none", color: "#C4B9A8", fontSize: 11, cursor: "pointer", padding: "0 2px", lineHeight: 1 },
  tabAdd: { background: "none", border: "none", color: "#C07A8E", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontFamily: "inherit", whiteSpace: "nowrap" },

  main: { maxWidth: 1200, margin: "0 auto", padding: "28px 32px 60px" },
  inputCard: { background: "#FFFEFB", border: "1px solid #E8E2D9", borderRadius: 16, padding: "22px 24px", marginBottom: 32 },
  inputGrid: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" },
  topicCol: { flex: 2.5, minWidth: 200 }, platformCol: { flex: 0.8, minWidth: 130 }, btnCol: { flex: 1, minWidth: 150 },
  inputLabel: { display: "block", fontSize: 11, fontWeight: 700, color: "#A39888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  optionalTag: { fontSize: 9, fontWeight: 500, color: "#C4B9A8", textTransform: "lowercase", letterSpacing: "0.02em", fontStyle: "italic" },
  textInput: { width: "100%", padding: "11px 14px", fontSize: 14, border: "1.5px solid #DDD5CA", borderRadius: 10, fontFamily: "inherit", color: "#1C1917", background: "#FAF8F5", boxSizing: "border-box" },
  selectInput: { width: "100%", padding: "11px 14px", fontSize: 14, border: "1.5px solid #DDD5CA", borderRadius: 10, fontFamily: "inherit", color: "#1C1917", background: "#FAF8F5", boxSizing: "border-box", appearance: "none", cursor: "pointer" },
  generateBtn: { width: "100%", padding: "11px 20px", fontSize: 14, fontWeight: 700, color: "#FFF", background: "#C07A8E", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", boxSizing: "border-box" },
  activeComps: { display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" },
  activeCompsLabel: { fontSize: 11, fontWeight: 600, color: "#A39888", textTransform: "uppercase", letterSpacing: "0.06em" },
  compChip: { fontSize: 12, fontWeight: 600, color: "#9B72AA", background: "#F0E4F6", padding: "4px 10px", borderRadius: 6 },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px" },
  loaderBox: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, width: 44, height: 44, marginBottom: 20 },
  loaderCell: { background: "#C07A8E", borderRadius: 4, animation: "bentoPulse 1s ease-in-out infinite", opacity: 0.25 },
  loadingMsg: { fontSize: 14, color: "#A39888", fontStyle: "italic" },
  queuedWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px", gap: 8 },
  queuedText: { fontSize: 15, color: "#A39888", fontWeight: 600 },
  queuedSub: { fontSize: 13, color: "#C4B9A8" },
  errorBox: { background: "#FFF5F3", border: "1px solid #FECDCA", borderRadius: 12, padding: "14px 20px", textAlign: "center", color: "#B42318", fontSize: 13 },
  results: { marginTop: 4 }, resultsLabel: { fontSize: 15, color: "#78716C", marginBottom: 24 },
  topicHighlight: { color: "#C07A8E", fontWeight: 700 },
  bentoBox: { border: "1.5px solid #E8E2D9", borderRadius: 18, overflow: "hidden", marginBottom: 28, background: "#FFF", boxShadow: "0 2px 16px rgba(0,0,0,0.03)" },
  bentoTop: { padding: "22px 28px 18px", borderBottom: "1px solid #E8E2D9" },
  formatTag: { display: "inline-block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 10px", borderRadius: 6, marginBottom: 10 },
  angleTitle: { fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.35, letterSpacing: "-0.02em", color: "#1C1917" },
  bentoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 100 },
  bentoLeft: { padding: "22px 24px", borderRight: "1px solid #E8E2D9" }, bentoRight: { padding: "22px 24px" },
  compartmentLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A39888", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 },
  researchStack: { display: "flex", flexDirection: "column", gap: 10 },
  researchCard: { background: "#FAF8F5", borderRadius: 10, padding: "14px 16px", border: "1px solid #EDE8DF" },
  researchText: { fontSize: 13, lineHeight: 1.65, color: "#44403C", margin: "0 0 6px" },
  keyHighlight: { background: "linear-gradient(120deg, #FEF3C7 0%, #FDE68A 100%)", padding: "1px 4px", borderRadius: 3, fontWeight: 600, color: "#92400E" },
  sourceText: { fontSize: 11, color: "#A39888", fontStyle: "italic", lineHeight: 1.4, display: "block" },
  sourceLink: { color: "#C07A8E", textDecoration: "none", fontStyle: "normal", fontWeight: 600 },
  briefStack: { display: "flex", flexDirection: "column", gap: 14 }, briefStep: { padding: 0 },
  stepLabel: { display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5, marginBottom: 8 },
  stepContent: { fontSize: 13, lineHeight: 1.6, color: "#44403C", margin: 0 },
  briefStructured: { display: "flex", flexDirection: "column", gap: 4 },
  briefLine: { fontSize: 13, lineHeight: 1.55, color: "#44403C" },
  briefLabel: { fontWeight: 700, color: "#1C1917", marginRight: 4, fontSize: 12 },
  briefValue: { color: "#44403C" },
  vdSection: { padding: "22px 24px", borderTop: "1px solid #E8E2D9", background: "#FEFCFA" },
  vdGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  vdCard: { background: "#FAF8F5", borderRadius: 10, padding: "16px 18px", border: "1px solid #EDE8DF" },
  vdCardLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#A39888", marginBottom: 10 },
  vdText: { fontSize: 13, lineHeight: 1.55, color: "#44403C", margin: 0 },
  vdMood: { fontSize: 16, fontWeight: 700, color: "#1C1917", margin: 0 },
  refList: { display: "flex", flexDirection: "column", gap: 10 },
  refItem: { display: "flex", flexDirection: "column", gap: 2 },
  refHandle: { fontSize: 13, fontWeight: 700, color: "#1C1917" },
  refLink: { fontSize: 13, fontWeight: 700, color: "#C07A8E", textDecoration: "none" },
  refNote: { fontSize: 12, color: "#78716C", fontStyle: "italic", lineHeight: 1.4 },
  bulletList: { display: "flex", flexDirection: "column", gap: 6 },
  bulletItem: { display: "flex", alignItems: "flex-start", gap: 8 },
  bulletDot: { width: 5, height: 5, borderRadius: "50%", background: "#C07A8E", flexShrink: 0, marginTop: 7 },
  bulletText: { fontSize: 13, lineHeight: 1.55, color: "#44403C" },
  moodSection: { padding: "22px 24px", borderTop: "1px solid #E8E2D9", background: "#FDFCFA" },
  moodGrid: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
  moodItem: { background: "#FAF8F5", borderRadius: 8, padding: "10px 14px", border: "1px solid #EDE8DF" },
  moodItemTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  moodLink: { fontSize: 13, color: "#C07A8E", fontWeight: 600, textDecoration: "none" },
  moodRemove: { background: "none", border: "none", color: "#C4B9A8", fontSize: 12, cursor: "pointer", padding: 2 },
  moodNote: { fontSize: 12, color: "#78716C", fontStyle: "italic", display: "block", marginTop: 4 },
  moodInput: { display: "flex", gap: 8, alignItems: "center" },
  moodAddBtn: { padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "#78716C", background: "#FAF8F5", border: "1.5px solid #DDD5CA", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  bentoBottom: { padding: "18px 28px", borderTop: "1px solid #E8E2D9", background: "#FDFCFA" },
  whyLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A39888", display: "block", marginBottom: 6 },
  whyText: { fontSize: 13, lineHeight: 1.6, color: "#57534E", margin: 0 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 20px" },
  emptyBento: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, width: 64, height: 64, marginBottom: 20 },
  emptyCell: { background: "#1C1917", borderRadius: 6 }, emptyText: { fontSize: 14, color: "#A39888" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(28,25,23,0.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 },
  modal: { background: "#FFF", borderRadius: 18, padding: "32px 30px", maxWidth: 560, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.12)", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" },
  closeBtn: { background: "none", border: "none", fontSize: 16, color: "#A39888", cursor: "pointer" },
  settingsSection: { marginBottom: 18 }, settingsLabel: { display: "block", fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 4 },
  settingsHint: { fontSize: 12, color: "#A39888", marginBottom: 8, lineHeight: 1.4 },
  brandTextarea: { width: "100%", padding: "13px 14px", fontSize: 13, border: "1.5px solid #DDD5CA", borderRadius: 10, fontFamily: "inherit", color: "#1C1917", background: "#FAF8F5", boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 },
  primaryBtn: { flex: 1, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: "#FFF", background: "#C07A8E", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit" },
  secondaryBtn: { flex: 1, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "#78716C", background: "#FAF8F5", border: "1.5px solid #DDD5CA", borderRadius: 10, cursor: "pointer", fontFamily: "inherit" },
};

// Styles injected via globals.css
