import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.api.v1 import auth, watchlist, pulse, stocks, settings as settings_api, data_quality
from app.services.auth_service import register_user
from app.schemas.schemas import UserCreate

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Seed default demo user if not exists
    async with AsyncSessionLocal() as session:
        try:
            demo_user = UserCreate(
                email="demo@marketpulse.io",
                password="demopassword123",
                full_name="Demo User"
            )
            await register_user(session, demo_user)
            print("Successfully seeded demo user (demo@marketpulse.io / demopassword123)")
        except Exception:
            # Demo user already exists or seeded
            pass
            
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(watchlist.router, prefix=settings.API_V1_STR)
app.include_router(pulse.router, prefix=settings.API_V1_STR)
app.include_router(stocks.router, prefix=settings.API_V1_STR)
app.include_router(settings_api.router, prefix=settings.API_V1_STR)
app.include_router(data_quality.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "app": "Market Pulse API",
        "tagline": "Don't watch the market. Know what changed.",
        "version": settings.VERSION,
        "docs": "/docs",
        "demo_credentials": {
            "email": "demo@marketpulse.io",
            "password": "demopassword123"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
