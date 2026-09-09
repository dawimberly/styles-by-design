export default defineEventHandler((event) => {
  deleteCookie(event, EMPLOYEE_COOKIE, { path: "/" });
  return { ok: true };
});
