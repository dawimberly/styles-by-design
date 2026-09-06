export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>(event);

  if (!body?.name?.trim() || !body?.email?.trim() || !body?.message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Please fill in name, email, and message." });
  }

  return { ok: true };
});
