"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { memo, useMemo, useState } from "react";

export const JOURNEY_QUESTS = [
  { id: "warm-flow", mode: "speed", interaction: "standard", goal: 30, icon: "↗", eyebrow: "IGNITE", title: "30 秒手感唤醒", detail: "轻触高频词，让双手先进入自然节奏。", reward: "35–55 XP", tone: "violet", energy: 1 },
  { id: "precision-chain", mode: "accuracy", interaction: "focus", goal: 60, icon: "◎", eyebrow: "PRECISION", title: "精准连击", detail: "保持 98% 准确率，延长无错误输入链。", reward: "55–85 XP", tone: "mint", energy: 2 },
  { id: "rhythm-loop", mode: "rhythm", interaction: "zen", goal: 60, icon: "◉", eyebrow: "RHYTHM", title: "节拍循环", detail: "跟随 90 BPM，让每次击键间距更稳定。", reward: "60–90 XP", tone: "blue", energy: 2 },
  { id: "code-sprint", mode: "code", interaction: "standard", goal: 60, icon: "</>", eyebrow: "CODE", title: "符号与缩进", detail: "真实代码片段，强化括号、符号和换行。", reward: "65–95 XP", tone: "amber", energy: 2 },
  { id: "weak-repair", mode: "weak", interaction: "focus", goal: 120, icon: "⌁", eyebrow: "REPAIR", title: "薄弱键修复", detail: "根据历史错误生成专属字母与组合。", reward: "70–110 XP", tone: "rose", energy: 3 },
  { id: "adaptive-mix", mode: "ai", interaction: "focus", goal: 120, icon: "✦", eyebrow: "ADAPTIVE", title: "AI 综合回路", detail: "把薄弱键、组合与句子编排为一轮训练。", reward: "75–120 XP", tone: "cyan", energy: 3 },
  { id: "number-lab", mode: "numbers", interaction: "standard", goal: 60, icon: "#", eyebrow: "NUMBERS", title: "数字实验室", detail: "日期、地址与公式，建立数字行控制力。", reward: "55–90 XP", tone: "peach", energy: 2 },
  { id: "world-pulse", mode: "news", interaction: "standard", goal: 60, icon: "⌘", eyebrow: "REAL WORLD", title: "现实内容流", detail: "用贴近日常的内容打破重复句式。", reward: "50–80 XP", tone: "sky", energy: 2 },
  { id: "deep-drift", mode: "focus", interaction: "zen", goal: 120, icon: "≈", eyebrow: "DEEP FLOW", title: "两分钟深流", detail: "隐藏多余数据，只保留文字、呼吸和节奏。", reward: "70–115 XP", tone: "indigo", energy: 3 },
];

const ease = [.16, 1, .3, 1];

function SessionJourney({ xpTotal, levelInfo, missions, historyLength, streak = 0, activeQuest, status, onSelectQuest }) {
  const reduceMotion = useReducedMotion();
  const [previewId, setPreviewId] = useState(null);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [shuffleTick, setShuffleTick] = useState(0);
  const suggestedIndex = useMemo(() => (historyLength + shuffleTick * 3) % JOURNEY_QUESTS.length, [historyLength, shuffleTick]);
  const preview = JOURNEY_QUESTS.find((quest) => quest.id === previewId);
  const selected = preview || activeQuest || JOURNEY_QUESTS[suggestedIndex];
  const completed = missions.filter((mission) => mission.completed).length;
  const stateCopy = status === "running" ? "正在沉浸" : status === "paused" ? "等待继续" : status === "finished" ? "已完成一轮" : "下一段旅程";
  const flowSegments = Math.min(5, Math.max(0, completed + (historyLength ? 1 : 0) + (status === "finished" ? 1 : 0)));

  const startQuest = (quest) => {
    setPreviewId(null);
    setMissionsOpen(false);
    onSelectQuest(quest);
  };

  return (
    <section className={`flow-journey tone-${selected.tone}`} aria-label="今日成长路径">
      <div className="flow-journey-ambient" aria-hidden="true" />
      <header className="flow-journey-head">
        <div><span>TODAY'S FLOW</span><strong>选择此刻最适合你的练习</strong></div>
        <div className="flow-streak"><i>●</i><span><strong>{streak}</strong><small>day rhythm</small></span></div>
        <button type="button" onClick={() => { setPreviewId(null); setShuffleTick((value) => value + 1); }}><i>↻</i> 换一组推荐</button>
      </header>

      <div className="flow-journey-main">
        <div className="flow-level-card">
          <div className="flow-level-number"><small>LEVEL</small><strong>{String(levelInfo.level).padStart(2, "0")}</strong></div>
          <div><span>{levelInfo.title}</span><strong>{levelInfo.currentXp.toLocaleString()} <small>/ {levelInfo.nextLevelXp} XP</small></strong></div>
          <div className="flow-xp-line"><i style={{ width: `${levelInfo.progress * 100}%` }} /></div>
          <small>TOTAL {xpTotal.toLocaleString()} XP</small>
        </div>

        <div className="flow-quest-focus">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10, filter: "blur(7px)" }}
              transition={{ duration: .72, ease }}
            >
              <span><i>{selected.icon}</i>{selected.eyebrow} · {stateCopy}</span>
              <strong>{selected.title}</strong>
              <p>{selected.detail}</p>
              <small>{selected.goal} 秒 · {selected.reward}</small>
            </motion.div>
          </AnimatePresence>
          <button type="button" onClick={() => startQuest(selected)}><span>{activeQuest?.id === selected.id ? "重新进入" : "开始这段练习"}</span><i>→</i></button>
        </div>

        <div className="flow-loop-card">
          <span>DAILY LOOP</span>
          <div className="flow-loop-dots" aria-label={`${flowSegments} / 5 成长节点`}>
            {[0, 1, 2, 3, 4].map((item) => <i className={item < flowSegments ? "filled" : ""} key={item} />)}
          </div>
          <strong>{flowSegments < 5 ? `再完成 ${5 - flowSegments} 个节点` : "今日 Flow 已充满"}</strong>
          <button type="button" onClick={() => setMissionsOpen((value) => !value)} aria-expanded={missionsOpen}>
            {completed}/{missions.length} 今日任务 <i>⌄</i>
          </button>
        </div>
      </div>

      <div className="flow-quest-ribbon" aria-label="训练路径">
        {JOURNEY_QUESTS.map((quest, index) => (
          <button
            type="button"
            className={`${selected.id === quest.id ? "active" : ""} tone-${quest.tone}`}
            key={quest.id}
            onClick={() => setPreviewId(quest.id)}
            aria-pressed={selected.id === quest.id}
          >
            <span>{String(index + 1).padStart(2, "0")}</span><i>{quest.icon}</i><div><strong>{quest.title}</strong><small>{quest.eyebrow}</small></div><em>{quest.energy}●</em>
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {missionsOpen && (
          <motion.div
            className="flow-mission-sheet"
            initial={reduceMotion ? false : { opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -8 }}
            transition={{ duration: .66, ease }}
          >
            {missions.map((mission) => {
              const template = JOURNEY_QUESTS.find((quest) => quest.mode === mission.mode) || JOURNEY_QUESTS[5];
              return (
                <button type="button" key={mission.id} onClick={() => startQuest({ ...template, id: `mission-${mission.id}`, title: mission.title, goal: mission.goal || 60 })}>
                  <i>{mission.completed ? "✓" : mission.icon || "○"}</i>
                  <span><strong>{mission.title}</strong><small>{Math.min(mission.progressValue, mission.target)} / {mission.target}</small></span>
                  <div><b style={{ width: `${mission.progress * 100}%` }} /></div>
                  <em>+{mission.reward} XP</em>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(SessionJourney);
