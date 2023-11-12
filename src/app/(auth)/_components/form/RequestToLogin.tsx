"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import axios from "axios";
import Button from "@/components/ui/Button";
import { CloseSvg, MailSvg, WedevxSvg } from "@/assets/svg";
import styles from "@/styles/Form.module.scss";

type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  photo?: string | null;
  phone?: string | null;
  bio?: string | null;
  isVerified: boolean;
};

type FormData = {
  emailOrName: string;
  password: string;
};

export default function RequestToLogin() {
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

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [accessToLogin, setAccessToLogin] = useState<boolean>(false);

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleReset = () => {
    setAccessToLogin(false);
  };

  const handleClearInput = (name: keyof FormData) => {
    setValue(name, "");
  };

  const handleSubmitForm: SubmitHandler<FormData> = async (
    formData: FormData
  ) => {
    setLoading(true);

    if (!accessToLogin) {
      try {
        const { data, status } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/requestToLogin`,
          { emailOrName: formData.emailOrName },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (status === 200) {
          setUserInfo(data);
        }
      } catch (e) {
        //@ts-ignore
        errorNotification(e.response.data.message);
        setAccessToLogin(false);
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else {
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
    }
  };

  useEffect(() => {
    if (userInfo) {
      setAccessToLogin(true);
    } else setAccessToLogin(false);
  }, [userInfo]);

  return (
    <>
      <div className={styles.form_wrapper}>
        <form className={styles.form} onSubmit={handleSubmit(handleSubmitForm)}>
          <h2 className={styles.title}>Log in</h2>

          {/* <Google /> */}

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
            {/* <div className={styles.devider}>
            <hr />
            <span>or</span>
            <hr />
          </div> */}

            {!accessToLogin ? (
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
            ) : (
              userInfo && (
                <div className={styles.account}>
                  <div className={styles.logo}>
                    {userInfo.photo ? (
                      <img
                        src={`${userInfo.photo}`}
                        alt={`${userInfo.firstName} ${userInfo.lastName}`}
                      />
                    ) : (
                      <span>{userInfo.firstName[0]}</span>
                    )}
                  </div>

                  <div className={styles.info}>
                    <h3 className={styles.name}>
                      {userInfo.firstName} {userInfo.lastName}
                    </h3>

                    <span className={styles.email}>{userInfo.email}</span>
                  </div>

                  <CloseSvg
                    className={styles.icon}
                    onClick={handleReset}
                    style={{ fontSize: "1.1rem", fill: "#fff" }}
                  />
                </div>
              )
            )}

            {accessToLogin && (
              <div className={styles.input_container}>
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
                    placeholder="Enter your password..."
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
                  <span className={styles.error}>
                    {errors.password.message}
                  </span>
                )}
              </div>
            )}

            <Button type="submit" load={loading} disabled={!isValid}>
              {!accessToLogin ? "Continue with email or name" : "Log in"}
            </Button>

            {accessToLogin && (
              <Link className={styles.link} href="/password/forgot">
                Forgot password?
              </Link>
            )}
          </div>

          <div className={styles.info}>
            Powered by <WedevxSvg className={styles.logo} />
          </div>
        </form>
      </div>
    </>
  );
}
