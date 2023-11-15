"use client";

import styles from "@/styles/Message.module.scss";

interface Props {
  children: React.ReactNode;
  label?: string;
}

export default function Message({ children, label }: Props) {
  return (
    <>
      <div className={styles.wrapper}>
        {label && <div className={styles.label}>{label}</div>}

        <div className={styles.text}>{children}</div>
      </div>
    </>
  );
}
