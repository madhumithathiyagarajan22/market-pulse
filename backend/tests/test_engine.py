import pytest
from app.engine.scorer import (
    compute_attention_score,
    calculate_price_anomaly_score,
    calculate_volume_anomaly_score,
    calculate_sector_divergence_score
)
from app.engine.evidence import generate_evidence_breakdown
from app.engine.aggregator import aggregate_sector_movements

def test_attention_score_calculation():
    score_data = compute_attention_score(
        price_change_pct=-2.8,
        current_volume=8100000.0,
        sector_change_pct=-0.8,
        market_change_pct=-0.4,
        typical_daily_pct=0.9,
        historical_volatility=0.012,
        avg_volume_30d=3000000.0,
        has_recent_news=True,
        news_impact=85.0
    )
    
    assert score_data["final_score"] >= 70.0
    assert score_data["volume_ratio"] >= 2.5
    assert score_data["z_score"] >= 2.0

def test_price_anomaly_detection():
    p_score_unusual, z_unusual = calculate_price_anomaly_score(-3.0, typical_daily_pct=0.9, historical_volatility_pct=0.009)
    p_score_normal, z_normal = calculate_price_anomaly_score(-3.0, typical_daily_pct=3.2, historical_volatility_pct=0.032)
    
    assert z_unusual > z_normal
    assert p_score_unusual > p_score_normal

def test_volume_anomaly_detection():
    v_score_high, ratio_high = calculate_volume_anomaly_score(3000000.0, 1000000.0)
    v_score_norm, ratio_norm = calculate_volume_anomaly_score(1100000.0, 1000000.0)
    
    assert ratio_high == 3.0
    assert v_score_high > 70.0
    assert v_score_norm == 0.0

def test_sector_divergence():
    s_score_high, s_div_high = calculate_sector_divergence_score(-4.2, -0.4)
    s_score_low, s_div_low = calculate_sector_divergence_score(-2.8, -2.9)
    
    assert s_div_high > 3.0
    assert s_score_high > 80.0
    assert s_div_low < 0.2

def test_sector_aggregation_vs_stock_isolation():
    events = [
        {"stock_symbol": "ONGC", "sector": "ENERGY", "price_change_pct": -2.8, "sector_change_pct": -2.9, "attention_score": 35},
        {"stock_symbol": "BPCL", "sector": "ENERGY", "price_change_pct": -2.5, "sector_change_pct": -2.9, "attention_score": 30},
        {"stock_symbol": "RELIANCE", "sector": "ENERGY", "price_change_pct": -4.2, "sector_change_pct": -0.4, "attention_score": 88}
    ]
    
    stories, standalone = aggregate_sector_movements(events)
    
    assert len(stories) == 1
    assert stories[0]["sector_name"] == "ENERGY"
    assert "ONGC" in stories[0]["stock_symbols"]
    assert "BPCL" in stories[0]["stock_symbols"]
    assert any(s["stock_symbol"] == "RELIANCE" for s in standalone)

def test_evidence_generation():
    evidence, interpretation = generate_evidence_breakdown(
        symbol="RELIANCE",
        stock_name="Reliance Industries",
        price_change_pct=-2.8,
        z_score=2.5,
        volume_ratio=2.7,
        sector_name="ENERGY",
        sector_change_pct=-0.8,
        market_change_pct=-0.4,
        s_div=2.0,
        has_news=True,
        news_title="Strategic Partnership",
        news_time_formatted="42m ago"
    )
    
    assert len(evidence) >= 4
    assert any(e["category"] == "EVENT" for e in evidence)
    assert "stock-specific" in interpretation.lower()
