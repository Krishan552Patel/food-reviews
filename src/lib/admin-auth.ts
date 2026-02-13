import crypto from "crypto";

const TOKEN_PAYLOAD = "food-reviews-admin";

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export function createAdminToken(): string {
  const key = process.env.ADMIN_PASSWORD!;
  return crypto.createHmac("sha256", key).update(TOKEN_PAYLOAD).digest("hex");
}

export function verifyAdminToken(token: string): boolean {
  try {
    const expected = createAdminToken();
    const tokenBuffer = Buffer.from(token, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (tokenBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
