import { createAuthClient } from "better-auth/react";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [deviceAuthorizationClient()],
});

/** Only allow same-site paths as post-sign-in destinations (blocks open redirects like //evil.com). */
export function safeRedirect(target: string | null | undefined, fallback = "/account") {
  return target && target.startsWith("/") && !target.startsWith("//") ? target : fallback;
}
