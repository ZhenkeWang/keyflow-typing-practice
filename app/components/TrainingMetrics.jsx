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
      <Signal id="01" label="VELOCITY" value={wpm} unit="WPM" progress={wpm} caption={`PERSONAL BEST ${best}`} primary />
      <Signal id="02" label="PRECISION" value={accuracy} unit="%" progress={accuracy} caption="LIVE ACCURACY" />
      <Signal id="03" label="CADENCE" value={consistency} unit="%" progress={consistency} caption="RHYTHM STABILITY" />
      <Signal id="04" label="REMAINING" value={timeLabel} unit="" progress={timeProgress} caption="SESSION TIME" />
    </div>
  );
}

export default memo(TrainingMetrics);
