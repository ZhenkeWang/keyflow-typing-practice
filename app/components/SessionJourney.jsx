"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { memo, useMemo, useState } from "react";

export const JOURNEY_QUESTS = [
  { id: "home-row", mode: "speed", interaction: "standard", goal: 30, mark: "AS", label: "HOME ROW", title: "主键区校准", detail: "30 秒高频词，先让手腕和手指进入工作温度。", reward: "35 XP", color: "clay" },
  { id: "clean-chain", mode: "accuracy", interaction: "focus", goal: 60, mark: "98", label: "ACCURACY", title: "无错输入链", detail: "守住 98% 准确率，延长连续正确字符。", reward: "55 XP", color: "sage" },
  { id: "metronome", mode: "rhythm", interaction: "zen", goal: 60, mark: "90", label: "RHYTHM", title: "90 BPM 节拍", detail: "跟随稳定拍点，减少快慢交替造成的停顿。", reward: "60 XP", color: "blue" },
  { id: "bracket-work", mode: "code", interaction: "standard", goal: 60, mark: "{}", label: "CODE", title: "括号工作台", detail: "专练括号、分号、缩进与换行。", reward: "65 XP", color: "sand" },
  { id: "repair", mode: "weak", interaction: "focus", goal: 120, mark: "RX", label: "REPAIR", title: "薄弱键处方", detail: "从历史错误里抽取最需要修复的按键。", reward: "75 XP", color: "rose" },
  { id: "editorial", mode: "news", interaction: "standard", goal: 60, mark: "TX", label: "EDITORIAL", title: "现实文本编辑", detail: "输入更接近日常阅读的新闻与生活文字。", reward: "50 XP", color: "ink" },
  { id: "number-row", mode: "numbers", interaction: "standard", goal: 60, mark: "09", label: "NUMBERS", title: "数字行控制", detail: "日期、端口与公式混排，训练上排键位。", reward: "55 XP", color: "blue" },
  { id: "deep-page", mode: "focus", interaction: "zen", goal: 120, mark: "02", label: "DEEP PAGE", title: "两分钟长段落", detail: "隐藏干扰，只留下文本和稳定呼吸。", reward: "70 XP", color: "sage" },
  { id: "adaptive", mode: "ai", interaction: "focus", goal: 120, mark: "AI", label: "ADAPTIVE", title: "自适应混合", detail: "组合薄弱键、短词和完整句子的今日处方。", reward: "80 XP", color: "clay" },
  { id: "punctuation", mode: "accuracy", interaction: "standard", goal: 60, mark: ";?", label: "PUNCTUATION", title: "标点与停顿", detail: "用逗号、引号和问号练习句子换挡。", reward: "60 XP", color: "sand" },
  { id: "burst", mode: "speed", interaction: "focus", goal: 15, mark: "15", label: "BURST", title: "十五秒爆发", detail: "极短冲刺，探索今日最快的自然速度。", reward: "30 XP", color: "rose" },
  { id: "endurance", mode: "focus", interaction: "standard", goal: 120, mark: "∞", label: "ENDURANCE", title: "持续力练习", detail: "观察后半程速度，保持轻触而不是用力。", reward: "75 XP", color: "ink" },
];

const REWARD_STAMPS = [
  { id: "first", label: "FIRST LOOP", detail: "完成首轮练习", test: ({ historyLength }) => historyLength > 0 },
  { id: "level", label: "FIVE KEYS", detail: "达到 Level 5", test: ({ level }) => level >= 5 },
  { id: "streak", label: "SEVEN DAYS", detail: "连续练习 7 天", test: ({ streak }) => streak >= 7 },
  { id: "century", label: "100 LOOPS", detail: "累计完成 100 轮", test: ({ historyLength }) => historyLength >= 100 },
];

const ease = [.22, 1, .36, 1];

function SessionJourney({ xpTotal, levelInfo, missions, historyLength, streak = 0, activeQuest, status, onSelectQuest }) {
  const reduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("deck");
  const [shuffle, setShuffle] = useState(0);
  const recommended = useMemo(() => JOURNEY_QUESTS[(historyLength * 2 + shuffle * 5) % JOURNEY_QUESTS.length], [historyLength, shuffle]);
  const selected = JOURNEY_QUESTS.find((quest) => quest.id === selectedId) || activeQuest || recommended;
  const completed = missions.filter((mission) => mission.completed).length;
  const unlocked = REWARD_STAMPS.filter((reward) => reward.test({ historyLength, level: levelInfo.level, streak })).length;

  const start = (quest) => {
    setSelectedId(quest.id);
    onSelectQuest(quest);
  };

  return (
    <aside className={`practice-deck color-${selected.color}`} aria-label="训练卡组">
      <header className="deck-header">
        <div><span>PRACTICE DECK</span><strong>今天练什么？</strong></div>
        <button type="button" onClick={() => { setSelectedId(null); setShuffle((value) => value + 1); }} aria-label="换一个推荐">↻</button>
      </header>

      <div className="deck-tabs" role="tablist" aria-label="训练与奖励">
        {[['deck', '卡组'], ['tasks', `任务 ${completed}/${missions.length}`], ['rewards', `收藏 ${unlocked}/${REWARD_STAMPS.length}`]].map(([id, label]) => (
          <button type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} key={id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "deck" && (
          <motion.div className="deck-panel" key="deck" initial={reduceMotion ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: .45, ease }}>
            <div className="deck-featured">
              <div className="deck-card-mark"><span>{selected.mark}</span><i /></div>
              <small>{selected.label} · {status === "running" ? "进行中" : "推荐练习"}</small>
              <strong>{selected.title}</strong>
              <p>{selected.detail}</p>
              <div><span>{selected.goal} SEC</span><span>{selected.reward}</span></div>
              <button type="button" onClick={() => start(selected)}><span>装载这张练习卡</span><kbd>↵</kbd></button>
            </div>

            <div className="deck-card-grid">
              {JOURNEY_QUESTS.map((quest) => (
                <button type="button" className={`${selected.id === quest.id ? "active" : ""} color-${quest.color}`} key={quest.id} onClick={() => setSelectedId(quest.id)} aria-pressed={selected.id === quest.id}>
                  <span>{quest.mark}</span><div><strong>{quest.title}</strong><small>{quest.label}</small></div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "tasks" && (
          <motion.div className="deck-panel deck-task-list" key="tasks" initial={reduceMotion ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: .45, ease }}>
            <div className="deck-section-copy"><span>DAILY ASSIGNMENTS</span><strong>完成任务，获得额外 XP</strong><p>任务直接连接训练卡，不需要离开当前工作台。</p></div>
            {missions.map((mission, index) => {
              const template = JOURNEY_QUESTS.find((quest) => quest.mode === mission.mode) || JOURNEY_QUESTS[8];
              return (
                <button type="button" className={mission.completed ? "completed" : ""} key={mission.id} onClick={() => start({ ...template, id: `task-${mission.id}`, title: mission.title, goal: mission.goal || 60 })}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{mission.title}</strong><small>{Math.min(mission.progressValue, mission.target)} / {mission.target}</small><i><b style={{ width: `${mission.progress * 100}%` }} /></i></div>
                  <em>{mission.completed ? "✓" : `+${mission.reward}`}</em>
                </button>
              );
            })}
          </motion.div>
        )}

        {tab === "rewards" && (
          <motion.div className="deck-panel" key="rewards" initial={reduceMotion ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: .45, ease }}>
            <div className="deck-section-copy"><span>KEYCAP ARCHIVE</span><strong>把练习变成可见的收藏</strong><p>每枚印章对应一段真实的输入记录。</p></div>
            <div className="reward-stamps">
              {REWARD_STAMPS.map((reward, index) => {
                const isUnlocked = reward.test({ historyLength, level: levelInfo.level, streak });
                return <div className={isUnlocked ? "unlocked" : ""} key={reward.id}><span>{isUnlocked ? String(index + 1).padStart(2, "0") : "—"}</span><strong>{reward.label}</strong><small>{reward.detail}</small></div>;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="deck-progress">
        <div><span><b>LV.{String(levelInfo.level).padStart(2, "0")}</b> {levelInfo.title}</span><strong>{xpTotal.toLocaleString()} XP</strong></div>
        <i><b style={{ width: `${levelInfo.progress * 100}%` }} /></i>
        <div><small>{streak} DAY STREAK</small><small>{historyLength} LOOPS</small></div>
      </footer>
    </aside>
  );
}

export default memo(SessionJourney);
