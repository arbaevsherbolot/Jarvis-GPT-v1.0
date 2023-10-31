"use client";

import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

interface Props {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: Props) {
  return (
    <>
      <main
        style={{
          width: "100%",
          minHeight: "100vh",
          flex: "1 1 auto",
        }}>
        {children}
        <Toaster theme="light" />

        {/* <Footer /> */}
      </main>
    </>
  );
}
