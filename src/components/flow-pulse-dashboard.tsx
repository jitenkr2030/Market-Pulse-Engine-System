"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users,
  Building,
  ShoppingCart,
  PieChart,
  BarChart3,
  Target,
  Zap,
  RefreshCw,
  DollarSign,
  TrendingUp as TrendIcon
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ComposedChart } from "recharts"

interface FlowData {
  timestamp: string
  fds: number
  institutionalFlow: number
  retailFlow: number
  sectorRotation: number
  longPositioning: number
  shortPositioning: number
  netPositioning: number
}

interface SectorFlow {
  sector: string
  institutionalFlow: number
  retailFlow: number
  netFlow: number
  marketCap: number
  rotationScore: number
}

interface AssetClassFlow {
  assetClass: string
  institutional: number
  retail: number
  net: number
  trend: string
}

interface PositioningData {
  asset: string
  longPositioning: number
  shortPositioning: number
  netPositioning: number
  positioningChange: number
}

const generateMockFlowData = (): FlowData[] => {
  const data: FlowData[] = []
  const now = Date.now()
  
  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now - i * 30 * 60 * 1000).toISOString()
    const baseInstFlow = Math.sin(i * 0.08) * 30
    const baseRetailFlow = Math.cos(i * 0.12) * 20
    data.push({
      timestamp,
      fds: Math.random() * 40 + 40 + (i > 24 ? 8 : -5),
      institutionalFlow: baseInstFlow + Math.random() * 15,
      retailFlow: baseRetailFlow + Math.random() * 10,
      sectorRotation: Math.random() * 30 + 35,
      longPositioning: Math.random() * 40 + 45,
      shortPositioning: Math.random() * 30 + 25,
      netPositioning: (baseInstFlow + baseRetailFlow) + Math.random() * 10
    })
  }
  
  return data
}

const sectorFlowData: SectorFlow[] = [
  { sector: "Technology", institutionalFlow: 1250, retailFlow: 320, netFlow: 1570, marketCap: 12000000, rotationScore: 8.5 },
  { sector: "Healthcare", institutionalFlow: 680, retailFlow: 180, netFlow: 860, marketCap: 4500000, rotationScore: 3.2 },
  { sector: "Financials", institutionalFlow: -420, retailFlow: -120, netFlow: -540, marketCap: 3200000, rotationScore: -2.8 },
  { sector: "Consumer Discretionary", institutionalFlow: 380, retailFlow: 150, netFlow: 530, marketCap: 2800000, rotationScore: 2.1 },
  { sector: "Energy", institutionalFlow: -280, retailFlow: -80, netFlow: -360, marketCap: 1800000, rotationScore: -3.5 },
  { sector: "Industrial", institutionalFlow: 220, retailFlow: 90, netFlow: 310, marketCap: 2100000, rotationScore: 1.8 }
]

const assetClassFlowData: AssetClassFlow[] = [
  { assetClass: "Equities", institutional: 2850, retail: 890, net: 3740, trend: "bullish" },
  { assetClass: "Bonds", institutional: -1250, retail: -320, net: -1570, trend: "bearish" },
  { assetClass: "Commodities", institutional: 680, retail: 180, net: 860, trend: "bullish" },
  { assetClass: "Real Estate", institutional: 420, retail: 150, net: 570, trend: "neutral" },
  { assetClass: "Crypto", institutional: 280, retail: 680, net: 960, trend: "bullish" },
  { assetClass: "Cash", institutional: -890, retail: -220, net: -1110, trend: "bearish" }
]

const positioningData: PositioningData[] = [
  { asset: "S&P 500 Futures", longPositioning: 72, shortPositioning: 28, netPositioning: 44, positioningChange: 5.2 },
  { asset: "NASDAQ Futures", longPositioning: 78, shortPositioning: 22, netPositioning: 56, positioningChange: 8.1 },
  { asset: "Treasury Bonds", longPositioning: 35, shortPositioning: 65, netPositioning: -30, positioningChange: -3.8 },
  { asset: "Gold Futures", longPositioning: 68, shortPositioning: 32, netPositioning: 36, positioningChange: 2.4 },
  { asset: "Oil Futures", longPositioning: 45, shortPositioning: 55, netPositioning: -10, positioningChange: -1.2 },
  { asset: "Bitcoin Futures", longPositioning: 82, shortPositioning: 18, netPositioning: 64, positioningChange: 12.5 }
]

const flowDistribution = [
  { name: "Institutional", value: 65, color: "#3b82f6" },
  { name: "Retail", value: 25, color: "#8b5cf6" },
  { name: "Hedge Funds", value: 7, color: "#10b981" },
  { name: "Other", value: 3, color: "#f59e0b" }
]

export function FlowPulseDashboard() {
  const [flowData, setFlowData] = useState<FlowData[]>([])
  const [currentFlow, setCurrentFlow] = useState<FlowData | null>(null)
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    const mockData = generateMockFlowData()
    setFlowData(mockData)
    setCurrentFlow(mockData[mockData.length - 1])
  }, [])

  const getFlowColor = (score: number) => {
    if (score > 70) return "text-green-600"
    if (score > 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getFlowLabel = (score: number) => {
    if (score > 70) return "Strong"
    if (score > 40) return "Moderate"
    return "Weak"
  }

  const getMoneyFlowColor = (flow: number) => {
    if (flow > 0) return "text-green-600"
    if (flow < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getFlowIcon = (flow: number) => {
    if (flow > 0) return <TrendingUp className="h-4 w-4" />
    if (flow < 0) return <TrendingDown className="h-4 w-4" />
    return <ArrowLeftRight className="h-4 w-4" />
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "bullish": return "text-green-600"
      case "bearish": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  if (!currentFlow) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading flow data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Flow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FDS Score</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getFlowColor(currentFlow.fds)}`}>
              {currentFlow.fds.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{getFlowLabel(currentFlow.fds)} Direction</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institutional</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMoneyFlowColor(currentFlow.institutionalFlow)}`}>
              {currentFlow.institutionalFlow > 0 ? '+' : ''}${currentFlow.institutionalFlow.toFixed(0)}M
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getFlowIcon(currentFlow.institutionalFlow)}
              <span>Smart Money Flow</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retail</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMoneyFlowColor(currentFlow.retailFlow)}`}>
              {currentFlow.retailFlow > 0 ? '+' : ''}${currentFlow.retailFlow.toFixed(0)}M
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getFlowIcon(currentFlow.retailFlow)}
              <span>Retail Flow</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sector Rotation</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentFlow.sectorRotation.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Rotation Intensity</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Positioning</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMoneyFlowColor(currentFlow.netPositioning)}`}>
              {currentFlow.netPositioning > 0 ? '+' : ''}{currentFlow.netPositioning.toFixed(0)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getFlowIcon(currentFlow.netPositioning)}
              <span>Net Exposure</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="moneyflow" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="moneyflow">Money Flow</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="assetclasses">Asset Classes</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="moneyflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Money vs Retail Flow</CardTitle>
              <CardDescription>Real-time comparison of institutional and retail capital flows</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={flowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      name === 'institutionalFlow' || name === 'retailFlow' || name === 'netPositioning' ? 
                        (value > 0 ? '+$' : '$') + value.toFixed(0) + 'M' : value.toFixed(1),
                      name === 'institutionalFlow' ? 'Institutional' :
                      name === 'retailFlow' ? 'Retail' :
                      name === 'netPositioning' ? 'Net Positioning' :
                      name === 'fds' ? 'FDS' : name
                    ]}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="institutionalFlow" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" name="Institutional" />
                  <Area yAxisId="left" type="monotone" dataKey="retailFlow" fill="#8b5cf6" fillOpacity={0.3} stroke="#8b5cf6" name="Retail" />
                  <Line yAxisId="right" type="monotone" dataKey="fds" stroke="#10b981" strokeWidth={2} name="FDS" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Smart Money Edge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.abs(currentFlow.institutionalFlow - currentFlow.retailFlow) > 0 ? '+' : ''}{((currentFlow.institutionalFlow - currentFlow.retailFlow) / Math.abs(currentFlow.retailFlow) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Institutional Advantage</div>
                  <Progress value={Math.min(100, Math.abs(currentFlow.institutionalFlow - currentFlow.retailFlow) / 10)} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Flow Divergence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${Math.abs(currentFlow.institutionalFlow - currentFlow.retailFlow) > 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(currentFlow.institutionalFlow - currentFlow.retailFlow) > 50 ? 'High' : 'Low'}
                  </div>
                  <div className="text-sm text-muted-foreground">Divergence Level</div>
                  <Progress value={Math.min(100, Math.abs(currentFlow.institutionalFlow - currentFlow.retailFlow) / 2)} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">FDS Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getFlowColor(currentFlow.fds)}`}>
                    {currentFlow.fds.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Flow Direction</div>
                  <Progress value={currentFlow.fds} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sector Flow Analysis</CardTitle>
              <CardDescription>Institutional and retail flows by sector with rotation scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sectorFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'institutionalFlow' || name === 'retailFlow' || name === 'netFlow' ? 
                        (value > 0 ? '+$' : '$') + value.toFixed(0) + 'M' : value.toFixed(1),
                      name === 'institutionalFlow' ? 'Institutional' :
                      name === 'retailFlow' ? 'Retail' :
                      name === 'netFlow' ? 'Net Flow' :
                      name === 'rotationScore' ? 'Rotation Score' : name
                    ]}
                  />
                  <Bar dataKey="institutionalFlow" fill="#3b82f6" name="Institutional" />
                  <Bar dataKey="retailFlow" fill="#8b5cf6" name="Retail" />
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
                      <span className="text-sm text-muted-foreground">Net Flow</span>
                      <span className={`font-medium ${getMoneyFlowColor(sector.netFlow)}`}>
                        {sector.netFlow > 0 ? '+' : ''}${sector.netFlow.toFixed(0)}M
                      </span>
                    </div>
                    <Progress value={Math.abs(sector.netFlow) / 20} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Institutional</span>
                      <span className={getMoneyFlowColor(sector.institutionalFlow)}>
                        {sector.institutionalFlow > 0 ? '+' : ''}{sector.institutionalFlow.toFixed(0)}M
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Retail</span>
                      <span className={getMoneyFlowColor(sector.retailFlow)}>
                        {sector.retailFlow > 0 ? '+' : ''}{sector.retailFlow.toFixed(0)}M
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Rotation</span>
                      <span className={sector.rotationScore > 0 ? "text-green-600" : "text-red-600"}>
                        {sector.rotationScore > 0 ? "+" : ""}{sector.rotationScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positioning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Positioning</CardTitle>
              <CardDescription>Current positioning across major futures and derivatives markets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={positioningData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toFixed(1) + '%',
                      name === 'longPositioning' ? 'Long Positioning' :
                      name === 'shortPositioning' ? 'Short Positioning' :
                      name === 'netPositioning' ? 'Net Positioning' :
                      name === 'positioningChange' ? 'Change %' : name
                    ]}
                  />
                  <Bar dataKey="longPositioning" fill="#10b981" name="Long Positioning" />
                  <Bar dataKey="shortPositioning" fill="#ef4444" name="Short Positioning" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Positioning Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {positioningData.map((position) => (
                    <div key={position.asset} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{position.asset}</span>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-green-600">{position.longPositioning.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Long</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xs ${position.positioningChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {position.positioningChange > 0 ? '+' : ''}{position.positioningChange.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Change</div>
                        </div>
                        <div className="text-left">
                          <div className="text-red-600">{position.shortPositioning.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Short</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Flow Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={flowDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {flowDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {flowDistribution.map((item) => (
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
          </div>
        </TabsContent>

        <TabsContent value="assetclasses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Class Flows</CardTitle>
              <CardDescription>Capital allocation across different asset classes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={assetClassFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="assetClass" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'institutional' || name === 'retail' || name === 'net' ? 
                        (value > 0 ? '+$' : '$') + value.toFixed(0) + 'M' : value,
                      name === 'institutional' ? 'Institutional' :
                      name === 'retail' ? 'Retail' :
                      name === 'net' ? 'Net Flow' : name
                    ]}
                  />
                  <Bar dataKey="institutional" fill="#3b82f6" name="Institutional" />
                  <Bar dataKey="retail" fill="#8b5cf6" name="Retail" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetClassFlowData.map((asset) => (
              <Card key={asset.assetClass}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{asset.assetClass}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Net Flow</span>
                      <span className={`font-medium ${getMoneyFlowColor(asset.net)}`}>
                        {asset.net > 0 ? '+' : ''}${asset.net.toFixed(0)}M
                      </span>
                    </div>
                    <Progress value={Math.abs(asset.net) / 40} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Institutional</span>
                      <span className={getMoneyFlowColor(asset.institutional)}>
                        {asset.institutional > 0 ? '+' : ''}{asset.institutional.toFixed(0)}M
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Retail</span>
                      <span className={getMoneyFlowColor(asset.retail)}>
                        {asset.retail > 0 ? '+' : ''}{asset.retail.toFixed(0)}M
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Trend</span>
                      <span className={getTrendColor(asset.trend)}>
                        {asset.trend.charAt(0).toUpperCase() + asset.trend.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flow Analysis</CardTitle>
              <CardDescription>Comprehensive flow insights and smart money analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Flow State</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Market flows are currently <span className="font-medium text-green-600">bullish</span> with 
                      an FDS score of {currentFlow.fds.toFixed(1)}. Institutional flows show 
                      <span className="font-medium text-blue-600"> strong buying</span> at ${(currentFlow.institutionalFlow / 1000).toFixed(1)}B, 
                      while retail participation is {(currentFlow.retailFlow > 0 ? 'positive' : 'negative')} at ${(Math.abs(currentFlow.retailFlow) / 1000).toFixed(1)}B.
                    </p>
                    <p className="text-muted-foreground">
                      Sector rotation is active with Technology and Healthcare leading inflows, 
                      while Financials and Energy show outflows, indicating risk-on sentiment.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Smart Money Signals</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Strong institutional buying in equities suggests confidence in economic outlook
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Retail following institutional flows indicates broad market participation
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Sector rotation patterns suggest cyclical market behavior
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
                        <div className="text-lg font-bold text-green-600">Follow Smart</div>
                        <div className="text-sm text-muted-foreground">Strategy</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Align with institutional flows
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">Sector Rotation</div>
                        <div className="text-sm text-muted-foreground">Opportunity</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Capitalize on flow shifts
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">Monitor Divergence</div>
                        <div className="text-sm text-muted-foreground">Risk</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Watch for flow reversals
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