# app/routers/flags.py
from fastapi import APIRouter, Depends, HTTPException
import httpx
from app.deps import verify_key
import os

router = APIRouter(prefix="/flags", tags=["Feature Flags"])
NEXT_API = os.getenv("NEXT_API")      # never hard-code localhost          # internal Docker name (or env var)

@router.get("/{key}")
async def read_flag(key: str, _: str = Depends(verify_key)):
    async with httpx.AsyncClient() as c:
        r = await c.get(f"{NEXT_API}/api/flags/{key}", headers={"x-api-key": "dev-analytics-key-123"})
    if r.status_code == 404:
        raise HTTPException(404, "Flag not found")
    return r.json()

@router.put("/{key}")
async def set_flag(key: str, body: dict, _: str = Depends(verify_key)):
    async with httpx.AsyncClient() as c:
        r = await c.put(f"{NEXT_API}/api/flags/{key}", json=body, headers={"x-api-key": "dev-analytics-key-123"})
    return r.json()