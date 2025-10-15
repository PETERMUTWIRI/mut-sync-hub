import os
from fastapi import HTTPException, Header

API_KEYS = os.getenv("API_KEYS", "").split(",")

def verify_key(x_api_key: str = Header(None, convert_underscores=True)):   # ← accept any case
    print(f"[verify_key] received: {x_api_key}, allowed: {API_KEYS}")
    if not x_api_key or x_api_key not in API_KEYS:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key