"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
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

            await verifyResponse.json();

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

  // Filter plans based on the selected billing interval
  const monthlyPlans = subscriptionInfo?.plans.filter(
    (plan) => plan.interval === "monthly"
  ) || [];

  const yearlyPlans = subscriptionInfo?.plans.filter(
    (plan) => plan.interval === "yearly"
  ) || [];

  // Get the free plan features
  const freeFeatures = [
    "One full course with unlimited modules",
    "Up to 3 modules for additional courses",
    "Basic AI instructor support"
  ];

  return (
    <div className="relative bg-black text-white min-h-screen">
      {/* Background decorative elements - subtle wave pattern */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-20">
        <svg className="absolute top-0 right-0 h-full w-1/2" viewBox="0 0 200 800" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 300 Q 50 250 100 300 Q 150 350 200 300 Q 250 250 300 300 Q 350 350 400 300"
                fill="none" stroke="#10B981" strokeWidth="2" className="path"></path>
          <path d="M 0 350 Q 50 300 100 350 Q 150 400 200 350 Q 250 300 300 350 Q 350 400 400 350"
                fill="none" stroke="#10B981" strokeWidth="2" className="path"></path>
          <path d="M 0 400 Q 50 350 100 400 Q 150 450 200 400 Q 250 350 300 400 Q 350 450 400 400"
                fill="none" stroke="#10B981" strokeWidth="2" className="path"></path>
        </svg>
      </div>

      {/* Active subscription notification */}
      {subscriptionInfo?.subscriptionStatus === "premium" && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-400" />
              <div>
                <h3 className="font-medium">You have an active premium subscription</h3>
                <p className="text-sm text-green-400">
                  Valid until {subscriptionInfo.subscriptionExpiresAt
                    ? new Date(subscriptionInfo.subscriptionExpiresAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Choose Your<br />Favorite Package.</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Select one of your favorite package and get the facilities.
          </p>
        </div>

        {/* Billing interval toggle */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-4">
            <span
              className={`${billingInterval === "monthly" ? "text-green-400 font-medium" : "text-gray-400"}`}
              onClick={() => setBillingInterval("monthly")}
              role="button"
            >
              Monthly
            </span>

            <div
              className="w-12 h-6 bg-green-900/30 rounded-full relative cursor-pointer"
              onClick={() => setBillingInterval(billingInterval === "monthly" ? "yearly" : "monthly")}
            >
              <div
                className={`absolute w-5 h-5 rounded-full bg-green-400 top-0.5 transition-all duration-300 ${billingInterval === "monthly" ? "left-0.5" : "left-6.5"}`}
              ></div>
            </div>

            <span
              className={`${billingInterval === "yearly" ? "text-green-400 font-medium" : "text-gray-400"}`}
              onClick={() => setBillingInterval("yearly")}
              role="button"
            >
              Yearly
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="border border-green-900/50 rounded-xl p-8 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Basic.</h3>
              <div className="flex items-baseline">
                <span className="text-2xl">$</span>
                <span className="text-5xl font-bold">Free</span>
              </div>
              <div className="h-px bg-green-900/50 w-full my-6"></div>
            </div>

            <ul className="space-y-4 mb-10">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition-all duration-300"
              onClick={() => router.push('/courses')}
            >
              Start Free Trial
            </Button>
          </div>

          {/* Monthly/Yearly Plans */}
          {(billingInterval === "monthly" ? monthlyPlans : yearlyPlans).map((plan, index) => {
            const isMiddlePlan = index === 0;

            // Calculate display price
            const displayPrice = (plan.price / 100).toFixed(0);
            const wholePart = displayPrice;
            const decimalPart = "50";

            return (
              <div
                key={plan.id}
                className={`border ${isMiddlePlan ? "border-green-500/70" : "border-green-900/50"} rounded-xl p-8 backdrop-blur-sm ${isMiddlePlan ? "bg-green-900/20" : ""} hover:border-green-500/50 transition-all duration-300 ${isMiddlePlan ? "relative z-10" : ""}`}
              >
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    {isMiddlePlan ? "Standard." : "Premium."}
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl">₹</span>
                    <span className="text-5xl font-bold">{wholePart}</span>
                    <span className="text-2xl">.{decimalPart}</span>
                  </div>
                  <div className="h-px bg-green-900/50 w-full my-6"></div>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${isMiddlePlan ? "bg-green-500 hover:bg-green-600 text-black" : "border border-green-500 text-green-400 hover:bg-green-500 hover:text-black"} transition-all duration-300`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processingPayment || subscriptionInfo?.subscriptionStatus === "premium"}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : subscriptionInfo?.subscriptionStatus === "premium" ? (
                    "Current Plan"
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Additional information */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            All plans include access to our AI instructor and course generation features.
            <br />
            Need help choosing? Contact us for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
