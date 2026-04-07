import { authClient } from "../libs/auth-client";
import type { LoginPayload, RegisterPayloadProps } from "../types/api";

export const authService = {
    // --- 1. CORE AUTH METHODS ---

signUp: async (data: RegisterPayloadProps) => {
        return await authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: data.name,
            ...{
                phone: data.phone,
                country: data.country,
            },
            image: data.image ?? `https://dicebear.com{data.name}`,
            callbackURL: "/login",
        }
        );
    },

    signIn: async (data: LoginPayload, captchaToken?: string) => {
        return await authClient.signIn.email({
            email: data.email,
            password: data.password,
            fetchOptions: {
                headers: captchaToken ? { "x-captcha-response": captchaToken } : {},
            },
        }, 
        );
    },

    signOut: async () => {
        return await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = "/login";
                },
            },
        });
    },

    // --- 2. SESSION & PROFILE MANAGEMENT ---

    getSession: async () => {
        return await authClient.getSession();
    },

    updateUser: async (data: { name?: string; image?: string; phone?: string; country?: string }) => {
        return await authClient.updateUser(data);
    },

    changePassword: async (data: { newPassword: string; currentPassword: string }) => {
        return await authClient.changePassword(data);
    },
    // --- 3. MULTI-SESSION (DEVICE MANAGEMENT) ---

    listSessions: async () => {
        return await authClient.multiSession.listDeviceSessions();
    },

    lastLogin: async() =>{
        return await authClient.getLastUsedLoginMethod();
    },

    setActiveSession: async (sessionToken: string ) => {
        return await authClient.multiSession.setActive({ sessionToken });
    },


    // --- 4. ORGANIZATION / VENDOR LOGIC ---

    createOrganization: async (name: string, slug: string) => {
        return await authClient.organization.create({
            name,
            slug,
        });
    },

    listOrganizations: async () => {
        return await authClient.organization.list();
    },

    setActiveOrg: async (organizationId: string) => {
        return await authClient.organization.setActive({ organizationId });
    },

    // --- 5. ADMIN METHODS (ONLY FOR ADMIN ROLE) ---

    adminListUsers: async (query?: { limit?: number; offset?: number }) => {
        return await authClient.admin.listUsers({
            query: query || { limit: 10, offset: 0 },
        });
    },

    adminSetRole: async (userId: string, role:any) => {
        return await authClient.admin.setRole({
            userId,
            role,
        });
    },

    // React Hook for components
    useSession: authClient.useSession,
};
