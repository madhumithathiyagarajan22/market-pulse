from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User, SignalPreference
from app.schemas.schemas import SignalPreferenceSchema, SignalPreferenceUpdate

router = APIRouter(prefix="/settings/signals", tags=["Settings"])

@router.get("", response_model=SignalPreferenceSchema)
async def get_signal_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SignalPreference).where(SignalPreference.user_id == current_user.id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()
    
    if not pref:
        pref = SignalPreference(user_id=current_user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
        
    return SignalPreferenceSchema(
        price_anomaly_enabled=pref.price_anomaly_enabled,
        volume_anomaly_enabled=pref.volume_anomaly_enabled,
        news_enabled=pref.news_enabled,
        sector_divergence_enabled=pref.sector_divergence_enabled,
        market_divergence_enabled=pref.market_divergence_enabled,
        dividend_enabled=pref.dividend_enabled,
        analyst_change_enabled=pref.analyst_change_enabled,
        sensitivity=pref.sensitivity
    )

@router.put("", response_model=SignalPreferenceSchema)
async def update_signal_preferences(
    update_in: SignalPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SignalPreference).where(SignalPreference.user_id == current_user.id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()
    
    if not pref:
        pref = SignalPreference(user_id=current_user.id)
        db.add(pref)
        
    update_data = update_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(pref, field, val)
        
    await db.commit()
    await db.refresh(pref)
    
    return SignalPreferenceSchema(
        price_anomaly_enabled=pref.price_anomaly_enabled,
        volume_anomaly_enabled=pref.volume_anomaly_enabled,
        news_enabled=pref.news_enabled,
        sector_divergence_enabled=pref.sector_divergence_enabled,
        market_divergence_enabled=pref.market_divergence_enabled,
        dividend_enabled=pref.dividend_enabled,
        analyst_change_enabled=pref.analyst_change_enabled,
        sensitivity=pref.sensitivity
    )
