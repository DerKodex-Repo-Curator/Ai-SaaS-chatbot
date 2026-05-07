export const SESSION_SCOPES = ["conversation", "code"] as const;

export type SessionScope = (typeof SESSION_SCOPES)[number];

export type SessionChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type SessionChat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: SessionChatMessage[];
};

export type SessionScopeState = {
  chats: SessionChat[];
  activeChatId: string;
};

export type SessionScopePayload = {
  userId: string | null;
  state: SessionScopeState | null;
};

export const isSessionScope = (value: string): value is SessionScope => {
  return SESSION_SCOPES.includes(value as SessionScope);
};

export const isSessionChatMessage = (
  value: unknown,
): value is SessionChatMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { id, role, content, createdAt } = value as {
    id?: unknown;
    role?: unknown;
    content?: unknown;
    createdAt?: unknown;
  };

  return (
    typeof id === "string" &&
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    typeof createdAt === "number"
  );
};

export const isSessionChat = (value: unknown): value is SessionChat => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { id, title, createdAt, updatedAt, messages } = value as {
    id?: unknown;
    title?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
    messages?: unknown;
  };

  return (
    typeof id === "string" &&
    typeof title === "string" &&
    typeof createdAt === "number" &&
    typeof updatedAt === "number" &&
    Array.isArray(messages) &&
    messages.every(isSessionChatMessage)
  );
};

export const isSessionScopeState = (
  value: unknown,
): value is SessionScopeState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { chats, activeChatId } = value as {
    chats?: unknown;
    activeChatId?: unknown;
  };

  return (
    Array.isArray(chats) &&
    chats.every(isSessionChat) &&
    typeof activeChatId === "string"
  );
};

export const isSessionScopePayload = (
  value: unknown,
): value is SessionScopePayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { userId, state } = value as {
    userId?: unknown;
    state?: unknown;
  };

  return (
    (typeof userId === "string" || userId === null) &&
    (state === null || isSessionScopeState(state))
  );
};
