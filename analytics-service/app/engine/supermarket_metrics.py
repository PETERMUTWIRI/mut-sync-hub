"""
Supermarket-specific KPI generator – works with ANY POS export.
Handles: Square, Lightspeed, Shopify POS, NCR, Oracle MICROS, QuickBooks POS
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any

# POS column alias map – covers 99 % of exports
_ALIAS = {
    "sku": ["sku", "barcode", "item_code", "plu", "product_id"],
    "qty": ["qty", "quantity", "units", "stock", "quantity_on_hand"],
    "expiry": ["expiry_date", "exp", "best_before", "use_by", "expiration"],
    "promo": ["promo", "promotion", "discount_code", "campaign", "is_promo"],
    "sales": ["total_line", "net_amount", "line_total", "amount", "sales_amount"],
    "transaction": ["transaction_id", "receipt_no", "ticket_no", "order_id"],
    "store": ["store_id", "branch_code", "location_id", "outlet_id"],
    "category": ["category", "department", "cat", "sub_category"],
    "loss": ["loss_qty", "waste_qty", "shrinkage_qty", "damaged_qty"],
    "customer": ["customer_id", "loyalty_id", "phone"],
    "price": ["unit_price", "price", "sell_price"],
    "cost": ["cost_price", "supply_price", "unit_cost"],
}

def _find_col(df: pd.DataFrame, keys):
    """Return first matching column or None."""
    for k in keys:
        for col in df.columns:
            if k.lower() in col.lower():
                return col
    return None

def supermarket_insights(df: pd.DataFrame) -> Dict[str, Any]:
    """Return supermarket KPIs & alerts – zero config."""
    df = df.copy()
    df.columns = [c.lower().strip() for c in df.columns]

    # --- resolve columns via alias map ---
    sku_col      = _find_col(df, _ALIAS["sku"])
    qty_col      = _find_col(df, _ALIAS["qty"])
    expiry_col   = _find_col(df, _ALIAS["expiry"])
    promo_col    = _find_col(df, _ALIAS["promo"])
    sales_col    = _find_col(df, _ALIAS["sales"])
    trans_col    = _find_col(df, _ALIAS["transaction"])
    store_col    = _find_col(df, _ALIAS["store"])
    cat_col      = _find_col(df, _ALIAS["category"])
    loss_col     = _find_col(df, _ALIAS["loss"])
    cust_col     = _find_col(df, _ALIAS["customer"])
    price_col    = _find_col(df, _ALIAS["price"])
    cost_col     = _find_col(df, _ALIAS["cost"])

    # 1  STOCK COUNT & SKU BREADTH
    stock = int(df[qty_col].sum()) if qty_col else 0
    unique_sku = int(df[sku_col].nunique()) if sku_col else 0

    # 2  EXPIRY ALERTS
    expiring_7d = 0
    if expiry_col:
        df[expiry_col] = pd.to_datetime(df[expiry_col], errors='coerce')
        expiring_7d = int((df[expiry_col] - datetime.now()).dt.days.le(7).sum())

    # 3  PROMO LIFT
    lift = 0.0
    if promo_col and sales_col:
        base = df[df[promo_col].astype(str).str[0].isin(['0','F','f'])][sales_col].mean()
        promo= df[df[promo_col].astype(str).str[0].isin(['1','T','t'])][sales_col].mean()
        lift = float((promo - base) / base * 100) if base else 0.0

    # 4  BASKET SIZE
    avg_basket = 0.0
    if trans_col and sales_col:
        basket = df.groupby(trans_col)[sales_col].sum()
        avg_basket = float(basket.mean())

    # 5  SHRINKAGE %
    shrink = 0.0
    if loss_col and qty_col:
        shrink = float(df[loss_col].sum() / df[qty_col].sum() * 100)

    # 6  FAST MOVERS (top 5)
    movers = {}
    if sku_col and qty_col:
        movers = (df.groupby(sku_col)[qty_col].sum()
                    .nlargest(5)
                    .to_dict())

    # 7  GROSS-MARGIN BY CATEGORY
    margin = {}
    if cat_col and price_col and cost_col:
        df['margin'] = (df[price_col] - df[cost_col]) / df[price_col] * 100
        margin = (df.groupby(cat_col)['margin'].mean()
                    .round(1)
                    .to_dict())

    # 8  CUSTOMER REACH
    unique_cust = int(df[cust_col].nunique()) if cust_col else 0

    # 9  STORE PERFORMANCE (if multi-outlet)
    store_perf = {}
    if store_col and sales_col:
        store_perf = (df.groupby(store_col)[sales_col].sum()
                        .round(0)
                        .to_dict())

    # 10 ALERTS
    alerts = []
    if expiring_7d:
        alerts.append({"type": "expiry",   "severity": "high", "message": f"{expiring_7d} SKUs expire ≤7 days"})
    if shrink > 1:
        alerts.append({"type": "shrinkage","severity": "med",  "message": f"Shrinkage {shrink:.1f} %"})
    if lift < 0:
        alerts.append({"type": "promo",    "severity": "low",  "message": "Promo discount deeper than lift"})

    return {
        "supermarket_kpis": {
            "stock_on_hand": stock,
            "unique_sku": unique_sku,
            "expiring_next_7_days": expiring_7d,
            "promo_lift_pct": round(lift, 1),
            "avg_basket_kes": round(avg_basket, 2),
            "shrinkage_pct": round(shrink, 2),
            "unique_customers": unique_cust,
        },
        "fast_movers": movers,
        "category_margin_pct": margin,
        "store_sales": store_perf,
        "alerts": alerts,
    }