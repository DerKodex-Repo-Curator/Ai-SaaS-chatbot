"use client";

import axios from "axios";
import Image from "next/image";
import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  Download,
  ImageIcon,
  Loader2,
  Palette,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { formSchema } from "./constants";

type ImageApiResponse = {
  imageUrl: string;
};

const promptSuggestions = [
  "A neon-lit cyberpunk street in the rain",
  "A cozy reading nook with warm sunlight and plants",
  "A futuristic city floating above the clouds",
  "A watercolor painting of a mountain village at dawn",
];

const ImagePage = () => {
  const [latestPrompt, setLatestPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const prompt = values.prompt.trim();

    setGenerationError("");
    setGeneratedImageUrl("");

    try {
      const response = await axios.post<ImageApiResponse>("/api/image", {
        prompt,
      });

      setLatestPrompt(prompt);
      setGeneratedImageUrl(response.data.imageUrl);
      setPromptHistory((current) =>
        [prompt, ...current.filter((item) => item !== prompt)].slice(0, 4),
      );
      form.reset();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data || error.message
        : "Something went wrong while generating your image.";

      setGenerationError(
        typeof message === "string"
          ? message
          : "Something went wrong while generating your image.",
      );
    }
  };

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Write a prompt and generate a new image."
        icon={ImageIcon}
        iconColor="text-pink-500"
        bgcolor="bg-pink-500/10"
      />
      <div className="grid gap-6 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <Card className="border-pink-100/80 shadow-sm dark:border-border">
          <CardHeader className="gap-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <WandSparkles className="h-5 w-5 text-pink-500" />
              Describe Your Image
            </CardTitle>
            <CardDescription>
              Add subject, style, lighting, colors, camera angle, or mood to make the prompt stronger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("prompt", suggestion, { shouldValidate: true })}
                >
                  {suggestion}
                </Button>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <textarea
                          className={cn(
                            "min-h-40 w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] dark:border-border dark:bg-secondary dark:text-foreground",
                            "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:placeholder:text-muted-foreground",
                            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
                          )}
                          disabled={isLoading}
                          placeholder="A highly detailed portrait of an astronaut standing in a flower field, golden hour lighting, cinematic composition..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add enough visual detail for the model to understand the subject, style, and mood.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-pink-500 text-white hover:bg-pink-500/90 dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] lg:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    "Generate Image"
                  )}
                </Button>
              </form>
            </Form>

            {generationError ? (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{generationError}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden border-pink-100/80 shadow-sm dark:border-border">
            <CardHeader className="gap-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-pink-500" />
                Generated Image
              </CardTitle>
              <CardDescription>
                Your latest image appears here after generation finishes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6 dark:border-border dark:bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)]">
                <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-pink-200/60 blur-2xl" />
                <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-orange-200/50 blur-2xl" />
                <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl border border-white/70 bg-white/70 p-8 text-center backdrop-blur dark:border-border dark:bg-card/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="mb-4 h-8 w-8 animate-spin text-pink-500" />
                      <p className="text-lg font-semibold text-slate-900 dark:text-foreground">
                        Creating Image
                      </p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                        This can take a little while for image models.
                      </p>
                    </>
                  ) : generatedImageUrl ? (
                    <>
                      <Image
                        src={generatedImageUrl}
                        alt={latestPrompt}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-4 text-left text-white backdrop-blur">
                        <p className="line-clamp-2 text-sm leading-5">
                          {latestPrompt}
                        </p>
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="mt-3"
                        >
                          <a href={generatedImageUrl} download="genius-ai-image.png">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 rounded-full bg-pink-500/10 p-4">
                        <ImageIcon className="h-8 w-8 text-pink-500" />
                      </div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-foreground">
                        No Image Yet
                      </p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                        Submit a prompt to generate artwork here.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100/80 shadow-sm dark:border-border">
            <CardHeader className="gap-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="h-5 w-5 text-pink-500" />
                Recent Prompts
              </CardTitle>
              <CardDescription>
                Keep track of the last few prompts you prepared on this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {promptHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-pink-200 px-4 py-8 text-center text-sm text-muted-foreground dark:border-border dark:bg-card/60">
                  Your prepared prompts will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {promptHistory.map((prompt, index) => (
                    <div
                      key={`${prompt}-${index}`}
                      className="rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm text-slate-700 dark:border-border dark:bg-card dark:text-[#e2e8f0]"
                    >
                      {prompt}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImagePage;
