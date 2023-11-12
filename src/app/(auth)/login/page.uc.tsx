"use client";

import LoginForm from "../_components/form/LoginForm";
import RequestToLogin from "../_components/form/RequestToLogin";
import styles from "@/styles/Auth.module.scss";

export default function LoginClient() {
  return (
    <>
      <div className={styles.page_wrapper}>
        <div className={styles.content}>
          {/* <LoginForm /> */}

          <RequestToLogin />
        </div>
      </div>
    </>
  );
}
