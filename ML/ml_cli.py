import argparse
import json
import os
import sys
from pathlib import Path

# Ensure repository root is on sys.path so we can import ML module reliably
REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ML.time_series_sentiment_regressor import prepare_dataset, train_model  # type: ignore


def main() -> int:
    parser = argparse.ArgumentParser(description="Run ML forecast for a ticker and emit JSON")
    parser.add_argument("--symbol", required=True, help="Ticker symbol, e.g., AAPL")
    parser.add_argument("--test_size", default=0.2, type=float, help="Test split size for quick validation")
    args = parser.parse_args()

    symbol = args.symbol.upper()

    try:
        X, y, sentiment_results = prepare_dataset(symbol)
    except Exception as e:
        print(json.dumps({
            "ok": False,
            "symbol": symbol,
            "error": f"Failed to prepare dataset: {e}"
        }))
        return 1

    # If we have at least one sample, fit and predict the next step using the latest feature row
    try:
        prediction = None
        recent_predictions = []
        if len(X) >= 2:
            # Simple split without shuffle to keep time order
            split_index = max(1, int(len(X) * (1 - float(args.test_size))))
            X_train, y_train = X[:split_index], y[:split_index]
            X_test, y_test = X[split_index:], y[split_index:]
            model, preds = train_model(X_train, y_train, X_test, y_test)
            recent_predictions = preds[-5:].tolist() if hasattr(preds, 'tolist') else list(preds[-5:])
            # Predict using the last available feature row as proxy for next-day forecast
            prediction = float(model.predict(X[-1:].astype(float))[0])
        elif len(X) == 1:
            # Train on the single point
            from xgboost import XGBRegressor  # lazy import
            model = XGBRegressor(objective="reg:squarederror")
            model.fit(X, y)
            prediction = float(model.predict(X)[0])

        result = {
            "ok": True,
            "symbol": symbol,
            "prediction": prediction,
            "samples": int(len(X)),
            "recentPredictions": recent_predictions,
            "sentimentSamples": [
                {"text": t, "score": float(s)} for (t, s) in (sentiment_results or [])[:10]
            ]
        }
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except Exception as e:
        print(json.dumps({
            "ok": False,
            "symbol": symbol,
            "error": f"Failed to train/predict: {e}"
        }))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())


