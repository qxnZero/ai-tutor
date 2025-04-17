"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { BookOpen, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SiteHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  if (pathname?.startsWith("/auth")) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-2 z-50 w-full bg-background/80 backdrop-blur-md border-b mb-3">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between">
          {/* Logo - Left End */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-semibold ml-2 text-lg">AI Tutor</span>
            </Link>
          </div>

          {/* Main Navigation - Middle */}
          <nav className="hidden md:flex items-center gap-2">
            <NavItem href="/dashboard" label="Dashboard" active={isActive("/dashboard")} />
            <NavItem href="/courses" label="Courses" active={isActive("/courses")} />
            <NavItem href="/courses?tab=create" label="Create Course" active={pathname === "/courses" && pathname.includes("tab=create")} />
            <NavItem href="/bookmarks" label="Bookmarks" active={isActive("/bookmarks")} />
            <NavItem href="/notes" label="Notes" active={isActive("/notes")} />
            <NavItem href="/subscription" label="Subscription" active={isActive("/subscription")} />
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <ModeToggle />

            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            ) : status === "authenticated" ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback>
                      {session?.user?.name
                        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-2.5 py-1 text-sm font-medium rounded-md transition-colors ${active
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
    >
      {label}
    </Link>
  );
}
