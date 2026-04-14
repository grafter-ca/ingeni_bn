// backend/src/libs/auth.ts
import { betterAuth } from "better-auth";
import {
  admin,
  organization,
  multiSession,
  // captcha,
  haveIBeenPwned,
  lastLoginMethod,
} from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { PrismaClient } from "../generated/prisma/client.js";

export const getAuthConfiguration = (prisma: PrismaClient) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    // URL & Security
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",

    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.FRONTEND_URL || "",
    ],

    // ✅ ONLY custom fields you actually need
    user: {
      additionalFields: {
        phone: { type: "string", required: false },
        country: { type: "string", required: false },
      },
    },

    // ✅ DATABASE HOOKS (clean + correct shape)
    databaseHooks: {
      user: {
        create: {
          before: async (ctx) => {
            // Do NOT inject role here — let Prisma default handle it
            return {
              data: {
                ...ctx,
              },
            };
          },

          after: async (user) => {
            // Create vendor profile ONLY if role is 'vendor'
            if (user.role === "vendor") {
              await prisma.vendor.create({
                data: {
                  userId: user.id,
                  storeName: `${user.name}'s Store`,
                },
              });
            }
          },
        },
      },
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },

    advanced: {
      disableOriginCheck: true,
      disableCSRFCheck: true,
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // refresh daily
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      callbackURL:
        process.env.FRONTEND_URL + "/verify-email" ||
        "http://localhost:3000/verify-email",

      sendVerificationEmail: async ({ user, url }) => {
        console.log("Redirection url / verification url", url)
        try {
          const fromEmail =
            process.env.RESEND_FROM_EMAIL ||
            "onboarding@resend.dev";

          await resend.emails.send({
            from: `Ingeri Store <${fromEmail}>`,
            to: [user.email],
            subject: "Verify your Ingeri account",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                <h2>Welcome to Ingeri, ${user.name}!</h2>
                <p>Click the button below to verify your email and activate your account.</p>
                <a href="${process.env.FRONTEND_URL}/verify-email?token=${new URL(url).searchParams.get("token")}"
                style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Verify Email
                </a>
                <div style="margin-top: 20px font-weight:100">
                  <p>If you didn't made any registration yet. Ignore this email</p>
                </div>
              </div>
            `,
          });

          console.log(`✅ Verification email sent to ${user.email}`);
        } catch (err) {
          console.error("❌ Failed to send verification email:", err);
        }
      },
    },

    plugins: [
      admin(),
      organization({
        allowUserToCreateOrganization: true,
      }),
      multiSession(),
      // ...(process.env.NODE_ENV !== 'production' ? [] : [
      //   captcha({
      //   provider: "hcaptcha",
      //   secretKey: process.env.HCAPTCHA_SECRET_KEY!,
      //   endpoints: ["/sign-in/email"],
      // }),]),
      
      haveIBeenPwned(),
      lastLoginMethod(),
    ],
  });
};