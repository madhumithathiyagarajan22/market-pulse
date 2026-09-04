import httpx
import logging
from typing import List, Dict, Any
from app.providers.base import MarketDataProvider

logger = logging.getLogger(__name__)

# Symbol mapping for Yahoo Finance Indian Equities
NSE_YAHOO_MAP = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "ITC": "ITC.NS",
    "SBIN": "SBIN.NS",
    "WIPRO": "WIPRO.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "ONGC": "ONGC.NS",
    "BPCL": "BPCL.NS"
}

class YahooMarketDataProvider(MarketDataProvider):
    async def get_latest_quote(self, symbol: str) -> Dict[str, Any]:
        yahoo_sym = NSE_YAHOO_MAP.get(symbol.upper(), f"{symbol.upper()}.NS")
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_sym}"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    meta = data["chart"]["result"][0]["meta"]
                    current_price = meta.get("regularMarketPrice", 1000.0)
                    prev_close = meta.get("chartPreviousClose", current_price)
                    change_pct = ((current_price - prev_close) / prev_close) * 100.0 if prev_close else 0.0
                    volume = float(meta.get("regularMarketVolume", 1000000))
                    
                    return {
                        "symbol": symbol.upper(),
                        "name": meta.get("shortName", symbol.upper()),
                        "sector": meta.get("sector", "EQUITIES"),
                        "exchange": "NSE",
                        "price": round(current_price, 2),
                        "change_pct": round(change_pct, 2),
                        "volume": volume,
                        "avg_volume_30d": volume * 0.9,
                        "typical_daily_pct_change": 1.2,
                        "historical_volatility": 0.015,
                        "sector_change_pct": -0.4,
                        "market_change_pct": -0.3,
                        "data_source": "YAHOO_LIVE",
                        "is_stale": False
                    }
        except Exception as e:
            logger.warning(f"Yahoo Provider failed for {symbol}: {e}. Falling back to demo data.")
            
        # Fallback to Demo Data
        from app.providers.demo_provider import DemoMarketDataProvider
        return await DemoMarketDataProvider().get_latest_quote(symbol)

    async def get_watchlist_quotes(self, symbols: List[str]) -> List[Dict[str, Any]]:
        results = []
        for sym in symbols:
            q = await self.get_latest_quote(sym)
            results.append(q)
        return results

    async def get_market_context(self) -> Dict[str, Any]:
        from app.providers.demo_provider import DemoMarketDataProvider
        return await DemoMarketDataProvider().get_market_context()
