from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services import analyze_face, recommend, generate_instructions

router = APIRouter()

class Input(BaseModel):
    landmarks: List[List[float]]

@router.post("/analyze")
async def analyze(data: Input):
    features = analyze_face(data.landmarks)
    rec = recommend(features)
    instructions = generate_instructions(features, rec)

    return {
        "features": features,
        "recommendation": rec,
        "instructions": instructions
    }
