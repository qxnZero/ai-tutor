"use client";

import { ReactNode } from "react";
import SubscriptionGate from "./subscription-gate";

interface SubscriptionGateWrapperProps {
  children: ReactNode;
  courseId: string;
  moduleId?: string;
  moduleName?: string;
}

export default function SubscriptionGateWrapper({
  children,
  courseId,
  moduleId,
  moduleName,
}: SubscriptionGateWrapperProps) {
  return (
    <SubscriptionGate
      courseId={courseId}
      moduleId={moduleId}
      moduleName={moduleName}
    >
      {children}
    </SubscriptionGate>
  );
}
