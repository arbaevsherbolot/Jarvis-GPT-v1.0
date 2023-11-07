"use client";

import { useRouter } from "next/navigation";
import { LoadSvg } from "@/assets/svg";
import styles from "@/styles/Button.module.scss";

interface props {
  children: React.ReactNode;
  style?: keyof TStyles;
  disabled?: boolean;
  type: keyof TTypes;
  load: boolean;
  onClick?: () => void;
  redirect?: string;
}

type TStyles = {
  edit: string;
  delete: string;
  black: string;
};

type TTypes = {
  button: string;
  submit: string;
};

export default function Button({
  children,
  style,
  disabled,
  type,
  load,
  onClick,
  redirect,
}: props) {
  const router = useRouter();

  const redirectToPage = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {!load ? (
        <button
          type={type}
          disabled={disabled}
          onClick={
            onClick ? onClick : () => redirect && redirectToPage(redirect)
          }
          className={
            style
              ? disabled
                ? `${styles.button} ${styles[style]} ${styles.disabled}`
                : `${styles.button} ${styles[style]}`
              : disabled
              ? `${styles.button} ${styles.disabled}`
              : styles.button
          }>
          {children}
        </button>
      ) : (
        <button
          type="submit"
          disabled={true}
          className={
            style
              ? `${styles.button_load} ${styles[style]}`
              : styles.button_load
          }>
          {!style ? (
            <LoadSvg
              className={styles.load}
              style={{ fill: "rgb(235, 87, 87)" }}
            />
          ) : (
            <LoadSvg className={styles.load} />
          )}
        </button>
      )}
    </>
  );
}
