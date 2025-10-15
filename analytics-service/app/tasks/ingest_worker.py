import os
import asyncio, json, redis, duckdb
from app.db import get_conn, ensure_raw_table
from app.ingest import ingest_dict

r = redis.from_url(os.getenv("REDIS_URL"))
STREAM_KEY = "pos_stream:{org_id}"   # one stream per tenant

async def stream_consumer(org_id: str):
    conn = get_conn(org_id)
    ensure_raw_table(conn)
    while True:
        msgs = r.xread({STREAM_KEY.format(org_id=org_id): '$'}, count=100, block=5000)
        if msgs:
            _, entries = msgs[0]
            for _, data in entries:
                ingest_dict(org_id, json.loads(data[b'row']))
        await asyncio.sleep(1)   # 1 s micro-batch