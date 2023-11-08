import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Log In",

      credentials: {
        emailOrName: {
          label: "Email Name",
          type: "text",
          placeholder: "Email or Name",
        },

        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },

      async authorize(credentials, req) {
        if (!credentials?.emailOrName || !credentials?.password) return null;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
              method: "POST",
              body: JSON.stringify(credentials),
              headers: {
                "Content-Type": "application/json",
                baseurl: `${process.env.NEXT_PUBLIC_API_URL}`,
              },
            }
          );

          const responseData = await response.json();

          if (response.status !== 200) {
            throw new Error(responseData.message);
          }

          if (!responseData) throw new Error("Server Error");

          return responseData;
        } catch (e) {
          //@ts-ignore
          throw new Error(e);
        }
      },
    }),

    GoogleProvider({
      name: "Google",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,

      async profile(profile) {
        return {
          id: profile.sub,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          photo: profile.picture,
        };
      },
    }),
  ],

  secret: `${process.env.NEXTAUTH_SECRET}`,

  pages: {
    signIn: "/login",
    signOut: "/logout",
  },

  callbacks: {
    async jwt({ session, token, user }) {
      if (user) return { ...token, ...user };

      return token;
    },

    async signIn({ user, account, profile }) {
      if (profile && profile.email !== "sherbolot@wedevx.co") {
        return false;
      }

      return true;
    },

    async session({ token, session, user }) {
      session.user = token.user;
      session.tokens = token.tokens;

      return session;
    },
  },
};
