print("Running main.py with Google Gemma integration at", __file__)

from fastapi import FastAPI, HTTPException
try:
    from fastapi_cors import CORSMiddleware
except ImportError:
    from fastapi.middleware.cors import CORSMiddleware

import sqlite3
import requests
import os
import re
from dotenv import load_dotenv
import uvicorn

load_dotenv()

app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-tutor-platform-theta.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# In-memory leaderboard
# =========================
app.db = sqlite3.connect(":memory:", check_same_thread=False)
app.db.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    score INTEGER
)
""")
app.db.execute("""
INSERT OR IGNORE INTO users (name, score)
VALUES (?, ?)
""", ("user", 0))
app.db.commit()

# =========================
# OpenRouter Models
# =========================
PRIMARY_MODEL = "google/gemma-3n-e2b-it:free"
FALLBACK_MODEL = "mistralai/mistral-small-3.2-24b-instruct:free"

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# =========================
# AI Call Utility
# =========================
def call_llm(prompt: str, max_tokens: int = 800, retries: int = 1) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing OpenRouter API key")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-tutor-platform-theta.vercel.app",
        "X-Title": "AI Tutor Platform"
    }

    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL]

    for model in models_to_try:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are an expert computer science tutor."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": 0.6,
            "top_p": 0.9
        }

        for attempt in range(retries + 1):
            try:
                print(f"🔁 LLM Request | Model={model} | Attempt={attempt + 1}")

                response = requests.post(
                    OPENROUTER_URL,
                    headers=headers,
                    json=payload,
                    timeout=30
                )

                if response.status_code != 200:
                    print(f"⚠️ OpenRouter Error {response.status_code}: {response.text}")
                    continue

                data = response.json()

                message = data["choices"][0]["message"]["content"].strip()
                if not message:
                    raise ValueError("Empty LLM response")

                return message

            except Exception as e:
                print(f"❌ Model {model} failed: {e}")

    raise HTTPException(status_code=500, detail="All AI models failed")

# =========================
# /analyze
# =========================
@app.post("/analyze")
async def analyze_problem(data: dict):
    problem = data.get("problem", "").strip()
    if not problem:
        raise HTTPException(status_code=400, detail="Problem is required")

    prompt = f"""
You are an expert CS tutor.

Problem:
{problem[:700]}

Tasks:
1. Write a clear mathematical explanation with time & space complexity.
2. Then write textbook-style pseudocode.

Rules:
- Use uppercase keywords (FUNCTION, IF, WHILE, RETURN)
- No real code syntax
- Clean indentation (4 spaces)

Format strictly as:

Math Explanation:
...

Pseudocode:
...
"""

    response = call_llm(prompt)

    math_match = re.search(r"Math Explanation:\s*(.*?)Pseudocode:", response, re.S | re.I)
    pseudo_match = re.search(r"Pseudocode:\s*(.*)", response, re.S | re.I)

    return {
        "mathExplanation": math_match.group(1).strip() if math_match else "Not found",
        "pseudoCode": pseudo_match.group(1).strip() if pseudo_match else "Not found"
    }

# =========================
# /chat-explain
# =========================
@app.post("/chat-explain")
async def chat_explain(data: dict):
    question = data.get("question", "").strip()
    context = data.get("context", "").strip()

    if not question or not context:
        raise HTTPException(status_code=400, detail="Missing question or context")

    prompt = f"""
Explanation:
{context}

User Question:
{question}

Answer clearly and simply.
"""

    response = call_llm(prompt, max_tokens=400)
    return {"response": response}

# =========================
# /execute
# =========================
@app.post("/execute")
async def execute_code(data: dict):
    import io, sys
    from contextlib import redirect_stdout

    source = data.get("source", "")
    stdin = data.get("stdin", "")

    if not source:
        raise HTTPException(status_code=400, detail="Source code required")

    try:
        buffer = io.StringIO()
        sys.stdin = io.StringIO(stdin)
        with redirect_stdout(buffer):
            exec(source, {})
        return {"output": buffer.getvalue() or "No output"}
    except Exception as e:
        return {"output": f"Execution Error: {e}"}

# =========================
# /suggest
# =========================
@app.post("/suggest")
async def suggest_code(data: dict):
    code = data.get("code", "")
    suggestions = []

    if "for" in code:
        suggestions.append("Consider list comprehensions for cleaner loops.")
    if "try" not in code:
        suggestions.append("Add try-except blocks for error handling.")
    if "input" in code:
        suggestions.append("Validate user input to avoid runtime errors.")

    return {"suggestions": suggestions}

# =========================
# /leaderboard
# =========================
@app.get("/leaderboard")
async def leaderboard():
    cur = app.db.execute(
        "SELECT name, score FROM users ORDER BY score DESC LIMIT 10"
    )
    return [{"name": r[0], "score": r[1]} for r in cur.fetchall()]

# =========================
# /list-models
# =========================
@app.get("/list-models")
async def list_models():
    return {
        "primary": PRIMARY_MODEL,
        "fallback": FALLBACK_MODEL
    }

# =========================
# Run
# =========================
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
