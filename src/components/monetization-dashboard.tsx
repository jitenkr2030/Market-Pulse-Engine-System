"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Crown, 
  Star, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3, 
  PieChart,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Zap,
  Database,
  Shield,
  Headphones,
  Settings,
  Mail,
  Phone,
  Globe
} from "lucide-react"

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billingCycle: string
  yearlyPrice?: number
  yearlySavings?: number
  popular: boolean
  features: Array<{
    name: string
    included: boolean
  }>
  cta: string
  trialDays?: number
  contactRequired?: boolean
}

interface MonetizationMetrics {
  currentMonth: {
    mrr: number
    arr: number
    newSubscriptions: number
    churnedSubscriptions: number
    upgradeRevenue: number
    downgradeRevenue: number
    netRevenue: number
  }
  growth: {
    mrrGrowth: number
    arrGrowth: number
    userGrowth: number
    conversionRate: number
  }
  breakdown: {
    byPlan: Record<string, { users: number; revenue: number }>
    byBillingCycle: Record<string, { revenue: number; users: number }>
  }
  projections: {
    nextMonthMrr: number
    nextQuarterArr: number
    yearlyTarget: number
    progressToTarget: number
  }
}

export default function MonetizationDashboard() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [metrics, setMetrics] = useState<MonetizationMetrics | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("PRO")
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY")

  useEffect(() => {
    fetchMonetizationData()
  }, [])

  const fetchMonetizationData = async () => {
    try {
      const [plansResponse, metricsResponse] = await Promise.all([
        fetch("/api/monetization?type=plans"),
        fetch("/api/monetization?type=revenue")
      ])

      const plansData = await plansResponse.json()
      const metricsData = await metricsResponse.json()

      setPlans(plansData.plans)
      setMetrics(metricsData.metrics)
    } catch (error) {
      console.error("Error fetching monetization data:", error)
    }
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const handleSubscribe = (planId: string) => {
    // Handle subscription logic
    console.log(`Subscribing to ${planId} plan`)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Monetization Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive subscription management and revenue analytics for the Market Pulse Engine platform
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(metrics.currentMonth.mrr)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+{metrics.growth.mrrGrowth}%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(metrics.currentMonth.arr)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+{metrics.growth.arrGrowth}%</span> growth
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(Object.values(metrics.breakdown.byPlan).reduce((sum, plan) => sum + plan.users, 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+{metrics.growth.userGrowth}%</span> user growth
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.growth.conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Free to paid conversion
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Revenue Breakdown */}
            {metrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Plan</CardTitle>
                    <CardDescription>Monthly revenue breakdown across subscription tiers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(metrics.breakdown.byPlan).map(([plan, data]) => (
                      <div key={plan} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            plan === "FREE" ? "bg-gray-400" :
                            plan === "PRO" ? "bg-blue-500" : "bg-purple-500"
                          }`} />
                          <span className="font-medium">{plan}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(data.revenue)}</div>
                          <div className="text-sm text-muted-foreground">{data.users} users</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Yearly Target Progress</CardTitle>
                    <CardDescription>Progress towards annual revenue goal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{formatCurrency(metrics.currentMonth.arr)}</span>
                        <span>{formatCurrency(metrics.projections.yearlyTarget)}</span>
                      </div>
                      <Progress value={metrics.projections.progressToTarget} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {metrics.projections.progressToTarget}% complete
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Next Month MRR</div>
                        <div className="text-lg font-semibold">{formatCurrency(metrics.projections.nextMonthMrr)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Next Quarter ARR</div>
                        <div className="text-lg font-semibold">{formatCurrency(metrics.projections.nextQuarterArr)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Subscription Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center rounded-lg bg-muted p-1">
                <Button
                  variant={billingCycle === "MONTHLY" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("MONTHLY")}
                >
                  Monthly
                </Button>
                <Button
                  variant={billingCycle === "YEARLY" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("YEARLY")}
                >
                  Yearly <Badge className="ml-2" variant="secondary">Save 17%</Badge>
                </Button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const displayPrice = billingCycle === "YEARLY" && plan.yearlyPrice 
                  ? plan.yearlyPrice 
                  : plan.price
                
                const periodText = billingCycle === "YEARLY" ? "/year" : "/month"

                return (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className="flex items-center justify-center mb-2">
                        {plan.id === "FREE" && <Users className="h-6 w-6 text-muted-foreground" />}
                        {plan.id === "PRO" && <Crown className="h-6 w-6 text-blue-500" />}
                        {plan.id === "ENTERPRISE" && <Shield className="h-6 w-6 text-purple-500" />}
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">
                          {displayPrice === 0 ? "Free" : formatCurrency(displayPrice)}
                        </span>
                        <span className="text-muted-foreground">{periodText}</span>
                      </div>
                      {plan.yearlySavings && billingCycle === "YEARLY" && (
                        <div className="text-sm text-green-600 mt-1">
                          Save {formatCurrency(plan.yearlySavings)} yearly
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {plan.cta}
                      </Button>
                      
                      {plan.trialDays && (
                        <div className="text-center text-sm text-muted-foreground">
                          {plan.trialDays}-day free trial included
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {feature.included ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    User Acquisition Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">1,537</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-sm text-muted-foreground">New This Month</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">3.2%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">18.5%</div>
                      <div className="text-sm text-muted-foreground">Trial Conversion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Feature Usage Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { feature: "Real-time Data", usage: 98, plan: "ALL" },
                      { feature: "AI Analysis", usage: 67, plan: "PRO+" },
                      { feature: "Custom Alerts", usage: 45, plan: "PRO+" },
                      { feature: "API Access", usage: 34, plan: "PRO+" },
                      { feature: "Data Export", usage: 28, plan: "PRO+" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{item.feature}</span>
                          <Badge variant="outline" className="text-xs">{item.plan}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.usage} className="w-20 h-2" />
                          <span className="text-sm font-medium">{item.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Upgrade Drivers
                  </CardTitle>
                  <CardDescription>Features that drive free users to upgrade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { feature: "Historical Data", intent: 78 },
                    { feature: "AI Analysis", intent: 72 },
                    { feature: "API Access", intent: 65 },
                    { feature: "Custom Alerts", intent: 58 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.feature}</span>
                        <span className="font-medium">{item.intent}%</span>
                      </div>
                      <Progress value={item.intent} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Revenue Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">156</div>
                      <div className="text-sm text-muted-foreground">Upsell Opportunities</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$8,900</div>
                      <div className="text-sm text-muted-foreground">Expansion Revenue</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Pricing Tier Performance</div>
                    {[
                      { tier: "$0-49", users: 1240, conversion: 2.1 },
                      { tier: "$49-299", users: 285, conversion: 18.5 },
                      { tier: "$299+", users: 12, conversion: 5.2 },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.tier}</span>
                        <span>{item.users} users ({item.conversion}% conv)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            {metrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue Breakdown</CardTitle>
                    <CardDescription>Detailed revenue analysis for current month</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">New Subscriptions</div>
                        <div className="text-2xl font-bold text-green-600">
                          +{metrics.currentMonth.newSubscriptions}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Churned Subscriptions</div>
                        <div className="text-2xl font-bold text-red-600">
                          -{metrics.currentMonth.churnedSubscriptions}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Upgrade Revenue</div>
                        <div className="text-2xl font-bold text-green-600">
                          +{formatCurrency(metrics.currentMonth.upgradeRevenue)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Downgrade Revenue</div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(metrics.currentMonth.downgradeRevenue)}
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Net Revenue</span>
                        <span className="text-2xl font-bold">
                          {formatCurrency(metrics.currentMonth.netRevenue)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Cycle Analysis</CardTitle>
                    <CardDescription>Revenue distribution by billing frequency</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(metrics.breakdown.byBillingCycle).map(([cycle, data]) => (
                      <div key={cycle} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{cycle}</span>
                          <span className="font-semibold">{formatCurrency(data.revenue)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {data.users} subscribers
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Yearly billing provides better cash flow and customer retention
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Lifetime Value</CardTitle>
                    <CardDescription>Average revenue per customer over their lifetime</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">$622.92</div>
                        <div className="text-sm text-muted-foreground">Average LTV</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">37</div>
                        <div className="text-sm text-muted-foreground">Avg. Months</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly Churn Rate</span>
                        <span className="font-medium">2.7%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Revenue Per Account</span>
                        <span className="font-medium">$51.91</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Projections</CardTitle>
                    <CardDescription>Forecasted revenue based on current trends</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next Month MRR</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{formatCurrency(metrics.projections.nextMonthMrr)}</span>
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next Quarter ARR</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{formatCurrency(metrics.projections.nextQuarterArr)}</span>
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Yearly Target</span>
                        <span className="font-semibold">{formatCurrency(metrics.projections.yearlyTarget)}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to Target</span>
                          <span className="font-medium">{metrics.projections.progressToTarget}%</span>
                        </div>
                        <Progress value={metrics.projections.progressToTarget} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}