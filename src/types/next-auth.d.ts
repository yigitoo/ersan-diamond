import type { UserRole } from "@/types/user";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    signatureName: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: UserRole;
      signatureName: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    signatureName: string;
  }
}
