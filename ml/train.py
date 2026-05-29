import pandas as pd
import joblib
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sklearn.feature_extraction.text import TfidfVectorizer

load_dotenv("../backend/.env")  

db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise ValueError("DATABASE_URL not found in .env")

engine = create_engine(db_url)


# Pull products joined with their category name
query = text("""
    SELECT 
        p."productId",
        p.name,
        p.description,
        p.features,
        c."categoryName"
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c."categoryId"
    WHERE p."isArchived" = false
""")

with engine.connect() as conn:
    rows = conn.execute(query).fetchall()

df = pd.DataFrame(rows, columns=["productId", "name", "description", "features", "categoryName"])

# Combine all text fields into one string per product
def build_text(row):
    parts = [
        row["name"] or "",
        row["description"] or "",
        " ".join(row["features"]) if row["features"] else "",
        row["categoryName"] or ""
    ]
    return " ".join(parts)

df["text"] = df.apply(build_text, axis=1)

# Build TF-IDF matrix
vectoriser = TfidfVectorizer(stop_words="english", max_features=500)
matrix = vectoriser.fit_transform(df["text"])

joblib.dump({
    "matrix": matrix,
    "product_ids": df["productId"].tolist()
}, "product_vectors.pkl")

joblib.dump(vectoriser, "vectoriser.pkl")
print(f"Trained on {len(df)} products. Matrix: {matrix.shape}")