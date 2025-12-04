"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  GitBranch, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowLeftRight,
  Network,
  Target,
  Zap,
  AlertTriangle,
  RefreshCw,
  Link,
  Unlink
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, HeatmapChart, Cell } from "recharts"

interface CorrelationData {
  timestamp: string
  correlation: number
  correlationChange: number
  stability: number
  csm: number
}

interface CorrelationPair {
  market1: string
  market2: string
  correlation: number
  correlationChange: number
  stability: number
  csm: number
}

interface CorrelationMatrix {
  market: string
  correlations: { [key: string]: number }
}

interface CorrelationTrend {
  period: string
  sp500_bonds: number
  sp500_gold: number
  sp500_oil: number
  usd_eur: number
  btc_eth: number
}

const generateMockCorrelationData = (): CorrelationData[] => {
  const data: CorrelationData[] = []
  const now = Date.now()
  
  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now - i * 30 * 60 * 1000).toISOString()
    const baseCorr = 0.3 + Math.sin(i * 0.05) * 0.4
    data.push({
      timestamp,
      correlation: Math.max(-1, Math.min(1, baseCorr + Math.random() * 0.2 - 0.1)),
      correlationChange: (Math.random() - 0.5) * 0.1,
      stability: Math.random() * 40 + 40,
      csm: Math.random() * 40 + 30
    })
  }
  
  return data
}

const correlationPairs: CorrelationPair[] = [
  { market1: "S&P 500", market2: "US Bonds", correlation: -0.65, correlationChange: -0.05, stability: 72, csm: 68 },
  { market1: "S&P 500", market2: "Gold", correlation: -0.25, correlationChange: 0.08, stability: 58, csm: 42 },
  { market1: "S&P 500", market2: "Oil", correlation: 0.45, correlationChange: -0.12, stability: 65, csm: 55 },
  { market1: "USD", market2: "EUR", correlation: -0.85, correlationChange: -0.03, stability: 88, csm: 78 },
  { market1: "Bitcoin", market2: "Ethereum", correlation: 0.92, correlationChange: 0.02, stability: 95, csm: 85 },
  { market1: "Tech Stocks", market2: "Growth Stocks", correlation: 0.78, correlationChange: 0.05, stability: 82, csm: 71 },
  { market1: "US Stocks", market2: "European Stocks", correlation: 0.68, correlationChange: -0.08, stability: 75, csm: 63 },
  { market1: "Gold", market2: "Silver", correlation: 0.88, correlationChange: 0.01, stability: 91, csm: 82 }
]

const correlationMatrix: CorrelationMatrix[] = [
  { market: "S&P 500", correlations: { "S&P 500": 1.00, "Bonds": -0.65, "Gold": -0.25, "Oil": 0.45, "USD": -0.15, "BTC": 0.35 } },
  { market: "Bonds", correlations: { "S&P 500": -0.65, "Bonds": 1.00, "Gold": 0.12, "Oil": -0.28, "USD": 0.45, "BTC": -0.42 } },
  { market: "Gold", correlations: { "S&P 500": -0.25, "Bonds": 0.12, "Gold": 1.00, "Oil": 0.18, "USD": -0.35, "BTC": 0.28 } },
  { market: "Oil", correlations: { "S&P 500": 0.45, "Bonds": -0.28, "Gold": 0.18, "Oil": 1.00, "USD": -0.52, "BTC": 0.15 } },
  { market: "USD", correlations: { "S&P 500": -0.15, "Bonds": 0.45, "Gold": -0.35, "Oil": -0.52, "USD": 1.00, "BTC": -0.68 } },
  { market: "BTC", correlations: { "S&P 500": 0.35, "Bonds": -0.42, "Gold": 0.28, "Oil": 0.15, "USD": -0.68, "BTC": 1.00 } }
]

const correlationTrends: CorrelationTrend[] = [
  { period: "1D", sp500_bonds: -0.65, sp500_gold: -0.25, sp500_oil: 0.45, usd_eur: -0.85, btc_eth: 0.92 },
  { period: "1W", sp500_bonds: -0.58, sp500_gold: -0.18, sp500_oil: 0.52, usd_eur: -0.82, btc_eth: 0.89 },
  { period: "1M", sp500_bonds: -0.45, sp500_gold: -0.08, sp500_oil: 0.38, usd_eur: -0.78, btc_eth: 0.85 },
  { period: "3M", sp500_bonds: -0.32, sp500_gold: 0.05, sp500_oil: 0.25, usd_eur: -0.72, btc_eth: 0.82 },
  { period: "6M", sp500_bonds: -0.25, sp500_gold: 0.12, sp500_oil: 0.18, usd_eur: -0.68, btc_eth: 0.78 },
  { period: "1Y", sp500_bonds: -0.18, sp500_gold: 0.15, sp500_oil: 0.12, usd_eur: -0.65, btc_eth: 0.75 }
]

export function CorrelationPulseDashboard() {
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([])
  const [currentCorrelation, setCurrentCorrelation] = useState<CorrelationData | null>(null)
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    const mockData = generateMockCorrelationData()
    setCorrelationData(mockData)
    setCurrentCorrelation(mockData[mockData.length - 1])
  }, [])

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.7) return "text-green-600"
    if (correlation > 0.3) return "text-blue-600"
    if (correlation > -0.3) return "text-gray-600"
    if (correlation > -0.7) return "text-orange-600"
    return "text-red-600"
  }

  const getCorrelationLabel = (correlation: number) => {
    if (correlation > 0.7) return "Strong Positive"
    if (correlation > 0.3) return "Moderate Positive"
    if (correlation > -0.3) return "Weak"
    if (correlation > -0.7) return "Moderate Negative"
    return "Strong Negative"
  }

  const getCSMColor = (csm: number) => {
    if (csm > 70) return "text-red-600"
    if (csm > 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getCorrelationIcon = (correlation: number) => {
    if (Math.abs(correlation) > 0.7) return correlation > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getStabilityColor = (stability: number) => {
    if (stability > 80) return "text-green-600"
    if (stability > 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (!currentCorrelation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading correlation data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Correlation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSM Score</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCSMColor(currentCorrelation.csm)}`}>
              {currentCorrelation.csm.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              <span>Correlation Stress</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Correlation</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCorrelationColor(currentCorrelation.correlation)}`}>
              {currentCorrelation.correlation.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getCorrelationIcon(currentCorrelation.correlation)}
              <span>{getCorrelationLabel(currentCorrelation.correlation)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correlation Change</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentCorrelation.correlationChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentCorrelation.correlationChange > 0 ? '+' : ''}{(currentCorrelation.correlationChange * 100).toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {currentCorrelation.correlationChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>24h Change</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stability</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStabilityColor(currentCorrelation.stability)}`}>
              {currentCorrelation.stability.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Relationship Stability</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divergence</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.abs(currentCorrelation.correlationChange) > 0.05 ? 'High' : 'Low'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Breakout Risk</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="pairs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pairs">Correlation Pairs</TabsTrigger>
          <TabsTrigger value="matrix">Correlation Matrix</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="divergence">Divergence Analysis</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="pairs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Correlation Pairs</CardTitle>
              <CardDescription>Major inter-market relationships and their current states</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={correlationPairs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="market1" />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'correlation' ? value.toFixed(2) :
                      name === 'correlationChange' ? (value * 100).toFixed(1) + '%' :
                      name === 'stability' ? value.toFixed(1) + '%' :
                      name === 'csm' ? value.toFixed(1) : value,
                      name === 'correlation' ? 'Correlation' :
                      name === 'correlationChange' ? 'Change %' :
                      name === 'stability' ? 'Stability %' :
                      name === 'csm' ? 'CSM' : name
                    ]}
                    labelFormatter={(value, payload) => `${value} ↔ ${payload?.[0]?.payload?.market2}`}
                  />
                  <Bar dataKey="correlation" fill="#8b5cf6" name="Correlation" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {correlationPairs.map((pair, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{pair.market1} ↔ {pair.market2}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Correlation</span>
                      <span className={`font-medium ${getCorrelationColor(pair.correlation)}`}>
                        {pair.correlation.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={Math.abs(pair.correlation) * 50} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Change</span>
                      <span className={pair.correlationChange > 0 ? "text-green-600" : "text-red-600"}>
                        {pair.correlationChange > 0 ? "+" : ""}{(pair.correlationChange * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Stability</span>
                      <span className={getStabilityColor(pair.stability)}>
                        {pair.stability.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">CSM</span>
                      <span className={getCSMColor(pair.csm)}>
                        {pair.csm.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Matrix</CardTitle>
              <CardDescription>Heatmap showing correlations between all major markets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left font-medium text-sm">Market</th>
                      {correlationMatrix.map((item) => (
                        <th key={item.market} className="border p-2 text-center font-medium text-xs">
                          {item.market}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationMatrix.map((row) => (
                      <tr key={row.market}>
                        <td className="border p-2 font-medium text-sm">{row.market}</td>
                        {correlationMatrix.map((col) => {
                          const correlation = row.correlations[col.market]
                          const bgColor = correlation > 0.7 ? 'bg-green-100' :
                                         correlation > 0.3 ? 'bg-blue-100' :
                                         correlation > -0.3 ? 'bg-gray-100' :
                                         correlation > -0.7 ? 'bg-orange-100' : 'bg-red-100'
                          const textColor = getCorrelationColor(correlation)
                          
                          return (
                            <td key={col.market} className={`border p-2 text-center ${bgColor}`}>
                              <span className={`text-sm font-medium ${textColor}`}>
                                {correlation.toFixed(2)}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Correlation Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 rounded" />
                      <span className="text-sm">Strong Positive (&gt;0.7)</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">High Sync</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-100 rounded" />
                      <span className="text-sm">Moderate Positive (0.3-0.7)</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">Moderate Sync</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-100 rounded" />
                      <span className="text-sm">Weak (-0.3-0.3)</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Low Sync</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-100 rounded" />
                      <span className="text-sm">Moderate Negative (-0.7--0.3)</span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">Inverse</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 rounded" />
                      <span className="text-sm">Strong Negative (&lt;-0.7)</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">Strong Inverse</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Key Relationships</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link className="h-4 w-4 text-green-600" />
                      <span className="text-sm">S&P 500 ↔ Tech Stocks</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Strong Sync
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Unlink className="h-4 w-4 text-red-600" />
                      <span className="text-sm">S&P 500 ↔ Bonds</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Strong Inverse
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link className="h-4 w-4 text-green-600" />
                      <span className="text-sm">BTC ↔ ETH</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Strong Sync
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Unlink className="h-4 w-4 text-red-600" />
                      <span className="text-sm">USD ↔ BTC</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Strong Inverse
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Correlation Trends</CardTitle>
              <CardDescription>Correlation evolution across different time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={correlationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip formatter={(value: number) => [value.toFixed(2), 'Correlation']} />
                  <Line type="monotone" dataKey="sp500_bonds" stroke="#ef4444" strokeWidth={2} name="S&P 500 ↔ Bonds" />
                  <Line type="monotone" dataKey="sp500_gold" stroke="#f59e0b" strokeWidth={2} name="S&P 500 ↔ Gold" />
                  <Line type="monotone" dataKey="sp500_oil" stroke="#10b981" strokeWidth={2} name="S&P 500 ↔ Oil" />
                  <Line type="monotone" dataKey="usd_eur" stroke="#3b82f6" strokeWidth={2} name="USD ↔ EUR" />
                  <Line type="monotone" dataKey="btc_eth" stroke="#8b5cf6" strokeWidth={2} name="BTC ↔ ETH" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                    <p className="text-muted-foreground">
                      S&P 500 ↔ Bonds correlation strengthening (more negative) indicating flight to safety patterns
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                    <p className="text-muted-foreground">
                      S&P 500 ↔ Gold correlation becoming less negative, suggesting reduced safe-haven demand
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <p className="text-muted-foreground">
                      BTC ↔ ETH maintaining strong positive correlation, indicating crypto market cohesion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Period Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1D vs 1Y Change</span>
                    <span className="text-red-600">S&P/Bonds: -47%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1D vs 1Y Change</span>
                    <span className="text-yellow-600">S&P/Gold: -40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1D vs 1Y Change</span>
                    <span className="text-green-600">S&P/Oil: +275%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1D vs 1Y Change</span>
                    <span className="text-blue-600">USD/EUR: -31%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="divergence" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Divergence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-muted-foreground">Critical Pairs</div>
                  <Progress value={75} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Moderate Divergence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">5</div>
                  <div className="text-sm text-muted-foreground">Watch Pairs</div>
                  <Progress value={50} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-muted-foreground">Normal Pairs</div>
                  <Progress value={25} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Breakout Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">35%</div>
                  <div className="text-sm text-muted-foreground">Overall Risk</div>
                  <Progress value={35} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Divergence Analysis</CardTitle>
              <CardDescription>Markets showing significant correlation breakdown or strengthening</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-600">Breaking Down</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span>S&P 500 ↔ Oil</span>
                        <Badge variant="destructive">-12%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span>USD ↔ EUR</span>
                        <Badge variant="destructive">-3%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span>US Stocks ↔ EU Stocks</span>
                        <Badge variant="destructive">-8%</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">Strengthening</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span>S&P 500 ↔ Bonds</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">-5%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span>S&P 500 ↔ Gold</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">+8%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span>Tech ↔ Growth Stocks</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">+5%</Badge>
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
              <CardTitle>Correlation Analysis</CardTitle>
              <CardDescription>Comprehensive correlation insights and market relationship analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Correlation State</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Market correlations are currently in a <span className="font-medium text-yellow-600">transition phase</span> with 
                      a CSM score of {currentCorrelation.csm.toFixed(1)}. Average correlation is 
                      <span className="font-medium text-blue-600"> moderate</span> at {currentCorrelation.correlation.toFixed(2)}, 
                      indicating mixed market relationships.
                    </p>
                    <p className="text-muted-foreground">
                      Several key pairs are showing significant divergence, suggesting potential 
                      regime changes or structural shifts in market dynamics.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Key Signals</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        S&P 500 ↔ Oil correlation breaking down, suggesting decoupling of economic growth and energy markets
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        USD ↔ EUR maintaining strong negative correlation, indicating persistent currency market stress
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Crypto markets showing high internal correlation, suggesting sector-wide sentiment dominance
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
                        <div className="text-lg font-bold text-yellow-600">Diversification</div>
                        <div className="text-sm text-muted-foreground">Strategy</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Focus on low-correlation assets
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">Hedging</div>
                        <div className="text-sm text-muted-foreground">Opportunity</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Utilize inverse correlations
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">Risk</div>
                        <div className="text-sm text-muted-foreground">Level</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Monitor breakdown signals
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