"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import styles from "@/styles/Home.module.scss";

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

interface Props {
  id: string;
  session: string;
  messages: Message[];
}

export default function ChatClient({ id, session, messages }: Props) {
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
                    `${process.env.NEXT_PUBLIC_API_URL}/api/speech-to-text/${id}`,
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
          {!loading ? (recording ? "STOP" : "RECORD") : "Loading..."}
        </button>

        <div className={styles.content}>
          {transcript && (
            <>
              <h2 className={styles.label}>Youre transcript:</h2>
              <span className={styles.transcript}>{transcript}</span>
            </>
          )}

          {aiReply && (
            <>
              <h2 className={styles.label}>AI reply:</h2>

              <textarea
                className={styles.ai_reply}
                value={aiReply}
                readOnly={true}></textarea>

              <div className={styles.buttons}>
                <button
                  className={`${styles.button} ${styles.copy}`}
                  onClick={() => copyText(aiReply)}>
                  {copied ? "Copied" : "Copy text"}
                </button>

                <button
                  className={`${styles.button} ${styles.play}`}
                  onClick={handlePlayAudio}>
                  Play audio
                </button>

                {audioStart && (
                  <button
                    className={`${styles.button} ${styles.stop} ${styles.small}`}
                    onClick={handleStopAudio}>
                    Stop audio
                  </button>
                )}
              </div>
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
