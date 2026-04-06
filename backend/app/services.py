import numpy as np
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_face(landmarks):
    lm = np.array(landmarks)

    left = lm[234]
    right = lm[454]
    top = lm[10]
    bottom = lm[152]

    width = np.linalg.norm(left - right)
    height = np.linalg.norm(top - bottom)

    ratio = width / height

    if ratio > 0.85:
        shape = "round"
    elif ratio < 0.75:
        shape = "long"
    else:
        shape = "oval"

    return {"face_shape": shape, "ratio": float(ratio)}

def recommend(features):
    shape = features["face_shape"]

    if shape == "round":
        return {"contour": "edges", "lip": "bold"}
    if shape == "long":
        return {"contour": "horizontal", "lip": "soft"}

    return {"contour": "light", "lip": "natural"}

def generate_instructions(features, rec):
    prompt = f"""
    Face shape: {features['face_shape']}
    Recommendation: {rec}
    Give simple makeup steps.
    """

    try:
        res = client.chat.completions.create(
            model="gpt-5",
            messages=[{"role": "user", "content": prompt}],
        )
        return res.choices[0].message.content
    except:
        return "Apply foundation, contour lightly, add lipstick."
