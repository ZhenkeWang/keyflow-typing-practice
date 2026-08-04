"use client";

import { motion } from "framer-motion";
import KeyboardShowcase from "./KeyboardShowcase";
import MotionButton from "./ui/MotionButton";
import AnimatedHeadline from "../animations/AnimatedHeadline";
import CountUp from "../animations/CountUp";
import BrandMark from "./BrandMark";

const HERO_METRICS = [
  { value: 120, suffix: " WPM", label: "Peak typing speed" },
  { value: 99.8, decimals: 1, suffix: "%", label: "Average accuracy" },
  { value: 10, suffix: "M+", label: "Keystrokes practiced" },
];

const FLOW_STEPS = [
  { index: "01", title: "Choose your flow", detail: "速度、精准、节奏或代码" },
  { index: "02", title: "Feel every key", detail: "即时反馈保持沉浸" },
  { index: "03", title: "Grow with purpose", detail: "任务与经验持续推进" },
];

const reveal = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay, duration: 1.05, ease: [.16, 1, .3, 1] },
  }),
};

function ThemeControl({ value, resolvedTheme, onChange }) {
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
          <span>{id === "auto" ? `Auto · ${resolvedTheme === "light" ? "Light" : "Dark"}` : label}</span>
        </button>
      ))}
    </div>
  );
}

export default function LandingHero({ ready, leaving, themePreference, resolvedTheme, onThemeChange, onEnter }) {
  return (
    <section className={`saas-landing apple-landing ${ready ? "is-ready" : ""} ${leaving ? "is-leaving" : ""}`}>
      <nav className="hero-nav">
        <a className="hero-brand" href="#" onClick={(event) => event.preventDefault()} aria-label="KeyFlow 首页">
          <BrandMark compact animate={ready} /><span>KeyFlow</span>
        </a>
        <div className="hero-nav-right">
          <span className="hero-phase"><i /> Precision training</span>
          <ThemeControl value={themePreference} resolvedTheme={resolvedTheme} onChange={onThemeChange} />
        </div>
      </nav>

      <div className="apple-hero">
        <div className="flow-hero-copy">
          <motion.div className="apple-eyebrow" variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.08}>
            YOUR KEYBOARD · YOUR RHYTHM
          </motion.div>
          <motion.h1 variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.14}>KeyFlow</motion.h1>
          <motion.h2 variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.22}>
            <AnimatedHeadline active={ready && !leaving} />
          </motion.h2>
          <motion.p variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.3}>
            不只是测试速度，而是找到更轻、更稳、更属于你的输入节奏。
          </motion.p>
          <motion.div className="apple-hero-action" variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.38}>
            <MotionButton className="hero-primary" onClick={onEnter}>
              Enter your flow <span>→</span>
            </MotionButton>
            <span className="hero-shortcut"><kbd>Enter</kbd> 或轻触键盘开始</span>
          </motion.div>
        </div>
        <div className="flow-hero-visual">
          <KeyboardShowcase onEnter={onEnter} />
          <motion.div className="hero-flow-steps" variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.58}>
            {FLOW_STEPS.map((step) => (
              <div key={step.index}><span>{step.index}</span><strong>{step.title}</strong><small>{step.detail}</small></div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div className="hero-metrics" variants={reveal} initial="hidden" animate={ready ? "visible" : "hidden"} custom={.76}>
        {HERO_METRICS.map((item) => (
          <div key={item.label}>
            <strong><CountUp value={item.value} decimals={item.decimals} suffix={item.suffix} /></strong>
            <span>{item.label}</span>
          </div>
        ))}
        <p>Accuracy first. Speed follows.</p>
      </motion.div>
    </section>
  );
}
