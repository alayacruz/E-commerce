from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

data        = joblib.load("product_vectors.pkl")
matrix      = data["matrix"]
product_ids = data["product_ids"]

class RecoRequest(BaseModel):
    bought_product_ids: list[str]
    limit: int = 10

@app.post("/recommendations")
def recommend(req: RecoRequest):
    # Find indices of products the buyer has already bought
    bought_indices = [
        product_ids.index(pid)
        for pid in req.bought_product_ids
        if pid in product_ids
    ]

    if not bought_indices:
        return {"product_ids": []}  # Node handles cold start fallback

    # Average the vectors of bought products → buyer's taste profile
    bought_vectors = matrix[bought_indices]
    taste_profile  = np.asarray(bought_vectors.mean(axis=0))  # shape: (1, n_features)

    # Score all products against the taste profile
    scores = cosine_similarity(taste_profile, matrix).flatten()
    ranked = np.argsort(scores)[::-1]

    # Return top N, excluding already-bought products
    result = [
        product_ids[i]
        for i in ranked
        if product_ids[i] not in req.bought_product_ids
    ]

    return {"product_ids": result[:req.limit]}