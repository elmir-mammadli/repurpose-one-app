"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Layers, PlayCircle, Cpu, Send, SlidersHorizontal,
  CalendarClock, BarChart3, ShieldCheck, FileText,
  LayoutGrid, Sparkles, Edit3, Rocket, TrendingUp,
  Check, Minus, Monitor,
} from "lucide-react";
import { Icon } from "@iconify/react";

const marqueeItems = [
  "Twitter / X", "LinkedIn", "Newsletter", "Threads",
  "Instagram", "Reddit", "Write Once", "Publish Everywhere", "Save 8 hrs / week",
  "Twitter / X", "LinkedIn", "Newsletter", "Threads",
  "Instagram", "Reddit", "Write Once", "Publish Everywhere", "Save 8 hrs / week",
];

export default function HomePage() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLSpanElement>(null);
  const mtrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* ── Particles ── */
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      let W = 0, H = 0;
      const pts: { x: number; y: number; r: number; dx: number; dy: number; a: number }[] = [];
      function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
      resize();
      window.addEventListener("resize", resize);
      for (let i = 0; i < 65; i++) {
        pts.push({ x: Math.random() * 1e4 % window.innerWidth, y: Math.random() * 1e4 % window.innerHeight, r: Math.random() * 1.4 + 0.3, dx: (Math.random() - 0.5) * 0.22, dy: (Math.random() - 0.5) * 0.22, a: Math.random() * 0.45 + 0.08 });
      }
      let rafId: number;
      (function draw() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232,255,71,${p.a})`; ctx.fill();
          p.x += p.dx; p.y += p.dy;
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        });
        rafId = requestAnimationFrame(draw);
      })();
      return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
    }
  }, []);

  useEffect(() => {
    /* ── Cursor ── */
    const cur = cursorRef.current;
    const ring = ringRef.current;
    const lbl = labelRef.current;
    if (!cur || !ring || !lbl) return;
    let mx = 0, my = 0, rx = 0, ry = 0, lx = 0, ly = 0;
    let rafId: number;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);
    (function loop() {
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      lx += (mx - lx) * 0.08; ly += (my - ly) * 0.08;
      cur.style.left = mx + "px"; cur.style.top = my + "px";
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      lbl.style.left = lx + "px"; lbl.style.top = (ly + 32) + "px";
      rafId = requestAnimationFrame(loop);
    })();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId); };
  }, []);

  useEffect(() => {
    /* ── Progress bar ── */
    const prog = progressRef.current;
    if (!prog) return;
    const onScroll = () => {
      prog.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + "%";
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    /* ── Nav scroll class ── */
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    /* ── Marquee speed burst ── */
    const track = mtrackRef.current;
    if (!track) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      track.style.animationDuration = "14s";
      clearTimeout(timer);
      timer = setTimeout(() => { track.style.animationDuration = "32s"; }, 350);
    };
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    /* ── All GSAP ── */
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {

        /* ── Hero entrance ── */
        const htl = gsap.timeline({ defaults: { ease: "power3.out" } });
        htl.to("#navLogo",   { opacity: 1, y: 0, duration: .7 }, 0.15)
           .to("#navLinks",  { opacity: 1, y: 0, duration: .7 }, 0.25)
           .to("#navCta",    { opacity: 1, y: 0, duration: .7 }, 0.30)
           .to("#heroEyebrow", { opacity: 1, duration: .8 }, 0.50);
        htl.from(document.querySelectorAll("#heroTitle .word"), { y: "115%", opacity: 0, duration: .9, stagger: .14, ease: "power4.out" }, 0.75);
        htl.to("#heroSub",     { opacity: 1, y: 0, duration: .75 }, 1.4)
           .to("#heroActions", { opacity: 1, y: 0, duration: .75 }, 1.6)
           .to("#heroScroll",  { opacity: 1, duration: .6 },        2.1);

        /* SVG path draw */
        [1, 2, 3].forEach((n, i) =>
          gsap.to(`#fp${n}`, { strokeDashoffset: 0, duration: 2.8, ease: "power2.inOut", delay: 0.5 + i * 0.35 })
        );

        /* Glow mouse follow */
        const onMove = (e: MouseEvent) => {
          gsap.to("#heroGlow", { x: (e.clientX / window.innerWidth - 0.5) * 60, y: (e.clientY / window.innerHeight - 0.5) * 32, duration: 1.8, ease: "power2.out" });
        };
        window.addEventListener("mousemove", onMove);

        /* Glow parallax */
        gsap.to("#heroGlow", { y: 90, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

        /* Scroll line pulse */
        gsap.fromTo("#scrollLine", { scaleY: 0 }, { scaleY: 1, duration: 1.3, ease: "power2.inOut", repeat: -1, yoyo: true, delay: 2.4 });

        /* em float */
        gsap.to(".hero-title em", { y: -9, duration: 2.5, ease: "sine.inOut", yoyo: true, repeat: -1 });

        /* Outline glitch */
        const ow = outlineRef.current;
        if (ow) {
          ow.addEventListener("mouseenter", () => {
            gsap.timeline()
              .to(ow, { skewX: -7, duration: .09, ease: "power2.out" })
              .to(ow, { skewX: 3, duration: .07 })
              .to(ow, { skewX: 0, duration: .4, ease: "elastic.out(1,.4)" });
          });
        }

        /* Magnetic buttons */
        document.querySelectorAll<HTMLElement>(".mag-wrap").forEach(w => {
          const b = w.querySelector("button");
          if (!b) return;
          w.addEventListener("mousemove", (e: MouseEvent) => {
            const r = w.getBoundingClientRect();
            gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.4, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: .35, ease: "power2.out" });
          });
          w.addEventListener("mouseleave", () => gsap.to(b, { x: 0, y: 0, duration: .65, ease: "elastic.out(1,.4)" }));
        });

        /* Ripple */
        document.querySelectorAll<HTMLButtonElement>(".btn-primary-lg").forEach(btn => {
          btn.addEventListener("click", (e: MouseEvent) => {
            const rip = document.createElement("div");
            rip.className = "btn-ripple";
            const r = btn.getBoundingClientRect();
            rip.style.left = (e.clientX - r.left) + "px";
            rip.style.top  = (e.clientY - r.top)  + "px";
            btn.appendChild(rip);
            gsap.to(rip, { scale: 9, opacity: 0, duration: .75, ease: "power2.out", onComplete: () => rip.remove() });
          });
        });

        /* Cursor data-cursor interaction */
        const cur = cursorRef.current;
        const ring = ringRef.current;
        const lbl = labelRef.current;
        document.querySelectorAll<HTMLElement>("[data-cursor]").forEach(el => {
          el.addEventListener("mouseenter", () => {
            if (lbl) { gsap.to(lbl, { opacity: 1, duration: .2 }); lbl.textContent = el.dataset.cursor!; }
            if (cur) gsap.to(cur, { scale: 0, duration: .15 });
            if (ring) gsap.to(ring, { scale: 2.2, borderColor: "rgba(232,255,71,.6)", duration: .25 });
          });
          el.addEventListener("mouseleave", () => {
            if (lbl) gsap.to(lbl, { opacity: 0, duration: .15 });
            if (cur) gsap.to(cur, { scale: 1, duration: .15 });
            if (ring) gsap.to(ring, { scale: 1, borderColor: "rgba(232,255,71,.35)", duration: .25 });
          });
        });

        /* Horizontal scroll */
        const track = document.getElementById("hscrollTrack");
        const outer = document.querySelector<HTMLElement>(".hscroll-outer");
        if (track && outer) {
          const dist = track.scrollWidth - outer.offsetWidth + 80;
          gsap.to(track, {
            x: -dist, ease: "none",
            scrollTrigger: { trigger: outer, start: "top top", end: `+=${dist + 500}`, pin: true, scrub: 1, anticipatePin: 1 },
          });
        }

        /* Reveals */
        gsap.utils.toArray<Element>(".reveal").forEach((el, i) => {
          gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 87%", toggleActions: "play none none none" }, delay: (i % 4) * 0.06 });
        });

        /* Feature cards */
        gsap.utils.toArray<Element>(".fc").forEach((card, i) => {
          gsap.fromTo(card, { opacity: 0, y: 52, rotateX: 10 }, { opacity: 1, y: 0, rotateX: 0, duration: .78, ease: "power3.out",
            delay: (i % 3) * 0.12, scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none none" } });
          const icon = (card as HTMLElement).querySelector(".feature-icon");
          card.addEventListener("mouseenter", () => gsap.to(icon, { rotate: -9, scale: 1.12, duration: .3, ease: "power2.out" }));
          card.addEventListener("mouseleave", () => gsap.to(icon, { rotate: 0, scale: 1, duration: .45, ease: "elastic.out(1,.5)" }));
        });

        /* Platform pills */
        gsap.utils.toArray<Element>(".platform-pill").forEach((p, i) => {
          gsap.fromTo(p, { opacity: 0, scale: .82, y: 18 }, { opacity: 1, scale: 1, y: 0, duration: .55, ease: "back.out(1.7)",
            delay: i * 0.08, scrollTrigger: { trigger: p, start: "top 90%", toggleActions: "play none none none" } });
        });

        /* Testimonial cards */
        gsap.utils.toArray<Element>(".testi-card").forEach((c, i) => {
          gsap.fromTo(c, { opacity: 0, y: 42, scale: .95 }, { opacity: 1, y: 0, scale: 1, duration: .72, ease: "power3.out",
            delay: i * 0.16, scrollTrigger: { trigger: c, start: "top 88%", toggleActions: "play none none none" } });
        });

        /* Pricing 3D tilt */
        document.querySelectorAll<HTMLElement>(".pricing-card").forEach(card => {
          card.addEventListener("mousemove", (e: MouseEvent) => {
            const r = card.getBoundingClientRect();
            gsap.to(card, { rotateY: (e.clientX - r.left) / r.width * 0.5 - 9, rotateX: -((e.clientY - r.top) / r.height * 0.5 - 0.25) * 9, duration: .3, ease: "power2.out", transformPerspective: 800 });
          });
          card.addEventListener("mouseleave", () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: .65, ease: "elastic.out(1,.4)" }));
        });

        /* Stat tickers */
        document.querySelectorAll<HTMLElement>(".stat-ticker").forEach(el => {
          const t = parseInt(el.dataset.target!);
          const s = el.dataset.suffix || "";
          ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => {
            gsap.to({ v: 0 }, { v: t, duration: 2.1, ease: "power2.out", onUpdate(this: gsap.core.Tween) {
              el.textContent = Math.round((this.targets()[0] as { v: number }).v).toLocaleString() + s;
            } });
          } });
        });

        /* CTA big reveal */
        ScrollTrigger.create({ trigger: "#ctaBig", start: "top 80%", once: true, onEnter: () => {
          gsap.fromTo("#ctaBig", { opacity: 0, y: 64, skewY: 3 }, { opacity: 1, y: 0, skewY: 0, duration: 1.1, ease: "power4.out" });
        } });

        /* Footer hover */
        document.querySelectorAll<HTMLAnchorElement>(".footer-links a").forEach(a => {
          a.addEventListener("mouseenter", () => gsap.to(a, { y: -2, duration: .2 }));
          a.addEventListener("mouseleave", () => gsap.to(a, { y: 0, duration: .35, ease: "elastic.out(1,.5)" }));
        });
    });

    return () => { ctx.revert(); };
  }, []);

  return (
    <div className="hp-noise">
      <canvas id="particles" />
      <div id="progress-line" ref={progressRef} />
      <div id="cursor" ref={cursorRef} />
      <div id="cursor-ring" ref={ringRef} />
      <div id="cursor-label" ref={labelRef} />

      {/* NAV */}
      <nav className="hp-nav" id="mainNav" ref={navRef}>
        <div className="nav-logo" id="navLogo">
          Repurpose<span>One</span>
          <span className="nav-badge">Beta</span>
        </div>
        <ul className="nav-links" id="navLinks">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#platforms">Platforms</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="nav-cta" id="navCta">
          <Link href="/sign-in" className="btn-ghost">Sign in</Link>
          <Link href="/sign-up" className="btn-nav">Start free →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" id="heroGlow" />
        <svg id="flow-svg" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <path className="flow-path" id="fp1" d="M-100,200 C200,100 400,350 700,250 C1000,150 1200,380 1540,290" />
          <path className="flow-path" id="fp2" d="M-100,400 C300,280 500,550 800,400 C1100,270 1300,490 1540,370" />
          <path className="flow-path" id="fp3" d="M-100,600 C200,490 600,700 900,560 C1200,440 1360,610 1540,540" />
        </svg>

        <div className="hero-eyebrow" id="heroEyebrow">
          <span className="eyebrow-dot" />
          Now with direct publishing
        </div>
        <h1 className="hero-title" id="heroTitle">
          <span className="line">
            <span className="word">Write</span>&nbsp;
            <span className="word outline" ref={outlineRef}>once.</span>
          </span>
          <span className="line">
            <span className="word">Publish</span>&nbsp;
            <span className="word"><em>everywhere.</em></span>
          </span>
        </h1>
        <p className="hero-sub" id="heroSub">
          Paste your long-form content. Pick your platforms. Get native, ready-to-post copy for each in seconds — then publish directly. No more copy-paste marathons.
        </p>
        <div className="hero-actions" id="heroActions">
          <div className="mag-wrap">
            <button className="btn-primary-lg" data-cursor="Get started" onClick={() => router.push("/sign-up")}>
              <div className="btn-inner"><Layers size={16} /> Start repurposing free</div>
            </button>
          </div>
          <button className="btn-secondary-lg" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}><PlayCircle size={16} /> Watch 60s demo</button>
        </div>
        <div className="hero-scroll" id="heroScroll">
          <div className="scroll-line" id="scrollLine" />
          Scroll
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track" id="mtrack" ref={mtrackRef}>
          {marqueeItems.map((item, i) => (
            <div className="marquee-item" key={i}>
              <span className="marquee-dot">✦</span> {item}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-outer">
        <div className="stats-row reveal">
          <div className="stat-box">
            <div className="stat-ticker" data-target="12400" data-suffix="+">0</div>
            <div className="stat-box-label">Creators using it</div>
          </div>
          <div className="stat-box">
            <div className="stat-ticker" data-target="8" data-suffix="hrs">0</div>
            <div className="stat-box-label">Saved per week</div>
          </div>
          <div className="stat-box">
            <div className="stat-ticker" data-target="6" data-suffix="">0</div>
            <div className="stat-box-label">Platforms supported</div>
          </div>
          <div className="stat-box">
            <div className="stat-ticker" data-target="98" data-suffix="%">0</div>
            <div className="stat-box-label">Would recommend</div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-label reveal">What you get</div>
        <h2 className="section-title reveal">Built for creators who <em>actually ship.</em></h2>
        <div className="features-grid">
          {[
            { icon: <Cpu size={20} />, title: "Platform-native copy", desc: "Not a simple repost. The AI rewrites your hook, angle, and format to feel native on every platform — LinkedIn gets professional, Twitter gets punchy, Reddit gets real." },
            { icon: <Send size={20} />, title: "One-click publishing", desc: "Connect your accounts once. Hit \"Post\" directly from the dashboard. No switching tabs, no copy-paste, no login juggling. Your whole distribution in one place." },
            { icon: <SlidersHorizontal size={20} />, title: "Tone control", desc: "Choose from 6 tones — Professional, Casual, Witty, Storytelling, Educational, Bold. Your voice, adapted to each platform's culture and audience expectations." },
            { icon: <CalendarClock size={20} />, title: "Smart scheduling", desc: "Queue your posts for peak engagement times. Platform-specific optimal windows, auto-detected from your audience data. Set it and forget it." },
            { icon: <BarChart3 size={20} />, title: "Performance analytics", desc: "See which repurposed posts hit hardest. Cross-platform analytics in one view — impressions, clicks, engagement rate. Know what to double down on." },
            { icon: <ShieldCheck size={20} />, title: "Secure OAuth auth", desc: "Industry-standard OAuth 2.0 for every platform. Your credentials never touch our servers — tokens are encrypted at rest and in transit, always." },
          ].map((f, i) => (
            <div className="feature-card fc" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div className="hscroll-outer" id="how">
        <div className="hscroll-header">
          <div className="section-label reveal">How it works</div>
          <h2 className="section-title reveal">From one article to <em>six platforms</em> in 30 seconds.</h2>
        </div>
        <div className="hscroll-track" id="hscrollTrack">
          {[
            { num: "01", icon: <FileText size={22} />, title: "Paste your content", desc: "Drop in your blog post, newsletter draft, video script, or raw notes. Any length, any format." },
            { num: "02", icon: <LayoutGrid size={22} />, title: "Pick platforms", desc: "Select which channels to hit — Twitter, LinkedIn, Newsletter, Threads, Instagram, Reddit, or all six." },
            { num: "03", icon: <Sparkles size={22} />, title: "AI repurposes it", desc: "Claude rewrites your content natively for each platform — hooks, format, hashtags, length all adapted." },
            { num: "04", icon: <Edit3 size={22} />, title: "Tweak if you want", desc: "Each result is fully editable. Adjust tone, swap a hook, punch up the CTA — total creative control." },
            { num: "05", icon: <Rocket size={22} />, title: "Publish or schedule", desc: "Hit Post Now or drop into your queue. Your whole distribution done in seconds." },
            { num: "06", icon: <TrendingUp size={22} />, title: "Track performance", desc: "See what landed. Which tone resonated. Improve your strategy every week on autopilot." },
          ].map((s, i) => (
            <div className="hscroll-card" key={i}>
              <div className="hscroll-num">{s.num}</div>
              <div className="hscroll-icon">{s.icon}</div>
              <div className="hscroll-title">{s.title}</div>
              <div className="hscroll-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PLATFORMS */}
      <section className="platforms-section" id="platforms">
        <div className="section-label reveal">Integrations</div>
        <h2 className="section-title reveal">Connect your world. <em>Post everywhere</em> at once.</h2>
        <div className="platforms-showcase">
          {[
            { icon: <Icon icon="tabler:brand-x" width={16} height={16} />, label: "Twitter / X", status: "live" },
            { icon: <Icon icon="tabler:brand-linkedin" width={16} height={16} />, label: "LinkedIn", status: "live" },
            { icon: <Icon icon="tabler:mail" width={16} height={16} />, label: "Newsletter", status: "live" },
            { icon: <Icon icon="tabler:brand-threads" width={16} height={16} />, label: "Threads", status: "live" },
            { icon: <Icon icon="tabler:brand-instagram" width={16} height={16} />, label: "Instagram", status: "soon" },
            { icon: <Icon icon="tabler:brand-reddit" width={16} height={16} />, label: "Reddit", status: "live" },
            { icon: <Icon icon="tabler:brand-tiktok" width={16} height={16} />, label: "TikTok", status: "soon" },
            { icon: <Icon icon="tabler:brand-youtube" width={16} height={16} />, label: "YouTube Community", status: "soon" },
            { icon: <Icon icon="tabler:brand-bluesky" width={16} height={16} />, label: "Bluesky", status: "soon" },
            { icon: <Icon icon="tabler:brand-substack" width={16} height={16} />, label: "Substack Notes", status: "soon" },
            { icon: <Icon icon="tabler:brand-notion" width={16} height={16} />, label: "Notion", status: "soon" },
            { icon: <Icon icon="tabler:brand-google-drive" width={16} height={16} />, label: "Google Docs", status: "soon" },
            { icon: <Icon icon="tabler:brand-buffer" width={16} height={16} />, label: "Buffer", status: "soon" },
          ].map((p, i) => (
            <div className="platform-pill reveal" key={i}>
              <span className="pp-icon">{p.icon}</span>
              {p.label}
              <span className={`pp-status ${p.status === "live" ? "pp-live" : "pp-soon"}`}>
                {p.status === "live" ? "Live" : "Coming soon"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testi-section">
        <div className="section-label reveal">Social proof</div>
        <h2 className="section-title reveal">Creators are <em>obsessed.</em></h2>
        <div className="testi-grid">
          {[
            { initials: "MR", gradient: "linear-gradient(135deg,#e8ff47,#4ade80)", name: "Maya Rodriguez", handle: "@mayacreates · 45k followers", text: <>I was spending <b>3 hours every week</b> manually rewriting my newsletter for each platform. RepurposeOne cut that to 10 minutes. I can&apos;t believe I waited this long.</> },
            { initials: "JK", gradient: "linear-gradient(135deg,#60a5fa,#a78bfa)", name: "James Kim", handle: "@jamesbuilds · 28k followers", text: <>The LinkedIn posts it generates <b>feel like I actually wrote them</b>. Not AI slop. Real, human, punchy. My engagement went up 3x in the first month.</> },
            { initials: "SL", gradient: "linear-gradient(135deg,#fb923c,#f43f5e)", name: "Sara Linton", handle: "@saralinton · 91k followers", text: <>The direct publish button is <b>genuinely game-changing</b>. I repurpose, tweak for 60 seconds, hit Post — and I&apos;m done. This should cost 10x more than it does.</> },
          ].map((t, i) => (
            <div className="testi-card reveal" key={i}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">&ldquo;{t.text}&rdquo;</div>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: t.gradient }}>{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-handle">{t.handle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <div className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <div className="section-label reveal" style={{ justifyContent: "center" }}>Pricing</div>
          <h2 className="section-title reveal" style={{ margin: "0 auto", textAlign: "center" }}>
            Simple pricing.<br /><em>Cancel anytime.</em>
          </h2>

          {/* Billing toggle */}
          <div className="pricing-toggle">
            <div className="billing-pill">
              <button
                className={`billing-opt${!annual ? " active" : ""}`}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`billing-opt${annual ? " active" : ""}`}
                onClick={() => setAnnual(true)}
              >
                Annual <span className="toggle-save">2 months free</span>
              </button>
            </div>
          </div>

          <div className="pricing-grid">
            {/* FREE */}
            <div className="pricing-card reveal">
              <div className="pricing-name">Free</div>
              <div className="pricing-price"><sup>$</sup>0</div>
              <div className="pricing-period">forever, no card required</div>
              <p className="pricing-tagline">Get a feel for RepurposeOne. No commitment.</p>
              <ul className="pricing-features">
                <li><span className="chk"><Check size={14} /></span>15 repurposes / month</li>
                <li><span className="chk"><Check size={14} /></span>3 platforms per run</li>
                <li><span className="chk"><Check size={14} /></span>3 tones (Professional, Casual, Bold)</li>
                <li><span className="chk"><Check size={14} /></span>7-day history</li>
                <li className="off"><span className="chk"><Minus size={14} /></span>Direct publishing</li>
                <li className="off"><span className="chk"><Minus size={14} /></span>Scheduling</li>
                <li className="off"><span className="chk"><Minus size={14} /></span>Analytics</li>
                <li className="off"><span className="chk"><Minus size={14} /></span>Brand voices</li>
              </ul>
              <Link href="/sign-up"><button className="btn-pricing">Get started free</button></Link>
            </div>

            {/* CREATOR */}
            <div className="pricing-card featured reveal">
              <div className="pricing-name">Creator</div>
              <div className="pricing-price">
                <span className={`price-strike${annual ? " visible" : ""}`} aria-hidden={!annual}>
                  <sup>$</sup>19
                </span>
                <span className="price-current">
                  <sup>$</sup>{annual ? "15" : "19"}
                </span>
              </div>
              <div className="pricing-period">
                {annual ? "per month, billed $180/yr" : "per month, billed monthly"}
              </div>
              <p className="pricing-tagline">Everything a solo creator needs to publish everywhere.</p>
              <ul className="pricing-features">
                <li><span className="chk"><Check size={14} /></span>150 repurposes / month</li>
                <li><span className="chk"><Check size={14} /></span>All platforms</li>
                <li><span className="chk"><Check size={14} /></span>All 6 tones</li>
                <li><span className="chk"><Check size={14} /></span>90-day history</li>
                <li><span className="chk"><Check size={14} /></span>1 brand voice</li>
                <li><span className="chk"><Check size={14} /></span>Direct publishing <span className="coming-soon-chip">Soon</span></li>
                <li><span className="chk"><Check size={14} /></span>Scheduling — 30 posts queued <span className="coming-soon-chip">Soon</span></li>
                <li><span className="chk"><Check size={14} /></span>Core analytics</li>
              </ul>
              <Link href="/sign-up">
                <button className="btn-pricing accent">
                  Start Creator {annual ? "· Save $48/yr" : "→"}
                </button>
              </Link>
            </div>

            {/* TEAM */}
            <div className="pricing-card reveal">
              <div className="pricing-name">Team</div>
              <div className="pricing-price">
                <span className={`price-strike${annual ? " visible" : ""}`} aria-hidden={!annual}>
                  <sup>$</sup>49
                </span>
                <span className="price-current">
                  <sup>$</sup>{annual ? "39" : "49"}
                </span>
              </div>
              <div className="pricing-period">
                {annual ? "per month, billed $468/yr" : "per month, up to 5 seats"}
              </div>
              <p className="pricing-tagline">Built for teams who publish at scale.</p>
              <ul className="pricing-features">
                <li><span className="chk"><Check size={14} /></span>500 repurposes / month (pooled)</li>
                <li><span className="chk"><Check size={14} /></span>5 seats</li>
                <li><span className="chk"><Check size={14} /></span>All platforms + all tones</li>
                <li><span className="chk"><Check size={14} /></span>1-year history</li>
                <li><span className="chk"><Check size={14} /></span>5 brand voices</li>
                <li><span className="chk"><Check size={14} /></span>Advanced analytics</li>
                <li><span className="chk"><Check size={14} /></span>API access (500 calls/mo)</li>
                <li><span className="chk"><Check size={14} /></span>Live chat support · 4h response</li>
              </ul>
              <Link href="/sign-up">
                <button className="btn-pricing">
                  Start Team {annual ? "· Save $120/yr" : "→"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-big" id="ctaBig" style={{ opacity: 0 }}>
          Stop rewriting.<br />Start <em>publishing.</em>
        </h2>
        <p className="cta-sub reveal">Join 12,400 creators saving 8 hours every week.</p>
        <div className="cta-actions reveal">
          <div className="mag-wrap">
            <button className="btn-primary-lg" data-cursor="Let's go" onClick={() => router.push("/sign-up")}>
              <div className="btn-inner"><Layers size={16} /> Start free — no card needed</div>
            </button>
          </div>
          <button className="btn-secondary-lg" onClick={() => router.push("/dashboard")}><Monitor size={16} /> See the dashboard</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Repurpose<span>One</span></div>
        <div className="footer-links">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Blog</a>
          <a href="#">Changelog</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
        <div className="footer-copy">© 2026 RepurposeOne. Built for creators.</div>
      </footer>
    </div>
  );
}
