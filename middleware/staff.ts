export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/staff") return;
  const headers = useRequestHeaders(["cookie"]);
  try {
    const session = await $fetch<{ ok: boolean }>("/api/staff/session", {
      headers,
      credentials: "include",
    });
    if (!session.ok) return navigateTo("/staff");
  } catch {
    return navigateTo("/staff");
  }
});
