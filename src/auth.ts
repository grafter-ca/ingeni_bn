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
    console.warn("⚠️ Warning: SMTP_USER or SMTP_PASS environment variables are missing. Email verification will fail.");
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

  // Verify connection configuration on startup
  transporter.verify((error) => {
    if (error) {
      console.error("❌ SMTP Transporter Verification Error:", error);
    } else {
      console.log("✅ SMTP Server is ready to send emails");
    }
  });

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",

    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.FRONTEND_URL || "",
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
                  storeName: `${user.name.split(' ')[0]}'s Store`,
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
      cookieSecure: true,
      useSecureCookies: true,
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
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
      callbackURL: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/verify-email`
        : "http://localhost:5173/verify-email",

      sendVerificationEmail: async ({ user, url }) => {
        try {
          const parsedUrl = new URL(url);
          const token = parsedUrl.searchParams.get("token");

          const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
          const frontendVerificationLink = token 
            ? `${frontendBase}/verify-email?token=${token}` 
            : url;

          console.log(`📩 Dispatching verification email to: ${user.email}`);

          const mailOptions = {
            from: `"Ingeri Store Support" <${smtpUser}>`,
            to: user.email,
            subject: "Verify your Ingeri account",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: #111;">
                <h2>Welcome to Ingeri, ${user.name}!</h2>
                <p>Click the button below to verify your email and activate your account.</p>
                <a href="${frontendVerificationLink}" style="background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                  Verify Email
                </a>
                <div style="margin-top: 24px; font-size: 12px; color: #666;">
                  <p>Or copy and paste this link into your browser:</p>
                  <p><a href="${frontendVerificationLink}" style="color: #2563eb;">${frontendVerificationLink}</a></p>
                </div>
              </div>
            `,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("✅ Verification email sent successfully. MessageID:", info.messageId);
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