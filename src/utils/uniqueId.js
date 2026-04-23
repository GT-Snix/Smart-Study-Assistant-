/**
 * Generate a unique 6-character ID mixing uppercase/lowercase letters, digits,
 * and the special characters !@#$%
 * Example output: "k3$Af9", "Z!r7Lm"
 */
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';

export const generateUniqueId = () => {
  let id = '';
  // Guarantee at least 1 letter, 1 digit, 1 special char
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const digits  = '0123456789';
  const specials = '!@#$%';

  const pick = (str) => str[Math.floor(Math.random() * str.length)];

  // Lock in one of each type
  const required = [pick(letters), pick(digits), pick(specials)];
  // Fill the remaining 3 from full charset
  for (let i = 0; i < 3; i++) required.push(pick(CHARSET));
  // Shuffle using Fisher-Yates
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }
  return required.join('');
};

/**
 * Validate that a string looks like a valid unique ID (6 chars, mixed types)
 */
export const isValidUniqueId = (id) => {
  if (!id || id.length !== 6) return false;
  return /[A-Za-z]/.test(id) && /[0-9]/.test(id) && /[!@#$%]/.test(id);
};
