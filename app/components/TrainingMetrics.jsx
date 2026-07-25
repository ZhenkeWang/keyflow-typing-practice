"use client";

import { memo } from "react";

function Metric({ label, value, unit, detail, progress, tone }) {
  return (
    <div className={`training-metric ${tone || ""}`}>
      <div className="metric-ring" style={{ "--metric-progress": `${Math.max(0, Math.min(100, progress)) * 3.6}deg` }}>
        <i />
      </div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}<small>{unit}</small></strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function TrainingMetrics({ wpm, accuracy, consistency, timeLabel, timeProgress, best }) {
  return (
    <div className="training-metrics" aria-label="实时训练数据">
      <Metric label="Speed" value={wpm} unit="WPM" detail={`Best ${best}`} progress={Math.min(100, wpm)} tone="speed" />
      <Metric label="Accuracy" value={accuracy} unit="%" detail="Input precision" progress={accuracy} tone="accuracy" />
      <Metric label="Consistency" value={consistency} unit="%" detail="Rhythm stability" progress={consistency} tone="consistency" />
      <Metric label="Time" value={timeLabel} unit="" detail="Session remaining" progress={timeProgress} tone="time" />
    </div>
  );
}

export default memo(TrainingMetrics);
