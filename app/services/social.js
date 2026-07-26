import { restRequest } from "./cloudClient";

export async function getLeaderboard(session, scope = "global", metric = "wpm") {
  const order = ["accuracy", "practice_minutes", "xp"].includes(metric) ? metric : "wpm";
  const country = session?.user?.user_metadata?.country_code;
  const filter = scope === "country" && country ? `&country_code=eq.${encodeURIComponent(country)}` : "";
  const resource = scope === "friends" ? "friends_leaderboard" : "leaderboard_public";
  return restRequest(
    `${resource}?select=*&order=${order}.desc&limit=50${filter}`,
    { token: session?.access_token }
  );
}

export async function searchPeople(session, query) {
  const safe = encodeURIComponent(String(query || "").trim().slice(0, 40));
  if (!safe) return [];
  return restRequest(
    `users_public?select=id,username,avatar_url,country_code,level,title&username=ilike.*${safe}*&limit=10`,
    { token: session.access_token }
  );
}

export async function requestFriend(session, addresseeId) {
  return restRequest("friendships", {
    method: "POST",
    token: session.access_token,
    headers: { Prefer: "return=representation" },
    body: { requester_id: session.user.id, addressee_id: addresseeId, status: "pending" },
  });
}

export async function getFriends(session) {
  return restRequest("friend_connections?select=*&order=created_at.desc", { token: session.access_token });
}

export async function respondToFriendRequest(session, friendshipId, status = "accepted") {
  return restRequest(`friendships?id=eq.${encodeURIComponent(friendshipId)}`, {
    method: "PATCH",
    token: session.access_token,
    headers: { Prefer: "return=representation" },
    body: { status },
  });
}
