"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildCoachSummary,
  calculateGrowthStats,
  calculateSkillLevels,
  getAchievements,
  getGrowthLevelInfo,
} from "../utils/growthEngine";
import { useAuthStore } from "../stores/authStore";
import { THEME_PRESETS, useThemeStore } from "../stores/themeStore";
import {
  pullCloudSnapshot,
  syncGrowthSnapshot,
  syncLeaderboardEntry,
  syncTrainingRecords,
  upsertProfile,
} from "../services/sync";
import {
  getFriends,
  getLeaderboard,
  requestFriend,
  respondToFriendRequest,
  searchPeople,
} from "../services/social";

const TABS = [
  ["profile", "Profile"],
  ["themes", "Themes"],
  ["network", "Network"],
  ["membership", "Membership"],
  ["settings", "Settings"],
];

const initials = (value = "") => value.trim().slice(0, 2).toUpperCase() || "KF";

function AccountPanel({ profile, history, xpTotal, onProfileChange, onCloudRecords }) {
  const configured = useAuthStore((state) => state.configured);
  const status = useAuthStore((state) => state.status);
  const session = useAuthStore((state) => state.session);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const signOut = useAuthStore((state) => state.signOut);
  const [authMode, setAuthMode] = useState("signin");
  const [credentials, setCredentials] = useState({
    username: profile.username || "",
    email: profile.email || "",
    password: "",
    avatar: profile.avatar || "",
    country: profile.country || "CN",
  });
  const [syncState, setSyncState] = useState("idle");
  const stats = useMemo(() => calculateGrowthStats(history, xpTotal), [history, xpTotal]);
  const level = useMemo(() => getGrowthLevelInfo(xpTotal), [xpTotal]);

  async function submit(event) {
    event.preventDefault();
    if (!configured) return;
    const action = authMode === "signup" ? signUp : signIn;
    const nextSession = await action(credentials);
    if (nextSession?.user) {
      onProfileChange({
        ...profile,
        username: credentials.username || nextSession.user.user_metadata?.username || profile.username || "KeyFlow User",
        email: credentials.email,
        signedIn: true,
        cloud: true,
      });
    }
  }

  async function sync() {
    if (!session) return;
    setSyncState("syncing");
    try {
      await upsertProfile(session, {
        ...profile,
        level: level.level,
        xp: xpTotal,
        title: level.title,
      }, {
        visualTheme: useThemeStore.getState().visualTheme,
      });
      await syncTrainingRecords(session, history);
      await syncGrowthSnapshot(session, {
        achievements: getAchievements(history),
        skills: calculateSkillLevels(history),
        analysis: buildCoachSummary(history),
      });
      await syncLeaderboardEntry(session, {
        ...profile,
        level: level.level,
        xp: xpTotal,
        title: level.title,
      }, stats);
      const snapshot = await pullCloudSnapshot(session);
      onCloudRecords?.(snapshot.records.map((row) => row.details || row));
      setSyncState("done");
    } catch {
      setSyncState("error");
    }
  }

  return (
    <div className="saas-profile-layout">
      <article className="saas-identity-card">
        <span className="saas-avatar">
          {profile.avatar ? <img src={profile.avatar} alt="" loading="lazy" referrerPolicy="no-referrer" /> : initials(profile.username)}
        </span>
        <div><small>KEYFLOW IDENTITY</small><h3>{profile.username || "Local Typist"}</h3><p>{level.title} · Level {level.level}</p></div>
        <dl>
          <div><dt>Best WPM</dt><dd>{stats.bestWpm}</dd></div>
          <div><dt>Accuracy</dt><dd>{stats.averageAccuracy}%</dd></div>
          <div><dt>Sessions</dt><dd>{stats.sessions}</dd></div>
          <div><dt>XP</dt><dd>{xpTotal}</dd></div>
        </dl>
        <div className="local-profile-editor">
          <label><span>显示名称</span><input value={credentials.username} maxLength={24} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} /></label>
          <label><span>头像 URL（可选）</span><input type="url" value={credentials.avatar} placeholder="https://…" onChange={(event) => setCredentials({ ...credentials, avatar: event.target.value })} /></label>
          <label><span>国家 / 地区</span><select value={credentials.country} onChange={(event) => setCredentials({ ...credentials, country: event.target.value })}><option value="CN">中国</option><option value="US">United States</option><option value="JP">日本</option><option value="GB">United Kingdom</option><option value="OTHER">其他</option></select></label>
          <label><span>训练目标</span><select value={profile.goal || "accuracy"} onChange={(event) => onProfileChange({ ...profile, goal: event.target.value })}><option value="accuracy">提高准确率</option><option value="speed">突破速度</option><option value="coding">代码输入</option><option value="rhythm">稳定节奏</option></select></label>
          <button type="button" onClick={() => onProfileChange({ ...profile, username: credentials.username.trim() || "KeyFlow User", email: credentials.email, avatar: credentials.avatar.trim(), country: credentials.country === "OTHER" ? null : credentials.country, signedIn: true })}>保存本地档案</button>
        </div>
      </article>

      <article className="cloud-account-card">
        <div className="saas-card-heading">
          <div><small>KEYFLOW CLOUD</small><h3>{session ? "跨设备同步已就绪" : "邮箱账号"}</h3></div>
          <span className={configured ? "online" : "offline"}>{configured ? "AVAILABLE" : "SETUP REQUIRED"}</span>
        </div>
        {!configured && (
          <div className="cloud-config-note">
            <strong>云服务尚未连接</strong>
            <p>本地训练完全可用。部署时配置 Supabase URL 与匿名发布密钥后，会自动启用真实注册、登录与同步。</p>
          </div>
        )}
        {session ? (
          <>
            <div className="cloud-session-row"><span>{session.user.email}</span><small>数据由行级安全策略隔离</small></div>
            <div className="saas-inline-actions">
              <button type="button" className="saas-primary" onClick={sync} disabled={syncState === "syncing"}>
                {syncState === "syncing" ? "正在同步…" : syncState === "done" ? "同步完成" : "立即同步"}
              </button>
              <button type="button" onClick={async () => { await signOut(); onProfileChange({ ...profile, cloud: false }); }}>退出云端</button>
            </div>
            {syncState === "error" && <p className="saas-error">同步失败，请检查网络或数据库策略。</p>}
          </>
        ) : (
          <form className="cloud-auth-form" onSubmit={submit}>
            <div className="auth-mode-switch">
              <button type="button" className={authMode === "signin" ? "active" : ""} onClick={() => setAuthMode("signin")}>登录</button>
              <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")}>注册</button>
            </div>
            {authMode === "signup" && (
              <label><span>用户名</span><input value={credentials.username} maxLength={24} required onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} /></label>
            )}
            <label><span>邮箱</span><input type="email" autoComplete="email" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label>
            <label><span>密码</span><input type="password" minLength={8} autoComplete={authMode === "signin" ? "current-password" : "new-password"} required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></label>
            <button className="saas-primary" disabled={!configured || status === "loading"}>{status === "loading" ? "连接中…" : authMode === "signin" ? "登录 KeyFlow" : "创建账号"}</button>
            <div className="future-auth-row"><button type="button" disabled>Google · 即将支持</button><button type="button" disabled>GitHub · 即将支持</button></div>
            {error && <p className="saas-error">{error}</p>}
            {message && <p className="saas-success">{message}</p>}
          </form>
        )}
      </article>
    </div>
  );
}

function ThemesPanel() {
  const visualTheme = useThemeStore((state) => state.visualTheme);
  const customTheme = useThemeStore((state) => state.customTheme);
  const setVisualTheme = useThemeStore((state) => state.setVisualTheme);
  const updateCustomTheme = useThemeStore((state) => state.updateCustomTheme);
  return (
    <div>
      <div className="saas-section-copy"><small>THEME STORE</small><h3>让训练空间更像你</h3><p>预设只改变视觉表达，不改变 Light / Dark 的时间自动切换逻辑。</p></div>
      <div className="theme-store-grid">
        {THEME_PRESETS.map((preset) => (
          <button type="button" className={visualTheme === preset.id ? "active" : ""} key={preset.id} onClick={() => setVisualTheme(preset.id)}>
            <span>{preset.swatches.map((color) => <i key={color} style={{ background: color }} />)}</span>
            <strong>{preset.label}</strong><small>{preset.description}</small>
          </button>
        ))}
      </div>
      <article className="custom-theme-editor">
        <div className="saas-card-heading"><div><small>CUSTOM THEME</small><h3>个人主题</h3></div><span>FREE · 1 SLOT</span></div>
        <div className="theme-field-grid">
          {[["background", "背景"], ["accent", "按钮与强调色"], ["keyboard", "键盘"]].map(([key, label]) => (
            <label key={key}><span>{label}</span><input type="color" value={customTheme[key]} onChange={(event) => updateCustomTheme({ [key]: event.target.value })} /></label>
          ))}
          <label><span>字体</span><select value={customTheme.font} onChange={(event) => updateCustomTheme({ font: event.target.value })}><option value="system">Apple System</option><option value="rounded">Rounded</option><option value="mono">Mono</option></select></label>
          <label><span>动画</span><select value={customTheme.motion} onChange={(event) => updateCustomTheme({ motion: event.target.value })}><option value="full">完整</option><option value="reduced">精简</option></select></label>
        </div>
      </article>
    </div>
  );
}

function NetworkPanel() {
  const configured = useAuthStore((state) => state.configured);
  const session = useAuthStore((state) => state.session);
  const [scope, setScope] = useState("global");
  const [metric, setMetric] = useState("wpm");
  const [ranking, setRanking] = useState([]);
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!configured || !session) return;
    getLeaderboard(session, scope, metric).then(setRanking).catch(() => setRanking([]));
    getFriends(session).then(setFriends).catch(() => setFriends([]));
  }, [configured, metric, scope, session]);

  async function search(event) {
    event.preventDefault();
    if (!session) return;
    setPeople(await searchPeople(session, query));
  }

  return (
    <div className="network-grid">
      <article className="cloud-leaderboard">
        <div className="saas-card-heading"><div><small>SEASON 01</small><h3>Cloud Leaderboard</h3></div><span>{configured && session ? "LIVE" : "PREVIEW"}</span></div>
        <div className="leaderboard-toolbar">
          <div>{["global", "country", "friends"].map((item) => <button type="button" className={scope === item ? "active" : ""} onClick={() => setScope(item)} key={item}>{item}</button>)}</div>
          <select value={metric} onChange={(event) => setMetric(event.target.value)}><option value="wpm">WPM</option><option value="accuracy">Accuracy</option><option value="practice_minutes">Practice</option><option value="xp">XP</option></select>
        </div>
        <div className="cloud-ranking-list">
          {ranking.length ? ranking.map((entry, index) => <div key={entry.id}><span>#{index + 1}</span><i>{initials(entry.username)}</i><strong>{entry.username}</strong><small>Lv.{entry.level}</small><b>{entry[metric]}</b></div>) : <p>{session ? "赛季数据正在形成。" : "登录云端账号后可查看真实排名。"}</p>}
        </div>
        <footer>赛季奖励仅为产品架构预留，当前不涉及付费或现金奖励。</footer>
      </article>
      <article className="friends-card">
        <div className="saas-card-heading"><div><small>FRIENDS</small><h3>训练伙伴</h3></div><span>{friends.filter((item) => item.status === "accepted").length}</span></div>
        <form onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索用户名" disabled={!session} /><button disabled={!session}>搜索</button></form>
        <div className="people-results">{people.map((person) => <div key={person.id}><i>{initials(person.username)}</i><strong>{person.username}</strong><small>Lv.{person.level}</small><button type="button" onClick={() => requestFriend(session, person.id)}>添加</button></div>)}</div>
        <div className="friend-connections">
          {friends.map((friend) => (
            <div key={friend.id}>
              <i>{initials(friend.username)}</i><strong>{friend.username}</strong><small>{friend.status}</small>
              {friend.status === "pending" && !friend.requested_by_me
                ? <button type="button" onClick={async () => { await respondToFriendRequest(session, friend.id); setFriends(await getFriends(session)); }}>接受</button>
                : <span>Lv.{friend.level}</span>}
            </div>
          ))}
        </div>
        {!session && <p>登录后可以添加好友并切换好友排行榜。</p>}
      </article>
    </div>
  );
}

function MembershipPanel() {
  return (
    <div>
      <div className="saas-section-copy"><small>MEMBERSHIP</small><h3>简单、透明的产品层级</h3><p>Phase 5 仅建立会员架构，不接入支付。</p></div>
      <div className="membership-grid">
        <article className="current"><span>CURRENT</span><h3>Free</h3><strong>¥0</strong><ul><li>完整训练模式</li><li>云同步</li><li>每日 3 次 AI Review</li><li>1 个自定义主题</li></ul><button disabled>当前方案</button></article>
        <article><span>COMING LATER</span><h3>Pro</h3><strong>未来开放</strong><ul><li>无限 AI Review</li><li>高级分析</li><li>无限自定义主题</li><li>更长云端历史</li></ul><button disabled>尚未开放</button></article>
      </div>
    </div>
  );
}

function SettingsPanel() {
  const reminders = useThemeStore((state) => state.reminders);
  const updateReminders = useThemeStore((state) => state.updateReminders);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const listener = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  async function enableReminder(enabled) {
    if (enabled && "Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotice("浏览器未授予通知权限；站内提醒仍可使用。");
      }
    }
    updateReminders({ enabled });
  }

  return (
    <div className="settings-grid">
      <article><div><small>TRAINING REMINDER</small><h3>保持节奏</h3><p>提醒设置保存在本地，登录后可同步到其他设备。</p></div><label className="switch-row"><span>{reminders.enabled ? "已开启" : "已关闭"}</span><input type="checkbox" checked={reminders.enabled} onChange={(event) => enableReminder(event.target.checked)} /></label><label className="time-row"><span>提醒时间</span><input type="time" value={reminders.time} onChange={(event) => updateReminders({ time: event.target.value })} /></label>{notice && <p>{notice}</p>}</article>
      <article><div><small>INSTALL APP</small><h3>KeyFlow PWA</h3><p>安装后可从桌面启动，并在离线时打开已缓存的训练界面。</p></div><button className="saas-primary" type="button" disabled={!installPrompt} onClick={async () => { await installPrompt?.prompt(); setInstallPrompt(null); }}>{installPrompt ? "安装 KeyFlow" : "已安装或暂不可用"}</button></article>
    </div>
  );
}

export default function SaaSControlCenter({
  open,
  onClose,
  profile,
  history,
  xpTotal,
  onProfileChange,
  onCloudRecords,
}) {
  const [tab, setTab] = useState("profile");
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  useEffect(() => { hydrateAuth(); hydrateTheme(); }, [hydrateAuth, hydrateTheme]);
  if (!open) return null;

  return (
    <div className="saas-center-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="saas-center" role="dialog" aria-modal="true" aria-labelledby="saas-center-title" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
        <header><div><small>KEYFLOW CLOUD</small><h2 id="saas-center-title">Control Center</h2></div><button type="button" onClick={onClose} aria-label="关闭">×</button></header>
        <nav aria-label="控制中心页面">{TABS.map(([id, label]) => <button type="button" className={tab === id ? "active" : ""} key={id} onClick={() => setTab(id)}>{label}</button>)}</nav>
        <div className="saas-center-content">
          {tab === "profile" && <AccountPanel profile={profile} history={history} xpTotal={xpTotal} onProfileChange={onProfileChange} onCloudRecords={onCloudRecords} />}
          {tab === "themes" && <ThemesPanel />}
          {tab === "network" && <NetworkPanel />}
          {tab === "membership" && <MembershipPanel />}
          {tab === "settings" && <SettingsPanel />}
        </div>
      </section>
    </div>
  );
}
