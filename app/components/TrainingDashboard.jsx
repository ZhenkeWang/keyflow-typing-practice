"use client";

const average = (items, key) => items.length
  ? Math.round(items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / items.length)
  : 0;

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

function AbilityBar({ label, value, detail }) {
  return (
    <div className="ability-row">
      <div><span>{label}</span><small>{detail}</small></div>
      <div className="ability-track"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
      <strong>{Math.round(value)}</strong>
    </div>
  );
}

export default function TrainingDashboard({ history, level, xpTotal }) {
  const chronological = [...history].sort((a, b) => a.timestamp - b.timestamp).slice(-12);
  const speeds = chronological.map((item) => item.wpm);
  const accuracies = chronological.map((item) => item.accuracy);
  const avgSpeed = average(history, "wpm");
  const avgAccuracy = average(history, "accuracy");
  const avgConsistency = average(history, "consistency");
  const totalMinutes = Math.round(history.reduce((sum, item) => sum + (item.duration || 0), 0) / 60);
  const codeSessions = history.filter((item) => item.mode === "code");
  const numberSessions = history.filter((item) => item.mode === "numbers");
  const codeAbility = codeSessions.length ? average(codeSessions, "accuracy") : 0;
  const numberAbility = numberSessions.length ? average(numberSessions, "accuracy") : 0;

  return (
    <section className="training-dashboard">
      <div className="dashboard-heading">
        <div><span>PERFORMANCE DASHBOARD</span><h2>Your training signal</h2></div>
        <div className="level-progress">
          <span>Level {level}</span>
          <div><i style={{ width: `${(xpTotal % 1000) / 10}%` }} /></div>
          <small>{xpTotal % 1000} / 1000 XP</small>
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
          <div className="dashboard-card-title"><div><strong>Performance trend</strong><small>Last 12 sessions</small></div><span>WPM / ACC</span></div>
          {chronological.length > 1 ? (
            <svg viewBox="0 0 520 150" role="img" aria-label="速度与准确率趋势图">
              <defs>
                <linearGradient id="speed-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#777aff" stopOpacity=".3" />
                  <stop offset="100%" stopColor="#777aff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g className="chart-grid-lines"><line x1="0" y1="30" x2="520" y2="30" /><line x1="0" y1="75" x2="520" y2="75" /><line x1="0" y1="120" x2="520" y2="120" /></g>
              <polyline className="accuracy-line" points={buildPoints(accuracies)} />
              <polyline className="speed-line" points={buildPoints(speeds)} />
              {buildPoints(speeds).split(" ").map((point, index) => {
                const [cx, cy] = point.split(",");
                return <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r="3.5" />;
              })}
            </svg>
          ) : (
            <div className="chart-empty"><i />完成至少两次训练后显示趋势曲线</div>
          )}
          <div className="chart-legend"><span><i className="speed" /> Speed</span><span><i className="accuracy" /> Accuracy</span></div>
        </article>

        <article className="ability-card">
          <div className="dashboard-card-title"><div><strong>Ability profile</strong><small>Based on completed sessions</small></div><span>LIVE</span></div>
          <AbilityBar label="速度" detail="平均净 WPM" value={Math.min(100, avgSpeed)} />
          <AbilityBar label="准确率" detail="全部击键" value={avgAccuracy} />
          <AbilityBar label="稳定性" detail="击键间隔方差" value={avgConsistency} />
          <AbilityBar label="代码能力" detail={`${codeSessions.length} 次专项`} value={codeAbility} />
          <AbilityBar label="数字能力" detail={`${numberSessions.length} 次专项`} value={numberAbility} />
        </article>
      </div>
    </section>
  );
}
