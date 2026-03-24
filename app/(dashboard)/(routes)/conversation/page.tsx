"use client";

import axios from "axios";
import * as z from "zod";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { formSchema } from "./constants";

type ConversationApiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

type ConversationChat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ConversationMessage[];
};

type EditingState = {
  chatId: string;
  messageId: string;
};

const DEFAULT_CHAT_TITLE = "New chat";
const INITIAL_CHAT_ID = "chat-initial";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
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

const getChatTitle = (messages: ConversationMessage[]) => {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (!firstUserMessage) {
    return DEFAULT_CHAT_TITLE;
  }

  return truncateText(firstUserMessage.content, 36);
};

const getChatPreview = (chat: ConversationChat) => {
  const lastMessage = chat.messages.at(-1);

  if (!lastMessage) {
    return "Start a new conversation.";
  }

  return truncateText(lastMessage.content, 72);
};

const formatActivityTime = (timestamp: number) => {
  if (!timestamp) {
    return "No activity yet";
  }

  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return timeFormatter.format(date);
  }

  return dateFormatter.format(date);
};

const sortChatsByLatestActivity = (
  firstChat: ConversationChat,
  secondChat: ConversationChat,
) => {
  if (secondChat.updatedAt !== firstChat.updatedAt) {
    return secondChat.updatedAt - firstChat.updatedAt;
  }

  return secondChat.createdAt - firstChat.createdAt;
};

const createInitialChat = (): ConversationChat => ({
  id: INITIAL_CHAT_ID,
  title: DEFAULT_CHAT_TITLE,
  createdAt: 0,
  updatedAt: 0,
  messages: [],
});

const createNewChat = (): ConversationChat => {
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
  remainingChats: ConversationChat[],
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

const ConversationPage = () => {
  const [chats, setChats] = useState<ConversationChat[]>([createInitialChat()]);
  const [activeChatId, setActiveChatId] = useState(INITIAL_CHAT_ID);
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const sortedChats = useMemo(
    () => [...chats].sort(sortChatsByLatestActivity),
    [chats],
  );

  const activeChat =
    sortedChats.find((chat) => chat.id === activeChatId) ?? sortedChats[0];

  const updateChat = (
    chatId: string,
    updater: (chat: ConversationChat) => ConversationChat,
  ) => {
    setChats((currentChats) =>
      currentChats.map((chat) => (chat.id === chatId ? updater(chat) : chat)),
    );
  };

  const clearEditingState = () => {
    setEditingState(null);
    setEditingValue("");
  };

  const requestAssistantReply = async ({
    chatId,
    messages,
    onError,
  }: {
    chatId: string;
    messages: ConversationMessage[];
    onError?: () => void;
  }) => {
    setPendingChatId(chatId);

    try {
      const response = await axios.post<ConversationApiMessage>(
        "/api/conversation",
        {
          messages: messages.map(({ role, content }) => ({ role, content })),
        },
      );

      const responseTimestamp = Date.now();
      const assistantMessage: ConversationMessage = {
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

  const handleStartEditing = (chatId: string, message: ConversationMessage) => {
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

    await requestAssistantReply({
      chatId: activeChat.id,
      messages: regeneratedMessages,
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!activeChat) {
      return;
    }

    const prompt = values.prompt.trim();
    const requestTimestamp = Date.now();

    const userMessage: ConversationMessage = {
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

    await requestAssistantReply({
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
        title="Conversation"
        description="Chat with your assistant."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgcolor="bg-violet-500/10"
      />
      <div className="grid gap-6 px-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Card className="border-violet-100/80 shadow-sm">
          <CardHeader className="gap-3">
            <CardTitle className="flex items-center justify-between gap-3 text-xl">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-violet-500" />
                Chats
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateChat}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </CardTitle>
            <CardDescription>
              New and recently active chats stay pinned to the top automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedChats.map((chat) => {
              const isActive = chat.id === activeChat?.id;
              const isPending = chat.id === pendingChatId;

              return (
                <div
                  key={chat.id}
                  className={cn(
                    "rounded-2xl border px-4 py-3 transition",
                    "hover:border-violet-300 hover:bg-violet-50/50",
                    isActive
                      ? "border-violet-300 bg-violet-50 shadow-sm"
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
                          {formatActivityTime(chat.updatedAt)}
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
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-violet-600">
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

        <div className="space-y-6">
          <Card className="border-violet-100/80 shadow-sm">
            <CardHeader className="gap-3 border-b">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xl">
                  {activeChat?.title ?? DEFAULT_CHAT_TITLE}
                </CardTitle>
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
              <CardDescription>
                Messages in this chat update the list order instantly based on latest activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-12 gap-2 rounded-lg border p-4 px-3 focus-within:shadow-sm md:px-6"
                >
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <FormItem className="col-span-12 lg:col-span-10">
                        <FormControl className="m-0 p-0">
                          <Input
                            className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                            disabled={isLoading}
                            placeholder="Ask Qwen anything..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="col-span-12 w-full lg:col-span-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </form>
              </Form>

              {activeChat?.messages.length ? (
                <div className="space-y-4">
                  {activeChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "rounded-2xl border p-4",
                        message.role === "user"
                          ? "border-violet-200 bg-violet-50/70"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {message.role}
                        </p>
                        {message.role === "user" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-violet-600"
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
                      {editingState?.chatId === activeChat.id &&
                      editingState.messageId === message.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingValue}
                            onChange={(event) =>
                              setEditingValue(event.target.value)
                            }
                            className={cn(
                              "min-h-28 w-full rounded-xl border border-input bg-white px-4 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow]",
                              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            )}
                            disabled={isLoading}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
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
                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {message.content}
                        </p>
                      )}
                    </div>
                  ))}

                  {pendingChatId === activeChat.id ? (
                    <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-4 text-sm text-violet-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Waiting for Qwen&apos;s response...
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 px-6 py-12 text-center text-sm text-muted-foreground">
                  Start a new chat or pick an existing one to continue the conversation.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
