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
  const isSecure = process.env.SMTP_SECURE 
    ? process.env.SMTP_SECURE === "true" 
    : true; // Default to true for Port 465

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: isSecure, 
    auth: {
      user: process.env.SMTP_USER || "callebhabyar55@gmail.com",
      pass: process.env.SMTP_PASS || "fevw ozes scqg vxpn",
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

    baseURL: process.env.BETTER_AUTH_URL || "https://ingeri-api.onrender.com",

    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.FRONTEND_URL || "",
    ].filter(Boolean),

    user: {
      additionalFields: {
        phone: { type: "string", required: false },
        country: { type: "string", required: false },
        image: { type: "string", required: false }, // Stores the final Cloudinary secure_url
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
        : "http://localhost:3000/verify-email",

      sendVerificationEmail: async ({ user, url }) => {
        try {
          console.log(`📩 Attempting to send verification email to: ${user.email}`);

          const mailOptions = {
            from: `"Ingeri Store Support" <${process.env.SMTP_USER || "callebhabyar55@gmail.com"}>`,
            to: user.email,
            subject: "Verify your Ingeri account",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: #111;">
                <h2>Welcome to Ingeri, ${user.name}!</h2>
                <p>Click the button below to verify your email and activate your account.</p>
                <a href="${url}" style="background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                  Verify Email
                </a>
                <div style="margin-top: 24px; font-size: 12px; color: #666;">
                  <p>Or copy and paste this link into your browser:</p>
                  <p><a href="${url}" style="color: #2563eb;">${url}</a></p>
                  <p>If you didn't create an account, you can safely ignore this email.</p>
                </div>
              </div>
            `,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("✅ Verification email sent successfully. MessageID:", info.messageId);
        } catch (err) {
          console.error("❌ Failed to send verification email via Nodemailer:", err);
          throw new Error("Failed to send verification email.", { cause: err });
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
