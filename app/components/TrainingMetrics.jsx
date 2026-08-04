"use client";

import { memo } from "react";

const clamp = (value) => Math.max(0, Math.min(100, value));

function Meter({ index, label, value, unit, progress, note, accent }) {
  return (
    <div className={`atelier-meter ${accent}`}>
      <span>{index}</span>
      <div><small>{label}</small><strong>{value}<em>{unit}</em></strong><i><b style={{ width: `${clamp(progress)}%` }} /></i></div>
      <small>{note}</small>
    </div>
  );
}

function TrainingMetrics({ wpm, accuracy, consistency, timeLabel, timeProgress, best }) {
  return (
    <div className="training-metrics atelier-meters" aria-label="实时训练数据">
      <Meter index="01" label="PACE" value={wpm} unit="WPM" progress={wpm} note={`PB ${best}`} accent="pace" />
      <Meter index="02" label="CLEAN" value={accuracy} unit="%" progress={accuracy} note="ACCURACY" accent="clean" />
      <Meter index="03" label="RHYTHM" value={consistency} unit="%" progress={consistency} note="STABILITY" accent="rhythm" />
      <Meter index="04" label="LEFT" value={timeLabel} unit="" progress={timeProgress} note="SESSION" accent="left" />
    </div>
  );
}

export default memo(TrainingMetrics);
