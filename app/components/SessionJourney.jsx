"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { memo, useMemo, useState } from "react";

export const JOURNEY_QUESTS = [
  { id: "home-row", mode: "speed", interaction: "standard", goal: 30, mark: "AS", label: "HOME ROW", title: "主键区校准", detail: "30 秒高频词，唤醒手指定位与轻触节奏。", reward: "35 XP", color: "rose" },
  { id: "clean-chain", mode: "accuracy", interaction: "focus", goal: 60, mark: "98", label: "ACCURACY", title: "无错输入链", detail: "守住 98% 准确率，延长连续正确字符。", reward: "55 XP", color: "mint" },
  { id: "metronome", mode: "rhythm", interaction: "zen", goal: 60, mark: "90", label: "RHYTHM", title: "90 BPM 节拍", detail: "跟随稳定拍点，减少击键速度波动。", reward: "60 XP", color: "blue" },
  { id: "bracket-work", mode: "code", interaction: "standard", goal: 60, mark: "{}", label: "CODE", title: "符号工作台", detail: "训练括号、分号、缩进与换行控制。", reward: "65 XP", color: "gold" },
  { id: "repair", mode: "weak", interaction: "focus", goal: 120, mark: "RX", label: "REPAIR", title: "薄弱键处方", detail: "从历史错误中生成最需要修复的按键组合。", reward: "75 XP", color: "rose" },
  { id: "editorial", mode: "news", interaction: "standard", goal: 60, mark: "TX", label: "EDITORIAL", title: "现实文本流", detail: "使用贴近日常阅读的新闻与生活文字练习。", reward: "50 XP", color: "blue" },
  { id: "number-row", mode: "numbers", interaction: "standard", goal: 60, mark: "09", label: "NUMBERS", title: "数字行控制", detail: "混合日期、端口和公式，训练上排键位。", reward: "55 XP", color: "gold" },
  { id: "deep-page", mode: "focus", interaction: "zen", goal: 120, mark: "02", label: "DEEP FLOW", title: "两分钟深流", detail: "降低界面干扰，保持持续、轻盈的输入。", reward: "70 XP", color: "mint" },
  { id: "adaptive", mode: "ai", interaction: "focus", goal: 120, mark: "AI", label: "ADAPTIVE", title: "AI 自适应训练", detail: "组合薄弱键、短语与完整句子的今日处方。", reward: "80 XP", color: "rose" },
  { id: "punctuation", mode: "accuracy", interaction: "standard", goal: 60, mark: ";?", label: "PUNCTUATION", title: "标点与停顿", detail: "通过逗号、引号与问号改善句子换挡。", reward: "60 XP", color: "gold" },
  { id: "burst", mode: "speed", interaction: "focus", goal: 15, mark: "15", label: "BURST", title: "十五秒爆发", detail: "短距离冲刺，寻找今日自然速度上限。", reward: "30 XP", color: "blue" },
  { id: "endurance", mode: "focus", interaction: "standard", goal: 120, mark: "∞", label: "ENDURANCE", title: "持续力训练", detail: "观察后半程速度，避免紧张与过度用力。", reward: "75 XP", color: "mint" },
];

const TROPHIES = [
  { id: "first", label: "FIRST SIGNAL", detail: "完成第一轮训练", test: ({ historyLength }) => historyLength > 0 },
  { id: "level", label: "FIVE KEYS", detail: "达到 Level 5", test: ({ level }) => level >= 5 },
  { id: "streak", label: "SEVEN FLOW", detail: "连续练习 7 天", test: ({ streak }) => streak >= 7 },
  { id: "century", label: "100 SESSIONS", detail: "累计完成 100 轮", test: ({ historyLength }) => historyLength >= 100 },
];

const ease = [.16, 1, .3, 1];

function SessionJourney({ xpTotal, levelInfo, missions, historyLength, streak = 0, activeQuest, status, onSelectQuest }) {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState("today");
  const [selectedId, setSelectedId] = useState(null);
  const [rotation, setRotation] = useState(0);
  const suggested = useMemo(() => JOURNEY_QUESTS[(historyLength + rotation * 3) % JOURNEY_QUESTS.length], [historyLength, rotation]);
  const selected = JOURNEY_QUESTS.find((item) => item.id === selectedId) || activeQuest || suggested;
  const completed = missions.filter((mission) => mission.completed).length;
  const unlocked = TROPHIES.filter((item) => item.test({ historyLength, level: levelInfo.level, streak })).length;
  const start = (quest) => { setSelectedId(quest.id); onSelectQuest(quest); };

  return (
    <aside className={`mission-orbit tone-${selected.color}`} aria-label="训练任务中心">
      <header className="orbit-head">
        <div><span>TODAY / PERSONAL PROGRAM</span><strong>训练控制台</strong></div>
        <div className="orbit-level"><i>LV</i><strong>{String(levelInfo.level).padStart(2, "0")}</strong><span>{streak} DAY FLOW</span></div>
      </header>

      <nav className="orbit-tabs" role="tablist" aria-label="训练、任务与成就">
        {[["today", "今日"], ["missions", `任务 ${completed}/${missions.length}`], ["trophies", `成就 ${unlocked}/${TROPHIES.length}`]].map(([id, label]) => (
          <button type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} key={id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "today" && (
          <motion.div className="orbit-panel" key="today" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .65, ease }}>
            <section className="orbit-feature">
              <div className="orbit-radar"><i /><i /><i /><strong>{selected.mark}</strong></div>
              <div className="orbit-copy"><span>{selected.label} · {status === "running" ? "LIVE" : "RECOMMENDED"}</span><h2>{selected.title}</h2><p>{selected.detail}</p></div>
              <div className="orbit-meta"><span>{selected.goal}<small>SEC</small></span><span>{selected.reward}</span></div>
              <button type="button" onClick={() => start(selected)}><span>启动训练</span><i>↗</i></button>
            </section>
            <div className="orbit-list">
              {JOURNEY_QUESTS.map((quest, index) => (
                <button type="button" className={`${selected.id === quest.id ? "active" : ""} tone-${quest.color}`} key={quest.id} onClick={() => setSelectedId(quest.id)} aria-pressed={selected.id === quest.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span><i>{quest.mark}</i><div><strong>{quest.title}</strong><small>{quest.label}</small></div>
                </button>
              ))}
            </div>
            <button className="orbit-shuffle" type="button" onClick={() => { setSelectedId(null); setRotation((value) => value + 1); }}>换一个推荐 <i>↻</i></button>
          </motion.div>
        )}

        {tab === "missions" && (
          <motion.div className="orbit-panel orbit-missions" key="missions" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .65, ease }}>
            <div className="orbit-panel-title"><span>DAILY MISSIONS</span><strong>每个任务都连接一段真实训练</strong><p>完成任务将获得额外 XP，并推进连续练习记录。</p></div>
            {missions.map((mission, index) => {
              const template = JOURNEY_QUESTS.find((quest) => quest.mode === mission.mode) || JOURNEY_QUESTS[8];
              return (
                <button type="button" className={mission.completed ? "completed" : ""} key={mission.id} onClick={() => start({ ...template, id: `mission-${mission.id}`, title: mission.title, goal: mission.goal || 60 })}>
                  <span>{String(index + 1).padStart(2, "0")}</span><div><strong>{mission.title}</strong><small>{Math.min(mission.progressValue, mission.target)} / {mission.target}</small><i><b style={{ transform: `scaleX(${mission.progress})` }} /></i></div><em>{mission.completed ? "✓" : `+${mission.reward} XP`}</em>
                </button>
              );
            })}
          </motion.div>
        )}

        {tab === "trophies" && (
          <motion.div className="orbit-panel orbit-trophies" key="trophies" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .65, ease }}>
            <div className="orbit-panel-title"><span>ACHIEVEMENT VAULT</span><strong>让训练留下可见的痕迹</strong><p>不是装饰徽章，每一枚都对应真实训练记录。</p></div>
            <div>{TROPHIES.map((item, index) => { const isUnlocked = item.test({ historyLength, level: levelInfo.level, streak }); return <article className={isUnlocked ? "unlocked" : ""} key={item.id}><span>{isUnlocked ? String(index + 1).padStart(2, "0") : "—"}</span><i>⌘</i><strong>{item.label}</strong><small>{item.detail}</small></article>; })}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="orbit-progress">
        <div><span>{levelInfo.title}</span><strong>{xpTotal.toLocaleString()} XP</strong></div>
        <i><b style={{ transform: `scaleX(${levelInfo.progress})` }} /></i>
        <small>{historyLength} SESSIONS · NEXT LEVEL IN PROGRESS</small>
      </footer>
    </aside>
  );
}

export default memo(SessionJourney);
