"use client";
import Link from "next/link";
import { Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function FloatingHomeButton() {
  const pathname = usePathname();
  // Hide on homepage
  if (pathname === "/") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <Link
          href="/"
          aria-label="Back to Home"
          className="group bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 shadow-xl rounded-full p-3 border border-white/80 hover:scale-105 hover:shadow-2xl transition-all duration-200 backdrop-blur-md flex items-center justify-center"
        >
          <motion.div
            whileHover={{ rotate: [0, 10, -10, 0], scale: 1.15 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center"
          >
            <Home className="w-6 h-6 text-white drop-shadow" />
          </motion.div>
          <span className="ml-2 text-white font-semibold text-base opacity-80 group-hover:opacity-100 transition-opacity hidden sm:inline-block">
            Home
          </span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
