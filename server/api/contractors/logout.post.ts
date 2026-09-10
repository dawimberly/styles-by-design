import { COOKIE_NAME } from "../../utils/cabinets";
import { authCookieOptions } from "../../utils/auth-cookies";

export default defineEventHandler((event) => {
  deleteCookie(event, COOKIE_NAME, authCookieOptions(event));
  return { ok: true };
});
