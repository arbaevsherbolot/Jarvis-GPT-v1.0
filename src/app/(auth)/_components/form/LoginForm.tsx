"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { getCookie } from "cookies-next";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";
import Google from "@/components/ui/Google";
import { CloseSvg, MailSvg, WedevxSvg } from "@/assets/svg";
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
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>();

  const emailOrName = watch("emailOrName");
  const password = watch("password");

  const [loading, setLoading] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleShowInput = () => {
    setShowInput(true);
  };

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleClearInput = (name: keyof FormData) => {
    setValue(name, "");
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
        router.push(`/redirect?to=${next}`);
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
          <h2 className={styles.title}>Log in</h2>

          <Google />

          <div style={showForm ? { display: "none" } : { display: "block" }}>
            <Button
              load={false}
              type="button"
              style="white"
              onClick={handleShowForm}>
              <MailSvg className={styles.icon} /> Continue with Email
            </Button>
          </div>

          <div
            className={styles.inputs_container}
            style={!showForm ? { display: "none" } : { display: "flex" }}>
            <div className={styles.devider}>
              <hr />
              <span>or</span>
              <hr />
            </div>

            <div className={styles.input_container}>
              <span className={styles.label}>Email address or name</span>

              <div className={styles.input_wrapper}>
                <input
                  type="text"
                  disabled={loading}
                  className={
                    loading ? `${styles.input} ${styles.load}` : styles.input
                  }
                  placeholder="Enter your email address or name..."
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

                <CloseSvg
                  className={styles.clear}
                  onClick={() => handleClearInput("emailOrName")}
                  style={
                    !loading && emailOrName && emailOrName.length > 0
                      ? { fontSize: "1.1rem", fill: "#fff" }
                      : { display: "none" }
                  }
                />
              </div>

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

              <div className={styles.input_wrapper}>
                <input
                  type="password"
                  disabled={loading}
                  autoComplete="off"
                  className={
                    loading
                      ? `${styles.input} ${styles.load} ${styles.password}`
                      : `${styles.input} ${styles.password}`
                  }
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password required",
                    minLength: {
                      value: 6,
                      message: "Password must contain at least 6 characters",
                    },
                    maxLength: {
                      value: 24,
                      message:
                        "Password cannot contain more than 24 characters",
                    },
                  })}
                />

                <CloseSvg
                  className={styles.clear}
                  onClick={() => handleClearInput("password")}
                  style={
                    !loading && password && password.length > 0
                      ? { fontSize: "1.1rem", fill: "#fff" }
                      : { display: "none" }
                  }
                />
              </div>

              {errors.password && (
                <span className={styles.error}>{errors.password.message}</span>
              )}
            </div>

            <Button type="submit" load={loading} disabled={!isValid}>
              Continue with email or name
            </Button>

            <Link className={styles.link} href="/password/forgot">
              Forgot password?
            </Link>
          </div>

          <div className={styles.info}>
            Powered by <WedevxSvg className={styles.logo} />
          </div>
        </form>
      </div>
    </>
  );
}
