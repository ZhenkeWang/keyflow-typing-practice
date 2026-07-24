"use client";

const average = (items, key) => items.length
  ? Math.round(items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / items.length)
  : 0;

const dateKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

function buildPoints(values, width = 520, height = 126) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 22) - 11;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function buildActivity(history) {
  const totals = history.reduce((result, item) => {
    const key = dateKey(item.timestamp);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
  return Array.from({ length: 49 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (48 - index));
    const count = totals[dateKey(date)] || 0;
    return { date, count, level: Math.min(4, count) };
  });
}

function buildErrorDistribution(history) {
  const totals = {};
  history.forEach((record) => {
    (record.mistakes || []).forEach((mistake) => {
      const label = mistake.expected === " " ? "Space" : mistake.expected;
      totals[label] = (totals[label] || 0) + (Number(mistake.count) || 0);
    });
  });
  return Object.entries(totals)
    .map(([character, count]) => ({ character, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function AbilityBar({ label, value, detail }) {
  return (
    <div className="ability-row">
      <div><span>{label}</span><small>{detail}</small></div>
      <div className="ability-track"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
      <strong>{Math.round(value)}</strong>
    </div>
  );
}

export default function TrainingDashboard({ history, levelInfo }) {
  const chronological = [...history].sort((a, b) => a.timestamp - b.timestamp).slice(-12);
  const speeds = chronological.map((item) => item.wpm);
  const accuracies = chronological.map((item) => item.accuracy);
  const avgSpeed = average(history, "wpm");
  const avgAccuracy = average(history, "accuracy");
  const avgConsistency = average(history, "consistency");
  const totalMinutes = Math.round(history.reduce((sum, item) => sum + (item.duration || 0), 0) / 60);
  const codeSessions = history.filter((item) => item.mode === "code");
  const numberSessions = history.filter((item) => item.mode === "numbers");
  const activity = buildActivity(history);
  const errorDistribution = buildErrorDistribution(history);
  const maxErrorCount = Math.max(1, ...errorDistribution.map((item) => item.count));
  const growth = chronological.length > 1 ? chronological.at(-1).wpm - chronological[0].wpm : 0;

  return (
    <section className="training-dashboard">
      <div className="dashboard-heading">
        <div><span>PERFORMANCE DASHBOARD</span><h2>Your training signal</h2></div>
        <div className="level-progress">
          <span>Lv.{levelInfo.level} · {levelInfo.title}</span>
          <div><i style={{ width: `${levelInfo.progress * 100}%` }} /></div>
          <small>{levelInfo.currentXp} / {levelInfo.nextLevelXp} XP</small>
        </div>
      </div>

      <div className="dashboard-summary">
        <div><span>Average speed</span><strong>{avgSpeed}<small>WPM</small></strong></div>
        <div><span>Average accuracy</span><strong>{avgAccuracy}<small>%</small></strong></div>
        <div><span>Practice time</span><strong>{totalMinutes}<small>MIN</small></strong></div>
        <div><span>Sessions</span><strong>{history.length}<small>TOTAL</small></strong></div>
      </div>

      <div className="dashboard-grid">
        <article className="trend-card">
          <div className="dashboard-card-title">
            <div><strong>成长趋势</strong><small>最近 12 次训练</small></div>
            <span className={growth >= 0 ? "growth-positive" : "growth-negative"}>{growth >= 0 ? "+" : ""}{growth} WPM</span>
          </div>
          {chronological.length > 1 ? (
            <svg viewBox="0 0 520 150" role="img" aria-label="速度与准确率趋势图">
              <g className="chart-grid-lines"><line x1="0" y1="30" x2="520" y2="30" /><line x1="0" y1="75" x2="520" y2="75" /><line x1="0" y1="120" x2="520" y2="120" /></g>
              <polyline className="accuracy-line" points={buildPoints(accuracies)} />
              <polyline className="speed-line" points={buildPoints(speeds)} />
              {buildPoints(speeds).split(" ").map((point, index) => {
                const [cx, cy] = point.split(",");
                return <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r="3.5" />;
              })}
            </svg>
          ) : <div className="chart-empty">完成至少两次训练后显示趋势曲线</div>}
          <div className="chart-legend"><span><i className="speed" /> Speed</span><span><i className="accuracy" /> Accuracy</span></div>
        </article>

        <article className="ability-card">
          <div className="dashboard-card-title"><div><strong>能力画像</strong><small>基于已完成训练</small></div><span>LIVE</span></div>
          <AbilityBar label="速度" detail="平均净 WPM" value={Math.min(100, avgSpeed)} />
          <AbilityBar label="准确率" detail="全部有效击键" value={avgAccuracy} />
          <AbilityBar label="稳定性" detail="击键间隔方差" value={avgConsistency} />
          <AbilityBar label="代码能力" detail={`${codeSessions.length} 次专项`} value={codeSessions.length ? average(codeSessions, "accuracy") : 0} />
          <AbilityBar label="数字能力" detail={`${numberSessions.length} 次专项`} value={numberSessions.length ? average(numberSessions, "accuracy") : 0} />
        </article>
      </div>

      <div className="dashboard-insights-grid">
        <article className="activity-card">
          <div className="dashboard-card-title"><div><strong>训练热力图</strong><small>过去 7 周的训练频率</small></div><span>49 DAYS</span></div>
          <div className="activity-heatmap" role="img" aria-label="过去七周训练热力图">
            {activity.map((day) => <i key={day.date.toISOString()} className={`level-${day.level}`} title={`${day.date.toLocaleDateString("zh-CN")} · ${day.count} 次训练`} />)}
          </div>
          <div className="heatmap-legend"><span>少</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`level-${level}`} />)}<span>多</span></div>
        </article>

        <article className="error-distribution-card">
          <div className="dashboard-card-title"><div><strong>错误分布</strong><small>历史高频错键</small></div><span>TOP KEYS</span></div>
          {errorDistribution.length ? (
            <div className="error-distribution-list">
              {errorDistribution.map((item) => (
                <div key={item.character}>
                  <code>{item.character}</code>
                  <span><i style={{ width: `${(item.count / maxErrorCount) * 100}%` }} /></span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          ) : <div className="dashboard-empty-small">完成新训练后，这里会显示错误分布。</div>}
        </article>
      </div>
    </section>
  );
}
