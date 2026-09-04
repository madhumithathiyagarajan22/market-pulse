import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import StockDetailResponse, TimelineEventResponse, EvidenceItem
from app.providers.demo_provider import DemoMarketDataProvider, DemoNewsDataProvider
from app.engine.scorer import compute_attention_score
from app.engine.evidence import generate_evidence_breakdown

router = APIRouter(prefix="/stocks", tags=["Stock Detail"])

@router.get("/{symbol}", response_model=StockDetailResponse)
async def get_stock_detail(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sym = symbol.upper().strip()
    market_provider = DemoMarketDataProvider()
    news_provider = DemoNewsDataProvider()
    
    quote = await market_provider.get_latest_quote(sym)
    events = await news_provider.get_latest_events(sym)
    
    has_news = len(events) > 0
    news_item = events[0] if has_news else {}
    news_impact = news_item.get("impact_score", 0.0) if has_news else 0.0
    
    score_dict = compute_attention_score(
        price_change_pct=quote["change_pct"],
        current_volume=quote["volume"],
        sector_change_pct=quote["sector_change_pct"],
        market_change_pct=quote["market_change_pct"],
        typical_daily_pct=quote["typical_daily_pct_change"],
        historical_volatility=quote["historical_volatility"],
        avg_volume_30d=quote["avg_volume_30d"],
        has_recent_news=has_news,
        news_impact=news_impact,
        is_stale=quote.get("is_stale", False)
    )
    
    evidence_list, interpretation = generate_evidence_breakdown(
        symbol=sym,
        stock_name=quote["name"],
        price_change_pct=quote["change_pct"],
        z_score=score_dict["z_score"],
        volume_ratio=score_dict["volume_ratio"],
        sector_name=quote["sector"],
        sector_change_pct=quote["sector_change_pct"],
        market_change_pct=quote["market_change_pct"],
        s_div=score_dict["sector_divergence"],
        has_news=has_news,
        news_title=news_item.get("title", ""),
        news_time_formatted=news_item.get("time_ago", ""),
        is_stale=quote.get("is_stale", False)
    )
    
    # Chronological Timeline Generation (Feature 6)
    now = datetime.datetime.utcnow()
    timeline = [
        TimelineEventResponse(
            timestamp=now - datetime.timedelta(hours=2, minutes=15),
            time_formatted="09:15 AM",
            type="MARKET_OPEN",
            title="Market Opens",
            description=f"Market opens. {sym} starts at ₹{quote['price'] * (1 - quote['change_pct']/100):.2f} (NIFTY {quote['market_change_pct']:+.1f}%).",
            impact_level="LOW"
        ),
        TimelineEventResponse(
            timestamp=now - datetime.timedelta(hours=1, minutes=40),
            time_formatted="09:48 AM",
            type="SECTOR_DIVERGENCE",
            title="Sector Divergence Begins",
            description=f"{sym} begins underperforming {quote['sector']} sector benchmark.",
            impact_level="MEDIUM"
        )
    ]
    
    if has_news:
        timeline.append(TimelineEventResponse(
            timestamp=now - datetime.timedelta(minutes=42),
            time_formatted="10:12 AM",
            type="NEWS_RELEASE",
            title="Material Announcement",
            description=f'"{news_item.get("title")}" published via {news_item.get("source")}.',
            impact_level="HIGH"
        ))
        
    timeline.append(TimelineEventResponse(
        timestamp=now - datetime.timedelta(minutes=15),
        time_formatted="11:04 AM",
        type="PRICE_SPIKE",
        title=f"Price Reaches {quote['change_pct']:+.1f}%",
        description=f"Volume crosses {score_dict['volume_ratio']:.1f}× 30-day average.",
        impact_level="HIGH" if score_dict['final_score'] >= 70 else "MEDIUM"
    ))
    
    return StockDetailResponse(
        symbol=sym,
        name=quote["name"],
        sector=quote["sector"],
        exchange="NSE",
        currency="INR",
        price=quote["price"],
        change_pct=quote["change_pct"],
        volume=quote["volume"],
        avg_volume_30d=quote["avg_volume_30d"],
        typical_daily_pct_change=quote["typical_daily_pct_change"],
        historical_volatility_pct=round(quote["historical_volatility"] * 100.0, 2),
        attention_score=score_dict["final_score"],
        attention_level=score_dict["attention_level"],
        interpretation=interpretation,
        evidence=[EvidenceItem(**item) for item in evidence_list],
        timeline=timeline,
        recent_news=events,
        data_freshness="Fresh — 8 sec ago" if not quote.get("is_stale") else "Delayed — 15 min ago"
    )
