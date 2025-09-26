import argparse
import json
import sys
from typing import List

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline
except Exception as e:
    print(json.dumps({"ok": False, "error": f"transformers import failed: {e}"}))
    sys.exit(1)


def score_titles(titles: List[str]) -> List[float]:
    model_name = "ProsusAI/finbert"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    pipe = TextClassificationPipeline(model=model, tokenizer=tokenizer, return_all_scores=True, truncation=True)
    scores: List[float] = []
    for t in titles:
        t = (t or "").strip()
        if not t:
            scores.append(0.0)
            continue
        out = pipe(t)[0]
        # finbert labels: ['positive','negative','neutral'] most commonly
        label_to_score = {d['label'].lower(): float(d['score']) for d in out}
        val = label_to_score.get('positive', 0.0) - label_to_score.get('negative', 0.0)
        scores.append(val)
    return scores


def main() -> int:
    parser = argparse.ArgumentParser(description="Score titles with FinBERT and output JSON scores [-1,1]")
    parser.add_argument("--json", required=True, help="JSON array of strings (titles)")
    args = parser.parse_args()

    try:
        titles = json.loads(args.json)
        if not isinstance(titles, list):
            raise ValueError("--json must be a JSON array of strings")
        scores = score_titles([str(x) for x in titles])
        print(json.dumps({"ok": True, "scores": scores}))
        return 0
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())


