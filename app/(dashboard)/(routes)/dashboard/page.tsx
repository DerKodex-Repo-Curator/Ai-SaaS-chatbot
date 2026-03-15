"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Car, MessageSquare, Music,ImageIcon , VideoIcon , Code} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useReducer } from "react";
import { useRouter } from "next/navigation";

const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/conversation",
  },
  {
    label : "Image Generation",
    icon  : ImageIcon,
    color : "text-pink-500",
    bgcolor: "bg-pink-500/10",
    href  : "/image",
  },
  {
    label : "Video Generation",
    icon  : VideoIcon,
    color : "text-orange-500",
    bgcolor : "bg-orange-500/10",
    href  : "/video",
  },
  {
    label: "Music Generation",
    icon: Music,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/music",
  },
  {
    label : "Code Generation",
    icon  : Code,
    color : "text-green-500",
    bgcolor : "bg-green-500/10",
    href  : "/code",
  },
 

  // Removed invalid tool object without required properties
];

export default function DashboardPage() {
  const router = useRouter();
  return (
    <div>
      {/* heading */}
      <div className="mb-8 space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-center">
          Explore the power of AI
        </h2>

        <p className="text-muted-foreground text-sm md:text-base text-center">
          Chat with the smartest AI - Experience the power of AI
        </p>
      </div>
      {/* div */}
      <div className="px-4 md:px-20 lg:px-32 space-y-4">
        {tools.map((tool) => (
          <Card 
            onClick={()=> router.push(tool.href)}
            key={tool.href}
            className="p-4 border-black/5 flex items-center
            justify-start hover:shadow-md transition 
            cursor-pointer w-full"
          >
            <div className="flex items-center gap-x-4 w-full">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <div className="font-semibold">
                {tool.label}
              </div>
              <ArrowRight className="w-5 h-5 ml-auto shrink-0" />
            </div>
          </Card>
        ))}
        {/* cards */}


      </div>

    </div>
  )
}
