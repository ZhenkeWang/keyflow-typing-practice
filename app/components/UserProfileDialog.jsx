"use client";

import { useEffect, useState } from "react";

const initials = (name = "") => name.trim().slice(0, 2).toUpperCase() || "KF";

export default function UserProfileDialog({ open, profile, onClose, onSave, onSignOut }) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (open) setDraft(profile);
  }, [open, profile]);

  if (!open) return null;

  function submit(event) {
    event.preventDefault();
    const username = draft.username.trim();
    const email = draft.email.trim();
    if (!username || !email) return;
    onSave({ ...draft, username, email, signedIn: true });
  }

  return (
    <div className="profile-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="profile-dialog-close" type="button" onClick={onClose} aria-label="关闭">×</button>
        <div className="profile-dialog-heading">
          <span className="profile-avatar">{initials(draft.username)}</span>
          <div>
            <span>KEYFLOW PROFILE</span>
            <h2 id="profile-dialog-title">{profile.signedIn ? "编辑个人档案" : "创建本地训练档案"}</h2>
            <p>训练记录仅保存在当前设备。接入云数据库后可升级为跨设备账号。</p>
          </div>
        </div>

        <form onSubmit={submit}>
          <label>
            <span>显示名称</span>
            <input
              value={draft.username}
              onChange={(event) => setDraft((current) => ({ ...current, username: event.target.value }))}
              placeholder="KeyFlow Typist"
              autoComplete="nickname"
              maxLength={24}
              required
            />
          </label>
          <label>
            <span>邮箱</span>
            <input
              type="email"
              value={draft.email}
              onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            <span>训练目标</span>
            <select
              value={draft.goal}
              onChange={(event) => setDraft((current) => ({ ...current, goal: event.target.value }))}
            >
              <option value="accuracy">提高准确率</option>
              <option value="speed">突破速度</option>
              <option value="coding">代码输入</option>
              <option value="rhythm">稳定节奏</option>
            </select>
          </label>

          <div className="profile-dialog-actions">
            {profile.signedIn && <button className="profile-signout" type="button" onClick={onSignOut}>退出本地档案</button>}
            <button className="profile-save" type="submit">{profile.signedIn ? "保存资料" : "开始使用"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
