import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "plans":
        return getSubscriptionPlans()
      
      case "features":
        return getFeatureComparison()
      
      case "revenue":
        return getRevenueMetrics()
      
      case "analytics":
        return getMonetizationAnalytics()
      
      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching monetization data:", error)
    return NextResponse.json({ error: "Failed to fetch monetization data" }, { status: 500 })
  }
}

async function getSubscriptionPlans() {
  const plans = [
    {
      id: "FREE",
      name: "Free",
      description: "Perfect for getting started with market analysis",
      price: 0,
      currency: "USD",
      billingCycle: "MONTHLY",
      popular: false,
      features: [
        { name: "Real-time market data", included: true },
        { name: "Basic pulse indicators (2)", included: true },
        { name: "Historical data (7 days)", included: true },
        { name: "Custom alerts (5)", included: true },
        { name: "Market tracking (10)", included: true },
        { name: "AI analysis (10/month)", included: true },
        { name: "API access (1,000 calls)", included: true },
        { name: "Data export", included: false },
        { name: "Priority support", included: false },
        { name: "Custom dashboards (1)", included: true },
        { name: "Advanced analytics", included: false },
        { name: "WebSocket connections (1)", included: true },
      ],
      cta: "Get Started",
      limits: {
        apiCalls: 1000,
        aiAnalysis: 10,
        alerts: 5,
        markets: 10,
        historicalData: "7d",
      }
    },
    {
      id: "PRO",
      name: "Pro",
      description: "Advanced features for serious traders and analysts",
      price: 49,
      currency: "USD",
      billingCycle: "MONTHLY",
      yearlyPrice: 490,
      yearlySavings: 98,
      popular: true,
      features: [
        { name: "Real-time market data", included: true },
        { name: "All pulse indicators (7)", included: true },
        { name: "Historical data (90 days)", included: true },
        { name: "Custom alerts (50)", included: true },
        { name: "Market tracking (100)", included: true },
        { name: "AI analysis (100/month)", included: true },
        { name: "API access (10,000 calls)", included: true },
        { name: "Data export", included: true },
        { name: "Priority support", included: true },
        { name: "Custom dashboards (5)", included: true },
        { name: "Advanced analytics", included: true },
        { name: "WebSocket connections (3)", included: true },
        { name: "Custom alert conditions", included: true },
      ],
      cta: "Start Free Trial",
      trialDays: 14,
      limits: {
        apiCalls: 10000,
        aiAnalysis: 100,
        alerts: 50,
        markets: 100,
        historicalData: "90d",
      }
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise",
      description: "Complete solution for institutions and teams",
      price: 299,
      currency: "USD",
      billingCycle: "MONTHLY",
      yearlyPrice: 2990,
      yearlySavings: 598,
      popular: false,
      features: [
        { name: "Real-time market data", included: true },
        { name: "All pulse indicators (7)", included: true },
        { name: "Unlimited historical data", included: true },
        { name: "Unlimited custom alerts", included: true },
        { name: "Unlimited market tracking", included: true },
        { name: "Unlimited AI analysis", included: true },
        { name: "Unlimited API access", included: true },
        { name: "Data export", included: true },
        { name: "24/7 dedicated support", included: true },
        { name: "Unlimited custom dashboards", included: true },
        { name: "Advanced analytics", included: true },
        { name: "WebSocket connections (10)", included: true },
        { name: "White-label solution", included: true },
        { name: "Custom integrations", included: true },
        { name: "SLA guarantee (99.9%)", included: true },
        { name: "Account manager", included: true },
        { name: "Custom training", included: true },
      ],
      cta: "Contact Sales",
      contactRequired: true,
      limits: {
        apiCalls: "unlimited",
        aiAnalysis: "unlimited",
        alerts: "unlimited",
        markets: "unlimited",
        historicalData: "unlimited",
      }
    }
  ]

  return NextResponse.json({
    plans,
    metadata: {
      yearlyDiscount: 17, // 2 months free on yearly billing
      currency: "USD",
      trialDays: 14,
    }
  })
}

async function getFeatureComparison() {
  const features = [
    {
      category: "Core Features",
      items: [
        { name: "Real-time Data", free: true, pro: true, enterprise: true },
        { name: "Historical Data", free: "7 days", pro: "90 days", enterprise: "Unlimited" },
        { name: "API Access", free: "1,000 calls", pro: "10,000 calls", enterprise: "Unlimited" },
        { name: "Data Export", free: false, pro: true, enterprise: true },
      ]
    },
    {
      category: "Pulse Indicators",
      items: [
        { name: "Sentiment Pulse", free: true, pro: true, enterprise: true },
        { name: "Volatility Pulse", free: true, pro: true, enterprise: true },
        { name: "Liquidity Pulse", free: false, pro: true, enterprise: true },
        { name: "Momentum Pulse", free: false, pro: true, enterprise: true },
        { name: "Correlation Pulse", free: false, pro: true, enterprise: true },
        { name: "Flow Pulse", free: false, pro: true, enterprise: true },
        { name: "Risk Pulse", free: false, pro: true, enterprise: true },
      ]
    },
    {
      category: "AI & Analytics",
      items: [
        { name: "AI Analysis", free: "10/month", pro: "100/month", enterprise: "Unlimited" },
        { name: "Market Predictions", free: false, pro: true, enterprise: true },
        { name: "Advanced Analytics", free: false, pro: true, enterprise: true },
        { name: "Custom Models", free: false, pro: false, enterprise: true },
      ]
    },
    {
      category: "Alerts & Monitoring",
      items: [
        { name: "Custom Alerts", free: "5", pro: "50", enterprise: "Unlimited" },
        { name: "Email Notifications", free: true, pro: true, enterprise: true },
        { name: "SMS Alerts", free: false, pro: true, enterprise: true },
        { name: "Webhook Integration", free: false, pro: true, enterprise: true },
      ]
    },
    {
      category: "Support & SLA",
      items: [
        { name: "Support Response", free: "48h", pro: "24h", enterprise: "1h" },
        { name: "Priority Support", free: false, pro: true, enterprise: true },
        { name: "Dedicated Support", free: false, pro: false, enterprise: true },
        { name: "SLA Guarantee", free: "None", pro: "99%", enterprise: "99.9%" },
      ]
    },
    {
      category: "Technical",
      items: [
        { name: "WebSocket Connections", free: "1", pro: "3", enterprise: "10" },
        { name: "Custom Dashboards", free: "1", pro: "5", enterprise: "Unlimited" },
        { name: "White-label", free: false, pro: false, enterprise: true },
        { name: "Custom Integrations", free: false, pro: false, enterprise: true },
      ]
    }
  ]

  return NextResponse.json({ features })
}

async function getRevenueMetrics() {
  // Mock revenue data - in real implementation, this would query the database
  const metrics = {
    currentMonth: {
      mrr: 15420, // Monthly Recurring Revenue
      arr: 185040, // Annual Recurring Revenue
      newSubscriptions: 45,
      churnedSubscriptions: 8,
      upgradeRevenue: 3200,
      downgradeRevenue: -800,
      netRevenue: 15420,
    },
    growth: {
      mrrGrowth: 12.5, // percentage
      arrGrowth: 15.2,
      userGrowth: 8.7,
      conversionRate: 3.2,
    },
    breakdown: {
      byPlan: {
        FREE: { users: 1240, revenue: 0 },
        PRO: { users: 285, revenue: 13965 },
        ENTERPRISE: { users: 12, revenue: 3455 },
      },
      byBillingCycle: {
        MONTHLY: { revenue: 9850, users: 234 },
        YEARLY: { revenue: 5570, users: 63 },
      },
    },
    projections: {
      nextMonthMrr: 17350,
      nextQuarterArr: 225000,
      yearlyTarget: 250000,
      progressToTarget: 74,
    }
  }

  return NextResponse.json({ metrics })
}

async function getMonetizationAnalytics() {
  // Mock analytics data
  const analytics = {
    userAcquisition: {
      totalUsers: 1537,
      newUsersThisMonth: 156,
      conversionRate: 3.2,
      trialConversionRate: 18.5,
      averageTimeToConversion: 14, // days
    },
    subscriptionMetrics: {
      activeSubscriptions: 297,
      mrr: 15420,
      arpa: 51.91, // Average Revenue Per Account
      ltv: 622.92, // Lifetime Value
      churnRate: 2.7, // monthly
      customerLifetime: 37, // months
    },
    featureUsage: {
      mostUsedFeatures: [
        { feature: "Real-time Data", usage: 98, plan: "ALL" },
        { feature: "AI Analysis", usage: 67, plan: "PRO+" },
        { feature: "Custom Alerts", usage: 45, plan: "PRO+" },
        { feature: "API Access", usage: 34, plan: "PRO+" },
        { feature: "Data Export", usage: 28, plan: "PRO+" },
      ],
      upgradeDrivers: [
        { feature: "Historical Data", upgradeIntent: 78 },
        { feature: "AI Analysis", upgradeIntent: 72 },
        { feature: "API Access", upgradeIntent: 65 },
        { feature: "Custom Alerts", upgradeIntent: 58 },
      ],
    },
    revenueOptimization: {
      pricingTiers: [
        { tier: "$0-49", users: 1240, conversion: 2.1 },
        { tier: "$49-299", users: 285, conversion: 18.5 },
        { tier: "$299+", users: 12, conversion: 5.2 },
      ],
      upsellOpportunities: 156,
      crossSellPotential: 89,
      expansionRevenue: 8900,
    },
    competitivePositioning: {
      marketShare: 2.3,
      pricePosition: "Mid-range",
      valueProposition: "Advanced AI-powered market analysis",
      keyDifferentiators: [
        "Real-time pulse indicators",
        "AI-powered predictions",
        "Comprehensive market coverage",
        "Flexible API access",
      ],
    }
  }

  return NextResponse.json({ analytics })
}