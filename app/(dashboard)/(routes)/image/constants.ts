import * as z from "zod";

export const formSchema = z.object({
  prompt: z
    .string()
    .min(1, {
      message: "Image prompt is required",
    })
    .max(500, {
      message: "Prompt must be 500 characters or less",
    }),
});
