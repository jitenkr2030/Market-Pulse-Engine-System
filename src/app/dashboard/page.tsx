"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  GitBranch, 
  ArrowLeftRight, 
  Shield, 
  Zap,
  Brain,
  BarChart3,
  Calendar,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  Settings,
  Bell,
  LogOut,
  Play
} from "lucide-react"
import { useWebSocketContext } from "@/contexts/websocket-context"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isConnected, subscribeToMarket } = useWebSocketContext()
  const [activeTab, setActiveTab] = useState("overview")
  const [onboardingStatus, setOnboardingStatus] = useState<{ completed: boolean; step: number } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      // Check onboarding status
      fetch("/api/user/onboarding")
        .then(res => res.json())
        .then(data => {
          setOnboardingStatus(data)
          if (!data.completed) {
            router.push("/onboarding")
          }
        })
        .catch(console.error)
    }
  }, [status, router])

  useEffect(() => {
    if (isConnected && session) {
      subscribeToMarket("default", ["sentiment", "volatility", "liquidity", "flow", "risk", "momentum"])
    }
  }, [isConnected, session, subscribeToMarket])

  const pulseData = {
    sentiment: { score: 65.4, trend: "up", status: "Strong" },
    volatility: { score: 42.8, trend: "down", status: "Moderate" },
    liquidity: { score: 78.9, trend: "up", status: "Strong" },
    correlation: { score: 56.2, trend: "stable", status: "Moderate" },
    flow: { score: 71.3, trend: "up", status: "Strong" },
    risk: { score: 38.7, trend: "down", status: "Low" },
    momentum: { score: 82.1, trend: "up", status: "Strong" },
  }

  const getSubscriptionStatus = () => {
    if (!session?.user?.subscription) {
      return { status: "No Plan", color: "secondary", plan: "Free" }
    }
    
    const { status, plan } = session.user.subscription
    let color = "secondary"
    
    if (status === "ACTIVE") {
      color = "default"
    } else if (status === "EXPIRED") {
      color = "destructive"
    } else if (status === "CANCELLED") {
      color = "outline"
    }

    return { status, color, plan }
  }

  const subscriptionInfo = getSubscriptionStatus()

  if (status === "loading" || !onboardingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  // Show onboarding prompt if not completed
  if (!onboardingStatus.completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Complete Your Setup</span>
            </CardTitle>
            <CardDescription>
              Let's get you familiar with Market Pulse Engine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Take a quick tour to learn about all the features and get the most out of your account.
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.push("/onboarding")} className="w-full">
                Start Tutorial
                <Play className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Mark onboarding as completed
                  fetch("/api/user/onboarding", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ completed: true })
                  }).then(() => {
                    setOnboardingStatus({ completed: true, step: 0 })
                  })
                }}
                className="w-full"
              >
                Skip Tutorial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold">Market Pulse Engine</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="text-foreground">
                Dashboard
              </Link>
              <Link href="/markets" className="text-muted-foreground hover:text-foreground">
                Markets
              </Link>
              <Link href="/alerts" className="text-muted-foreground hover:text-foreground">
                Alerts
              </Link>
              <Link href="/watchlists" className="text-muted-foreground hover:text-foreground">
                Watchlists
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant={subscriptionInfo.color as any}>
              {subscriptionInfo.plan} Plan
            </Badge>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Sign out logic will be handled by NextAuth
                router.push("/api/auth/signout")
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {session.user?.name}!</h1>
            <p className="text-muted-foreground">
              Here's your market overview and latest insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Subscription Alert */}
        {subscriptionInfo.status === "EXPIRED" && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Your subscription has expired.{" "}
              <Link href="/pricing" className="underline font-medium">
                Renew now
              </Link>{" "}
              to continue accessing premium features.
            </AlertDescription>
          </Alert>
        )}

        {/* Market Pulse Index */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Market Pulse Index (MPI)</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                72.5
              </Badge>
            </CardTitle>
            <CardDescription>
              Composite market health score based on all pulse indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-green-600">+2.3</div>
                <div className="text-sm text-muted-foreground">24h Change</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">68.2</div>
                <div className="text-sm text-muted-foreground">Weekly Avg</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-orange-600">Moderate</div>
                <div className="text-sm text-muted-foreground">Risk Level</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-blue-600">Bullish</div>
                <div className="text-sm text-muted-foreground">Momentum</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pulse Indicators */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="volatility">Volatility</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="momentum">Momentum</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(pulseData).map(([key, data]) => {
                const icons = {
                  sentiment: Brain,
                  volatility: TrendingUp,
                  liquidity: DollarSign,
                  correlation: GitBranch,
                  flow: ArrowLeftRight,
                  risk: Shield,
                  momentum: Zap,
                }
                const Icon = icons[key as keyof typeof icons]
                
                return (
                  <Card key={key} className="cursor-pointer hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium capitalize">
                        {key} Pulse
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data.score}</div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          data.status === 'Strong' ? 'bg-green-500' : 
                          data.status === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span>{data.status}</span>
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          data.trend === 'up' ? 'bg-green-500' : 
                          data.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span>{data.trend}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Individual Pulse Tabs */}
          {Object.keys(pulseData).map((pulse) => (
            <TabsContent key={pulse} value={pulse} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{pulse} Pulse Analysis</CardTitle>
                  <CardDescription>
                    Detailed analysis and insights for {pulse} indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Advanced {pulse} analysis charts and data will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                <Bell className="h-6 w-6" />
                <span>Create Alert</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span>Manage Watchlists</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span>View Schedule</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}