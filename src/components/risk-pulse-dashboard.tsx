"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  AlertCircle,
  BarChart3,
  PieChart,
  Target,
  Zap,
  RefreshCw,
  Eye,
  Thermometer,
  Gauge
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart as RechartsPieChart, Pie, Cell } from "recharts"

interface RiskData {
  timestamp: string
  rtm: number
  leverage: number
  fundingStress: number
  volatilitySync: number
  liquidityConcentration: number
}

interface RiskFactor {
  name: string
  value: number
  max: number
  trend: 'up' | 'down' | 'stable'
  description: string
}

interface SystemRisk {
  market: string
  riskLevel: number
  riskChange: number
  primaryRisk: string
  secondaryRisk: string
}

interface StressTest {
  scenario: string
  probability: number
  impact: number
  riskScore: number
}

const generateMockRiskData = (): RiskData[] => {
  const data: RiskData[] = []
  const now = Date.now()
  
  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now - i * 30 * 60 * 1000).toISOString()
    const baseRisk = 30 + Math.sin(i * 0.05) * 20
    data.push({
      timestamp,
      rtm: Math.random() * 40 + 30 + (i > 24 ? 10 : -5),
      leverage: Math.random() * 30 + 40,
      fundingStress: Math.random() * 25 + 25,
      volatilitySync: Math.random() * 35 + 30,
      liquidityConcentration: Math.random() * 20 + 30
    })
  }
  
  return data
}

const riskFactors: RiskFactor[] = [
  { name: "Market Leverage", value: 65, max: 100, trend: 'up', description: "Overall market leverage levels" },
  { name: "Funding Stress", value: 42, max: 100, trend: 'stable', description: "Short-term funding market conditions" },
  { name: "Volatility Sync", value: 58, max: 100, trend: 'up', description: "Cross-asset volatility correlation" },
  { name: "Liquidity Risk", value: 38, max: 100, trend: 'down', description: "Market liquidity concentration risk" },
  { name: "Credit Risk", value: 45, max: 100, trend: 'stable', description: "Credit spread and default risk" },
  { name: "Geopolitical", value: 52, max: 100, trend: 'up', description: "Geopolitical event risk" }
]

const systemRisk: SystemRisk[] = [
  { market: "Equities", riskLevel: 48, riskChange: 5.2, primaryRisk: "Valuation", secondaryRisk: "Liquidity" },
  { market: "Bonds", riskLevel: 35, riskChange: -2.1, primaryRisk: "Interest Rates", secondaryRisk: "Inflation" },
  { market: "Crypto", riskLevel: 72, riskChange: 8.7, primaryRisk: "Regulation", secondaryRisk: "Leverage" },
  { market: "Commodities", riskLevel: 56, riskChange: 3.8, primaryRisk: "Supply Chain", secondaryRisk: "Demand" },
  { market: "FX", riskLevel: 41, riskChange: -1.5, primaryRisk: "Central Banks", secondaryRisk: "Geopolitics" },
  { market: "Real Estate", riskLevel: 63, riskChange: 6.2, primaryRisk: "Rates", secondaryRisk: "Liquidity" }
]

const stressTests: StressTest[] = [
  { scenario: "Rate Shock (+100bps)", probability: 25, impact: 75, riskScore: 68 },
  { scenario: "Liquidity Crisis", probability: 15, impact: 95, riskScore: 82 },
  { scenario: "Geopolitical Event", probability: 30, impact: 60, riskScore: 58 },
  { scenario: "Credit Event", probability: 20, impact: 80, riskScore: 71 },
  { scenario: "Market Crash", probability: 10, impact: 100, riskScore: 89 }
]

const riskDistribution = [
  { name: "Low Risk", value: 25, color: "#10b981" },
  { name: "Medium Risk", value: 45, color: "#f59e0b" },
  { name: "High Risk", value: 25, color: "#ef4444" },
  { name: "Critical", value: 5, color: "#7c3aed" }
]

export function RiskPulseDashboard() {
  const [riskData, setRiskData] = useState<RiskData[]>([])
  const [currentRisk, setCurrentRisk] = useState<RiskData | null>(null)
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    const mockData = generateMockRiskData()
    setRiskData(mockData)
    setCurrentRisk(mockData[mockData.length - 1])
  }, [])

  const getRiskColor = (score: number) => {
    if (score > 80) return "text-red-600"
    if (score > 60) return "text-orange-600"
    if (score > 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getRiskLabel = (score: number) => {
    if (score > 80) return "Critical"
    if (score > 60) return "High"
    if (score > 40) return "Moderate"
    return "Low"
  }

  const getRiskIcon = (score: number) => {
    if (score > 80) return <AlertCircle className="h-4 w-4" />
    if (score > 60) return <AlertTriangle className="h-4 w-4" />
    if (score > 40) return <Shield className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />
      case 'down': return <TrendingDown className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return "text-red-600"
      case 'down': return "text-green-600"
      default: return "text-gray-600"
    }
  }

  if (!currentRisk) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading risk data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTM Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(currentRisk.rtm)}`}>
              {currentRisk.rtm.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getRiskIcon(currentRisk.rtm)}
              <span>{getRiskLabel(currentRisk.rtm)} Risk</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(currentRisk.leverage)}`}>
              {currentRisk.leverage.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Market Leverage</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(currentRisk.fundingStress)}`}>
              {currentRisk.fundingStress.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Funding Stress</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vol Sync</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(currentRisk.volatilitySync)}`}>
              {currentRisk.volatilitySync.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Volatility Sync</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidity</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(currentRisk.liquidityConcentration)}`}>
              {currentRisk.liquidityConcentration.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Concentration</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Risk Overview</TabsTrigger>
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="systemic">Systemic Risk</TabsTrigger>
          <TabsTrigger value="stresstests">Stress Tests</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Temperature Map</CardTitle>
              <CardDescription>Real-time systemic risk monitoring across all markets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      value.toFixed(1) + '%',
                      name === 'rtm' ? 'RTM' :
                      name === 'leverage' ? 'Leverage' :
                      name === 'fundingStress' ? 'Funding Stress' :
                      name === 'volatilitySync' ? 'Volatility Sync' :
                      name === 'liquidityConcentration' ? 'Liquidity Concentration' : name
                    ]}
                  />
                  <Area type="monotone" dataKey="rtm" stackId="1" fill="#ef4444" fillOpacity={0.6} stroke="#ef4444" name="RTM" />
                  <Area type="monotone" dataKey="leverage" stackId="1" fill="#f59e0b" fillOpacity={0.6} stroke="#f59e0b" name="Leverage" />
                  <Area type="monotone" dataKey="fundingStress" stackId="1" fill="#8b5cf6" fillOpacity={0.6} stroke="#8b5cf6" name="Funding Stress" />
                  <Area type="monotone" dataKey="volatilitySync" stackId="1" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" name="Volatility Sync" />
                  <Area type="monotone" dataKey="liquidityConcentration" stackId="1" fill="#10b981" fillOpacity={0.6} stroke="#10b981" name="Liquidity Concentration" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getRiskColor(currentRisk.rtm)}`}>
                    {currentRisk.rtm.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">RTM Score</div>
                  <Progress value={currentRisk.rtm} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {currentRisk.rtm > riskData[riskData.length - 2]?.rtm ? 'Rising' : 'Falling'}
                  </div>
                  <div className="text-sm text-muted-foreground">24h Direction</div>
                  <Progress value={Math.abs(currentRisk.rtm - (riskData[riskData.length - 2]?.rtm || 0)) * 2} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {riskFactors.filter(f => f.value > 60).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Elevated Factors</div>
                  <Progress value={riskFactors.filter(f => f.value > 60).length * 20} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Factor Analysis</CardTitle>
              <CardDescription>Detailed breakdown of individual risk factors</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={riskFactors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toFixed(1) + '%',
                      name === 'value' ? 'Risk Level' : name
                    ]}
                  />
                  <Bar dataKey="value" fill="#ef4444" name="Risk Level" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskFactors.map((factor) => (
              <Card key={factor.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{factor.name}</CardTitle>
                  <CardDescription className="text-xs">{factor.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                      <span className={`font-medium ${getRiskColor(factor.value)}`}>
                        {factor.value.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={factor.value} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Trend</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(factor.trend)}
                        <span className={getTrendColor(factor.trend)}>
                          {factor.trend.charAt(0).toUpperCase() + factor.trend.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={factor.value > 60 ? "destructive" : factor.value > 40 ? "default" : "secondary"}>
                        {getRiskLabel(factor.value)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="systemic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Systemic Risk by Market</CardTitle>
              <CardDescription>Risk levels and primary risk factors across different markets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={systemRisk}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="market" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'riskLevel' ? value.toFixed(1) + '%' :
                      name === 'riskChange' ? (value > 0 ? '+' : '') + value.toFixed(1) + '%' : value,
                      name === 'riskLevel' ? 'Risk Level' :
                      name === 'riskChange' ? 'Change' : name
                    ]}
                  />
                  <Bar dataKey="riskLevel" fill="#ef4444" name="Risk Level" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemRisk.map((market) => (
              <Card key={market.market}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{market.market}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                      <span className={`font-medium ${getRiskColor(market.riskLevel)}`}>
                        {market.riskLevel.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={market.riskLevel} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Change</span>
                      <span className={market.riskChange > 0 ? "text-red-600" : "text-green-600"}>
                        {market.riskChange > 0 ? "+" : ""}{market.riskChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Primary Risk</span>
                      <span className="text-xs">{market.primaryRisk}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Secondary Risk</span>
                      <span className="text-xs">{market.secondaryRisk}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stresstests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stressTests.map((test) => (
              <Card key={test.scenario}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{test.scenario}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Probability</span>
                      <span className="font-medium">{test.probability}%</span>
                    </div>
                    <Progress value={test.probability} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Impact</span>
                      <span className={`font-medium ${getRiskColor(test.impact)}`}>
                        {test.impact}%
                      </span>
                    </div>
                    <Progress value={test.impact} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Score</span>
                      <span className={`font-medium ${getRiskColor(test.riskScore)}`}>
                        {test.riskScore}
                      </span>
                    </div>
                    <Progress value={test.riskScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Overall risk distribution across different severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Risk Categories</h4>
                    <div className="space-y-2">
                      {riskDistribution.map((item) => (
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
                    <h4 className="font-medium mb-3">Key Observations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                        <p className="text-muted-foreground">
                          Moderate risk represents the largest portion at 45%
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                        <p className="text-muted-foreground">
                          High risk areas require immediate attention
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                        <p className="text-muted-foreground">
                          Critical risk scenarios, though low probability, need monitoring
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
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Comprehensive risk assessment and mitigation recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Risk State</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Systemic risk is currently <span className="font-medium text-yellow-600">moderate</span> with 
                      an RTM score of {currentRisk.rtm.toFixed(1)}. Key risk factors include 
                      <span className="font-medium text-orange-600"> elevated leverage</span> and 
                      <span className="font-medium text-blue-600"> increasing volatility synchronization</span> across markets.
                    </p>
                    <p className="text-muted-foreground">
                      Crypto markets show the highest risk levels, while traditional bond markets 
                      remain relatively stable. Funding conditions are tightening but remain manageable.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Key Risk Indicators</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Market leverage reaching concerning levels, suggesting potential vulnerability to shocks
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Cross-asset volatility synchronization increasing, indicating systemic stress
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-muted-foreground">
                        Liquidity concentration improving but remains a concern in crisis scenarios
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Risk Mitigation Strategies</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">De-risk</div>
                        <div className="text-sm text-muted-foreground">Priority</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Reduce exposure to high-risk assets
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">Hedge</div>
                        <div className="text-sm text-muted-foreground">Strategy</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Implement protective positions
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">Monitor</div>
                        <div className="text-sm text-muted-foreground">Action</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Watch risk triggers closely
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