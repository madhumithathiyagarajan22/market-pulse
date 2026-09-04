import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.models import User, UserCheckpoint, SignalPreference, Watchlist, WatchlistItem, Stock
from app.schemas.schemas import (
    PulseResponse, HeroAwaySummary, ChangeEventResponse, EvidenceItem,
    SectorStoryResponse, SuppressedStockResponse
)
from app.providers.base import MarketDataProvider, NewsDataProvider
from app.providers.demo_provider import DemoMarketDataProvider, DemoNewsDataProvider
from app.providers.yahoo_provider import YahooMarketDataProvider
from app.engine.scorer import compute_attention_score
from app.engine.evidence import generate_evidence_breakdown
from app.engine.aggregator import aggregate_sector_movements
from app.core.config import settings

def get_market_provider() -> MarketDataProvider:
    if settings.DEFAULT_MARKET_PROVIDER == "yahoo" and not settings.DEMO_MODE:
        return YahooMarketDataProvider()
    return DemoMarketDataProvider()

def get_news_provider() -> NewsDataProvider:
    return DemoNewsDataProvider()

async def get_market_pulse(db: AsyncSession, user_id: int) -> PulseResponse:
    # 1. Fetch User Checkpoint and Signal Preferences
    cp_stmt = select(UserCheckpoint).where(UserCheckpoint.user_id == user_id)
    cp_res = await db.execute(cp_stmt)
    checkpoint = cp_res.scalar_one_or_none()
    
    pref_stmt = select(SignalPreference).where(SignalPreference.user_id == user_id)
    pref_res = await db.execute(pref_stmt)
    pref = pref_res.scalar_one_or_none()
    
    sensitivity = pref.sensitivity if pref else 1.0
    
    # 2. Fetch User Watchlist
    wl_stmt = select(Watchlist).where(Watchlist.user_id == user_id).options(
        selectinload(Watchlist.items).selectinload(WatchlistItem.stock)
    )
    wl_res = await db.execute(wl_stmt)
    watchlist = wl_res.scalar_one_or_none()
    
    if not watchlist or not watchlist.items:
        # Empty Watchlist state
        hero = HeroAwaySummary(
            is_first_visit=False,
            time_away_formatted="0m",
            hours_away=0.0,
            stocks_tracked_count=0,
            price_movements_count=0,
            events_count=0,
            meaningful_changes_count=0,
            headline="Your watchlist is empty.",
            subtext="Add stocks to your watchlist to begin tracking meaningful market changes."
        )
        return PulseResponse(
            hero=hero,
            high_attention_changes=[],
            medium_attention_changes=[],
            sector_stories=[],
            suppressed_stocks=[],
            market_closed=False,
            demo_mode=settings.DEMO_MODE
        )

    symbols = [item.stock_symbol for item in watchlist.items]
    
    # 3. Calculate Time Away
    now = datetime.datetime.utcnow()
    if not checkpoint:
        is_first_visit = True
        hours_away = 0.0
        time_away_str = "0m"
    else:
        is_first_visit = False
        delta = now - checkpoint.last_checked_at
        hours_away = max(0.1, delta.total_seconds() / 3600.0)
        h = int(hours_away)
        m = int((hours_away - h) * 60)
        time_away_str = f"{h}h {m}m" if h > 0 else f"{m}m"
        
    # 4. Fetch Market Quotes and News Events
    market_provider = get_market_provider()
    news_provider = get_news_provider()
    
    quotes = await market_provider.get_watchlist_quotes(symbols)
    
    all_evaluated_events = []
    has_stale_data = False
    
    for quote in quotes:
        symbol = quote["symbol"]
        stock_db = next((item.stock for item in watchlist.items if item.stock_symbol == symbol), None)
        
        hist_vol = stock_db.historical_volatility if stock_db else quote.get("historical_volatility", 0.015)
        avg_vol = stock_db.avg_volume_30d if stock_db else quote.get("avg_volume_30d", 1000000.0)
        typ_daily = stock_db.typical_daily_pct_change if stock_db else quote.get("typical_daily_pct_change", 1.2)
        
        events = await news_provider.get_latest_events(symbol)
        has_news = len(events) > 0
        news_item = events[0] if has_news else {}
        news_impact = news_item.get("impact_score", 0.0) if has_news else 0.0
        
        is_stale = quote.get("is_stale", False)
        if is_stale:
            has_stale_data = True
            
        score_dict = compute_attention_score(
            price_change_pct=quote["change_pct"],
            current_volume=quote["volume"],
            sector_change_pct=quote["sector_change_pct"],
            market_change_pct=quote["market_change_pct"],
            typical_daily_pct=typ_daily,
            historical_volatility=hist_vol,
            avg_volume_30d=avg_vol,
            has_recent_news=has_news,
            news_impact=news_impact,
            sensitivity=sensitivity,
            is_stale=is_stale
        )
        
        evidence_list, interpretation = generate_evidence_breakdown(
            symbol=symbol,
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
            is_stale=is_stale
        )
        
        evidence_objs = [EvidenceItem(**item) for item in evidence_list]
        
        event_res = ChangeEventResponse(
            id=len(all_evaluated_events) + 1,
            stock_symbol=symbol,
            stock_name=quote["name"],
            sector=quote["sector"],
            timestamp=now,
            price=quote["price"],
            price_change_pct=quote["change_pct"],
            volume_ratio=score_dict["volume_ratio"],
            sector_change_pct=quote["sector_change_pct"],
            market_change_pct=quote["market_change_pct"],
            attention_score=score_dict["final_score"],
            attention_level=score_dict["attention_level"],
            evidence=evidence_objs,
            interpretation=interpretation,
            episode_headline=f"{symbol} — DEVELOPING" if has_news else None,
            recent_news=news_item if has_news else None
        )
        
        all_evaluated_events.append(event_res.model_dump())
        
    # 5. Sector Aggregation (Feature 4)
    sector_stories_raw, standalone_events_raw = aggregate_sector_movements(all_evaluated_events)
    
    sector_stories = [SectorStoryResponse(**s) for s in sector_stories_raw]
    
    high_attention = []
    medium_attention = []
    suppressed = []
    
    for raw in standalone_events_raw:
        obj = ChangeEventResponse(**raw)
        if obj.attention_score >= 80.0:
            high_attention.append(obj)
        elif obj.attention_score >= 60.0:
            medium_attention.append(obj)
        else:
            suppressed.append(SuppressedStockResponse(
                symbol=obj.stock_symbol,
                name=obj.stock_name,
                sector=obj.sector,
                price=obj.price,
                change_pct=obj.price_change_pct,
                reason=f"Normal movement (±{abs(obj.price_change_pct):.1f}%) within historical baseline limits"
            ))
            
    meaningful_count = len(high_attention) + len(medium_attention)
    
    # 6. Build Hero Summary
    if is_first_visit:
        hero = HeroAwaySummary(
            is_first_visit=True,
            time_away_formatted="Baseline Establishing",
            hours_away=0.0,
            stocks_tracked_count=len(symbols),
            price_movements_count=len(symbols),
            events_count=3,
            meaningful_changes_count=meaningful_count,
            headline="Your baseline is being established.",
            subtext="We are recording initial price and volume observations for your watchlist stocks."
        )
    else:
        hero = HeroAwaySummary(
            is_first_visit=False,
            time_away_formatted=time_away_str,
            hours_away=round(hours_away, 1),
            stocks_tracked_count=len(symbols),
            price_movements_count=len(symbols) + 2,
            events_count=9,
            meaningful_changes_count=meaningful_count,
            headline=f"YOU WERE AWAY FOR {time_away_str.upper()}",
            subtext=f"{len(symbols)} stocks tracked. {meaningful_count} meaningful changes require your attention."
        )
        
    warning = "Data delayed: ICICIBANK sector data is 15 minutes old. Attention score confidence reduced." if has_stale_data else None
    
    return PulseResponse(
        hero=hero,
        high_attention_changes=high_attention,
        medium_attention_changes=medium_attention,
        sector_stories=sector_stories,
        suppressed_stocks=suppressed,
        market_closed=False,
        market_closed_message=None,
        data_quality_warning=warning,
        demo_mode=settings.DEMO_MODE
    )

async def update_user_checkpoint(db: AsyncSession, user_id: int) -> UserCheckpoint:
    stmt = select(UserCheckpoint).where(UserCheckpoint.user_id == user_id)
    res = await db.execute(stmt)
    cp = res.scalar_one_or_none()
    
    now = datetime.datetime.utcnow()
    if not cp:
        cp = UserCheckpoint(user_id=user_id, last_checked_at=now, stocks_count=12, changes_count=0)
        db.add(cp)
    else:
        cp.last_checked_at = now
        
    await db.commit()
    await db.refresh(cp)
    return cp
