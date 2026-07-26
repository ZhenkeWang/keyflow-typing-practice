"use client";

export default function SessionResult({
  wpm,
  cpm,
  metric,
  accuracy,
  consistency,
  errors,
  best,
  errorPatterns = [],
  modeLabel,
  rhythmBpm,
  rhythmScore,
  reactionTime,
  improvement,
  recommendation,
  codeMetrics,
  gainedXp,
  xpBreakdown = [],
  level,
  leveledUp,
  aiReview,
  testType,
  pkPlayer,
  pkWinner,
  pkScores,
  onAdvancePk,
  onRestart,
  onViewReport,
}) {
  return (
    <div className="result-overlay phase-one-result phase-two-result">
      <div className="result-glow" />
      <div className="result-kicker"><i /> SESSION COMPLETE</div>
      {leveledUp && <div className="level-up-badge"><span>↑</span> LEVEL UP</div>}

      <div className="result-score">
        <strong>{wpm}</strong>
        <span>{metric}</span>
        <small>{modeLabel || "Training"} result</small>
      </div>

      <div className="xp-award"><span>+{gainedXp} XP</span><small>Level {level}</small></div>
      <div className="xp-breakdown">
        {xpBreakdown.map((item) => (
          <span key={item.id}><small>{item.label}</small><strong>+{item.value}</strong></span>
        ))}
      </div>

      <div className="result-stat-grid">
        <div><span>CPM</span><strong>{cpm}</strong></div>
        <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
        <div><span>Stability</span><strong>{consistency}%</strong></div>
        <div><span>Errors</span><strong>{errors}</strong></div>
        <div><span>Reaction</span><strong>{reactionTime || "—"} <small>{reactionTime ? "ms" : ""}</small></strong></div>
        <div><span>Best</span><strong>{best} <small>{metric}</small></strong></div>
      </div>

      <div className="result-training-context">
        <span>{modeLabel || "Training"}</span>
        {rhythmBpm > 0 && <span>{rhythmBpm} BPM</span>}
        {rhythmScore > 0 && <span>RHYTHM {rhythmScore}</span>}
        <span className={improvement >= 0 ? "positive" : "negative"}>
          {improvement >= 0 ? "+" : ""}{improvement}% VS LAST
        </span>
      </div>

      <div className={`session-ai-review ${aiReview ? "ready" : "loading"}`}>
        <div>
          <span>AI REVIEW</span>
          {aiReview ? <strong>{aiReview.score}<small>/100</small></strong> : <i><b /><b /><b /></i>}
        </div>
        {aiReview ? (
          <>
            <p><b>优势</b>{aiReview.strengths[0]}</p>
            <p><b>问题</b>{aiReview.issues[0]?.label} · {aiReview.issues[0]?.detail}</p>
            <p><b>下一步</b>{aiReview.nextStep.title} · {aiReview.nextStep.target}</p>
          </>
        ) : <p>正在分析本次节奏、错键与训练趋势…</p>}
      </div>

      {codeMetrics && (
        <div className="result-code-metrics">
          <div><span>Symbol Accuracy</span><strong>{codeMetrics.symbolAccuracy}%</strong></div>
          <div><span>Indent Speed</span><strong>{codeMetrics.indentSpeed}<small>/MIN</small></strong></div>
          <div><span>Code WPM</span><strong>{codeMetrics.codeWpm}</strong></div>
        </div>
      )}

      <div className="result-mistakes">
        <div><span>TOP MISTAKES</span><small>本次错误组合</small></div>
        {errorPatterns.length ? (
          <ol>
            {errorPatterns.map((item) => (
              <li key={item.pattern}>
                <code>{item.pattern}</code>
                <span>{item.count} 次</span>
              </li>
            ))}
          </ol>
        ) : <p>本次没有记录到错误，输入节奏保持得很好。</p>}
      </div>

      <div className="result-next-step">
        <span>NEXT BEST STEP</span>
        <div><strong>{recommendation?.label || "Accuracy Training"}</strong><p>{recommendation?.reason || "继续保持稳定节奏，并逐步提高速度。"}</p></div>
      </div>

      {testType === "pk" && pkPlayer === 2 && (
        <div className="pk-result">
          <div className={pkWinner === 1 ? "winner" : ""}><small>玩家 1</small><b>{pkScores[1]?.wpm ?? 0}</b><span>{metric}</span></div>
          <i>VS</i>
          <div className={pkWinner === 2 ? "winner" : ""}><small>玩家 2</small><b>{pkScores[2]?.wpm ?? wpm}</b><span>{metric}</span></div>
          <p>{pkWinner === 0 ? "平局" : pkWinner ? `玩家 ${pkWinner} 获胜` : "正在计算结果"}</p>
        </div>
      )}

      {testType === "pk" && pkPlayer === 1
        ? <button onClick={onAdvancePk}>交给玩家 2 <span>→</span></button>
        : <div className="result-actions">
            <button className="report-button" onClick={onViewReport}>查看 AI 训练报告</button>
            <button onClick={onRestart}>{testType === "pk" ? "再战一局" : "开始下一轮"} <span>→</span></button>
          </div>}
    </div>
  );
}
