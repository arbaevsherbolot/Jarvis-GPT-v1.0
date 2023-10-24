"use client";

import LoginForm from "../_components/form/LoginForm";
import styles from "@/styles/Auth.module.scss";

export default function LoginClient() {
  return (
    <>
      <div className={styles.page_wrapper}>
        <div className={styles.content}>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
