"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  errorNotification,
  successNotification,
} from "@/lib/utils/notification";
import axios from "axios";
import Button from "@/components/ui/Button";
import { CloseSvg, WedevxSvg } from "@/assets/svg";
import styles from "@/styles/Form.module.scss";

type FormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const [loading, setLoading] = useState<boolean>(false);

  const handleClearInput = (name: keyof FormData) => {
    setValue(name, "");
  };

  const handleSubmitForm: SubmitHandler<FormData> = async (formData) => {
    setLoading(true);

    const { password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      errorNotification(`Passwords don't match`);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/reset`,
        {
          password,
          token,
        },
        {
          headers: {
            "Content-Type": "application/json",
            baseurl: `${process.env.NEXT_PUBLIC_API_URL}`,
          },
        }
      );

      if (response.status === 200) {
        successNotification("Password updated successfully");
        window.open("about:blank", "_self");
        window.close();
      }
    } catch (e) {
      //@ts-ignore
      errorNotification(e.response.data.message);
      router.push("/password/forgot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/password/forgot");
    }
  }, [token]);

  return (
    <>
      <div className={styles.form_wrapper}>
        <form className={styles.form} onSubmit={handleSubmit(handleSubmitForm)}>
          <h2 className={styles.title}>Reset Password</h2>

          <div className={styles.inputs_container}>
            <div className={styles.input_container}>
              <span className={styles.label}>Password</span>

              <div className={styles.input_wrapper}>
                <input
                  type="password"
                  disabled={loading}
                  className={
                    loading ? `${styles.input} ${styles.load}` : styles.input
                  }
                  placeholder="Enter your new password..."
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

            <div className={styles.input_container}>
              <span className={styles.label}>Confirm Password</span>

              <div className={styles.input_wrapper}>
                <input
                  type="password"
                  disabled={loading}
                  className={
                    loading ? `${styles.input} ${styles.load}` : styles.input
                  }
                  placeholder="Confirm your new password..."
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
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
                  onClick={() => handleClearInput("confirmPassword")}
                  style={
                    !loading && confirmPassword && confirmPassword.length > 0
                      ? { fontSize: "1.1rem", fill: "#fff" }
                      : { display: "none" }
                  }
                />
              </div>

              {errors.confirmPassword && (
                <span className={styles.error}>
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <Button type="submit" load={loading}>
              Reset
            </Button>

            <Link className={styles.link} href="/password/forgot">
              Send link again?
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
