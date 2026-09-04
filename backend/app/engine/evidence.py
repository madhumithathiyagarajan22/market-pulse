from typing import List, Dict, Any, Tuple

def generate_evidence_breakdown(
    symbol: str,
    stock_name: str,
    price_change_pct: float,
    z_score: float,
    volume_ratio: float,
    sector_name: str,
    sector_change_pct: float,
    market_change_pct: float,
    s_div: float,
    has_news: bool,
    news_title: str = "",
    news_time_formatted: str = "",
    is_stale: bool = False
) -> Tuple[List[Dict[str, Any]], str]:
    """
    Generates transparent evidence items and deterministic interpretation sentence.
    """
    evidence = []
    
    # 1. Price Anomaly Evidence
    price_direction = "down" if price_change_pct < 0 else "up"
    is_signif_price = z_score >= 1.8
    evidence.append({
        "category": "PRICE",
        "title": f"Price movement ({price_change_pct:+.1f}%)",
        "detail": f"{z_score:.1f} standard deviations from normal daily baseline",
        "is_positive": price_change_pct > 0,
        "score_contribution": round(min(100.0, z_score * 25.0), 1)
    })
    
    # 2. Volume Anomaly Evidence
    if volume_ratio >= 1.3:
        evidence.append({
            "category": "VOLUME",
            "title": f"Unusual Volume ({volume_ratio:.1f}× 30-day average)",
            "detail": f"Substantial trading activity surge detected relative to baseline",
            "is_positive": True,
            "score_contribution": round(min(100.0, volume_ratio * 30.0), 1)
        })
    else:
        evidence.append({
            "category": "VOLUME",
            "title": f"Normal Volume ({volume_ratio:.1f}× average)",
            "detail": f"Trading volume remains aligned with historical averages",
            "is_positive": False,
            "score_contribution": 10.0
        })
        
    # 3. Sector Divergence Evidence
    if s_div >= 1.2:
        evidence.append({
            "category": "SECTOR",
            "title": f"Sector Divergence ({s_div:+.1f}% gap)",
            "detail": f"{symbol} moved {price_change_pct:+.1f}% while {sector_name} sector moved {sector_change_pct:+.1f}%",
            "is_positive": False if price_change_pct < sector_change_pct else True,
            "score_contribution": round(min(100.0, s_div * 30.0), 1)
        })
    else:
        evidence.append({
            "category": "SECTOR",
            "title": f"Sector Consistency",
            "detail": f"Movement is broadly consistent with {sector_name} sector ({sector_change_pct:+.1f}%)",
            "is_positive": True,
            "score_contribution": 15.0
        })
        
    # 4. News Event Evidence
    if has_news and news_title:
        evidence.append({
            "category": "EVENT",
            "title": f"Material Company Event",
            "detail": f'"{news_title}" ({news_time_formatted})',
            "is_positive": True,
            "score_contribution": 75.0
        })
        
    # 5. Stale Data Flag
    if is_stale:
        evidence.append({
            "category": "DATA_QUALITY",
            "title": f"Data Delayed / Degraded",
            "detail": "Market feed data is delayed. Confidence score is lowered accordingly.",
            "is_positive": False,
            "score_contribution": -15.0
        })

    # Generate Deterministic Interpretation
    if s_div >= 1.5 and has_news:
        interpretation = f"The move appears strongly stock-specific. A recent company event ('{news_title}') coincided with abnormal movement ({price_change_pct:+.1f}%), while broader {sector_name} sector remained relatively muted ({sector_change_pct:+.1f}%)."
    elif s_div >= 1.5:
        interpretation = f"The move is primarily stock-specific ({price_change_pct:+.1f}% vs sector {sector_change_pct:+.1f}%). {volume_ratio:.1f}× volume suggests institutional repositioning ahead of upcoming announcements."
    elif abs(sector_change_pct) >= 1.5 and s_div < 1.0:
        interpretation = f"Movement in {symbol} ({price_change_pct:+.1f}%) is driven by broad {sector_name} sector trends ({sector_change_pct:+.1f}%). Individual company signals are normal."
    else:
        interpretation = f"Normal market movement. {symbol} is fluctuating within its expected historical volatility band with no unusual news or volume triggers."

    return evidence, interpretation
