/**
 * Generate a unique 6-character ID mixing letters, digits, and special chars.
 */
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';

const generateUniqueId = () => {
  const letters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const digits   = '0123456789';
  const specials  = '!@#$%';
  const pick = (str) => str[Math.floor(Math.random() * str.length)];

  const required = [pick(letters), pick(digits), pick(specials)];
  for (let i = 0; i < 3; i++) required.push(pick(CHARSET));

  // Fisher-Yates shuffle
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }
  return required.join('');
};

module.exports = { generateUniqueId };
