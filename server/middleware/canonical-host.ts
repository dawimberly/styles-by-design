/** Force www → apex so contractor/staff cookies are not split across hosts. */
export default defineEventHandler((event) => {
  const host = String(getRequestHeader(event, "host") || "")
    .split(":")[0]
    .toLowerCase();
  if (host !== "www.stylesbydesigntx.com") return;

  const url = getRequestURL(event);
  const target = `https://stylesbydesigntx.com${url.pathname}${url.search}`;
  return sendRedirect(event, target, 301);
});
