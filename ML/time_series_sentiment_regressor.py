import yfinance as yf
import numpy as np
import requests
from transformers import pipeline
import xgboost as xgb
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import pathlib
import logging
from typing import List, Optional

# -------------------------------
# Logging
# -------------------------------
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# -------------------------------
# Perplexity Sonar Config
# -------------------------------
PERPLEXITY_API_KEY: Optional[str] = None
PERPLEXITY_BASE_URL = "https://api.perplexity.ai"
SONAR_MODEL = "sonar"

# -------------------------------
# Setup
# -------------------------------
load_dotenv()
sentiment_analyzer = pipeline("sentiment-analysis")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

DATA_DIR = pathlib.Path("data_store")
DATA_DIR.mkdir(exist_ok=True)
BASELINE_FILE = DATA_DIR / "baseline_dataset.npz"

# -------------------------------
# Baseline Data
# -------------------------------

def create_baseline_dataset(
    n_days: int = 3000,
    window_size: int = 100,
    n_samples: int | None = None,
    initial_price: float = 150.0,
    mu: float = 0.0002,          # daily drift ~0.02% (annual ~5%)
    sigma: float = 0.01,         # daily volatility ~1% (annual ~16%)
    sentiment_impact: float = 0.002,  # how much sentiment shifts next-day return (~0.2%)
    random_seed: int = 42,
):
    """
    Create a realistic baseline dataset using geometric Brownian motion.

    Each sample:
      - features: 100 historical closing prices (1D) + 3 sentiment floats
      - target: next day's closing price

    Parameters are chosen to produce small daily returns; tweak mu/sigma to taste.
    """
    np.random.seed(random_seed)

    # 1) Simulate a long GBM price series
    dt = 1.0  # one day
    # generate daily returns (normal increments)
    eps = np.random.normal(loc=(mu - 0.5 * sigma**2) * dt, scale=sigma * np.sqrt(dt), size=n_days)
    # log-price series
    log_prices = np.log(initial_price) + np.cumsum(eps)
    prices = np.exp(log_prices)  # geometric Brownian motion -> prices

    # 2) Build sliding windows of size `window_size`
    max_samples_possible = len(prices) - window_size - 1  # leave one day for next-day target
    if max_samples_possible <= 0:
        raise ValueError("n_days must be larger than window_size + 1")

    # If user didn't request specific n_samples, use all possible sliding windows
    if n_samples is None or n_samples > max_samples_possible:
        n_samples = max_samples_possible

    X_list = []
    y_list = []

    # Sample indices uniformly across the long series for variety
    start_indices = np.linspace(0, max_samples_possible - 1, n_samples, dtype=int)

    for start in start_indices:
        # price window (ensure 1D)
        price_window = prices[start : start + window_size].astype(float).flatten()

        # generate a small sentiment vector (each component between about -1 and +1, typically smaller)
        # use a normal distribution with small std so most sentiments are small
        sentiment_vec = np.random.normal(loc=0.0, scale=0.4, size=3)  # mean 0, stdev 0.4
        # clip extremes so sentiment stays reasonable
        sentiment_vec = np.clip(sentiment_vec, -1.0, 1.0)

        # compute baseline next-day return from GBM eps (the actual simulated one)
        next_day_log_return = log_prices[start + window_size] - log_prices[start + window_size - 1]
        # make sentiment nudges: sum of sentiments scaled by sentiment_impact
        sentiment_nudge = sentiment_impact * np.sum(sentiment_vec)

        # Combine to get predicted next-day log-return and then price
        adjusted_log_return = next_day_log_return + sentiment_nudge
        last_price = price_window[-1]
        next_price = last_price * np.exp(adjusted_log_return)

        # features: 100 price points + 3 sentiment floats
        features = np.concatenate([price_window, sentiment_vec.astype(float)])
        X_list.append(features)
        y_list.append(float(next_price))

    X = np.array(X_list, dtype=float)
    y = np.array(y_list, dtype=float)

    # Save
    np.savez(BASELINE_FILE, X=X, y=y)
    print(f"✅ Baseline dataset created with {len(X)} samples. Feature shape {X.shape}, targets {y.shape}")
    return X, y

# -------------------------------
# Fetch News via Perplexity Sonar
# -------------------------------
def fetch_news_with_sonar(ticker: str, days: int = 3) -> List[str]:
    if not PERPLEXITY_API_KEY:
        logger.warning("No Perplexity API key found. Returning empty news list.")
        return []
    
    results: List[str] = []
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    endpoint = f"{PERPLEXITY_BASE_URL}/chat/completions"
    
    today = datetime.utcnow()
    for i in range(days):
        target_date = today - timedelta(days=i)
        date_str = target_date.strftime("%Y-%m-%d")
        user_prompt = f"{ticker} stock news on {date_str}"
        payload = {
            "model": SONAR_MODEL,
            "messages": [
                {"role": "system", "content": "You are a factual news summarizer."},
                {"role": "user",   "content": user_prompt},
            ],
        }
        try:
            resp = requests.post(endpoint, json=payload, headers=headers, timeout=20)
        except requests.RequestException as ex:
            logger.error("Error calling Perplexity Sonar for %s: %s", date_str, ex)
            continue
        
        if resp.status_code != 200:
            logger.warning("Perplexity Sonar returned %d for %s: %s", resp.status_code, date_str, resp.text)
            continue
        
        try:
            body = resp.json()
        except ValueError as ex:
            logger.error("Invalid JSON from Sonar for %s: %s", date_str, ex)
            continue
        
        choices = body.get("choices", [])
        if not choices:
            logger.info("No choices returned for %s", date_str)
            continue
        
        first = choices[0]
        message = first.get("message", {}) or {}
        answer = message.get("content", "").strip()
        if answer:
            results.append(answer)
        else:
            logger.info("Choice content empty for %s", date_str)
    
    return results

# -------------------------------
# Sentiment Analysis
# -------------------------------
def analyze_sentiment(news_texts):
    results = []
    for text in news_texts:
        try:
            sentiment = sentiment_analyzer(text)[0]
            score = sentiment["score"] if sentiment["label"] == "POSITIVE" else -sentiment["score"]
            results.append((text, score))
        except Exception as e:
            print(f"⚠️ Could not analyze text: {e}")
            results.append(("N/A", 0.0))
    return results

# -------------------------------
# Prepare Dataset
# -------------------------------
def prepare_dataset(ticker):
    data = yf.download(ticker, period="150d", interval="1d")
    if not data.empty:
        today_price = data["Close"].iloc[-1]  # last available closing price
        print(f"\n💰 Today's closing price for {ticker}: {today_price}")
    else:
        print(f"\n⚠️ No price data available for {ticker} today.")
    data = data[["Close"]]
    
    news_texts = fetch_news_with_sonar(ticker)
    sentiment_results = analyze_sentiment(news_texts)
    sentiments = [score for (_, score) in sentiment_results]

    if len(data) < 100 or len(sentiments) < 3:
        if not BASELINE_FILE.exists():
            create_baseline_dataset()
        saved = np.load(BASELINE_FILE)
        return saved["X"], saved["y"], []

    X, y = [], []
    for i in range(100, len(data) - 1):
        price_window = data["Close"].iloc[i - 100 : i].values.flatten()  # 🔧 flatten 2D to 1D
        sentiment_window = sentiments[max(0, i - 3) : i]
        sentiment_window = [0] * (3 - len(sentiment_window)) + sentiment_window
        sentiment_window = np.array(sentiment_window, dtype=float)
        features = np.concatenate([price_window, sentiment_window])
        X.append(features)
        y.append(data["Close"].iloc[i + 1])

    np.savez(BASELINE_FILE, X=np.array(X), y=np.array(y))
    return np.array(X), np.array(y), sentiment_results

# -------------------------------
# Train Model
# -------------------------------
def train_model(X_train, y_train, X_test, y_test):
    model = xgb.XGBRegressor(objective="reg:squarederror")
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    return model, predictions

# -------------------------------
# Retrain Model Daily
# -------------------------------
def retrain_model(ticker):
    load_dotenv()
    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
    X, y, sentiment_results = prepare_dataset(ticker)

    if sentiment_results:
        print("\n📰 Latest News Sentiment:")
        for title, score in sentiment_results:
            print(f" - {title[:80]}... | Sentiment: {score:.3f}")

    n_samples = len(X)
    if n_samples < 5:
        print(f"⚠️ Not enough samples ({n_samples}), using all for training.")
        model = xgb.XGBRegressor(objective="reg:squarederror")
        model.fit(X, y)
        predictions = model.predict(X)
        print("📈 Predictions (small dataset mode):", predictions)
        return model

    test_size = 0.2 if n_samples >= 10 else 0.5
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, shuffle=False)

    model, predictions = train_model(X_train, y_train, X_test, y_test)
    print("\n📈 Predictions for the next day's closing price:")
    print(predictions[-5:] if len(predictions) >= 5 else predictions)
    return model

# -------------------------------
# Main
# -------------------------------
if __name__ == "__main__":
    ticker = "AAPL"
    model = retrain_model(ticker)
