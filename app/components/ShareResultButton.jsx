"use client";

import { useState } from "react";
import { downloadResultCard, shareResult } from "../services/share";

export default function ShareResultButton({ result }) {
  const [message, setMessage] = useState("");

  async function share() {
    try {
      const outcome = await shareResult(result);
      setMessage(outcome === "copied" ? "链接已复制" : outcome === "shared" ? "已分享" : "当前浏览器不支持分享");
    } catch (error) {
      if (error?.name !== "AbortError") setMessage("分享未完成");
    }
    window.setTimeout(() => setMessage(""), 2200);
  }

  return (
    <div className="result-share-actions">
      <button type="button" className="share-result-button" onClick={share}>分享成绩</button>
      <button type="button" className="share-image-button" onClick={() => downloadResultCard(result)}>保存图片</button>
      {message && <span role="status">{message}</span>}
    </div>
  );
}

