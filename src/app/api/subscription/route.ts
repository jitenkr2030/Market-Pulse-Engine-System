import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const subscriptionSchema = z.object({
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
  paymentMethod: z.string().optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
})

const featureAccessSchema = z.object({
  feature: z.string(),
  accessLevel: z.enum(["FREE", "PRO", "ENTERPRISE"]),
  limits: z.object({
    apiCalls: z.number().optional(),
    markets: z.number().optional(),
    alerts: z.number().optional(),
    historicalData: z.string().optional(),
    aiAnalysis: z.number().optional(),
  }),
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

    const subscriptionStatus = await getSubscriptionStatus(user)
    const featureAccess = getFeatureAccess(user.subscription?.plan || "FREE")
    const usageStats = await getUsageStats(userId)

    return NextResponse.json({
      subscription: subscriptionStatus,
      features: featureAccess,
      usage: usageStats,
      billing: {
        nextBillingDate: user.subscription?.endDate,
        amount: user.subscription?.amount,
        currency: user.subscription?.currency || "USD",
      },
    })
  } catch (error) {
    console.error("Error fetching subscription info:", error)
    return NextResponse.json({ error: "Failed to fetch subscription info" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...subscriptionData } = subscriptionSchema.parse(body)

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const pricing = getPricing(subscriptionData.plan, subscriptionData.billingCycle || "MONTHLY")
    
    const subscription = await db.subscription.create({
      data: {
        userId,
        plan: subscriptionData.plan,
        status: "ACTIVE",
        amount: pricing.amount,
        currency: pricing.currency,
        billingCycle: subscriptionData.billingCycle || "MONTHLY",
        startDate: new Date(),
        endDate: getEndDate(subscriptionData.billingCycle || "MONTHLY"),
        features: JSON.stringify(getFeatureAccess(subscriptionData.plan)),
      },
    })

    await createUsageRecord(userId)

    return NextResponse.json({
      success: true,
      subscription,
      pricing,
      message: `Successfully subscribed to ${subscriptionData.plan} plan`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const body = await request.json()
    const { action, plan } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    switch (action) {
      case "upgrade":
      case "downgrade":
        return handlePlanChange(userId, plan, action)
      
      case "cancel":
        return handleCancellation(userId)
      
      case "reactivate":
        return handleReactivation(userId)
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
  }
}

async function getSubscriptionStatus(user: any) {
  if (!user.subscription) {
    return {
      plan: "FREE",
      status: "ACTIVE",
      isActive: true,
      trialUsed: false,
    }
  }

  const isActive = user.subscription.status === "ACTIVE" && 
                   new Date() < new Date(user.subscription.endDate)

  return {
    plan: user.subscription.plan,
    status: user.subscription.status,
    isActive,
    trialUsed: user.subscription.trialUsed || false,
    startDate: user.subscription.startDate,
    endDate: user.subscription.endDate,
    autoRenew: user.subscription.autoRenew !== false,
  }
}

function getFeatureAccess(plan: string) {
  const features = {
    FREE: {
      realTimeData: true,
      basicPulses: ["sentiment", "volatility"],
      historicalData: "7d",
      alerts: 5,
      markets: 10,
      aiAnalysis: 10,
      apiCalls: 1000,
      exportData: false,
      prioritySupport: false,
      customDashboards: 1,
      websocketConnections: 1,
    },
    PRO: {
      realTimeData: true,
      basicPulses: ["sentiment", "volatility", "liquidity", "momentum"],
      advancedPulses: ["correlation", "flow", "risk"],
      historicalData: "90d",
      alerts: 50,
      markets: 100,
      aiAnalysis: 100,
      apiCalls: 10000,
      exportData: true,
      prioritySupport: true,
      customDashboards: 5,
      websocketConnections: 3,
      advancedAnalytics: true,
      customAlerts: true,
    },
    ENTERPRISE: {
      realTimeData: true,
      basicPulses: ["sentiment", "volatility", "liquidity", "momentum"],
      advancedPulses: ["correlation", "flow", "risk"],
      historicalData: "unlimited",
      alerts: "unlimited",
      markets: "unlimited",
      aiAnalysis: "unlimited",
      apiCalls: "unlimited",
      exportData: true,
      prioritySupport: true,
      customDashboards: "unlimited",
      websocketConnections: 10,
      advancedAnalytics: true,
      customAlerts: true,
      whiteLabel: true,
      apiAccess: true,
      dedicatedSupport: true,
      customIntegrations: true,
      sla: "99.9%",
    },
  }

  return features[plan as keyof typeof features] || features.FREE
}

function getPricing(plan: string, billingCycle: string) {
  const pricing = {
    FREE: { amount: 0, currency: "USD" },
    PRO: {
      MONTHLY: { amount: 49, currency: "USD" },
      YEARLY: { amount: 490, currency: "USD" }, // 2 months free
    },
    ENTERPRISE: {
      MONTHLY: { amount: 299, currency: "USD" },
      YEARLY: { amount: 2990, currency: "USD" }, // 2 months free
    },
  }

  return pricing[plan as keyof typeof pricing]?.[billingCycle as keyof typeof pricing.PRO] || pricing.FREE
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

async function createUsageRecord(userId: string) {
  return await db.usage.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      apiCalls: 0,
      aiAnalysis: 0,
      alerts: 0,
      dataExport: 0,
      period: "MONTHLY",
      resetDate: getEndDate("MONTHLY"),
    },
  })
}

async function getUsageStats(userId: string) {
  const usage = await db.usage.findUnique({
    where: { userId },
  })

  return usage || {
    apiCalls: 0,
    aiAnalysis: 0,
    alerts: 0,
    dataExport: 0,
    period: "MONTHLY",
    resetDate: getEndDate("MONTHLY"),
  }
}

async function handlePlanChange(userId: string, newPlan: string, action: string) {
  const pricing = getPricing(newPlan, "MONTHLY")
  
  const subscription = await db.subscription.update({
    where: { userId },
    data: {
      plan: newPlan,
      amount: pricing.amount,
      status: "ACTIVE",
      endDate: getEndDate("MONTHLY"),
      features: JSON.stringify(getFeatureAccess(newPlan)),
    },
  })

  return NextResponse.json({
    success: true,
    subscription,
    message: `Successfully ${action}d to ${newPlan} plan`,
  })
}

async function handleCancellation(userId: string) {
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

async function handleReactivation(userId: string) {
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