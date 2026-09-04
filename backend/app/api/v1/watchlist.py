from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import WatchlistResponse, AddWatchlistItem, WatchlistItemResponse
from app.services.watchlist_service import get_user_watchlist, add_stock_to_watchlist, remove_stock_from_watchlist
from app.providers.demo_provider import DemoMarketDataProvider

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

@router.get("", response_model=WatchlistResponse)
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    watchlist = await get_user_watchlist(db, current_user.id)
    demo_provider = DemoMarketDataProvider()
    
    items_response = []
    for item in watchlist.items:
        quote = await demo_provider.get_latest_quote(item.stock_symbol)
        items_response.append(WatchlistItemResponse(
            id=item.id,
            stock_symbol=item.stock_symbol,
            added_at=item.added_at,
            name=quote.get("name", item.stock.name if item.stock else item.stock_symbol),
            sector=quote.get("sector", item.stock.sector if item.stock else "EQUITIES"),
            exchange=quote.get("exchange", "NSE"),
            price=quote.get("price", 1000.0),
            change_pct=quote.get("change_pct", 0.0)
        ))
        
    return WatchlistResponse(
        id=watchlist.id,
        name=watchlist.name,
        items=items_response
    )

@router.post("", response_model=WatchlistItemResponse)
async def add_item(
    item_in: AddWatchlistItem,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    item = await add_stock_to_watchlist(db, current_user.id, item_in.symbol)
    quote = await DemoMarketDataProvider().get_latest_quote(item.stock_symbol)
    return WatchlistItemResponse(
        id=item.id,
        stock_symbol=item.stock_symbol,
        added_at=item.added_at,
        name=quote.get("name", item.stock_symbol),
        sector=quote.get("sector", "EQUITIES"),
        exchange="NSE",
        price=quote.get("price", 1000.0),
        change_pct=quote.get("change_pct", 0.0)
    )

@router.delete("/{symbol}")
async def delete_item(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await remove_stock_from_watchlist(db, current_user.id, symbol)
    return {"message": f"Successfully removed '{symbol}' from watchlist"}
