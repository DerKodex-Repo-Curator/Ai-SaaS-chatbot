import { NextRequest, NextResponse } from "next/server";

import { getSessionIsAdmin, SESSION_COOKIE_NAME } from "@/lib/session/store";

export const ADMIN_EMAIL = "yashtiwari2330@gmail.com";

export const isAdminEmail = (email?: string | null) => {
  return email?.toLowerCase() === ADMIN_EMAIL;
};

export const getRequestIsAdmin = (request: NextRequest) => {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;

  return getSessionIsAdmin(sessionId);
};

export const requireAdmin = (request: NextRequest) => {
  if (getRequestIsAdmin(request)) {
    return null;
  }

  return new NextResponse("Access Denied", { status: 403 });
};

export const getCookieIsAdmin = (sessionId?: string | null) => {
  return getSessionIsAdmin(sessionId);
};
