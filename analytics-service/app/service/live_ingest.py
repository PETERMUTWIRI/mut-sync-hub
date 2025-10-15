import json, pandas as pd, redis
from datetime import datetime
from app.engine.analytics import AnalyticsService
from app.redis_pool import redis_client

class LiveIngestService:
    def __init__(self, org_id: str):
        self.org_id = org_id
        self.buffer: list[dict] = []
        self.analytics = AnalyticsService()

    async def handle(self, msg: dict):
        if msg.get("event") != "sale": return
        self.buffer.append(msg["data"])
        if len(self.buffer) >= 100 or self._older_than_3s():
            await self._flush()

    async def _flush(self):
        if not self.buffer: return
        df = pd.DataFrame(self.buffer)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        industry = self._detect_industry(df)
        report = self.analytics.perform_eda(df.to_dict("records"), industry=industry)
        redis_client.setex(f"live:{self.org_id}", 300, json.dumps(report, default=str))
        self.buffer.clear()

    def _older_than_3s(self) -> bool:
        return self.buffer and (pd.Timestamp.utcnow() - pd.to_datetime(self.buffer[-1]["timestamp"])).seconds > 3

    def _detect_industry(self, df: pd.DataFrame) -> str:
        cols = set(df.columns)
        if {"product_id", "qty", "price", "total"}.issubset(cols): return "supermarket"
        if {"sku", "wholesale_price"}.issubset(cols): return "wholesale"
        return "retail"
