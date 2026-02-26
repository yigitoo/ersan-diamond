import { auth } from "./config";
import type { UserRole } from "@/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  signatureName: string;
}

export async function getSession() {
  const session = await auth();
  return session;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user as any;
  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role as UserRole,
    signatureName: user.signatureName ?? "",
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Oturum açmanız gerekiyor");
  }
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Bu işlem için yetkiniz yok");
  }
  return user;
}
