from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class MarketDataProvider(ABC):
    @abstractmethod
    async def get_latest_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetch latest price, change %, volume, and timestamps for a single stock."""
        pass

    @abstractmethod
    async def get_watchlist_quotes(self, symbols: List[str]) -> List[Dict[str, Any]]:
        """Fetch batch quotes for all stocks in watchlist."""
        pass

    @abstractmethod
    async def get_market_context(self) -> Dict[str, Any]:
        """Fetch broad market index (NIFTY/SENSEX) and sector benchmarks."""
        pass

class NewsDataProvider(ABC):
    @abstractmethod
    async def get_latest_events(self, symbol: str) -> List[Dict[str, Any]]:
        """Fetch recent material company news/events for a stock."""
        pass
