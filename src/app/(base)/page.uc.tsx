"use client";

import React, { useState, useEffect } from "react";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import styles from "@/styles/Home.module.scss";

export default function HomeClient() {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

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
                    `${process.env.NEXT_PUBLIC_API_URL}/api/speech-to-text`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ audio: base64Audio }),
                    }
                  );

                  if (response.status !== 200 || !response.ok) {
                    errorNotification("Something went wrong");
                    console.log(await response.json());
                  }

                  const data = await response.json();
                  setTranscript(data.transcript);
                  setAiReply(data.aiReply);
                  setLoading(false);
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
  }, []);

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

              <button
                className={`${styles.button} ${styles.copy}`}
                onClick={() => copyText(aiReply)}>
                {copied ? "Copied" : "Copy Text"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
