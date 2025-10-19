"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BellIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // initial count
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((arr) => setCount(arr.filter((n: any) => n.status === "UNREAD").length));

    // live updates
    const socket: any = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`);
    socket.on("notification:new", (n: any) => {
      if (n.status === "UNREAD") setCount((c) => c + 1);
    });
    socket.on("notification:read", () => setCount((c) => Math.max(0, c - 1)));
    socket.on("notification:readAll", () => setCount(0));

    return () => socket.close();
  }, []);

  return (
    <button
      onClick={() => router.push("/notifications")}
      className="relative p-2 rounded-full hover:bg-[#2E7D7D]/20 transition"
      aria-label="Notifications"
    >
      <BellIcon className="w-6 h-6 text-white" />
      {count > 0 && (
        <>
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        </>
      )}
    </button>
  );
}
