"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImageIcon, Palette, Sparkles, WandSparkles } from "lucide-react";

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

const promptSuggestions = [
  "A neon-lit cyberpunk street in the rain",
  "A cozy reading nook with warm sunlight and plants",
  "A futuristic city floating above the clouds",
  "A watercolor painting of a mountain village at dawn",
];

const ImagePage = () => {
  const [latestPrompt, setLatestPrompt] = useState("");
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

    setLatestPrompt(prompt);
    setPromptHistory((current) => [prompt, ...current.filter((item) => item !== prompt)].slice(0, 4));
    form.reset();
  };

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Write a prompt and prepare your image generation workspace."
        icon={ImageIcon}
        iconColor="text-pink-500"
        bgcolor="bg-pink-500/10"
      />
      <div className="grid gap-6 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <Card className="border-pink-100/80 shadow-sm">
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
                            "min-h-40 w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow]",
                            "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
                          )}
                          disabled={isLoading}
                          placeholder="A highly detailed portrait of an astronaut standing in a flower field, golden hour lighting, cinematic composition..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The page is ready now. Real image output can be plugged in once you connect an image model or API.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-pink-500 text-white hover:bg-pink-500/90 lg:w-auto"
                  disabled={isLoading}
                >
                  Prepare Prompt
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden border-pink-100/80 shadow-sm">
            <CardHeader className="gap-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-pink-500" />
                Preview Area
              </CardTitle>
              <CardDescription>
                This is the result section your image generator will fill once the backend is wired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6">
                <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-pink-200/60 blur-2xl" />
                <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-orange-200/50 blur-2xl" />
                <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl border border-white/70 bg-white/70 p-8 text-center backdrop-blur">
                  <div className="mb-4 rounded-full bg-pink-500/10 p-4">
                    <ImageIcon className="h-8 w-8 text-pink-500" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {latestPrompt ? "Prompt Ready" : "No Image Prompt Yet"}
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                    {latestPrompt
                      ? "Your prompt has been prepared. Plug in an image generation API here to replace this preview card with real generated artwork."
                      : "Submit a prompt to stage it here. This page is set up for your future image generation backend."}
                  </p>
                  {latestPrompt ? (
                    <div className="mt-5 w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-left text-sm text-slate-700">
                      {latestPrompt}
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100/80 shadow-sm">
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
                <div className="rounded-xl border border-dashed border-pink-200 px-4 py-8 text-center text-sm text-muted-foreground">
                  Your prepared prompts will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {promptHistory.map((prompt, index) => (
                    <div
                      key={`${prompt}-${index}`}
                      className="rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm text-slate-700"
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
