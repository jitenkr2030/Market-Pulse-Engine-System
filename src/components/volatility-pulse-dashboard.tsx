"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  Zap,
  Gauge
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart, Scatter } from "recharts"

interface VolatilityData {
  timestamp: string
  vpi: number
  impliedVol: number
  realizedVol: number
  volCompression: number
  volExpansion: number
}

interface ForecastData {
  time: string
  lower: number
  expected: number
  upper: number
}

interface VolatilitySurface {
  strike: number
  maturity: string
  impliedVol: number
}

const generateMockVolatilityData = (): VolatilityData[] => {
  const data: VolatilityData[] = []
  const now = Date.now()
  
  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now - i * 30 * 60 * 1000).toISOString()
    const baseVol = 20 + Math.sin(i * 0.1) * 10
    data.push({
      timestamp,
      vpi: Math.random() * 40 + 30 + (i > 24 ? 15 : -10),
      impliedVol: baseVol + Math.random() * 5,
      realizedVol: baseVol - 2 + Math.random() * 4,
      volCompression: Math.random() * 30 + 20,
      volExpansion: Math.random() * 40 + 30
    })
  }
  
  return data
}

const generateForecastData = (): ForecastData[] => {
  const data: ForecastData[] = []
  const baseVol = 25
  
  for (let i = 0; i <= 12; i++) {
    const time = `${i * 5}m`
    const volatility = baseVol + Math.sin(i * 0.3) * 8 + i * 0.5
    data.push({
      time,
      lower: volatility - 5,
      expected: volatility,
      upper: volatility + 5
    })
  }
  
  return data
}

const volatilitySurfaceData: VolatilitySurface[] = [
  { strike: 90, maturity: "1W", impliedVol: 28.5 },
  { strike: 95, maturity: "1W", impliedVol: 26.2 },
  { strike: 100, maturity: "1W", impliedVol: 24.8 },
  { strike: 105, maturity: "1W", impliedVol: 23.9 },
  { strike: 110, maturity: "1W", impliedVol: 23.5 },
  { strike: 90, maturity: "1M", impliedVol: 26.8 },
  { strike: 95, maturity: "1M", impliedVol: 25.1 },
  { strike: 100, maturity: "1M", impliedVol: 24.2 },
  { strike: 105, maturity: "1M", impliedVol: 23.8 },
  { strike: 110, maturity: "1M", impliedVol: 23.6 },
  { strike: 90, maturity: "3M", impliedVol: 25.2 },
  { strike: 95, maturity: "3M", impliedVol: 24.3 },
  { strike: 100, maturity: "3M", impliedVol: 23.8 },
  { strike: 105, maturity: "3M", impliedVol: 23.5 },
  { strike: 110, maturity: "3M", impliedVol: 23.4 }
]

export function VolatilityPulseDashboard() {
  const [volatilityData, setVolatilityData] = useState<VolatilityData[]>([])
  const [currentVolatility, setCurrentVolatility] = useState<VolatilityData | null>(null)
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    const mockData = generateMockVolatilityData()
    setVolatilityData(mockData)
    setCurrentVolatility(mockData[mockData.length - 1])
    setForecastData(generateForecastData())
  }, [])

  const getVolatilityColor = (score: number) => {
    if (score > 70) return "text-red-600"
    if (score > 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getVolatilityLabel = (score: number) => {
    if (score > 70) return "High"
    if (score > 40) return "Moderate"
    return "Low"
  }

  const getVolatilityIcon = (score: number) => {
    if (score > 70) return <AlertTriangle className="h-4 w-4" />
    if (score > 40) return <Activity className="h-4 w-4" />
    return <Zap className="h-4 w-4" />
  }

  if (!currentVolatility) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading volatility data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Volatility Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VPI Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getVolatilityColor(currentVolatility.vpi)}`}>
              {currentVolatility.vpi.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getVolatilityIcon(currentVolatility.vpi)}
              <span>{getVolatilityLabel(currentVolatility.vpi)} Pressure</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implied Vol</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentVolatility.impliedVol.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Expected movement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realized Vol</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentVolatility.realizedVol.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Actual movement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compression</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentVolatility.volCompression.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              <span>Pressure building</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expansion</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {currentVolatility.volExpansion.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Energy releasing</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="surface">Surface</TabsTrigger>
          <TabsTrigger value="regimes">Regimes</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volatility Trends</CardTitle>
              <CardDescription>24-hour volatility movement and pressure indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={volatilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis yAxisId="left" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 50]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      name === 'vpi' || name === 'volCompression' || name === 'volExpansion' ? value.toFixed(1) : value.toFixed(1) + '%',
                      name === 'vpi' ? 'VPI' : 
                      name === 'impliedVol' ? 'Implied Vol' :
                      name === 'realizedVol' ? 'Realized Vol' :
                      name === 'volCompression' ? 'Compression' :
                      name === 'volExpansion' ? 'Expansion' : name
                    ]}
                  />
                  <Area yAxisId="right" type="monotone" dataKey="impliedVol" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" name="Implied Vol" />
                  <Line yAxisId="right" type="monotone" dataKey="realizedVol" stroke="#10b981" strokeWidth={2} name="Realized Vol" />
                  <Line yAxisId="left" type="monotone" dataKey="vpi" stroke="#ef4444" strokeWidth={2} name="VPI" />
                  <Line yAxisId="left" type="monotone" dataKey="volCompression" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="5 5" name="Compression" />
                  <Line yAxisId="left" type="monotone" dataKey="volExpansion" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" name="Expansion" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vol Spread</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(currentVolatility.impliedVol - currentVolatility.realizedVol).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">IV - RV Premium</div>
                  <Progress value={Math.abs(currentVolatility.impliedVol - currentVolatility.realizedVol) * 2} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vol Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(currentVolatility.impliedVol / currentVolatility.realizedVol).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">IV / RV Ratio</div>
                  <Progress value={(currentVolatility.impliedVol / currentVolatility.realizedVol) * 20} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pressure Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getVolatilityColor(currentVolatility.vpi)}`}>
                    {currentVolatility.vpi.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">VPI Score</div>
                  <Progress value={currentVolatility.vpi} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volatility Forecast</CardTitle>
              <CardDescription>5-60 minute volatility projections with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 50]} />
                  <Tooltip formatter={(value: number) => [value.toFixed(1) + '%', 'Volatility']} />
                  <Area type="monotone" dataKey="upper" fill="#ef4444" fillOpacity={0.1} stroke="#ef4444" strokeDasharray="3 3" name="Upper Bound" />
                  <Area type="monotone" dataKey="expected" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" name="Expected" />
                  <Area type="monotone" dataKey="lower" fill="#10b981" fillOpacity={0.1} stroke="#10b981" strokeDasharray="3 3" name="Lower Bound" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">5-Min Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expected</span>
                    <span className="font-medium">{forecastData[1]?.expected.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Range</span>
                    <span className="text-sm">
                      {forecastData[1]?.lower.toFixed(1)}% - {forecastData[1]?.upper.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <Badge variant="secondary">85%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">15-Min Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expected</span>
                    <span className="font-medium">{forecastData[3]?.expected.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Range</span>
                    <span className="text-sm">
                      {forecastData[3]?.lower.toFixed(1)}% - {forecastData[3]?.upper.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <Badge variant="secondary">78%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">30-Min Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expected</span>
                    <span className="font-medium">{forecastData[6]?.expected.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Range</span>
                    <span className="text-sm">
                      {forecastData[6]?.lower.toFixed(1)}% - {forecastData[6]?.upper.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <Badge variant="secondary">72%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="surface" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volatility Surface</CardTitle>
              <CardDescription>Implied volatility across strikes and maturities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={volatilitySurfaceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strike" />
                  <YAxis domain={[20, 30]} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(1) + '%', 'Implied Volatility']}
                    labelFormatter={(value, payload) => `Strike: ${value}, Maturity: ${payload?.[0]?.payload?.maturity}`}
                  />
                  <Bar dataKey="impliedVol" fill="#8b5cf6" name="Implied Volatility" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Term Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={volatilitySurfaceData.filter(d => d.strike === 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="maturity" />
                    <YAxis domain={[20, 30]} />
                    <Tooltip formatter={(value: number) => [value.toFixed(1) + '%', 'IV']} />
                    <Line type="monotone" dataKey="impliedVol" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Skew Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={volatilitySurfaceData.filter(d => d.maturity === "1M")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="strike" />
                    <YAxis domain={[20, 30]} />
                    <Tooltip formatter={(value: number) => [value.toFixed(1) + '%', 'IV']} />
                    <Line type="monotone" dataKey="impliedVol" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regimes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Low Vol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">15%</div>
                  <div className="text-sm text-muted-foreground">Current Probability</div>
                  <Progress value={15} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Normal Vol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">45%</div>
                  <div className="text-sm text-muted-foreground">Current Probability</div>
                  <Progress value={45} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Vol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">30%</div>
                  <div className="text-sm text-muted-foreground">Current Probability</div>
                  <Progress value={30} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Extreme Vol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">10%</div>
                  <div className="text-sm text-muted-foreground">Current Probability</div>
                  <Progress value={10} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Volatility Regime Analysis</CardTitle>
              <CardDescription>Current regime characteristics and transition probabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Regime: Normal Volatility</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Market is currently in a normal volatility regime with moderate price movements. 
                      Implied volatility is slightly elevated compared to historical averages.
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-muted-foreground">Stable volatility environment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">Predictable price patterns</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Transition Probabilities</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>To Low Vol</span>
                      <span className="text-green-600">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To High Vol</span>
                      <span className="text-orange-600">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To Extreme Vol</span>
                      <span className="text-red-600">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stay Normal</span>
                      <span className="text-blue-600">30%</span>
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
              <CardTitle>Volatility Analysis</CardTitle>
              <CardDescription>Comprehensive volatility insights and trading signals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Volatility State</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Volatility is currently in a <span className="font-medium text-yellow-600">normal regime</span> with 
                      a VPI score of {currentVolatility.vpi.toFixed(1)}. The market shows 
                      <span className="font-medium text-blue-600"> moderate compression</span> suggesting potential 
                      for volatility expansion in the near term.
                    </p>
                    <p className="text-muted-foreground">
                      Implied volatility at {currentVolatility.impliedVol.toFixed(1)}% is trading 
                      {currentVolatility.impliedVol > currentVolatility.realizedVol ? ' above ' : ' below '}
                      realized volatility at {currentVolatility.realizedVol.toFixed(1)}%, indicating 
                      {currentVolatility.impliedVol > currentVolatility.realizedVol ? ' elevated risk premium' : ' potential opportunity'}.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Key Signals</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        High compression pressure suggests potential volatility breakout within 2-4 hours
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Term structure shows slight contango, indicating near-term uncertainty
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Skew analysis suggests balanced risk perception across strikes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Trading Implications</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">Neutral</div>
                        <div className="text-sm text-muted-foreground">Options Strategy</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Consider straddles or strangles
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">Moderate</div>
                        <div className="text-sm text-muted-foreground">Risk Level</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Position sizing caution advised
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">Increasing</div>
                        <div className="text-sm text-muted-foreground">Vol Trend</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Monitor for breakout signals
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