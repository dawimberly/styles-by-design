export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/contractors") return;
  const headers = useRequestHeaders(["cookie"]);
  try {
    const session = await $fetch<{ ok: boolean }>("/api/contractors/session", {
      headers,
      credentials: "include",
    });
    if (!session.ok) return navigateTo("/contractors");
  } catch {
    return navigateTo("/contractors");
  }
});
