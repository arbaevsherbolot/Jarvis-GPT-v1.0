"use client";

import React, { useEffect, useState } from "react";
import { CloseSvg } from "@/assets/svg";
import ChatBar from "./ChatBar";
import styles from "@/styles/ChatBarMenu.module.scss";

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

type Languages = "EN" | "RU";

type Message = {
  id: number;
  userId: number;
  chatId: number;
  text: string;
  ai?: boolean;
  audioSource?: string;
  createdAt: Date;
  updatedAt: Date;
};

type Chat = {
  id: number;
  userId: number;
  title: string;
  mesages: Message[];
  language: Languages;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

interface Props {
  chats: Chat[];
  user: User;
  session: string;
}

export default function ChatBarMenu({ chats, user, session }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal_open");
    } else {
      document.body.classList.remove("modal_open");
    }
    return () => {
      document.body.classList.remove("modal_open");
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={
          isOpen
            ? `${styles.modal_wrappper} ${styles.active}`
            : styles.modal_wrappper
        }
        onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.container} onClick={(e) => e.stopPropagation()}>
          <CloseSvg
            className={styles.close}
            onClick={() => setIsOpen(!isOpen)}
          />

          <ChatBar chats={chats} user={user} session={session} />
        </div>
      </div>

      <button className={styles.button} onClick={() => setIsOpen(!isOpen)}>
        MENU
      </button>
    </>
  );
}
