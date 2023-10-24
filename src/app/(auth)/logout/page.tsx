import type { Metadata } from 'next'
import LogoutClient from "./page.uc";

export const metadata: Metadata = {
  title: "Log Out",
};

export default async function Logout() {
  return <LogoutClient />;
}
