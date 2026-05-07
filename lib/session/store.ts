import "server-only";

import type { NextResponse } from "next/server";

import type { SessionScope, SessionScopeState } from "./types";

export const SESSION_COOKIE_NAME = "genius-ai-session-id";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

type SessionRecord = {
  userId: string | null;
  isAdmin: boolean;
  scopes: Partial<Record<SessionScope, SessionScopeState>>;
  updatedAt: number;
};

declare global {
  var __geniusAiSessionStore: Map<string, SessionRecord> | undefined;
}

const getSessionStore = () => {
  if (!globalThis.__geniusAiSessionStore) {
    globalThis.__geniusAiSessionStore = new Map<string, SessionRecord>();
  }

  return globalThis.__geniusAiSessionStore;
};

const pruneExpiredSessions = () => {
  const sessionStore = getSessionStore();
  const cutoff = Date.now() - SESSION_TTL_MS;

  for (const [sessionId, sessionRecord] of sessionStore.entries()) {
    if (sessionRecord.updatedAt < cutoff) {
      sessionStore.delete(sessionId);
    }
  }
};

const createSessionId = () => {
  return crypto.randomUUID();
};

const getOrCreateSessionRecord = (sessionId: string) => {
  pruneExpiredSessions();

  const sessionStore = getSessionStore();
  const existingRecord = sessionStore.get(sessionId);

  if (existingRecord) {
    existingRecord.updatedAt = Date.now();
    return existingRecord;
  }

  const nextRecord: SessionRecord = {
    userId: null,
    isAdmin: false,
    scopes: {},
    updatedAt: Date.now(),
  };

  sessionStore.set(sessionId, nextRecord);

  return nextRecord;
};

const syncSessionUser = (
  sessionRecord: SessionRecord,
  userId?: string | null,
) => {
  if (typeof userId !== "string") {
    return;
  }

  if (sessionRecord.userId && sessionRecord.userId !== userId) {
    sessionRecord.scopes = {};
  }

  sessionRecord.userId = userId;
};

const getSessionRecord = (sessionId: string) => {
  pruneExpiredSessions();

  return getSessionStore().get(sessionId) ?? null;
};

export const getOrCreateSessionId = (cookieValue?: string | null) => {
  if (typeof cookieValue === "string" && cookieValue.trim().length > 0) {
    return {
      isNew: false,
      sessionId: cookieValue,
    };
  }

  return {
    isNew: true,
    sessionId: createSessionId(),
  };
};

export const getSessionScopeState = (
  sessionId: string,
  scope: SessionScope,
  userId?: string | null,
) => {
  const sessionRecord = getOrCreateSessionRecord(sessionId);

  syncSessionUser(sessionRecord, userId);

  return {
    state: sessionRecord.scopes[scope] ?? null,
    userId: sessionRecord.userId,
  };
};

export const saveSessionScopeState = (
  sessionId: string,
  scope: SessionScope,
  state: SessionScopeState,
  userId?: string | null,
) => {
  const sessionRecord = getOrCreateSessionRecord(sessionId);

  syncSessionUser(sessionRecord, userId);

  sessionRecord.scopes[scope] = state;
  sessionRecord.updatedAt = Date.now();

  return {
    state: sessionRecord.scopes[scope] ?? null,
    userId: sessionRecord.userId,
  };
};

export const setSessionUserId = (
  sessionId: string,
  userId: string,
  isAdmin = false,
) => {
  const sessionRecord = getOrCreateSessionRecord(sessionId);

  syncSessionUser(sessionRecord, userId);
  sessionRecord.isAdmin = isAdmin;
  sessionRecord.updatedAt = Date.now();

  console.log("SESSION SET USER:", {
    sessionId,
    userId: sessionRecord.userId,
    isAdmin: sessionRecord.isAdmin,
    scopes: Object.keys(sessionRecord.scopes),
  });

  return sessionRecord.userId;
};

export const getSessionUserId = (sessionId?: string | null) => {
  if (!sessionId) {
    console.log("SESSION READ USER:", {
      hasSessionId: false,
      userId: null,
    });
    return null;
  }

  const sessionRecord = getSessionRecord(sessionId);

  console.log("SESSION READ USER:", {
    hasSessionId: true,
    userId: sessionRecord?.userId ?? null,
    hasRecord: Boolean(sessionRecord),
  });

  return sessionRecord?.userId ?? null;
};

export const getSessionIsAdmin = (sessionId?: string | null) => {
  if (!sessionId) {
    console.log("SESSION READ ADMIN:", {
      hasSessionId: false,
      isAdmin: false,
    });
    return false;
  }

  const sessionRecord = getSessionRecord(sessionId);

  console.log("SESSION READ ADMIN:", {
    hasSessionId: true,
    hasRecord: Boolean(sessionRecord),
    isAdmin: sessionRecord?.isAdmin ?? false,
  });

  return sessionRecord?.isAdmin ?? false;
};

export const destroySession = (sessionId?: string | null) => {
  if (!sessionId) {
    console.log("SESSION DESTROY:", {
      hasSessionId: false,
      destroyed: false,
    });
    return false;
  }

  const destroyed = getSessionStore().delete(sessionId);

  console.log("SESSION DESTROY:", {
    sessionId,
    destroyed,
  });

  return destroyed;
};

export const attachSessionCookie = (
  response: NextResponse,
  sessionId: string,
) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
};
