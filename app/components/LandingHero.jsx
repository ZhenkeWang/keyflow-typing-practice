"use client";

import { motion, useReducedMotion } from "framer-motion";
import KeyboardShowcase from "./KeyboardShowcase";
import MotionButton from "./ui/MotionButton";
import BrandMark from "./BrandMark";

const ENTRY_BEATS = [
  { key: "01", title: "Choose a mood", detail: "短任务，而不是漫长测试" },
  { key: "02", title: "Follow the pulse", detail: "反馈跟随节奏，不打断思考" },
  { key: "03", title: "Leave stronger", detail: "每轮练习都推进真实成长" },
];

const SIGNALS = [
  { value: "09", label: "practice paths" },
  { value: "LIVE", label: "adaptive feedback" },
  { value: "LOCAL", label: "private progress" },
];

const ease = [.16, 1, .3, 1];

function ThemeControl({ value, resolvedTheme, onChange }) {
  return (
    <div className="portal-theme-control" aria-label="主题模式">
      {[['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([id, label]) => (
        <button
          key={id}
          className={value === id ? "active" : ""}
          type="button"
          onClick={(event) => { event.stopPropagation(); onChange(id); }}
          aria-pressed={value === id}
        >
          {value === id && <motion.i layoutId="portal-theme-pill" transition={{ type: "spring", stiffness: 260, damping: 28, mass: .9 }} />}
          <span>{id === "auto" ? `Auto · ${resolvedTheme === "light" ? "Light" : "Dark"}` : label}</span>
        </button>
      ))}
    </div>
  );
}

function BrandWord({ ready }) {
  const reduceMotion = useReducedMotion();
  return (
    <h1 className="portal-wordmark" aria-label="KeyFlow">
      {"KeyFlow".split("").map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          initial={reduceMotion ? false : { opacity: 0, y: 48, rotateX: -70, filter: "blur(12px)" }}
          animate={ready ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" } : { opacity: 0 }}
          transition={{ delay: .12 + index * .065, duration: 1.15, ease }}
        >{letter}</motion.span>
      ))}
    </h1>
  );
}

export default function LandingHero({ ready, leaving, themePreference, resolvedTheme, onThemeChange, onEnter }) {
  const reduceMotion = useReducedMotion();
  const reveal = (delay) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 26, filter: "blur(10px)" },
    animate: ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0 },
    transition: { delay, duration: 1.05, ease },
  });

  return (
    <section className={`flow-portal ${ready ? "is-ready" : ""} ${leaving ? "is-leaving" : ""}`}>
      <nav className="portal-nav">
        <a className="portal-brand" href="#" onClick={(event) => event.preventDefault()} aria-label="KeyFlow 首页">
          <BrandMark compact animate={ready} />
          <span><strong>KeyFlow</strong><small>typing sanctuary</small></span>
        </a>
        <div className="portal-nav-meta">
          <span className="portal-presence"><i /> Flow space is ready</span>
          <ThemeControl value={themePreference} resolvedTheme={resolvedTheme} onChange={onThemeChange} />
        </div>
      </nav>

      <div className="portal-stage">
        <div className="portal-copy">
          <motion.div className="portal-kicker" {...reveal(.08)}>
            <i /> A softer way to build keyboard skill
          </motion.div>
          <BrandWord ready={ready} />
          <motion.h2 {...reveal(.58)}>让手指进入节奏<br /><span>让思考保持流动</span></motion.h2>
          <motion.p {...reveal(.68)}>
            从一个刚刚好的短任务开始。KeyFlow 会把速度、准确率、节奏与薄弱键，编排成每天都不重复的练习旅程。
          </motion.p>
          <motion.div className="portal-actions" {...reveal(.78)}>
            <MotionButton className="portal-primary" onClick={onEnter}>
              <span>进入训练空间</span><i>↗</i>
            </MotionButton>
            <span className="portal-shortcut"><kbd>Enter</kbd><small>无需设置，立即开始</small></span>
          </motion.div>
          <motion.div className="portal-signals" {...reveal(.9)}>
            {SIGNALS.map((signal) => (
              <div key={signal.label}><strong>{signal.value}</strong><span>{signal.label}</span></div>
            ))}
          </motion.div>
        </div>

        <motion.div className="portal-visual" {...reveal(.38)}>
          <div className="portal-aura" aria-hidden="true"><i /><i /><i /></div>
          <div className="portal-visual-label"><span>LIVE INSTRUMENT</span><small>move across the keys</small></div>
          <KeyboardShowcase onEnter={onEnter} />
          <div className="portal-beats">
            {ENTRY_BEATS.map((beat, index) => (
              <motion.div
                key={beat.key}
                initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                animate={ready ? { opacity: 1, x: 0 } : { opacity: 0 }}
                transition={{ delay: .82 + index * .12, duration: .86, ease }}
              >
                <span>{beat.key}</span><div><strong>{beat.title}</strong><small>{beat.detail}</small></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.footer className="portal-footer" {...reveal(1.02)}>
        <span>Designed for deep focus</span><i /><span>Press any key to begin</span>
      </motion.footer>
    </section>
  );
}
