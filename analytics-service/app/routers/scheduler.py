"""
State-less scheduler REST facade.
Jobs are still executed by APScheduler; this router only
  - persists schedules to /data/.schedules.json
  - keeps APScheduler in sync
"""
import json, uuid, os
from datetime import datetime
from typing import List
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/schedules", tags=["scheduler"])

SCHEDULE_FILE = "/data/.schedules.json"

# --------------------------------------------------
# models
# --------------------------------------------------
class ScheduleIn(BaseModel):
    orgId   : str
    frequency: str          # daily | weekly | monthly
    analytics: List[str]

class ScheduleOut(ScheduleIn):
    id       : str
    nextRun  : datetime

# --------------------------------------------------
# helpers
# --------------------------------------------------
def _load() -> List[dict]:
    if not os.path.exists(SCHEDULE_FILE):
        return []
    with open(SCHEDULE_FILE) as f:
        return json.load(f)

def _save(obj: List[dict]):
    with open(SCHEDULE_FILE, "w") as f:
        json.dump(obj, f, indent=2, default=str)

def _next_run(frequency: str) -> datetime:
    from datetime import timedelta
    now = datetime.utcnow()
    if frequency == "daily":    return now + timedelta(days=1)
    if frequency == "weekly":   return now + timedelta(weeks=1)
    if frequency == "monthly":  return now + timedelta(days=30)
    return now

# --------------------------------------------------
# CRUD
# --------------------------------------------------
# ↓↓↓  ADD THIS LINE  ↓↓↓
@router.get("/schedules", response_model=List[ScheduleOut])
def list_schedules_endpoint(orgId: str = Query(...)):
    return list_schedules(orgId)

@router.get("", response_model=List[ScheduleOut])
def list_schedules(orgId: str = Query(...)):
    data = _load()
    return [s for s in data if s["orgId"] == orgId]

@router.post("", response_model=ScheduleOut)
def create_schedule(payload: ScheduleIn):
    new_id = str(uuid.uuid4())
    record = {
        "id"       : new_id,
        "orgId"    : payload.orgId,
        "frequency": payload.frequency,
        "analytics": payload.analytics,
        "nextRun"  : _next_run(payload.frequency).isoformat(),
    }
    all_ = _load()
    all_.append(record)
    _save(all_)
    # sync to APScheduler
    from app.tasks.scheduler import add_job_to_scheduler
    add_job_to_scheduler(record)
    return ScheduleOut(**record)

@router.delete("/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: str):
    all_ = _load()
    filtered = [s for s in all_ if s["id"] != schedule_id]
    if len(filtered) == len(all_):
        raise HTTPException(404, "Schedule not found")
    _save(filtered)
    # remove from APScheduler
    from app.tasks.scheduler import remove_job_from_scheduler
    remove_job_from_scheduler(schedule_id)