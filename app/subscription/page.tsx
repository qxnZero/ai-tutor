"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Declare Razorpay as a global variable
declare global {
  interface Window {
    Razorpay: any;
  }
}

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
};

type SubscriptionInfo = {
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  freeCoursesUsed: number;
  plans: SubscriptionPlan[];
};

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/subscription");
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Fetch subscription plans
    if (status === "authenticated") {
      fetchSubscriptionPlans();
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [status, router]);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions");

      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans");
      }

      const data = await response.json();
      setSubscriptionInfo(data);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setProcessingPayment(true);

      // Create order
      const orderResponse = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to create order"
        );
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI Tutor",
        description: "Premium Subscription",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/subscriptions/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                transactionId: orderData.transactionId,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();

            toast.success("Subscription activated successfully!");

            // Refresh subscription info
            fetchSubscriptionPlans();
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#6366F1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            Upgrade Your Learning Experience
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get unlimited access to all courses and features with our premium
            subscription plans.
          </p>
        </div>

        {subscriptionInfo?.subscriptionStatus === "premium" && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-600" />
                You have an active premium subscription
              </CardTitle>
              <CardDescription>
                Your subscription is valid until{" "}
                {subscriptionInfo.subscriptionExpiresAt
                  ? new Date(
                      subscriptionInfo.subscriptionExpiresAt
                    ).toLocaleDateString()
                  : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Enjoy unlimited access to all courses and features. Thank you
                for supporting AI Tutor!
              </p>
            </CardContent>
          </Card>
        )}

        {subscriptionInfo?.subscriptionStatus === "free" && (
          <div className="mb-8">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Your Current Plan: Free</CardTitle>
                <CardDescription>
                  You are currently on the free plan with limited access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                    <p>One full course with unlimited modules</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                    <p>Up to 3 modules for additional courses</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                    <p>Basic AI instructor support</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  {subscriptionInfo.freeCoursesUsed === 0
                    ? "You haven't used your free full course access yet."
                    : "You've already used your free full course access."}
                </p>
              </CardFooter>
            </Card>
          </div>
        )}

        <Tabs defaultValue="monthly" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save 17%)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly" className="space-y-4">
            {subscriptionInfo?.plans
              .filter((plan) => plan.interval === "monthly")
              .map((plan) => (
                <Card key={plan.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        Monthly
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        ₹{(plan.price / 100).toFixed(0)}
                      </span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={
                        processingPayment ||
                        subscriptionInfo.subscriptionStatus === "premium"
                      }
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : subscriptionInfo.subscriptionStatus === "premium" ? (
                        "Current Plan"
                      ) : (
                        "Subscribe Now"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            {subscriptionInfo?.plans
              .filter((plan) => plan.interval === "yearly")
              .map((plan) => (
                <Card
                  key={plan.id}
                  className="flex flex-col h-full border-primary"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge className="ml-2">Best Value</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        ₹{(plan.price / 100).toFixed(0)}
                      </span>
                      <span className="text-muted-foreground ml-1">/year</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={
                        processingPayment ||
                        subscriptionInfo.subscriptionStatus === "premium"
                      }
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : subscriptionInfo.subscriptionStatus === "premium" ? (
                        "Current Plan"
                      ) : (
                        "Subscribe Now"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
