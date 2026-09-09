import { COOKIE_NAME, EMPLOYEE_COOKIE, employeePinFromRuntime, pinFromRuntime } from "../utils/cabinets";

export function isContractor(event: Parameters<typeof getCookie>[0]) {
  return getCookie(event, COOKIE_NAME) === pinFromRuntime();
}

export function requireContractor(event: Parameters<typeof getCookie>[0]) {
  if (!isContractor(event)) {
    throw createError({ statusCode: 401, statusMessage: "Contractor login required." });
  }
}

export function isEmployee(event: Parameters<typeof getCookie>[0]) {
  const pin = employeePinFromRuntime();
  return Boolean(pin) && getCookie(event, EMPLOYEE_COOKIE) === pin;
}

export function requireEmployee(event: Parameters<typeof getCookie>[0]) {
  if (!isEmployee(event)) {
    throw createError({ statusCode: 401, statusMessage: "Staff login required." });
  }
}
