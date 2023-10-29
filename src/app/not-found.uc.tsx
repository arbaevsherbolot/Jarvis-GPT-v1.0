"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorSvg } from "@/assets/svg";
import styles from "@/styles/Redirect.module.scss";

export default function RootNotFoundClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const [seconds, setSeconds] = useState<number>(15);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds <= 1) {
        router.push("/redirect?to=/");
        clearInterval(interval);
      } else setSeconds(seconds - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [seconds, router]);

  return (
    <>
      <div className={styles.page_wrapper}>
        <div
          className={styles.box}
          style={{
            background: "hsl(359, 100%, 97%)",
            border: "0.8px solid hsl(359, 100%, 94%)",
          }}>
          <ErrorSvg
            style={{ fontSize: "1.45rem", fill: "hsl(360, 100%, 45%)" }}
          />

          <h2 className={styles.title} style={{ color: "hsl(360, 100%, 45%)" }}>
            {message ? message : "Page not found"}
          </h2>
        </div>

        <span>
          in a {seconds} seconds you will be redirected to the main page
        </span>
      </div>
    </>
  );
}
