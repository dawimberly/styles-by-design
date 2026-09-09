import { COOKIE_NAME, pinFromRuntime } from "../../utils/cabinets";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ pin?: string }>(event);
  if (!body?.pin || body.pin !== pinFromRuntime()) {
    throw createError({ statusCode: 401, statusMessage: "That PIN is not on the trade list." });
  }
  setCookie(event, COOKIE_NAME, body.pin, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true };
});
