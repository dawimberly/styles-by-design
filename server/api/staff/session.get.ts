export default defineEventHandler((event) => {
  return { ok: isEmployee(event) };
});
