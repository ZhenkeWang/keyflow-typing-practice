"use client";

import { memo } from "react";

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

function Signal({ id, label, value, unit, progress, caption, primary = false }) {
  return (
    <article className={`signal-metric ${primary ? "primary" : ""}`}>
      <header><span>{id}</span><small>{label}</small><i /></header>
      <div><strong>{value}</strong><em>{unit}</em></div>
      <footer><span><i style={{ transform: `scaleX(${clamp(progress) / 100})` }} /></span><small>{caption}</small></footer>
    </article>
  );
}

function TrainingMetrics({ wpm, accuracy, consistency, timeLabel, timeProgress, best }) {
  return (
    <div className="training-metrics signal-console" aria-label="实时训练数据">
      <Signal id="01" label="速度" value={wpm} unit="WPM" progress={wpm} caption={`个人最佳 ${best}`} primary />
      <Signal id="02" label="准确率" value={accuracy} unit="%" progress={accuracy} caption="每一次准确输入" />
      <Signal id="03" label="稳定性" value={consistency} unit="%" progress={consistency} caption="保持均匀节奏" />
      <Signal id="04" label="剩余" value={timeLabel} unit="" progress={timeProgress} caption="本轮训练" />
    </div>
  );
}

export default memo(TrainingMetrics);
