from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
from app.predictor import predictor

app = FastAPI(
    title="ResQAI Priority Prediction Service",
    description="Microservice for predicting disaster response priority using Scikit-Learn and Rule Triage ML models.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend and Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmergencyPredictionRequest(BaseModel):
    disaster_type: str = Field(default="flood")
    people_count: int = Field(default=1)
    injured_count: int = Field(default=0)
    trapped: bool = Field(default=False)
    requested_help: str = Field(default="rescue")
    description: Optional[str] = Field(default="")

class PriorityPredictionResponse(BaseModel):
    priority: str
    score: int
    reason: str

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "ResQAI Priority AI",
        "version": "1.0.0"
    }

@app.post("/predict-priority", response_model=PriorityPredictionResponse)
def predict_priority(req: EmergencyPredictionRequest):
    try:
        result = predictor.predict(
            disaster_type=req.disaster_type,
            people_count=req.people_count,
            injured_count=req.injured_count,
            trapped=req.trapped,
            requested_help=req.requested_help,
            description=req.description or ""
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
