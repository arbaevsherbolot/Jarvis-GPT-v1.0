import { useUserData } from "@/hooks/useUserData";
import ChatClient from "./page.uc";

interface Params {
  id: string;
}

interface Props {
  params: Params;
}

export default async function Chat({ params }: Props) {
  const data = await useUserData();

  if (!data || !data.user || !data.session) return null;

  const chatResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${params.id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.session}`,
        "Content-Type": "application/json",
      },
    }
  );

  const messagesResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/speech-to-text/${params.id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.session}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (chatResponse.status !== 200 || !chatResponse.ok) {
    return null;
  }

  const chatResponseData = await chatResponse.json();
  const messagesResponseData = await messagesResponse.json();

  return <ChatClient id={chatResponseData.id} session={data.session} messages={messagesResponseData} />;
}
