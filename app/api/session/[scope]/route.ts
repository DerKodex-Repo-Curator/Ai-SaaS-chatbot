import { NextRequest, NextResponse } from "next/server";

import {
  attachSessionCookie,
  getOrCreateSessionId,
  getSessionUserId,
  getSessionScopeState,
  saveSessionScopeState,
  SESSION_COOKIE_NAME,
} from "@/lib/session/store";
import { isSessionScope, isSessionScopeState } from "@/lib/session/types";

const getScopeFromParams = async (params: Promise<{ scope: string }>) => {
  const { scope } = await params;

  if (!isSessionScope(scope)) {
    return null;
  }

  return scope;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scope: string }> },
) {
  try {
    const scope = await getScopeFromParams(params);

    if (!scope) {
      return new NextResponse("Invalid session scope", { status: 400 });
    }

    const { isNew, sessionId } = getOrCreateSessionId(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
    );

    const userId = getSessionUserId(sessionId);
    const payload = getSessionScopeState(sessionId, scope, userId);
    const response = NextResponse.json(payload);

    if (isNew) {
      attachSessionCookie(response, sessionId);
    }

    return response;
  } catch (error) {
    console.log("SESSION GET ERROR:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ scope: string }> },
) {
  try {
    const scope = await getScopeFromParams(params);

    if (!scope) {
      return new NextResponse("Invalid session scope", { status: 400 });
    }

    const body = (await request.json()) as {
      state?: unknown;
    };

    if (!isSessionScopeState(body.state)) {
      return new NextResponse("Invalid session state", { status: 400 });
    }

    const { isNew, sessionId } = getOrCreateSessionId(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
    );

    const userId = getSessionUserId(sessionId);
    const payload = saveSessionScopeState(
      sessionId,
      scope,
      body.state,
      userId,
    );
    const response = NextResponse.json(payload);

    if (isNew) {
      attachSessionCookie(response, sessionId);
    }

    return response;
  } catch (error) {
    console.log("SESSION PUT ERROR:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
