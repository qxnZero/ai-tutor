"use client";

import { useState } from "react";
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

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"; // Or your default redirect path

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Use NextAuth signIn function for 'credentials' provider
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false, // Handle redirect manually based on result
      });

      if (result?.error) {
        // Error messages returned from 'authorize' function (or default errors)
        toast.error(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
        setIsLoading(false); // Stop loading on error
        return;
      }

      if (result?.ok) {
        toast.success("Signed in successfully!");
        router.push(callbackUrl);
        // router.refresh() might not be needed immediately after push depending on caching/data needs
      } else {
        // Handle unexpected cases where result is ok: false but no error
        toast.error("Sign in failed. Please try again.");
        setIsLoading(false);
      }

      // No need for finally block if you handle setIsLoading(false) in error cases
      // setIsLoading(false) // This would run even on successful redirect start
    } catch (error) {
      // Catch unexpected errors during the signIn process itself
      console.error("Sign in error:", error);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
    // Do not set isLoading to false here if redirect happens, component might unmount
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      // Ensure we have a valid callback URL and force account selection
      await signIn("google", {
        callbackUrl: callbackUrl || "/dashboard",
        prompt: "select_account",
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
      {" "}
      {/* Use min-h-screen */}
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">
              Sign in
            </CardTitle>{" "}
            {/* Center title */}
            <CardDescription className="text-center">
              Enter your email and password to sign in
            </CardDescription>{" "}
            {/* Center description */}
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full"
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
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
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                autoComplete="off"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          autoComplete="new-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {" "}
                {/* Added font-medium */}
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
