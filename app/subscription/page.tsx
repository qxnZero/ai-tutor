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

  // Feature list component to reduce repetition
  const FeatureList = ({ features }: { features: string[] }) => (
    <ul className="space-y-4 mb-10">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start">
          <Check className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  );

  // Price display component
  const PriceDisplay = ({ price, currency = "₹" }: { price: string | number, currency?: string }) => (
    <div className="flex items-baseline">
      <span className="text-2xl">{currency}</span>
      <span className="text-5xl font-bold">{price}</span>
      {price !== "Free" && <span className="text-2xl">.50</span>}
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden z-0 opacity-20">
        <svg className="absolute top-0 right-0 h-full w-1/2" viewBox="0 0 200 800" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 300 Q 50 250 100 300 Q 150 350 200 300 Q 250 250 300 300 Q 350 350 400 300"
                fill="none" stroke="#10B981" strokeWidth="2"></path>
          <path d="M 0 350 Q 50 300 100 350 Q 150 400 200 350 Q 250 300 300 350 Q 350 400 400 350"
                fill="none" stroke="#10B981" strokeWidth="2"></path>
          <path d="M 0 400 Q 50 350 100 400 Q 150 450 200 400 Q 250 350 300 400 Q 350 450 400 400"
                fill="none" stroke="#10B981" strokeWidth="2"></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {subscriptionInfo?.subscriptionStatus === "premium" ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-6">Premium Membership</h1>
              <p className="text-lg text-muted-foreground">
                Thank you for being a premium member. Enjoy unlimited access to all features.
              </p>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Active Subscription</h3>
                  <p className="text-muted-foreground">
                    Your premium membership is active and in good standing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Subscription Status</p>
                  <p className="font-medium flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Active
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valid Until</p>
                  <p className="font-medium">
                    {subscriptionInfo.subscriptionExpiresAt
                      ? new Date(subscriptionInfo.subscriptionExpiresAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t border-primary/10 pt-6">
                <h4 className="font-medium mb-4">Premium Benefits</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    <span>Unlimited access to all courses</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    <span>Priority AI instructor support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    <span>Advanced course generation features</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    <span>Exclusive premium content</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => router.push('/courses')}
              >
                Browse Courses
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">Choose Your<br />Favorite Package.</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select one of your favorite package and get the facilities.
              </p>
            </div>

            <div className="flex justify-center mb-16">
              <div className="flex items-center gap-4">
                <span
                  className={`${billingInterval === "monthly" ? "text-primary font-medium" : "text-muted-foreground"}`}
                  onClick={() => setBillingInterval("monthly")}
                  role="button"
                >
                  Monthly
                </span>

                <div
                  className="w-12 h-6 bg-muted rounded-full relative cursor-pointer"
                  onClick={() => setBillingInterval(billingInterval === "monthly" ? "yearly" : "monthly")}
                >
                  <div
                    className={`absolute w-5 h-5 rounded-full bg-primary top-0.5 transition-all duration-300 ${billingInterval === "monthly" ? "left-0.5" : "left-6"}`}
                  ></div>
                </div>

                <span
                  className={`${billingInterval === "yearly" ? "text-primary font-medium" : "text-muted-foreground"}`}
                  onClick={() => setBillingInterval("yearly")}
                  role="button"
                >
                  Yearly
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="border border-primary/30 rounded-xl p-8 backdrop-blur-sm hover:border-primary/70 transition-all duration-300">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Basic.</h3>
                  <PriceDisplay price="Free" />
                  <div className="h-px bg-border w-full my-6"></div>
                </div>

                <FeatureList features={freeFeatures} />

                <div className="text-center text-sm text-muted-foreground">
                  No credit card required
                </div>
              </div>

              {/* Monthly/Yearly Plans */}
              {(billingInterval === "monthly" ? monthlyPlans : yearlyPlans).map((plan, index) => {
                const isMiddlePlan = index === 0;

                // Calculate display price with discount for Standard plan
                let displayPrice = (plan.price / 100).toFixed(0);
                if (isMiddlePlan && plan.price > 1000) {
                  displayPrice = Math.floor(parseInt(displayPrice) * 0.7).toString();
                }

                return (
                  <div
                    key={plan.id}
                    className={`border ${isMiddlePlan ? "border-primary/70" : "border-primary/30"} rounded-xl p-8 backdrop-blur-sm ${isMiddlePlan ? "bg-primary/10" : ""} hover:border-primary/70 transition-all duration-300 ${isMiddlePlan ? "relative z-10" : ""}`}
                  >
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">
                        {isMiddlePlan ? "Standard." : "Premium."}
                      </h3>
                      <PriceDisplay price={displayPrice} />
                      <div className="h-px bg-border w-full my-6"></div>
                    </div>

                    <FeatureList features={plan.features} />

                    <Button
                      className={`w-full ${isMiddlePlan ? "bg-primary hover:bg-primary/90" : "border border-primary hover:bg-primary/90 hover:text-background"} transition-all duration-300`}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Get Started"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <p className="text-muted-foreground text-sm">
                All plans include access to our AI instructor and course generation features.
                <br />
                Need help choosing? Contact us for assistance.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
