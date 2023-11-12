"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Account from "./Account";
import Modal from "./Modal";
import NewChat from "./NewChat";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import EditChat from "./EditChat";
import Button from "./Button";
import { ChatSvg, EditSvg, LoadSvg, PlusSvg, TrashSvg } from "@/assets/svg";
import styles from "@/styles/ChatBar.module.scss";

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
  v2?: boolean;
}

export default function ChatBar({ chats, user, session, v2 }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [openDeleteChatModal, setOpenDeleteChatModal] =
    useState<boolean>(false);
  const [openNewChatModal, setOpenNewChatModal] = useState<boolean>(false);
  const [editChatModal, setEditChatModal] = useState<boolean>(false);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  const handleOpenNewChatModal = () => {
    setOpenNewChatModal(!openNewChatModal);
  };

  const handleOpenEditChatModal = (id: number) => {
    setEditChatModal(!editChatModal);
    setSelectedChatId(id);
  };

  const handleOpenDeleteChatModal = (id: number) => {
    setOpenDeleteChatModal(!openDeleteChatModal);
    setSelectedChatId(id);
  };

  const archiveChat = async (id: number) => {
    setLoading(true);

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${id}/archive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        successNotification("Chat successfully deleted");
        setOpenDeleteChatModal(!openDeleteChatModal);
        router.push('/chat');
        router.refresh();
      }
    } catch (e) {
      setLoading(false);
      errorNotification("Something went wrong");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={v2 ? `${styles.wrapper} ${styles.hide}` : styles.wrapper}>
        <div className={styles.links}>
          <div className={styles.link} onClick={handleOpenNewChatModal}>
            New Chat
            <div className={styles.controls}>
              <PlusSvg className={styles.icon} />
            </div>
          </div>

          {loading ? (
            <LoadSvg className={`${styles.icon} ${styles.load}`} />
          ) : (
            chats.map((chat, idx) => (
              <Link key={idx} className={styles.link} href={`/chat/${chat.id}`}>
                <ChatSvg className={styles.icon} /> {chat.title}
                <div className={styles.controls}>
                  <EditSvg
                    className={styles.icon}
                    onClick={() => handleOpenEditChatModal(chat.id)}
                  />

                  <TrashSvg
                    className={`${styles.icon} ${styles.delete}`}
                    onClick={() => handleOpenDeleteChatModal(chat.id)}
                  />
                </div>
              </Link>
            ))
          )}
        </div>

        <Account user={user} />
      </div>

      {openNewChatModal && (
        <Modal open={openNewChatModal} title="New Chat">
          <NewChat session={session} />
        </Modal>
      )}

      {editChatModal && selectedChatId && selectedChat && (
        <Modal open={editChatModal} title="Edit Chat">
          <EditChat
            title={selectedChat?.title}
            language={selectedChat?.language}
            session={session}
            id={selectedChatId}
          />
        </Modal>
      )}

      {openDeleteChatModal && selectedChatId && (
        <Modal open={openDeleteChatModal} title="Delete Chat">
          <span className={styles.info}>
            Are you sure about deleting this chat: {selectedChat?.title}?
            <Button
              type="button"
              load={loading}
              style="delete"
              onClick={() => archiveChat(selectedChatId)}>
              Delete
            </Button>
          </span>
        </Modal>
      )}
    </>
  );
}
