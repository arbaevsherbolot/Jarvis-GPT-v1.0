import { useUserData } from "@/hooks/useUserData";
import ChatBar from "@/components/ui/ChatBar";
import ChatBarMenu from "@/components/ui/ChatBarMenu";

interface Props {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: Props) {
  const data = await useUserData();

  if (!data || !data.user || !data.session) return null;

  const chatResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.session}`,
        "Content-Type": "application/json",
      },
    }
  );

  const chatResponseData = await chatResponse.json();

  return (
    <main
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
      }}>
      <ChatBar
        chats={chatResponseData}
        user={data.user}
        session={data.session}
        v2={true}
      />

      <ChatBarMenu
        chats={chatResponseData}
        user={data.user}
        session={data.session}
      />

      {children}
    </main>
  );
}
