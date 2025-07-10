from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from google.generativeai import GenerativeModel, configure
import os
import json

# 🌐 FastAPI app instance
app = FastAPI()

# ✅ CORS configuration for local and deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local dev
        "https://ai-tutor-platform-lac.vercel.app",  # Vercel deploy
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load Gemini API key and configure
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in environment variables.")
configure(api_key=GEMINI_KEY)

# ✅ Use free model: gemini-pro
model = GenerativeModel("gemini-pro")

# ✅ SQLite DB setup
app.db = sqlite3.connect("leaderboard.db", check_same_thread=False)
app.db.execute(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, score INTEGER)"
)
app.db.execute("INSERT OR IGNORE INTO users (name, score) VALUES (?, ?)", ("user", 0))


# 🔍 Analyze route
@app.post("/analyze")
async def analyze_problem(data: dict):
    problem = data.get("problem", "")
    if not problem:
        raise HTTPException(status_code=400, detail="Problem is required")
    return {
        "mathExplanation": f"Explanation for {problem}",
        "pseudoCode": f"Pseudo code for {problem}",
    }


# ⚙️ Execute route (mock)
@app.post("/execute")
async def execute_code(data: dict):
    language = data.get("language", "python")
    source = data.get("source", "")
    stdin = data.get("stdin", "")
    if not source:
        raise HTTPException(status_code=400, detail="Source code is required")
    return {"output": f"Output for {language}: {source} with input {stdin}"}


# 💡 Code suggestions route
@app.post("/suggest")
async def suggest_code(data: dict):
    code = data.get("code", "")
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    suggestions = (
        ["Add error handling", "Optimize loops"]
        if "for" in code
        else ["Consider adding comments"]
    )
    return {"suggestions": suggestions}


# 📘 Tutorial generation route
@app.post("/generate-tutorial")
async def generate_tutorial(data: dict):
    problem = data.get("problem", "")
    if not problem:
        raise HTTPException(status_code=400, detail="Problem is required")
    try:
        prompt = (
            f"Generate a step-by-step tutorial for solving the coding problem: {problem}. "
            "Provide 3-5 steps with text descriptions and corresponding Python code snippets where applicable. "
            "Return as a JSON array of objects, each with 'text' and optional 'code' fields, and include the problem "
            "in the first object's 'problem' field."
        )
        response = model.generate_content(prompt)
        tutorial = json.loads(response.text)

        if not isinstance(tutorial, list) or not all("text" in step for step in tutorial):
            raise ValueError("Invalid tutorial format")

        return {"steps": tutorial}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate tutorial: {str(e)}")


# 🏆 Leaderboard route
@app.get("/leaderboard")
async def get_leaderboard():
    cursor = app.db.execute("SELECT name, score FROM users ORDER BY score DESC LIMIT 10")
    return [{"name": row[0], "score": row[1]} for row in cursor.fetchall()]


# 🧪 Local testing
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
