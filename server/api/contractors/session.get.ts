export default defineEventHandler((event) => {
  return { ok: isContractor(event) };
});
