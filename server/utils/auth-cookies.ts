/** Shared auth cookie options so www + apex keep the same session. */

const LIVE_ROOT = "stylesbydesigntx.com";

export function authCookieOptions(event: Parameters<typeof getRequestHeader>[0], maxAge = 60 * 60 * 24 * 30) {
  const host = String(getRequestHeader(event, "host") || "")
    .split(":")[0]
    .toLowerCase();
  const onLive = host === LIVE_ROOT || host.endsWith(`.${LIVE_ROOT}`);
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: onLive || process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
    ...(onLive ? { domain: `.${LIVE_ROOT}` } : {}),
  };
}
