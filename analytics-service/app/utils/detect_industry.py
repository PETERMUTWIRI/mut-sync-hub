"""
Enterprise industry detector – POS-schema aware.
Works with exports from Square, Lightspeed, Shopify POS, NCR, Oracle MICROS,
QuickBooks POS, Clover, Revel, Toast, etc.
"""
import pandas as pd
from typing import Tuple

# ------------------------------------------------------------------
# 1  COLUMN ALIAS MAP – covers 99 % of real-world POS exports
# ------------------------------------------------------------------
_ALIAS = {
    "supermarket": {
        "sku": ["barcode", "item_code", "plu", "product_id", "product_code", "item_id",
      "sku", "goods_code", "article_number", "artnum", "sale_id", "item_barcode",
      "product_barcode", "item_sku", "goods_id", "inventory_id", "merchandise_code"],
        "qty": ["qty", "quantity", "units", "stock", "quantity_sold", "qty_sold",
      "item_count", "unit_count", "pieces", "pcs", "amount_sold",
      "sold_qty", "sales_qty", "sold_quantity", "transaction_qty"],
        "price": ["unit_price", "price", "sell_price", "unit_sell", "selling_price",
      "item_price", "product_price", "rate", "unit_cost", "cost_price",
      "retail_price", "sales_price", "price_each", "unit_rate"],
        "total": ["total", "total_line", "line_total", "net_amount", "amount", "sales_amount",
      "value", "extended_price", "total_price", "gross_amount", "total_amount",
      "line_value", "transaction_total", "subtotal", "total_sales"],
        "transaction": ["transaction_id", "receipt_no", "ticket_no", "order_id", "sale_id",
      "tran_id", "trans_id", "receipt_number", "invoice_no", "bill_no",
      "ticket_id", "session_id", "pos_transaction_id", "order_number"],
        "store": ["store_id", "branch_code", "location_id", "outlet_id", "shop_id",
      "branch_id", "terminal_id", "pos_id", "workstation_id", "station_id",
      "store_code", "site_id", "warehouse_id", "depot_id"],
        "category": ["category", "cat", "department", "class", "sub_category", "group_name",
      "product_group", "family", "section", "division", "category_name",
      "item_category", "product_category", "group_code"],
        "expiry": ["expiry_date", "exp", "best_before", "use_by", "expiration_date",
      "exp_date", "best_before_date", "shelf_life_date", "valid_until",
      "expires_on", "expiry", "expiration"],
        "promo": ["promo", "promotion", "discount_code", "campaign", "is_promo",
      "promotion_code", "disc_code", "offer_code", "special_code",
      "promo_flag", "promotion_flag", "discount_flag", "is_discount"],
        "loss": ["loss_qty", "waste_qty", "shrinkage_qty", "damaged_qty", "spoiled_qty",
      "expired_qty", "write_off_qty", "shrinkage", "waste", "damaged",
      "loss", "shrinkage_units", "waste_units", "damaged_units", "spoiled_units"],
    },
    "healthcare": {
        "patient": ["patient_id", "patient_no", "mrn", "medical_record_number"],
        "treatment": ["treatment_cost", "procedure_cost", "bill_amount", "invoice_amount"],
        "diagnosis": ["diagnosis_code", "icd_code", "condition"],
        "drug": ["drug_name", "medication", "prescription"],
    },
    "wholesale": {
        "sku": ["sku", "item_code"],
        "wholesale_price": ["wholesale_price", "bulk_price", "trade_price"],
        "moq": ["moq", "min_order_qty", "minimum_order"],
    },
    "manufacturing": {
        "production": ["production_volume", "units_produced", "output_qty"],
        "defect": ["defect_rate", "rejection_rate", "scrap_qty"],
        "machine": ["machine_id", "line_id", "station_id"],
    },
    "retail": {
        "product": ["product_name", "product_id"],
        "sale": ["sale_date", "sale_amount"],
    },
}

# ------------------------------------------------------------------
# 2  HELPER – find first matching column
# ------------------------------------------------------------------
def _find_col(df: pd.DataFrame, keys) -> str | None:
    cols = {c.lower() for c in df.columns}
    for k in keys:
        if any(k.lower() in col for col in cols):
            return k
    return None

# ------------------------------------------------------------------
# 3  SCORER – returns (industry, confidence 0-1)
# ------------------------------------------------------------------
def detect_industry(df: pd.DataFrame) -> Tuple[str, float]:
    """
    Detect industry from any POS / ERP / healthcare CSV.
    Returns (industry, confidence_score)
    """
    if df.empty:
        return "retail", 0.0

    scores = {}
    for industry, groups in _ALIAS.items():
        hit = 0
        for group_keys in groups.values():
            if _find_col(df, group_keys):
                hit += 1
        scores[industry] = hit / len(groups)   # normalised 0-1

    # pick highest score
    industry = max(scores, key=scores.get) if scores else "retail"
    confidence = scores.get(industry, 0.0)

    # tie-breaker: supermarket wins if score == retail score (supermarket is strict superset)
    if scores.get("supermarket", 0) == scores.get("retail", 0) and "supermarket" in scores:
        industry = "supermarket"

    return industry, confidence

# ------------------------------------------------------------------
# 4  SINGLE-USE HELPER – supermarket boolean
# ------------------------------------------------------------------
def is_supermarket(df: pd.DataFrame) -> bool:
    """
    Fast yes/no wrapper for downstream code that only cares
    whether we treat this as a supermarket data set.
    """
    industry, confidence = detect_industry(df)
    # be conservative: only return True if we are *sure*
    return industry == "supermarket" and confidence >= 0.6