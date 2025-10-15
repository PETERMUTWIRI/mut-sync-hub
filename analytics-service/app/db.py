import duckdb, os, pathlib

DB_DIR = pathlib.Path("./data/duckdb")
DB_DIR.mkdir(parents=True, exist_ok=True)   # one-shot parents + exist_ok

def get_conn(org_id: str):
    db_file = DB_DIR / f"{org_id}.duckdb"
    # rw mode lets DuckDB create the file if absent
    return duckdb.connect(str(db_file), read_only=False)

def bootstrap(org_id: str):
    with get_conn(org_id) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sales(
                timestamp   TIMESTAMP,
                product_id  VARCHAR,
                qty         INTEGER,
                total       DOUBLE,
                store_id    VARCHAR,
                category    VARCHAR,
                promo_flag  BOOLEAN,
                expiry_date DATE
            )
        """)

def ensure_kpi_log(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS kpi_log(
            ts          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            daily_sales DOUBLE,
            daily_qty   BIGINT,
            avg_basket  DOUBLE,
            shrinkage   DOUBLE,
            promo_lift  DOUBLE,
            stock       BIGINT
        )
    """)

def ensure_raw_table(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS raw_rows(
            ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            row_data    JSON
        )
    """)