// backend/src/libs/auth.ts
import { betterAuth } from "better-auth";
import {
  admin,
  organization,
  multiSession,
  haveIBeenPwned,
  lastLoginMethod,
} from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../generated/prisma/client.js";
import { EmailService } from "./libs/nodemail/email.service.js";

const extractTokenFromUrl = (url?: string): string => {
  if (!url) return "";
  try {
    const parsed = new URL(
      url,
      process.env.BETTER_AUTH_URL || "http://localhost:8000",
    );
    return parsed.searchParams.get("token") || "";
  } catch {
    return "";
  }
};

export const getAuthConfiguration = (
  prisma: PrismaClient,
  emailService: EmailService = new EmailService(),
) => {
  if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
    console.warn(
      "⚠️ Warning: BREVO_API_KEY or SENDER_EMAIL environment variables are missing. Email delivery will fail.",
    );
  }

  const isProd = process.env.NODE_ENV === "production";

  const frontendBase = (
    process.env.FRONTEND_URL ||
    process.env.VITE_FRONTEND_URL ||
    (isProd ? "https://ingeni.onrender.com" : "http://localhost:5173")
  ).replace(/\/+$/, "");

  const defaultApiBase = isProd
    ? "https://ingeri-api.onrender.com/api"
    : "http://localhost:8000";

  const authBaseUrl = (process.env.BETTER_AUTH_URL || defaultApiBase).replace(
    /\/+$/,
    "",
  );

  // Use SameSite=None + Secure over HTTPS (production/cross-site),
  // and SameSite=Lax + Secure=false over plain HTTP (local PC/Android testing).
  const useCrossSiteHttpsCookies =
    isProd || authBaseUrl.startsWith("https://");

  const extraOrigins = (process.env.TRUSTED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: authBaseUrl,

    trustedOrigins: Array.from(
      new Set([
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        frontendBase,
        ...extraOrigins,
      ]),
    ),

    user: {
      additionalFields: {
        phone: { type: "string", required: false },
        country: { type: "string", required: false },
        image: { type: "string", required: false },
      },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            if (user.role === "vendor") {
              await prisma.vendor.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                  userId: user.id,
                  storeName: `${user.name.split(" ")[0]}'s Store`,
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
      revokeSessionsOnPasswordReset: true,

      sendResetPassword: async ({ user, url, token }) => {
        const resetToken = token || extractTokenFromUrl(url);
        const resetLink = resetToken
          ? `${frontendBase}/reset-password?token=${encodeURIComponent(resetToken)}`
          : url;

        console.log(`📩 Queuing password reset email to: ${user.email}`);
        emailService.queuePasswordResetEmail(
          user.email,
          user.name || "there",
          resetLink,
        );
      },
    },

    advanced: {
      disableOriginCheck: true,
      disableCSRFCheck: true,
      cookieSecure: useCrossSiteHttpsCookies,
      useSecureCookies: useCrossSiteHttpsCookies,
      defaultCookieAttributes: {
        sameSite: useCrossSiteHttpsCookies ? "none" : "lax",
        secure: useCrossSiteHttpsCookies,
        httpOnly: true,
        path: "/",
      },
      ipAddress: {
        ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip"],
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,

      sendVerificationEmail: async ({ user, url, token }) => {
        const verificationToken = token || extractTokenFromUrl(url);
        const frontendVerificationLink = verificationToken
          ? `${frontendBase}/verify-email?token=${encodeURIComponent(verificationToken)}`
          : url;

        console.log(`📩 Queuing verification email to: ${user.email}`);
        emailService.queueVerificationEmail(
          user.email,
          user.name || "Shopper",
          frontendVerificationLink,
        );
      },
    },

    plugins: [
      admin(),
      organization({
        allowUserToCreateOrganization: true,
      }),
      multiSession(),
      haveIBeenPwned(),
      lastLoginMethod(),
    ],
  });
};