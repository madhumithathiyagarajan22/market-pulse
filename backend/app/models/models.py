import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    watchlists: Mapped[List["Watchlist"]] = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    checkpoint: Mapped[Optional["UserCheckpoint"]] = relationship("UserCheckpoint", back_populates="user", uselist=False, cascade="all, delete-orphan")
    signal_preference: Mapped[Optional["SignalPreference"]] = relationship("SignalPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Watchlist(Base):
    __tablename__ = "watchlists"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), default="My Watchlist")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    user: Mapped["User"] = relationship("User", back_populates="watchlists")
    items: Mapped[List["WatchlistItem"]] = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")

class WatchlistItem(Base):
    __tablename__ = "watchlist_items"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    watchlist_id: Mapped[int] = mapped_column(Integer, ForeignKey("watchlists.id", ondelete="CASCADE"), nullable=False, index=True)
    stock_symbol: Mapped[str] = mapped_column(String(20), ForeignKey("stocks.symbol", ondelete="CASCADE"), nullable=False, index=True)
    added_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    watchlist: Mapped["Watchlist"] = relationship("Watchlist", back_populates="items")
    stock: Mapped["Stock"] = relationship("Stock")

class Stock(Base):
    __tablename__ = "stocks"
    
    symbol: Mapped[str] = mapped_column(String(20), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    exchange: Mapped[str] = mapped_column(String(50), default="NSE")
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    market_cap_category: Mapped[str] = mapped_column(String(50), default="LARGE_CAP")
    
    # Baseline Parameters
    historical_volatility: Mapped[float] = mapped_column(Float, default=0.015)  # Daily Std Dev (e.g. 1.5%)
    avg_volume_30d: Mapped[float] = mapped_column(Float, default=1000000.0)
    typical_daily_pct_change: Mapped[float] = mapped_column(Float, default=1.2)
    
    observations: Mapped[List["MarketObservation"]] = relationship("MarketObservation", back_populates="stock", cascade="all, delete-orphan")
    news_events: Mapped[List["NewsEvent"]] = relationship("NewsEvent", back_populates="stock", cascade="all, delete-orphan")
    change_episodes: Mapped[List["ChangeEpisode"]] = relationship("ChangeEpisode", back_populates="stock", cascade="all, delete-orphan")

class MarketObservation(Base):
    __tablename__ = "market_observations"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    stock_symbol: Mapped[str] = mapped_column(String(20), ForeignKey("stocks.symbol", ondelete="CASCADE"), nullable=False, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, index=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    change_pct: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)
    sector_change_pct: Mapped[float] = mapped_column(Float, default=0.0)
    market_change_pct: Mapped[float] = mapped_column(Float, default=0.0)
    data_source: Mapped[str] = mapped_column(String(50), default="NSE_LIVE")
    is_stale: Mapped[bool] = mapped_column(Boolean, default=False)
    
    stock: Mapped["Stock"] = relationship("Stock", back_populates="observations")

class NewsEvent(Base):
    __tablename__ = "news_events"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    stock_symbol: Mapped[str] = mapped_column(String(20), ForeignKey("stocks.symbol", ondelete="CASCADE"), nullable=False, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), default="ANNOUNCEMENT") # EARNINGS, GUIDANCE, REGULATORY, DIVIDEND, ANNOUNCEMENT
    impact_score: Mapped[float] = mapped_column(Float, default=50.0) # 0 to 100
    
    stock: Mapped["Stock"] = relationship("Stock", back_populates="news_events")

class ChangeEpisode(Base):
    __tablename__ = "change_episodes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    stock_symbol: Mapped[str] = mapped_column(String(20), ForeignKey("stocks.symbol", ondelete="CASCADE"), nullable=False, index=True)
    start_time: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    updated_time: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="DEVELOPING") # DEVELOPING, RESOLVED
    headline: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    
    stock: Mapped["Stock"] = relationship("Stock", back_populates="change_episodes")
    events: Mapped[List["ChangeEvent"]] = relationship("ChangeEvent", back_populates="episode", cascade="all, delete-orphan")

class ChangeEvent(Base):
    __tablename__ = "change_events"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    episode_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("change_episodes.id", ondelete="SET NULL"), nullable=True)
    stock_symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    
    price_change_pct: Mapped[float] = mapped_column(Float, nullable=False)
    volume_ratio: Mapped[float] = mapped_column(Float, nullable=False)
    sector_divergence: Mapped[float] = mapped_column(Float, nullable=False)
    market_divergence: Mapped[float] = mapped_column(Float, nullable=False)
    
    attention_score: Mapped[float] = mapped_column(Float, nullable=False)
    attention_level: Mapped[str] = mapped_column(String(20), nullable=False) # NORMAL, WATCH, IMPORTANT, HIGH
    
    evidence_json: Mapped[dict] = mapped_column(JSON, default=dict) # Evidence breakdown
    interpretation: Mapped[str] = mapped_column(Text, default="")
    
    episode: Mapped[Optional["ChangeEpisode"]] = relationship("ChangeEpisode", back_populates="events")

class UserCheckpoint(Base):
    __tablename__ = "user_checkpoints"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    last_checked_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    stocks_count: Mapped[int] = mapped_column(Integer, default=0)
    changes_count: Mapped[int] = mapped_column(Integer, default=0)
    
    user: Mapped["User"] = relationship("User", back_populates="checkpoint")

class SignalPreference(Base):
    __tablename__ = "signal_preferences"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    price_anomaly_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    volume_anomaly_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    news_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    sector_divergence_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    market_divergence_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    dividend_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    analyst_change_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Custom sensitivity multiplier (1.0 = Default, 1.5 = Sensitive, 0.7 = High threshold)
    sensitivity: Mapped[float] = mapped_column(Float, default=1.0)
    
    user: Mapped["User"] = relationship("User", back_populates="signal_preference")

class DataSourceStatus(Base):
    __tablename__ = "data_source_status"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False) # PRICE, VOLUME, NEWS, SECTOR
    status: Mapped[str] = mapped_column(String(50), default="HEALTHY") # HEALTHY, DELAYED, DEGRADED, DOWN
    last_updated: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    latency_ms: Mapped[int] = mapped_column(Integer, default=45)
    details: Mapped[str] = mapped_column(String(255), default="Fresh - 8 sec ago")
