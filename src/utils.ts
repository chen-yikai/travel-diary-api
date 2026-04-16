export function generateToken(): string {
  return crypto
    .getRandomValues(new Uint8Array(16))
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");
}

export function validateEmail(email: string): boolean {
  return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6 && /\d/.test(password) && /[a-zA-Z]/.test(password);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
