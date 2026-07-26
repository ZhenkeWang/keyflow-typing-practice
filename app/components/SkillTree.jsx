"use client";

import { motion } from "framer-motion";

const SKILLS = [
  { id: "speed", label: "Speed", effect: "提升速度评分", axis: "top" },
  { id: "accuracy", label: "Accuracy", effect: "减少错误损耗", axis: "left" },
  { id: "rhythm", label: "Rhythm", effect: "提高稳定度", axis: "right" },
  { id: "coding", label: "Coding", effect: "强化符号输入", axis: "bottom" },
];

export default function SkillTree({ skills }) {
  return (
    <article className="skill-tree-card">
      <div className="dashboard-card-title">
        <div><strong>Typing Skill Tree</strong><small>训练会自动强化对应能力</small></div>
        <span>AUTO PROGRESS</span>
      </div>
      <div className="skill-tree" aria-label="打字技能树">
        <i className="skill-tree-line vertical" />
        <i className="skill-tree-line horizontal" />
        <div className="skill-tree-core"><span>KF</span></div>
        {SKILLS.map((skill, index) => {
          const data = skills[skill.id];
          return (
            <motion.div
              className={`skill-node ${skill.axis}`}
              key={skill.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 150, damping: 18, delay: index * .07 }}
            >
              <span>{skill.label}</span>
              <strong>Lv.{data.level}</strong>
              <small>{skill.effect}</small>
              <i><b style={{ width: `${data.progress * 100}%` }} /></i>
            </motion.div>
          );
        })}
      </div>
    </article>
  );
}
