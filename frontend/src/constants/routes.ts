export const ROUTES = {
  // Auth routes
  AUTH: {
    WELCOME: "/(auth)/welcome" as const,
    LOGIN: "/(auth)/login" as const,
    REGISTER: "/(auth)/register" as const,
    FORGOT_PASSWORD: "/(auth)/forgot-password" as const,
  },

  // App routes
  APP: {
    HOME: "home" as const,
    PROFILE: "profile" as const,
    AAC: "aac" as const,
    PROGRESS: "progress" as const,
    CHAT_AI: "chat-ai" as const,
    CREATE_REPORT: "create-report" as const,
    // Add more app routes here as needed
  },
} as const;

// Export type for autocomplete
export type AuthRoute = (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH]; // Kết quả là: "WELCOME" | "LOGIN" | "REGISTER" | "FORGOT_PASSWORD"
export type AppRoute = (typeof ROUTES.APP)[keyof typeof ROUTES.APP];
export type AppRoutes = AuthRoute | AppRoute;
