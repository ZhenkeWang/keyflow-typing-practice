"use client";

import { useEffect, useRef } from "react";
import {
  buildCoachSummary,
  calculateGrowthStats,
  calculateSkillLevels,
  getAchievements,
  getGrowthLevelInfo,
} from "../utils/growthEngine";
import { useAuthStore } from "../stores/authStore";
import {
  pullCloudSnapshot,
  syncGrowthSnapshot,
  syncLeaderboardEntry,
  syncTrainingRecords,
  upsertProfile,
} from "../services/sync";
import { useThemeStore } from "../stores/themeStore";

export default function CloudSyncRuntime({ profile, history, xpTotal, onCloudRecords }) {
  const configured = useAuthStore((state) => state.configured);
  const session = useAuthStore((state) => state.session);
  const hydrate = useAuthStore((state) => state.hydrate);
  const pulledFor = useRef("");

  useEffect(() => hydrate(), [hydrate]);

  useEffect(() => {
    if (!configured || !session?.user?.id || pulledFor.current === session.user.id) return;
    pulledFor.current = session.user.id;
    pullCloudSnapshot(session)
      .then((snapshot) => onCloudRecords?.(snapshot.records.map((row) => row.details || row)))
      .catch(() => { pulledFor.current = ""; });
  }, [configured, onCloudRecords, session]);

  useEffect(() => {
    if (!configured || !session?.user?.id) return undefined;
    const timer = window.setTimeout(async () => {
      const level = getGrowthLevelInfo(xpTotal);
      const enrichedProfile = { ...profile, level: level.level, xp: xpTotal, title: level.title };
      const stats = calculateGrowthStats(history, xpTotal);
      try {
        await upsertProfile(session, enrichedProfile, {
          visualTheme: useThemeStore.getState().visualTheme,
        });
        await syncTrainingRecords(session, history.slice(0, 50));
        await syncGrowthSnapshot(session, {
          achievements: getAchievements(history),
          skills: calculateSkillLevels(history),
          analysis: buildCoachSummary(history),
        });
        await syncLeaderboardEntry(session, enrichedProfile, stats);
      } catch {
        // Silent background retry: the manual sync control exposes detailed errors.
      }
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [configured, history, profile, session, xpTotal]);

  return null;
}

