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
  gainedXp,
  level,
  leveledUp,
  testType,
  pkPlayer,
  pkWinner,
  pkScores,
  onAdvancePk,
  onRestart,
  onViewReport,
}) {
  return (
    <div className="result-overlay phase-one-result">
      <div className="result-glow" />
      <div className="result-kicker"><i /> SESSION COMPLETE</div>
      {leveledUp && <div className="level-up-badge"><span>↑</span> LEVEL UP</div>}
      <div className="result-score">
        <strong>{wpm}</strong>
        <span>{metric}</span>
        <small>Personal training result</small>
      </div>
      <div className="xp-award"><span>+{gainedXp} XP</span><small>Level {level}</small></div>
      <div className="result-stat-grid">
        <div><span>CPM</span><strong>{cpm}</strong></div>
        <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
        <div><span>Stability</span><strong>{consistency}%</strong></div>
        <div><span>Errors</span><strong>{errors}</strong></div>
        <div><span>Best</span><strong>{best} <small>{metric}</small></strong></div>
      </div>
      <div className="result-training-context">
        <span>{modeLabel || "Training"}</span>
        {rhythmBpm > 0 && <span>{rhythmBpm} BPM</span>}
      </div>
      <div className="result-mistakes">
        <div><span>TOP MISTAKES</span><small>本轮错误组合</small></div>
        {errorPatterns.length ? (
          <ol>
            {errorPatterns.map((item) => (
              <li key={item.pattern}>
                <code>{item.pattern}</code>
                <span>{item.count} 次</span>
              </li>
            ))}
          </ol>
        ) : <p>本轮没有记录到错误，节奏保持得很好。</p>}
      </div>
      {testType === "pk" && pkPlayer === 2 && (
        <div className="pk-result">
          <div className={pkWinner === 1 ? "winner" : ""}><small>玩家 1</small><b>{pkScores[1]?.wpm ?? 0}</b><span>{metric}</span></div>
          <i>VS</i>
          <div className={pkWinner === 2 ? "winner" : ""}><small>玩家 2</small><b>{pkScores[2]?.wpm ?? wpm}</b><span>{metric}</span></div>
          <p>{pkWinner === 0 ? "平局！节奏完全一致" : pkWinner ? `玩家 ${pkWinner} 获胜` : "正在计算结果"}</p>
        </div>
      )}
      {testType === "pk" && pkPlayer === 1
        ? <button onClick={onAdvancePk}>交给玩家 2 <span>→</span></button>
        : <div className="result-actions">
            <button className="report-button" onClick={onViewReport}>查看 AI 报告</button>
            <button onClick={onRestart}>{testType === "pk" ? "再战一局" : "开始下一轮"} <span>↗</span></button>
          </div>}
    </div>
  );
}
