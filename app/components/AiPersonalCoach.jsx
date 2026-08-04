"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAiCoachStore } from "../stores/aiCoachStore";

function CoachOrb({ status = "analysis" }) {
  return (
    <div className={`ai-coach-orb ${status}`} aria-label={`AI Coach ${status}`}>
      <i /><i /><i />
      <span />
    </div>
  );
}

function CoachSkeleton() {
  return (
    <div className="ai-coach-skeleton" aria-label="AI Coach 正在分析">
      <div><i /><span /></div>
      <div><span /><span /><span /></div>
      <div><span /><span /></div>
    </div>
  );
}

function PredictionChart({ prediction }) {
  const min = Math.max(0, Math.min(...prediction.points.map((point) => point.wpm)) - 5);
  const max = Math.max(min + 10, ...prediction.points.map((point) => point.wpm));
  const points = prediction.points.map((point, index) => {
    const x = 18 + index * 94;
    const y = 108 - ((point.wpm - min) / (max - min)) * 82;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="ai-prediction-chart">
      <svg viewBox="0 0 320 125" role="img" aria-label="90 天 WPM 成长预测">
        <defs>
          <linearGradient id="prediction-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".24" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="18" y1="108" x2="302" y2="108" />
        <polygon points={`18,108 ${points} 300,108`} fill="url(#prediction-area)" />
        <polyline points={points} />
        {prediction.points.map((point, index) => {
          const [cx, cy] = points.split(" ")[index].split(",");
          return <g key={point.day}><circle cx={cx} cy={cy} r="4" /><text x={cx} y={Number(cy) - 10}>{point.wpm}</text></g>;
        })}
      </svg>
      <div><span>Now</span><span>30 Days</span><span>60 Days</span><span>90 Days</span></div>
    </div>
  );
}

export default function AiPersonalCoach({ history, profile, onStartPlan }) {
  const {
    status,
    chatStatus,
    analysis,
    plan,
    conversation,
    goal,
    hydrate,
    analyze,
    ask,
    setGoal,
  } = useAiCoachStore();
  const [question, setQuestion] = useState("");
  const [draftGoal, setDraftGoal] = useState(goal);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    analyze(history);
  }, [analyze, history]);

  useEffect(() => setDraftGoal(goal), [goal]);

  const greeting = profile?.signedIn && profile.username ? profile.username : "KeyFlow User";
  const headline = useMemo(() => {
    if (!analysis?.sampleSize) return "完成训练后，我会告诉你为什么慢，以及下一步练什么。";
    if (analysis.currentStatus.trend > 0) return `你的近期速度提升了 ${analysis.currentStatus.trend} WPM，能力正在向上生长。`;
    if (analysis.weaknesses[0]?.type === "rhythm") return "准确率已经稳定，下一步应减少击键节奏波动。";
    return "你的训练方向已经清晰，先修复最高频动作阻塞。";
  }, [analysis]);

  const submitQuestion = async (event) => {
    event.preventDefault();
    const next = question.trim();
    if (!next || chatStatus === "thinking") return;
    setQuestion("");
    await ask(next, history);
  };

  return (
    <motion.section
      className="ai-personal-coach neural-coach"
      initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: .08 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
    >
      <div className="ai-coach-ambient" />
      <header className="ai-coach-header">
        <CoachOrb status={status === "loading" ? "analysis" : "complete"} />
        <div>
          <span>AI PERSONAL COACH</span>
          <h3>Hello, {greeting}</h3>
          <p>{headline}</p>
        </div>
        <em><i /> {status === "loading" ? "ANALYZING" : `${analysis?.sampleSize || 0} SESSIONS`}</em>
      </header>

      {status === "error" ? (
        <div className="experience-error-state" role="status">
          <i>↻</i>
          <div><strong>Coach 暂时无法完成分析</strong><p>训练数据仍安全保存在本地，请稍后重新分析。</p></div>
          <button type="button" onClick={() => analyze(history)}>重新分析</button>
        </div>
      ) : status === "loading" || !analysis || !plan ? <CoachSkeleton /> : (
        <AnimatePresence mode="wait">
          <motion.div className="ai-coach-body" key={analysis.lastUpdated} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="ai-status-grid">
              <article>
                <span>CURRENT STATUS</span>
                <strong>{analysis.currentStatus.averageWpm}<small>WPM</small></strong>
                <p>{analysis.currentStatus.averageAccuracy}% accuracy · {analysis.currentStatus.rhythmScore}% rhythm</p>
              </article>
              <article className="weakness">
                <span>PRIMARY WEAKNESS</span>
                <strong>{analysis.weaknesses[0].label}</strong>
                <p>{analysis.weaknesses[0].detail}</p>
              </article>
              <article>
                <span>TRAINING HABIT</span>
                <strong>{analysis.habits.preferredMode}</strong>
                <p>{analysis.habits.averageDuration || 0}s average · {analysis.habits.sessions} sessions</p>
              </article>
              <article className="prediction">
                <span>30 DAY PREDICTION</span>
                <strong>{analysis.prediction.day30}<small>WPM</small></strong>
                <p>{analysis.prediction.condition}</p>
              </article>
            </div>

            <div className="ai-coach-intelligence-grid">
              <section className="ai-weakness-panel">
                <div className="ai-panel-title"><div><span>WEAKNESS ANALYSIS</span><strong>AI 发现的问题</strong></div><small>{analysis.rhythm.volatility}% RHYTHM VARIANCE</small></div>
                <div className="ai-weakness-list">
                  {analysis.weaknesses.slice(0, 4).map((item, index) => (
                    <article className={item.severity} key={`${item.type}-${item.label}`}>
                      <i>{String(index + 1).padStart(2, "0")}</i>
                      <div><strong>{item.label}</strong><small>{item.detail}</small></div>
                      <span>{item.severity}</span>
                    </article>
                  ))}
                </div>
                <div className={`ai-endurance ${analysis.endurance.status}`}>
                  <span>SUSTAINED SPEED</span>
                  <div><strong>{analysis.endurance.first20Wpm || "—"}<small>前20秒</small></strong><i>→</i><strong>{analysis.endurance.laterWpm || "—"}<small>后40秒</small></strong></div>
                  <p>{analysis.endurance.detail}</p>
                </div>
              </section>

              <section className="ai-recommendation-panel">
                <div className="ai-panel-title"><div><span>TRAINING RECOMMENDATION</span><strong>今日智能训练</strong></div><small>{plan.duration} MIN</small></div>
                <div className="ai-recommendation-list">
                  {plan.tasks.map((task, index) => (
                    <button type="button" key={task.id} onClick={() => onStartPlan(task.mode)}>
                      <i>{index + 1}</i>
                      <div><strong>{task.title}</strong><span>{task.target}</span><small>{task.reason}</small></div>
                      <em>{task.duration} MIN</em>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="ai-goal-prediction-grid">
              <section className="ai-growth-prediction">
                <div className="ai-panel-title"><div><span>FUTURE PREDICTION</span><strong>90 天成长轨迹</strong></div><small>{analysis.prediction.confidence} confidence</small></div>
                <PredictionChart prediction={analysis.prediction} />
              </section>
              <section className="ai-goal-panel">
                <div className="ai-panel-title"><div><span>AI GOAL</span><strong>目标进度路线</strong></div><small>{goal} WPM</small></div>
                <form onSubmit={(event) => { event.preventDefault(); setGoal(draftGoal, history); }}>
                  <label><span>目标速度</span><input type="number" min="30" max="180" value={draftGoal} onChange={(event) => setDraftGoal(event.target.value)} /><small>WPM</small></label>
                  <button type="submit">生成计划</button>
                </form>
                <div className="ai-timeline">
                  {plan.timeline.map((item) => <div key={item.week}><i /><span>W{item.week}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div></div>)}
                </div>
              </section>
            </div>

            <section className="ai-chat-coach">
              <div className="ai-panel-title"><div><span>ASK YOUR COACH</span><strong>基于你的训练数据提问</strong></div><CoachOrb status={chatStatus === "thinking" ? "analysis" : "suggestion"} /></div>
              <div className="ai-chat-prompts">
                {["为什么我的速度提高不了？", "我的错误主要在哪里？", `如何达到 ${goal} WPM？`].map((prompt) => (
                  <button type="button" key={prompt} onClick={() => setQuestion(prompt)}>{prompt}</button>
                ))}
              </div>
              <div className="ai-conversation">
                {conversation.slice(-3).map((item) => (
                  <article key={`${item.date}-${item.question}`}>
                    <span>{item.question}</span>
                    <p>{item.answer}</p>
                  </article>
                ))}
                {chatStatus === "thinking" && <div className="ai-thinking"><i /><i /><i /><span>Coach 正在分析你的训练记录</span></div>}
              </div>
              <form onSubmit={submitQuestion}>
                <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="问问你的 AI Coach…" aria-label="向 AI Coach 提问" />
                <button type="submit" disabled={!question.trim() || chatStatus === "thinking"}>发送 <span>↑</span></button>
              </form>
            </section>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.section>
  );
}
