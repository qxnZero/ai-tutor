"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Home,
  BookOpen,
  User,
  LogOut,
  BookMarked,
  FileText,
  LayoutDashboard,
  Bell,
  Settings,
  Crown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Animation variants
const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
};

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

export function SiteHeader() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const { theme } = useTheme();

  const isDarkTheme = theme === "dark";

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 pb-4 flex justify-center items-center">
      <div className="w-[95%] max-w-5xl rounded-xl border border-border/30 bg-background/60 backdrop-blur-md shadow-md overflow-hidden">
        {/* Subtle gradient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-blue-500/5 to-purple-500/5 opacity-40 pointer-events-none"></div>
        <div className="container flex h-14 items-center justify-between relative z-10 px-4">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center justify-center p-1.5 rounded-lg"
            >
              <BookOpen className="h-6 w-6" />
              <span className="font-bold ml-2">AI Tutor</span>
            </Link>
          </div>
          <div className="flex items-center justify-end space-x-3">
            <motion.nav
              className="p-1 rounded-xl bg-background/40 backdrop-blur-sm border border-border/20 shadow-sm relative overflow-hidden flex items-center space-x-1"
              initial="initial"
              whileHover="hover"
            >
              <motion.div
                className="absolute -inset-2 bg-gradient-radial from-transparent via-primary/10 to-transparent rounded-3xl z-0 pointer-events-none"
                variants={navGlowVariants}
              />

              {/* Home */}
              <motion.div
                className="block rounded-xl overflow-visible group relative"
                style={{ perspective: "600px" }}
                whileHover="hover"
                initial="initial"
              >
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none"
                  variants={glowVariants}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
                    opacity: pathname === "/" ? 0.5 : 0,
                    borderRadius: "16px",
                  }}
                />
                <motion.div
                  variants={itemVariants}
                  transition={sharedTransition}
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center bottom",
                  }}
                >
                  <Link
                    href="/"
                    className={`flex items-center justify-center min-w-[100px] px-3 py-1.5 relative z-10 ${
                      pathname === "/"
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-background/40 border-border/20 text-muted-foreground group-hover:text-foreground"
                    } backdrop-blur-sm border shadow-sm transition-colors rounded-lg`}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        pathname === "/"
                          ? "text-primary"
                          : "group-hover:text-primary text-foreground"
                      }`}
                    >
                      <Home className="h-4 w-4 mr-2" />
                    </span>
                    <span>Home</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={backVariants}
                  transition={sharedTransition}
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center top",
                    position: "absolute",
                    inset: 0,
                  }}
                >
                  <Link
                    href="/"
                    className={`flex items-center justify-center min-w-[100px] px-3 py-1.5 relative z-10 ${
                      pathname === "/"
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-background/40 border-border/20 text-muted-foreground group-hover:text-foreground"
                    } backdrop-blur-sm border shadow-sm transition-colors rounded-lg`}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        pathname === "/"
                          ? "text-primary"
                          : "group-hover:text-primary text-foreground"
                      }`}
                    >
                      <Home className="h-4 w-4 mr-2" />
                    </span>
                    <span>Home</span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Courses */}
              <motion.div
                className="block rounded-xl overflow-visible group relative"
                style={{ perspective: "600px" }}
                whileHover="hover"
                initial="initial"
              >
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none"
                  variants={glowVariants}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
                    opacity: pathname === "/courses" ? 0.5 : 0,
                    borderRadius: "16px",
                  }}
                />
                <motion.div
                  variants={itemVariants}
                  transition={sharedTransition}
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center bottom",
                  }}
                >
                  <Link
                    href="/courses"
                    className={`flex items-center justify-center min-w-[100px] px-3 py-1.5 relative z-10 ${
                      pathname === "/courses"
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                        : "bg-background/40 border-border/20 text-muted-foreground group-hover:text-foreground"
                    } backdrop-blur-sm border shadow-sm transition-colors rounded-lg`}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        pathname === "/courses"
                          ? "text-orange-500"
                          : "group-hover:text-orange-500 text-foreground"
                      }`}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                    </span>
                    <span>Courses</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={backVariants}
                  transition={sharedTransition}
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center top",
                    position: "absolute",
                    inset: 0,
                  }}
                >
                  <Link
                    href="/courses"
                    className={`flex items-center justify-center min-w-[100px] px-3 py-1.5 relative z-10 ${
                      pathname === "/courses"
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                        : "bg-background/40 border-border/20 text-muted-foreground group-hover:text-foreground"
                    } backdrop-blur-sm border shadow-sm transition-colors rounded-lg`}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        pathname === "/courses"
                          ? "text-orange-500"
                          : "group-hover:text-orange-500 text-foreground"
                      }`}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                    </span>
                    <span>Courses</span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Dashboard - Only for authenticated users */}
              {status === "authenticated" ? (
                <motion.div
                  className="block rounded-xl overflow-visible group relative"
                  style={{ perspective: "600px" }}
                  whileHover="hover"
                  initial="initial"
                >
                  <motion.div
                    className="absolute inset-0 z-0 pointer-events-none"
                    variants={glowVariants}
                    style={{
                      background:
                        "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
                      opacity: pathname === "/dashboard" ? 0.5 : 0,
                      borderRadius: "16px",
                    }}
                  />
                  <motion.div
                    variants={itemVariants}
                    transition={sharedTransition}
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: "center bottom",
                    }}
                  >
                    <Link
                      href="/dashboard"
                      className={`flex items-center justify-center min-w-[100px] px-3 py-1.5 relative z-10 ${
                        pathname === "/dashboard"
                          ? "bg-green-500/10 border-green-500/30 text-green-500"
                          : "bg-background/40 border-border/20 text-muted-foreground group-hover:text-foreground"
                      } backdrop-blur-sm border shadow-sm transition-colors rounded-lg`}
                    >
                      <span
                        className={`transition-colors duration-300 ${
                          pathname === "/dashboard"
                            ? "text-green-500"
                            : "group-hover:text-green-500 text-foreground"
                        }`}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                      </span>
                      <span>Dashboard</span>
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={backVariants}
                    transition={sharedTransition}
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: "center top",
                      position: "absolute",
                      inset: 0,
                    }}
                  >
                    <Link
                      href="/dashboard"
                      className={`flex items-center justify-center min-w-[100px] px-3 py-1.5 relative z-10 ${
                        pathname === "/dashboard"
                          ? "bg-green-500/10 border-green-500/30 text-green-500"
                          : "bg-background/40 border-border/20 text-muted-foreground group-hover:text-foreground"
                      } backdrop-blur-sm border shadow-sm transition-colors rounded-lg`}
                    >
                      <span
                        className={`transition-colors duration-300 ${
                          pathname === "/dashboard"
                            ? "text-green-500"
                            : "group-hover:text-green-500 text-foreground"
                        }`}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                      </span>
                      <span>Dashboard</span>
                    </Link>
                  </motion.div>
                </motion.div>
              ) : null}
            </motion.nav>
            <ModeToggle />
            {isLoading ? (
              <Button
                size="sm"
                variant="ghost"
                className="w-20 h-9 opacity-50"
                disabled
              >
                <span className="animate-pulse">Loading...</span>
              </Button>
            ) : status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 rounded-full bg-background/40 backdrop-blur-sm border border-border/20 shadow-sm overflow-hidden"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || ""}
                      />
                      <AvatarFallback>
                        {session?.user?.name
                          ? session.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {session?.user?.name || session?.user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/bookmarks"
                      className="flex items-center cursor-pointer"
                    >
                      <BookMarked className="mr-2 h-4 w-4" />
                      Bookmarks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/notes"
                      className="flex items-center cursor-pointer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Notes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/subscription"
                      className="flex items-center cursor-pointer"
                    >
                      <Crown className="mr-2 h-4 w-4 text-amber-500" />
                      Subscription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      // Clear any stored credentials
                      document.cookie.split(";").forEach((c) => {
                        document.cookie = c
                          .replace(/^ +/, "")
                          .replace(
                            /=.*/,
                            "=;expires=" + new Date().toUTCString() + ";path=/"
                          );
                      });
                      // Sign out and redirect
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="bg-background/40 backdrop-blur-sm border border-border/20 shadow-sm hover:bg-background/60"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <svg
                    className="h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Sign in
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
