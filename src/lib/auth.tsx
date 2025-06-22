import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./drizzle/database";
import * as schema from "./drizzle/auth-schema";

import { nextCookies } from "better-auth/next-js";
import {
  organization,
  apiKey,
  admin,
  twoFactor,
  magicLink,
  emailOTP,
  captcha,
} from "better-auth/plugins";
import { emailHarmony } from "better-auth-harmony";
import { passkey } from "better-auth/plugins/passkey";
import EmailClient from "./email/EmailClient";
import { render } from "@react-email/components";
import VerifyEmailEmail from "./email/templates/auth/VerifyEmail";
import MagicLinkEmail from "./email/templates/auth/MagicLinkEmail";
import ResetPasswordEmail from "./email/templates/auth/ResetPasswordEmail";
import OTPEmail from "./email/templates/auth/OTPEmail";

export const auth = betterAuth({
  appName: "ExpressThat",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await EmailClient.getInstance().sendEmail({
        Source: "auth@email.expressthat.dev",
        Destination: {
          ToAddresses: [user.email],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: await render(
                <ResetPasswordEmail
                  userFirstname={user.name ?? "User"}
                  resetPasswordUrl={url}
                />,
              ),
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: "Reset Password",
          },
        },
      });
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await EmailClient.getInstance().sendEmail({
        Source: "auth@email.expressthat.dev",
        Destination: {
          ToAddresses: [user.email],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: await render(
                <VerifyEmailEmail
                  userFirstname={user.name ?? "User"}
                  verifyEmailUrl={url}
                />,
              ),
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: "Verify your email address",
          },
        },
      });
    },
  },
  database: drizzleAdapter(db, {
    schema: {
      ...schema,
    },
    provider: "sqlite", // Add the required provider property
  }),
  plugins: [
    organization(),
    apiKey(),
    admin(),
    twoFactor({
      otpOptions: {
        period: 600, // 10 minutes,
        async sendOTP({ user, otp }) {
          await EmailClient.getInstance().sendEmail({
            Source: "auth@email.expressthat.dev",
            Destination: {
              ToAddresses: [user.email],
            },
            Message: {
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: await render(
                    <OTPEmail
                      userFirstname={user.name ?? "User"}
                      otpCode={otp}
                    />,
                  ),
                },
              },
              Subject: {
                Charset: "UTF-8",
                Data: "Your One-Time Password Code",
              },
            },
          });
        },
      },
    }),
    captcha({
      provider: "cloudflare-turnstile", // or google-recaptcha, hcaptcha
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
      endpoints: [
        "/sign-up/email",
        "/sign-in/email",
        "/forget-password",
        "/sign-in/magic-link",
        "/request-password-reset",
      ],
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // send email to user
        await EmailClient.getInstance().sendEmail({
          Source: "auth@email.expressthat.dev",
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Body: {
              Html: {
                Charset: "UTF-8",
                Data: await render(<MagicLinkEmail verifyEmailUrl={url} />),
              },
            },
            Subject: {
              Charset: "UTF-8",
              Data: "Magic Login link",
            },
          },
        });
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
        console.log(`Sending ${type} OTP to ${email}: ${otp}`);
      },
    }),
    passkey(),
    emailHarmony(),
    nextCookies(),
  ],
});
