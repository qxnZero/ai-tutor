"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MigrateCoursesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleMigration = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await fetch("/api/migrate-courses", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to migrate courses");
      }

      setResult(data.message);
      toast.success(data.message);
    } catch (error) {
      console.error("Migration error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Migrate Courses</CardTitle>
          <CardDescription>
            Assign all existing courses without an owner to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is a one-time operation to migrate existing courses to your account.
            Only run this if you need to assign ownership to courses created before user isolation was implemented.
          </p>
          
          <Button 
            onClick={handleMigration} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              "Migrate Courses"
            )}
          </Button>
          
          {result && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
