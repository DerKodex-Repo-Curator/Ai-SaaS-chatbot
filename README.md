<<<<<<< HEAD
# Ai-SaaS-chatbot
An AI-powered platform integrating ComfyUI, Large Language Models (LLMs), and intelligent workflows for image generation, automation, and AI-assisted interactions.
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Image Generation

The image page uses ComfyUI through the server route at `app/api/image/route.ts`.

```bash
COMFYUI_API_URL=http://127.0.0.1:8188
COMFYUI_CHECKPOINT=v1-5-pruned-emaonly.1.safetensors
```

Start ComfyUI before generating images:

```bash
cd ~/Desktop/comfy/ComfyUI
source venv/bin/activate
python main.py --cpu --listen 127.0.0.1 --port 8188
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 5fa6f0c (Ai-SaaS based project)
