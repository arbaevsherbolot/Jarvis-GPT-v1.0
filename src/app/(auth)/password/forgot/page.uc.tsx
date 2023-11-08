"use client";

import ForgotForm from "../../_components/form/ForgotForm";
import { WedevxSvg } from "@/assets/svg";
import styles from "@/styles/Auth.module.scss";

export default function ForgotClient() {
  return (
    <>
      <div className={styles.page_wrapper}>
        <div className={styles.content}>
          <ForgotForm />
        </div>

        <WedevxSvg className={styles.logo} />
      </div>
    </>
  );
}
