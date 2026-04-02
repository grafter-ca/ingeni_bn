import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // This points to your NestJS backend URL (running in Docker)
    baseURL: "http://localhost:8000",
    fetchOptions: {
        credentials: "include", // Important for cookie-based sessions
    },
     // Custom fields that your backend expects in the session user object
    session: {
        user: {
            fields: {
                role: "string",
                phone: "string",
                country: "string"
            }
        }
    },
});