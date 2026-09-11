export const INBOX = "Jon@TheFlipFixer.com";
/** Cabinets To Go / Dura Stone order desk — staff “send to Divya” goes here. */
export const CTG_CONTACT = "divya@durastoneusa.com";

export function ctgOrderInbox() {
  return useRuntimeConfig().ctgOrderEmail?.trim() || process.env.CTG_ORDER_EMAIL?.trim() || CTG_CONTACT;
}
