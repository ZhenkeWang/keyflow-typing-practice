"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { memo, useMemo, useState } from "react";

export const JOURNEY_QUESTS = [
  {
    id: "warm-flow",
    mode: "speed",
    interaction: "standard",
    goal: 30,
    icon: "↗",
    eyebrow: "WARM UP",
    title: "30 秒唤醒手感",
    detail: "高频词与轻触键程，先进入顺畅节奏。",
    reward: "约 35–55 XP",
    tone: "violet",
  },
  {
    id: "precision-chain",
    mode: "accuracy",
    interaction: "focus",
    goal: 60,
    icon: "◎",
    eyebrow: "PRECISION",
    title: "98% 精准连击",
    detail: "聚焦易混组合，保持连续正确输入。",
    reward: "约 55–85 XP",
    tone: "mint",
  },
  {
    id: "rhythm-loop",
    mode: "rhythm",
    interaction: "zen",
    goal: 60,
    icon: "◉",
    eyebrow: "RHYTHM",
    title: "一分钟节拍循环",
    detail: "隐藏干扰，跟随 90 BPM 建立稳定间距。",
    reward: "约 60–90 XP",
    tone: "blue",
  },
  {
    id: "code-sprint",
    mode: "code",
    interaction: "standard",
    goal: 60,
    icon: "</>",
    eyebrow: "CODE FLOW",
    title: "符号与缩进冲刺",
    detail: "真实代码片段，强化括号、符号与换行。",
    reward: "约 65–95 XP",
    tone: "amber",
  },
  {
    id: "weak-repair",
    mode: "weak",
    interaction: "focus",
    goal: 120,
    icon: "⌁",
    eyebrow: "REPAIR",
    title: "薄弱键修复回路",
    detail: "根据历史错误动态生成专属组合。",
    reward: "约 70–110 XP",
    tone: "rose",
  },
  {
    id: "adaptive-mix",
    mode: "ai",
    interaction: "focus",
    goal: 120,
    icon: "✦",
    eyebrow: "ADAPTIVE",
    title: "AI 综合成长回路",
    detail: "混合薄弱键、组合与完整句子，推进字符目标。",
    reward: "约 75–120 XP",
    tone: "cyan",
  },
];

function SessionJourney({
  xpTotal,
  levelInfo,
  missions,
  historyLength,
  activeQuest,
  status,
  onSelectQuest,
}) {
  const reduceMotion = useReducedMotion();
  const [missionOpen, setMissionOpen] = useState(false);
  const [previewQuest, setPreviewQuest] = useState(null);
  const suggestedIndex = useMemo(() => {
    if (!historyLength) return 0;
    return historyLength % JOURNEY_QUESTS.length;
  }, [historyLength]);
  const selected = previewQuest || activeQuest || JOURNEY_QUESTS[suggestedIndex];
  const completed = missions.filter((mission) => mission.completed).length;
  const sessionLabel = status === "running" ? "训练进行中" : status === "paused" ? "等待继续" : status === "finished" ? "本轮已完成" : "准备开始";

  return (
    <section className={`session-journey tone-${selected.tone}`} aria-label="今日训练旅程">
      <div className="journey-glow" aria-hidden="true" />
      <div className="journey-level">
        <div className="journey-level-orbit" style={{ "--journey-progress": `${levelInfo.progress * 360}deg` }}>
          <span><small>LV.</small>{levelInfo.level}</span>
        </div>
        <div>
          <span>YOUR MOMENTUM</span>
          <strong>{levelInfo.title}</strong>
          <small>{levelInfo.currentXp} / {levelInfo.nextLevelXp} XP</small>
        </div>
        <div className="journey-xp-track"><i style={{ width: `${levelInfo.progress * 100}%` }} /></div>
      </div>

      <div className="journey-focus">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -7, filter: "blur(5px)" }}
            transition={{ duration: .62, ease: [.16, 1, .3, 1] }}
          >
            <span>{selected.eyebrow} · {sessionLabel}</span>
            <strong>{selected.title}</strong>
            <p>{selected.detail}</p>
            <small>{selected.reward}</small>
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={() => {
          setPreviewQuest(null);
          onSelectQuest(selected);
        }}>
          {activeQuest?.id === selected.id && status !== "finished" ? "重新开始" : "开始任务"}<i>→</i>
        </button>
      </div>

      <div className="journey-quest-rail" aria-label="选择微任务">
        {JOURNEY_QUESTS.map((quest) => (
          <button
            className={`${quest.id === selected.id ? "active" : ""} tone-${quest.tone}`}
            type="button"
            key={quest.id}
            title={quest.title}
            onClick={() => setPreviewQuest(quest)}
          >
            <span>{quest.icon}</span><small>{quest.eyebrow}</small>
          </button>
        ))}
      </div>

      <div className={`journey-missions ${missionOpen ? "open" : ""}`}>
        <button type="button" onClick={() => setMissionOpen((value) => !value)} aria-expanded={missionOpen}>
          <span><i>{completed}</i> / {missions.length}</span>
          <div><strong>今日任务</strong><small>{completed === missions.length ? "全部完成，保持 Flow" : "完成任务获得额外 XP"}</small></div>
          <b>⌄</b>
        </button>
        <AnimatePresence initial={false}>
          {missionOpen && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: .58, ease: [.16, 1, .3, 1] }}
            >
              {missions.map((mission) => (
                <button type="button" key={mission.id} onClick={() => {
                  setPreviewQuest(null);
                  setMissionOpen(false);
                  onSelectQuest({
                    ...JOURNEY_QUESTS.find((quest) => quest.mode === mission.mode),
                    id: `mission-${mission.id}`,
                    title: mission.title,
                    goal: mission.goal || 60,
                  });
                }}>
                  <i>{mission.completed ? "✓" : ""}</i>
                  <span><strong>{mission.title}</strong><small>{Math.min(mission.progressValue, mission.target)} / {mission.target}</small></span>
                  <em>+{mission.reward}</em>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="journey-total-xp">TOTAL <strong>{xpTotal.toLocaleString()}</strong> XP</span>
    </section>
  );
}

export default memo(SessionJourney);
