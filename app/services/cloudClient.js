const stripTrailingSlash = (value = "") => value.replace(/\/+$/, "");

export const cloudConfig = {
  url: stripTrailingSlash(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

export const isCloudConfigured = () => Boolean(cloudConfig.url && cloudConfig.anonKey);

export class CloudServiceError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "CloudServiceError";
    this.status = status;
    this.details = details;
  }
}

export async function cloudRequest(path, {
  method = "GET",
  token = "",
  body,
  headers = {},
  signal,
} = {}) {
  if (!isCloudConfigured()) {
    throw new CloudServiceError("云服务尚未配置。请设置 Supabase 环境变量。", 503);
  }
  const response = await fetch(`${cloudConfig.url}${path}`, {
    method,
    signal,
    headers: {
      apikey: cloudConfig.anonKey,
      Authorization: `Bearer ${token || cloudConfig.anonKey}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = response.status === 204
    ? null
    : await response.json().catch(() => null);
  if (!response.ok) {
    throw new CloudServiceError(
      payload?.msg || payload?.message || payload?.error_description || "云服务请求失败。",
      response.status,
      payload
    );
  }
  return payload;
}

export const restRequest = (resource, options = {}) => cloudRequest(
  `/rest/v1/${resource}`,
  options
);

