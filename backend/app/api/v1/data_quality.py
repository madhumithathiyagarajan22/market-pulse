from fastapi import APIRouter
from app.schemas.schemas import DataQualityOverview, DataSourceStatusSchema

router = APIRouter(prefix="/data-quality", tags=["Data Quality"])

@router.get("", response_model=DataQualityOverview)
async def get_data_quality():
    sources = [
        DataSourceStatusSchema(
            source_name="Equities Price Feed",
            status="HEALTHY",
            last_updated="Fresh — 8 sec ago",
            latency_ms=38,
            details="NSE / BSE Direct Feed active"
        ),
        DataSourceStatusSchema(
            source_name="Trading Volume Feed",
            status="HEALTHY",
            last_updated="Fresh — 12 sec ago",
            latency_ms=42,
            details="Tick volume feed online"
        ),
        DataSourceStatusSchema(
            source_name="Company Filings & News",
            status="HEALTHY",
            last_updated="Fresh — 4 min ago",
            latency_ms=120,
            details="BSE / NSE Corporate Announcements RSS"
        ),
        DataSourceStatusSchema(
            source_name="Sector Benchmarks",
            status="DELAYED",
            last_updated="Delayed — 15 min ago",
            latency_ms=900,
            details="ICICIBANK sector feed delayed due to upstream provider retry"
        )
    ]
    
    return DataQualityOverview(
        overall_status="DEGRADED",
        overall_confidence_pct=88,
        sources=sources,
        active_warnings=[
            "Sector benchmark for BANKING sector is running 15 minutes behind. Attention scores degrade gracefully by 15% for affected bank stocks."
        ]
    )
