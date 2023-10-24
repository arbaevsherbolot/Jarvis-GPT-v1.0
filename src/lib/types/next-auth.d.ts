import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

type Tokens = {
  access_token: string;
  refresh_token: string;
};

type UserRole = "USER" | "ADMIN" | "SUPERADMIN";

type User = {
  id: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isVerified: boolean;
  email: string;
  password: string;
  resetPasswordSecret?: string | null;
  role: UserRole;
  requests: number;
  lastRequest?: Date | null;
  firstName: string | null;
  lastName: string | null;
  bio?: string | null;
  photo?: string | null;
  phone?: string | null;
  refreshToken?: string | null;
};

declare module "next-auth" {
  interface Session {
    user: User;
    tokens: Tokens;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
    tokens: Tokens;
  }
}
