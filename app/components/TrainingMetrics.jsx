"use client";

import { memo } from "react";

function Metric({ label, value, unit, detail, progress, tone, primary }) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  return (
    <div className={`flow-metric ${tone || ""} ${primary ? "primary" : ""}`}>
      <div className="flow-metric-label"><i /><span>{label}</span><small>{detail}</small></div>
      <strong>{value}<small>{unit}</small></strong>
      <div className="flow-metric-line"><i style={{ width: `${safeProgress}%` }} /></div>
    </div>
  );
}

function TrainingMetrics({ wpm, accuracy, consistency, timeLabel, timeProgress, best }) {
  return (
    <div className="training-metrics flow-metrics" aria-label="实时训练数据">
      <Metric label="Velocity" value={wpm} unit="WPM" detail={`best ${best}`} progress={Math.min(100, wpm)} tone="speed" primary />
      <Metric label="Precision" value={accuracy} unit="%" detail="accuracy" progress={accuracy} tone="accuracy" />
      <Metric label="Cadence" value={consistency} unit="%" detail="stability" progress={consistency} tone="consistency" />
      <Metric label="Remaining" value={timeLabel} unit="" detail="time" progress={timeProgress} tone="time" />
    </div>
  );
}

export default memo(TrainingMetrics);
