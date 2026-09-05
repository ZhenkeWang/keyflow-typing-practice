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
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .5, delay, ease: easing }}
    >{children}</motion.div>
  );
}

export default function LandingHero({ ready, leaving, themePreference, resolvedTheme, onThemeChange, onEnter }) {
  const reduceMotion = useReducedMotion();
  return (
    <main className={`neural-entry ${ready ? "is-ready" : ""} ${leaving ? "is-leaving" : ""}`}>
      <nav className="neural-nav">
        <a href="#" onClick={(event) => event.preventDefault()} className="neural-brand" aria-label="KeyFlow 首页">
          <span><i /><i /><i /></span>
          <div><strong>KeyFlow</strong><small>你的日常打字训练</small></div>
        </a>
        <ThemeControl value={themePreference} resolvedTheme={resolvedTheme} onChange={onThemeChange} />
      </nav>

      <section className="neural-hero">
        <div className="neural-copy">
          <Reveal delay={.05} className="neural-kicker">为专注，留一点时间</Reveal>
          <h1 aria-label="找到节奏，进入心流。">
            <motion.span initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }} transition={{ duration: .6, delay: .12, ease: easing }}>找到节奏。</motion.span>
            <motion.span initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }} transition={{ duration: .6, delay: .22, ease: easing }}><em>进入心流。</em></motion.span>
          </h1>
          <Reveal delay={.42} className="neural-description">
            <p>从一分钟开始，练习速度、准确率与节奏。让每一次轻触，都成为更从容的表达。</p>
          </Reveal>
          <Reveal delay={.54} className="neural-actions">
            <button type="button" className="neural-primary" onClick={onEnter}><span>开始今日训练</span><i>↗</i></button>
            <button type="button" className="neural-quiet" onClick={onEnter}><kbd>Enter</kbd><span>无需设置，直接输入</span></button>
          </Reveal>
        </div>

        <Reveal delay={.3} className="neural-device">
          <div className="neural-device-head"><span><i /> 你的专注空间</span><small>轻触键帽，感受节奏</small></div>
          <KeyboardShowcase onEnter={onEnter} />
          <div className="neural-device-readout">
            <div><span>训练</span><strong>随你的节奏</strong></div>
            <div><span>反馈</span><strong>每一键都清晰</strong></div>
            <div><span>记录</span><strong>成长看得见</strong></div>
          </div>
        </Reveal>
      </section>

      <Reveal delay={.76} className="neural-capabilities">
        <article><span>01</span><div><strong>专注练习</strong><small>多种模式，找到适合你的训练</small></div><i>⌘</i></article>
        <article><span>02</span><div><strong>了解自己</strong><small>从输入数据中发现薄弱环节</small></div><i>↗</i></article>
        <article><span>03</span><div><strong>积累成长</strong><small>任务、经验和成就，记录每一步</small></div><i>✓</i></article>
      </Reveal>
    </main>
  );
}
