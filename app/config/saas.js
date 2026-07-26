export const PLAN_FEATURES = {
  free: {
    label: "Free",
    historyLimit: 1000,
    aiReviewsPerDay: 3,
    customThemes: 1,
    cloudSync: true,
  },
  pro: {
    label: "Pro",
    historyLimit: Infinity,
    aiReviewsPerDay: Infinity,
    customThemes: Infinity,
    cloudSync: true,
  },
};

export const isFeatureAvailable = (plan = "free", feature) => Boolean(
  PLAN_FEATURES[plan]?.[feature]
);

export const getPlanLimit = (plan = "free", feature) => (
  PLAN_FEATURES[plan]?.[feature] ?? PLAN_FEATURES.free[feature]
);

export const DEFAULT_SAAS_PREFERENCES = {
  visualTheme: "apple-white",
  customTheme: {
    background: "#f5f5f7",
    accent: "#6c63ff",
    keyboard: "#ffffff",
    font: "system",
    motion: "full",
  },
  reminders: {
    enabled: false,
    time: "20:00",
    days: [1, 2, 3, 4, 5],
  },
};

