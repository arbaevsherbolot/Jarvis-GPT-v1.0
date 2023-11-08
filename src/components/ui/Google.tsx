"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import { GoogleSvg } from "@/assets/svg";
import Button from "./Button";

export default function Google() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleAuth = async () => {
    setLoading(true);

    try {
      await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      });
    } catch (e) {
      errorNotification("Something went wrong");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button load={loading} type="button" onClick={handleGoogleAuth}>
        <GoogleSvg style={{ fontSize: "1.3rem" }} />
        Continue with Google
      </Button>
    </>
  );
}
