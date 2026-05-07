import {
  isSessionScopePayload,
  type SessionScope,
  type SessionScopePayload,
  type SessionScopeState,
} from "./types";

const getFallbackStorageKey = (scope: SessionScope) => {
  return `genius-ai-session:${scope}`;
};

const getEmptyPayload = (): SessionScopePayload => {
  return {
    userId: null,
    state: null,
  };
};

const readFallbackPayload = (scope: SessionScope): SessionScopePayload => {
  if (typeof window === "undefined") {
    return getEmptyPayload();
  }

  try {
    const storedValue = window.sessionStorage.getItem(getFallbackStorageKey(scope));

    if (!storedValue) {
      return getEmptyPayload();
    }

    const parsedValue = JSON.parse(storedValue) as unknown;

    if (isSessionScopePayload(parsedValue)) {
      return parsedValue;
    }
  } catch (error) {
    console.log(error);
  }

  return getEmptyPayload();
};

const writeFallbackPayload = (
  scope: SessionScope,
  payload: SessionScopePayload,
) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getFallbackStorageKey(scope),
      JSON.stringify(payload),
    );
  } catch (error) {
    console.log(error);
  }
};

const getSessionEndpoint = (scope: SessionScope) => {
  return `/api/session/${scope}`;
};

export const loadSessionScope = async (
  scope: SessionScope,
): Promise<SessionScopePayload> => {
  try {
    const response = await fetch(getSessionEndpoint(scope), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load ${scope} session`);
    }

    const payload = (await response.json()) as unknown;

    if (!isSessionScopePayload(payload)) {
      throw new Error(`Invalid ${scope} session payload`);
    }

    writeFallbackPayload(scope, payload);

    return payload;
  } catch (error) {
    console.log(error);
    return readFallbackPayload(scope);
  }
};

export const saveSessionScope = async (
  scope: SessionScope,
  state: SessionScopeState,
) => {
  const fallbackPayload: SessionScopePayload = {
    userId: readFallbackPayload(scope).userId,
    state,
  };

  writeFallbackPayload(scope, fallbackPayload);

  try {
    const response = await fetch(getSessionEndpoint(scope), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save ${scope} session`);
    }

    const payload = (await response.json()) as unknown;

    if (!isSessionScopePayload(payload)) {
      throw new Error(`Invalid ${scope} session payload`);
    }

    writeFallbackPayload(scope, payload);

    return payload;
  } catch (error) {
    console.log(error);
    return fallbackPayload;
  }
};
