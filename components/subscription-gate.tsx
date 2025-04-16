"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SubscriptionGateProps {
  children: ReactNode;
  courseId: string;
  moduleId?: string;
  moduleName?: string;
}

export default function SubscriptionGate({
  children,
  courseId,
  moduleId,
  moduleName,
}: SubscriptionGateProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [moduleOrder, setModuleOrder] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      checkAccess();
    } else if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [status, courseId, moduleId, router]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      
      const url = new URL("/api/courses/access", window.location.origin);
      url.searchParams.append("courseId", courseId);
      if (moduleId) {
        url.searchParams.append("moduleId", moduleId);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to check access");
      }
      
      const data = await response.json();
      setHasAccess(data.hasAccess);
      setSubscriptionStatus(data.subscriptionStatus);
      if (data.moduleOrder !== undefined) {
        setModuleOrder(data.moduleOrder);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <CardTitle className="text-center text-xl">
              {moduleId
                ? `This module is locked`
                : `Full course access is locked`}
            </CardTitle>
            <CardDescription className="text-center">
              {moduleId && moduleOrder !== null && moduleOrder >= 3
                ? `Free users can only access the first 3 modules of additional courses.`
                : `You've already used your free course access.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="mb-4">
                Upgrade to premium to unlock unlimited access to all courses and modules.
              </p>
              {moduleId && moduleName && (
                <p className="text-sm text-muted-foreground">
                  Module: {moduleName}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/subscription")}>
              View Subscription Plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
