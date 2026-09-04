import datetime
from typing import List, Dict, Any, Optional
from app.providers.base import MarketDataProvider, NewsDataProvider

DEMO_STOCKS_DATA = {
    "RELIANCE": {
        "symbol": "RELIANCE",
        "name": "Reliance Industries Ltd",
        "sector": "ENERGY",
        "exchange": "NSE",
        "currency": "INR",
        "price": 1421.20,
        "change_pct": -2.8,
        "volume": 8100000.0,
        "avg_volume_30d": 3000000.0,
        "typical_daily_pct_change": 0.9,
        "historical_volatility": 0.012, # 1.2% daily std dev
        "sector_change_pct": -0.8,
        "market_change_pct": -0.4,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": {
            "title": "Reliance Announces Green Hydrogen Capex & Strategic Partnership",
            "source": "BSE Filing",
            "url": "https://www.bseindia.com",
            "event_type": "ANNOUNCEMENT",
            "impact_score": 85.0,
            "time_ago": "42 minutes ago"
        }
    },
    "ONGC": {
        "symbol": "ONGC",
        "name": "Oil & Natural Gas Corp",
        "sector": "ENERGY",
        "exchange": "NSE",
        "currency": "INR",
        "price": 284.50,
        "change_pct": -2.8,
        "volume": 12500000.0,
        "avg_volume_30d": 11000000.0,
        "typical_daily_pct_change": 1.4,
        "historical_volatility": 0.016,
        "sector_change_pct": -2.9,
        "market_change_pct": -0.6,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None
    },
    "BPCL": {
        "symbol": "BPCL",
        "name": "Bharat Petroleum Corp Ltd",
        "sector": "ENERGY",
        "exchange": "NSE",
        "currency": "INR",
        "price": 348.10,
        "change_pct": -2.5,
        "volume": 6800000.0,
        "avg_volume_30d": 6200000.0,
        "typical_daily_pct_change": 1.5,
        "historical_volatility": 0.017,
        "sector_change_pct": -2.9,
        "market_change_pct": -0.6,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None
    },
    "TATAMOTORS": {
        "symbol": "TATAMOTORS",
        "name": "Tata Motors Ltd",
        "sector": "AUTOMOBILE",
        "exchange": "NSE",
        "currency": "INR",
        "price": 985.40,
        "change_pct": +2.4,
        "volume": 15500000.0,
        "avg_volume_30d": 5000000.0, # 3.1x volume surge
        "typical_daily_pct_change": 1.5,
        "historical_volatility": 0.018,
        "sector_change_pct": +0.4,
        "market_change_pct": -0.4,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None # Volume anomaly without news
    },
    "ICICIBANK": {
        "symbol": "ICICIBANK",
        "name": "ICICI Bank Ltd",
        "sector": "BANKING",
        "exchange": "NSE",
        "currency": "INR",
        "price": 1124.60,
        "change_pct": -1.4,
        "volume": 4200000.0,
        "avg_volume_30d": 4500000.0,
        "typical_daily_pct_change": 1.1,
        "historical_volatility": 0.013,
        "sector_change_pct": -0.5,
        "market_change_pct": -0.4,
        "data_source": "NSE_DELAYED",
        "is_stale": True, # Stale data scenario
        "news": None
    },
    "TCS": {
        "symbol": "TCS",
        "name": "Tata Consultancy Services",
        "sector": "IT",
        "exchange": "NSE",
        "currency": "INR",
        "price": 3890.00,
        "change_pct": +0.3,
        "volume": 1800000.0,
        "avg_volume_30d": 2000000.0,
        "typical_daily_pct_change": 1.0,
        "historical_volatility": 0.011,
        "sector_change_pct": +0.2,
        "market_change_pct": -0.4,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None
    },
    "INFY": {
        "symbol": "INFY",
        "name": "Infosys Ltd",
        "sector": "IT",
        "exchange": "NSE",
        "currency": "INR",
        "price": 1540.50,
        "change_pct": +0.4,
        "volume": 3100000.0,
        "avg_volume_30d": 3300000.0,
        "typical_daily_pct_change": 1.1,
        "historical_volatility": 0.012,
        "sector_change_pct": +0.2,
        "market_change_pct": -0.4,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None
    },
    "HDFCBANK": {
        "symbol": "HDFCBANK",
        "name": "HDFC Bank Ltd",
        "sector": "BANKING",
        "exchange": "NSE",
        "currency": "INR",
        "price": 1452.00,
        "change_pct": -0.2,
        "volume": 5200000.0,
        "avg_volume_30d": 5500000.0,
        "typical_daily_pct_change": 1.0,
        "historical_volatility": 0.011,
        "sector_change_pct": -0.5,
        "market_change_pct": -0.4,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None
    },
    "ITC": {
        "symbol": "ITC",
        "name": "ITC Ltd",
        "sector": "FMCG",
        "exchange": "NSE",
        "currency": "INR",
        "price": 415.80,
        "change_pct": +0.1,
        "volume": 7200000.0,
        "avg_volume_30d": 7500000.0,
        "typical_daily_pct_change": 0.8,
        "historical_volatility": 0.009,
        "sector_change_pct": +0.1,
        "market_change_pct": -0.4,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None
    },
    "SBIN": {
        "symbol": "SBIN",
        "name": "State Bank of India",
        "sector": "BANKING",
        "exchange": "NSE",
        "currency": "INR",
        "price": 755.20,
        "change_pct": -0.4,
        "volume": 8400000.0,
        "avg_volume_30d": 9000000.0,
        "typical_daily_pct_change": 1.2,
        "historical_volatility": 0.014,
        "sector_change_pct": -0.5,
        "market_change_pct": -0.4,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None
    },
    "WIPRO": {
        "symbol": "WIPRO",
        "name": "Wipro Ltd",
        "sector": "IT",
        "exchange": "NSE",
        "currency": "INR",
        "price": 482.10,
        "change_pct": +0.2,
        "volume": 2800000.0,
        "avg_volume_30d": 3000000.0,
        "typical_daily_pct_change": 1.2,
        "historical_volatility": 0.013,
        "sector_change_pct": +0.2,
        "market_change_pct": -0.4,
        "data_source": "NSE_LIVE",
        "is_stale": False,
        "news": None
    }
}

class DemoMarketDataProvider(MarketDataProvider):
    async def get_latest_quote(self, symbol: str) -> Dict[str, Any]:
        data = DEMO_STOCKS_DATA.get(symbol.upper())
        if not data:
            return {
                "symbol": symbol.upper(),
                "name": f"{symbol.upper()} Corp",
                "sector": "OTHER",
                "exchange": "NSE",
                "price": 500.0,
                "change_pct": 0.0,
                "volume": 1000000.0,
                "avg_volume_30d": 1000000.0,
                "typical_daily_pct_change": 1.0,
                "historical_volatility": 0.012,
                "sector_change_pct": 0.0,
                "market_change_pct": 0.0,
                "data_source": "DEMO_GENERIC",
                "is_stale": False
            }
        return data

    async def get_watchlist_quotes(self, symbols: List[str]) -> List[Dict[str, Any]]:
        return [await self.get_latest_quote(sym) for sym in symbols]

    async def get_market_context(self) -> Dict[str, Any]:
        return {
            "nifty_50": {"price": 22450.80, "change_pct": -0.4, "status": "LIVE"},
            "sensex": {"price": 73880.20, "change_pct": -0.35, "status": "LIVE"},
            "sectors": {
                "ENERGY": -2.9,
                "IT": +0.2,
                "BANKING": -0.5,
                "AUTOMOBILE": +0.4,
                "FMCG": +0.1
            }
        }

class DemoNewsDataProvider(NewsDataProvider):
    async def get_latest_events(self, symbol: str) -> List[Dict[str, Any]]:
        stock_data = DEMO_STOCKS_DATA.get(symbol.upper())
        if stock_data and stock_data.get("news"):
            news = stock_data["news"]
            return [{
                "id": 1,
                "stock_symbol": symbol.upper(),
                "title": news["title"],
                "source": news["source"],
                "url": news["url"],
                "event_type": news["event_type"],
                "impact_score": news["impact_score"],
                "timestamp": (datetime.datetime.utcnow() - datetime.timedelta(minutes=42)).isoformat(),
                "time_ago": news["time_ago"]
            }]
        return []
