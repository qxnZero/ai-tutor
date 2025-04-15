import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2"; // Import argon2

// Disable certificate validation in development mode
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          // Force re-consent to ensure Google account selection
          approval_prompt: "force",
        },
      },
      // Use profile callback to ensure we get all user data
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // Ensure user exists and the password field contains the Argon2 hash
        if (!user || !user.password) {
          return null;
        }

        let isPasswordValid = false;
        try {
          // Verify the entered password against the stored Argon2 hash
          // argon2.verify takes the hash first, then the plain password
          isPasswordValid = await argon2.verify(
            user.password,
            credentials.password
          );
        } catch (error) {
          // Log verification errors (e.g., malformed hash) but don't expose details
          console.error("Argon2 verification error:", error);
          return null; // Treat verification errors as invalid password
        }

        if (!isPasswordValid) {
          return null;
        }

        // Return user object without the password hash
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
      }

      // If using Google provider and we have profile data
      if (account?.provider === "google" && profile) {
        // Ensure we're using the most up-to-date profile info
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
      }

      return token;
    },
    async signIn({ user, account, profile }) {
      // Always allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      // Handle successful sign-in
      console.log("User signed in:", user.email);
    },
    async signOut() {
      // Clear session data on sign out
      console.log("User signed out");
    },
    async session() {
      // Session is active
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
