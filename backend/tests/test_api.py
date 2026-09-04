import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.database import engine, Base, AsyncSessionLocal
from app.services.auth_service import register_user
from app.schemas.schemas import UserCreate

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        try:
            demo_user = UserCreate(
                email="demo@marketpulse.io",
                password="demopassword123",
                full_name="Demo User"
            )
            await register_user(session, demo_user)
        except Exception:
            pass
    yield

@pytest.mark.asyncio
async def test_auth_and_pulse_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register User A
        reg_res = await ac.post("/api/v1/auth/register", json={
            "email": "userA@test.com",
            "password": "password123",
            "full_name": "User A"
        })
        assert reg_res.status_code == 200
        
        # 2. Login User A
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "userA@test.com",
            "password": "password123"
        })
        assert login_res.status_code == 200
        token_a = login_res.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}
        
        # 3. Fetch Market Pulse for User A
        pulse_res = await ac.get("/api/v1/pulse", headers=headers_a)
        assert pulse_res.status_code == 200
        data_a = pulse_res.json()
        assert "hero" in data_a
        assert data_a["hero"]["stocks_tracked_count"] == 11
        
        # 4. Register User B
        await ac.post("/api/v1/auth/register", json={
            "email": "userB@test.com",
            "password": "password123",
            "full_name": "User B"
        })
        token_b = (await ac.post("/api/v1/auth/login", json={"email": "userB@test.com", "password": "password123"})).json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}
        
        # 5. User Isolation Check
        wl_a = await ac.get("/api/v1/watchlist", headers=headers_a)
        wl_b = await ac.get("/api/v1/watchlist", headers=headers_b)
        assert wl_a.json()["id"] != wl_b.json()["id"]

@pytest.mark.asyncio
async def test_watchlist_add_delete():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@marketpulse.io",
            "password": "demopassword123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Add new stock
        add_res = await ac.post("/api/v1/watchlist", json={"symbol": "MARUTI"}, headers=headers)
        assert add_res.status_code in [200, 400]
        
        # Delete stock
        del_res = await ac.delete("/api/v1/watchlist/MARUTI", headers=headers)
        assert del_res.status_code == 200
