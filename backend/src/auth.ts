// backend/src/libs/auth.ts
import { betterAuth } from "better-auth";
import { admin, organization, multiSession, captcha, haveIBeenPwned,lastLoginMethod } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { PrismaClient } from '../generated/prisma/client.js';

export const getAuthConfiguration = (prisma: PrismaClient) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    // URL & Security
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8001",
    
    trustedOrigins: [
      "http://localhost:3000", 
      process.env.FRONTEND_URL || ""
    ],

    // 1. Production Role Logic
    user: {
      additionalFields: {
        phone: { type: "string", required: false },
        country: { type: "string", required: false },
        role: { 
          type: "string", 
          required: false, 
          defaultValue: "USER" // Roles: ADMIN, VENDOR, USER
        },
      }
    },

    // 2. Automated Vendor Setup
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // If the user signed up as a VENDOR, create their store automatically
            if (user.role === 'VENDOR') {
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

    // 3. Email & Password Setup
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true, // PRODUCTION READY: Blocks login until verified
    },

    advanced:{
      disableOriginCheck: true,
    },

    // 4. disable session
    session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,    // Update session once a day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },

    // 5. Production Email Verification
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      callbackURL: process.env.FRONTEND_URL || "http://localhost:3000/verify-email",

    sendVerificationEmail: async ({ user, url }) => {
        try {
          const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
          
          await resend.emails.send({
            from: `Ingeri Store <${fromEmail}>`,
            to: [user.email],
            subject: "Verify your Ingeri account",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                <h2>Welcome to Ingeri, ${user.name}!</h2>
                <p>Click the button below to verify your email and activate your account.</p>
                <a href="${url}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
              </div>
            `,
          });
          console.log(`✅ Verification email sent to ${user.email}`);
        } catch (err) {
          console.error("❌ Failed to send verification email:", err);
        }
      },
    },

    //6. add pluggins
     plugins: [
      admin(), // For your CRUD & user management
      
      organization({
        // Allows users to create/join teams (Vendors can be orgs)
        allowUserToCreateOrganization: true, 
      }),

      multiSession(), // Let users switch between Admin/Vendor accounts

      captcha({
        provider: "hcaptcha", // Set provider to hcaptcha
        secretKey: process.env.HCAPTCHA_SECRET_KEY!, // Your Secret Key from hCaptcha dashboard
      }),

      haveIBeenPwned(),
      lastLoginMethod()
    ],
  });
};
