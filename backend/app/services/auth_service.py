from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.models import User, UserCheckpoint, SignalPreference, Watchlist, WatchlistItem, Stock
from app.schemas.schemas import UserCreate, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
import datetime

DEFAULT_SEED_WATCHLIST_SYMBOLS = [
    "RELIANCE", "ONGC", "BPCL", "TATAMOTORS", "ICICIBANK", 
    "TCS", "INFY", "HDFCBANK", "ITC", "SBIN", "WIPRO"
]

async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
    stmt = select(User).where(User.email == user_in.email)
    res = await db.execute(stmt)
    existing_user = res.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        password_hash=hashed_pwd,
        full_name=user_in.full_name
    )
    db.add(new_user)
    await db.flush()
    
    # Initialize default checkpoint (First visit state: last_checked_at set to NOW)
    checkpoint = UserCheckpoint(
        user_id=new_user.id,
        last_checked_at=datetime.datetime.utcnow() - datetime.timedelta(hours=17, minutes=42), # Seed default 17h 42m away gap for demo user
        stocks_count=len(DEFAULT_SEED_WATCHLIST_SYMBOLS),
        changes_count=2
    )
    db.add(checkpoint)
    
    # Initialize default signal preferences
    signal_pref = SignalPreference(user_id=new_user.id)
    db.add(signal_pref)
    
    # Create default Watchlist with seeded Indian equities
    watchlist = Watchlist(user_id=new_user.id, name="Main Watchlist")
    db.add(watchlist)
    await db.flush()
    
    for sym in DEFAULT_SEED_WATCHLIST_SYMBOLS:
        # Check stock exists or seed stock
        stock_stmt = select(Stock).where(Stock.symbol == sym)
        stock_res = await db.execute(stock_stmt)
        stock = stock_res.scalar_one_or_none()
        if not stock:
            # Import demo provider metadata if available
            from app.providers.demo_provider import DEMO_STOCKS_DATA
            demo_meta = DEMO_STOCKS_DATA.get(sym, {})
            stock = Stock(
                symbol=sym,
                name=demo_meta.get("name", f"{sym} Ltd"),
                sector=demo_meta.get("sector", "EQUITIES"),
                historical_volatility=demo_meta.get("historical_volatility", 0.015),
                avg_volume_30d=demo_meta.get("avg_volume_30d", 1000000.0),
                typical_daily_pct_change=demo_meta.get("typical_daily_pct_change", 1.2)
            )
            db.add(stock)
            await db.flush()
            
        item = WatchlistItem(watchlist_id=watchlist.id, stock_symbol=sym)
        db.add(item)
        
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def authenticate_user(db: AsyncSession, user_in: UserLogin) -> str:
    stmt = select(User).where(User.email == user_in.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    return create_access_token(user.id)
