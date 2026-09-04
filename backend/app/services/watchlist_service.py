from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.models import Watchlist, WatchlistItem, Stock
from app.providers.demo_provider import DEMO_STOCKS_DATA
import datetime

async def get_user_watchlist(db: AsyncSession, user_id: int) -> Watchlist:
    stmt = select(Watchlist).where(Watchlist.user_id == user_id).options(
        selectinload(Watchlist.items).selectinload(WatchlistItem.stock)
    )
    res = await db.execute(stmt)
    watchlist = res.scalar_one_or_none()
    
    if not watchlist:
        watchlist = Watchlist(user_id=user_id, name="Main Watchlist")
        db.add(watchlist)
        await db.commit()
        
        # Re-fetch with selectinload
        res = await db.execute(stmt)
        watchlist = res.scalar_one()
        
    return watchlist

async def add_stock_to_watchlist(db: AsyncSession, user_id: int, symbol: str) -> WatchlistItem:
    symbol = symbol.upper().strip()
    watchlist = await get_user_watchlist(db, user_id)
    
    stmt = select(WatchlistItem).where(
        WatchlistItem.watchlist_id == watchlist.id,
        WatchlistItem.stock_symbol == symbol
    )
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock '{symbol}' is already in your watchlist"
        )
        
    stock_stmt = select(Stock).where(Stock.symbol == symbol)
    stock_res = await db.execute(stock_stmt)
    stock = stock_res.scalar_one_or_none()
    
    if not stock:
        meta = DEMO_STOCKS_DATA.get(symbol, {})
        stock = Stock(
            symbol=symbol,
            name=meta.get("name", f"{symbol} Ltd"),
            sector=meta.get("sector", "EQUITIES"),
            historical_volatility=meta.get("historical_volatility", 0.015),
            avg_volume_30d=meta.get("avg_volume_30d", 1000000.0),
            typical_daily_pct_change=meta.get("typical_daily_pct_change", 1.2)
        )
        db.add(stock)
        await db.flush()
        
    item = WatchlistItem(watchlist_id=watchlist.id, stock_symbol=symbol)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

async def remove_stock_from_watchlist(db: AsyncSession, user_id: int, symbol: str) -> bool:
    symbol = symbol.upper().strip()
    watchlist = await get_user_watchlist(db, user_id)
    
    stmt = select(WatchlistItem).where(
        WatchlistItem.watchlist_id == watchlist.id,
        WatchlistItem.stock_symbol == symbol
    )
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock '{symbol}' not found in your watchlist"
        )
        
    await db.delete(item)
    await db.commit()
    return True
