import duckdb
from app.db import get_conn, ensure_kpi_log
from app.mapper import canonify_df          # gives uniform DF
from app.engine.analytics import AnalyticsService
from app.utils.detect_industry import detect_industry

analytics = AnalyticsService()

def log_kpis_and_purge(org_id: str) -> None:
    """
    1. Canonify last 6 h of raw rows
    2. Compute KPIs
    3. Insert into kpi_log (history)
    4. Delete raw rows older than 6 h
    """
    conn = get_conn(org_id)
    ensure_kpi_log(conn)

    df = canonify_df(org_id)
    if df.empty:
        conn.close()
        return

    industry, _ = detect_industry(df)
    kpis = analytics.perform_eda(df.to_dict("records"), industry).get("supermarket_kpis", {})

    conn.execute(
        """INSERT INTO kpi_log(daily_sales, daily_qty, avg_basket,
                               shrinkage, promo_lift, stock)
           VALUES (?,?,?,?,?,?)""",
        [
            kpis.get("daily_sales", 0),
            kpis.get("daily_qty", 0),
            kpis.get("avg_basket", 0),
            kpis.get("shrinkage_pct", 0),
            kpis.get("promo_lift_pct", 0),
            kpis.get("stock_on_hand", 0),
        ],
    )

    # purge raw buffer
    conn.execute("DELETE FROM raw_rows WHERE ingested_at < now() - INTERVAL 6 HOUR")
    conn.commit()
    conn.close()