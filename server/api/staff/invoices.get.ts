export default defineEventHandler(async (event) => {
  requireEmployee(event);
  const stripe = stripeClient();
  const listed = await stripe.invoices.list({ limit: 40 });
  return {
    invoices: listed.data
      .filter((invoice) => (invoice.metadata?.source || "styles-by-design") === "styles-by-design")
      .map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        total: `$${((invoice.total || 0) / 100).toFixed(2)}`,
        amountDue: `$${((invoice.amount_due || 0) / 100).toFixed(2)}`,
        email: invoice.customer_email || invoice.metadata?.email || "",
        company: invoice.metadata?.company || "",
        description: invoice.description || "",
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        created: invoice.created,
        dueDate: invoice.due_date,
      })),
  };
});
