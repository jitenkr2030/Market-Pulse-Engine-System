"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Brain, 
  TrendingUp, 
  DollarSign, 
  GitBranch, 
  ArrowLeftRight, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  BarChart3,
  Bell,
  Settings,
  Users,
  Star,
  Target,
  Lightbulb,
  Rocket
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
  content: React.ReactNode
}

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Market Pulse Engine",
      description: "Let's get you started with the basics",
      icon: Rocket,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Welcome to Market Pulse Engine!</h3>
            <p className="text-muted-foreground">
              You're just a few steps away from unlocking powerful market insights and AI-driven analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium">Real-time Data</h4>
                <p className="text-sm text-muted-foreground">Live market pulse indicators</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium">AI-Powered</h4>
                <p className="text-sm text-muted-foreground">Advanced market analysis</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium">Smart Alerts</h4>
                <p className="text-sm text-muted-foreground">Intelligent notifications</p>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "pulse-indicators",
      title: "Understanding Pulse Indicators",
      description: "Learn about our 8 powerful market pulse indicators",
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Eight Pulse Indicators</h3>
            <p className="text-muted-foreground">
              Our platform uses 8 unique pulse indicators to provide comprehensive market analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Brain, name: "Sentiment Pulse", desc: "Market sentiment analysis", color: "bg-purple-500" },
              { icon: TrendingUp, name: "Volatility Pulse", desc: "Volatility forecasting", color: "bg-red-500" },
              { icon: DollarSign, name: "Liquidity Pulse", desc: "Capital flow tracking", color: "bg-green-500" },
              { icon: GitBranch, name: "Correlation Pulse", desc: "Market relationships", color: "bg-orange-500" },
              { icon: ArrowLeftRight, name: "Flow Pulse", desc: "Smart money tracking", color: "bg-cyan-500" },
              { icon: Shield, name: "Risk Pulse", desc: "Risk assessment", color: "bg-yellow-500" },
              { icon: Zap, name: "Momentum Pulse", desc: "Trend analysis", color: "bg-pink-500" },
              { icon: Activity, name: "Market Pulse", desc: "Composite MPI score", color: "bg-blue-500" },
            ].map((indicator, index) => {
              const Icon = indicator.icon
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${indicator.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{indicator.name}</h4>
                      <p className="text-sm text-muted-foreground">{indicator.desc}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )
    },
    {
      id: "dashboard",
      title: "Navigating Your Dashboard",
      description: "Learn how to use your personalized dashboard",
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your Command Center</h3>
            <p className="text-muted-foreground">
              The dashboard is your central hub for all market insights and analysis.
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Market Pulse Index (MPI)</span>
                </CardTitle>
                <CardDescription>
                  Your composite market health score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The MPI combines all pulse indicators into a single score (0-100) that represents overall market health.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Pulse Indicator Cards</span>
                </CardTitle>
                <CardDescription>
                  Individual pulse scores and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Each card shows the current score, trend direction, and status for a specific pulse indicator.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Fast access to common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create alerts, manage watchlists, and access other features with one click.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Your first steps to market mastery",
      icon: Lightbulb,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
            <p className="text-muted-foreground">
              Here are the recommended first steps to get the most out of Market Pulse Engine.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">1. Explore Your Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Spend some time familiarizing yourself with the dashboard layout and different pulse indicators.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg">2. Set Up Your First Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create an alert for a pulse indicator that interests you to receive real-time notifications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-lg">3. Create a Watchlist</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add markets you're interested in tracking to your personal watchlist.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-lg">4. Try AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use our AI-powered analysis to get insights and predictions for your favorite markets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (!completedSteps.includes(steps[currentStep].id)) {
        setCompletedSteps([...completedSteps, steps[currentStep].id])
      }
      setCurrentStep(currentStep + 1)
    } else {
      // Onboarding completed
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    // Mark onboarding as completed for the user
    // This would typically update the user's preferences in the database
    router.push("/dashboard")
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  if (status === "loading") {
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
    router.push("/auth/signin")
    return null
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Getting Started</h1>
          <p className="text-muted-foreground">
            Let's walk you through the key features of Market Pulse Engine
          </p>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="flex justify-center space-x-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep
                  ? "bg-primary"
                  : completedSteps.includes(step.id)
                  ? "bg-green-500"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span>{currentStepData.title}</span>
                  {completedSteps.includes(currentStepData.id) && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStepData.content}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tutorial
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <Rocket className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}