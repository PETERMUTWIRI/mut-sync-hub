# from fastapi import APIRouter, Depends
# from pydantic import BaseModel
# from app.deps import verify_key

# router = APIRouter(prefix="/api/v1", tags=["datasources"])

# class NewSource(BaseModel):
#     orgId: str
#     sourceId: str
#     type: str
#     config: dict

# @router.post("/datasources")
# def create_source(payload: NewSource, _: str = Depends(verify_key)):
#     print("[analytics] new source", payload)
#     return {"id": payload.sourceId, "status": "sync_queued"}