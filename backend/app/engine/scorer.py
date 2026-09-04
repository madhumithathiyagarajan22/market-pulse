import math
from typing import Dict, Any, List, Tuple

def calculate_price_anomaly_score(change_pct: float, typical_daily_pct: float, historical_volatility_pct: float) -> Tuple[float, float]:
    """
    Calculates normalized price anomaly score (0-100) and z-score based on stock baseline.
    Normalizes against stock's historical volatility and typical daily range.
    """
    baseline_std = max(historical_volatility_pct * 100.0, typical_daily_pct)
    if baseline_std <= 0:
        baseline_std = 1.0
        
    z_score = abs(change_pct) / baseline_std
    
    # 0-1 std = 0-25, 1-2 std = 25-55, 2-3 std = 55-85, 3+ std = 85-100
    if z_score <= 1.0:
        score = z_score * 25.0
    elif z_score <= 2.0:
        score = 25.0 + (z_score - 1.0) * 30.0
    elif z_score <= 3.0:
        score = 55.0 + (z_score - 2.0) * 30.0
    else:
        score = min(100.0, 85.0 + (z_score - 3.0) * 15.0)
        
    return round(score, 1), round(z_score, 2)

def calculate_volume_anomaly_score(current_volume: float, avg_volume_30d: float) -> Tuple[float, float]:
    """
    Calculates volume anomaly score (0-100) relative to 30-day average.
    Suppresses normal minor volume fluctuations (<= 1.1x).
    """
    if avg_volume_30d <= 0:
        return 0.0, 1.0
        
    ratio = current_volume / avg_volume_30d
    
    # <= 1.1x = 0 score, 1.5x = 30, 2.0x = 60, 3.0x = 85, 5.0x+ = 100
    if ratio <= 1.1:
        score = 0.0
    elif ratio <= 1.5:
        score = (ratio - 1.1) * 75.0
    elif ratio <= 2.0:
        score = 30.0 + (ratio - 1.5) * 60.0
    elif ratio <= 3.0:
        score = 60.0 + (ratio - 2.0) * 25.0
    else:
        score = min(100.0, 85.0 + (ratio - 3.0) * 7.5)
        
    return round(score, 1), round(ratio, 2)

def calculate_sector_divergence_score(stock_change_pct: float, sector_change_pct: float) -> Tuple[float, float]:
    divergence = abs(stock_change_pct - sector_change_pct)
    if divergence <= 0.5:
        score = divergence * 20.0
    elif divergence <= 1.5:
        score = 10.0 + (divergence - 0.5) * 40.0
    elif divergence <= 3.0:
        score = 50.0 + (divergence - 1.5) * 23.3
    else:
        score = min(100.0, 85.0 + (divergence - 3.0) * 7.5)
        
    return round(score, 1), round(divergence, 2)

def calculate_market_divergence_score(stock_change_pct: float, market_change_pct: float) -> Tuple[float, float]:
    divergence = abs(stock_change_pct - market_change_pct)
    if divergence <= 0.5:
        score = divergence * 20.0
    elif divergence <= 1.5:
        score = 10.0 + (divergence - 0.5) * 40.0
    elif divergence <= 3.0:
        score = 50.0 + (divergence - 1.5) * 23.3
    else:
        score = min(100.0, 85.0 + (divergence - 3.0) * 7.5)
        
    return round(score, 1), round(divergence, 2)

def compute_attention_score(
    price_change_pct: float,
    current_volume: float,
    sector_change_pct: float,
    market_change_pct: float,
    typical_daily_pct: float,
    historical_volatility: float,
    avg_volume_30d: float,
    has_recent_news: bool,
    news_impact: float = 0.0,
    sensitivity: float = 1.0,
    is_stale: bool = False
) -> Dict[str, Any]:
    """
    Deterministic scoring model:
    attention_score = (
        0.30 * price_anomaly
      + 0.25 * volume_anomaly
      + 0.25 * event_significance
      + 0.10 * sector_divergence
      + 0.10 * market_divergence
    ) * sensitivity
    """
    p_score, z_score = calculate_price_anomaly_score(price_change_pct, typical_daily_pct, historical_volatility)
    v_score, v_ratio = calculate_volume_anomaly_score(current_volume, avg_volume_30d)
    s_score, s_div = calculate_sector_divergence_score(price_change_pct, sector_change_pct)
    m_score, m_div = calculate_market_divergence_score(price_change_pct, market_change_pct)
    
    e_score = news_impact if has_recent_news else 0.0
    
    raw_score = (
        0.30 * p_score +
        0.25 * v_score +
        0.25 * e_score +
        0.10 * s_score +
        0.10 * m_score
    ) * sensitivity
    
    if is_stale:
        raw_score *= 0.85
        
    final_score = round(min(100.0, max(0.0, raw_score)), 1)
    
    if final_score < 30.0:
        level = "NORMAL"
    elif final_score < 60.0:
        level = "WATCH"
    elif final_score < 75.0:
        level = "IMPORTANT"
    else:
        level = "HIGH"
        
    return {
        "final_score": final_score,
        "attention_level": level,
        "price_anomaly_score": p_score,
        "z_score": z_score,
        "volume_anomaly_score": v_score,
        "volume_ratio": v_ratio,
        "sector_divergence_score": s_score,
        "sector_divergence": s_div,
        "market_divergence_score": m_score,
        "market_divergence": m_div,
        "event_significance_score": e_score,
        "is_stale": is_stale
    }
