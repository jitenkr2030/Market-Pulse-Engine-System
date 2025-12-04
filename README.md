# 🚀 Market Pulse Engine System

A comprehensive real-time market analysis platform that leverages advanced pulse indicators, AI-powered insights, and WebSocket streaming to provide traders and investors with actionable market intelligence.

## ✨ Features

### 🧠 Core Pulse Indicators
- **Sentiment Pulse**: Real-time market sentiment analysis across news, social media, and analyst ratings
- **Volatility Pulse**: Advanced volatility forecasting with pressure indicators and expansion/compression metrics
- **Liquidity Pulse**: Capital flow tracking, ETF movements, and market depth analysis
- **Correlation Pulse**: Inter-market relationship visualization and correlation stress monitoring
- **Flow Pulse**: Smart money vs retail flow tracking with sector rotation analysis
- **Risk Pulse**: Systemic stress detection and comprehensive risk factor monitoring
- **Momentum Pulse**: Multi-timeframe trend dynamics and probability mapping
- **Market Pulse Synthesizer**: Composite MPI calculation with weighted pulse convergence

### 🤖 AI-Powered Analysis
- **Z.ai Integration**: Advanced market analysis using cutting-edge AI models
- **Predictive Analytics**: Market forecasting and trend prediction
- **Automated Insights**: AI-generated market summaries and recommendations
- **Anomaly Detection**: Intelligent identification of unusual market patterns

### 📱 Real-Time Features
- **WebSocket Streaming**: Real-time pulse data updates and alerts
- **Mobile-Responsive Design**: Touch-friendly interface optimized for all devices
- **Live Dashboards**: Interactive visualizations with real-time data updates
- **Push Notifications**: Instant alerts for significant market events

### 🔧 Advanced Functionality
- **Historical Data Analysis**: Comprehensive analytics and trend identification
- **Customizable Alerts**: Threshold-based monitoring with multiple operators
- **Personalized Dashboards**: User preferences and layout customization
- **Watchlists**: Custom market tracking and portfolio monitoring
- **Data Export**: CSV and JSON export capabilities for analysis

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router for optimal performance
- **TypeScript 5**: Type-safe development with enhanced developer experience
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Modern, accessible component library built on Radix UI
- **Recharts**: Powerful data visualization library for market charts
- **Framer Motion**: Smooth animations and interactive transitions
- **Socket.io Client**: Real-time WebSocket communication

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework for API services
- **Socket.io**: Real-time bidirectional event-based communication
- **Prisma ORM**: Next-generation database toolkit with type safety
- **SQLite**: Lightweight, serverless database for development and production
- **Z.ai Web Dev SDK**: Advanced AI integration for market analysis

### Infrastructure
- **WebSocket Service**: Dedicated real-time data streaming service
- **RESTful APIs**: Comprehensive REST endpoints for data management
- **Database Migrations**: Automated schema management with Prisma
- **Environment Configuration**: Secure configuration management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite (included)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jitenkr2030/Market-Pulse-Engine-System.git
   cd Market-Pulse-Engine-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd mini-services/websocket-service
   npm install
   cd ../..
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Start the development servers**
   
   **Main Application:**
   ```bash
   npm run dev
   ```
   
   **WebSocket Service (in a separate terminal):**
   ```bash
   cd mini-services/websocket-service
   npm run dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - WebSocket service runs on port 3003

## 📊 API Documentation

### Core Endpoints

#### Market Data
- `GET /api/markets` - Fetch all markets
- `POST /api/markets` - Create a new market
- `GET /api/historical-data` - Get historical pulse data with analytics

#### Pulse Data
- `GET /api/sentiment` - Fetch sentiment pulse data
- `POST /api/sentiment` - Create sentiment pulse entry
- `GET /api/volatility` - Fetch volatility pulse data
- `POST /api/volatility` - Create volatility pulse entry
- `GET /api/liquidity` - Fetch liquidity pulse data
- `POST /api/liquidity` - Create liquidity pulse entry
- `GET /api/flow` - Fetch flow pulse data
- `POST /api/flow` - Create flow pulse entry
- `GET /api/risk` - Fetch risk pulse data
- `POST /api/risk` - Create risk pulse entry
- `GET /api/momentum` - Fetch momentum pulse data
- `POST /api/momentum` - Create momentum pulse entry

#### Market Pulse
- `GET /api/pulses` - Fetch composite market pulse data
- `POST /api/pulses` - Calculate and create market pulse
- `PUT /api/pulses` - Update market pulse based on latest data

#### Data Ingestion
- `POST /api/data-ingestion` - Bulk data ingestion for multiple pulse types

#### AI Analysis
- `POST /api/ai-analysis` - Perform AI-powered market analysis
- `GET /api/ai-analysis` - Generate market overview
- `POST /api/ai-pulse-generator` - Generate synthetic pulse data with AI

#### User Management
- `GET /api/auth` - Fetch user data with preferences
- `POST /api/auth` - Create new user account
- `PUT /api/auth` - Update user preferences

#### Alerts & Watchlists
- `GET /api/alerts` - Fetch user alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts` - Update alert status
- `DELETE /api/alerts` - Delete alert
- `GET /api/watchlists` - Fetch user watchlists
- `POST /api/watchlists` - Create new watchlist
- `PUT /api/watchlists` - Update watchlist
- `DELETE /api/watchlists` - Delete watchlist

#### Alert Monitoring
- `POST /api/alert-monitor` - Check and trigger alerts
- `GET /api/alert-monitor` - Get alert system status

### WebSocket Events

#### Client to Server
- `subscribe` - Subscribe to market and pulse updates
- `unsubscribe` - Unsubscribe from updates

#### Server to Client
- `pulse_update` - Real-time pulse data updates
- `market_pulse_update` - Composite market pulse updates
- `alert` - Alert notifications

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"

# WebSocket Service (for mini-service)
PORT=3003
CORS_ORIGIN="http://localhost:3000"
```

### Database Schema

The application uses Prisma with SQLite. The schema includes:

- **Users & Authentication**: User accounts with preferences
- **Markets**: Financial instruments and assets
- **Pulse Data**: Seven types of pulse indicators with time-series data
- **Market Pulses**: Composite calculations with weighted metrics
- **Alerts**: User-configurable monitoring system
- **Watchlists**: Custom market tracking groups

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:

- **Desktop**: Full-featured dashboard with advanced analytics
- **Tablet**: Optimized layout with touch interactions
- **Mobile**: Streamlined interface with swipe navigation and touch-friendly controls

### Mobile Features
- Touch-optimized buttons and interactions
- Swipe navigation between pulse dashboards
- Responsive charts and visualizations
- Collapsible navigation menu
- Optimized performance for mobile networks

## 🤖 AI Integration

The platform integrates Z.ai Web Dev SDK for advanced market analysis:

### AI-Powered Features
- **Sentiment Analysis**: Natural language processing of news and social media
- **Volatility Forecasting**: Predictive modeling for market volatility
- **Risk Assessment**: Comprehensive risk factor analysis
- **Market Prediction**: AI-generated market forecasts and recommendations
- **Anomaly Detection**: Identification of unusual market patterns

### AI Endpoints
- Market sentiment analysis with scoring
- Volatility forecasting with confidence intervals
- Risk assessment with factor breakdown
- Market prediction with target prices
- Synthetic data generation for testing

## 📈 Usage Examples

### Fetching Historical Data
```javascript
// Get sentiment data for the last 24 hours
const response = await fetch('/api/historical-data?marketId=SPY&pulseType=sentiment&timeframe=24h')
const data = await response.json()
```

### Creating an Alert
```javascript
const alert = {
  name: "High Volatility Alert",
  pulseType: "VOLATILITY",
  marketId: "SPY",
  operator: "GREATER_THAN",
  threshold: 70
}

await fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(alert)
})
```

### AI Market Analysis
```javascript
const analysis = await fetch('/api/ai-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    marketId: 'SPY',
    analysisType: 'market_prediction',
    timeframe: '1w'
  })
})
```

### WebSocket Subscription
```javascript
import { io } from 'socket.io-client'

const socket = io('/?XTransformPort=3003')

socket.emit('subscribe', {
  markets: ['SPY', 'QQQ', 'AAPL'],
  pulses: ['sentiment', 'volatility', 'momentum']
})

socket.on('pulse_update', (data) => {
  console.log('Real-time pulse update:', data)
})
```

## 🔒 Security Features

- **Input Validation**: Comprehensive validation using Zod schemas
- **Type Safety**: End-to-end TypeScript implementation
- **Environment Variables**: Secure configuration management
- **CORS Protection**: Cross-origin resource sharing controls
- **Rate Limiting**: API endpoint protection (to be implemented)
- **Authentication Ready**: NextAuth.js integration prepared

## 🚀 Deployment

### Production Build
```bash
# Build the main application
npm run build

# Build the WebSocket service
cd mini-services/websocket-service
npm run build
```

### Environment Setup
1. Configure production environment variables
2. Set up production database
3. Deploy WebSocket service separately
4. Configure reverse proxy and load balancing

### Vercel Deployment
1. Link or import this repository in Vercel.
2. Ensure a `vercel.json` exists at the root (already added) with `buildCommand` set to "npm run build" and `framework` set to "nextjs".
3. In Vercel Project Settings -> Environment Variables, add:
   - `NEXT_PUBLIC_BASE_URL` = `https://<your-vercel-domain>` (e.g., `https://market-pulse-engine.vercel.app`)
   - `NEXT_PUBLIC_WEBSOCKET_URL` = `https://<your-websocket-service-domain>` (or `wss://` if required)
   - `DATABASE_URL` = your production database URL (Postgres/MySQL/Neon/PlanetScale, etc.)
4. Trigger a production deploy and wait for build completion.
5. Verify the app loads and API routes respond (e.g., `/api/...`).
6. Deploy the `mini-services/websocket-service` separately on a platform that supports persistent WebSockets (Railway, Fly.io, Render, etc.).
7. Set `CORS_ORIGIN` for the websocket-service to your Vercel domain (e.g., `https://market-pulse-engine.vercel.app`) and confirm `/health` returns status "healthy".
8. Update any custom domain in Vercel, redeploy if needed, and re-verify WebSocket connectivity from the frontend.

Note: The frontend reads `NEXT_PUBLIC_WEBSOCKET_URL` for WebSocket connections and `NEXT_PUBLIC_BASE_URL` for server-side fetches to internal API routes. In production, both must be set to the correct domains.

### Docker Support
The application is containerization-ready with:
- Multi-stage Docker builds
- Optimized production images
- Service orchestration support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Implement proper error handling
- Add comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Z.ai Team**: For the powerful AI development SDK
- **Next.js Team**: For the excellent React framework
- **Prisma Team**: For the modern database toolkit
- **shadcn/ui**: For the beautiful component library
- **Open Source Community**: For the incredible tools and libraries

## 📞 Support

For support, questions, or feature requests:

1. Check the [documentation](README.md)
2. Open an [issue](https://github.com/jitenkr2030/Market-Pulse-Engine-System/issues)
3. Join our community discussions

---

Built with ❤️ for the trading and investment community.  
Empowering traders with real-time market intelligence and AI-powered insights.