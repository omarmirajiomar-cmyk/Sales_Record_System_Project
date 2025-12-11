// Tanzania phone validation helpers
export function isValidTzPhone(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const cleaned = input.trim();
  // Accept formats: 07XXXXXXXX, +2557XXXXXXXX, 2557XXXXXXXX, 7XXXXXXXX
  // Tanzania mobile numbers typically start with 6,7 or 8 after the country code/leading zero and are 9 digits long
  const re = /^(?:\+255|0|255)?(6|7|8)\d{8}$/;
  return re.test(cleaned);
}

export function normalizeTzPhone(input: string): string {
  if (!input) return input;
  let s = input.trim();
  // remove spaces, dashes
  s = s.replace(/[\s\-()]/g, '');
  // if starts with 0 -> replace with +255
  if (s.startsWith('0')) {
    s = '+255' + s.slice(1);
  } else if (s.startsWith('255')) {
    s = '+255' + s.slice(3);
  } else if (!s.startsWith('+255') && s.length === 9) {
    s = '+255' + s;
  }
  return s;
}
