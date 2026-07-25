"use client";

import { memo, useMemo, useState } from "react";
import {
  buildCoachSummary,
  buildDailySeries,
  buildPersonalPlan,
  calculateGrowthStats,
  getAchievements,
} from "../utils/growthEngine";

const formatDuration = (seconds) => {
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const formatNumber = (value) => new Intl.NumberFormat("en-US", {
  notation: value >= 10_000 ? "compact" : "standard",
  maximumFractionDigits: 1,
}).format(value);

function buildPoints(values, width = 560, height = 160) {
  if (!values.length) return "";
  const active = values.filter((value) => value > 0);
  const min = active.length ? Math.min(...active) : 0;
  const max = active.length ? Math.max(...active) : 1;
  const range = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const normalized = value > 0 ? (value - min) / range : 0;
    const y = height - normalized * (height - 32) - 16;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

const avatarText = (profile) => profile?.username?.trim().slice(0, 2).toUpperCase() || "KF";

function MetricCard({ label, value, unit, detail, tone }) {
  return (
    <article className={`growth-metric-card ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}<small>{unit}</small></strong>
      <p>{detail}</p>
    </article>
  );
}

function TrendChart({ title, detail, values, labels, unit, className }) {
  const points = buildPoints(values);
  const active = values.filter(Boolean);
  const delta = active.length > 1 ? active.at(-1) - active[0] : 0;
  return (
    <article className={`daily-trend-card ${className}`}>
      <div className="dashboard-card-title">
        <div><strong>{title}</strong><small>{detail}</small></div>
        <span className={delta >= 0 ? "growth-positive" : "growth-negative"}>
          {delta >= 0 ? "+" : ""}{delta} {unit}
        </span>
      </div>
      {active.length > 1 ? (
        <>
          <svg viewBox="0 0 560 190" role="img" aria-label={`${title}图表`}>
            <defs>
              <linearGradient id={`${className}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity=".22" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className="chart-grid-lines">
              <line x1="0" y1="35" x2="560" y2="35" />
              <line x1="0" y1="90" x2="560" y2="90" />
              <line x1="0" y1="145" x2="560" y2="145" />
            </g>
            <polygon className="daily-chart-area" points={`0,174 ${points} 560,174`} fill={`url(#${className}-fill)`} />
            <polyline className="daily-chart-line" points={points} />
            {points.split(" ").map((point, index) => {
              const [cx, cy] = point.split(",");
              return values[index] > 0 ? <circle key={`${point}-${index}`} cx={cx} cy={cy} r="3.5" /> : null;
            })}
          </svg>
          <div className="daily-chart-labels">
            {labels.map((label, index) => <span key={`${label}-${index}`}>{index % 3 === 0 || index === labels.length - 1 ? label : ""}</span>)}
          </div>
        </>
      ) : <div className="chart-empty">继续训练后，这里会形成每天的成长曲线。</div>}
    </article>
  );
}

function Leaderboard({ stats, profile }) {
  const [scope, setScope] = useState("global");
  const samples = scope === "global"
    ? [
        { name: "Nova", wpm: 142, level: 37 },
        { name: "Mika", wpm: 131, level: 31 },
        { name: "Pixel", wpm: 124, level: 28 },
        { name: "Sora", wpm: 118, level: 24 },
      ]
    : [
        { name: "Luna", wpm: 108, level: 18 },
        { name: "Kai", wpm: 96, level: 13 },
      ];
  const userEntry = {
    name: profile.signedIn ? profile.username : "You",
    wpm: stats.bestWpm,
    level: Math.max(1, Math.floor(stats.xpTotal / 1000) + 1),
    current: true,
  };
  const ranking = [...samples, userEntry].sort((a, b) => b.wpm - a.wpm);

  return (
    <article className="leaderboard-card">
      <div className="dashboard-card-title">
        <div><strong>Leaderboard</strong><small>社区排行预览 · 本地数据</small></div>
        <div className="leaderboard-tabs">
          <button className={scope === "global" ? "active" : ""} onClick={() => setScope("global")}>全球</button>
          <button className={scope === "friends" ? "active" : ""} onClick={() => setScope("friends")}>好友</button>
        </div>
      </div>
      <div className="leaderboard-list">
        {ranking.map((item, index) => (
          <div className={item.current ? "current" : ""} key={`${scope}-${item.name}`}>
            <span>{index + 1}</span>
            <i>{item.name.slice(0, 2).toUpperCase()}</i>
            <strong>{item.name}</strong>
            <small>Lv.{item.level}</small>
            <b>{item.wpm}<em>WPM</em></b>
          </div>
        ))}
      </div>
      <p>接入云数据库后可替换为经过验证的实时全球与好友排行。</p>
    </article>
  );
}

function TrainingDashboard({ history, levelInfo, xpTotal, profile, onEditProfile, onStartPlan }) {
  const stats = useMemo(() => calculateGrowthStats(history, xpTotal), [history, xpTotal]);
  const daily = useMemo(() => buildDailySeries(history, 14), [history]);
  const activity = useMemo(() => buildDailySeries(history, 84), [history]);
  const achievements = useMemo(() => getAchievements(history), [history]);
  const plan = useMemo(() => buildPersonalPlan(history), [history]);
  const coach = useMemo(() => buildCoachSummary(history), [history]);
  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  return (
    <section className="training-dashboard growth-center">
      <div className="growth-dashboard-hero">
        <div className="growth-profile">
          <button className="growth-avatar" type="button" onClick={onEditProfile}>{avatarText(profile)}</button>
          <div>
            <span>PERSONAL TRAINING CENTER</span>
            <h2>{profile.signedIn ? profile.username : "Your KeyFlow Journey"}</h2>
            <p>每一次准确击键，都会成为下一阶段训练的依据。</p>
          </div>
        </div>
        <button className="growth-profile-button" type="button" onClick={onEditProfile}>
          {profile.signedIn ? "编辑档案" : "创建本地档案"}
        </button>
        <div className="growth-level-ring" style={{ "--level-progress": `${levelInfo.progress * 360}deg` }}>
          <div><small>LEVEL</small><strong>{levelInfo.level}</strong><span>{levelInfo.title}</span></div>
        </div>
        <div className="growth-xp">
          <div><span>Next level</span><strong>{levelInfo.currentXp} / {levelInfo.nextLevelXp} XP</strong></div>
          <span><i style={{ width: `${levelInfo.progress * 100}%` }} /></span>
        </div>
      </div>

      <div className="growth-metric-grid">
        <MetricCard label="Total Characters" value={formatNumber(stats.totalCharacters)} unit="" detail={`${stats.sessions} training sessions`} tone="characters" />
        <MetricCard label="Practice Time" value={formatDuration(stats.totalPracticeSeconds)} unit="" detail="Focused training time" tone="time" />
        <MetricCard label="Average WPM" value={stats.averageWpm} unit="WPM" detail={`Best ${stats.bestWpm} WPM`} tone="speed" />
        <MetricCard label="Average Accuracy" value={stats.averageAccuracy} unit="%" detail="Across all sessions" tone="accuracy" />
        <MetricCard label="Practice Streak" value={stats.streak} unit="DAYS" detail={stats.streak ? "Keep the flow alive" : "Train today to begin"} tone="streak" />
      </div>

      <div className="daily-trends-grid">
        <TrendChart
          title="WPM 成长曲线"
          detail="最近 14 天的每日平均速度"
          values={daily.map((item) => item.wpm)}
          labels={daily.map((item) => item.label)}
          unit="WPM"
          className="wpm-trend"
        />
        <TrendChart
          title="Accuracy 趋势"
          detail="最近 14 天的每日平均准确率"
          values={daily.map((item) => item.accuracy)}
          labels={daily.map((item) => item.label)}
          unit="%"
          className="accuracy-trend"
        />
      </div>

      <div className="growth-content-grid">
        <article className="extended-heatmap-card">
          <div className="dashboard-card-title">
            <div><strong>训练热力图</strong><small>过去 12 周 · 每格代表一天</small></div>
            <span>{stats.streak} DAY STREAK</span>
          </div>
          <div className="extended-heatmap" role="img" aria-label="过去十二周训练热力图">
            {activity.map((day) => {
              const level = day.characters > 1200 ? 4 : day.characters > 700 ? 3 : day.characters > 250 ? 2 : day.sessions ? 1 : 0;
              return <i key={day.key} className={`level-${level}`} title={`${day.label} · ${day.sessions} 次 · ${day.characters} 字符`} />;
            })}
          </div>
          <div className="heatmap-legend"><span>少</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`level-${level}`} />)}<span>多</span></div>
        </article>

        <article className="coach-snapshot-card">
          <div className="dashboard-card-title">
            <div><strong>AI Coach Snapshot</strong><small>基于最近 12 次训练</small></div>
            <span>LOCAL ANALYSIS</span>
          </div>
          <div className="coach-strength">
            <span>优势</span>
            <p>{coach.strengths[0]}</p>
          </div>
          <div className="coach-issues">
            <span>当前重点</span>
            {coach.issues.slice(0, 2).map((issue) => (
              <div key={issue.label}><code>{issue.label}</code><p>{issue.detail}</p></div>
            ))}
          </div>
          <div className="coach-next">
            <span>NEXT BEST SESSION</span>
            <strong>{coach.recommendation.title}</strong>
            <small>{coach.recommendation.duration} · {coach.recommendation.reason}</small>
          </div>
        </article>
      </div>

      <div className="achievements-section">
        <div className="growth-section-heading">
          <div><span>ACHIEVEMENTS</span><h3>Milestones that keep you moving</h3></div>
          <strong>{unlockedCount} / {achievements.length}</strong>
        </div>
        <div className="achievement-grid">
          {achievements.map((achievement) => (
            <article className={achievement.unlocked ? "unlocked" : "locked"} key={achievement.id}>
              <i>{achievement.icon}</i>
              <div><strong>{achievement.title}</strong><p>{achievement.detail}</p></div>
              <span><b style={{ width: `${achievement.progress * 100}%` }} /></span>
              <small>{achievement.unlocked ? "COMPLETED" : `${Math.round(achievement.progress * 100)}%`}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="plan-leaderboard-grid">
        <article className="personal-plan-card">
          <div className="dashboard-card-title">
            <div><strong>Your 3-Day Plan</strong><small>根据近期表现自动生成</small></div>
            <span>MADE FOR YOU</span>
          </div>
          <div className="training-plan-list">
            {plan.map((item, index) => (
              <button type="button" key={item.day} onClick={() => onStartPlan(item.mode)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>{item.day}</small><strong>{item.title}</strong><p>{item.reason}</p></div>
                <b>{item.duration}</b>
                <i>→</i>
              </button>
            ))}
          </div>
        </article>
        <Leaderboard stats={stats} profile={profile} />
      </div>
    </section>
  );
}

export default memo(TrainingDashboard);
