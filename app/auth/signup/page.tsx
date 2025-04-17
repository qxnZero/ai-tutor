"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Apply error to the confirmPassword field
  });

function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        // Ensure this endpoint exists
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password, // Send the plain password to the backend for hashing
        }),
      });

      const data = await response.json(); // Always try to parse JSON

      if (!response.ok) {
        // Use message from backend response if available
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      toast.success("Account created successfully! Please sign in.");
      router.push("/auth/signin"); // Redirect to sign-in page
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create account"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Google sign up error:", error);
      toast.error("Failed to sign up with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col items-center mb-6 space-y-2">
          <h1 className="text-3xl font-bold">AI Tutor</h1>
          <p className="text-muted-foreground">Your personalized learning assistant</p>
        </div>
        <Card className="border-none shadow-lg dark:shadow-primary/5 sm:border sm:rounded-xl">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-center text-2xl font-bold">
              Join AI Tutor
            </CardTitle>
            <CardDescription className="text-center">
              Create an account to start your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full rounded-md border-muted-foreground/20 hover:bg-muted/50 transition-colors"
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-5 w-5"
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
              )}
              Sign up with Google
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="rounded-md h-10 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          className="rounded-md h-10 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          className="rounded-md h-10 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          className="rounded-md h-10 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full rounded-md h-10 mt-2 bg-primary hover:bg-primary/90 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="pt-0 pb-6 px-8 flex justify-center">
            <div className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-primary hover:underline transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex min-h-screen w-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading...</span>
          </div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
