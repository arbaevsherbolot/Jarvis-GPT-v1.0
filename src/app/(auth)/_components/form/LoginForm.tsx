"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { getCookie } from "cookies-next";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";
import styles from "@/styles/Form.module.scss";

type FormData = {
  emailOrName: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>();

  const [loading, setLoading] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleShowInput = () => {
    setShowInput(true);
  };

  const handleSubmitForm: SubmitHandler<FormData> = async (formData) => {
    setLoading(true);

    const loginData = {
      ...formData,
      redirect: false,
      callbackUrl: next ? next : "/",
    };

    try {
      const response = await signIn("credentials", loginData);

      if (!response?.error) {
        successNotification("Successful login");
        // router.push(`/redirect?to=${next}`);
        router.push("/");
      } else {
        errorNotification(response?.error.replace("Error: ", ""));
      }
    } catch (e) {
      errorNotification("Something went wrong");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cookieEmail = getCookie("email");

    if (cookieEmail) {
      setValue("emailOrName", cookieEmail);
    }
  }, [setValue]);

  return (
    <>
      <div className={styles.form_wrapper}>
        <form className={styles.form} onSubmit={handleSubmit(handleSubmitForm)}>
          <div className={styles.title}>Log In</div>

          <div className={styles.inputs_container}>
            <div className={styles.input_container}>
              <span className={styles.label}>Email or Name</span>

              <input
                type="text"
                disabled={loading}
                className={
                  loading ? `${styles.input} ${styles.load}` : styles.input
                }
                placeholder="sherbolot@wedevx.co"
                onFocus={handleShowInput}
                {...register("emailOrName", {
                  required: "Email or Name required",
                  pattern: {
                    value:
                      /^[\p{L}\d]+@[A-Za-z\d.-]+\.[A-Za-z]{2,}$|^[\p{L}\d\s]+$/u,
                    message: "Invalid Email or Name",
                  },
                })}
              />

              {errors.emailOrName && (
                <span className={styles.error}>
                  {errors.emailOrName.message}
                </span>
              )}
            </div>

            <div
              className={styles.input_container}
              style={!showInput ? { display: "none" } : { display: "flex" }}>
              <span className={styles.label}>Password</span>

              <input
                type="password"
                disabled={loading}
                autoComplete="off"
                className={
                  loading
                    ? `${styles.input} ${styles.load} ${styles.password}`
                    : `${styles.input} ${styles.password}`
                }
                placeholder="123456"
                {...register("password", {
                  required: "Password required",
                  minLength: {
                    value: 6,
                    message: "Password must contain at least 6 characters",
                  },
                  maxLength: {
                    value: 24,
                    message: "Password cannot contain more than 24 characters",
                  },
                })}
              />

              {errors.password && (
                <span className={styles.error}>{errors.password.message}</span>
              )}
            </div>

            <Button type="submit" load={loading} disabled={!isValid}>
              Log In
            </Button>
          </div>

          <div className={styles.info}>
            Only individuals with access are allowed to log in
          </div>
        </form>
      </div>
    </>
  );
}