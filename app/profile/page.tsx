import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Clock,
  Award,
  User as UserIcon,
  Mail,
  Calendar,
} from "lucide-react";
import { Suspense } from "react";

// Loading component for profile sections
function ProfileLoading() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-lg">Loading profile...</span>
    </div>
  );
}

async function ProfileData() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user has Google provider info
  const isGoogleUser = user.provider === "google";

  // Get user stats
  const courseCount = await prisma.course.count({
    where: {
      userId: user.id,
    },
  });

  const bookmarkCount = await prisma.bookmark.count({
    where: {
      userId: user.id,
    },
  });

  const noteCount = await prisma.note.count({
    where: {
      userId: user.id,
    },
  });

  // Get average progress
  const userProgress = await prisma.userProgress.findMany({
    where: {
      userId: user.id,
    },
  });

  const averageProgress =
    userProgress.length > 0
      ? userProgress.reduce((acc, curr) => acc + Number(curr.progress), 0) /
        userProgress.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={session.user.image || user.image || ""}
                  alt={session.user.name || user.name || ""}
                />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {session.user.name || user.name
                    ? (session.user.name || user.name)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {isGoogleUser && (
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <svg
                    className="h-3 w-3 mr-1"
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
                  Google Account
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {session.user.name || user.name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {session.user.email || user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="font-medium">
                    {format(new Date(user.createdAt), "MMMM yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Statistics</CardTitle>
              <CardDescription>
                Your learning journey at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{courseCount}</span>
                  <span className="text-sm text-muted-foreground">Courses</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{noteCount}</span>
                  <span className="text-sm text-muted-foreground">Notes</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <Award className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">
                    {averageProgress.toFixed(0)}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Avg. Completion
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileData />
    </Suspense>
  );
}
