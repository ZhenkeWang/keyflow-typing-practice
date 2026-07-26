import { restRequest } from "./cloudClient";

const jsonHeaders = { Prefer: "resolution=merge-duplicates,return=representation" };

export async function upsertProfile(session, profile, preferences = {}) {
  const row = {
    id: session.user.id,
    username: profile.username,
    avatar_url: profile.avatar || null,
    country_code: profile.country || null,
    goal: profile.goal || "accuracy",
    level: Number(profile.level) || 1,
    xp: Number(profile.xp) || 0,
    title: profile.title || "Keyboard Rookie",
    preferences,
    updated_at: new Date().toISOString(),
  };
  return restRequest("users?on_conflict=id", {
    method: "POST",
    token: session.access_token,
    headers: jsonHeaders,
    body: row,
  });
}

export async function syncGrowthSnapshot(session, {
  achievements = [],
  skills = {},
  analysis = null,
} = {}) {
  const token = session.access_token;
  const achievementRows = achievements.map((item) => ({
    user_id: session.user.id,
    achievement_id: item.id,
    progress: Number(item.progress) || 0,
    unlocked_at: item.unlocked ? new Date().toISOString() : null,
  }));
  const skillRows = Object.entries(skills).map(([skill, value]) => ({
    user_id: session.user.id,
    skill,
    level: Number(value.level) || 1,
    xp: Number(value.xp) || 0,
    updated_at: new Date().toISOString(),
  }));
  const requests = [];
  if (achievementRows.length) requests.push(restRequest("achievements?on_conflict=user_id,achievement_id", {
    method: "POST", token, headers: jsonHeaders, body: achievementRows,
  }));
  if (skillRows.length) requests.push(restRequest("skills?on_conflict=user_id,skill", {
    method: "POST", token, headers: jsonHeaders, body: skillRows,
  }));
  if (analysis) requests.push(restRequest("ai_analysis", {
    method: "POST",
    token,
    headers: { Prefer: "return=minimal" },
    body: { user_id: session.user.id, analysis_type: "profile", payload: analysis },
  }));
  return Promise.all(requests);
}

export async function syncLeaderboardEntry(session, profile, stats) {
  return restRequest("leaderboard_entries?on_conflict=user_id", {
    method: "POST",
    token: session.access_token,
    headers: jsonHeaders,
    body: {
      user_id: session.user.id,
      username: profile.username,
      avatar_url: profile.avatar || null,
      country_code: profile.country || null,
      level: Number(profile.level) || 1,
      xp: Number(profile.xp) || 0,
      title: profile.title || "Keyboard Rookie",
      wpm: Number(stats.bestWpm) || 0,
      accuracy: Number(stats.averageAccuracy) || 0,
      practice_minutes: Math.round((Number(stats.totalPracticeSeconds) || 0) / 6) / 10,
      season: "season-01",
      updated_at: new Date().toISOString(),
    },
  });
}

export async function syncTrainingRecords(session, records = []) {
  if (!records.length) return [];
  const rows = records.slice(0, 1000).map((record) => ({
    id: record.cloudId || `${session.user.id}-${record.timestamp || record.at}`,
    user_id: session.user.id,
    mode: record.mode,
    wpm: Number(record.wpm) || 0,
    cpm: Number(record.cpm) || 0,
    accuracy: Number(record.accuracy) || 0,
    consistency: Number(record.consistency) || 0,
    errors: Number(record.errors) || 0,
    duration: Number(record.duration) || 0,
    xp_gain: Number(record.xp) || 0,
    details: record,
    practiced_at: new Date(record.timestamp || record.at || Date.now()).toISOString(),
  }));
  return restRequest("training_records?on_conflict=id", {
    method: "POST",
    token: session.access_token,
    headers: jsonHeaders,
    body: rows,
  });
}

export async function pullCloudSnapshot(session) {
  const token = session.access_token;
  const [profile, records, achievements, skills, analysis] = await Promise.all([
    restRequest("users?select=*&limit=1", { token }),
    restRequest("training_records?select=*&order=practiced_at.desc&limit=1000", { token }),
    restRequest("achievements?select=*&order=unlocked_at.desc", { token }),
    restRequest("skills?select=*&order=skill.asc", { token }),
    restRequest("ai_analysis?select=*&order=created_at.desc&limit=20", { token }),
  ]);
  return {
    profile: profile?.[0] || null,
    records: records || [],
    achievements: achievements || [],
    skills: skills || [],
    analysis: analysis || [],
  };
}
