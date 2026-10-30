import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { bearer, deviceAuthorization } from "better-auth/plugins";
import { Pool } from "pg";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/** Google sign-in only appears once its OAuth credentials are configured on Vercel. */
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

/** The ShieldNest apps that may sign in through the /device approval page. */
export const APP_CLIENT_IDS = ["shieldnest-android", "shieldnest-windows"];

/** Pin full certificate verification; pg is about to weaken what Neon's default sslmode=require means. */
function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  const url = new URL(raw);
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

export const auth = betterAuth({
  database: new Pool({ connectionString: databaseUrl() }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: googleEnabled
    ? { google: { clientId: googleClientId!, clientSecret: googleClientSecret! } }
    : {},
  plugins: [
    // Apps show a code, the user approves it on /device, and the app receives a session token
    deviceAuthorization({
      verificationUri: "/device",
      expiresIn: "10m",
      validateClient: (clientId) => APP_CLIENT_IDS.includes(clientId),
    }),
    // Lets the apps send that token as "Authorization: Bearer ..." instead of a cookie
    bearer(),
    nextCookies(), // must stay last
  ],
});
