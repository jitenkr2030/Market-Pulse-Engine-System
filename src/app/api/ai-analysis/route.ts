import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { marketId, analysisType, timeframe } = body

    if (!marketId || !analysisType) {
      return NextResponse.json({ error: "Market ID and analysis type are required" }, { status: 400 })
    }

    const market = await db.market.findUnique({
      where: { id: marketId },
    })

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 })
    }

    const zai = await ZAI.create()

    let prompt = ""
    let analysisResult: any = {}

    switch (analysisType) {
      case "sentiment_analysis":
        prompt = `Analyze the current market sentiment for ${market.name} (${market.symbol}). 
        Consider factors like:
        - Recent news and social media sentiment
        - Analyst ratings and recommendations
        - Fear & Greed index implications
        - Market psychology indicators
        
        Provide a comprehensive sentiment analysis with:
        1. Overall sentiment score (-100 to 100)
        2. Key sentiment drivers
        3. Short-term sentiment outlook
        4. Potential sentiment shifts to watch
        
        Format your response as JSON with the following structure:
        {
          "sentimentScore": number,
          "keyDrivers": string[],
          "outlook": "bullish|bearish|neutral",
          "watchFactors": string[],
          "analysis": string
        }`
        break

      case "volatility_forecast":
        prompt = `Generate a volatility forecast for ${market.name} (${market.symbol}) for the ${timeframe || "24h"} timeframe.
        
        Consider:
        - Current volatility levels
        - Historical volatility patterns
        - Market catalysts and events
        - Technical indicators
        - Market structure conditions
        
        Provide a detailed volatility forecast including:
        1. Expected volatility range
        2. Volatility trend direction
        3. Key volatility triggers
        4. Risk scenarios
        
        Format your response as JSON:
        {
          "expectedRange": {
            "low": number,
            "high": number
          },
          "trend": "increasing|decreasing|stable",
          "triggers": string[],
          "scenarios": {
            "base": string,
            "bullish": string,
            "bearish": string
          },
          "analysis": string
        }`
        break

      case "market_prediction":
        prompt = `Generate a market prediction for ${market.name} (${market.symbol}) for the ${timeframe || "next week"}.
        
        Analyze:
        - Current market pulse indicators
        - Technical analysis patterns
        - Market sentiment and psychology
        - Fundamental factors
        - Risk factors and opportunities
        
        Provide a comprehensive market prediction:
        1. Price direction and targets
        2. Confidence level (0-100%)
        3. Key support/resistance levels
        4. Catalysts and risks
        5. Recommended strategy
        
        Format your response as JSON:
        {
          "direction": "bullish|bearish|neutral",
          "confidence": number,
          "priceTargets": {
            "optimistic": number,
            "realistic": number,
            "pessimistic": number
          },
          "levels": {
            "support": number[],
            "resistance": number[]
          },
          "catalysts": string[],
          "risks": string[],
          "strategy": string,
          "analysis": string
        }`
        break

      case "risk_assessment":
        prompt = `Conduct a comprehensive risk assessment for ${market.name} (${market.symbol}).
        
        Evaluate:
        - Market volatility and correlation risks
        - Liquidity and funding risks
        - Systemic and contagion risks
        - Geopolitical and macroeconomic risks
        - Positioning and leverage risks
        
        Provide detailed risk analysis:
        1. Overall risk level (0-100)
        2. Key risk factors
        3. Risk mitigation strategies
        4. Early warning indicators
        
        Format your response as JSON:
        {
          "riskLevel": number,
          "riskFactors": {
            "volatility": number,
            "liquidity": number,
            "systemic": number,
            "macro": number,
            "positioning": number
          },
          "keyRisks": string[],
          "mitigation": string[],
          "warningIndicators": string[],
          "analysis": string
        }`
        break

      default:
        return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 })
    }

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert market analyst with deep knowledge of technical analysis, market psychology, and risk management. Provide accurate, data-driven insights and always format your responses as valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error("No response from AI model")
    }

    try {
      analysisResult = JSON.parse(responseContent)
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError)
      analysisResult = {
        rawResponse: responseContent,
        analysis: "AI analysis completed but response format was unexpected",
      }
    }

    await db.market.create({
      data: {
        name: `${market.name} - ${analysisType}`,
        symbol: `${market.symbol}_${analysisType}`,
        type: "INDEX",
        description: `AI-generated ${analysisType} for ${market.name}`,
      },
    })

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      metadata: {
        marketId,
        analysisType,
        timeframe,
        timestamp: new Date().toISOString(),
        model: "z-ai-web-dev-sdk",
      },
    })
  } catch (error) {
    console.error("Error in AI analysis:", error)
    return NextResponse.json(
      { error: "Failed to perform AI analysis", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get("marketId")

    if (!marketId) {
      return NextResponse.json({ error: "Market ID is required" }, { status: 400 })
    }

    const market = await db.market.findUnique({
      where: { id: marketId },
    })

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 })
    }

    const zai = await ZAI.create()

    const prompt = `Provide a comprehensive market overview for ${market.name} (${market.symbol}).
    
    Include:
    1. Current market status and key metrics
    2. Recent price action and technical patterns
    3. Market sentiment indicators
    4. Volume and liquidity analysis
    5. Key support and resistance levels
    6. Short-term outlook and catalysts to watch
    
    Keep the analysis concise but informative, focusing on the most important factors traders should be aware of right now.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional market analyst providing real-time market insights. Be concise, accurate, and focus on actionable information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    })

    const overview = completion.choices[0]?.message?.content || "Unable to generate market overview"

    return NextResponse.json({
      success: true,
      overview,
      market: {
        id: market.id,
        name: market.name,
        symbol: market.symbol,
        type: market.type,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating market overview:", error)
    return NextResponse.json(
      { error: "Failed to generate market overview", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}