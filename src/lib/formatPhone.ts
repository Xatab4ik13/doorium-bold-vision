/**
 * Light phone formatting: only groups digits of a complete 11-digit number.
 * Never inserts a country code automatically — the value stays exactly
 * what the user typed or pasted (the backend normalizes it on save).
 */
export const formatPhone = (value: string): string => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (!digits) return value;
  const hasPlus = value.trimStart().startsWith("+");
  if (digits.length === 11) {
    return `${hasPlus ? "+" : ""}${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  return value;
};
