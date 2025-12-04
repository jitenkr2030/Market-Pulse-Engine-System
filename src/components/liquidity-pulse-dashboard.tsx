"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Layers,
  Target,
  Zap,
  Wallet
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts"

interface LiquidityData {
  timestamp: string
  lms: number
  etfFlow: number
  volume: number
  bidAskSpread: number
  depth: number
  inflows: number
  outflows: number
  netFlow: number
}

interface ETFData {
  symbol: string
  name: string
  flow: number
  flowChange: number
  assets: number
  volume: number
}

interface SectorFlow {
  sector: string
  flow: number
  flowChange: number
  marketCap: number
}

interface MarketDepth {
  level: string
  bidSize: number
  bidPrice: number
  askPrice: number
  askSize: number
}

const generateMockLiquidityData = (): LiquidityData[] => {
  const data: LiquidityData[] = []
  const now = Date.now()
  
  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now - i * 30 * 60 * 1000).toISOString()
    const baseFlow = Math.sin(i * 0.1) * 50
    data.push({
      timestamp,
      lms: Math.random() * 40 + 40 + (i > 24 ? 10 : -5),
      etfFlow: baseFlow + Math.random() * 20,
      volume: 1000000 + Math.random() * 500000 + (i > 12 ? 200000 : -100000),
      bidAskSpread: 0.1 + Math.random() * 0.05,
      depth: 50000 + Math.random() * 20000,
      inflows: Math.max(0, baseFlow + Math.random() * 30),
      outflows: Math.max(0, -baseFlow + Math.random() * 30),
      netFlow: baseFlow + Math.random() * 20
    })
  }
  
  return data
}

const etfData: ETFData[] = [
  { symbol: "SPY", name: "SPDR S&P 500", flow: 1250, flowChange: 5.2, assets: 450000, volume: 85000000 },
  { symbol: "QQQ", name: "Invesco QQQ", flow: 890, flowChange: 3.8, assets: 220000, volume: 45000000 },
  { symbol: "IWM", name: "iShares Russell 2000", flow: -320, flowChange: -2.1, assets: 68000, volume: 28000000 },
  { symbol: "DIA", name: "SPDR Dow Jones", flow: 450, flowChange: 1.9, assets: 35000, volume: 15000000 },
  { symbol: "VTI", name: "Vanguard Total Stock", flow: 680, flowChange: 4.5, assets: 280000, volume: 32000000 },
  { symbol: "GLD", name: "SPDR Gold Shares", flow: -180, flowChange: -1.2, assets: 75000, volume: 18000000 }
]

const sectorFlowData: SectorFlow[] = [
  { sector: "Technology", flow: 2500, flowChange: 8.5, marketCap: 12000000 },
  { sector: "Healthcare", flow: 1200, flowChange: 3.2, marketCap: 4500000 },
  { sector: "Financials", flow: -800, flowChange: -2.8, marketCap: 3200000 },
  { sector: "Consumer Discretionary", flow: 650, flowChange: 2.1, marketCap: 2800000 },
  { sector: "Energy", flow: -450, flowChange: -3.5, marketCap: 1800000 },
  { sector: "Industrial", flow: 320, flowChange: 1.8, marketCap: 2100000 }
]

const marketDepthData: MarketDepth[] = [
  { level: "L1", bidSize: 15000, bidPrice: 100.00, askPrice: 100.01, askSize: 12000 },
  { level: "L2", bidSize: 25000, bidPrice: 99.99, askPrice: 100.02, askSize: 18000 },
  { level: "L3", bidSize: 35000, bidPrice: 99.98, askPrice: 100.03, askSize: 22000 },
  { level: "L4", bidSize: 45000, bidPrice: 99.97, askPrice: 100.04, askSize: 28000 },
  { level: "L5", bidSize: 55000, bidPrice: 99.96, askPrice: 100.05, askSize: 35000 }
]

const liquidityDistribution = [
  { name: "ETFs", value: 45, color: "#3b82f6" },
  { name: "Mutual Funds", value: 25, color: "#8b5cf6" },
  { name: "Institutions", value: 20, color: "#10b981" },
  { name: "Retail", value: 10, color: "#f59e0b" }
]

export function LiquidityPulseDashboard() {
  const [liquidityData, setLiquidityData] = useState<LiquidityData[]>([])
  const [currentLiquidity, setCurrentLiquidity] = useState<LiquidityData | null>(null)
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    const mockData = generateMockLiquidityData()
    setLiquidityData(mockData)
    setCurrentLiquidity(mockData[mockData.length - 1])
  }, [])

  const getLiquidityColor = (score: number) => {
    if (score > 70) return "text-green-600"
    if (score > 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getLiquidityLabel = (score: number) => {
    if (score > 70) return "Strong"
    if (score > 40) return "Moderate"
    return "Weak"
  }

  const getFlowColor = (flow: number) => {
    if (flow > 0) return "text-green-600"
    if (flow < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getFlowIcon = (flow: number) => {
    if (flow > 0) return <ArrowUpRight className="h-4 w-4" />
    if (flow < 0) return <ArrowDownRight className="h-4 w-4" />
    return <ArrowLeftRight className="h-4 w-4" />
  }

  if (!currentLiquidity) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading liquidity data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Liquidity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LMS Score</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getLiquidityColor(currentLiquidity.lms)}`}>
              {currentLiquidity.lms.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{getLiquidityLabel(currentLiquidity.lms)} Momentum</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETF Flow</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getFlowColor(currentLiquidity.etfFlow)}`}>
              {currentLiquidity.etfFlow > 0 ? '+' : ''}{currentLiquidity.etfFlow.toFixed(0)}M
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getFlowIcon(currentLiquidity.etfFlow)}
              <span>Net ETF flow</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${(currentLiquidity.volume / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Trading volume</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bid-Ask Spread</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentLiquidity.bidAskSpread.toFixed(2)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Market tightness</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Depth</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(currentLiquidity.depth / 1000).toFixed(0)}K
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Available liquidity</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="flows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="flows">Capital Flows</TabsTrigger>
          <TabsTrigger value="etfs">ETF Analysis</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="depth">Market Depth</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capital Flow Trends</CardTitle>
              <CardDescription>24-hour capital inflows, outflows, and net flow movements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={liquidityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      name === 'inflows' || name === 'outflows' || name === 'netFlow' ? `$${(value / 1000000).toFixed(1)}M` : value.toFixed(1),
                      name === 'inflows' ? 'Inflows' :
                      name === 'outflows' ? 'Outflows' :
                      name === 'netFlow' ? 'Net Flow' :
                      name === 'lms' ? 'LMS' : name
                    ]}
                  />
                  <Area type="monotone" dataKey="inflows" stackId="1" fill="#10b981" fillOpacity={0.6} stroke="#10b981" name="Inflows" />
                  <Area type="monotone" dataKey="outflows" stackId="1" fill="#ef4444" fillOpacity={0.6} stroke="#ef4444" name="Outflows" />
                  <Line type="monotone" dataKey="netFlow" stroke="#3b82f6" strokeWidth={3} name="Net Flow" />
                  <Line type="monotone" dataKey="lms" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="LMS" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Capital Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getFlowColor(currentLiquidity.netFlow)}`}>
                    {currentLiquidity.netFlow > 0 ? '+' : ''}${(currentLiquidity.netFlow / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">24h Net Flow</div>
                  <Progress value={Math.abs(currentLiquidity.netFlow) / 10} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Flow Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentLiquidity.inflows > 0 ? (currentLiquidity.inflows / (currentLiquidity.inflows + currentLiquidity.outflows) * 100).toFixed(1) : '0'}%
                  </div>
                  <div className="text-sm text-muted-foreground">Inflow / Total</div>
                  <Progress value={currentLiquidity.inflows > 0 ? (currentLiquidity.inflows / (currentLiquidity.inflows + currentLiquidity.outflows) * 100) : 0} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Liquidity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getLiquidityColor(currentLiquidity.lms)}`}>
                    {currentLiquidity.lms.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">LMS Score</div>
                  <Progress value={currentLiquidity.lms} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="etfs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ETF Flow Analysis</CardTitle>
              <CardDescription>Top ETF flows and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={etfData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="symbol" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'flow' ? (value > 0 ? '+$' : '$') + value.toFixed(0) + 'M' : 
                      name === 'flowChange' ? (value > 0 ? '+' : '') + value.toFixed(1) + '%' :
                      name === 'assets' ? '$' + (value / 1000).toFixed(0) + 'B' :
                      name === 'volume' ? (value / 1000000).toFixed(0) + 'M' : value,
                      name === 'flow' ? 'Flow' :
                      name === 'flowChange' ? 'Change %' :
                      name === 'assets' ? 'Assets' :
                      name === 'volume' ? 'Volume' : name
                    ]}
                  />
                  <Bar dataKey="flow" fill="#3b82f6" name="Flow" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {etfData.map((etf) => (
              <Card key={etf.symbol}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{etf.symbol}</CardTitle>
                  <CardDescription className="text-xs">{etf.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Flow</span>
                      <span className={`font-medium ${getFlowColor(etf.flow)}`}>
                        {etf.flow > 0 ? '+' : ''}${etf.flow.toFixed(0)}M
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Change</span>
                      <span className={`text-xs ${etf.flowChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {etf.flowChange > 0 ? '+' : ''}{etf.flowChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assets</span>
                      <span className="text-xs">${(etf.assets / 1000).toFixed(0)}B</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Volume</span>
                      <span className="text-xs">${(etf.volume / 1000000).toFixed(0)}M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sector Capital Flows</CardTitle>
              <CardDescription>Sector-wise capital allocation and rotation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sectorFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'flow' ? (value > 0 ? '+$' : '$') + value.toFixed(0) + 'M' : 
                      name === 'flowChange' ? (value > 0 ? '+' : '') + value.toFixed(1) + '%' :
                      name === 'marketCap' ? '$' + (value / 1000000).toFixed(0) + 'B' : value,
                      name === 'flow' ? 'Flow' :
                      name === 'flowChange' ? 'Change %' :
                      name === 'marketCap' ? 'Market Cap' : name
                    ]}
                  />
                  <Bar dataKey="flow" fill="#8b5cf6" name="Flow" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorFlowData.map((sector) => (
              <Card key={sector.sector}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{sector.sector}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Flow</span>
                      <span className={`font-medium ${getFlowColor(sector.flow)}`}>
                        {sector.flow > 0 ? '+' : ''}${sector.flow.toFixed(0)}M
                      </span>
                    </div>
                    <Progress value={Math.abs(sector.flow) / 50} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Change</span>
                      <span className={sector.flowChange > 0 ? "text-green-600" : "text-red-600"}>
                        {sector.flowChange > 0 ? "+" : ""}{sector.flowChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span>${(sector.marketCap / 1000000).toFixed(0)}B</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="depth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Depth</CardTitle>
              <CardDescription>Order book depth and liquidity at different price levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={marketDepthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'bidSize' || name === 'askSize' ? value.toFixed(0) : '$' + value.toFixed(2),
                      name === 'bidSize' ? 'Bid Size' :
                      name === 'askSize' ? 'Ask Size' :
                      name === 'bidPrice' ? 'Bid Price' :
                      name === 'askPrice' ? 'Ask Price' : name
                    ]}
                  />
                  <Bar dataKey="bidSize" fill="#10b981" name="Bid Size" />
                  <Bar dataKey="askSize" fill="#ef4444" name="Ask Size" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Liquidity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={liquidityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {liquidityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {liquidityDistribution.map((item) => (
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
                <CardTitle className="text-sm font-medium">Market Depth Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketDepthData.map((level) => (
                    <div key={level.level} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{level.level}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-green-600">{level.bidSize.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">@ ${level.bidPrice}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Spread</div>
                          <div className="text-xs">{((level.askPrice - level.bidPrice) / level.bidPrice * 100).toFixed(2)}%</div>
                        </div>
                        <div className="text-left">
                          <div className="text-red-600">{level.askSize.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">@ ${level.askPrice}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liquidity Analysis</CardTitle>
              <CardDescription>Comprehensive liquidity insights and market structure analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Liquidity State</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Market liquidity is currently <span className="font-medium text-green-600">strong</span> with 
                      an LMS score of {currentLiquidity.lms.toFixed(1)}. Capital flows show 
                      <span className="font-medium text-green-600"> net inflows</span> of ${(currentLiquidity.netFlow / 1000000).toFixed(1)}M, 
                      indicating healthy market participation.
                    </p>
                    <p className="text-muted-foreground">
                      ETF flows are positive with Technology and Healthcare sectors leading inflows, 
                      while Energy and Financials show modest outflows, suggesting sector rotation.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Key Indicators</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Strong market depth with tight bid-ask spreads indicates efficient price discovery
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        ETF inflows suggest institutional confidence and retail participation
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Sector rotation patterns indicate shifting market preferences
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Liquidity Forecast</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">Improving</div>
                        <div className="text-sm text-muted-foreground">1-2 hours</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Probability: 75%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">Stable</div>
                        <div className="text-sm text-muted-foreground">2-4 hours</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Probability: 80%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">Elevated</div>
                        <div className="text-sm text-muted-foreground">4-6 hours</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Probability: 35%
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