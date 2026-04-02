// backend/src/libs/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { PrismaClient } from '@prisma/client/scripts/default-index.js';

/**
 * Configuration Factory for Better-Auth
 * Handles Session, Account, and Verification logic for NestJS + Docker
 */
export const getAuthConfiguration = (prisma: PrismaClient) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    // 1. URL & Security Configuration
    
    
    // baseURL must be the address your BROWSER uses to talk to the API
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
    
    // trustedOrigins allows your React frontend to talk to this backend
    trustedOrigins: [
      "http://localhost:3000", 
      "http://localhost:5173", 
      process.env.FRONTEND_URL || ""
    ],

    // 2. Email & Password Logic
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true, // Blocks login until verified
    },

    // 3. User Profile & Custom Fields
    // These must match your 'User' model in schema.prisma exactly
    user: {
      additionalFields: {
        phone: { 
          type: "string", 
          required: false 
        },
        country: { 
          type: "string", 
          required: false 
        },
        role: { 
          type: "string", 
          required: false, 
          defaultValue: "USER" 
        },
      }
    },

    // 4. Verification Flow (Using your 'Verification' model)
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      
      // Where the user lands in React after clicking the email link
      callbackURL: process.env.FRONTEND_URL || `${process.env.FRONTEND_URL}/verify-email` || "http://localhost:3000/verify-email",

      sendVerificationEmail: async ({ user, url}) => {
        try {
          // If using Resend without a verified domain, 'from' MUST be onboarding@resend.dev
          const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
          
          const { error } = await resend.emails.send({
            from: `Ingeri Store <${fromEmail}>`,
            to: [user.email],
            subject: "Verify your Ingeri Online Store account",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #111827;">Welcome to Ingeri, ${user.name}!</h2>
                <p style="color: #374151;">Please verify your email address to activate your account and start shopping.</p>
                <div style="margin: 30px 0;">
                  <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                    Verify My Email
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  If the button above doesn't work, copy and paste this link: <br />
                  <span style="color: #2563eb;">${url}</span>
                </p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
              </div>
            `,
          });

          if (error) {
            console.error("❌ Resend Error:", error);
          }
        } catch (err) {
          console.error("❌ Failed to send verification email:", err);
        }
      },
    },

    // 5. Plugins
    plugins: [], 
  });
};
