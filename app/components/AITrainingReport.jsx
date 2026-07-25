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

export default function AITrainingReport({
  report,
  weakKeys = [],
  fingers = [],
  plan = [],
  reactionTime = 0,
  rhythmScore = 0,
  improvement = 0,
  onBack,
  onRestart,
  onStartPlan,
  onApplyRecommendation,
}) {
  return (
    <div className="result-overlay ai-report-overlay phase-two-report">
      <div className="result-glow" />
      <div className="ai-report-header">
        <div><span>AI TRAINING REPORT</span><h3>个人训练分析</h3></div>
        <small>基于本地击键数据即时生成</small>
      </div>

      <div className="report-summary-strip">
        <div><span>成长变化</span><strong className={improvement >= 0 ? "positive" : "negative"}>{improvement >= 0 ? "+" : ""}{improvement}%</strong></div>
        <div><span>平均反应</span><strong>{reactionTime || "—"}<small>{reactionTime ? "ms" : ""}</small></strong></div>
        <div><span>节奏评分</span><strong>{rhythmScore || "—"}<small>{rhythmScore ? "/100" : ""}</small></strong></div>
        <div><span>首要薄弱键</span><strong>{weakKeys[0]?.character?.toUpperCase() || "—"}</strong></div>
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
          ) : <p className="report-clean">✓ 本次零错误，准确率表现优秀。</p>}
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

      <section className="report-finger-heatmap">
        <div className="report-section-title"><strong>Finger Heatmap</strong><span>ERROR DISTRIBUTION</span></div>
        <div>
          {fingers.map((finger) => (
            <article className={finger.level} key={finger.id}>
              <span>{finger.label}</span><strong>{finger.errorRate}%</strong><small>{finger.errors} errors</small>
            </article>
          ))}
        </div>
      </section>

      <section className="report-training-plan">
        <div className="report-section-title"><strong>今日训练</strong><span>PERSONAL PLAN</span></div>
        <div>
          {plan.map((item, index) => (
            <button type="button" key={item.id} onClick={() => onStartPlan(item)}>
              <i>{index + 1}</i>
              <span><strong>{item.title}</strong><small>{item.reason}</small></span>
              <b>{item.duration} MIN</b>
              <em>→</em>
            </button>
          ))}
        </div>
      </section>

      <section className="report-recommendation">
        <span>RECOMMENDED NEXT</span>
        <div><strong>{report.recommendation.label}</strong><p>{report.recommendation.reason}</p></div>
        <small>每日 {report.dailyDrill.duration} 分钟 · 重点 {report.dailyDrill.focus}</small>
        <button onClick={onApplyRecommendation}>开始推荐训练 <span>→</span></button>
      </section>

      <div className="report-actions">
        <button onClick={onBack}>返回成绩</button>
        <button onClick={onRestart}>再练一轮 <span>→</span></button>
      </div>
    </div>
  );
}
