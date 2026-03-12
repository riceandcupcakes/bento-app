"use client";

import { useState, useEffect, useRef } from "react";

const PLATFORMS = ["Instagram", "TikTok", "LinkedIn", "Blog", "Twitter"];

const ACCENT_SETS = [
  { bg: "#FFF4F2", border: "#D4857A", tag: "#D4857A", tagBg: "#FFE9E5" },
  { bg: "#F8F1FB", border: "#9B72AA", tag: "#9B72AA", tagBg: "#F0E4F6" },
  { bg: "#F1F7F3", border: "#6B937A", tag: "#6B937A", tagBg: "#E1EDE5" },
];

/* ── Sub-components ── */

function SettingsModal({ brandDescription, onSave, onClose }) {
  const [draft, setDraft] = useState(brandDescription);
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Brand & Audience</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <p style={styles.modalDesc}>
          Describe your brand, target audience, and tone of voice. This is saved
          so you only set it once.
        </p>
        <textarea
          style={styles.brandTextarea}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder='e.g., "Clean beauty brand targeting women 25-35 who are skincare beginners. Tone: friendly, educational, empowering."'
          rows={5}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{ ...styles.primaryBtn, opacity: draft.trim() ? 1 : 0.4 }}
            onClick={() => {
              if (draft.trim()) {
                onSave(draft.trim());
                onClose();
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ResearchPoint({ text }) {
  const parts = text.split(/(<key>.*?<\/key>)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("<key>")) {
          const inner = part.replace(/<\/?key>/g, "");
          return (
            <span key={i} style={styles.keyHighlight}>
              {inner}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function IdeaCard({ idea, index }) {
  const colors = ACCENT_SETS[index % 3];

  return (
    <div style={{ ...styles.bentoBox, borderColor: colors.border }}>
      <div style={{ ...styles.bentoTop, background: colors.bg }}>
        <div
          style={{
            ...styles.formatTag,
            background: colors.tagBg,
            color: colors.tag,
          }}
        >
          {idea.format}
        </div>
        <h3 style={styles.angleTitle}>{idea.angle}</h3>
      </div>

      <div style={styles.bentoGrid}>
        <div style={styles.bentoLeft}>
          <div style={styles.compartmentLabel}>
            <span>🔬</span> Research
          </div>
          <div style={styles.researchStack}>
            {idea.research.map((r, i) => (
              <div key={i} style={styles.researchCard}>
                <p style={styles.researchText}>
                  <ResearchPoint text={r.point} />
                </p>
                <span style={styles.sourceText}>{r.source}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.bentoRight}>
          <div style={styles.compartmentLabel}>
            <span>📋</span> Content Brief
          </div>
          <div style={styles.briefStack}>
            {idea.brief.map((b, i) => (
              <div key={i} style={styles.briefStep}>
                <div
                  style={{
                    ...styles.stepLabel,
                    color: colors.tag,
                    background: colors.tagBg,
                  }}
                >
                  {b.step}
                </div>
                <p style={styles.stepContent}>{b.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...styles.bentoBottom, borderTopColor: colors.border }}>
        <span style={styles.whyLabel}>✨ Why this works</span>
        <p style={styles.whyText}>{idea.why}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  const messages = [
    "Researching your topic...",
    "Exploring content angles...",
    "Crafting platform-specific briefs...",
    "Packing your bento...",
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.loadingWrap}>
      <div style={styles.loaderBox}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              ...styles.loaderCell,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <p style={styles.loadingMsg}>{messages[msgIndex]}</p>
    </div>
  );
}

/* ── Main App ── */

export default function Home() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [brandDescription, setBrandDescription] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [ideas, setIdeas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingDraft, setOnboardingDraft] = useState("");
  const resultsRef = useRef(null);

  // Load saved brand description from memory on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.sessionStorage?.getItem?.("bento_brand") : null;
    if (saved) {
      setBrandDescription(saved);
      setShowOnboarding(false);
    }
  }, []);

  // Save brand description when it changes
  useEffect(() => {
    if (brandDescription && typeof window !== "undefined") {
      try { window.sessionStorage.setItem("bento_brand", brandDescription); } catch {}
    }
  }, [brandDescription]);

  const handleGenerate = async () => {
    if (!topic.trim() || !brandDescription.trim()) return;
    setLoading(true);
    setError(null);
    setIdeas(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, brandDescription }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      setIdeas(data.ideas);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Something went wrong generating ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ONBOARDING
  if (showOnboarding && !brandDescription) {
    return (
      <div style={styles.onboarding}>
        <div style={styles.onboardingCard}>
          <div style={styles.onboardingBento}>
            <div style={styles.obCell1} />
            <div style={styles.obCell2} />
            <div style={styles.obCell3} />
            <div style={styles.obCell4} />
          </div>
          <h1 style={styles.obTitle}>Bento</h1>
          <p style={styles.obSub}>Content ideas, neatly packed.</p>
          <p style={styles.obDesc}>
            Tell Bento about your brand and audience to get started. You only
            need to do this once.
          </p>
          <textarea
            style={styles.brandTextarea}
            value={onboardingDraft}
            onChange={(e) => setOnboardingDraft(e.target.value)}
            placeholder='e.g., "Clean beauty brand targeting women 25-35 who are skincare beginners. Tone: friendly, educational, empowering."'
            rows={4}
          />
          <button
            style={{
              ...styles.primaryBtn,
              marginTop: 20,
              width: "100%",
              opacity: onboardingDraft.trim() ? 1 : 0.4,
            }}
            onClick={() => {
              if (onboardingDraft.trim()) {
                setBrandDescription(onboardingDraft.trim());
                setShowOnboarding(false);
              }
            }}
          >
            Get started →
          </button>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <>
      {showSettings && (
        <SettingsModal
          brandDescription={brandDescription}
          onSave={(val) => setBrandDescription(val)}
          onClose={() => setShowSettings(false)}
        />
      )}

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerBento}>
            <div style={{ ...styles.hbCell, background: "#D4857A" }} />
            <div style={{ ...styles.hbCell, background: "#9B72AA" }} />
            <div style={{ ...styles.hbCell, background: "#6B937A" }} />
            <div style={{ ...styles.hbCell, background: "#E8C869" }} />
          </div>
          <span style={styles.headerName}>Bento</span>
        </div>
        <button
          style={styles.settingsBtn}
          onClick={() => setShowSettings(true)}
        >
          Brand & Audience ⚙
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.inputCard}>
          <div style={styles.inputGrid}>
            <div style={styles.topicCol}>
              <label style={styles.inputLabel}>Topic or keyword</label>
              <input
                style={styles.textInput}
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder='"retinol for acne" or "beauty of joseon"'
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
              />
            </div>
            <div style={styles.platformCol}>
              <label style={styles.inputLabel}>Platform</label>
              <select
                style={styles.selectInput}
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.btnCol}>
              <button
                style={{
                  ...styles.generateBtn,
                  opacity: topic.trim() && !loading ? 1 : 0.4,
                  cursor:
                    topic.trim() && !loading ? "pointer" : "not-allowed",
                }}
                onClick={handleGenerate}
                disabled={!topic.trim() || loading}
              >
                {loading ? "Packing..." : "Pack my bento 🍱"}
              </button>
            </div>
          </div>
        </div>

        {loading && <LoadingState />}
        {error && <div style={styles.errorBox}>{error}</div>}

        {ideas && (
          <div ref={resultsRef} style={styles.results}>
            <p style={styles.resultsLabel}>
              <span style={{ fontWeight: 700 }}>3 ideas</span> for{" "}
              <span style={styles.topicHighlight}>"{topic}"</span> on{" "}
              <span style={styles.topicHighlight}>{platform}</span>
            </p>
            {ideas.map((idea, i) => (
              <IdeaCard key={i} idea={idea} index={i} />
            ))}
          </div>
        )}

        {!loading && !ideas && !error && (
          <div style={styles.empty}>
            <div style={styles.emptyBento}>
              <div style={{ ...styles.emptyCell, opacity: 0.15 }} />
              <div style={{ ...styles.emptyCell, opacity: 0.1 }} />
              <div style={{ ...styles.emptyCell, opacity: 0.08 }} />
              <div style={{ ...styles.emptyCell, opacity: 0.05 }} />
            </div>
            <p style={styles.emptyText}>
              Your bento is empty. Enter a topic to start packing.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

/* ── Styles ── */
const styles = {
  onboarding: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  onboardingCard: {
    maxWidth: 460,
    width: "100%",
    textAlign: "center",
    padding: "48px 36px",
    background: "#FFF",
    borderRadius: 20,
    border: "1px solid #E8E2D9",
    boxShadow: "0 8px 40px rgba(0,0,0,0.04)",
  },
  onboardingBento: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 4,
    width: 48,
    height: 48,
    margin: "0 auto 20px",
    borderRadius: 10,
    overflow: "hidden",
  },
  obCell1: { background: "#D4857A", borderRadius: "6px 2px 2px 2px" },
  obCell2: { background: "#9B72AA", borderRadius: "2px 6px 2px 2px" },
  obCell3: { background: "#6B937A", borderRadius: "2px 2px 2px 6px" },
  obCell4: { background: "#E8C869", borderRadius: "2px 2px 6px 2px" },
  obTitle: {
    fontSize: 34,
    fontWeight: 800,
    margin: "0 0 4px",
    letterSpacing: "-0.03em",
  },
  obSub: {
    fontSize: 15,
    color: "#A39888",
    margin: "0 0 24px",
    fontStyle: "italic",
  },
  obDesc: {
    fontSize: 14,
    color: "#78716C",
    lineHeight: 1.6,
    margin: "0 0 20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    borderBottom: "1px solid #E8E2D9",
    background: "#FFFEFB",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerBento: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 2,
    width: 22,
    height: 22,
    borderRadius: 4,
    overflow: "hidden",
  },
  hbCell: { borderRadius: 2 },
  headerName: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  settingsBtn: {
    background: "none",
    border: "1px solid #DDD5CA",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#78716C",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  main: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "28px 20px 60px",
  },
  inputCard: {
    background: "#FFFEFB",
    border: "1px solid #E8E2D9",
    borderRadius: 16,
    padding: "22px 24px",
    marginBottom: 32,
  },
  inputGrid: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  topicCol: { flex: 2.5, minWidth: 200 },
  platformCol: { flex: 0.8, minWidth: 130 },
  btnCol: { flex: 1, minWidth: 150 },
  inputLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#A39888",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
  },
  textInput: {
    width: "100%",
    padding: "11px 14px",
    fontSize: 14,
    border: "1.5px solid #DDD5CA",
    borderRadius: 10,
    fontFamily: "inherit",
    color: "#1C1917",
    background: "#FAF8F5",
    boxSizing: "border-box",
  },
  selectInput: {
    width: "100%",
    padding: "11px 14px",
    fontSize: 14,
    border: "1.5px solid #DDD5CA",
    borderRadius: 10,
    fontFamily: "inherit",
    color: "#1C1917",
    background: "#FAF8F5",
    boxSizing: "border-box",
    appearance: "none",
    cursor: "pointer",
  },
  generateBtn: {
    width: "100%",
    padding: "11px 20px",
    fontSize: 14,
    fontWeight: 700,
    color: "#FFF",
    background: "#C07A8E",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "80px 20px",
  },
  loaderBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 5,
    width: 44,
    height: 44,
    marginBottom: 20,
  },
  loaderCell: {
    background: "#C07A8E",
    borderRadius: 4,
    animation: "bentoPulse 1s ease-in-out infinite",
    opacity: 0.25,
  },
  loadingMsg: {
    fontSize: 14,
    color: "#A39888",
    fontStyle: "italic",
  },
  errorBox: {
    background: "#FFF5F3",
    border: "1px solid #FECDCA",
    borderRadius: 12,
    padding: "14px 20px",
    textAlign: "center",
    color: "#B42318",
    fontSize: 13,
  },
  results: { marginTop: 4 },
  resultsLabel: {
    fontSize: 15,
    color: "#78716C",
    marginBottom: 24,
  },
  topicHighlight: {
    color: "#C07A8E",
    fontWeight: 700,
  },
  bentoBox: {
    border: "1.5px solid #E8E2D9",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 28,
    background: "#FFF",
    boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
  },
  bentoTop: {
    padding: "22px 26px 18px",
    borderBottom: "1px solid #E8E2D9",
  },
  formatTag: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "4px 10px",
    borderRadius: 6,
    marginBottom: 10,
  },
  angleTitle: {
    fontSize: 19,
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.35,
    letterSpacing: "-0.02em",
    color: "#1C1917",
  },
  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: 100,
  },
  bentoLeft: {
    padding: "20px 22px",
    borderRight: "1px solid #E8E2D9",
  },
  bentoRight: {
    padding: "20px 22px",
  },
  compartmentLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#A39888",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  researchStack: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  researchCard: {
    background: "#FAF8F5",
    borderRadius: 10,
    padding: "12px 14px",
    border: "1px solid #EDE8DF",
  },
  researchText: {
    fontSize: 13,
    lineHeight: 1.65,
    color: "#44403C",
    margin: "0 0 6px",
  },
  keyHighlight: {
    background: "linear-gradient(120deg, #FEF3C7 0%, #FDE68A 100%)",
    padding: "1px 4px",
    borderRadius: 3,
    fontWeight: 600,
    color: "#92400E",
  },
  sourceText: {
    fontSize: 11,
    color: "#A39888",
    fontStyle: "italic",
    lineHeight: 1.4,
    display: "block",
  },
  briefStack: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  briefStep: { padding: 0 },
  stepLabel: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 5,
    marginBottom: 6,
  },
  stepContent: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "#44403C",
    margin: 0,
  },
  bentoBottom: {
    padding: "16px 26px",
    borderTop: "1px solid #E8E2D9",
    background: "#FDFCFA",
  },
  whyLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#A39888",
    display: "block",
    marginBottom: 6,
  },
  whyText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "#57534E",
    margin: 0,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "100px 20px",
  },
  emptyBento: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 5,
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  emptyCell: {
    background: "#1C1917",
    borderRadius: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#A39888",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(28,25,23,0.35)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 24,
  },
  modal: {
    background: "#FFF",
    borderRadius: 18,
    padding: "32px 30px",
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 16,
    color: "#A39888",
    cursor: "pointer",
  },
  modalDesc: {
    fontSize: 13,
    color: "#78716C",
    lineHeight: 1.5,
    marginBottom: 16,
  },
  brandTextarea: {
    width: "100%",
    padding: "13px 14px",
    fontSize: 13,
    border: "1.5px solid #DDD5CA",
    borderRadius: 10,
    fontFamily: "inherit",
    color: "#1C1917",
    background: "#FAF8F5",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.6,
  },
  primaryBtn: {
    flex: 1,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 700,
    color: "#FFF",
    background: "#C07A8E",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  secondaryBtn: {
    flex: 1,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "#78716C",
    background: "#FAF8F5",
    border: "1.5px solid #DDD5CA",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
