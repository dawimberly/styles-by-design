import { EMPLOYEE_COOKIE } from "../../utils/cabinets";
import { authCookieOptions } from "../../utils/auth-cookies";

export default defineEventHandler((event) => {
  deleteCookie(event, EMPLOYEE_COOKIE, authCookieOptions(event));
  return { ok: true };
});
