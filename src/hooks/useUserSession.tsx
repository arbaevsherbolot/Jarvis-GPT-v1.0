import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

type Tokens = {
  access_token: string;
  refresh_token: string;
};

export const useUserSession = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      const tokens: Tokens = {
        access_token: `${session.tokens?.access_token}`,
        refresh_token: `${session.tokens?.refresh_token}`,
      };
      return tokens;
    }

    return null;
  } catch (e) {
    console.error(e);
  }
};
