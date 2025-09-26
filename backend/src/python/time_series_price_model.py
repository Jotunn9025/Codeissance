import argparse
import json
import os

import numpy as np
import pandas as pd
import yfinance as yf
from pymongo import MongoClient
from lightgbm import LGBMRegressor


# ------------------------ Mongo helpers ------------------------

def load_weighted_sentiments(ticker: str) -> pd.DataFrame:
    uri = os.environ.get("MONGODB_URI")
    dbname = os.environ.get("MONGODB_DB")
    if not uri:
        return pd.DataFrame(columns=["timestamp", "overall_confidence", "ticker"])  # empty -> zeros later
    client = MongoClient(uri)
    try:
        # Use provided DB, or fallback to 'test' to avoid default DB error
        db = client.get_database(dbname) if dbname else client.get_database("test")
        col = db["weighted_sentiments"]
        docs = list(col.find({"company": ticker}).sort("time", 1))
        if not docs:
            return pd.DataFrame(columns=["timestamp", "overall_confidence", "ticker"])  # empty -> zeros later
        rows = [{
            "timestamp": pd.to_datetime(d.get("time")),
            "overall_confidence": float(d.get("confidence", 0.0)),
            "ticker": d.get("company", ticker),
        } for d in docs]
        return pd.DataFrame(rows)
    finally:
        client.close()


# ------------------------ Finance helpers ------------------------

def fetch_financial_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    df = yf.download(ticker, start=start_date, end=end_date, interval="1d", progress=False)
    if df.empty:
        return pd.DataFrame(columns=["timestamp", "Open", "High", "Low", "Close", "Volume"])  # empty
    
    # Handle MultiIndex columns that sometimes occur with yfinance
    if isinstance(df.columns, pd.MultiIndex):
        # If MultiIndex, flatten it by taking the first level (the actual column names)
        df.columns = df.columns.get_level_values(0)
    
    # Now safely rename and select columns
    df = df.rename(columns=str.title)[["Open", "High", "Low", "Close", "Volume"]]
    df = df.reset_index().rename(columns={"Date": "timestamp"})
    df["timestamp"] = pd.to_datetime(df["timestamp"])  # tz-naive
    return df


def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    if out.empty:
        for c in ["SMA_10", "EMA_10", "RSI_14", "ATR_14"]:
            out[c] = np.nan
        return out

    close = out["Close"]
    high = out["High"]
    low = out["Low"]

    out["SMA_10"] = close.rolling(10, min_periods=10).mean()
    out["EMA_10"] = close.ewm(span=10, adjust=False).mean()

    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14, min_periods=14).mean()
    loss = (-delta.clip(upper=0)).rolling(14, min_periods=14).mean()
    rs = gain / loss.replace(0, np.nan)
    out["RSI_14"] = 100 - (100 / (1 + rs))

    tr1 = (high - low).abs()
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    out["ATR_14"] = tr.rolling(14, min_periods=14).mean()

    return out


# ------------------------ Data prep ------------------------

def prepare_data_for_training(sentiment_df: pd.DataFrame, financial_df: pd.DataFrame):
    f = financial_df.copy()
    if f.empty:
        return pd.DataFrame(), pd.Series(dtype=float), f

    # Daily key
    f["day"] = pd.to_datetime(f["timestamp"]).dt.floor("D")

    # Daily sentiment (avg per day). If none, zeros.
    s = sentiment_df.copy()
    if s.empty:
        s_daily = pd.DataFrame({"day": f["day"].unique(), "overall_confidence": 0.0})
    else:
        s["day"] = pd.to_datetime(s["timestamp"]).dt.floor("D")
        s_daily = s.groupby("day", as_index=False)["overall_confidence"].mean()

    # Indicators already computed on f; merge by day
    merged = pd.merge(f, s_daily, on="day", how="left")
    merged["overall_confidence"] = merged["overall_confidence"].fillna(0.0)

    # Target: next-day Close
    merged = merged.sort_values("day").reset_index(drop=True)
    merged["target_close_next"] = merged["Close"].shift(-1)

    # Features: use current day values
    feature_cols = ["Close", "SMA_10", "EMA_10", "RSI_14", "ATR_14", "overall_confidence"]

    df_model = merged.dropna(subset=feature_cols + ["target_close_next"]).copy()
    if df_model.empty:
        return pd.DataFrame(), pd.Series(dtype=float), merged

    X = df_model[feature_cols]
    y = df_model["target_close_next"]
    return X, y, df_model


# ------------------------ Model ------------------------

def train_model(X: pd.DataFrame, y: pd.Series):
    model = LGBMRegressor()
    model.fit(X, y)
    return model


def make_prediction(model, latest_features: pd.Series, last_close: float, max_daily_change_pct: float):
    pred_close = float(model.predict(latest_features.values.reshape(1, -1))[0])
    # Also provide a capped pct change output for safety/comparison
    pct_change = 0.0 if last_close == 0 else (pred_close - last_close) / last_close
    pct_change_capped = max(-max_daily_change_pct, min(max_daily_change_pct, pct_change))
    pred_close_capped = last_close * (1.0 + pct_change_capped)
    return pred_close, pct_change_capped, pred_close_capped


# ------------------------ Main ------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", required=True)
    parser.add_argument("--start", required=True)
    parser.add_argument("--end", required=True)
    parser.add_argument("--max", default="0.1")
    args = parser.parse_args()

    ticker = args.ticker.upper()
    start_date = args.start
    end_date = args.end
    max_cap = float(args.max)

    try:
        # 1) Data
        sentiment_df = load_weighted_sentiments(ticker)
        fin = fetch_financial_data(ticker, start_date, end_date)
        fin = calculate_technical_indicators(fin)

        # 2) Train set
        X, y, df_model = prepare_data_for_training(sentiment_df, fin)
        if X.empty or len(X) < 30:
            print(json.dumps({
                "ok": True,
                "ticker": ticker,
                "samples": int(len(X)),
                "prediction_close": None,
                "prediction_pct_change_capped": 0.0,
                "note": "insufficient_samples"
            }))
            return

        # 3) Train
        model = train_model(X, y)

        # 4) Predict next day from latest available row
        latest_features = X.iloc[-1]
        last_close = float(df_model.iloc[-1]["Close"])  # current day's close
        pred_close, pct_change_capped, pred_close_capped = make_prediction(
            model, latest_features, last_close, max_cap
        )

        print(json.dumps({
            "ok": True,
            "ticker": ticker,
            "window": {"start": start_date, "end": end_date},
            "samples": int(len(X)),
            "prediction_close": float(pred_close),
            "prediction_close_capped": float(pred_close_capped),
            "prediction_pct_change_capped": float(pct_change_capped),
            "feature_snapshot": latest_features.to_dict()
        }))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))


if __name__ == "__main__":
    main()