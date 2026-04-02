import { authClient } from "../libs/auth-client";
import type { LoginPayload, RegisterPayloadProps } from "../types/api";

export const authService = {
    /**
     * REGISTER A NEW USER
     * Maps the frontend 'phone' field to the backend 'phone' field
     * required by your Prisma schema.
     */
    signUp: async (data: RegisterPayloadProps) => {
        return await authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: data.name,
            // Custom schema fields
            ...{
                phone: data.phone, 
                country: data.country,
                image: data.image ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
            },
            callbackURL: "/login", 
        });
    },

    /**
     * LOGIN
     */
    signIn: async (data: LoginPayload) => {
        return await authClient.signIn.email({
            email: data.email,
            password: data.password,
            // callbackURL: "/dashboard", // Optional: redirect after login
        });
    },

    /**
     * LOGOUT
     */
    signOut: async () => {
        return await authClient.signOut();
    },

    /**
     * SESSION MANAGEMENT
     * Use this for checking session status outside of React components
     * or for the initial rehydration logic.
     */
    getSession: async () => {
        return await authClient.getSession();
    },

    // Better-Auth React Hook version for components
    useSession: authClient.useSession,
};