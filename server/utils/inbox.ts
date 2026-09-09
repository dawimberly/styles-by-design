export const INBOX = "Jon@TheFlipFixer.com";
export const CTG_CONTACT = "dawimberly@gmail.com";

export function ctgOrderInbox() {
  return useRuntimeConfig().ctgOrderEmail?.trim() || process.env.CTG_ORDER_EMAIL?.trim() || CTG_CONTACT;
}
