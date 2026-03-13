"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { LayoutDashboard , MessageSquare , ImageIcon , VideoIcon , Music, Code, Settings} from "lucide-react";

const montserrat = Montserrat({
    weight: "600",
    subsets: ["latin"] 
});

const routes = [
    // {Dashboard icon}
    {
        label : "Dashboard",
        icon  : LayoutDashboard,
        href  : "/dashboard",
        color : "text-sky-500"
    },
    // {Conversations}
    {
        label : "Conversation",
        icon  : MessageSquare,
        href  : "/conversation",
        color : "text-violet-500"
    },
    // {Image Generation}
    {
        label : "Image Generation",
        icon  : ImageIcon,
        href  : "/image",
        color : "text-pink-500"
    },
    // {Video Generation}
    {
        label : "Video Generation",
        icon  : VideoIcon,
        href  : "/video",
        color : "text-orange-500"
    },
    // {Music Generation}
    {
        label : "Music Generation",
        icon  : Music,
        href  : "/music",
        color : "text-emerald-500"
    },
    // {Code Generation}
    {
        label : "Code Generation",
        icon  : Code,
        href  : "/code",
        color : "text-green-500"
    },
    // {Settings}
    {
        label : "Settings",
        icon  : Settings,
        href  : "/Settings",
    },
]

const Sidebar = () => {
    return (
        <div className="flex flex-col h-full bg-[#111827] text-white">

            <div className="p-3">

                <Link href="/dashboard" className="flex items-start gap-0">
    
                    <div className="relative w-14 h-14">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <h1 className={cn(
                        "text-2xl font-bold mt-1 -ml-3",
                        montserrat.className
                    )}>
                        Genius
                    </h1>

                </Link>

                {/* small push down */}
                <div className="space-y-3 mt-15">

                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className="
                              flex items-center
                              p-4
                              text-sm
                              font-medium
                              rounded-lg
                              hover:bg-white/10
                            "
                        >
                            <route.icon
                                className={cn("w-5 h-5 mr-3", route.color)}
                            />

                            {route.label}

                        </Link>
                    ))}

                </div>

            </div>

        </div>
    );
};

export default Sidebar;