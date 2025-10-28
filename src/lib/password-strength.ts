export function strength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (pwd.length > 7) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}
