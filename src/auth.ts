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
import nodemailer from "nodemailer";
import { PrismaClient } from "../generated/prisma/client.js";

export const getAuthConfiguration = (prisma: PrismaClient) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn(
      "⚠️ Warning: SMTP_USER or SMTP_PASS environment variables are missing. Email delivery will fail.",
    );
  }

  const isSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : true;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: isSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === "true",
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ SMTP Transporter Verification Error:", error);
    } else {
      console.log("✅ SMTP Server is ready to send emails");
    }
  });

  const isProd = process.env.NODE_ENV === "production";

  const frontendBase = (
    process.env.FRONTEND_URL ||
    process.env.VITE_FRONTEND_URL ||
    (isProd ? "https://ingeni.onrender.com" : "http://localhost:5173")
  ).replace(/\/+$/, "");

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",

    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:5173",
      frontendBase,
    ].filter(Boolean),

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
        try {
          let resetToken = token;
          if (!resetToken) {
            try {
              const parsed = new URL(url);
              resetToken = parsed.searchParams.get("token") || "";
            } catch {
              resetToken = "";
            }
          }

          const resetLink = resetToken
            ? `${frontendBase}/reset-password?token=${encodeURIComponent(resetToken)}`
            : url;

          console.log(`📩 Dispatching password reset email to: ${user.email}`);

          await transporter.sendMail({
            from: `"Ingeni Market Support" <${smtpUser}>`,
            to: user.email,
            subject: "Reset your Ingeni Market password",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: #111; border: 1px solid #e5e7eb; border-radius: 10px;">
                <h2 style="color: #2563eb; margin-top: 0;">Reset Your Ingeni Market Password</h2>
                <p>Hello ${user.name || "there"},</p>
                <p>We received a request to reset your password. Click the button below to choose a new password:</p>
                <p style="margin: 20px 0;">
                  <a href="${resetLink}" style="background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                    Reset Password
                  </a>
                </p>
                <p style="font-size: 13px; color: #4b5563;">If you did not request a password reset, you can safely ignore this email.</p>
                <div style="margin-top: 24px; font-size: 12px; color: #666;">
                  <p>Or copy and paste this link into your browser:</p>
                  <p><a href="${resetLink}" style="color: #2563eb;">${resetLink}</a></p>
                </div>
              </div>
            `,
          });

          console.log("✅ Password reset email sent successfully to:", user.email);
        } catch (err) {
          console.error("❌ Failed to send password reset email:", err);
        }
      },
    },

    advanced: {
      disableOriginCheck: true,
      disableCSRFCheck: true,
      cookieSecure: isProd,
      useSecureCookies: isProd,
      defaultCookieAttributes: {
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        httpOnly: true,
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
        try {
          let verificationToken = token || "";
          if (!verificationToken && url) {
            try {
              const parsedUrl = new URL(
                url,
                process.env.BETTER_AUTH_URL || "http://localhost:8000",
              );
              verificationToken = parsedUrl.searchParams.get("token") || "";
            } catch {
              verificationToken = "";
            }
          }

          const frontendVerificationLink = verificationToken
            ? `${frontendBase}/verify-email?token=${encodeURIComponent(verificationToken)}`
            : url;

          console.log(`📩 Dispatching verification email to: ${user.email}`);

          const info = await transporter.sendMail({
            from: `"Ingeni Market Support" <${smtpUser}>`,
            to: user.email,
            subject: "Verify your Ingeni Market account",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: #111; border: 1px solid #e5e7eb; border-radius: 10px;">
                <h2 style="color: #2563eb; margin-top: 0;">Welcome to Ingeni Market, ${user.name || "there"}!</h2>
                <p>Click the button below to verify your email and activate your account.</p>
                <p style="margin: 20px 0;">
                  <a href="${frontendVerificationLink}" style="background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                    Verify Email
                  </a>
                </p>
                <div style="margin-top: 24px; font-size: 12px; color: #666;">
                  <p>Or copy and paste this link into your browser:</p>
                  <p><a href="${frontendVerificationLink}" style="color: #2563eb;">${frontendVerificationLink}</a></p>
                </div>
              </div>
            `,
          });

          console.log(
            "✅ Verification email sent successfully. MessageID:",
            info.messageId,
          );
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
      haveIBeenPwned(),
      lastLoginMethod(),
    ],
  });
};