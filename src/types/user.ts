export type UserRole = "OWNER" | "ADMIN" | "SALES" | "VIEWER";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  signatureName: string;
  signatureTitle: string;
  phoneInternal: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
