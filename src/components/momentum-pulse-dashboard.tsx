"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Target,
  RefreshCw,
  Gauge,
  Compass,
  Timer,
  LineChart as LineChartIcon
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart as RechartsAreaChart, Area, BarChart, Bar, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"

interface MomentumData {
  timestamp: string
  mpm: number
  trendStrength: number
  trendDirection: number
  exhaustion: number
}

interface TimeframeMomentum {
  timeframe: string
  mpm: number
  trendStrength: number
  trendDirection: number
  exhaustion: number
  signal: 'bullish' | 'bearish' | 'neutral'
}

interface AssetMomentum {
  asset: string
  mpm: number
  trendStrength: number
  trendDirection: number
  exhaustion: number
  momentumChange: number
}

interface MomentumSignal {
  type: string
  strength: number
  confidence: number
  timeframe: string
  description: string
}

const generateMockMomentumData = (): MomentumData[] => {
  const data: MomentumData[] = []
  const now = Date.now()
  
  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now - i * 30 * 60 * 1000).toISOString()
    const baseMomentum = 50 + Math.sin(i * 0.08) * 30
    data.push({
      timestamp,
      mpm: Math.random() * 40 + 40 + (i > 24 ? 15 : -10),
      trendStrength: Math.random() * 40 + 40,
      trendDirection: (Math.random() - 0.5) * 2,
      exhaustion: Math.random() * 30 + 20
    })
  }
  
  return data
}

const timeframeMomentum: TimeframeMomentum[] = [
  { timeframe: "5m", mpm: 72, trendStrength: 68, trendDirection: 0.8, exhaustion: 25, signal: "bullish" },
  { timeframe: "15m", mpm: 65, trendStrength: 62, trendDirection: 0.6, exhaustion: 35, signal: "bullish" },
  { timeframe: "1h", mpm: 58, trendStrength: 55, trendDirection: 0.4, exhaustion: 45, signal: "neutral" },
  { timeframe: "4h", mpm: 48, trendStrength: 45, trendDirection: 0.2, exhaustion: 55, signal: "neutral" },
  { timeframe: "1d", mpm: 42, trendStrength: 40, trendDirection: -0.1, exhaustion: 65, signal: "bearish" },
  { timeframe: "1w", mpm: 38, trendStrength: 35, trendDirection: -0.3, exhaustion: 72, signal: "bearish" }
]

const assetMomentum: AssetMomentum[] = [
  { asset: "S&P 500", mpm: 68, trendStrength: 65, trendDirection: 0.7, exhaustion: 32, momentumChange: 5.2 },
  { asset: "NASDAQ", mpm: 75, trendStrength: 72, trendDirection: 0.8, exhaustion: 28, momentumChange: 8.1 },
  { asset: "Dow Jones", mpm: 62, trendStrength: 58, trendDirection: 0.5, exhaustion: 42, momentumChange: 2.4 },
  { asset: "Russell 2000", mpm: 58, trendStrength: 55, trendDirection: 0.4, exhaustion: 48, momentumChange: -1.2 },
  { asset: "Bitcoin", mpm: 82, trendStrength: 78, trendDirection: 0.9, exhaustion: 22, momentumChange: 12.5 },
  { asset: "Gold", mpm: 45, trendStrength: 42, trendDirection: -0.2, exhaustion: 58, momentumChange: -3.8 }
]

const momentumSignals: MomentumSignal[] = [
  { type: "Trend Continuation", strength: 85, confidence: 78, timeframe: "1-4h", description: "Strong upward momentum likely to continue" },
  { type: "Momentum Divergence", strength: 65, confidence: 62, timeframe: "4-8h", description: "Price making new highs but momentum weakening" },
  { type: "Exhaustion Signal", strength: 45, confidence: 55, timeframe: "2-6h", description: "Momentum showing signs of fatigue" },
  { type: "Reversal Pattern", strength: 35, confidence: 48, timeframe: "6-12h", description: "Potential trend reversal developing" },
  { type: "Breakout Confirmation", strength: 75, confidence: 72, timeframe: "1-2h", description: "Momentum confirming price breakout" }
]

const momentumDistribution = [
  { name: "Strong Bullish", value: 35, color: "#10b981" },
  { name: "Moderate Bullish", value: 25, color: "#22c55e" },
  { name: "Neutral", value: 20, color: "#f59e0b" },
  { name: "Moderate Bearish", value: 15, color: "#f97316" },
  { name: "Strong Bearish", value: 5, color: "#ef4444" }
]

export function MomentumPulseDashboard() {
  const [momentumData, setMomentumData] = useState<MomentumData[]>([])
  const [currentMomentum, setCurrentMomentum] = useState<MomentumData | null>(null)
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    const mockData = generateMockMomentumData()
    setMomentumData(mockData)
    setCurrentMomentum(mockData[mockData.length - 1])
  }, [])

  const getMomentumColor = (score: number) => {
    if (score > 80) return "text-green-600"
    if (score > 60) return "text-blue-600"
    if (score > 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getMomentumLabel = (score: number) => {
    if (score > 80) return "Very Strong"
    if (score > 60) return "Strong"
    if (score > 40) return "Moderate"
    return "Weak"
  }

  const getDirectionColor = (direction: number) => {
    if (direction > 0.3) return "text-green-600"
    if (direction < -0.3) return "text-red-600"
    return "text-gray-600"
  }

  const getDirectionLabel = (direction: number) => {
    if (direction > 0.3) return "Bullish"
    if (direction < -0.3) return "Bearish"
    return "Neutral"
  }

  const getDirectionIcon = (direction: number) => {
    if (direction > 0.3) return <TrendingUp className="h-4 w-4" />
    if (direction < -0.3) return <TrendingDown className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getExhaustionColor = (exhaustion: number) => {
    if (exhaustion > 70) return "text-red-600"
    if (exhaustion > 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getExhaustionLabel = (exhaustion: number) => {
    if (exhaustion > 70) return "High"
    if (exhaustion > 40) return "Moderate"
    return "Low"
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return "text-green-600"
      case 'bearish': return "text-red-600"
      default: return "text-gray-600"
    }
  }

  if (!currentMomentum) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading momentum data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Momentum Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MPM Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMomentumColor(currentMomentum.mpm)}`}>
              {currentMomentum.mpm.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{getMomentumLabel(currentMomentum.mpm)} Momentum</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend Strength</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMomentumColor(currentMomentum.trendStrength)}`}>
              {currentMomentum.trendStrength.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Strength Level</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direction</CardTitle>
            <Compass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getDirectionColor(currentMomentum.trendDirection)}`}>
              {getDirectionLabel(currentMomentum.trendDirection)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getDirectionIcon(currentMomentum.trendDirection)}
              <span>Trend Bias</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exhaustion</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getExhaustionColor(currentMomentum.exhaustion)}`}>
              {currentMomentum.exhaustion.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{getExhaustionLabel(currentMomentum.exhaustion)} Fatigue</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(currentMomentum.trendStrength * currentMomentum.trendDirection).toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Momentum Rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Momentum Trends</TabsTrigger>
          <TabsTrigger value="timeframes">Timeframes</TabsTrigger>
          <TabsTrigger value="assets">Asset Analysis</TabsTrigger>
          <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Momentum Trends</CardTitle>
              <CardDescription>Real-time momentum tracking across all timeframes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsAreaChart data={momentumData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      value.toFixed(1),
                      name === 'mpm' ? 'MPM' :
                      name === 'trendStrength' ? 'Trend Strength' :
                      name === 'exhaustion' ? 'Exhaustion' : name
                    ]}
                  />
                  <Area type="monotone" dataKey="mpm" stackId="1" fill="#10b981" fillOpacity={0.6} stroke="#10b981" name="MPM" />
                  <Area type="monotone" dataKey="trendStrength" stackId="1" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" name="Trend Strength" />
                  <Line type="monotone" dataKey="exhaustion" stroke="#ef4444" strokeWidth={2} name="Exhaustion" />
                </RechartsAreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Momentum Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getMomentumColor(currentMomentum.mpm)}`}>
                    {currentMomentum.mpm.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">MPM Score</div>
                  <Progress value={currentMomentum.mpm} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trend Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(currentMomentum.trendStrength * Math.abs(currentMomentum.trendDirection)).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Quality Score</div>
                  <Progress value={currentMomentum.trendStrength * Math.abs(currentMomentum.trendDirection)} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sustainability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getExhaustionColor(100 - currentMomentum.exhaustion)}`}>
                    {(100 - currentMomentum.exhaustion).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Sustainability</div>
                  <Progress value={100 - currentMomentum.exhaustion} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeframes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Timeframe Analysis</CardTitle>
              <CardDescription>Momentum analysis across different time horizons</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={timeframeMomentum}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeframe" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toFixed(1),
                      name === 'mpm' ? 'MPM' :
                      name === 'trendStrength' ? 'Trend Strength' :
                      name === 'exhaustion' ? 'Exhaustion' : name
                    ]}
                  />
                  <Bar dataKey="mpm" fill="#10b981" name="MPM" />
                  <Bar dataKey="trendStrength" fill="#3b82f6" name="Trend Strength" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeframeMomentum.map((tf) => (
              <Card key={tf.timeframe}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{tf.timeframe} Timeframe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">MPM</span>
                      <span className={`font-medium ${getMomentumColor(tf.mpm)}`}>
                        {tf.mpm.toFixed(1)}
                      </span>
                    </div>
                    <Progress value={tf.mpm} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Signal</span>
                      <Badge variant={tf.signal === 'bullish' ? 'default' : tf.signal === 'bearish' ? 'destructive' : 'secondary'}>
                        {tf.signal.charAt(0).toUpperCase() + tf.signal.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Strength</span>
                      <span className={getMomentumColor(tf.trendStrength)}>
                        {tf.trendStrength.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Exhaustion</span>
                      <span className={getExhaustionColor(tf.exhaustion)}>
                        {tf.exhaustion.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Momentum Analysis</CardTitle>
              <CardDescription>Momentum comparison across different asset classes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={assetMomentum}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'mpm' ? value.toFixed(1) :
                      name === 'trendStrength' ? value.toFixed(1) + '%' :
                      name === 'trendDirection' ? value.toFixed(2) :
                      name === 'exhaustion' ? value.toFixed(1) + '%' :
                      name === 'momentumChange' ? (value > 0 ? '+' : '') + value.toFixed(1) + '%' : value,
                      name === 'mpm' ? 'MPM' :
                      name === 'trendStrength' ? 'Trend Strength' :
                      name === 'trendDirection' ? 'Direction' :
                      name === 'exhaustion' ? 'Exhaustion' :
                      name === 'momentumChange' ? 'Change' : name
                    ]}
                  />
                  <Bar dataKey="mpm" fill="#8b5cf6" name="MPM" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetMomentum.map((asset) => (
              <Card key={asset.asset}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{asset.asset}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">MPM</span>
                      <span className={`font-medium ${getMomentumColor(asset.mpm)}`}>
                        {asset.mpm.toFixed(1)}
                      </span>
                    </div>
                    <Progress value={asset.mpm} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Direction</span>
                      <div className="flex items-center space-x-1">
                        {getDirectionIcon(asset.trendDirection)}
                        <span className={getDirectionColor(asset.trendDirection)}>
                          {getDirectionLabel(asset.trendDirection)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Strength</span>
                      <span className={getMomentumColor(asset.trendStrength)}>
                        {asset.trendStrength.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Change</span>
                      <span className={asset.momentumChange > 0 ? "text-green-600" : "text-red-600"}>
                        {asset.momentumChange > 0 ? "+" : ""}{asset.momentumChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {momentumSignals.map((signal) => (
              <Card key={signal.type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{signal.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Strength</span>
                      <span className={`font-medium ${getMomentumColor(signal.strength)}`}>
                        {signal.strength}%
                      </span>
                    </div>
                    <Progress value={signal.strength} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="font-medium text-blue-600">
                        {signal.confidence}%
                      </span>
                    </div>
                    <Progress value={signal.confidence} className="h-2" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Timeframe</span>
                      <span className="text-xs">{signal.timeframe}</span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">{signal.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Momentum Distribution</CardTitle>
              <CardDescription>Current momentum distribution across all assets and timeframes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={momentumDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Momentum Categories</h4>
                    <div className="space-y-2">
                      {momentumDistribution.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Key Insights</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                        <p className="text-muted-foreground">
                          60% of assets showing bullish momentum
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                        <p className="text-muted-foreground">
                          Strong momentum concentrated in tech and crypto
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                        <p className="text-muted-foreground">
                          20% of assets in neutral consolidation phase
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Momentum Analysis</CardTitle>
              <CardDescription>Comprehensive momentum insights and trading recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Momentum State</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Market momentum is currently <span className="font-medium text-green-600">strong</span> with 
                      an MPM score of {currentMomentum.mpm.toFixed(1)}. Trend strength is 
                      <span className="font-medium text-blue-600"> solid</span> at {currentMomentum.trendStrength.toFixed(1)}%, 
                      with <span className="font-medium text-green-600"> bullish</span> direction bias.
                    </p>
                    <p className="text-muted-foreground">
                      Multi-timeframe analysis shows shorter-term momentum (5m-1h) is significantly 
                      stronger than longer-term (1d-1w), suggesting potential near-term continuation 
                      but longer-term caution.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Key Momentum Signals</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Strong trend continuation signals across multiple timeframes
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Crypto and tech showing exceptional momentum strength
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Some early signs of momentum divergence in traditional markets
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Trading Strategies</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">Trend Follow</div>
                        <div className="text-sm text-muted-foreground">Strategy</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Ride the momentum wave
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">Breakout</div>
                        <div className="text-sm text-muted-foreground">Setup</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Momentum confirmations
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">Monitor</div>
                        <div className="text-sm text-muted-foreground">Exhaustion</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Watch for fatigue signals
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