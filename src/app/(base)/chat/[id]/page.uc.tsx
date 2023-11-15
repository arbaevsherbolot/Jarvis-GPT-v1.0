"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import { formatDate } from "@/lib/utils/format-date";
import Message from "@/components/ui/Message";
import {
  CopySvg,
  LoadSvg,
  MickroPhoneOffSvg,
  MickroPhoneSvg,
  PlaySvg,
  StopSvg,
} from "@/assets/svg";
import styles from "@/styles/Chat.module.scss";

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
  firstName: string;
  lastName: string;
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
  chat?: Chat;
  session?: string;
  messages?: Message[];
  user?: User;
}

export default function ChatClient({ chat, session, messages, user }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!chat || !session) {
      router.push("/404?message=Chat not found");
    } else window.document.title = chat.title;
  }, [router, session, chat]);

  const sortedMessages = messages?.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  const [transcript, setTranscript] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [audioStart, setAudioStart] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  let chunks: BlobPart[] = [];

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const newMediaRecorder = new MediaRecorder(stream);

          newMediaRecorder.onstart = () => {
            chunks = [];
          };

          newMediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          newMediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });

            try {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async function () {
                if (typeof reader.result === "string") {
                  setLoading(true);

                  const base64Audio = reader.result.split(",")[1];
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/speech-to-text/${chat?.id}`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${session}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ audio: base64Audio }),
                    }
                  );

                  if (response.status !== 200 || !response.ok) {
                    errorNotification("Something went wrong");
                    console.log(await response.json());
                  } else {
                    const data = await response.json();
                    const { message, reply } = data;
                    setTranscript(message.text);
                    setAiReply(reply.text);
                    setAudioSource(message.audioSource);
                    setLoading(false);
                  }
                }
              };
            } catch (e) {
              console.error(e);
              //@ts-ignore
              errorNotification(`${e.message}`);
            } finally {
              setLoading(false);
            }
          };

          setMediaRecorder(newMediaRecorder);
        })
        .catch((e) => {
          console.error("Error accessing microphone:", e);
          errorNotification("Something went wrong");
          setLoading(false);
        });
    }

    if (aiReply) {
      handlePlayAudio();
    }
  }, [aiReply, transcript]);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const copyText = (text: string) => {
    successNotification("Text copied to clipboard");
    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };

  const handlePlayAudio = () => {
    if (audioRef.current && audioSource) {
      audioRef.current.pause();

      audioRef.current.src = audioSource;

      setAudioStart(true);
      audioRef.current.play();
    } else if (audioRef.current) {
      setAudioStart(true);
      audioRef.current.play();
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current && audioSource) {
      setAudioStart(false);
      audioRef.current.pause();
    }
  };

  return (
    <>
      <div className={styles.page_wrapper}>
        <div className={styles.head}>
          <h2 className={styles.title}>
            {chat?.title} <span>{chat?.language}</span>
          </h2>

          {chat?.createdAt && (
            <span className={styles.date}>{formatDate(chat?.createdAt)}</span>
          )}
        </div>

        <button
          className={
            loading
              ? `${styles.button} ${styles.load}`
              : recording
              ? `${styles.button} ${styles.stop}`
              : styles.button
          }
          disabled={loading}
          onClick={recording ? stopRecording : startRecording}>
          {!loading ? (
            recording ? (
              <MickroPhoneOffSvg className={styles.icon} />
            ) : (
              <MickroPhoneSvg className={styles.icon} />
            )
          ) : (
            <LoadSvg
              className={`${styles.icon} ${styles.load}`}
              style={{ fill: "rgb(77 156 255 / 1)" }}
            />
          )}
        </button>

        <div className={styles.content}>
          {aiReply && (
            <>
              <h2 className={styles.label}>AI reply:</h2>

              <Message>{aiReply}</Message>

              <div className={styles.buttons}>
                <button
                  className={`${styles.button} ${styles.copy}`}
                  onClick={() => copyText(aiReply)}>
                  {copied ? "✅" : <CopySvg />}
                </button>

                <button
                  className={`${styles.button} ${styles.play}`}
                  onClick={handlePlayAudio}>
                  <PlaySvg />
                </button>

                {audioStart && (
                  <button
                    className={`${styles.button} ${styles.stop} ${styles.small}`}
                    onClick={handleStopAudio}>
                    <StopSvg />
                  </button>
                )}
              </div>
            </>
          )}

          {transcript && (
            <>
              <h2 className={styles.label}>Youre transcript:</h2>

              <Message>{transcript}</Message>
            </>
          )}

          {sortedMessages && sortedMessages?.length > 0 && (
            <>
              <h2 className={styles.label}>Conversation history:</h2>
              {sortedMessages.map((message, idx) => (
                <Message
                  key={idx}
                  label={message.ai ? "AI reply:" : "Youre transcript:"}>
                  {message.text}
                </Message>
              ))}
            </>
          )}

          {audioSource && (
            <audio ref={audioRef}>
              <source src={audioSource} type="audio/mpeg" />
            </audio>
          )}
        </div>
      </div>
    </>
  );
}
