"use client";

export default function ErrorAnalysis({ mistakes, typed, text }) {
  if (!mistakes.length) {
    return (
      <section className="error-analysis is-clean">
        <div className="analysis-heading">
          <span className="analysis-icon">✓</span>
          <div><strong>Clean input</strong><small>当前还没有记录到错误</small></div>
        </div>
        <p>保持这个节奏。准确率稳定后，再逐步提高速度。</p>
      </section>
    );
  }

  const latest = mistakes.at(-1);
  const contextStart = Math.max(0, latest.index - 8);
  const contextEnd = Math.min(text.length, latest.index + 12);
  const expectedContext = text.slice(contextStart, contextEnd);
  const typedContext = typed.slice(contextStart, Math.min(typed.length, contextEnd));

  return (
    <section className="error-analysis">
      <div className="analysis-heading">
        <span className="analysis-icon">!</span>
        <div><strong>Error intelligence</strong><small>实时记录错误字符、次数与位置</small></div>
      </div>
      <div className="error-compare">
        <div><span>EXPECTED</span><code>{expectedContext || latest.expected}</code></div>
        <div><span>TYPED</span><code>{typedContext || latest.typed}</code></div>
      </div>
      <div className="error-chips">
        {mistakes.slice(0, 4).map((item) => (
          <span key={item.key}>
            <b>{item.expected === " " ? "Space" : item.expected}</b>
            <i>→</i>
            <b>{item.typed === " " ? "Space" : item.typed}</b>
            <small>×{item.count} · #{item.index + 1}</small>
          </span>
        ))}
      </div>
    </section>
  );
}
