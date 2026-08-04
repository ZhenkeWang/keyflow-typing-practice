"use client";

import { motion, useReducedMotion } from "framer-motion";
import KeyboardShowcase from "./KeyboardShowcase";

const easing = [.16, 1, .3, 1];

function ThemeControl({ value, resolvedTheme, onChange }) {
  return (
    <div className="neural-theme" role="group" aria-label="主题模式">
      {[{ id: "auto", label: `自动 · ${resolvedTheme === "light" ? "日" : "夜"}` }, { id: "light", label: "浅色" }, { id: "dark", label: "深色" }].map((item) => (
        <button
          type="button"
          key={item.id}
          className={value === item.id ? "active" : ""}
          onClick={(event) => { event.stopPropagation(); onChange(item.id); }}
          aria-pressed={value === item.id}
        >
          {value === item.id && <motion.i layoutId="neural-theme-track" transition={{ type: "spring", stiffness: 240, damping: 28 }} />}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.1, delay, ease: easing }}
    >{children}</motion.div>
  );
}

export default function LandingHero({ ready, leaving, themePreference, resolvedTheme, onThemeChange, onEnter }) {
  const reduceMotion = useReducedMotion();
  return (
    <main className={`neural-entry ${ready ? "is-ready" : ""} ${leaving ? "is-leaving" : ""}`}>
      <div className="neural-mesh" aria-hidden="true"><i /><i /><i /></div>

      <nav className="neural-nav">
        <a href="#" onClick={(event) => event.preventDefault()} className="neural-brand" aria-label="KeyFlow 首页">
          <span><i /><i /><i /></span>
          <div><strong>KeyFlow</strong><small>NEURAL TYPE SYSTEM</small></div>
        </a>
        <div className="neural-nav-status"><i /> PERSONAL ENGINE READY</div>
        <ThemeControl value={themePreference} resolvedTheme={resolvedTheme} onChange={onThemeChange} />
      </nav>

      <section className="neural-hero">
        <div className="neural-copy">
          <Reveal delay={.05} className="neural-kicker"><span>01</span><i /> AI-ADAPTIVE KEYBOARD TRAINING</Reveal>
          <h1 aria-label="Your thoughts, at typing speed">
            <motion.span initial={reduceMotion ? false : { y: "110%" }} animate={ready ? { y: 0 } : { y: "110%" }} transition={{ duration: 1.15, delay: .12, ease: easing }}>Your thoughts,</motion.span>
            <motion.span initial={reduceMotion ? false : { y: "110%" }} animate={ready ? { y: 0 } : { y: "110%" }} transition={{ duration: 1.15, delay: .22, ease: easing }}><em>at typing speed.</em></motion.span>
          </h1>
          <Reveal delay={.42} className="neural-description">
            <p>把每一次击键变成可感知的成长。KeyFlow 根据速度、准确率、节奏与薄弱键，为你编排下一轮训练。</p>
          </Reveal>
          <Reveal delay={.54} className="neural-actions">
            <button type="button" className="neural-primary" onClick={onEnter}><span>开始今日训练</span><i>↗</i></button>
            <button type="button" className="neural-quiet" onClick={onEnter}><kbd>Enter</kbd><span>无需设置，直接输入</span></button>
          </Reveal>
        </div>

        <Reveal delay={.3} className="neural-device">
          <div className="neural-device-head"><span><i /> LIVE INPUT MODEL</span><small>移动光标感受键程</small></div>
          <KeyboardShowcase onEnter={onEnter} />
          <div className="neural-device-readout">
            <div><span>FOCUS</span><strong>Adaptive</strong></div>
            <div><span>LATENCY</span><strong>&lt; 8ms</strong></div>
            <div><span>PRIVACY</span><strong>Local first</strong></div>
          </div>
        </Reveal>
      </section>

      <Reveal delay={.76} className="neural-capabilities">
        <article><span>01</span><div><strong>Measure</strong><small>实时捕捉速度、节奏与错误模式</small></div><i>WPM</i></article>
        <article><span>02</span><div><strong>Understand</strong><small>解释为什么变慢，而不只显示分数</small></div><i>AI</i></article>
        <article><span>03</span><div><strong>Improve</strong><small>把弱点转化为下一轮短训练</small></div><i>XP</i></article>
      </Reveal>
    </main>
  );
}
