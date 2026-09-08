export default defineEventHandler(async (event) => {
  const pin = employeePinFromRuntime();
  if (!pin) {
    throw createError({ statusCode: 503, statusMessage: "EMPLOYEE_PIN is not set." });
  }
  const body = await readBody<{ pin?: string }>(event);
  if (!body?.pin || body.pin !== pin) {
    throw createError({ statusCode: 401, statusMessage: "That staff PIN is not valid." });
  }
  setCookie(event, EMPLOYEE_COOKIE, body.pin, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true };
});
