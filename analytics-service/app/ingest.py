from datetime import datetime
def ingest_dict(org_id: str, payload: dict):
    conn = get_conn(org_id)
    ensure_raw_table(conn)
    conn.execute("INSERT INTO raw_rows(row_data) VALUES (?)", [json.dumps(payload)])
    conn.close()