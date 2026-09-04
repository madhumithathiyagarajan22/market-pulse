from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import PulseResponse, CatchUpResponse
from app.services.pulse_service import get_market_pulse, update_user_checkpoint
from app.engine.catch_up import compress_catch_up_events

router = APIRouter(prefix="/pulse", tags=["Market Pulse"])

@router.get("", response_model=PulseResponse)
async def fetch_pulse(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_market_pulse(db, current_user.id)

@router.post("/check")
async def mark_pulse_checked(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cp = await update_user_checkpoint(db, current_user.id)
    return {
        "message": "Checkpoint updated successfully",
        "last_checked_at": cp.last_checked_at
    }

@router.get("/catch-up", response_model=CatchUpResponse)
async def get_catch_up(
    hours: float = 68.0,
    current_user: User = Depends(get_current_user)
):
    res = compress_catch_up_events(hours_absent=hours, stocks_tracked=12)
    return CatchUpResponse(**res)
