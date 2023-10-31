"use client";

import Image from "next/image";
import styles from "@/styles/Logo.module.scss";

interface props {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export default function Logo({ src, width, height, alt }: props) {
  return (
    <>
      <div
        className={styles.logo_wrapper}
        style={{
          width: width,
          height: height,
        }}>
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          className={styles.logo}
        />
      </div>
    </>
  );
}
