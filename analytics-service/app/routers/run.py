"""
Analytics engine routes – stateless, DuckDB-backed, any-shape input.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd

from app.mapper import canonify_df                      # NEW
from app.engine.analytics import AnalyticsService
from app.utils.detect_industry import detect_industry
from app.service.industry_svc import (
    eda, forecast, basket, market_dynamics, supply_chain,
    customer_insights, operational_efficiency, risk_assessment, sustainability
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

class RunAnalyticIn(BaseModel):
    analytic: str
    dateColumn: str | None = None
    valueColumn: str | None = None
    minSupport: float = 0.01
    minConfidence: float = 0.3
    minLift: float = 1.0

@router.post("/run")
async def run_analytic(orgId: str, body: RunAnalyticIn):
    """
    1. Pull last 6 h of raw rows (any column names)
    2. Map -> canonical DataFrame
    3. Run chosen analytic
    4. Return shaped result
    """
    df = canonify_df(orgId)                # ← replaces pd.read_parquet
    if df.empty:
        raise HTTPException(404, "No recent data found – please ingest or stream first.")

    industry, _ = detect_industry(df)
    data = df.to_dict("records")

    match body.analytic:
        case "eda":
            result = await eda(data, industry)
        case "forecast":
            if not body.dateColumn or not body.valueColumn:
                raise HTTPException(400, "dateColumn & valueColumn required")
            result = await forecast(data, body.dateColumn, body.valueColumn)
        case "basket":
            result = await basket(data, body.minSupport, body.minConfidence, body.minLift)
        case "market-dynamics":
            result = await market_dynamics(data)
        case "supply-chain":
            result = await supply_chain(data)
        case "customer-insights":
            result = await customer_insights(data)
        case "operational-efficiency":
            result = await operational_efficiency(data)
        case "risk-assessment":
            result = await risk_assessment(data)
        case "sustainability":
            result = await sustainability(data)
        case _:
            raise HTTPException(400, "Unknown analytic")

    return {"industry": industry, "data": result}