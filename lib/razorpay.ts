import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_ID!,
});

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: "monthly",
    name: "Premium Monthly",
    description: "Unlimited access to all courses and features",
    price: 49900, // ₹499 (in paise)
    interval: "monthly",
    features: [
      "Unlimited course access",
      "Unlimited module access",
      "AI instructor for all courses",
      "Download course materials",
      "Priority support",
    ],
  },
  YEARLY: {
    id: "yearly",
    name: "Premium Yearly",
    description:
      "Unlimited access to all courses and features with 2 months free",
    price: 499900, // ₹4,999 (in paise)
    interval: "yearly",
    features: [
      "All monthly features",
      "2 months free (save ₹999)",
      "Early access to new features",
    ],
  },
};

// Create a Razorpay order
export async function createOrder(
  amount: number,
  currency: string = "INR",
  receipt: string
) {
  try {
    // Ensure receipt is no more than 40 characters (Razorpay requirement)
    const truncatedReceipt = receipt.substring(0, 40);

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: truncatedReceipt,
    });
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_ID!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

// Create a Razorpay customer
export async function createCustomer(name: string, email: string) {
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      fail_existing: 0,
    });
    return customer;
  } catch (error) {
    console.error("Error creating Razorpay customer:", error);
    throw error;
  }
}

// Create a Razorpay subscription
export async function createSubscription(
  planId: string,
  customerId: string,
  totalCount: number = 12
) {
  try {
    // Note: This is a simplified version - in a real implementation,
    // you would need to use the correct Razorpay API parameters
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      // Using any to bypass TypeScript checking for this example
      // In production, use the correct types from Razorpay
      customer_id: customerId as any,
      total_count: totalCount as any,
    });
    return subscription;
  } catch (error) {
    console.error("Error creating Razorpay subscription:", error);
    throw error;
  }
}

// Cancel a Razorpay subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error cancelling Razorpay subscription:", error);
    throw error;
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error fetching Razorpay subscription:", error);
    throw error;
  }
}

// Check if a user has access to a full course
export function hasFullCourseAccess(user: any, courseId: string) {
  // Premium users have access to all courses
  if (user.subscriptionStatus === "premium") {
    return true;
  }

  // Free users can access one full course
  if (user.subscriptionStatus === "free" && user.freeCoursesUsed === 0) {
    return true;
  }

  return false;
}

// Check if a user has access to a specific module
export function hasModuleAccess(
  user: any,
  courseId: string, // courseId is used for future implementation
  moduleOrder: number
) {
  // Premium users have access to all modules
  if (user.subscriptionStatus === "premium") {
    return true;
  }

  // Free users can access up to 3 modules per course (except their first course)
  if (user.subscriptionStatus === "free") {
    // If this is their first course, they can access all modules
    if (user.freeCoursesUsed === 0) {
      return true;
    }

    // Otherwise, they can only access the first 3 modules
    return moduleOrder < 3;
  }

  return false;
}
