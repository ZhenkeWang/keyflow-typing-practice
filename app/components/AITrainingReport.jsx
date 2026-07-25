"use client";

function HandCard({ label, stats, weaker }) {
  return (
    <div className={`hand-card ${weaker ? "weaker" : ""}`}>
      <span>{label}{weaker && <i>需要关注</i>}</span>
      <strong>{stats.accuracy}%</strong>
      <small>{stats.attempts} 次击键 · {stats.errors} 次错误</small>
      <div><i style={{ width: `${stats.accuracy}%` }} /></div>
    </div>
  );
}

export default function AITrainingReport({ report, onBack, onRestart, onApplyRecommendation }) {
  return (
    <div className="result-overlay ai-report-overlay">
      <div className="result-glow" />
      <div className="ai-report-header">
        <div><span>AI TRAINING REPORT</span><h3>本轮训练分析</h3></div>
        <small>基于本地击键数据即时生成</small>
      </div>

      <div className="ai-report-grid">
        <section className="report-errors">
          <div className="report-section-title"><strong>常错字符</strong><span>{report.topMistakes.reduce((sum, item) => sum + item.count, 0)} ERRORS</span></div>
          {report.topMistakes.length ? (
            <div className="report-error-list">
              {report.topMistakes.map((item) => (
                <div key={item.key}>
                  <code>{item.expected === " " ? "Space" : item.expected}</code><i>→</i>
                  <code>{item.typed === " " ? "Space" : item.typed}</code><span>×{item.count}</span>
                  <small>{item.positions.slice(-3).map((position) => `#${position + 1}`).join(" · ")}</small>
                </div>
              ))}
            </div>
          ) : <p className="report-clean">✓ 本轮零错误，准确率表现优秀。</p>}
          <p className="report-insight">{report.insight}</p>
        </section>

        <section className="report-hands">
          <div className="report-section-title"><strong>左右手表现</strong><span>KEY ZONES</span></div>
          <div className="hand-grid">
            <HandCard label="左手键区" stats={report.hands.left} weaker={report.weakerHand === "left"} />
            <HandCard label="右手键区" stats={report.hands.right} weaker={report.weakerHand === "right"} />
          </div>
          <p className="report-insight">{report.handInsight}</p>
        </section>
      </div>

      <div className="coach-detail-grid">
        <section>
          <div className="report-section-title"><strong>优势</strong><span>STRENGTHS</span></div>
          <ul>
            {report.strengths.map((item) => <li key={item}><i>✓</i><span>{item}</span></li>)}
          </ul>
        </section>
        <section>
          <div className="report-section-title"><strong>需要改善</strong><span>FOCUS</span></div>
          <ol>
            {report.issues.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <i>{index + 1}</i>
                <div><strong>{item.label}</strong><p>{item.detail}</p></div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="report-recommendation">
        <span>RECOMMENDED NEXT</span>
        <div><strong>{report.recommendation.label}</strong><p>{report.recommendation.reason}</p></div>
        <small>每日 {report.dailyDrill.duration} 分钟 · 重点 {report.dailyDrill.focus}</small>
        <button onClick={onApplyRecommendation}>开始专项训练 <span>→</span></button>
      </section>

      <div className="report-actions">
        <button onClick={onBack}>返回成绩</button>
        <button onClick={onRestart}>再练一轮 <span>→</span></button>
      </div>
    </div>
  );
}
