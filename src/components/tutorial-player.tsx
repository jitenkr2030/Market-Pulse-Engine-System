"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle,
  Circle
} from "lucide-react"

interface TutorialStep {
  id: string
  title: string
  description: string
  duration: number
  completed: boolean
  content: {
    type: "text" | "video" | "interactive"
    data: any
  }
}

interface TutorialPlayerProps {
  tutorial: TutorialStep[]
  onComplete?: () => void
  onStepComplete?: (stepId: string) => void
}

export function TutorialPlayer({ tutorial, onComplete, onStepComplete }: TutorialPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)

  const currentStepData = tutorial[currentStep]

  const handleNext = () => {
    if (currentStep < tutorial.length - 1) {
      setCurrentStep(currentStep + 1)
      setProgress(0)
      setIsPlaying(false)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setProgress(0)
      setIsPlaying(false)
    }
  }

  const handleStepComplete = () => {
    if (!currentStepData.completed) {
      onStepComplete?.(currentStepData.id)
    }
    handleNext()
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleProgressChange = (value: number) => {
    setProgress(value)
  }

  return (
    <div className={`bg-background ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      <Card className={`${isFullscreen ? 'h-full rounded-none' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{currentStepData.title}</span>
                {currentStepData.completed && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {currentStep + 1} / {tutorial.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Tutorial Content */}
          <div className="bg-muted/50 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
            {currentStepData.content.type === "text" && (
              <div className="text-center space-y-4">
                <div className="text-6xl">
                  {currentStepData.content.data.emoji || "📚"}
                </div>
                <p className="text-lg">{currentStepData.content.data.text}</p>
              </div>
            )}

            {currentStepData.content.type === "video" && (
              <div className="w-full space-y-4">
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-2" />
                    <p>Video Tutorial</p>
                    <p className="text-sm opacity-75">{currentStepData.duration}s</p>
                  </div>
                </div>
                <p className="text-center text-muted-foreground">
                  {currentStepData.content.data.description}
                </p>
              </div>
            )}

            {currentStepData.content.type === "interactive" && (
              <div className="w-full space-y-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Interactive Demo</h3>
                  <p className="text-muted-foreground mb-6">
                    {currentStepData.content.data.instructions}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStepData.content.data.elements?.map((element: any, index: number) => (
                      <Card key={index} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            {element.icon}
                          </div>
                          <h4 className="font-medium">{element.title}</h4>
                          <p className="text-sm text-muted-foreground">{element.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === tutorial.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {tutorial.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? "bg-primary"
                        : step.completed
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <Button onClick={handleStepComplete}>
                {currentStep === tutorial.length - 1 ? "Complete Tutorial" : "Mark Complete & Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Tutorial data for different features
export const tutorialData = {
  dashboard: [
    {
      id: "dashboard-overview",
      title: "Dashboard Overview",
      description: "Learn about your main dashboard",
      duration: 120,
      completed: false,
      content: {
        type: "video",
        data: {
          description: "A comprehensive tour of your dashboard layout and features",
          videoUrl: "/tutorials/dashboard-overview.mp4"
        }
      }
    },
    {
      id: "pulse-indicators",
      title: "Understanding Pulse Indicators",
      description: "Deep dive into pulse indicators",
      duration: 180,
      completed: false,
      content: {
        type: "interactive",
        data: {
          instructions: "Click on each pulse indicator to learn more about it",
          elements: [
            {
              icon: "🧠",
              title: "Sentiment Pulse",
              description: "Market sentiment analysis"
            },
            {
              icon: "📈",
              title: "Volatility Pulse",
              description: "Volatility forecasting"
            },
            {
              icon: "💰",
              title: "Liquidity Pulse",
              description: "Capital flow tracking"
            }
          ]
        }
      }
    }
  ],
  alerts: [
    {
      id: "creating-alerts",
      title: "Creating Alerts",
      description: "Learn how to set up custom alerts",
      duration: 150,
      completed: false,
      content: {
        type: "text",
        data: {
          emoji: "🔔",
          text: "Alerts help you stay informed about important market changes. Set custom thresholds and get notified instantly."
        }
      }
    }
  ],
  watchlists: [
    {
      id: "managing-watchlists",
      title: "Managing Watchlists",
      description: "Organize your favorite markets",
      duration: 90,
      completed: false,
      content: {
        type: "text",
        data: {
          emoji: "📋",
          text: "Watchlists help you track your favorite markets and assets in one place."
        }
      }
    }
  ]
}