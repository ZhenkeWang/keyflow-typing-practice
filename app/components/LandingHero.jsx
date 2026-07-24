"use client";

const HERO_METRICS = [
  { value: "12,000+", label: "Training Sessions" },
  { value: "98%", label: "Average Accuracy" },
  { value: "100+", label: "Practice Materials" },
];

const PREVIEW_TEXT = [
  ["Build", "correct"],
  [" ", "correct"],
  ["better", "correct"],
  [" ", "correct"],
  ["typing", "current"],
  [" ", "pending"],
  ["habits", "pending"],
  [" ", "pending"],
  ["with", "pending"],
  [" ", "pending"],
  ["every", "pending"],
  [" ", "pending"],
  ["keystroke.", "pending"],
];

function ThemeControl({ value, onChange }) {
  return (
    <div className="hero-theme-control" aria-label="主题模式">
      {[
        ["auto", "Auto"],
        ["light", "Light"],
        ["dark", "Dark"],
      ].map(([id, label]) => (
        <button
          key={id}
          className={value === id ? "active" : ""}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange(id);
          }}
          aria-pressed={value === id}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function LandingHero({ ready, leaving, themePreference, onThemeChange, onEnter }) {
  return (
    <section className={`saas-landing ${ready ? "is-ready" : ""} ${leaving ? "is-leaving" : ""}`}>
      <nav className="hero-nav">
        <a className="hero-brand" href="#" onClick={(event) => event.preventDefault()}>
          <i aria-hidden="true">K</i>
          <span>KeyFlow</span>
        </a>
        <div className="hero-nav-right">
          <span className="hero-phase"><i /> Adaptive practice · Live</span>
          <ThemeControl value={themePreference} onChange={onThemeChange} />
        </div>
      </nav>

      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-eyebrow"><span>AI-READY TYPING PLATFORM</span><i /></div>
          <h1>
            Master Your
            <span>Typing Speed</span>
          </h1>
          <p>Improve your typing speed with intelligent practice, precise feedback, and a training rhythm built around you.</p>
          <div className="hero-actions">
            <button className="hero-primary" type="button" onClick={onEnter}>
              Start Training <span>↗</span>
            </button>
            <span className="hero-shortcut"><kbd>Enter</kbd> quick start</span>
          </div>
          <div className="hero-trust">
            <span><i>✓</i> No sign-up required</span>
            <span><i>✓</i> Local-first privacy</span>
          </div>
        </div>

        <div className="hero-product-stage" aria-label="KeyFlow 实时训练预览">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-demo-card">
            <div className="hero-demo-top">
              <span><i /> LIVE PRACTICE</span>
              <small>FOCUS · 60 SEC</small>
            </div>
            <div className="hero-demo-stats">
              <div><span>WPM</span><strong>82</strong><small>+12%</small></div>
              <div><span>ACCURACY</span><strong>98<small>%</small></strong><small>Excellent</small></div>
              <div><span>FLOW</span><strong>94<small>%</small></strong><small>Stable</small></div>
            </div>
            <div className="hero-demo-text">
              {PREVIEW_TEXT.map(([word, state], index) => (
                <span className={state} key={`${word}-${index}`}>{word}</span>
              ))}
            </div>
            <div className="hero-demo-progress"><span /></div>
            <div className="hero-demo-footer">
              <span><i /> Analyzing rhythm</span>
              <span>00:42</span>
            </div>
          </div>
          <div className="hero-float-card hero-float-left"><span>↗</span><div><strong>+14 WPM</strong><small>this week</small></div></div>
          <div className="hero-float-card hero-float-right"><span>AI</span><div><strong>Smart drill</strong><small>r / t pattern</small></div></div>
        </div>
      </div>

      <div className="hero-metrics">
        {HERO_METRICS.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
        <p>Designed for developers, students, and lifelong learners.</p>
      </div>
    </section>
  );
}
