"""
Analytics engine routes – DuckDB-backed, any-shape input.
Also exposes Neon-bridge endpoints so Next.js (Prisma) can store history.
"""
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from datetime import datetime
import json

from app.mapper import canonify_df
from app.engine.analytics import AnalyticsService
from app.utils.detect_industry import detect_industry
from app.service.industry_svc import (
    eda, forecast, basket, market_dynamics, supply_chain,
    customer_insights, operational_efficiency, risk_assessment, sustainability
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

analytics = AnalyticsService()

# --------------------------------------------------
# 1  RUN ANALYTIC – real-time, any column names
# --------------------------------------------------
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
    1. Canonify last 6 h of raw rows (any shape)
    2. Compute chosen analytic
    3. Return shaped payload
    """
    df = canonify_df(orgId)
    if df.empty:
        raise HTTPException(404, "No recent data found – please ingest or stream first.")

    data = df.to_dict("records")
    industry, _ = detect_industry(df)

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

# --------------------------------------------------
# 2  NEON BRIDGE – latest report for UI + push endpoint
# --------------------------------------------------
class PushReportIn(BaseModel):
    orgId: str
    type: str
    results: dict
    lastRun: datetime

@router.get("/report/latest")
def latest_report(orgId: str = Query(...)):
    """
    Returns the newest KPI snapshot we have for this org
    (shape matches Neon schema so Next.js can forward 1-to-1)
    """
    from app.db import get_conn

    conn = get_conn(orgId)
    row = conn.execute("""
        SELECT analytic_type, results, ts
        FROM   kpi_log
        WHERE  org_id = ?
        ORDER  BY ts DESC
        LIMIT  1
    """, [orgId]).fetchone()
    conn.close()

    if not row:
        raise HTTPException(404, "No report yet")

    return {
        "orgId": orgId,
        "type": row[0],
        "results": json.loads(row[1]) if isinstance(row[1], str) else row[1],
        "lastRun": row[2].isoformat(),
    }

@router.post("/report/push")
async def push_report(body: PushReportIn):
    """
    Internal endpoint – Next.js (Prisma) calls this to store history in Neon.
    Analytics container itself does **not** touch Prisma.
    """
    # optional: validate signature / api-key here if you want
    return {"status": "accepted", "orgId": body.orgId, "type": body.type}