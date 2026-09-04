const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface EvidenceItem {
  category: string;
  title: string;
  detail: string;
  is_positive: boolean;
  score_contribution: number;
}

export interface ChangeEvent {
  id: number;
  stock_symbol: string;
  stock_name: string;
  sector: string;
  timestamp: string;
  price: number;
  price_change_pct: number;
  volume_ratio: number;
  sector_change_pct: number;
  market_change_pct: number;
  attention_score: number;
  attention_level: "NORMAL" | "WATCH" | "IMPORTANT" | "HIGH";
  evidence: EvidenceItem[];
  interpretation: string;
  episode_headline?: string;
  recent_news?: {
    title: string;
    source: string;
    url?: string;
    time_ago?: string;
  };
}

export interface SectorStory {
  sector_name: string;
  stock_symbols: string[];
  sector_change_pct: number;
  market_change_pct: number;
  headline: string;
  summary: string;
  attention_level: string;
}

export interface SuppressedStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change_pct: number;
  reason: string;
}

export interface HeroAway {
  is_first_visit: boolean;
  time_away_formatted: string;
  hours_away: number;
  stocks_tracked_count: number;
  price_movements_count: number;
  events_count: number;
  meaningful_changes_count: number;
  headline: string;
  subtext: string;
}

export interface PulseResponse {
  hero: HeroAway;
  high_attention_changes: ChangeEvent[];
  medium_attention_changes: ChangeEvent[];
  sector_stories: SectorStory[];
  suppressed_stocks: SuppressedStock[];
  market_closed: boolean;
  market_closed_message?: string;
  data_quality_warning?: string;
  demo_mode: boolean;
}

export interface StockDetail {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  currency: string;
  price: number;
  change_pct: number;
  volume: number;
  avg_volume_30d: number;
  typical_daily_pct_change: number;
  historical_volatility_pct: number;
  attention_score: number;
  attention_level: string;
  interpretation: string;
  evidence: EvidenceItem[];
  timeline: {
    timestamp: string;
    time_formatted: string;
    type: string;
    title: string;
    description: string;
    impact_level: string;
  }[];
  recent_news: any[];
  data_freshness: string;
}

export interface SignalPreferences {
  price_anomaly_enabled: boolean;
  volume_anomaly_enabled: boolean;
  news_enabled: boolean;
  sector_divergence_enabled: boolean;
  market_divergence_enabled: boolean;
  dividend_enabled: boolean;
  analyst_change_enabled: boolean;
  sensitivity: number;
}

export interface DataQuality {
  overall_status: string;
  overall_confidence_pct: number;
  sources: {
    source_name: string;
    status: string;
    last_updated: string;
    latency_ms: number;
    details: string;
  }[];
  active_warnings: string[];
}

export interface CatchUpResponse {
  hours_absent: number;
  total_events_missed: number;
  stories: {
    id: number;
    stock_symbol?: string;
    title: string;
    summary: string;
    event_count: number;
    category: string;
  }[];
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pulse_token");
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: "API Error" }));
      throw new Error(errData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<string> {
    const data = await this.request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("pulse_token", data.access_token);
    }
    return data.access_token;
  }

  async register(email: string, password: string, full_name: string): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async getPulse(): Promise<PulseResponse> {
    return this.request<PulseResponse>("/pulse");
  }

  async markChecked(): Promise<void> {
    await this.request("/pulse/check", { method: "POST" });
  }

  async getWatchlist(): Promise<{ id: number; name: string; items: any[] }> {
    return this.request("/watchlist");
  }

  async addWatchlistStock(symbol: string): Promise<any> {
    return this.request("/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    });
  }

  async deleteWatchlistStock(symbol: string): Promise<any> {
    return this.request(`/watchlist/${symbol}`, { method: "DELETE" });
  }

  async getStockDetail(symbol: string): Promise<StockDetail> {
    return this.request<StockDetail>(`/stocks/${symbol}`);
  }

  async getSignalPreferences(): Promise<SignalPreferences> {
    return this.request<SignalPreferences>("/settings/signals");
  }

  async updateSignalPreferences(update: Partial<SignalPreferences>): Promise<SignalPreferences> {
    return this.request<SignalPreferences>("/settings/signals", {
      method: "PUT",
      body: JSON.stringify(update),
    });
  }

  async getDataQuality(): Promise<DataQuality> {
    return this.request<DataQuality>("/data-quality");
  }

  async getCatchUp(hours: number = 68.0): Promise<CatchUpResponse> {
    return this.request<CatchUpResponse>(`/pulse/catch-up?hours=${hours}`);
  }
}

export const api = new ApiClient();
