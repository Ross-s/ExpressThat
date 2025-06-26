import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import {
  twoFactorClient,
  magicLinkClient,
  emailOTPClient,
  passkeyClient,
  adminClient,
  apiKeyClient,
  organizationClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  //you can pass client configuration here
  plugins: [
    twoFactorClient({
      async onTwoFactorRedirect() {
        // This function is called when the user needs to complete 2FA
        // Get the current redirect parameter from URL or use current path as fallback
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl =
          urlParams.get("redirect") ||
          window.location.pathname + window.location.search;
        const encodedRedirect = encodeURIComponent(redirectUrl);

        // Redirect to 2FA page with the original redirect parameter
        window.location.href = `/2fa?redirect=${encodedRedirect}`;
      },
    }),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    adminClient(),
    apiKeyClient(),
    organizationClient(),
  ],
});
