export default defineEventHandler(async (event) => {
  requireContractor(event);
  const body = await readBody<{ zip?: string; street?: string; city?: string; state?: string; mode?: string }>(event);

  if (body?.mode === "zip" || (!body?.street?.trim() && body?.zip)) {
    return { kind: "zip" as const, ...(await lookupZip(body.zip || "")) };
  }

  const verified = await verifyShipAddress({
    street: body.street || "",
    city: body.city || "",
    state: body.state || "",
    zip: body.zip || "",
  });
  return { kind: "address" as const, ...verified };
});
