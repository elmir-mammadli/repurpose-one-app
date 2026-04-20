"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const PLATFORM_CONFIG: Record<string, { label: string; icon: string; cls: string; maxChars: number; limit: string }> = {
  twitter:   { label: "Twitter / X",  icon: "𝕏",  cls: "p-twitter",   maxChars: 280,  limit: "Keep threads ≤ 5 tweets. Include hashtags." },
  linkedin:  { label: "LinkedIn",     icon: "💼", cls: "p-linkedin",  maxChars: 3000, limit: "Professional, first-person, with a hook opening." },
  email:     { label: "Newsletter",   icon: "✉️", cls: "p-email",     maxChars: 2000, limit: "Include subject line, preview text, body with CTA." },
  threads:   { label: "Threads",      icon: "@",  cls: "p-threads",   maxChars: 500,  limit: "Conversational, no hashtags, feels personal." },
  instagram: { label: "Instagram",    icon: "📸", cls: "p-instagram", maxChars: 2200, limit: "Hook first sentence. 5 hashtags at the end. Emoji friendly." },
  reddit:    { label: "Reddit",       icon: "👾", cls: "p-reddit",    maxChars: 5000, limit: "No marketing. Value-first. Title + body format." },
};

type ResultMap = Record<string, string>;

interface Stats {
  platforms: number;
  words: number;
  saved: number;
  total: number;
}

interface Generation {
  id: string;
  input_text: string;
  tone: string;
  platforms: string[];
  results: ResultMap;
  word_count: number;
  created_at: string;
}

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function CharBadge({ len, max }: { len: number; max: number }) {
  const pct = len / max;
  const cls = pct > 0.95 ? "warn" : pct > 0.5 ? "ok" : "";
  return <span className={`char-badge ${cls}`}>{len} / {max} chars</span>;
}

function SkeletonCard({ platform }: { platform: string }) {
  const cfg = PLATFORM_CONFIG[platform];
  return (
    <div className="skeleton">
      <div className="result-header" style={{ background: "var(--surface2)" }}>
        <div className="result-platform">
          <span className={cfg.cls}>{cfg.icon}</span> {cfg.label}
        </div>
      </div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[90, 75, 85, 60, 70].map((w, i) => (
          <div key={i} className="skel-line" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ platform, content, onCopy }: { platform: string; content: string; onCopy: (text: string, btn: HTMLButtonElement) => void }) {
  const cfg = PLATFORM_CONFIG[platform];
  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-platform">
          <span className={cfg.cls}>{cfg.icon}</span> {cfg.label}
        </div>
        <div className="result-actions">
          <button className="btn-icon" title="Copy" onClick={(e) => onCopy(content, e.currentTarget as HTMLButtonElement)}>
            ⎘
          </button>
        </div>
      </div>
      <div className="result-body">
        <div className="result-text" dangerouslySetInnerHTML={{ __html: escHtml(content) }} />
      </div>
      <div className="result-footer">
        <CharBadge len={content.length} max={cfg.maxChars} />
      </div>
    </div>
  );
}

type ViewState = "empty" | "loading" | "results" | "error";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState("?");
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(10);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [history, setHistory] = useState<Generation[]>([]);

  const [inputText, setInputText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(["twitter", "linkedin", "email"]));
  const [selectedTone, setSelectedTone] = useState("professional");
  const [totalRuns, setTotalRuns] = useState(0);
  const [viewState, setViewState] = useState<ViewState>("empty");
  const [results, setResults] = useState<ResultMap>({});
  const [activePlatforms, setActivePlatforms] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ platforms: 0, words: 0, saved: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState("");

  /* ── Bootstrap user + credits + history ── */
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);

      const email = user.email ?? null;
      setUserEmail(email);
      const name = (user.user_metadata?.full_name as string | undefined) ?? email ?? "";
      const parts = name.trim().split(" ");
      setUserInitials(
        parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase()
      );

      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();
      if (profile) setCredits(profile.credits);

      const { data: gens } = await supabase
        .from("generations")
        .select("id, input_text, tone, platforms, results, word_count, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (gens) {
        setHistory(gens as Generation[]);
        setTotalRuns(gens.length);
      }
    });
  }, []);

  async function handleUpgrade() {
    setUpgradeLoading(true);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey: "creator_monthly" }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setUpgradeLoading(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  const togglePlatform = useCallback((platform: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) {
        if (next.size === 1) return prev;
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  }, []);

  const copyText = useCallback((text: string, btn: HTMLButtonElement) => {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = "✓";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "⎘"; btn.classList.remove("copied"); }, 1800);
    });
  }, []);

  const generate = useCallback(async () => {
    setErrorMsg("");
    const text = inputText.trim();
    if (!text) { setErrorMsg("Please paste your content first."); return; }
    if (text.length < 50) { setErrorMsg("Content is too short — paste at least a paragraph."); return; }
    if (credits <= 0) { setErrorMsg("No credits left. Upgrade to continue."); return; }

    const platforms = [...selectedPlatforms];
    setActivePlatforms(platforms);
    setViewState("loading");

    const platformInstructions = platforms.map(p => {
      const c = PLATFORM_CONFIG[p];
      return `## ${c.label}\n${c.limit}\nMax characters: ${c.maxChars}`;
    }).join("\n\n");

    const prompt = `You are a professional content repurposing expert. Adapt the article below for ${platforms.length} platform(s) with a ${selectedTone} tone.

PLATFORMS TO GENERATE FOR:
${platformInstructions}

IMPORTANT RULES:
- Adapt style and format specifically for each platform — they must feel native
- Tone across all: ${selectedTone}
- Do NOT just copy-paste — rewrite hooks and angles for each audience
- Return ONLY a JSON object with platform keys: ${platforms.join(", ")}
- Each value is the ready-to-post string for that platform
- No markdown fences, no explanation text outside JSON

ORIGINAL CONTENT:
${text}`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      let raw = (data.content?.map((b: { text?: string }) => b.text || "").join("") || "");
      raw = raw.replace(/```json|```/g, "").trim();
      const result: ResultMap = JSON.parse(raw);

      const wordCount = text.split(/\s+/).length;

      /* ── Persist to DB ── */
      const supabase = createClient();
      const newCredits = credits - 1;

      await Promise.all([
        supabase.from("generations").insert({
          user_id: userId,
          input_text: text,
          tone: selectedTone,
          platforms,
          results: result,
          word_count: wordCount,
        }),
        supabase.from("profiles").update({ credits: newCredits }).eq("id", userId),
      ]);

      /* ── Refresh history ── */
      const { data: gens } = await supabase
        .from("generations")
        .select("id, input_text, tone, platforms, results, word_count, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (gens) setHistory(gens as Generation[]);

      const newTotal = totalRuns + 1;
      setCredits(newCredits);
      setTotalRuns(newTotal);
      setStats({ platforms: platforms.length, words: wordCount, saved: platforms.length * 8, total: newTotal });
      setResults(result);
      setViewState("results");
    } catch {
      setErrorMsg("Generation failed — check your connection and try again.");
      setViewState("error");
    }
  }, [inputText, selectedPlatforms, selectedTone, credits, totalRuns, userId]);

  return (
    <div className="db-app">
      {/* Nav */}
      <nav className="db-nav">
        <div className="db-nav-logo">
          Repurpose<span>One</span>
          <span className="nav-badge">Beta</span>
        </div>
        <div className="db-nav-right">
          <div className="nav-credits">Credits: <b>{credits}</b> / 10</div>
          {userEmail && (
            <span className="nav-user-email" style={{ fontSize: ".72rem", color: "var(--muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </span>
          )}
          <div className="avatar" title={userEmail ?? undefined}>{userInitials}</div>
          <button
            onClick={handleSignOut}
            style={{ fontSize: ".72rem", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="db-main">
        {/* LEFT PANEL */}
        <div className="left-panel">

          {/* Input Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Your Content</span>
              <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>Paste article, script, or idea</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="input-wrap">
                <textarea
                  id="inputText"
                  placeholder={"Paste your long-form content here — blog post, newsletter, video script, podcast notes...\n\nThe AI will intelligently adapt it for each platform you select."}
                  maxLength={8000}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <span className="char-count">{inputText.length} / 8000</span>
              </div>
              {errorMsg && <div className="error-msg">{errorMsg}</div>}
            </div>
          </div>

          {/* Platforms Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Platforms</span>
              <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>{selectedPlatforms.size} selected</span>
            </div>
            <div className="card-body">
              <div className="platform-grid">
                {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    className={`platform-btn${selectedPlatforms.has(key) ? " active" : ""}`}
                    onClick={() => togglePlatform(key)}
                  >
                    <span className="picon">{cfg.icon}</span> {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tone Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Tone</span>
            </div>
            <div className="card-body">
              <div className="tone-row">
                {["professional", "casual", "witty", "storytelling", "educational", "bold"].map((tone) => (
                  <button
                    key={tone}
                    className={`tone-chip${selectedTone === tone ? " active" : ""}`}
                    onClick={() => setSelectedTone(tone)}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate */}
          <button className="btn-primary" onClick={generate} disabled={viewState === "loading"}>
            {viewState === "loading" ? (
              <><div className="spinner" /> Repurposing...</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Repurpose Content
              </>
            )}
          </button>

          {/* History */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent</span>
            </div>
            <div className="card-body" style={{ paddingTop: "4px", paddingBottom: "4px" }}>
              {history.length === 0 ? (
                <div style={{ fontSize: ".75rem", color: "var(--muted)", padding: "8px 0" }}>
                  No runs yet — generate your first repurpose above.
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="history-item" onClick={() => {
                    setInputText(item.input_text);
                    setResults(item.results);
                    setActivePlatforms(item.platforms);
                    setSelectedTone(item.tone);
                    setViewState("results");
                  }}>
                    <div className="history-title">{item.input_text.slice(0, 55)}…</div>
                    <div className="history-meta">{item.platforms.length} platforms · {timeAgo(item.created_at)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upgrade */}
          <div className="upgrade-banner">
            <div className="upgrade-text">
              <b>{credits <= 2 ? `${credits} credits left` : `${credits} credits remaining`}</b> on free plan.<br />
              Upgrade for unlimited repurposing.
            </div>
            <button className="btn-upgrade" onClick={handleUpgrade} disabled={upgradeLoading}>
              {upgradeLoading ? "Redirecting..." : "Upgrade $19/mo"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          {viewState === "results" && (
            <div className="stats-bar">
              <div className="stat"><div className="stat-val">{stats.platforms}</div><div className="stat-label">Platforms</div></div>
              <div className="stat-divider" />
              <div className="stat"><div className="stat-val">{stats.words}</div><div className="stat-label">Words In</div></div>
              <div className="stat-divider" />
              <div className="stat"><div className="stat-val">{stats.saved}</div><div className="stat-label">Min Saved</div></div>
              <div className="stat-divider" />
              <div className="stat"><div className="stat-val">{stats.total}</div><div className="stat-label">Total Runs</div></div>
            </div>
          )}

          {(viewState === "empty" || viewState === "error") && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>Ready to repurpose</h3>
              <p>Paste your content, pick your platforms, choose a tone — and get perfectly adapted copy for each in seconds.</p>
            </div>
          )}

          {viewState === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {activePlatforms.map((p) => <SkeletonCard key={p} platform={p} />)}
            </div>
          )}

          {viewState === "results" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {activePlatforms.map((p) => (
                <ResultCard key={p} platform={p} content={results[p] || "[No content generated for this platform]"} onCopy={copyText} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
