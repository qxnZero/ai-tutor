"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function DebugInfo() {
  const { data: session, status } = useSession();
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchDebugData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/debug");
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error("Error fetching debug data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline">
            {isOpen ? "Hide Debug Info" : "Show Debug Info"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium">Session Status: {status}</h3>
              {session && (
                <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40 text-xs">
                  {JSON.stringify(session, null, 2)}
                </pre>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDebugData}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Fetch API Debug Data"}
            </Button>

            {debugData && (
              <div>
                <h3 className="font-medium">API Debug Data</h3>
                <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-60 text-xs">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <h3 className="font-medium">Environment</h3>
              <p className="text-sm mt-1">
                NODE_ENV: {process.env.NODE_ENV}
                <br />
                NEXT_PUBLIC_VERCEL_URL: {process.env.NEXT_PUBLIC_VERCEL_URL || "Not set"}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
