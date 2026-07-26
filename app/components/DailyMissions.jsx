"use client";

import { motion } from "framer-motion";

export default function DailyMissions({ missions }) {
  const completed = missions.filter((mission) => mission.completed).length;
  return (
    <article className="daily-missions-card">
      <div className="dashboard-card-title">
        <div><strong>Daily Missions</strong><small>每日零点刷新 · 完成后自动领取 XP</small></div>
        <span>{completed} / {missions.length}</span>
      </div>
      <div className="daily-mission-list">
        {missions.map((mission, index) => (
          <motion.div
            className={mission.completed ? "completed" : ""}
            key={mission.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * .08 }}
          >
            <i>{mission.completed ? "✓" : ""}</i>
            <div>
              <strong>{mission.title}</strong>
              <span><b style={{ width: `${mission.progress * 100}%` }} /></span>
              <small>{Math.min(mission.progressValue, mission.target)} / {mission.target}</small>
            </div>
            <em>+{mission.reward} XP</em>
          </motion.div>
        ))}
      </div>
    </article>
  );
}
