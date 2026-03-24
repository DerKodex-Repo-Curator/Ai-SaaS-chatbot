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
import { cn } from "@/lib/utils";

import { formSchema } from "./constants";

type ConversationApiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type CodeMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

type CodeChat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: CodeMessage[];
};

type StoredCodeChats = {
  chats: CodeChat[];
  activeChatId: string;
};

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

const STORAGE_KEY = "genius-ai-code-chats";
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

const isCodeMessage = (value: unknown): value is CodeMessage => {
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

const isCodeChatArray = (value: unknown): value is CodeChat[] => {
  return (
    Array.isArray(value) &&
    value.every((chat) => {
      if (!chat || typeof chat !== "object") {
        return false;
      }

      const { id, title, createdAt, updatedAt, messages } = chat as {
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
        messages.every(isCodeMessage)
      );
    })
  );
};

const isStoredCodeChats = (value: unknown): value is StoredCodeChats => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { chats, activeChatId } = value as {
    chats?: unknown;
    activeChatId?: unknown;
  };

  return isCodeChatArray(chats) && typeof activeChatId === "string";
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
              className="whitespace-pre-wrap text-sm leading-7 text-slate-700"
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
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue) as unknown;

      if (isStoredCodeChats(parsedValue) && parsedValue.chats.length > 0) {
        setChats(parsedValue.chats);
        setActiveChatId(parsedValue.activeChatId);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setHasLoadedFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedFromStorage || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        chats,
        activeChatId,
      } satisfies StoredCodeChats),
    );
  }, [activeChatId, chats, hasLoadedFromStorage]);

  const sortedChats = useMemo(
    () => [...chats].sort(sortChatsByLatestActivity),
    [chats],
  );

  const activeChat =
    sortedChats.find((chat) => chat.id === activeChatId) ?? sortedChats[0];

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
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
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
        <Card className="border-emerald-100/80 shadow-sm">
          <CardHeader className="gap-3 border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <History className="h-5 w-5 text-emerald-500" />
                  Code Chats
                </CardTitle>
                <CardDescription>
                  Saved locally and automatically sorted by latest activity.
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
                    "hover:border-emerald-300 hover:bg-emerald-50/60",
                    isActive
                      ? "border-emerald-300 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-white",
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
                          <p className="truncate text-sm font-semibold text-slate-900">
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
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
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
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600">
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

        <Card className="border-emerald-100/80 shadow-sm">
          <CardHeader className="gap-3 border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TerminalSquare className="h-5 w-5 text-emerald-500" />
                  {activeChat?.title ?? DEFAULT_CHAT_TITLE}
                </CardTitle>
                <CardDescription>
                  Build, debug, refactor, and keep every coding thread saved on this device.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Saved locally
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
            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-4 sm:p-5">
              {activeChat?.messages.length ? (
                <div className="space-y-4">
                  {activeChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-4xl rounded-2xl border p-4",
                        message.role === "user"
                          ? "ml-auto border-emerald-200 bg-emerald-50/80"
                          : "mr-auto border-slate-200 bg-white shadow-sm",
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
                              className="text-muted-foreground hover:text-emerald-600"
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
                              "min-h-32 w-full rounded-xl border border-input bg-white px-4 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow]",
                              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            )}
                            disabled={isLoading}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="bg-emerald-500 text-white hover:bg-emerald-500/90"
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
                  ))}

                  {pendingChatId === activeChat.id ? (
                    <div className="mr-auto max-w-2xl rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating code response...
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-full min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-6 text-center">
                  <div className="mb-4 rounded-full bg-emerald-500/10 p-4">
                    <Code className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    Start a coding conversation
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Ask for code generation, debugging help, refactors, explanations,
                    architecture ideas, or full component builds. Older chats stay saved
                    and the most recent activity automatically moves to the top.
                  </p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
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
                    className="w-full bg-emerald-500 text-white hover:bg-emerald-500/90 lg:w-auto"
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
