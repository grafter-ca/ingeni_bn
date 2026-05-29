import { authClient } from "../libs/auth-client";
import type { LoginPayload, RegisterPayloadProps } from "../types/api";

export const authService = {
  // --- 1. CORE ---
  signUp: async (data: RegisterPayloadProps) => {
    return await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      ...{
        phone: data.phone,
        country: data.country,
      },
      image:
        data.image ??
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      callbackURL: "/login",
    });
  },

  signIn: async (data: LoginPayload, captchaToken?: string) => {
    return await authClient.signIn.email({
      email: data.email,
      password: data.password,
      fetchOptions: {
        headers: captchaToken ? { "x-captcha-response": captchaToken } : {},
      },
    });
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

  // --- 2. MANAGEMENT ---
  updateUser: async (data: {
    name?: string;
    image?: string;
    phone?: string;
    country?: string;
  }) => await authClient.updateUser(data),

  listSessions: async () => await authClient.multiSession.listDeviceSessions(),

  // --- 3. ORGANIZATION / VENDOR ---
  createOrganization: async (name: string, slug: string) =>
    await authClient.organization.create({ name, slug }),

  setActiveOrg: async (organizationId: string) =>
    await authClient.organization.setActive({ organizationId }),

  // --- 4. ADMIN ---
  adminListUsers: async (query?: {
    searchValue?: string | undefined;
    searchField?: "email" | "name" | undefined;
    searchOperator?: "contains" | "starts_with" | "ends_with" | undefined;
    limit?: string | number | undefined;
    offset?: string | number | undefined;
    sortBy?: string | undefined;
    sortDirection?: "asc" | "desc" | undefined;
    filterField?: string | undefined;
    filterValue?: string | number | boolean | string[] | number[] | undefined;
    filterOperator?:
      | "in"
      | "contains"
      | "starts_with"
      | "ends_with"
      | "eq"
      | "ne"
      | "gt"
      | "gte"
      | "lt"
      | "lte"
      | "not_in"
      | undefined;
  }) =>
    await authClient.admin.listUsers({
      query: query || { limit: 10, offset: 0 },
    }),

  adminSetRole: async (userId: string, role: string) =>
    await authClient.admin.setRole({ userId, role: role as "user" | "admin" }),

  useSession: authClient.useSession,
};
