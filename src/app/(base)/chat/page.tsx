import type { Metadata } from "next";
import ChatClient from "./page.uc";

export const metadata: Metadata = {
  title: "New Chat",
};

export default async function Chat() {
  return <ChatClient />;
}
