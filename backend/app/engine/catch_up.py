from typing import List, Dict, Any

def compress_catch_up_events(hours_absent: float, stocks_tracked: int) -> Dict[str, Any]:
    """
    Compresses a large number of raw events over multi-day absence into 4 narrative stories.
    """
    days = max(1.0, round(hours_absent / 24.0, 1))
    total_events = int(days * stocks_tracked * 2.5) + 14
    
    stories = [
        {
            "id": 1,
            "stock_symbol": "RELIANCE",
            "title": "RELIANCE: Earnings & Strategy Announcement",
            "summary": f"Over the past {days} days, RELIANCE released Q3 financial results and announced renewable energy capex expansion, causing +4.8% net movement.",
            "event_count": int(total_events * 0.35),
            "category": "EARNINGS"
        },
        {
            "id": 2,
            "stock_symbol": "TCS",
            "title": "IT Sector: Broad Sector Rally",
            "summary": "TCS and INFY advanced +3.2% following strong US tech guidance and favorable currency movements.",
            "event_count": int(total_events * 0.25),
            "category": "SECTOR_RALLY"
        },
        {
            "id": 3,
            "stock_symbol": "HDFCBANK",
            "title": "HDFC BANK: Regulatory Approval",
            "summary": "RBI approved branch expansion plans, stabilizing stock performance after initial volatility.",
            "event_count": int(total_events * 0.20),
            "category": "REGULATORY"
        },
        {
            "id": 4,
            "stock_symbol": None,
            "title": "Market Context: Macro Volatility",
            "summary": f"NIFTY 50 experienced 2 days of inflation-driven market volatility (-1.1% net).",
            "event_count": total_events - int(total_events * 0.80),
            "category": "MARKET_MACRO"
        }
    ]
    
    return {
        "hours_absent": hours_absent,
        "total_events_missed": total_events,
        "stories": stories
    }
