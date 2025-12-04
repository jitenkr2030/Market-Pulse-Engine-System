import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const paymentSchema = z.object({
  userId: z.string(),
  plan: z.enum(["PRO", "ENTERPRISE"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  paymentMethod: z.object({
    type: z.enum(["card", "paypal", "bank_transfer"]),
    token: z.string().optional(),
    email: z.string().email().optional(),
  }),
})

const invoiceSchema = z.object({
  userId: z.string(),
  items: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    currency: z.string().default("USD"),
  })),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        usage: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const billingInfo = await getBillingInfo(userId)
    const paymentMethods = await getPaymentMethods(userId)
    const invoices = await getInvoices(userId)

    return NextResponse.json({
      billing: billingInfo,
      paymentMethods,
      invoices,
      usage: user.usage,
    })
  } catch (error) {
    console.error("Error fetching billing info:", error)
    return NextResponse.json({ error: "Failed to fetch billing info" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "create_payment":
        return handlePaymentCreation(body)
      
      case "create_invoice":
        return handleInvoiceCreation(body)
      
      case "update_payment_method":
        return handlePaymentMethodUpdate(body)
      
      case "process_refund":
        return handleRefund(body)
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in billing operation:", error)
    return NextResponse.json({ error: "Billing operation failed" }, { status: 500 })
  }
}

async function handlePaymentCreation(data: any) {
  const validatedData = paymentSchema.parse(data)
  
  const pricing = getPricing(validatedData.plan, validatedData.billingCycle)
  
  const paymentIntent = await createPaymentIntent({
    amount: pricing.amount,
    currency: pricing.currency,
    userId: validatedData.userId,
    plan: validatedData.plan,
    billingCycle: validatedData.billingCycle,
    paymentMethod: validatedData.paymentMethod,
  })

  return NextResponse.json({
    success: true,
    paymentIntent,
    message: "Payment intent created successfully",
  })
}

async function handleInvoiceCreation(data: any) {
  const validatedData = invoiceSchema.parse(data)
  
  const invoice = await createInvoice({
    userId: validatedData.userId,
    items: validatedData.items,
  })

  return NextResponse.json({
    success: true,
    invoice,
    message: "Invoice created successfully",
  })
}

async function handlePaymentMethodUpdate(data: any) {
  const { userId, paymentMethod } = data
  
  const updatedMethod = await updatePaymentMethod(userId, paymentMethod)
  
  return NextResponse.json({
    success: true,
    paymentMethod: updatedMethod,
    message: "Payment method updated successfully",
  })
}

async function handleRefund(data: any) {
  const { paymentId, amount, reason } = data
  
  const refund = await processRefund(paymentId, amount, reason)
  
  return NextResponse.json({
    success: true,
    refund,
    message: "Refund processed successfully",
  })
}

async function getBillingInfo(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return {
      plan: "FREE",
      status: "ACTIVE",
      nextBillingDate: null,
      amount: 0,
      currency: "USD",
    }
  }

  return {
    plan: subscription.plan,
    status: subscription.status,
    nextBillingDate: subscription.endDate,
    amount: subscription.amount,
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    autoRenew: subscription.autoRenew,
  }
}

async function getPaymentMethods(userId: string) {
  return [
    {
      id: "pm_123456",
      type: "card",
      last4: "4242",
      brand: "visa",
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
    },
  ]
}

async function getInvoices(userId: string) {
  return [
    {
      id: "inv_123456",
      amount: 49.00,
      currency: "USD",
      status: "paid",
      created: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      pdfUrl: "/api/billing/invoices/inv_123456/pdf",
    },
  ]
}

function getPricing(plan: string, billingCycle: string) {
  const pricing = {
    PRO: {
      MONTHLY: { amount: 49, currency: "USD" },
      YEARLY: { amount: 490, currency: "USD" },
    },
    ENTERPRISE: {
      MONTHLY: { amount: 299, currency: "USD" },
      YEARLY: { amount: 2990, currency: "USD" },
    },
  }

  return pricing[plan as keyof typeof pricing]?.[billingCycle as keyof typeof pricing.PRO] || { amount: 0, currency: "USD" }
}

async function createPaymentIntent(paymentData: any) {
  return {
    id: `pi_${Date.now()}`,
    amount: paymentData.amount * 100, // Convert to cents
    currency: paymentData.currency,
    clientSecret: `pi_${Date.now()}_secret_${Date.now()}`,
    status: "requires_payment_method",
    metadata: {
      userId: paymentData.userId,
      plan: paymentData.plan,
      billingCycle: paymentData.billingCycle,
    },
  }
}

async function createInvoice(invoiceData: any) {
  const totalAmount = invoiceData.items.reduce((sum: number, item: any) => sum + item.amount, 0)
  
  return {
    id: `inv_${Date.now()}`,
    userId: invoiceData.userId,
    items: invoiceData.items,
    totalAmount,
    currency: "USD",
    status: "draft",
    created: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    pdfUrl: `/api/billing/invoices/inv_${Date.now()}/pdf`,
  }
}

async function updatePaymentMethod(userId: string, paymentMethod: any) {
  return {
    id: `pm_${Date.now()}`,
    type: paymentMethod.type,
    last4: paymentMethod.last4 || "4242",
    brand: paymentMethod.brand || "visa",
    expMonth: paymentMethod.expMonth || 12,
    expYear: paymentMethod.expYear || 2025,
    isDefault: true,
  }
}

async function processRefund(paymentId: string, amount?: number, reason?: string) {
  return {
    id: `ref_${Date.now()}`,
    paymentId,
    amount: amount || 0,
    currency: "USD",
    status: "processed",
    reason: reason || "Customer request",
    created: new Date(),
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const body = await request.json()
    const { action } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    switch (action) {
      case "cancel_subscription":
        return handleSubscriptionCancellation(userId)
      
      case "reactivate_subscription":
        return handleSubscriptionReactivation(userId)
      
      case "update_billing_cycle":
        return handleBillingCycleUpdate(userId, body.billingCycle)
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating billing:", error)
    return NextResponse.json({ error: "Failed to update billing" }, { status: 500 })
  }
}

async function handleSubscriptionCancellation(userId: string) {
  const subscription = await db.subscription.update({
    where: { userId },
    data: {
      status: "CANCELLED",
      autoRenew: false,
    },
  })

  return NextResponse.json({
    success: true,
    subscription,
    message: "Subscription cancelled successfully",
  })
}

async function handleSubscriptionReactivation(userId: string) {
  const subscription = await db.subscription.update({
    where: { userId },
    data: {
      status: "ACTIVE",
      autoRenew: true,
      endDate: getEndDate("MONTHLY"),
    },
  })

  return NextResponse.json({
    success: true,
    subscription,
    message: "Subscription reactivated successfully",
  })
}

async function handleBillingCycleUpdate(userId: string, billingCycle: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
  }

  const pricing = getPricing(subscription.plan, billingCycle)
  
  const updatedSubscription = await db.subscription.update({
    where: { userId },
    data: {
      billingCycle,
      amount: pricing.amount,
      endDate: getEndDate(billingCycle),
    },
  })

  return NextResponse.json({
    success: true,
    subscription: updatedSubscription,
    message: `Billing cycle updated to ${billingCycle}`,
  })
}

function getEndDate(billingCycle: string) {
  const endDate = new Date()
  if (billingCycle === "MONTHLY") {
    endDate.setMonth(endDate.getMonth() + 1)
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1)
  }
  return endDate
}