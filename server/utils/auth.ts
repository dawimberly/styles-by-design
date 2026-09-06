import { COOKIE_NAME, pinFromRuntime } from "../utils/cabinets";

export function isContractor(event: Parameters<typeof getCookie>[0]) {
  return getCookie(event, COOKIE_NAME) === pinFromRuntime();
}

export function requireContractor(event: Parameters<typeof getCookie>[0]) {
  if (!isContractor(event)) {
    throw createError({ statusCode: 401, statusMessage: "Contractor login required." });
  }
}
