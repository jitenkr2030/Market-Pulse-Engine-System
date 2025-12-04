"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  PieChart,
  Activity,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Newspaper,
  Users
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from "recharts"

interface SentimentData {
  timestamp: string
  sps: number
  fearGreed: number
  newsScore: number
  socialScore: number
  analystScore: number
}

interface SourceBreakdown {
  source: string
  score: number
  volume: number
  change: number
}

const generateMockSentimentData = (): SentimentData[] => {
  const data: SentimentData[] = []
  const now = Date.now()
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString()
    data.push({
      timestamp,
      sps: Math.random() * 40 + 30 + (i > 12 ? 10 : -5),
      fearGreed: Math.random() * 30 + 40 + (i > 8 ? 15 : -10),
      newsScore: Math.random() * 35 + 35 + (i > 16 ? 8 : -3),
      socialScore: Math.random() * 45 + 25 + (i > 10 ? 12 : -8),
      analystScore: Math.random() * 25 + 45 + (i > 14 ? 5 : -2)
    })
  }
  
  return data
}

const sourceBreakdownData: SourceBreakdown[] = [
  { source: "News Media", score: 72, volume: 1250, change: 5.2 },
  { source: "Social Media", score: 68, volume: 3420, change: -2.1 },
  { source: "Analyst Reports", score: 81, volume: 180, change: 8.7 },
  { source: "Financial Blogs", score: 64, volume: 890, change: 1.3 },
  { source: "Corporate News", score: 76, volume: 450, change: 3.8 },
  { source: "Regulatory", score: 58, volume: 120, change: -1.5 }
]

const sentimentDistribution = [
  { name: "Bullish", value: 45, color: "#22c55e" },
  { name: "Neutral", value: 35, color: "#f59e0b" },
  { name: "Bearish", value: 20, color: "#ef4444" }
]

export function SentimentPulseDashboard() {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [currentSentiment, setCurrentSentiment] = useState<SentimentData | null>(null)
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    const mockData = generateMockSentimentData()
    setSentimentData(mockData)
    setCurrentSentiment(mockData[mockData.length - 1])
  }, [])

  const getSentimentColor = (score: number) => {
    if (score > 70) return "text-green-600"
    if (score > 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getSentimentLabel = (score: number) => {
    if (score > 70) return "Bullish"
    if (score > 40) return "Neutral"
    return "Bearish"
  }

  const getSentimentIcon = (score: number) => {
    if (score > 70) return <TrendingUp className="h-4 w-4" />
    if (score > 40) return <Minus className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  if (!currentSentiment) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading sentiment data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SPS Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSentimentColor(currentSentiment.sps)}`}>
              {currentSentiment.sps.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getSentimentIcon(currentSentiment.sps)}
              <span>{getSentimentLabel(currentSentiment.sps)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fear & Greed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSentimentColor(currentSentiment.fearGreed)}`}>
              {currentSentiment.fearGreed.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getSentimentIcon(currentSentiment.fearGreed)}
              <span>{getSentimentLabel(currentSentiment.fearGreed)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Sentiment</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSentimentColor(currentSentiment.newsScore)}`}>
              {currentSentiment.newsScore.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getSentimentIcon(currentSentiment.newsScore)}
              <span>{getSentimentLabel(currentSentiment.newsScore)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Sentiment</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSentimentColor(currentSentiment.socialScore)}`}>
              {currentSentiment.socialScore.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getSentimentIcon(currentSentiment.socialScore)}
              <span>{getSentimentLabel(currentSentiment.socialScore)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyst Sentiment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSentimentColor(currentSentiment.analystScore)}`}>
              {currentSentiment.analystScore.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getSentimentIcon(currentSentiment.analystScore)}
              <span>{getSentimentLabel(currentSentiment.analystScore)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trends</CardTitle>
              <CardDescription>24-hour sentiment movement across all sources</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [value.toFixed(1), name]}
                  />
                  <Line type="monotone" dataKey="sps" stroke="#8b5cf6" strokeWidth={2} name="SPS" />
                  <Line type="monotone" dataKey="fearGreed" stroke="#f59e0b" strokeWidth={2} name="Fear & Greed" />
                  <Line type="monotone" dataKey="newsScore" stroke="#3b82f6" strokeWidth={2} name="News" />
                  <Line type="monotone" dataKey="socialScore" stroke="#10b981" strokeWidth={2} name="Social" />
                  <Line type="monotone" dataKey="analystScore" stroke="#f97316" strokeWidth={2} name="Analyst" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Source Breakdown</CardTitle>
              <CardDescription>Sentiment scores and volume by source</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sourceBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: number, name: string) => [name === 'score' ? value.toFixed(1) : value, name === 'score' ? 'Score' : name === 'volume' ? 'Volume' : 'Change %']} />
                  <Bar dataKey="score" fill="#8b5cf6" name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sourceBreakdownData.map((source) => (
              <Card key={source.source}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{source.source}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className={`font-medium ${getSentimentColor(source.score)}`}>
                        {source.score.toFixed(1)}
                      </span>
                    </div>
                    <Progress value={source.score} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Volume: {source.volume.toLocaleString()}</span>
                      <span className={source.change > 0 ? "text-green-600" : "text-red-600"}>
                        {source.change > 0 ? "+" : ""}{source.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Current market sentiment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={sentimentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {sentimentDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Indicators</CardTitle>
                <CardDescription>Key sentiment metrics and signals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Bullish Signals</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Strong
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Bearish Signals</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Weak
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Sentiment Momentum</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Increasing
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Update Frequency</span>
                    </div>
                    <Badge variant="outline">
                      Real-time
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Recent Changes</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span>SPS 1h change</span>
                      <span className="text-green-600">+2.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Social volume</span>
                      <span className="text-green-600">+15.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>News sentiment</span>
                      <span className="text-red-600">-1.8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>AI-powered sentiment insights and forecasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Sentiment State</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Market sentiment is currently <span className="font-medium text-green-600">bullish</span> with 
                      an SPS score of {currentSentiment.sps.toFixed(1)}. The sentiment has been 
                      <span className="font-medium text-green-600"> improving</span> over the last 6 hours.
                    </p>
                    <p className="text-muted-foreground">
                      Social media sentiment is leading the positive momentum with a score of 
                      {currentSentiment.socialScore.toFixed(1)}, while news sentiment remains 
                      cautiously optimistic at {currentSentiment.newsScore.toFixed(1)}.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Key Insights</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Strong positive sentiment from analyst reports suggests institutional confidence
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Fear & Greed index indicates moderate greed, suggesting potential over-optimism
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Social media volume increasing significantly, indicating retail interest
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Short-term Forecast</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">Bullish</div>
                        <div className="text-sm text-muted-foreground">1-2 hours</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Probability: 68%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">Neutral</div>
                        <div className="text-sm text-muted-foreground">2-4 hours</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Probability: 72%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">Volatile</div>
                        <div className="text-sm text-muted-foreground">4-6 hours</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Probability: 45%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}