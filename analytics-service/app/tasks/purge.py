from app.db import get_conn, ensure_raw_table
def purge_old_raw(org_id: str, hours=6):
    conn = get_conn(org_id)
    conn.execute("DELETE FROM raw_rows WHERE ingested_at < now() - INTERVAL ? HOURS", [hours])
    conn.commit(); conn.close()