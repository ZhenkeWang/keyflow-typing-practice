"use client";

import { motion, useReducedMotion } from "framer-motion";
import KeyboardShowcase from "./KeyboardShowcase";

const ease = [.22, 1, .36, 1];

function ThemeDial({ value, resolvedTheme, onChange }) {
  return (
    <div className="atelier-theme" aria-label="主题模式">
      {["auto", "light", "dark"].map((id) => (
        <button
          type="button"
          key={id}
          className={value === id ? "active" : ""}
          onClick={(event) => { event.stopPropagation(); onChange(id); }}
          aria-pressed={value === id}
        >
          {value === id && <motion.i layoutId="atelier-theme-cursor" transition={{ type: "spring", stiffness: 280, damping: 30 }} />}
          <span>{id === "auto" ? `A · ${resolvedTheme === "light" ? "L" : "D"}` : id[0].toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

function SplitLine({ children, delay, ready }) {
  const reduceMotion = useReducedMotion();
  return (
    <span className="atelier-line-mask">
      <motion.span
        initial={reduceMotion ? false : { y: "112%", rotate: 1.5 }}
        animate={ready ? { y: 0, rotate: 0 } : { y: "112%" }}
        transition={{ duration: 1.05, delay, ease }}
      >{children}</motion.span>
    </span>
  );
}

export default function LandingHero({ ready, leaving, themePreference, resolvedTheme, onThemeChange, onEnter }) {
  const reduceMotion = useReducedMotion();
  const fade = (delay, y = 18) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0 },
    transition: { duration: .9, delay, ease },
  });

  return (
    <main className={`type-atelier ${ready ? "is-ready" : ""} ${leaving ? "is-leaving" : ""}`}>
      <div className="atelier-grid" aria-hidden="true" />

      <nav className="atelier-nav">
        <a href="#" className="atelier-brand" onClick={(event) => event.preventDefault()} aria-label="KeyFlow 首页">
          <span className="atelier-brand-key">K</span>
          <span><strong>KEYFLOW</strong><small>TYPE ATELIER / 2026</small></span>
        </a>
        <div className="atelier-nav-center"><span>TRAIN YOUR HANDS</span><i /><span>FREE YOUR THOUGHTS</span></div>
        <ThemeDial value={themePreference} resolvedTheme={resolvedTheme} onChange={onThemeChange} />
      </nav>

      <section className="atelier-hero">
        <div className="atelier-copy">
          <motion.div className="atelier-index" {...fade(.08)}><span>01</span><i /><span>THE PRACTICE DESK</span></motion.div>
          <h1 aria-label="Type less force. Think more flow.">
            <SplitLine ready={ready} delay={.12}>TYPE LESS FORCE.</SplitLine>
            <SplitLine ready={ready} delay={.2}><em>THINK MORE FLOW.</em></SplitLine>
          </h1>
          <motion.p {...fade(.38)}>
            键盘不是速度计，而是思考的延伸。选择一组短练习，建立更轻、更准、更持久的输入手感。
          </motion.p>
          <motion.div className="atelier-action-row" {...fade(.48)}>
            <button type="button" className="atelier-start" onClick={onEnter}>
              <span>开始一轮 60 秒练习</span><kbd>↵</kbd>
            </button>
            <div><strong>12</strong><small>种训练路径</small></div>
            <div><strong>01</strong><small>个清晰目标</small></div>
          </motion.div>
        </div>

        <motion.div className="atelier-object" {...fade(.25, 32)}>
          <div className="atelier-object-head">
            <span><i /> INPUT DEVICE / LIVE</span>
            <small>把鼠标移到任意键帽</small>
          </div>
          <KeyboardShowcase onEnter={onEnter} />
        </motion.div>
      </section>

      <motion.section className="atelier-footer-rail" {...fade(.7)}>
        <div><span>DAILY FORMAT</span><strong>Warm-up → Focus → Reward</strong></div>
        <div><span>INPUT FEEDBACK</span><strong>Character / Keycap / Rhythm</strong></div>
        <div><span>YOUR DATA</span><strong>Stored locally by default</strong></div>
        <button type="button" onClick={onEnter}><i>PRESS</i><strong>ENTER</strong></button>
      </motion.section>
    </main>
  );
}
