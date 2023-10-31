import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export { default } from "next-auth/middleware";

type UserRole = "USER" | "ADMIN" | "SUPERADMIN";

type User = {
  id: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isVerified: boolean;
  email: string;
  password: string;
  resetPasswordSecret?: string | null;
  role: UserRole;
  requests: number;
  lastRequest?: Date | null;
  firstName: string | null;
  lastName: string | null;
  bio?: string | null;
  photo?: string | null;
  phone?: string | null;
  refreshToken?: string | null;
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;
  const pathname = url.pathname;
  const searchParams = new URLSearchParams(url.searchParams);
  const responseCookies = response.cookies;
  const requestCookies = request.cookies;
  const token = await getToken({ req: request });
  const next = searchParams.get("next") || "/";

  let user: User | undefined;

  if (token && token?.tokens.access_token) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token?.tokens.access_token}`,
            baseurl: `${process.env.NEXT_PUBLIC_API_URL}`,
          },
        }
      );

      const responseData = await response.json();

      if (responseData.statusCode !== 401) {
        user = responseData;
        responseCookies.set("email", responseData.email);
      } else {
        requestCookies.getAll().map((cookie) => {
          if (cookie.name !== "email") {
            responseCookies.delete(cookie.name);
          }
        });
      }
    } catch (_) {}
  }

  const isAuth = user !== undefined;

  if (isAuth && pathname.startsWith("/login")) {
    const redirectUrl = new URL(next, url);
    return NextResponse.redirect(redirectUrl);
  }

  if (!isAuth && pathname.startsWith("/logout")) {
    const redirectUrl = new URL("/login", url);
    return NextResponse.redirect(redirectUrl);
  }

  if (!isAuth && pathname !== "/login") {
    const redirectUrl = new URL(
      pathname !== "/" ? `/login?next=${pathname}` : "/login",
      url
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuth && pathname === "/") {
    const redirectUrl = new URL("/chat", url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|_next/static|favicon.ico).*)",
};
