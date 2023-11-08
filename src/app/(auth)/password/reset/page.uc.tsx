"use client";

import ResetForm from "../../_components/form/ResetForm";
import { WedevxSvg } from "@/assets/svg";
import styles from "@/styles/Auth.module.scss";

export default function ResetClient() {
  return (
    <>
      <div className={styles.page_wrapper}>
        <div className={styles.content}>
          <ResetForm />
        </div>

        <WedevxSvg className={styles.logo} />
      </div>
    </>
  );
}
