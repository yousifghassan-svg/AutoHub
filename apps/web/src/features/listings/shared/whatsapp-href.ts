/** Build a wa.me deep link from a phone number (digits only). */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}
