import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("sr-in")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function About() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e) => {
      setMouseX(e.clientX / window.innerWidth - 0.5);
      setMouseY(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  const foods = [
    { e: "🍕", x: "7%",  y: "14%", s: 0.07, dur: 6 },
    { e: "🍔", x: "87%", y: "10%", s: 0.09, dur: 7 },
    { e: "🌮", x: "18%", y: "58%", s: 0.05, dur: 8 },
    { e: "🍜", x: "78%", y: "48%", s: 0.08, dur: 6.5 },
    { e: "🍛", x: "55%", y: "72%", s: 0.06, dur: 9 },
    { e: "🍩", x: "4%",  y: "80%", s: 0.07, dur: 7.5 },
    { e: "🥗", x: "91%", y: "68%", s: 0.05, dur: 8.5 },
    { e: "🧁", x: "62%", y: "22%", s: 0.06, dur: 7 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; background: #08070a; }

        .root {
          font-family: 'Inter', sans-serif;
          color: #f0edf8;
          background: #08070a;
          overflow-x: hidden;
        }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: rgba(8,7,10,0.82);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-logo {
          font-family: 'Sora', sans-serif;
          font-size: 1.3rem; font-weight: 800;
          color: #f0edf8; letter-spacing: -0.03em;
        }
        .nav-logo span { color: #f97316; }
        .nav-links { display: flex; gap: 32px; }
        .nav-links a {
          font-size: 0.87rem; font-weight: 500;
          color: rgba(240,237,248,0.5); text-decoration: none; transition: color 0.2s;
        }
        .nav-links a:hover { color: #f0edf8; }
        .nav-btns { display: flex; gap: 10px; }
        .btn-nav-ghost {
          padding: 9px 22px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12); background: transparent;
          font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600;
          color: rgba(240,237,248,0.65); cursor: pointer; transition: all 0.2s;
        }
        .btn-nav-ghost:hover { border-color: rgba(249,115,22,0.5); color: #f97316; }
        .btn-nav-fill {
          padding: 9px 22px; border-radius: 10px; border: none;
          background: #f97316; font-family: 'Inter', sans-serif;
          font-size: 0.85rem; font-weight: 600; color: #fff; cursor: pointer; transition: all 0.2s;
        }
        .btn-nav-fill:hover { background: #ea6c0e; transform: translateY(-1px); }

        .hero {
          position: relative; min-height: 100svh;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          background: radial-gradient(ellipse 70% 55% at 50% -5%, #1f0e02 0%, #08070a 65%);
        }
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%);
        }
        .food-p {
          position: absolute; font-size: 1.8rem;
          pointer-events: none; user-select: none;
          animation: fBob var(--dur) ease-in-out infinite var(--del);
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
        }
        @keyframes fBob {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50%      { transform: translateY(-20px) rotate(5deg); }
        }
        .hero-content {
          position: relative; z-index: 10;
          text-align: center; padding: 0 24px; max-width: 860px;
          animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:none; }
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(249,115,22,0.12);
          border: 1px solid rgba(249,115,22,0.25);
          border-radius: 100px; padding: 5px 16px;
          font-size: 0.75rem; font-weight: 600;
          color: #fb923c; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 28px;
        }
        .tag-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #f97316;
          animation: blink 1.4s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .hero-h1 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.8rem, 7vw, 6.2rem);
          font-weight: 800; line-height: 1.05;
          letter-spacing: -0.04em; color: #f0edf8; margin-bottom: 24px;
        }
        .hero-h1 em { font-style: normal; color: #f97316; }
        .hero-h1 .ghost {
          -webkit-text-stroke: 1.5px rgba(240,237,248,0.18); color: transparent;
        }
        .hero-p {
          font-size: clamp(1rem, 1.8vw, 1.15rem);
          color: rgba(240,237,248,0.45); line-height: 1.75;
          max-width: 520px; margin: 0 auto 48px;
        }
        .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 36px; border-radius: 12px; border: none;
          background: #f97316; font-family: 'Inter', sans-serif;
          font-size: 1rem; font-weight: 600; color: #fff; cursor: pointer;
          transition: all 0.25s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 6px 28px rgba(249,115,22,0.35);
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(249,115,22,0.45); }
        .btn-primary:active { transform: scale(0.97); }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 36px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 600;
          color: rgba(240,237,248,0.6); cursor: pointer; transition: all 0.25s;
        }
        .btn-ghost:hover { border-color: rgba(249,115,22,0.3); color: #f0edf8; background: rgba(249,115,22,0.06); }

        .stats-bar {
          display: flex; justify-content: center;
          margin-top: 72px; animation: fadeUp 0.9s 0.2s both;
        }
        .stat-item {
          padding: 20px 44px; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .stat-item:last-child { border-right: none; }
        .stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 1.9rem; font-weight: 800; color: #f97316; line-height: 1;
        }
        .stat-lbl {
          font-size: 0.72rem; font-weight: 500;
          color: rgba(240,237,248,0.3);
          letter-spacing: 0.1em; text-transform: uppercase; margin-top: 5px;
        }
        .scroll-hint {
          position: absolute; bottom: 32px;
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          color: rgba(240,237,248,0.2); font-size: 0.68rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          animation: fadeUp 0.9s 0.5s both;
        }
        .sm-body { width: 22px; height: 34px; border-radius: 11px; border: 1.5px solid rgba(255,255,255,0.15); position: relative; }
        .sm-wheel {
          position: absolute; left: 50%; top: 5px;
          transform: translateX(-50%);
          width: 3px; height: 7px; border-radius: 2px; background: #f97316; opacity: 0.7;
          animation: wheel 1.7s ease-in-out infinite;
        }
        @keyframes wheel {
          0%  { opacity:0.7; transform:translateX(-50%) translateY(0); }
          75% { opacity:0; transform:translateX(-50%) translateY(14px); }
          100%{ opacity:0; transform:translateX(-50%) translateY(14px); }
        }

        .sr { opacity:0; transform:translateY(32px); transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1); }
        .sr.sr-in { opacity:1; transform:none; }
        .sr-d1 { transition-delay:0.08s; }
        .sr-d2 { transition-delay:0.16s; }
        .sr-d3 { transition-delay:0.24s; }

        .section { padding: 100px 48px; max-width: 1120px; margin: 0 auto; }
        .eyebrow {
          display: inline-block; font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase; color: #f97316; margin-bottom: 14px;
        }
        .sec-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800;
          line-height: 1.15; letter-spacing: -0.03em; color: #f0edf8;
        }
        .sec-title .dim { color: rgba(240,237,248,0.22); }
        .sec-sub { font-size: 1rem; color: rgba(240,237,248,0.4); line-height: 1.7; margin-top: 14px; max-width: 480px; }

        .strip-wrap {
          overflow: hidden;
          background: linear-gradient(180deg, rgba(249,115,22,0.04) 0%, transparent 100%);
          border-top: 1px solid rgba(249,115,22,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding: 24px 0;
        }
        .strip-track {
          display: flex; gap: 16px;
          animation: stripAnim 28s linear infinite; width: max-content;
        }
        .strip-track:hover { animation-play-state: paused; }
        @keyframes stripAnim { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .strip-chip {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px; padding: 11px 22px;
          white-space: nowrap; font-size: 0.88rem;
          color: rgba(240,237,248,0.55); transition: background 0.2s, border-color 0.2s;
        }
        .strip-chip:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.2); color: #f0edf8; }
        .strip-chip span { font-size: 1.2rem; }

        .roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 56px; }
        .role-card {
          position: relative; overflow: hidden; border-radius: 20px; padding: 36px 30px;
          border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.025);
          transition: transform 0.3s cubic-bezier(.22,1,.36,1), border-color 0.3s, background 0.3s;
          cursor: pointer;
        }
        .role-card::after {
          content: ''; position: absolute; inset: 0; border-radius: 20px;
          background: var(--glow); opacity: 0; transition: opacity 0.35s; pointer-events: none;
        }
        .role-card:hover { transform: translateY(-8px); }
        .role-card:hover::after { opacity: 1; }
        .rc-user  { --glow: radial-gradient(circle at 30% 20%, rgba(99,102,241,0.1) 0%, transparent 65%); }
        .rc-admin { --glow: radial-gradient(circle at 30% 20%, rgba(249,115,22,0.1)  0%, transparent 65%); }
        .rc-rider { --glow: radial-gradient(circle at 30% 20%, rgba(34,197,94,0.1)   0%, transparent 65%); }
        .rc-user:hover  { border-color: rgba(99,102,241,0.35); background: rgba(99,102,241,0.04); }
        .rc-admin:hover { border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.04); }
        .rc-rider:hover { border-color: rgba(34,197,94,0.35);  background: rgba(34,197,94,0.04); }

        .role-icon {
          width: 54px; height: 54px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; margin-bottom: 22px;
        }
        .ri-u { background: rgba(99,102,241,0.15); }
        .ri-a { background: rgba(249,115,22,0.15); }
        .ri-r { background: rgba(34,197,94,0.15); }
        .role-badge {
          display: inline-block; font-size: 0.67rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 3px 10px; border-radius: 100px; margin-bottom: 12px;
        }
        .rb-u { background: rgba(99,102,241,0.15);  color: #a5b4fc; }
        .rb-a { background: rgba(249,115,22,0.15);  color: #fdba74; }
        .rb-r { background: rgba(34,197,94,0.15);   color: #86efac; }
        .role-name { font-family: 'Sora', sans-serif; font-size: 1.3rem; font-weight: 700; color: #f0edf8; margin-bottom: 10px; }
        .role-desc { font-size: 0.875rem; color: rgba(240,237,248,0.4); line-height: 1.7; margin-bottom: 24px; }
        .role-perks { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
        .role-perks li { display: flex; align-items: center; gap: 9px; font-size: 0.82rem; color: rgba(240,237,248,0.5); }
        .pd { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .pd-u { background: #818cf8; }
        .pd-a { background: #f97316; }
        .pd-r { background: #22c55e; }
        .btn-role {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 12px; border-radius: 10px; border: none;
          font-family: 'Inter', sans-serif; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .br-u { background: rgba(99,102,241,0.15); color: #a5b4fc; }
        .br-u:hover { background: rgba(99,102,241,0.28); }
        .br-a { background: rgba(249,115,22,0.15); color: #fdba74; }
        .br-a:hover { background: rgba(249,115,22,0.28); }
        .br-r { background: rgba(34,197,94,0.15); color: #86efac; }
        .br-r:hover { background: rgba(34,197,94,0.28); }

        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
          border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06); margin-top: 56px;
        }
        .feat-tile {
          padding: 32px 28px; background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.25s;
        }
        .feat-tile:hover { background: rgba(249,115,22,0.05); }
        .feat-tile:nth-child(3n) { border-right: none; }
        .feat-icon { font-size: 1.6rem; margin-bottom: 14px; display: block; filter: drop-shadow(0 2px 4px rgba(249,115,22,0.2)); }
        .feat-name { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #f0edf8; margin-bottom: 7px; }
        .feat-text { font-size: 0.82rem; color: rgba(240,237,248,0.38); line-height: 1.65; }

        .div { height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent 100%); margin: 0 48px; }

        .footer-cta {
          padding: 120px 48px 80px; text-align: center;
          background: radial-gradient(ellipse 55% 45% at 50% 100%, rgba(31,14,2,0.9) 0%, transparent 70%);
        }
        .fcta-title { font-family: 'Sora', sans-serif; font-size: clamp(2rem, 5vw, 3.8rem); font-weight: 800; letter-spacing: -0.04em; color: #f0edf8; margin-bottom: 14px; }
        .fcta-sub { font-size: 1rem; color: rgba(240,237,248,0.38); margin-bottom: 44px; }
        .fcta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .footer-copy { margin-top: 80px; font-size: 0.72rem; color: rgba(240,237,248,0.18); letter-spacing: 0.08em; }

        @media (max-width: 900px) {
          .roles-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .nav { padding: 16px 24px; }
          .nav-links { display: none; }
          .section { padding: 80px 24px; }
          .stat-item { padding: 16px 20px; }
          .footer-cta { padding: 80px 24px 60px; }
          .div { margin: 0 24px; }
        }
      `}</style>

      <div className="root">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">Bean<span>Verse</span></div>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#roles">Roles</a>
            <a href="#features">Features</a>
          </div>
          <div className="nav-btns">
            <button className="btn-nav-ghost" onClick={() => navigate("/signin")}>Sign In</button>
            <button className="btn-nav-fill" onClick={() => navigate("/signup")}>Get Started</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-grid" />

          {foods.map((f, i) => (
            <span key={i} className="food-p" style={{
              left: f.x, top: f.y,
              "--dur": `${f.dur}s`,
              "--del": `${i * 0.4}s`,
              transform: `translate(${mouseX * f.s * 60}px, ${mouseY * f.s * 60 + scrollY * f.s * 0.35}px)`,
              opacity: Math.max(0, 0.85 - scrollY / 450),
            }}>{f.e}</span>
          ))}

          <div className="hero-content">
            <div className="hero-tag">
              <div className="tag-dot" />
              Pakistan's Food Marketplace
            </div>

            <h1 className="hero-h1">
              Order Food,<br />
              <em>Earn Money,</em><br />
              <span className="ghost">Manage All</span>
            </h1>

            <p className="hero-p">
              BeanVerse connects hungry customers, top restaurants, and delivery riders — all on one powerful platform built for Pakistan.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/signup")}>
                Start Ordering Free →
              </button>
              <button className="btn-ghost" onClick={() => navigate("/signin")}>
                Already have an account
              </button>
            </div>

            <div className="stats-bar">
              {[
                { n: "50+",  l: "Restaurants" },
                { n: "1K+",  l: "Daily Orders" },
                { n: "3",    l: "Roles & Portals" },
                { n: "24/7", l: "Support" },
              ].map((s, i) => (
                <div key={i} className="stat-item">
                  <div className="stat-num">{s.n}</div>
                  <div className="stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-hint">
            <div className="sm-body"><div className="sm-wheel" /></div>
            <span>Scroll</span>
          </div>
        </section>

        {/* SCROLLING HOW IT WORKS STRIP */}
        <div className="strip-wrap" id="how">
          <div className="strip-track" aria-hidden="true">
            {[...Array(2)].map((_, p) =>
              [
                { e: "🛒", t: "Browse & Order"   }, { e: "🍽️", t: "Fresh Preparation" },
                { e: "🛵", t: "Fast Delivery"     }, { e: "📍", t: "Live Tracking"     },
                { e: "💳", t: "Secure Payment"    }, { e: "⭐", t: "Rate & Review"     },
                { e: "📊", t: "Admin Dashboard"   }, { e: "💰", t: "Rider Earnings"    },
                { e: "🔔", t: "Real-time Alerts"  }, { e: "🧾", t: "Order History"     },
              ].map((c, i) => (
                <div key={`${p}-${i}`} className="strip-chip"><span>{c.e}</span>{c.t}</div>
              ))
            )}
          </div>
        </div>

        <div className="div" />

        {/* ROLES */}
        <section className="section" id="roles">
          <div className="sr">
            <span className="eyebrow">Three Portals, One Platform</span>
            <h2 className="sec-title">
              Choose your role<br />
              <span className="dim">and get started</span>
            </h2>
            <p className="sec-sub">
              Whether you're hungry, running a restaurant, or riding for deliveries — BeanVerse has a dedicated portal for you.
            </p>
          </div>

          <div className="roles-grid">

            {/* CUSTOMER */}
            <div className="role-card rc-user sr sr-d1" onClick={() => navigate("/signup")}>
              <div className="role-icon ri-u">👤</div>
              <span className="role-badge rb-u">Customer</span>
              <div className="role-name">Order & Enjoy</div>
              <p className="role-desc">Browse hundreds of dishes from top local restaurants. Track your order live and enjoy fast delivery to your door.</p>
              <ul className="role-perks">
                {["Browse menus & restaurants", "Real-time order tracking", "Exclusive deals & loyalty points", "Multiple payment options"].map((p, i) => (
                  <li key={i}><span className="pd pd-u" />{p}</li>
                ))}
              </ul>
              <button className="btn-role br-u">Sign up as Customer →</button>
            </div>

            {/* ADMIN */}
            <div className="role-card rc-admin sr sr-d2" onClick={() => navigate("/signup")}>
              <div className="role-icon ri-a">🏪</div>
              <span className="role-badge rb-a">Restaurant Admin</span>
              <div className="role-name">Manage & Grow</div>
              <p className="role-desc">List your restaurant, manage your menu, track incoming orders, and grow your business with powerful analytics.</p>
              <ul className="role-perks">
                {["Full menu management", "Live order dashboard", "Revenue analytics & reports", "Customer reviews & insights"].map((p, i) => (
                  <li key={i}><span className="pd pd-a" />{p}</li>
                ))}
              </ul>
              <button className="btn-role br-a">Register Restaurant →</button>
            </div>

            {/* RIDER */}
            <div className="role-card rc-rider sr sr-d3" onClick={() => navigate("/signup")}>
              <div className="role-icon ri-r">🛵</div>
              <span className="role-badge rb-r">Delivery Rider</span>
              <div className="role-name">Ride & Earn</div>
              <p className="role-desc">Accept delivery requests in your area, navigate with GPS, and earn flexible income on your own schedule.</p>
              <ul className="role-perks">
                {["Flexible working hours", "Instant order notifications", "Earnings tracker & payouts", "GPS-powered navigation"].map((p, i) => (
                  <li key={i}><span className="pd pd-r" />{p}</li>
                ))}
              </ul>
              <button className="btn-role br-r">Join as Rider →</button>
            </div>

          </div>
        </section>

        <div className="div" />

        {/* FEATURES */}
        <section className="section" id="features">
          <div className="sr">
            <span className="eyebrow">Platform Features</span>
            <h2 className="sec-title">
              Built for everyone<br />
              <span className="dim">who loves food</span>
            </h2>
          </div>
          <div className="features-grid">
            {[
              { e: "⚡", n: "Fast Delivery",      t: "Average delivery time under 30 minutes across the city." },
              { e: "🗺️", n: "Live Tracking",      t: "Watch your rider on a live map from pickup to your door." },
              { e: "🔒", n: "Secure Payments",    t: "Bank-grade encryption on all transactions, always safe." },
              { e: "📊", n: "Smart Analytics",    t: "Admins get full sales dashboards and growth insights." },
              { e: "🔔", n: "Push Notifications", t: "Real-time alerts for orders, status changes, and offers." },
              { e: "⭐", n: "Review System",       t: "Customers can rate food and service after every delivery." },
              { e: "🎁", n: "Deals & Coupons",    t: "Platform-wide promo codes and loyalty reward points." },
              { e: "📱", n: "Mobile Ready",        t: "Fully responsive — works perfectly on any device or screen." },
              { e: "🤝", n: "Multi-Role Access",  t: "Customer, admin, and rider portals under one login system." },
            ].map((f, i) => (
              <div key={i} className={`feat-tile sr sr-d${(i % 3) + 1}`}>
                <span className="feat-icon">{f.e}</span>
                <div className="feat-name">{f.n}</div>
                <p className="feat-text">{f.t}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="div" />

        {/* FOOTER CTA */}
        <section className="footer-cta">
          <div className="sr">
            <h2 className="fcta-title">Ready to join BeanVerse?</h2>
            <p className="fcta-sub">Pick your role and get started in under 2 minutes. It's completely free.</p>
            <div className="fcta-btns">
              <button className="btn-primary" onClick={() => navigate("/signup")}>Create Free Account →</button>
              <button className="btn-ghost"   onClick={() => navigate("/signin")}>Sign In</button>
            </div>
          </div>
          <div className="footer-copy">
            © 2025 BeanVerse · Pakistan's Food Marketplace · Crafted by Nabil
          </div>
        </section>

      </div>
    </>
  );
}
