import { EMPLOYEE_COOKIE, employeePinFromRuntime } from "../../utils/cabinets";
import { authCookieOptions } from "../../utils/auth-cookies";

export default defineEventHandler(async (event) => {
  const pin = employeePinFromRuntime();
  if (!pin) {
    throw createError({ statusCode: 503, statusMessage: "EMPLOYEE_PIN is not set." });
  }
  const body = await readBody<{ pin?: string }>(event);
  if (!body?.pin || body.pin !== pin) {
    throw createError({ statusCode: 401, statusMessage: "That staff PIN is not valid." });
  }
  setCookie(event, EMPLOYEE_COOKIE, body.pin, authCookieOptions(event));
  return { ok: true };
});
