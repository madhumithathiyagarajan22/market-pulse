from typing import List, Dict, Any, Tuple

def aggregate_sector_movements(
    change_events: List[Dict[str, Any]],
    sector_threshold: float = 1.5,
    min_stocks_for_grouping: int = 2
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Distinguishes between broad sector-wide movements and isolated stock-specific outliers.
    
    If 2+ stocks in a sector move together within 1.0% of the sector move,
    group them into a single Sector Story and remove individual cards if attention is low.
    If a stock diverges significantly from its sector, keep it elevated as HIGH ATTENTION.
    """
    sector_groups: Dict[str, List[Dict[str, Any]]] = {}
    
    for event in change_events:
        sector = event.get("sector", "OTHER")
        if sector not in sector_groups:
            sector_groups[sector] = []
        sector_groups[sector].append(event)
        
    sector_stories = []
    standalone_events = []
    
    for sector, events in sector_groups.items():
        if len(events) >= min_stocks_for_grouping:
            avg_sector_change = sum(e.get("sector_change_pct", 0.0) for e in events) / len(events)
            avg_stock_change = sum(e.get("price_change_pct", 0.0) for e in events) / len(events)
            
            # Check if all events in this group are consistent with sector move
            in_sync_events = [
                e for e in events 
                if abs(e.get("price_change_pct", 0.0) - e.get("sector_change_pct", 0.0)) < 1.2
            ]
            
            if len(in_sync_events) >= min_stocks_for_grouping and abs(avg_sector_change) >= 1.2:
                # Create aggregated sector story
                symbols = [e["stock_symbol"] for e in in_sync_events]
                direction = "SELLOFF" if avg_sector_change < 0 else "RALLY"
                headline = f"{sector.upper()} SECTOR {direction}"
                summary = f"{len(symbols)} stocks in your watchlist ({', '.join(symbols)}) moved {avg_stock_change:+.1f}%, broadly consistent with the {sector} sector move ({avg_sector_change:+.1f}%). Stock-specific alert suppressed."
                
                sector_stories.append({
                    "sector_name": sector,
                    "stock_symbols": symbols,
                    "sector_change_pct": round(avg_sector_change, 2),
                    "market_change_pct": events[0].get("market_change_pct", 0.0),
                    "headline": headline,
                    "summary": summary,
                    "attention_level": "WATCH" if abs(avg_sector_change) >= 2.5 else "NORMAL"
                })
                
                # Add diverging events as standalone, omit in-sync ones from top feed
                for e in events:
                    if e not in in_sync_events or e.get("attention_score", 0) >= 70:
                        standalone_events.append(e)
            else:
                standalone_events.extend(events)
        else:
            standalone_events.extend(events)
            
    return sector_stories, standalone_events
