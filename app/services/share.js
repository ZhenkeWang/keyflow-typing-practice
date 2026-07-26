export function buildResultShareText(result) {
  return `KeyFlow · ${result.wpm} WPM · ${result.accuracy}% Accuracy · ${result.mode || "Training"}`;
}

export async function shareResult(result) {
  const text = buildResultShareText(result);
  const url = typeof window === "undefined" ? "" : window.location.origin;
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title: "KeyFlow Training Result", text, url });
    return "shared";
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  }
  return "unsupported";
}

export function downloadResultCard(result) {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, "#0a0b11");
  gradient.addColorStop(.55, "#20204a");
  gradient.addColorStop(1, "#143a35");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 630);
  context.fillStyle = "rgba(255,255,255,.08)";
  context.beginPath();
  context.roundRect(80, 70, 1040, 490, 46);
  context.fill();
  context.fillStyle = "#f5f5f7";
  context.font = "700 58px Inter, sans-serif";
  context.fillText("KeyFlow", 140, 165);
  context.font = "800 150px Inter, sans-serif";
  context.fillText(String(result.wpm), 140, 355);
  context.font = "600 34px Inter, sans-serif";
  context.fillText("WPM", 470, 350);
  context.fillStyle = "#7ef0d0";
  context.font = "650 44px Inter, sans-serif";
  context.fillText(`${result.accuracy}% accuracy`, 140, 455);
  context.fillStyle = "rgba(255,255,255,.58)";
  context.font = "500 24px Inter, sans-serif";
  context.fillText(`${result.mode || "Training"} · ${new Date().toLocaleDateString()}`, 140, 515);
  const link = document.createElement("a");
  link.download = `keyflow-${result.wpm}wpm.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  return true;
}

