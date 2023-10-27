import { Metadata } from "next";
import RootNotFoundClient from "./not-found.uc";

export const metadata: Metadata = {
  title: "404: Page not found",
};

export default async function RootNotFound() {
  return <RootNotFoundClient />;
}
