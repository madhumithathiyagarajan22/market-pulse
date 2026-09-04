import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# User & Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# Watchlist Schemas
class WatchlistItemResponse(BaseModel):
    id: int
    stock_symbol: str
    added_at: datetime.datetime
    name: str
    sector: str
    exchange: str
    price: float
    change_pct: float
    model_config = ConfigDict(from_attributes=True)

class WatchlistResponse(BaseModel):
    id: int
    name: str
    items: List[WatchlistItemResponse]

class AddWatchlistItem(BaseModel):
    symbol: str

# Evidence & Engine Schemas
class EvidenceItem(BaseModel):
    category: str
    title: str
    detail: str
    is_positive: bool
    score_contribution: float

class ChangeEventResponse(BaseModel):
    id: int
    stock_symbol: str
    stock_name: str
    sector: str
    timestamp: datetime.datetime
    price: float
    price_change_pct: float
    volume_ratio: float
    sector_change_pct: float
    market_change_pct: float
    attention_score: float
    attention_level: str
    evidence: List[EvidenceItem]
    interpretation: str
    episode_headline: Optional[str] = None
    recent_news: Optional[Dict[str, Any]] = None

class SectorStoryResponse(BaseModel):
    sector_name: str
    stock_symbols: List[str]
    sector_change_pct: float
    market_change_pct: float
    headline: str
    summary: str
    attention_level: str

class SuppressedStockResponse(BaseModel):
    symbol: str
    name: str
    sector: str
    price: float
    change_pct: float
    reason: str = "Normal market movement within historical baseline limits"

class HeroAwaySummary(BaseModel):
    is_first_visit: bool
    time_away_formatted: str
    hours_away: float
    stocks_tracked_count: int
    price_movements_count: int
    events_count: int
    meaningful_changes_count: int
    headline: str
    subtext: str

class PulseResponse(BaseModel):
    hero: HeroAwaySummary
    high_attention_changes: List[ChangeEventResponse]
    medium_attention_changes: List[ChangeEventResponse]
    sector_stories: List[SectorStoryResponse]
    suppressed_stocks: List[SuppressedStockResponse]
    market_closed: bool
    market_closed_message: Optional[str] = None
    data_quality_warning: Optional[str] = None
    demo_mode: bool = True

# Stock Detail Schemas
class TimelineEventResponse(BaseModel):
    timestamp: datetime.datetime
    time_formatted: str
    type: str
    title: str
    description: str
    impact_level: str

class StockDetailResponse(BaseModel):
    symbol: str
    name: str
    sector: str
    exchange: str
    currency: str
    price: float
    change_pct: float
    volume: float
    avg_volume_30d: float
    typical_daily_pct_change: float
    historical_volatility_pct: float
    attention_score: float
    attention_level: str
    interpretation: str
    evidence: List[EvidenceItem]
    timeline: List[TimelineEventResponse]
    recent_news: List[Dict[str, Any]]
    data_freshness: str

# Signal Preferences
class SignalPreferenceSchema(BaseModel):
    price_anomaly_enabled: bool = True
    volume_anomaly_enabled: bool = True
    news_enabled: bool = True
    sector_divergence_enabled: bool = True
    market_divergence_enabled: bool = True
    dividend_enabled: bool = False
    analyst_change_enabled: bool = False
    sensitivity: float = 1.0

class SignalPreferenceUpdate(BaseModel):
    price_anomaly_enabled: Optional[bool] = None
    volume_anomaly_enabled: Optional[bool] = None
    news_enabled: Optional[bool] = None
    sector_divergence_enabled: Optional[bool] = None
    market_divergence_enabled: Optional[bool] = None
    dividend_enabled: Optional[bool] = None
    analyst_change_enabled: Optional[bool] = None
    sensitivity: Optional[float] = None

# Data Quality
class DataSourceStatusSchema(BaseModel):
    source_name: str
    status: str
    last_updated: str
    latency_ms: int
    details: str

class DataQualityOverview(BaseModel):
    overall_status: str
    overall_confidence_pct: int
    sources: List[DataSourceStatusSchema]
    active_warnings: List[str]

# Catch Me Up Schemas
class CatchUpStory(BaseModel):
    id: int
    stock_symbol: Optional[str]
    title: str
    summary: str
    event_count: int
    category: str

class CatchUpResponse(BaseModel):
    hours_absent: float
    total_events_missed: int
    stories: List[CatchUpStory]
