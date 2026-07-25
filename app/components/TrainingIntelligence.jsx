"use client";

import { memo } from "react";

function FingerHeatmap({ fingers }) {
  return (
    <section className="finger-heatmap-card">
      <div className="training-panel-heading">
        <div><span>FINGER HEATMAP</span><strong>手指表现</strong></div>
        <small>绿色正常 · 黄色需训练 · 红色薄弱</small>
      </div>
      <div className="finger-heatmap" role="img" aria-label="根据历史错误率生成的手指热力图">
        {["left", "right"].map((hand) => (
          <div className={`finger-hand ${hand}`} key={hand}>
            <span>{hand === "left" ? "LEFT HAND" : "RIGHT HAND"}</span>
            <div>
              {fingers.filter((item) => item.hand === hand).map((item) => (
                <article className={item.level} key={item.id} title={`${item.label}：${item.errorRate}% 错误率`}>
                  <i />
                  <strong>{item.finger}</strong>
                  <small>{item.errorRate}%</small>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WeakKeyRanking({ weakKeys, selectedWeakKey, onSelectWeakKey }) {
  return (
    <section className="weak-key-ranking">
      <div className="training-panel-heading">
        <div><span>TOP 10 WEAK KEYS</span><strong>薄弱按键排行</strong></div>
        <small>点击字符立即进入专项训练</small>
      </div>
      <div className="weak-key-table">
        <div className="weak-key-table-head"><span>字符</span><span>错误次数</span><span>错误率</span><span>反应</span></div>
        {weakKeys.length ? weakKeys.map((item, index) => (
          <button
            className={selectedWeakKey === item.character ? "active" : ""}
            type="button"
            key={item.character}
            onClick={(event) => {
              event.stopPropagation();
              onSelectWeakKey(item.character);
            }}
          >
            <span><i>{String(index + 1).padStart(2, "0")}</i><kbd>{item.character.toUpperCase()}</kbd></span>
            <strong>{item.errors}</strong>
            <strong>{item.errorRate}%</strong>
            <small>{item.reactionMs || "—"}{item.reactionMs ? "ms" : ""}</small>
          </button>
        )) : (
          <p className="training-panel-empty">完成一次训练后，这里会根据真实错误生成字符排行。</p>
        )}
      </div>
    </section>
  );
}

function AITrainingPlan({ weakKeys, plan, reactionTime, onStartPlan }) {
  const primary = weakKeys[0];
  return (
    <section className="ai-training-plan">
      <div className="training-panel-heading">
        <div><span>AI TRAINING</span><strong>今日个人训练方案</strong></div>
        <small>基于本机训练记录实时生成</small>
      </div>
      <div className="ai-diagnosis">
        <article>
          <span>PRIMARY ISSUE</span>
          <strong>{primary?.character?.toUpperCase() || "—"}</strong>
          <small>{primary ? `错误率 ${primary.errorRate}% · ${primary.errors} 次错误` : "等待训练数据"}</small>
        </article>
        <article>
          <span>REACTION TIME</span>
          <strong>{reactionTime || "—"}<em>{reactionTime ? "ms" : ""}</em></strong>
          <small>{reactionTime > 280 ? "需要缩短识别到触键的停顿" : "当前反应节奏稳定"}</small>
        </article>
        <article>
          <span>COMBINATION</span>
          <strong>{weakKeys.slice(0, 2).map((item) => item.character).join("") || "th"}</strong>
          <small>由高频薄弱字符组成</small>
        </article>
      </div>
      <div className="ai-plan-list">
        {plan.map((item, index) => (
          <button type="button" key={item.id} onClick={(event) => {
            event.stopPropagation();
            onStartPlan(item);
          }}>
            <i>{index + 1}</i>
            <div><strong>{item.title}</strong><small>{item.reason}</small></div>
            <span>{item.duration} MIN</span>
            <b>→</b>
          </button>
        ))}
      </div>
    </section>
  );
}

function RhythmTrainer({ target, score }) {
  return (
    <section className="rhythm-trainer-card">
      <div className="training-panel-heading">
        <div><span>RHYTHM TRAINER</span><strong>跟随节拍连续输入</strong></div>
        <small>{target} BPM · 每次亮起时完成一次击键</small>
      </div>
      <div className="rhythm-lane" style={{ "--rhythm-duration": `${60 / target}s` }}>
        {[0, 1, 2, 3].map((beat) => <i style={{ "--beat-index": beat }} key={beat} />)}
      </div>
      <div className="rhythm-score">
        <span>RHYTHM SCORE</span><strong>{score || "—"}<small>{score ? "/100" : ""}</small></strong>
        <p>{score >= 88 ? "节奏非常稳定" : score >= 70 ? "保持呼吸，减少击键间隔波动" : "先跟随慢速节拍建立稳定感"}</p>
      </div>
    </section>
  );
}

function CodeMetrics({ metrics }) {
  return (
    <section className="code-metrics-card">
      <div className="training-panel-heading">
        <div><span>CODE INTELLIGENCE</span><strong>程序输入指标</strong></div>
        <small>符号、缩进和代码速度独立统计</small>
      </div>
      <div className="code-metric-grid">
        <article><span>SYMBOL ACCURACY</span><strong>{metrics.symbolAccuracy}%</strong><small>{"{} [] () ; =>"}</small></article>
        <article><span>INDENT SPEED</span><strong>{metrics.indentSpeed}</strong><small>正确缩进字符 / MIN</small></article>
        <article><span>CODE WPM</span><strong>{metrics.codeWpm}</strong><small>仅统计正确代码字符</small></article>
      </div>
    </section>
  );
}

function TrainingIntelligence({
  mode,
  weakKeys,
  selectedWeakKey,
  onSelectWeakKey,
  fingers,
  plan,
  reactionTime,
  onStartPlan,
  rhythmTarget,
  rhythmScore,
  codeMetrics,
}) {
  if (!["ai", "weak", "rhythm", "code"].includes(mode)) return null;

  return (
    <div className={`training-intelligence mode-${mode}`}>
      {mode === "ai" && (
        <>
          <AITrainingPlan
            weakKeys={weakKeys}
            plan={plan}
            reactionTime={reactionTime}
            onStartPlan={onStartPlan}
          />
          <FingerHeatmap fingers={fingers} />
        </>
      )}
      {mode === "weak" && (
        <>
          <WeakKeyRanking
            weakKeys={weakKeys}
            selectedWeakKey={selectedWeakKey}
            onSelectWeakKey={onSelectWeakKey}
          />
          <FingerHeatmap fingers={fingers} />
        </>
      )}
      {mode === "rhythm" && <RhythmTrainer target={rhythmTarget} score={rhythmScore} />}
      {mode === "code" && <CodeMetrics metrics={codeMetrics} />}
    </div>
  );
}

export default memo(TrainingIntelligence);
