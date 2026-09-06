import { COOKIE_NAME } from "../../utils/cabinets";

export default defineEventHandler((event) => {
  deleteCookie(event, COOKIE_NAME, { path: "/" });
  return { ok: true };
});
