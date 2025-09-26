from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from typing import Any, Dict, List

# Import from existing ML module without modifying it
from ML.time_series_sentiment_regressor import (
    retrain_model,
    prepare_dataset,
    train_model,
)

app = FastAPI(title="Sentiment Forecaster API", version="1.0.0")


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True}


@app.get("/retrain")
def retrain(symbol: str = Query("AAPL", min_length=1)) -> JSONResponse:
    sym = symbol.upper()
    try:
        # Prepare dataset to get features and news sentiment samples
        X, y, sentiment_results = prepare_dataset(sym)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"ok": False, "symbol": sym, "error": f"prepare_dataset failed: {e}"},
        )

    # Trigger a full retrain using the existing function (for compliance with request)
    try:
        _model = retrain_model(sym)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"ok": False, "symbol": sym, "error": f"retrain_model failed: {e}"},
        )

    # Build a compact forecast using a quick train/test split for response
    prediction = None
    recent_predictions: List[float] = []
    try:
        n = len(X)
        if n >= 2:
            split_index = max(1, int(n * 0.8))
            X_train, y_train = X[:split_index], y[:split_index]
            X_test, y_test = X[split_index:], y[split_index:]
            model, preds = train_model(X_train, y_train, X_test, y_test)
            recent_predictions = preds[-5:].tolist() if hasattr(preds, "tolist") else list(preds[-5:])
            # next-day style forecast using last known features
            prediction = float(model.predict(X[-1:].astype(float))[0])
        elif n == 1:
            # fall back minimal mode
            from xgboost import XGBRegressor  # lazy import
            m = XGBRegressor(objective="reg:squarederror")
            m.fit(X, y)
            prediction = float(m.predict(X)[0])
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"ok": False, "symbol": sym, "error": f"prediction build failed: {e}"},
        )

    sentiment_samples = [
        {"text": t, "score": float(s)} for (t, s) in (sentiment_results or [])[:10]
    ]

    return JSONResponse(
        content={
            "ok": True,
            "symbol": sym,
            "samples": int(len(X)),
            "prediction": prediction,
            "recentPredictions": recent_predictions,
            "sentimentSamples": sentiment_samples,
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("ML.api_server:app", host="0.0.0.0", port=5001, reload=False)


