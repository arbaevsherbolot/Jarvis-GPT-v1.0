"use client";

import Logo from "./Logo";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogoutSvg } from "@/assets/svg";
import styles from "@/styles/Account.module.scss";

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

interface Props {
  user: User;
}

export default function Account({ user }: Props) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <div className={styles.account}>
      <Logo
        src={`${user.photo}`}
        width={50}
        height={50}
        alt={`${user.firstName} ${user.lastName}`}
      />

      <div className={styles.info}>
        <h3 className={styles.name}>
          {user.firstName} {user.lastName}
        </h3>

        <span className={styles.email}>{user.email}</span>
      </div>

      <div className={styles.logout}>
        <LogoutSvg className={styles.icon} onClick={handleSignOut} />
        Log Out
      </div>
    </div>
  );
}
