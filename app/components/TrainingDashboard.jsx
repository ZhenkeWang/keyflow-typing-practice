"use client";

import { memo, useMemo, useState } from "react";
import {
  buildDailySeries,
  buildGrowthProfile,
  buildPersonalPlan,
  calculateGrowthStats,
} from "../utils/growthEngine";
import CountUp from "../animations/CountUp";
import Reveal from "../animations/Reveal";
import DailyMissions from "./DailyMissions";
import SkillTree from "./SkillTree";
import AiPersonalCoach from "./AiPersonalCoach";

function buildPoints(values, width = 560, height = 160) {
  const active = values.filter((value) => value > 0);
  const min = active.length ? Math.min(...active) : 0;
  const max = active.length ? Math.max(...active) : 1;
  const range = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const normalized = value > 0 ? (value - min) / range : 0;
    return `${x.toFixed(1)},${(height - normalized * (height - 32) - 16).toFixed(1)}`;
  }).join(" ");
}

const avatarText = (profile) => profile?.username?.trim().slice(0, 2).toUpperCase() || "KF";

function MetricCard({ label, value, unit, detail, tone }) {
  return (
    <article className={`growth-metric-card ${tone}`}>
      <span>{label}</span>
      <strong><CountUp value={value} /><small>{unit}</small></strong>
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
        <span className={delta >= 0 ? "growth-positive" : "growth-negative"}>{delta >= 0 ? "+" : ""}{delta} {unit}</span>
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
            <g className="chart-grid-lines"><line x1="0" y1="35" x2="560" y2="35" /><line x1="0" y1="90" x2="560" y2="90" /><line x1="0" y1="145" x2="560" y2="145" /></g>
            <polygon className="daily-chart-area" points={`0,174 ${points} 560,174`} fill={`url(#${className}-fill)`} />
            <polyline className="daily-chart-line" points={points} />
          </svg>
          <div className="daily-chart-labels">{labels.map((label, index) => <span key={`${label}-${index}`}>{index % 3 === 0 || index === labels.length - 1 ? label : ""}</span>)}</div>
        </>
      ) : <div className="chart-empty">继续训练后，这里会形成每日成长曲线。</div>}
    </article>
  );
}

function Leaderboard({ stats, profile, growth }) {
  const [scope, setScope] = useState("global");
  const samples = scope === "global"
    ? [
        { name: "Nova", wpm: 142, accuracy: 99, level: 50 },
        { name: "Mika", wpm: 130, accuracy: 98, level: 42 },
        { name: "Pixel", wpm: 124, accuracy: 99, level: 35 },
        { name: "Sora", wpm: 118, accuracy: 97, level: 28 },
      ]
    : [
        { name: "Luna", wpm: 108, accuracy: 98, level: 18 },
        { name: "Kai", wpm: 96, accuracy: 97, level: 13 },
      ];
  const userEntry = {
    name: profile.signedIn ? profile.username : "You",
    wpm: stats.bestWpm,
    accuracy: stats.averageAccuracy,
    level: growth.level,
    current: true,
  };
  const ranking = [...samples, userEntry].sort((a, b) => b.wpm - a.wpm);
  return (
    <article className="leaderboard-card season-leaderboard">
      <div className="dashboard-card-title">
        <div><strong>KeyFlow Season 01</strong><small>本地赛季竞技预览</small></div>
        <div className="leaderboard-tabs">
          <button className={scope === "global" ? "active" : ""} onClick={() => setScope("global")}>Global</button>
          <button className={scope === "friends" ? "active" : ""} onClick={() => setScope("friends")}>Friends</button>
        </div>
      </div>
      <div className="leaderboard-list">
        {ranking.map((item, index) => (
          <div className={item.current ? "current" : ""} key={`${scope}-${item.name}`}>
            <span>#{index + 1}</span><i>{item.name.slice(0, 2).toUpperCase()}</i><strong>{item.name}</strong>
            <small>Lv.{item.level}</small><b>{item.wpm}<em>WPM</em></b><small>{item.accuracy}%</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function TrainingDashboard({ history, xpTotal, profile, claimedMissionIds = [], onEditProfile, onStartPlan }) {
  const stats = useMemo(() => calculateGrowthStats(history, xpTotal), [history, xpTotal]);
  const growth = useMemo(() => buildGrowthProfile({ profile, history, xpTotal, claimedMissionIds }), [claimedMissionIds, history, profile, xpTotal]);
  const daily = useMemo(() => buildDailySeries(history, 14), [history]);
  const activity = useMemo(() => buildDailySeries(history, 365), [history]);
  const plan = useMemo(() => buildPersonalPlan(history), [history]);
  const unlockedCount = growth.achievements.filter((item) => item.unlocked).length;

  return (
    <Reveal as="section" className="training-dashboard growth-center phase-three-dashboard" amount={.04}>
      <div className="growth-dashboard-hero phase-three-profile">
        <div className="growth-profile">
          <button className="growth-avatar" type="button" onClick={onEditProfile}>{avatarText(profile)}</button>
          <div>
            <span>PERSONAL TRAINING CENTER</span>
            <h2>{profile.signedIn ? profile.username : "Your KeyFlow Journey"} <em>{growth.activeTitle}</em></h2>
            <p>每一次练习都会转化为经验、技能与长期成长。</p>
          </div>
        </div>
        <button className="growth-profile-button" type="button" onClick={onEditProfile}>{profile.signedIn ? "编辑档案" : "创建本地档案"}</button>
        <div className="growth-level-ring" style={{ "--level-progress": `${growth.progress * 360}deg` }}>
          <div><small>LEVEL</small><strong><CountUp value={growth.level} /></strong><span>{growth.title}</span></div>
        </div>
        <div className="growth-xp">
          <div><span>Experience</span><strong><CountUp value={growth.currentXp} /> / <CountUp value={growth.nextLevelXp} /> XP</strong></div>
          <span><i style={{ width: `${growth.progress * 100}%` }} /></span>
        </div>
        <div className="profile-skill-strip">
          {Object.entries(growth.skills).map(([key, skill]) => <span key={key}><small>{key}</small><strong>Lv.{skill.level}</strong></span>)}
        </div>
      </div>

      <div className="growth-metric-grid">
        <MetricCard label="Total Characters" value={stats.totalCharacters} unit="" detail={`${stats.sessions} training sessions`} tone="characters" />
        <MetricCard label="Practice Time" value={Math.round(stats.totalPracticeSeconds / 60)} unit="MIN" detail="Focused training time" tone="time" />
        <MetricCard label="Average WPM" value={stats.averageWpm} unit="WPM" detail={`Best ${stats.bestWpm} WPM`} tone="speed" />
        <MetricCard label="Average Accuracy" value={stats.averageAccuracy} unit="%" detail="Across all sessions" tone="accuracy" />
        <MetricCard label="Practice Streak" value={stats.streak} unit="DAYS" detail={stats.streak ? "Keep the flow alive" : "Train today to begin"} tone="streak" />
      </div>

      <AiPersonalCoach history={history} profile={profile} onStartPlan={onStartPlan} />

      <div className="phase-three-core-grid">
        <SkillTree skills={growth.skills} />
        <DailyMissions missions={growth.missions} />
      </div>

      <div className="daily-trends-grid">
        <TrendChart title="WPM 成长曲线" detail="最近 14 天的每日平均速度" values={daily.map((item) => item.wpm)} labels={daily.map((item) => item.label)} unit="WPM" className="wpm-trend" />
        <TrendChart title="Accuracy 趋势" detail="最近 14 天的每日平均准确率" values={daily.map((item) => item.accuracy)} labels={daily.map((item) => item.label)} unit="%" className="accuracy-trend" />
      </div>

      <div className="growth-content-grid phase-four-activity-grid">
        <article className="extended-heatmap-card yearly-heatmap-card">
          <div className="dashboard-card-title">
            <div><strong>年度训练热力图</strong><small>过去 365 天 · 每格代表一天</small></div>
            <span>🔥 {stats.streak} DAY STREAK</span>
          </div>
          <div className="yearly-heatmap-scroll">
            <div className="extended-heatmap yearly-heatmap" role="img" aria-label="过去一年训练热力图">
              {activity.map((day) => {
                const level = day.characters > 1200 ? 4 : day.characters > 700 ? 3 : day.characters > 250 ? 2 : day.sessions ? 1 : 0;
                return <i key={day.key} className={`level-${level}`} title={`${day.label} · ${day.sessions} 次 · ${day.characters} 字符`} />;
              })}
            </div>
          </div>
          <div className="heatmap-legend"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`level-${level}`} />)}<span>More</span></div>
        </article>

      </div>

      <div className="achievements-section phase-three-achievements">
        <div className="growth-section-heading"><div><span>ACHIEVEMENTS</span><h3>Milestones that shape your keyboard identity</h3></div><strong>{unlockedCount} / {growth.achievements.length}</strong></div>
        <div className="achievement-grid">
          {growth.achievements.map((achievement) => (
            <article className={achievement.unlocked ? "unlocked" : "locked"} key={achievement.id}>
              <i>{achievement.icon}</i><div><small>{achievement.category}</small><strong>{achievement.title}</strong><p>{achievement.detail}</p></div>
              <span><b style={{ width: `${achievement.progress * 100}%` }} /></span><small>{achievement.unlocked ? "UNLOCKED" : `${Math.round(achievement.progress * 100)}%`}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="titles-card">
        <div className="dashboard-card-title"><div><strong>Titles</strong><small>成就会解锁可展示称号</small></div><span>{growth.titles.filter((title) => title.unlocked).length} UNLOCKED</span></div>
        <div>{growth.titles.map((title) => <span className={title.unlocked ? "unlocked" : ""} key={title.id}>{title.label}</span>)}</div>
      </div>

      <div className="plan-leaderboard-grid">
        <article className="personal-plan-card">
          <div className="dashboard-card-title"><div><strong>Your 3-Day Plan</strong><small>根据近期表现自动生成</small></div><span>MADE FOR YOU</span></div>
          <div className="training-plan-list">
            {plan.map((item, index) => (
              <button type="button" key={item.day} onClick={() => onStartPlan(item.mode)}>
                <span>{String(index + 1).padStart(2, "0")}</span><div><small>{item.day}</small><strong>{item.title}</strong><p>{item.reason}</p></div><b>{item.duration}</b><i>→</i>
              </button>
            ))}
          </div>
        </article>
        <Leaderboard stats={stats} profile={profile} growth={growth} />
      </div>
    </Reveal>
  );
}

export default memo(TrainingDashboard);
