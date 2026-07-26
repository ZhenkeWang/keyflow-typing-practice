/**
 * Database-ready model factories. They keep the UI independent from the
 * eventual Supabase row shape while preserving serializable plain objects.
 */

export function createUserAnalysis(input = {}) {
  return {
    currentStatus: input.currentStatus || {},
    weakKeys: input.weakKeys || [],
    combinations: input.combinations || [],
    strengths: input.strengths || [],
    weaknesses: input.weaknesses || [],
    recommendations: input.recommendations || null,
    prediction: input.prediction || null,
    fingerIssue: input.fingerIssue || null,
    rhythm: input.rhythm || null,
    endurance: input.endurance || null,
    habits: input.habits || null,
    sampleSize: Number(input.sampleSize) || 0,
    lastUpdated: input.lastUpdated || new Date().toISOString(),
  };
}

export function createTrainingPlan(input = {}) {
  return {
    goal: Number(input.goal) || 80,
    tasks: input.tasks || [],
    timeline: input.timeline || [],
    duration: Number(input.duration) || 0,
    difficulty: input.difficulty || "foundation",
  };
}

export function createAIConversation(input = {}) {
  return {
    question: String(input.question || ""),
    answer: String(input.answer || ""),
    date: input.date || new Date().toISOString(),
    source: input.source || "local-performance-model",
  };
}
