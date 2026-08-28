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
 const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === "true", 
    auth: {
      user: process.env.SMTP_USER || "callebhabyar55@gmail.com",
      pass: process.env.SMTP_PASS || "fevw ozes scqg vxpn",
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === "true",
    },
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
    ],

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
      callbackURL: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/verify-email` : "http://localhost:3000/verify-email",

      sendVerificationEmail: async ({ user, url }) => {
        try {
          const parsedUrl = new URL(url);
          const token = parsedUrl.searchParams.get("token");
          const verifyLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;

          const mailOptions = {
            from: `"Ingeri Store Support" <${process.env.SMTP_USER || "callebhabyar55@gmail.com"}>`,
            to: user.email,
            subject: "Verify your Ingeri account",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                <h2>Welcome to Ingeri, ${user.name}!</h2>
                <p>Click the button below to verify your email and activate your account.</p>
                <a href="${verifyLink}" style="background: #4f46e5; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Email
                </a>
                <div style="margin-top: 20px; font-weight: 100; color: #666;">
                  <p>If you didn't make this registration, please ignore this email.</p>
                </div>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
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
