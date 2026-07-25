"use client";

import { motion } from "framer-motion";
import KeyboardShowcase from "./KeyboardShowcase";
import MotionButton from "./ui/MotionButton";

const HERO_METRICS = [
  { value: "120", suffix: "WPM", label: "Peak typing speed" },
  { value: "99.8", suffix: "%", label: "Average accuracy" },
  { value: "10M+", suffix: "", label: "Keystrokes practiced" },
];

const reveal = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay, duration: .85, ease: [.16, 1, .3, 1] },
  }),
};

function ThemeControl({ value, onChange }) {
  return (
    <div className="hero-theme-control" aria-label="主题模式">
      {[["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]].map(([id, label]) => (
        <button
          key={id}
          className={value === id ? "active" : ""}
          type="button"
          onClick={(event) => { event.stopPropagation(); onChange(id); }}
          aria-pressed={value === id}
        >
          {value === id && <motion.i layoutId="landing-theme-pill" transition={{ type: "spring", stiffness: 360, damping: 30 }} />}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function LandingHero({ ready, leaving, themePreference, onThemeChange, onEnter }) {
  return (
    <section className={`saas-landing apple-landing ${ready ? "is-ready" : ""} ${leaving ? "is-leaving" : ""}`}>
      <nav className="hero-nav">
        <a className="hero-brand" href="#" onClick={(event) => event.preventDefault()} aria-label="KeyFlow 首页">
          <i aria-hidden="true">K</i><span>KeyFlow</span>
        </a>
        <div className="hero-nav-right">
          <span className="hero-phase"><i /> Precision training</span>
          <ThemeControl value={themePreference} onChange={onThemeChange} />
        </div>
      </nav>

      <div className="apple-hero">
        <motion.div className="apple-eyebrow" variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.08}>
          BUILT FOR YOUR FLOW
        </motion.div>
        <motion.h1 variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.14}>KeyFlow</motion.h1>
        <motion.h2 variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.22}>
          Type faster.<br />Think clearer.
        </motion.h2>
        <motion.p variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.3}>
          Master your keyboard.<br />Flow with every keystroke.
        </motion.p>
        <motion.div className="apple-hero-action" variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.38}>
          <MotionButton className="hero-primary" onClick={onEnter}>
            Start Training <span>→</span>
          </MotionButton>
          <span className="hero-shortcut"><kbd>Enter</kbd> Press to begin</span>
        </motion.div>
        <KeyboardShowcase />
      </div>

      <motion.div className="hero-metrics" variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.68}>
        {HERO_METRICS.map((item) => (
          <div key={item.label}>
            <strong>{item.value}<small>{item.suffix}</small></strong>
            <span>{item.label}</span>
          </div>
        ))}
        <p>Accuracy first. Speed follows.</p>
      </motion.div>
    </section>
  );
}
