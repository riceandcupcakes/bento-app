"use client";

import { useState, useEffect, useRef } from "react";

const PLATFORMS = ["Instagram", "TikTok", "LinkedIn", "Blog", "Twitter"];
const ACCENT_SETS = [
  { bg: "#FFF4F2", border: "#D4857A", tag: "#D4857A", tagBg: "#FFE9E5" },
  { bg: "#F8F1FB", border: "#9B72AA", tag: "#9B72AA", tagBg: "#F0E4F6" },
  { bg: "#F1F7F3", border: "#6B937A", tag: "#6B937A", tagBg: "#E1EDE5" },
];

/* ══════════════════════════════════════════
   Storage
   ══════════════════════════════════════════ */
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
function load(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }

/* ══════════════════════════════════════════
   Display Components
   ══════════════════════════════════════════ */
function ResearchPoint({ text }) {
  return <span>{(text || "").split(/(<key>.*?<\/key>)/g).map((p, i) => p.startsWith("<key>") ? <span key={i} style={S.keyHighlight}>{p.replace(/<\/?key>/g, "")}</span> : <span key={i}>{p}</span>)}</span>;
}

function SourceLink({ source }) {
  const m = (source || "").match(/(https?:\/\/[^\s)]+)/);
  if (m) { const u = m[1], l = source.replace(u, "").replace(/[—\-–]\s*$/, "").replace(/\s*[—\-–]\s*/, "").trim(), s = u.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/"); return <span style={S.sourceText}>{l && <>{l} — </>}<a href={u} target="_blank" rel="noopener noreferrer" style={S.sourceLink}>{s}</a></span>; }
  return <span style={S.sourceText}>{source}</span>;
}

function BriefContent({ content }) {
  const lines = (content || "").split(/\n|(?=(?:Headline|Body|Visual|Caption|Voiceover|On-screen text|Audio|Text|Hook|CTA|Format|Timing|Scene|H2|Key points|Takeaway):)/gi);
  const parsed = []; let cur = null;
  for (const l of lines) { const m = l.match(/^(Headline|Body|Visual|Caption|Voiceover|On-screen text|Audio|Text|Hook|CTA|Format|Timing|Scene|H2|Key points|Takeaway)\s*:\s*(.*)/i); if (m) { if (cur) parsed.push(cur); cur = { label: m[1], text: m[2].trim() }; } else if (l.trim()) { if (cur) cur.text += " " + l.trim(); else parsed.push({ label: null, text: l.trim() }); } }
  if (cur) parsed.push(cur);
  if (parsed.some(p => p.label)) return <div style={S.briefStructured}>{parsed.map((p, i) => <div key={i} style={S.briefLine}>{p.label && <span style={S.briefLabel}>{p.label}:</span>}<span style={S.briefValue}>{p.text}</span></div>)}</div>;
  return <p style={S.stepContent}>{content}</p>;
}

function BulletedText({ text }) {
  if (!text) return null;
  const bullets = text.split("•").map(s => s.trim()).filter(Boolean);
  if (bullets.length <= 1) return <p style={S.vdText}>{text}</p>;
  return <div style={S.bulletList}>{bullets.map((b, i) => <div key={i} style={S.bulletItem}><span style={S.bulletDot}/><span style={S.bulletText}>{b}</span></div>)}</div>;
}

function VisualDirection({ vd }) {
  if (!vd) return null;
  const refs = vd.references || vd.reference_accounts || [];
  const hasUrls = refs.some(r => r.handle && r.handle.match(/https?:\/\//));
  return (
    <div style={S.vdSection}>
      <div style={S.compartmentLabel}><span>🎨</span> Visual Direction</div>
      <div style={S.vdGrid}>
        <div style={S.vdCard}><div style={S.vdCardLabel}>Mood</div><p style={S.vdMood}>{vd.mood}</p></div>
        <div style={S.vdCard}><div style={S.vdCardLabel}>Layout</div><BulletedText text={vd.layout} /></div>
        <div style={S.vdCard}><div style={S.vdCardLabel}>Creative Concept</div><BulletedText text={vd.creative_concept || vd.imagery_and_icons} /></div>
        {refs.length > 0 && <div style={S.vdCard}><div style={S.vdCardLabel}>{hasUrls ? "Reference articles" : "Study these accounts"}</div><div style={S.refList}>{refs.map((r, i) => {
          const um = r.handle && r.handle.match(/(https?:\/\/[^\s]+)/);
          if (um) { const url = um[1], label = r.handle.replace(url, "").replace(/[—\-–]\s*$/, "").replace(/\s*[—\-–]\s*/, "").trim(), short = url.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/"); return <div key={i} style={S.refItem}><a href={url} target="_blank" rel="noopener noreferrer" style={S.refLink}>{label || short}</a><span style={S.refNote}>{r.note}</span></div>; }
          return <div key={i} style={S.refItem}><span style={S.refHandle}>{r.handle}</span><span style={S.refNote}>{r.note}</span></div>;
        })}</div></div>}
      </div>
    </div>
  );
}

function MoodBoard({ boardKey, moodBoards, setMoodBoards }) {
  const [url, setUrl] = useState(""); const [note, setNote] = useState("");
  const boards = moodBoards[boardKey] || [];
  const add = () => { if (!url.trim()) return; const n = { ...moodBoards }; if (!n[boardKey]) n[boardKey] = []; n[boardKey] = [...n[boardKey], { url: url.trim(), note: note.trim() }]; setMoodBoards(n); setUrl(""); setNote(""); };
  const remove = (idx) => { const n = { ...moodBoards }; n[boardKey] = n[boardKey].filter((_, i) => i !== idx); setMoodBoards(n); };
  const domain = (u) => { try { return u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]; } catch { return "link"; } };
  return (
    <div style={S.moodSection}>
      <div style={S.compartmentLabel}><span>📌</span> My Mood Board</div>
      {boards.length > 0 && <div style={S.moodGrid}>{boards.map((item, i) => <div key={i} style={S.moodItem}><div style={S.moodItemTop}><a href={item.url} target="_blank" rel="noopener noreferrer" style={S.moodLink}>{domain(item.url)} ↗</a><button style={S.moodRemove} onClick={() => remove(i)}>✕</button></div>{item.note && <span style={S.moodNote}>{item.note}</span>}</div>)}</div>}
      <div style={S.moodInput}>
        <input style={{ ...S.textInput, flex: 2 }} value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a link..." onKeyDown={e => { if (e.key === "Enter") add(); }} />
        <input style={{ ...S.textInput, flex: 1.5 }} value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" onKeyDown={e => { if (e.key === "Enter") add(); }} />
        <button style={S.moodAddBtn} onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

function IdeaCard({ idea, index, boardKey, moodBoards, setMoodBoards, onSave, isSaved }) {
  const c = ACCENT_SETS[index % 3];
  return (
    <div style={{ ...S.bentoBox, borderColor: c.border }}>
      <div style={{ ...S.bentoTop, background: c.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ ...S.formatTag, background: c.tagBg, color: c.tag }}>{idea.format}</div><h3 style={S.angleTitle}>{idea.angle}</h3></div>
          {onSave && <button style={isSaved ? S.savedBtnDone : S.saveBtn} onClick={onSave} disabled={isSaved}>{isSaved ? "✓ Saved" : "Save"}</button>}
        </div>
      </div>
      <div style={S.bentoGrid}>
        <div style={S.bentoLeft}><div style={S.compartmentLabel}><span>🔬</span> Research</div><div style={S.researchStack}>{(idea.research || []).map((r, i) => <div key={i} style={S.researchCard}><p style={S.researchText}><ResearchPoint text={r.point} /></p><SourceLink source={r.source} /></div>)}</div></div>
        <div style={S.bentoRight}><div style={S.compartmentLabel}><span>📋</span> Content Brief</div><div style={S.briefStack}>{(idea.brief || []).map((b, i) => <div key={i} style={S.briefStep}><div style={{ ...S.stepLabel, color: c.tag, background: c.tagBg }}>{b.step}</div><BriefContent content={b.content} /></div>)}</div></div>
      </div>
      <VisualDirection vd={idea.visual_direction} />
      <MoodBoard boardKey={boardKey} moodBoards={moodBoards} setMoodBoards={setMoodBoards} />
      <div style={{ ...S.bentoBottom, borderTopColor: c.border }}><span style={S.whyLabel}>✨ Why this works</span><p style={S.whyText}>{idea.why}</p></div>
    </div>
  );
}

function LoadingState() {
  const msgs = ["Researching the topic...", "Crafting your content brief...", "Building visual direction...", "Packing your bento..."];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(n => (n + 1) % msgs.length), 2500); return () => clearInterval(t); }, []);
  return <div style={S.loadingWrap}><div style={S.loaderBox}>{[0,1,2,3].map(i => <div key={i} style={{ ...S.loaderCell, animationDelay: `${i * 0.15}s` }} />)}</div><p style={S.loadingMsg}>{msgs[i]}</p></div>;
}

function UsageCounter({ usage }) {
  if (!usage) return null;
  return <div style={S.usageBar}><span style={S.usageItem}>Tokens: {(usage.input_tokens + usage.output_tokens).toLocaleString()}</span><span style={S.usageDot}>·</span><span style={S.usageItem}>Cost: ${usage.cost}</span></div>;
}

/* ══════════════════════════════════════════
   Modals
   ══════════════════════════════════════════ */
function SettingsModal({ project, onSave, onClose }) {
  const [db, setDb] = useState(project.brand); const [da, setDa] = useState(project.audience); const [dt, setDt] = useState(project.tone);
  const [ds, setDs] = useState(project.brandStyle || ""); const [dn, setDn] = useState(project.name);
  const [dc, setDc] = useState(() => { const a = [...(project.competitors || [])]; while (a.length < 3) a.push(""); return a; });
  const uc = (i, v) => { const n = [...dc]; n[i] = v; setDc(n); };
  return (
    <div style={S.modalOverlay} onClick={onClose}><div style={S.modal} onClick={e => e.stopPropagation()}>
      <div style={S.modalHeader}><h2 style={S.modalTitle}>Project Settings</h2><button style={S.closeBtn} onClick={onClose}>✕</button></div>
      <div style={S.settingsSection}><label style={S.settingsLabel}>Project Name</label><input style={S.textInput} value={dn} onChange={e => setDn(e.target.value)} placeholder="e.g., hers, Brand Y" /></div>
      <div style={S.settingsSection}><label style={S.settingsLabel}>Brand</label><p style={S.settingsHint}>Brand name or URL.</p><input style={S.textInput} value={db} onChange={e => setDb(e.target.value)} placeholder="https://www.forhers.com/" /></div>
      <div style={S.settingsSection}><label style={S.settingsLabel}>Target Audience</label><textarea style={S.brandTextarea} value={da} onChange={e => setDa(e.target.value)} placeholder="Women 25–44 seeking convenient, discreet, and affordable telehealth services for mental health, dermatology, sexual health, and weight loss" rows={2} /></div>
      <div style={S.settingsSection}><label style={S.settingsLabel}>Tone of Voice</label><input style={S.textInput} value={dt} onChange={e => setDt(e.target.value)} placeholder="Empowering, modern, direct, approachable — not clinical or salesy" /></div>
      <div style={S.settingsSection}><label style={S.settingsLabel}>Brand Visual Style</label><p style={S.settingsHint}>Describe your brand's visual identity.</p><textarea style={S.brandTextarea} value={ds} onChange={e => setDs(e.target.value)} placeholder='e.g., "Minimal, modern, muted earth tones..."' rows={2} /></div>
      <div style={S.settingsSection}><label style={S.settingsLabel}>Competitors <span style={S.optionalTag}>optional — up to 3</span></label>{dc.map((c, i) => <input key={i} style={{ ...S.textInput, marginBottom: 8 }} value={c} onChange={e => uc(i, e.target.value)} placeholder={`Competitor ${i + 1}`} />)}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button style={S.secondaryBtn} onClick={onClose}>Cancel</button>
        <button style={{ ...S.primaryBtn, opacity: db.trim() && da.trim() && dt.trim() && dn.trim() ? 1 : 0.4 }} onClick={() => { if (db.trim() && da.trim() && dt.trim() && dn.trim()) { onSave({ ...project, name: dn.trim(), brand: db.trim(), audience: da.trim(), tone: dt.trim(), brandStyle: ds.trim(), competitors: dc.filter(c => c.trim()) }); onClose(); } }}>Save</button>
      </div>
    </div></div>
  );
}

function SaveToFolderModal({ folders, onSave, onClose }) {
  const [sel, setSel] = useState(folders[0]?.id || ""); const [newName, setNewName] = useState(""); const [showNew, setShowNew] = useState(false);
  return (
    <div style={S.modalOverlay} onClick={onClose}><div style={{ ...S.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
      <div style={S.modalHeader}><h2 style={S.modalTitle}>Save to folder</h2><button style={S.closeBtn} onClick={onClose}>✕</button></div>
      {folders.length > 0 && !showNew && <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>{folders.map(f => <div key={f.id} style={{ ...S.folderOption, ...(sel === f.id ? S.folderOptionActive : {}) }} onClick={() => setSel(f.id)}><span>📁 {f.name}</span><span style={S.folderCount}>{f.count || 0}</span></div>)}</div>}
      {showNew ? <div style={{ marginBottom: 16 }}><input style={S.textInput} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Folder name" autoFocus onKeyDown={e => { if (e.key === "Enter" && newName.trim()) onSave(null, newName.trim()); }} /></div> : <button style={{ ...S.secondaryBtn, width: "100%", marginBottom: 16 }} onClick={() => setShowNew(true)}>+ New folder</button>}
      <div style={{ display: "flex", gap: 10 }}>
        <button style={S.secondaryBtn} onClick={onClose}>Cancel</button>
        <button style={{ ...S.primaryBtn, opacity: (showNew ? newName.trim() : sel) ? 1 : 0.4 }} onClick={() => { if (showNew && newName.trim()) onSave(null, newName.trim()); else if (sel) onSave(sel, null); }}>Save</button>
      </div>
    </div></div>
  );
}

function NewFolderModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  return (
    <div style={S.modalOverlay} onClick={onClose}><div style={{ ...S.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
      <div style={S.modalHeader}><h2 style={S.modalTitle}>New folder</h2><button style={S.closeBtn} onClick={onClose}>✕</button></div>
      <input style={S.textInput} value={name} onChange={e => setName(e.target.value)} placeholder="Folder name" autoFocus onKeyDown={e => { if (e.key === "Enter" && name.trim()) { onSave(name.trim()); onClose(); } }} />
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button style={S.secondaryBtn} onClick={onClose}>Cancel</button>
        <button style={{ ...S.primaryBtn, opacity: name.trim() ? 1 : 0.4 }} onClick={() => { if (name.trim()) { onSave(name.trim()); onClose(); } }}>Create</button>
      </div>
    </div></div>
  );
}

/* ══════════════════════════════════════════
   Project Setup (onboarding for new project)
   ══════════════════════════════════════════ */
function ProjectSetup({ onComplete, isFirst }) {
  const [n, setN] = useState(""); const [b, setB] = useState(""); const [a, setA] = useState(""); const [t, setT] = useState(""); const [s, setS] = useState("");
  const [c, setC] = useState(["", "", ""]);
  const uc = (i, v) => { const arr = [...c]; arr[i] = v; setC(arr); };
  const ok = n.trim() && b.trim() && a.trim() && t.trim();
  return (
    <div style={S.onboarding}><div style={S.onboardingCard}>
      <div style={S.onboardingBento}><div style={S.obCell1}/><div style={S.obCell2}/><div style={S.obCell3}/><div style={S.obCell4}/></div>
      <h1 style={S.obTitle}>{isFirst ? "Bento" : "New Project"}</h1>
      <p style={S.obSub}>{isFirst ? "Content ideas, neatly packed." : "Set up a new brand workspace."}</p>
      <div style={S.obSection}><label style={S.obLabel}>Project Name</label><input style={S.textInput} value={n} onChange={e => setN(e.target.value)} placeholder='e.g., "hers" or "Brand Y"' /></div>
      <div style={S.obSection}><label style={S.obLabel}>Brand</label><p style={S.obHint}>Brand name or website URL.</p><input style={S.textInput} value={b} onChange={e => setB(e.target.value)} placeholder="https://www.forhers.com/" /></div>
      <div style={S.obSection}><label style={S.obLabel}>Target Audience</label><textarea style={S.brandTextarea} value={a} onChange={e => setA(e.target.value)} placeholder="Women 25–44 seeking convenient, discreet, and affordable telehealth services for mental health, dermatology, sexual health, and weight loss" rows={2} /></div>
      <div style={S.obSection}><label style={S.obLabel}>Tone of Voice</label><input style={S.textInput} value={t} onChange={e => setT(e.target.value)} placeholder="Empowering, modern, direct, approachable — not clinical or salesy" /></div>
      <div style={S.obSection}><label style={S.obLabel}>Brand Visual Style <span style={S.optionalTag}>optional</span></label><textarea style={S.brandTextarea} value={s} onChange={e => setS(e.target.value)} placeholder='e.g., "Minimal, modern, muted earth tones..."' rows={2} /></div>
      <div style={S.obSection}><label style={S.obLabel}>Competitors <span style={S.optionalTag}>optional — up to 3</span></label>{c.map((v, i) => <input key={i} style={{ ...S.textInput, marginBottom: 8 }} value={v} onChange={e => uc(i, e.target.value)} placeholder={`Competitor ${i + 1}`} />)}</div>
      <button style={{ ...S.primaryBtn, marginTop: 16, width: "100%", opacity: ok ? 1 : 0.4 }} onClick={() => { if (ok) onComplete({ name: n.trim(), brand: b.trim(), audience: a.trim(), tone: t.trim(), brandStyle: s.trim(), competitors: c.filter(v => v.trim()) }); }}>{isFirst ? "Get started →" : "Create project →"}</button>
    </div></div>
  );
}

/* ══════════════════════════════════════════
   Saved View
   ══════════════════════════════════════════ */
function SavedView({ savedIdeas, folders, moodBoards, setMoodBoards, onDeleteIdea, onDeleteFolder, onMoveIdea, onCreateFolder }) {
  const [activeFolder, setActiveFolder] = useState("all");
  const filtered = activeFolder === "all" ? savedIdeas : savedIdeas.filter(s => s.folderId === activeFolder);
  const [expandedId, setExpandedId] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  return (
    <>
      {showNewFolder && <NewFolderModal onSave={(name) => { onCreateFolder(name); setShowNewFolder(false); }} onClose={() => setShowNewFolder(false)} />}
      <div style={S.savedLayout}>
        <div style={S.savedSidebar}>
          <div style={{ ...S.folderItem, ...(activeFolder === "all" ? S.folderItemActive : {}) }} onClick={() => setActiveFolder("all")}>
            <span>📋 All Saved</span><span style={S.folderCount}>{savedIdeas.length}</span>
          </div>
          {folders.map(f => (
            <div key={f.id} style={{ ...S.folderItem, ...(activeFolder === f.id ? S.folderItemActive : {}) }} onClick={() => setActiveFolder(f.id)}>
              <span>📁 {f.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={S.folderCount}>{savedIdeas.filter(s => s.folderId === f.id).length}</span>
                <button style={S.folderDeleteBtn} onClick={e => { e.stopPropagation(); if (window.confirm(`Delete folder "${f.name}" and all ideas in it?`)) onDeleteFolder(f.id); }}>✕</button>
              </div>
            </div>
          ))}
          <button style={S.newFolderBtn} onClick={() => setShowNewFolder(true)}>+ New folder</button>
        </div>
        <div style={S.savedContent}>
          {filtered.length === 0 && <div style={S.empty}><p style={S.emptyText}>{activeFolder === "all" ? "No saved ideas yet. Generate an idea and save it!" : "This folder is empty."}</p></div>}
          {filtered.map(saved => (
            <div key={saved.id} style={S.savedCard}>
              <div style={S.savedCardHeader} onClick={() => setExpandedId(expandedId === saved.id ? null : saved.id)}>
                <div>
                  <div style={S.savedMeta}><span style={S.savedPlatform}>{saved.platform}</span><span style={S.savedTopic}>{saved.topic}</span><span style={S.savedDate}>{new Date(saved.savedAt).toLocaleDateString()}</span></div>
                  <h4 style={S.savedAngle}>{saved.idea.angle}</h4>
                  <span style={S.savedFormat}>{saved.idea.format}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button style={S.savedMoveBtn} onClick={e => { e.stopPropagation(); setMovingId(movingId === saved.id ? null : saved.id); }}>Move</button>
                  <button style={S.savedDeleteBtn} onClick={e => { e.stopPropagation(); if (window.confirm("Delete this saved idea?")) onDeleteIdea(saved.id); }}>Delete</button>
                  <span style={{ color: "#C4B9A8", fontSize: 14 }}>{expandedId === saved.id ? "▲" : "▼"}</span>
                </div>
              </div>
              {movingId === saved.id && (
                <div style={S.moveDropdown}>
                  {folders.filter(f => f.id !== saved.folderId).map(f => <div key={f.id} style={S.moveOption} onClick={e => { e.stopPropagation(); onMoveIdea(saved.id, f.id); setMovingId(null); }}>📁 {f.name}</div>)}
                  {folders.filter(f => f.id !== saved.folderId).length === 0 && <div style={S.moveOptionEmpty}>No other folders</div>}
                </div>
              )}
              {expandedId === saved.id && <div style={{ paddingTop: 12 }}><IdeaCard idea={saved.idea} index={0} boardKey={`saved-${saved.id}`} moodBoards={moodBoards} setMoodBoards={setMoodBoards} /></div>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   Tab Content
   ══════════════════════════════════════════ */
function TabContent({ tab, project, moodBoards, setMoodBoards, updateTab, requestGenerate, onSaveIdea, isIdeaSaved }) {
  const resultsRef = useRef(null);
  const go = () => { if (tab.topic.trim() && project.brand.trim()) requestGenerate(tab.id, tab.topic, tab.platform, resultsRef); };
  return (
    <div>
      <div style={S.inputCard}>
        <div style={S.inputGrid}>
          <div style={S.topicCol}><label style={S.inputLabel}>Topic or keyword</label><input style={S.textInput} value={tab.topic} onChange={e => updateTab(tab.id, { topic: e.target.value })} placeholder="foods for weight management" onKeyDown={e => { if (e.key === "Enter") go(); }} /></div>
          <div style={S.platformCol}><label style={S.inputLabel}>Platform</label><select style={S.selectInput} value={tab.platform} onChange={e => updateTab(tab.id, { platform: e.target.value })}>{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div style={S.btnCol}><button style={{ ...S.generateBtn, opacity: tab.topic.trim() && !tab.loading ? 1 : 0.4 }} onClick={go} disabled={!tab.topic.trim() || tab.loading}>{tab.loading ? "Packing..." : "Pack my bento 🍱"}</button></div>
        </div>
        {(project.competitors || []).length > 0 && <div style={S.activeComps}><span style={S.activeCompsLabel}>Analyzing:</span>{project.competitors.map((c, i) => <span key={i} style={S.compChip}>{c}</span>)}</div>}
      </div>
      {tab.queued && <div style={S.queuedWrap}><p style={S.queuedText}>⏳ Waiting for other tab to finish...</p><p style={S.queuedSub}>Your request is queued and will start automatically.</p></div>}
      {tab.loading && !tab.queued && <LoadingState />}
      {tab.error && <div style={S.errorBox}>{tab.error}</div>}
      {tab.idea && (
        <div ref={resultsRef} style={S.results}>
          <div style={S.resultsHeader}>
            <p style={S.resultsLabel}>Idea for <span style={S.topicHighlight}>"{tab.topic}"</span> on <span style={S.topicHighlight}>{tab.platform}</span></p>
            <button style={S.regenerateBtn} onClick={go} disabled={tab.loading}>↻ Regenerate idea</button>
          </div>
          <IdeaCard idea={tab.idea} index={0} boardKey={`${tab.id}-0`} moodBoards={moodBoards} setMoodBoards={setMoodBoards} onSave={() => onSaveIdea(tab)} isSaved={isIdeaSaved(tab)} />
          <UsageCounter usage={tab.usage} />
        </div>
      )}
      {!tab.loading && !tab.idea && !tab.error && <div style={S.empty}><div style={S.emptyBento}><div style={{ ...S.emptyCell, opacity: 0.15 }} /><div style={{ ...S.emptyCell, opacity: 0.1 }} /><div style={{ ...S.emptyCell, opacity: 0.08 }} /><div style={{ ...S.emptyCell, opacity: 0.05 }} /></div><p style={S.emptyText}>Your bento is empty. Enter a topic to start packing.</p></div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   Main App
   ══════════════════════════════════════════ */
let tabCounter = 1;
const newTab = () => ({ id: `tab-${tabCounter++}`, name: "New", topic: "", platform: "Instagram", idea: null, usage: null, loading: false, queued: false, error: null });

export default function Bento() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectData, setProjectData] = useState({}); // { [projId]: { tabs, savedIdeas, folders, moodBoards } }
  const [view, setView] = useState("generate");
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const isGeneratingRef = useRef(false);
  const queueRef = useRef([]);

  const proj = projects.find(p => p.id === activeProjectId);
  const data = projectData[activeProjectId] || { tabs: [newTab()], savedIdeas: [], folders: [], moodBoards: {} };

  // Helpers to update project data
  const setData = (updates) => {
    setProjectData(prev => ({ ...prev, [activeProjectId]: { ...data, ...updates } }));
  };
  const updateTab = (id, updates) => { setData({ tabs: data.tabs.map(t => t.id === id ? { ...t, ...updates } : t) }); };

  // ── Load ──
  useEffect(() => {
    const ps = load("bento_projects", []);
    const apId = load("bento_active_project", null);
    const pd = {};
    for (const p of ps) {
      pd[p.id] = load(`bento_data_${p.id}`, { tabs: [newTab()], savedIdeas: [], folders: [], moodBoards: {} });
      // Clear loading states
      if (pd[p.id].tabs) pd[p.id].tabs = pd[p.id].tabs.map(t => ({ ...t, loading: false, queued: false, error: null }));
      // Restore tab counter
      const maxId = Math.max(0, ...(pd[p.id].tabs || []).map(t => parseInt(t.id.replace("tab-", "")) || 0));
      tabCounter = Math.max(tabCounter, maxId + 1);
    }
    setProjects(ps);
    setProjectData(pd);
    if (apId && ps.find(p => p.id === apId)) setActiveProjectId(apId);
    setHydrated(true);
  }, []);

  // ── Save ──
  useEffect(() => {
    if (!hydrated || projects.length === 0) return;
    save("bento_projects", projects);
    save("bento_active_project", activeProjectId);
  }, [projects, activeProjectId, hydrated]);

  useEffect(() => {
    if (!hydrated || !activeProjectId) return;
    save(`bento_data_${activeProjectId}`, {
      tabs: data.tabs.map(t => ({ id: t.id, name: t.name, topic: t.topic, platform: t.platform, idea: t.idea, usage: t.usage })),
      savedIdeas: data.savedIdeas, folders: data.folders, moodBoards: data.moodBoards,
    });
  }, [projectData, activeProjectId, hydrated]);

  // ── Project actions ──
  const createProject = (info) => {
    const id = `proj-${Date.now()}`;
    const p = { id, ...info };
    setProjects(prev => [...prev, p]);
    setProjectData(prev => ({ ...prev, [id]: { tabs: [newTab()], savedIdeas: [], folders: [], moodBoards: {} } }));
    setActiveProjectId(id);
    setCreatingProject(false);
    setView("generate");
  };

  const updateProject = (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProject = (id) => {
    if (projects.length <= 1) return;
    if (!window.confirm("Delete this project and all its data?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    setProjectData(prev => { const n = { ...prev }; delete n[id]; return n; });
    localStorage.removeItem(`bento_data_${id}`);
    if (activeProjectId === id) setActiveProjectId(projects.find(p => p.id !== id)?.id);
  };

  // ── Tab actions ──
  const addTab = () => { const t = newTab(); setData({ tabs: [...data.tabs, t] }); setActiveTabId(t.id); };
  const closeTab = (id) => { if (data.tabs.length === 1) return; const idx = data.tabs.findIndex(t => t.id === id); const nt = data.tabs.filter(t => t.id !== id); setData({ tabs: nt }); if (activeTabId === id) setActiveTabId(nt[Math.max(0, idx - 1)].id); };

  // ── Generation ──
  const runGenerate = async (tabId, topic, platform, resultsRef) => {
    if (!proj) return;
    isGeneratingRef.current = true;
    setData({ tabs: data.tabs.map(t => t.id === tabId ? { ...t, loading: true, queued: false, error: null, idea: null, usage: null } : t) });
    try {
      const response = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, brand: proj.brand, audience: proj.audience, tone: proj.tone, brandStyle: proj.brandStyle, competitors: proj.competitors }),
      });
      if (!response.ok) throw new Error("API request failed");
      const r = await response.json();
      if (r.error) throw new Error(r.error);
      setProjectData(prev => {
        const d = prev[activeProjectId] || data;
        return { ...prev, [activeProjectId]: { ...d, tabs: d.tabs.map(t => t.id === tabId ? { ...t, idea: r.idea, usage: r.usage, loading: false, name: topic.length > 25 ? topic.substring(0, 25) + "..." : topic } : t) } };
      });
      setTimeout(() => { resultsRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    } catch (err) {
      console.error(err);
      setProjectData(prev => {
        const d = prev[activeProjectId] || data;
        return { ...prev, [activeProjectId]: { ...d, tabs: d.tabs.map(t => t.id === tabId ? { ...t, error: "Something went wrong. Please try again.", loading: false } : t) } };
      });
    } finally {
      isGeneratingRef.current = false;
      if (queueRef.current.length > 0) { const next = queueRef.current.shift(); runGenerate(next.tabId, next.topic, next.platform, next.resultsRef); }
    }
  };

  const requestGenerate = (tabId, topic, platform, resultsRef) => {
    if (isGeneratingRef.current) {
      queueRef.current = queueRef.current.filter(q => q.tabId !== tabId);
      queueRef.current.push({ tabId, topic, platform, resultsRef });
      setData({ tabs: data.tabs.map(t => t.id === tabId ? { ...t, queued: true, loading: true, error: null, idea: null, usage: null } : t) });
    } else { runGenerate(tabId, topic, platform, resultsRef); }
  };

  // ── Save idea ──
  const onSaveIdea = (tab) => { setShowSaveModal(tab); };
  const handleSaveToFolder = (folderId, newName) => {
    let fid = folderId;
    if (newName) { fid = `folder-${Date.now()}`; setData({ folders: [...data.folders, { id: fid, name: newName }] }); }
    const tab = showSaveModal;
    if (!tab?.idea) return;
    setData({ savedIdeas: [...data.savedIdeas, { id: `saved-${Date.now()}`, idea: tab.idea, topic: tab.topic, platform: tab.platform, folderId: fid, savedAt: Date.now() }] });
    setShowSaveModal(null);
  };
  const isIdeaSaved = (tab) => tab.idea ? data.savedIdeas.some(s => s.idea.angle === tab.idea.angle && s.topic === tab.topic) : false;
  const deleteIdea = (id) => { setData({ savedIdeas: data.savedIdeas.filter(s => s.id !== id) }); };
  const deleteFolder = (id) => { setData({ folders: data.folders.filter(f => f.id !== id), savedIdeas: data.savedIdeas.filter(s => s.folderId !== id) }); };
  const moveIdea = (ideaId, fid) => { setData({ savedIdeas: data.savedIdeas.map(s => s.id === ideaId ? { ...s, folderId: fid } : s) }); };
  const createFolder = (name) => { setData({ folders: [...data.folders, { id: `folder-${Date.now()}`, name }] }); };

  const setMoodBoards = (mb) => { setData({ moodBoards: mb }); };

  const [activeTabId, setActiveTabId] = useState(null);
  const currentTab = data.tabs.find(t => t.id === activeTabId) || data.tabs[0];

  // ── Render ──
  if (!hydrated) return <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div style={S.loaderBox}>{[0,1,2,3].map(i => <div key={i} style={{ ...S.loaderCell, animationDelay: `${i * 0.15}s` }} />)}</div></div>;

  if (projects.length === 0 || creatingProject) return <div style={S.app}><ProjectSetup isFirst={projects.length === 0} onComplete={createProject} /></div>;

  if (!proj) return null;

  return (
    <div style={S.app}>
      {showSettings && <SettingsModal project={proj} onSave={updateProject} onClose={() => setShowSettings(false)} />}
      {showSaveModal && <SaveToFolderModal folders={data.folders.map(f => ({ ...f, count: data.savedIdeas.filter(s => s.folderId === f.id).length }))} onSave={handleSaveToFolder} onClose={() => setShowSaveModal(null)} />}

      <header style={S.header}>
        <div style={{ ...S.headerLeft, cursor: "pointer" }} onClick={() => { setView("generate"); setShowProjectMenu(false); }}>
          <div style={S.headerBento}><div style={{ ...S.hbCell, background: "#D4857A" }} /><div style={{ ...S.hbCell, background: "#9B72AA" }} /><div style={{ ...S.hbCell, background: "#6B937A" }} /><div style={{ ...S.hbCell, background: "#E8C869" }} /></div>
          <span style={S.headerName}>Bento</span>
        </div>
        <div style={S.headerRight}>
          {/* Project switcher */}
          <div style={{ position: "relative" }}>
            <button style={S.projectBtn} onClick={() => setShowProjectMenu(!showProjectMenu)}>
              {proj.name} ▾
            </button>
            {showProjectMenu && (
              <div style={S.projectMenu}>
                {projects.map(p => (
                  <div key={p.id} style={{ ...S.projectMenuItem, ...(p.id === activeProjectId ? S.projectMenuItemActive : {}) }} onClick={() => { setActiveProjectId(p.id); setShowProjectMenu(false); setView("generate"); }}>
                    <span>{p.name}</span>
                    {projects.length > 1 && p.id !== activeProjectId && <button style={S.folderDeleteBtn} onClick={e => { e.stopPropagation(); deleteProject(p.id); }}>✕</button>}
                  </div>
                ))}
                <div style={S.projectMenuDivider} />
                <div style={S.projectMenuItem} onClick={() => { setCreatingProject(true); setShowProjectMenu(false); }}>+ New project</div>
              </div>
            )}
          </div>
          <button style={{ ...S.viewToggle, ...(view === "generate" ? S.viewToggleActive : {}) }} onClick={() => setView("generate")}>Generate</button>
          <button style={{ ...S.viewToggle, ...(view === "saved" ? S.viewToggleActive : {}) }} onClick={() => setView("saved")}>Saved{data.savedIdeas.length > 0 ? ` (${data.savedIdeas.length})` : ""}</button>
          <button style={S.settingsBtn} onClick={() => setShowSettings(true)}>⚙</button>
        </div>
      </header>

      {view === "generate" && (
        <>
          <div style={S.tabBar}><div style={S.tabList}>
            {data.tabs.map(tab => (
              <div key={tab.id} style={{ ...S.tab, ...(tab.id === (activeTabId || data.tabs[0]?.id) ? S.tabActive : {}) }} onClick={() => setActiveTabId(tab.id)}>
                <span style={S.tabName}>{tab.loading && !tab.queued && <span style={S.tabSpinner}>⟳</span>}{tab.queued && <span style={{ fontSize: 12 }}>⏳</span>}{tab.name}</span>
                {data.tabs.length > 1 && <button style={S.tabClose} onClick={e => { e.stopPropagation(); closeTab(tab.id); }}>✕</button>}
              </div>
            ))}
            <button style={S.tabAdd} onClick={addTab}>+ New</button>
          </div></div>
          <main style={S.main}>
            <TabContent key={currentTab.id} tab={currentTab} project={proj} moodBoards={data.moodBoards} setMoodBoards={setMoodBoards} updateTab={updateTab} requestGenerate={requestGenerate} onSaveIdea={onSaveIdea} isIdeaSaved={isIdeaSaved} />
          </main>
        </>
      )}

      {view === "saved" && (
        <main style={S.main}>
          <SavedView savedIdeas={data.savedIdeas} folders={data.folders} moodBoards={data.moodBoards} setMoodBoards={setMoodBoards} onDeleteIdea={deleteIdea} onDeleteFolder={deleteFolder} onMoveIdea={moveIdea} onCreateFolder={createFolder} />
        </main>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Styles
   ══════════════════════════════════════════ */
const S = {
  app: { fontFamily: "'Instrument Sans', 'Helvetica Neue', sans-serif", minHeight: "100vh", background: "#FAF8F5", color: "#1C1917" },
  onboarding: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  onboardingCard: { maxWidth: 560, width: "100%", textAlign: "left", padding: "44px 40px", background: "#FFF", borderRadius: 20, border: "1px solid #E8E2D9", boxShadow: "0 8px 40px rgba(0,0,0,0.04)" },
  onboardingBento: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, width: 48, height: 48, margin: "0 auto 20px", borderRadius: 10, overflow: "hidden" },
  obCell1: { background: "#D4857A", borderRadius: "6px 2px 2px 2px" }, obCell2: { background: "#9B72AA", borderRadius: "2px 6px 2px 2px" },
  obCell3: { background: "#6B937A", borderRadius: "2px 2px 2px 6px" }, obCell4: { background: "#E8C869", borderRadius: "2px 2px 6px 2px" },
  obTitle: { fontSize: 34, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em", textAlign: "center" },
  obSub: { fontSize: 15, color: "#A39888", margin: "0 0 28px", fontStyle: "italic", textAlign: "center" },
  obSection: { marginBottom: 18 }, obLabel: { display: "block", fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 6 },
  obHint: { fontSize: 12, color: "#A39888", marginBottom: 10, lineHeight: 1.4 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 32px", borderBottom: "1px solid #E8E2D9", background: "#FFFEFB", position: "sticky", top: 0, zIndex: 20 },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerBento: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 22, height: 22, borderRadius: 4, overflow: "hidden" },
  hbCell: { borderRadius: 2 }, headerName: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" },
  headerRight: { display: "flex", alignItems: "center", gap: 6 },
  settingsBtn: { background: "none", border: "1px solid #DDD5CA", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#78716C", cursor: "pointer", fontFamily: "inherit" },
  projectBtn: { background: "none", border: "1px solid #DDD5CA", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "#1C1917", cursor: "pointer", fontFamily: "inherit" },
  projectMenu: { position: "absolute", top: "100%", right: 0, marginTop: 6, background: "#FFF", border: "1px solid #E8E2D9", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", minWidth: 200, zIndex: 50, overflow: "hidden" },
  projectMenuItem: { padding: "10px 16px", fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#44403C" },
  projectMenuItemActive: { background: "#FFF4F2", fontWeight: 700, color: "#1C1917" },
  projectMenuDivider: { height: 1, background: "#EDE8DF" },
  viewToggle: { background: "none", border: "1px solid transparent", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#A39888", cursor: "pointer", fontFamily: "inherit" },
  viewToggleActive: { color: "#1C1917", background: "#FAF8F5", border: "1px solid #DDD5CA" },
  tabBar: { borderBottom: "1px solid #E8E2D9", background: "#FFFEFB", padding: "0 32px", position: "sticky", top: 53, zIndex: 19 },
  tabList: { display: "flex", alignItems: "center", gap: 2, overflowX: "auto" },
  tab: { display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "#A39888", cursor: "pointer", borderBottom: "2px solid transparent", whiteSpace: "nowrap", fontFamily: "inherit" },
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
  optionalTag: { fontSize: 9, fontWeight: 500, color: "#C4B9A8", textTransform: "lowercase", fontStyle: "italic" },
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
  results: { marginTop: 4 },
  resultsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  resultsLabel: { fontSize: 15, color: "#78716C", margin: 0 },
  regenerateBtn: { padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#C07A8E", background: "#FFF4F2", border: "1.5px solid #FFE9E5", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  topicHighlight: { color: "#C07A8E", fontWeight: 700 },
  bentoBox: { border: "1.5px solid #E8E2D9", borderRadius: 18, overflow: "hidden", marginBottom: 20, background: "#FFF", boxShadow: "0 2px 16px rgba(0,0,0,0.03)" },
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
  usageBar: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "12px 0 0", opacity: 0.5 },
  usageItem: { fontSize: 11, color: "#A39888", fontFamily: "monospace" },
  usageDot: { fontSize: 11, color: "#DDD5CA" },
  saveBtn: { padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#C07A8E", background: "#FFF4F2", border: "1.5px solid #FFE9E5", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  savedBtnDone: { padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#6B937A", background: "#F1F7F3", border: "1.5px solid #E1EDE5", borderRadius: 8, cursor: "default", fontFamily: "inherit", whiteSpace: "nowrap" },
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
  folderOption: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #EDE8DF", cursor: "pointer", fontSize: 13 },
  folderOptionActive: { borderColor: "#C07A8E", background: "#FFF4F2" },
  folderCount: { fontSize: 11, color: "#A39888", fontWeight: 600 },
  savedLayout: { display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, minHeight: 400 },
  savedSidebar: { display: "flex", flexDirection: "column", gap: 4 },
  folderItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "#78716C" },
  folderItemActive: { background: "#FFF4F2", color: "#1C1917", fontWeight: 700 },
  folderDeleteBtn: { background: "none", border: "none", color: "#C4B9A8", fontSize: 10, cursor: "pointer", padding: 2, opacity: 0.5 },
  newFolderBtn: { padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#C07A8E", background: "none", border: "1.5px dashed #FFE9E5", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", marginTop: 4 },
  savedContent: { display: "flex", flexDirection: "column", gap: 12 },
  savedCard: { background: "#FFF", border: "1px solid #E8E2D9", borderRadius: 14, padding: "16px 20px", cursor: "pointer" },
  savedCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  savedMeta: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  savedPlatform: { fontSize: 11, fontWeight: 700, color: "#C07A8E", textTransform: "uppercase", letterSpacing: "0.06em" },
  savedTopic: { fontSize: 11, color: "#A39888" },
  savedDate: { fontSize: 11, color: "#C4B9A8" },
  savedAngle: { fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: "#1C1917", lineHeight: 1.35 },
  savedFormat: { fontSize: 12, color: "#78716C" },
  savedDeleteBtn: { background: "none", border: "1px solid #FECDCA", borderRadius: 6, color: "#B42318", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 10px", fontFamily: "inherit" },
  savedMoveBtn: { background: "none", border: "1px solid #DDD5CA", borderRadius: 6, color: "#78716C", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 10px", fontFamily: "inherit" },
  moveDropdown: { display: "flex", flexDirection: "column", gap: 4, padding: "10px 0", borderTop: "1px solid #EDE8DF", marginTop: 10 },
  moveOption: { padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#44403C" },
  moveOptionEmpty: { padding: "8px 12px", fontSize: 12, color: "#C4B9A8", fontStyle: "italic" },
};
