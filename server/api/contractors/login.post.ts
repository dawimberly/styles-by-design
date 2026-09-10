import { COOKIE_NAME, pinFromRuntime } from "../../utils/cabinets";
import { authCookieOptions } from "../../utils/auth-cookies";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ pin?: string }>(event);
  if (!body?.pin || body.pin !== pinFromRuntime()) {
    throw createError({ statusCode: 401, statusMessage: "That PIN is not on the trade list." });
  }
  setCookie(event, COOKIE_NAME, body.pin, authCookieOptions(event));
  return { ok: true };
});
