import { useUserData } from "@/hooks/useUserData";
import HomeClient from "./page.uc";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await useUserData();

  if (!data || !data.user || !data.session) return null;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${data.session}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status !== 200 || !response.ok) {
    return null;
  }

  const responseData = await response.json();

  return <HomeClient chats={responseData} session={data.session} />;
}
