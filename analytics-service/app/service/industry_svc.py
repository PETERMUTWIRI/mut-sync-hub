"""
Pure async wrappers around AnalyticsService – no quota, no DB.
"""
from typing import Any, Dict, List, Optional
import pandas as pd
from app.engine.analytics import AnalyticsService

analytics = AnalyticsService()

# ------------------------------------------------------------------
# 1  EDA – full exploratory + industry auto-detect
# ------------------------------------------------------------------
async def eda(data: List[Dict], industry: Optional[str] = None) -> Dict[str, Any]:
    return analytics.perform_eda(data, industry)

# ------------------------------------------------------------------
# 2  FORECAST – Prophet 30-day forward
# ------------------------------------------------------------------
async def forecast(data: List[Dict], date_column: str, value_column: str) -> Dict[str, Any]:
    return analytics.forecast_timeseries(data, date_column, value_column)

# ------------------------------------------------------------------
# 3  BASKET – market basket analysis
# ------------------------------------------------------------------
async def basket(data: List[Dict],
                 min_support: float = 0.01,
                 min_confidence: float = 0.3,
                 min_lift: float = 1.0) -> Dict[str, Any]:
    df = pd.DataFrame(data)
    return analytics.perform_market_basket_analysis(df, min_support, min_confidence, min_lift)

# ------------------------------------------------------------------
# 4  CROSS-INDUSTRY INSIGHTS – one per endpoint
# ------------------------------------------------------------------
async def market_dynamics(data: List[Dict]) -> Dict[str, Any]:
    df = pd.DataFrame(data)
    return analytics._analyze_market_dynamics(df)

async def supply_chain(data: List[Dict]) -> Dict[str, Any]:
    df = pd.DataFrame(data)
    return analytics._analyze_supply_chain(df)

async def customer_insights(data: List[Dict]) -> Dict[str, Any]:
    df = pd.DataFrame(data)
    return analytics._analyze_customer_insights(df)

async def operational_efficiency(data: List[Dict]) -> Dict[str, Any]:
    df = pd.DataFrame(data)
    return analytics._analyze_operational_efficiency(df)

async def risk_assessment(data: List[Dict]) -> Dict[str, Any]:
    df = pd.DataFrame(data)
    return analytics._analyze_risk_patterns(df)

async def sustainability(data: List[Dict]) -> Dict[str, Any]:
    df = pd.DataFrame(data)
    return analytics._analyze_sustainability_metrics(df)