"use client";

import { AnimatePresence, motion } from "framer-motion";

const copy = {
  level: { eyebrow: "LEVEL UP", title: (event) => `Level ${event.level}`, detail: (event) => event.title },
  achievement: { eyebrow: "ACHIEVEMENT UNLOCKED", title: (event) => event.title, detail: (event) => event.detail },
  mission: { eyebrow: "DAILY MISSION COMPLETE", title: (event) => event.title, detail: (event) => `+${event.reward} XP` },
};

export default function GrowthNotifications({ event, onDismiss }) {
  const content = event ? copy[event.type] : null;
  return (
    <AnimatePresence>
      {event && content && (
        <motion.button
          type="button"
          className={`growth-notification ${event.type}`}
          onClick={onDismiss}
          initial={{ opacity: 0, y: -30, scale: .92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: .96 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
        >
          <div className="growth-notification-orbit"><i /><i /><i /><i /></div>
          <span>{content.eyebrow}</span>
          <strong>{content.title(event)}</strong>
          <small>{content.detail(event)}</small>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
