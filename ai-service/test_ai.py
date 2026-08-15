from app.predictor import predictor

sample_input = {
    "disaster_type": "flood",
    "people_count": 4,
    "injured_count": 1,
    "trapped": True,
    "requested_help": "rescue",
    "description": "Family trapped inside house"
}

res = predictor.predict(**sample_input)
print("AI Prediction Result:", res)
assert res["priority"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
assert 0 <= res["score"] <= 100
assert len(res["reason"]) > 0
print("AI Service Self-Test Passed!")
