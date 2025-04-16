import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

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
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, transactionId } = body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !transactionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get the transaction
    const transaction = await prisma.subscriptionTransaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        subscription: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Update the transaction
    await prisma.subscriptionTransaction.update({
      where: {
        id: transactionId,
      },
      data: {
        status: "captured",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    // Calculate subscription expiry date
    const now = new Date();
    let expiryDate = new Date();
    
    if (transaction.subscription.interval === "monthly") {
      expiryDate.setMonth(now.getMonth() + 1);
    } else if (transaction.subscription.interval === "yearly") {
      expiryDate.setFullYear(now.getFullYear() + 1);
    }

    // Update user's subscription status
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        subscriptionStatus: "premium",
        subscriptionExpiresAt: expiryDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      subscriptionStatus: "premium",
      subscriptionExpiresAt: expiryDate,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
