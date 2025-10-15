import json, time, os, requests
from datetime import datetime, timedelta  
from pathlib import Path

SCHEDULE_FILE = "/data/.schedules.json"
RUN_URL = "http://localhost:8000/analytics/run"   # inside container

def tick():
    if not Path(SCHEDULE_FILE).exists():
        return
    with open(SCHEDULE_FILE) as f:
        schedules = json.load(f)

    now = datetime.utcnow().isoformat()
    for s in schedules:
        if s["nextRun"] <= now:
            for analytic in s["analytics"]:
                # call the same endpoint the UI uses
                r = requests.post(RUN_URL,
                                  json={"analytic": analytic},
                                  headers={"X-Data-Path": f"/data/{s['orgId']}/sales.parquet"})
                print(f"[scheduler] ran {analytic} for {s['orgId']} -> {r.status_code}")
            # bump nextRun
            s["nextRun"] = (_next_run(s["frequency"])).isoformat()

    with open(SCHEDULE_FILE, "w") as f:
        json.dump(schedules, f, indent=2)

def _next_run(frequency: str) -> datetime:
    now = datetime.utcnow()
    if frequency == "daily":   return now + timedelta(days=1)
    if frequency == "weekly":  return now + timedelta(weeks=1)
    if frequency == "monthly": return now + timedelta(days=30)
    return now

if __name__ == "__main__":
    while True:
        try:
            tick()
        except Exception as e:
            print("[scheduler] error:", e)
        time.sleep(60)   # 1-minute granularity