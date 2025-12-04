"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  GitBranch, 
  ArrowLeftRight, 
  Shield, 
  Zap,
  Activity,
  Star,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Play,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "Sentiment Pulse",
      description: "Real-time market sentiment analysis across news, social media, and analyst ratings"
    },
    {
      icon: TrendingUp,
      title: "Volatility Pulse",
      description: "Advanced volatility forecasting with pressure indicators and expansion metrics"
    },
    {
      icon: DollarSign,
      title: "Liquidity Pulse",
      description: "Capital flow tracking, ETF movements, and market depth analysis"
    },
    {
      icon: GitBranch,
      title: "Correlation Pulse",
      description: "Inter-market relationship visualization and correlation stress monitoring"
    },
    {
      icon: ArrowLeftRight,
      title: "Flow Pulse",
      description: "Smart money vs retail flow tracking with sector rotation analysis"
    },
    {
      icon: Shield,
      title: "Risk Pulse",
      description: "Systemic stress detection and comprehensive risk factor monitoring"
    },
    {
      icon: Zap,
      title: "Momentum Pulse",
      description: "Multi-timeframe trend dynamics and probability mapping"
    },
    {
      icon: Activity,
      title: "Market Pulse Synthesizer",
      description: "Composite MPI calculation with weighted pulse convergence"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Portfolio Manager",
      content: "Market Pulse Engine has transformed how we analyze markets. The real-time insights give us a significant edge.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Day Trader",
      content: "The AI-powered analysis combined with pulse indicators has improved my trading accuracy by 40%.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Investment Analyst",
      content: "Finally, a platform that combines traditional analysis with cutting-edge AI. Game-changing!",
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individual traders",
      features: [
        "Real-time pulse data",
        "Basic AI analysis",
        "5 watchlists",
        "Email alerts",
        "Mobile app access"
      ],
      popular: false,
      cta: "Get Started"
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "For serious traders and analysts",
      features: [
        "All Starter features",
        "Advanced AI insights",
        "Unlimited watchlists",
        "Push notifications",
        "API access",
        "Historical data analysis",
        "Custom alerts"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For teams and institutions",
      features: [
        "All Professional features",
        "Team collaboration",
        "White-label options",
        "Priority support",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Market Pulse Engine</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Market Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Transform Your Trading with
            <br />
            <span className="text-primary">Market Pulse Intelligence</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Harness the power of AI-driven pulse indicators, real-time market analysis, and predictive insights 
            to make smarter trading decisions and stay ahead of the market.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>10,000+ Active Traders</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>$2B+ Analyzed Daily</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>4.9/5 User Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Eight Powerful Pulse Indicators
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive suite of pulse indicators provides 360-degree market visibility
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Traders Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your trading style and goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of traders who are already using Market Pulse Engine to gain a competitive edge
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/signup">
                <Button size="lg">
                  Start Your 14-Day Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Cancel anytime • Full access to all features
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Market Pulse Engine</span>
            </div>
            <div className="text-center md:text-left text-muted-foreground">
              <p>&copy; 2024 Market Pulse Engine. All rights reserved.</p>
              <p className="text-sm mt-1">
                <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                {' • '}
                <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}