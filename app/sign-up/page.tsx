"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, UserPlus } from "lucide-react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { createClient } from "@/lib/supabase/client";

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair",   color: "#f97316" };
  if (score <= 3) return { score, label: "Good",   color: "#facc15" };
  return              { score, label: "Strong", color: "var(--green)" };
}

export default function SignUpPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; agreed?: string; server?: string }>({});

  const strength = password ? getStrength(password) : null;

  /* ── Particles ── */
  useEffect(() => {
    const canvas = document.getElementById("auth-particles") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let W = 0, H = 0;
    const pts: { x: number; y: number; r: number; dx: number; dy: number; a: number }[] = [];
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 40; i++) {
      pts.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.2 + 0.3, dx: (Math.random() - 0.5) * 0.18, dy: (Math.random() - 0.5) * 0.18, a: Math.random() * 0.3 + 0.06 });
    }
    let raf: number;
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,255,71,${p.a})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });
      raf = requestAnimationFrame(draw);
    })();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  /* ── GSAP entrance ── */
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.set(card, { opacity: 0, y: 24 });
    gsap.to(card, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 });
    const items = card.querySelectorAll(".auth-animate");
    gsap.set(items, { opacity: 0, y: 14 });
    gsap.to(items, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06, delay: 0.3 });
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Must be at least 8 characters.";
    if (!agreed) e.agreed = "You must accept the terms.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setErrors({ server: error.message });
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  }

  async function handleOAuth(provider: "google" | "apple") {
    setOauthLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (success) {
    return (
      <div className="auth-root">
        <div className="auth-grid" />
        <div className="auth-glow" />
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-logo">Repurpose<span>One</span></div>
          <h1 className="auth-heading" style={{ marginTop: 24 }}>Check your inbox.</h1>
          <p className="auth-sub">
            We sent a confirmation link to <strong>{email}</strong>.<br />
            Click it to activate your account, then sign in.
          </p>
          <Link href="/sign-in" className="auth-btn" style={{ display: "flex", marginTop: 24 }}>
            Go to sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-grid" />
      <canvas id="auth-particles" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.45 }} />
      <div className="auth-glow" />

      <Link href="/" className="auth-back">
        <ArrowRight size={13} style={{ transform: "rotate(180deg)" }} />
        Back to home
      </Link>

      <div className="auth-card" ref={cardRef}>
        <div className="auth-logo auth-animate">
          Repurpose<span>One</span>
          <span className="nav-badge">Beta</span>
        </div>

        <h1 className="auth-heading auth-animate">
          Start <em>creating.</em>
        </h1>
        <p className="auth-sub auth-animate">
          Free forever. No credit card required.
        </p>

        {/* OAuth */}
        <div className="auth-oauth-row auth-animate">
          <button
            className="auth-oauth-btn"
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
          >
            {oauthLoading === "google" ? (
              <Loader2 size={15} style={{ animation: "spin .6s linear infinite" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" style={{ fill: "#4285F4" }} />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{ fill: "#34A853" }} />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" style={{ fill: "#FBBC05" }} />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" style={{ fill: "#EA4335" }} />
              </svg>
            )}
            Google
          </button>
          <button
            className="auth-oauth-btn"
            onClick={() => handleOAuth("apple")}
            disabled={!!oauthLoading}
          >
            {oauthLoading === "apple" ? (
              <Loader2 size={15} style={{ animation: "spin .6s linear infinite" }} />
            ) : (
              <Icon icon="tabler:brand-apple" width={16} height={16} />
            )}
            Apple
          </button>
        </div>

        <div className="auth-divider auth-animate">or sign up with email</div>

        {errors.server && (
          <div className="auth-field-error" style={{ marginBottom: 12, display: "block" }}>
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field auth-animate">
            <label className="auth-label" htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              className="auth-input"
              placeholder="Jane Smith"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
              autoComplete="name"
            />
            {errors.name && <span className="auth-field-error">{errors.name}</span>}
          </div>

          <div className="auth-field auth-animate">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
              autoComplete="email"
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          <div className="auth-field auth-animate">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="auth-input has-icon"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                autoComplete="new-password"
              />
              <button type="button" className="auth-input-icon" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {password && strength && (
              <div>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
                </div>
                <span style={{ fontSize: ".7rem", color: strength.color, marginTop: 3, display: "block" }}>
                  {strength.label} password
                </span>
              </div>
            )}
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          <div className="auth-check-row auth-animate">
            <input
              id="agreed"
              type="checkbox"
              className="auth-checkbox"
              checked={agreed}
              onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, agreed: undefined })); }}
            />
            <label className="auth-check-label" htmlFor="agreed">
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </label>
          </div>
          {errors.agreed && <span className="auth-field-error" style={{ marginTop: -8, marginBottom: 10, display: "block" }}>{errors.agreed}</span>}

          <button className="auth-btn auth-animate" type="submit" disabled={loading}>
            {loading ? (
              <><Loader2 size={16} style={{ animation: "spin .6s linear infinite" }} /> Creating account...</>
            ) : (
              <><UserPlus size={16} /> Create free account</>
            )}
          </button>
        </form>
      </div>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href="/sign-in">Sign in →</Link>
      </p>
    </div>
  );
}
