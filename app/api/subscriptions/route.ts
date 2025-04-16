import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_PLANS, createOrder } from "@/lib/razorpay";

// Get subscription plans
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Get user's current subscription status
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        freeCoursesUsed: true,
      },
    });

    // Get available subscription plans
    const subscriptionPlans = await prisma.subscription.findMany({
      where: {
        isActive: true,
      },
    });

    // If no plans exist in the database, create them
    if (subscriptionPlans.length === 0) {
      await prisma.subscription.createMany({
        data: [
          {
            name: SUBSCRIPTION_PLANS.MONTHLY.name,
            description: SUBSCRIPTION_PLANS.MONTHLY.description,
            price: SUBSCRIPTION_PLANS.MONTHLY.price,
            interval: SUBSCRIPTION_PLANS.MONTHLY.interval,
            features: SUBSCRIPTION_PLANS.MONTHLY.features,
          },
          {
            name: SUBSCRIPTION_PLANS.YEARLY.name,
            description: SUBSCRIPTION_PLANS.YEARLY.description,
            price: SUBSCRIPTION_PLANS.YEARLY.price,
            interval: SUBSCRIPTION_PLANS.YEARLY.interval,
            features: SUBSCRIPTION_PLANS.YEARLY.features,
          },
        ],
      });

      // Fetch the newly created plans
      const newPlans = await prisma.subscription.findMany({
        where: {
          isActive: true,
        },
      });

      return NextResponse.json({
        subscriptionStatus: user?.subscriptionStatus || "free",
        subscriptionExpiresAt: user?.subscriptionExpiresAt || null,
        freeCoursesUsed: user?.freeCoursesUsed || 0,
        plans: newPlans,
      });
    }

    return NextResponse.json({
      subscriptionStatus: user?.subscriptionStatus || "free",
      subscriptionExpiresAt: user?.subscriptionExpiresAt || null,
      freeCoursesUsed: user?.freeCoursesUsed || 0,
      plans: subscriptionPlans,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

// Create a new subscription order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Get the subscription plan
    const plan = await prisma.subscription.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // Create a Razorpay order with a short receipt ID (max 40 chars)
    const receiptId = `sub_${Date.now().toString().slice(-8)}`;

    const order = await createOrder(plan.price, plan.currency, receiptId);

    // Create a transaction record
    const transaction = await prisma.subscriptionTransaction.create({
      data: {
        userId: session.user.id,
        subscriptionId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        status: "created",
        razorpayOrderId: order.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      transactionId: transaction.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating subscription order:", error);

    // Provide more specific error messages based on the error type
    if (error.error && error.error.description) {
      return NextResponse.json(
        {
          error: "Failed to create subscription order",
          details: error.error.description,
          code: error.error.code || "UNKNOWN_ERROR",
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create subscription order" },
      { status: 500 }
    );
  }
}
