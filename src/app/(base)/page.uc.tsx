"use client";

import Link from "next/link";
import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { ArrowSvg, PlusSvg } from "@/assets/svg";
import styles from "@/styles/Home.module.scss";
import NewChat from "@/components/ui/NewChat";

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
  session: string;
}

export default function HomeClient({ chats, session }: Props) {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleOpenModal = () => {
    setOpenModal(!openModal);
  };

  return (
    <>
      <div className={styles.page_wrapper}>
        <h4 className={styles.title}>Chats:</h4>

        <div className={styles.chats}>
          {chats.map((chat, idx) => (
            <Link key={idx} className={styles.chat} href={`/chat/${chat.id}`}>
              <h2 className={styles.title}>{chat.title}</h2>
              <span className={styles.lang}>{chat.language}</span>

              <ArrowSvg
                style={{
                  fill: "#fff",
                  fontSize: "1.5rem",
                  transform: "rotate(-90deg)",
                }}
              />
            </Link>
          ))}

          <div className={styles.chat} onClick={handleOpenModal}>
            <h2 className={styles.title}>New Chat</h2>

            <PlusSvg
              style={{
                fill: "#fff",
                fontSize: "1.5rem",
                transform: "rotate(-90deg)",
              }}
            />
          </div>
        </div>
      </div>

      <Modal open={openModal} title="New Chat">
        <NewChat session={session} />
      </Modal>
    </>
  );
}
