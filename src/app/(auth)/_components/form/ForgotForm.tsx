"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { getCookie } from "cookies-next";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import axios from "axios";
import Button from "@/components/ui/Button";
import styles from "@/styles/Form.module.scss";

type FormData = {
  email: string;
};

export default function ForgotForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmitForm: SubmitHandler<FormData> = async (formData) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/forgot`,
        { ...formData },
        {
          headers: {
            "Content-Type": "application/json",
            baseurl: `${process.env.NEXT_PUBLIC_API_URL}`,
          },
        }
      );

      if (response.status === 200) {
        successNotification(response.data);
        router.push("/login");
      }
    } catch (e) {
      //@ts-ignore
      errorNotification(e.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cookieEmail = getCookie("email");

    if (cookieEmail) {
      setValue("email", cookieEmail);
    }
  }, [setValue]);

  return (
    <>
      <div className={styles.form_wrapper}>
        <form className={styles.form} onSubmit={handleSubmit(handleSubmitForm)}>
          <h2 className={styles.title}>Forgot Password</h2>

          <div className={styles.inputs_container}>
            <div className={styles.input_container}>
              <span className={styles.label}>Email</span>

              <input
                type="text"
                disabled={loading}
                className={
                  loading ? `${styles.input} ${styles.load}` : styles.input
                }
                placeholder="Enter your email address..."
                {...register("email", {
                  required: "Email required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid Email",
                  },
                })}
              />

              {errors.email && (
                <span className={styles.error}>{errors.email.message}</span>
              )}
            </div>

            <Button type="submit" load={loading}>
              Send reset link
            </Button>

            <Link className={styles.link} href="/login">
              Log in?
            </Link>
          </div>

          <div className={styles.info}>Powered by Notion</div>
        </form>
      </div>
    </>
  );
}
