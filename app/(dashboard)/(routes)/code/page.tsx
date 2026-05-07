"use client";

import axios from "axios";
import * as z from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Code,
  Copy,
  History,
  Loader2,
  Pencil,
  Plus,
  TerminalSquare,
  Trash2,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { loadSessionScope, saveSessionScope } from "@/lib/session/client";
import type {
  SessionChat,
  SessionChatMessage,
  SessionScope,
} from "@/lib/session/types";
import { cn } from "@/lib/utils";

import { formSchema } from "./constants";

type ConversationApiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type CodeMessage = SessionChatMessage;
type CodeChat = SessionChat;

type EditingState = {
  chatId: string;
  messageId: string;
};

type MessageSegment =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "code";
      content: string;
      language: string;
};

type MessageContentProps = {
  message: CodeMessage;
  copiedBlockId: string | null;
  onCopy: (blockId: string, code: string) => Promise<void>;
};

const SESSION_SCOPE: SessionScope = "code";
const DEFAULT_CHAT_TITLE = "New code chat";
const INITIAL_CHAT_ID = "code-chat-initial";

const historyTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const historyDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const messageTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const truncateText = (value: string, maxLength: number) => {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
};

const getChatTitle = (messages: CodeMessage[]) => {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (!firstUserMessage) {
    return DEFAULT_CHAT_TITLE;
  }

  return truncateText(firstUserMessage.content, 36);
};

const getChatPreview = (chat: CodeChat) => {
  const lastMessage = chat.messages.at(-1);

  if (!lastMessage) {
    return "Start a fresh coding session.";
  }

  return truncateText(lastMessage.content, 72);
};

const sortChatsByLatestActivity = (firstChat: CodeChat, secondChat: CodeChat) => {
  if (secondChat.updatedAt !== firstChat.updatedAt) {
    return secondChat.updatedAt - firstChat.updatedAt;
  }

  return secondChat.createdAt - firstChat.createdAt;
};

const formatHistoryTimestamp = (timestamp: number) => {
  if (!timestamp) {
    return "No activity yet";
  }

  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return historyTimeFormatter.format(date);
  }

  return historyDateFormatter.format(date);
};

const formatMessageTimestamp = (timestamp: number) => {
  if (!timestamp) {
    return "";
  }

  return messageTimeFormatter.format(new Date(timestamp));
};

const createInitialChat = (): CodeChat => ({
  id: INITIAL_CHAT_ID,
  title: DEFAULT_CHAT_TITLE,
  createdAt: 0,
  updatedAt: 0,
  messages: [],
});

const createNewChat = (): CodeChat => {
  const now = Date.now();

  return {
    id: createId(),
    title: DEFAULT_CHAT_TITLE,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
};

const getNextActiveChatId = (
  remainingChats: CodeChat[],
  deletedChatId: string,
  currentActiveChatId: string,
) => {
  if (remainingChats.length === 0) {
    return null;
  }

  if (currentActiveChatId !== deletedChatId) {
    return currentActiveChatId;
  }

  return [...remainingChats].sort(sortChatsByLatestActivity)[0]?.id ?? null;
};

const getDisplayedMessages = <T extends { role: "user" | "assistant" }>(
  messages: T[],
) => {
  const messageGroups: T[][] = [];

  messages.forEach((message) => {
    const latestGroup = messageGroups.at(-1);

    if (
      message.role === "user" ||
      !latestGroup ||
      latestGroup.at(-1)?.role === "assistant"
    ) {
      messageGroups.push([message]);
      return;
    }

    latestGroup.push(message);
  });

  return messageGroups.reverse().flat();
};

const parseMessageSegments = (content: string): MessageSegment[] => {
  const pattern = /```([\w-]+)?\n([\s\S]*?)```/g;
  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(content)) !== null) {
    const [fullMatch, language = "code", code] = match;
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      const textContent = content.slice(lastIndex, startIndex).trim();

      if (textContent) {
        segments.push({
          type: "text",
          content: textContent,
        });
      }
    }

    segments.push({
      type: "code",
      language,
      content: code.replace(/\n$/, ""),
    });

    lastIndex = startIndex + fullMatch.length;
  }

  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim();

    if (textContent) {
      segments.push({
        type: "text",
        content: textContent,
      });
    }
  }

  if (segments.length === 0) {
    return [
      {
        type: "text",
        content,
      },
    ];
  }

  return segments;
};

const MessageContent = ({
  message,
  copiedBlockId,
  onCopy,
}: MessageContentProps) => {
  const segments = parseMessageSegments(message.content);

  return (
    <div className="space-y-4">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return (
            <div
              key={`${message.id}-text-${index}`}
              className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-[#e2e8f0]"
            >
              {segment.content}
            </div>
          );
        }

        const blockId = `${message.id}-code-${index}`;
        const isCopied = copiedBlockId === blockId;

        return (
          <div
            key={blockId}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {segment.language}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-200 hover:bg-slate-800 hover:text-white"
                onClick={() => onCopy(blockId, segment.content)}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-7 text-emerald-100">
              <code>{segment.content}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
};

const CodePage = () => {
  const [chats, setChats] = useState<CodeChat[]>([createInitialChat()]);
  const [activeChatId, setActiveChatId] = useState(INITIAL_CHAT_ID);
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [hasLoadedFromSession, setHasLoadedFromSession] = useState(false);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const topRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const { state } = await loadSessionScope(SESSION_SCOPE);

      if (!isMounted) {
        return;
      }

      if (state?.chats.length) {
        setChats(state.chats);
        setActiveChatId(state.activeChatId);
      }

      setHasLoadedFromSession(true);
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedFromSession) {
      return;
    }

    void saveSessionScope(SESSION_SCOPE, {
      chats,
      activeChatId,
    });
  }, [activeChatId, chats, hasLoadedFromSession]);

  const sortedChats = useMemo(
    () => [...chats].sort(sortChatsByLatestActivity),
    [chats],
  );

  const activeChat =
    sortedChats.find((chat) => chat.id === activeChatId) ?? sortedChats[0];
  const displayedMessages = activeChat
    ? getDisplayedMessages(activeChat.messages)
    : [];

  useEffect(() => {
    if (!sortedChats.length) {
      return;
    }

    const hasActiveChat = sortedChats.some((chat) => chat.id === activeChatId);

    if (!hasActiveChat) {
      setActiveChatId(sortedChats[0].id);
    }
  }, [activeChatId, sortedChats]);

  useEffect(() => {
    topRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [activeChat?.id, activeChat?.messages.length, pendingChatId]);

  const updateChat = (
    chatId: string,
    updater: (chat: CodeChat) => CodeChat,
  ) => {
    setChats((currentChats) =>
      currentChats.map((chat) => (chat.id === chatId ? updater(chat) : chat)),
    );
  };

  const clearEditingState = () => {
    setEditingState(null);
    setEditingValue("");
  };

  const requestCodeReply = async ({
    chatId,
    messages,
    onError,
  }: {
    chatId: string;
    messages: CodeMessage[];
    onError?: () => void;
  }) => {
    setPendingChatId(chatId);

    try {
      const response = await axios.post<ConversationApiMessage>("/api/code", {
        messages: messages.map(({ role, content }) => ({ role, content })),
      });

      const responseTimestamp = Date.now();
      const assistantMessage: CodeMessage = {
        id: createId(),
        role: "assistant",
        content: response.data.content,
        createdAt: responseTimestamp,
      };

      updateChat(chatId, (chat) => ({
        ...chat,
        title: getChatTitle(chat.messages),
        updatedAt: responseTimestamp,
        messages: [...chat.messages, assistantMessage],
      }));
    } catch (error) {
      onError?.();
      console.log(error);
    } finally {
      setPendingChatId((currentPendingChatId) =>
        currentPendingChatId === chatId ? null : currentPendingChatId,
      );
    }
  };

  const handleCreateChat = () => {
    const newChat = createNewChat();

    setChats((currentChats) => [newChat, ...currentChats]);
    setActiveChatId(newChat.id);
    form.reset();
    clearEditingState();
  };

  const handleDeleteChat = (chatId: string) => {
    const remainingChats = chats.filter((chat) => chat.id !== chatId);
    const nextActiveChatId = getNextActiveChatId(
      remainingChats,
      chatId,
      activeChatId,
    );

    if (remainingChats.length === 0) {
      const fallbackChat = createInitialChat();
      setChats([fallbackChat]);
      setActiveChatId(fallbackChat.id);
      setPendingChatId(null);
      form.reset();
      clearEditingState();
      return;
    }

    setChats(remainingChats);
    setActiveChatId(nextActiveChatId ?? remainingChats[0].id);
    setPendingChatId((currentPendingChatId) =>
      currentPendingChatId === chatId ? null : currentPendingChatId,
    );

    if (activeChatId === chatId || editingState?.chatId === chatId) {
      form.reset();
      clearEditingState();
    }
  };

  const handleStartEditing = (chatId: string, message: CodeMessage) => {
    setEditingState({
      chatId,
      messageId: message.id,
    });
    setEditingValue(message.content);
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!activeChat) {
      return;
    }

    const trimmedValue = editingValue.trim();

    if (!trimmedValue) {
      return;
    }

    const messageIndex = activeChat.messages.findIndex(
      (message) => message.id === messageId,
    );

    if (messageIndex === -1) {
      return;
    }

    const messageToEdit = activeChat.messages[messageIndex];

    if (messageToEdit.role !== "user") {
      return;
    }

    if (messageToEdit.content === trimmedValue) {
      clearEditingState();
      return;
    }

    const requestTimestamp = Date.now();
    const regeneratedMessages = [
      ...activeChat.messages.slice(0, messageIndex),
      {
        ...messageToEdit,
        content: trimmedValue,
      },
    ];

    updateChat(activeChat.id, (chat) => ({
      ...chat,
      title: getChatTitle(regeneratedMessages),
      updatedAt: requestTimestamp,
      messages: regeneratedMessages,
    }));

    clearEditingState();

    await requestCodeReply({
      chatId: activeChat.id,
      messages: regeneratedMessages,
    });
  };

  const handleCopyCode = async (blockId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlockId(blockId);
      window.setTimeout(() => {
        setCopiedBlockId((currentBlockId) =>
          currentBlockId === blockId ? null : currentBlockId,
        );
      }, 1500);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!activeChat) {
      return;
    }

    const prompt = values.prompt.trim();
    const requestTimestamp = Date.now();

    const userMessage: CodeMessage = {
      id: createId(),
      role: "user",
      content: prompt,
      createdAt: requestTimestamp,
    };

    const previousChatState = activeChat;
    const chatId = activeChat.id;
    const nextMessages = [...activeChat.messages, userMessage];

    updateChat(chatId, (chat) => ({
      ...chat,
      title: getChatTitle(nextMessages),
      updatedAt: requestTimestamp,
      messages: nextMessages,
    }));

    form.reset();

    await requestCodeReply({
      chatId,
      messages: nextMessages,
      onError: () => {
        updateChat(chatId, () => previousChatState);
        form.setValue("prompt", prompt, { shouldValidate: true });
      },
    });
  };

  return (
    <div>
      <Heading
        title="Code"
        description="Start AI coding chats, keep old sessions saved, and jump back into any thread instantly."
        icon={Code}
        iconColor="text-emerald-500"
        bgcolor="bg-emerald-500/10"
      />
      <div className="grid gap-6 px-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
        <Card className="border-emerald-100/80 shadow-sm dark:border-border">
          <CardHeader className="gap-3 border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <History className="h-5 w-5 text-emerald-500" />
                  Code Chats
                </CardTitle>
                <CardDescription>
                  Saved for this session and automatically sorted by latest activity.
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateChat}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-[68vh] space-y-3 overflow-y-auto px-4 pb-6">
            {sortedChats.map((chat) => {
              const isActive = chat.id === activeChat?.id;
              const isPending = chat.id === pendingChatId;

              return (
                <div
                  key={chat.id}
                  className={cn(
                    "rounded-2xl border px-4 py-3 transition",
                    "hover:border-emerald-300 hover:bg-emerald-50/60 dark:hover:border-[#3b82f6] dark:hover:bg-card",
                    isActive
                      ? "border-emerald-300 bg-emerald-50 shadow-sm dark:border-[#3b82f6] dark:bg-card dark:shadow-none"
                      : "border-slate-200 bg-white dark:border-border dark:bg-card",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChatId(chat.id);
                        clearEditingState();
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-foreground">
                            {chat.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {chat.messages.length === 0
                              ? "Empty chat"
                              : `${chat.messages.length} message${
                                  chat.messages.length === 1 ? "" : "s"
                                }`}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs font-medium text-muted-foreground">
                          {formatHistoryTimestamp(chat.updatedAt)}
                        </p>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                        {getChatPreview(chat)}
                      </p>
                    </button>

                    <div className="shrink-0 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteChat(chat.id)}
                        disabled={isLoading}
                        aria-label={`Delete ${chat.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      {isPending ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-blue-300">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Active
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-emerald-100/80 shadow-sm dark:border-border">
          <CardHeader className="gap-3 border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TerminalSquare className="h-5 w-5 text-emerald-500" />
                  {activeChat?.title ?? DEFAULT_CHAT_TITLE}
                </CardTitle>
                <CardDescription>
                  Build, debug, refactor, and keep every coding thread available during this session.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-border dark:bg-card dark:text-muted-foreground">
                  Session memory
                </span>
                {activeChat ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteChat(activeChat.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Chat
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-[68vh] flex-col gap-4 pt-6">
            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-4 dark:border-border dark:bg-[linear-gradient(180deg,#0f172a_0%,#0f172a_60%,#1e293b_100%)] sm:p-5">
              {activeChat?.messages.length ? (
                <div className="space-y-4">
                  <div ref={topRef} />

                  {displayedMessages.map((message, index) => (
                    <div key={message.id} className="space-y-4">
                      <div
                        className={cn(
                          "max-w-4xl rounded-2xl border p-4",
                          message.role === "user"
                            ? "ml-auto border-emerald-200 bg-emerald-50/80 dark:border-[#2563eb] dark:bg-[#2563eb] dark:text-white"
                            : "mr-auto border-slate-200 bg-white shadow-sm dark:border-border dark:bg-[#334155] dark:text-[#e2e8f0] dark:shadow-none",
                        )}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {message.role === "user" ? "You" : "AI coder"}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {formatMessageTimestamp(message.createdAt)}
                            </p>
                            {message.role === "user" ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-emerald-600 dark:hover:text-blue-200"
                                onClick={() =>
                                  handleStartEditing(activeChat.id, message)
                                }
                                disabled={isLoading}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        {editingState?.chatId === activeChat.id &&
                        editingState.messageId === message.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingValue}
                              onChange={(event) =>
                                setEditingValue(event.target.value)
                              }
                              className={cn(
                                "min-h-32 w-full rounded-xl border border-input bg-white px-4 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] dark:border-border dark:bg-secondary dark:text-foreground",
                                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:placeholder:text-muted-foreground",
                              )}
                              disabled={isLoading}
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                className="bg-emerald-500 text-white hover:bg-emerald-500/90 dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
                                onClick={() => handleSaveEdit(message.id)}
                                disabled={isLoading || !editingValue.trim()}
                              >
                                <Check className="h-4 w-4" />
                                Save And Regenerate
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearEditingState}
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <MessageContent
                            message={message}
                            copiedBlockId={copiedBlockId}
                            onCopy={handleCopyCode}
                          />
                        )}
                      </div>

                      {pendingChatId === activeChat.id &&
                      index === 0 &&
                      message.role === "user" ? (
                        <div className="mr-auto max-w-2xl rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-700 dark:border-border dark:bg-card dark:text-foreground">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating code response...
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-6 text-center dark:border-border dark:bg-card">
                  <div className="mb-4 rounded-full bg-emerald-500/10 p-4">
                    <Code className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-foreground">
                    Start a coding conversation
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                    Ask for code generation, debugging help, refactors, explanations,
                    architecture ideas, or full component builds. Older chats stay
                    available for this session and the most recent activity
                    automatically moves to the top.
                  </p>
                </div>
              )}
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-border dark:bg-card"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl className="m-0 p-0">
                          <textarea
                            className={cn(
                              "min-h-28 w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow]",
                              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                              "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
                            )}
                            disabled={isLoading}
                            placeholder="Ask for a React component, debug an error, refactor a function, explain code, or generate a full feature..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 text-white hover:bg-emerald-500/90 dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] lg:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending
                      </>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodePage;
