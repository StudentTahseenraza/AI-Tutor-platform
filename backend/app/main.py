from fastapi import FastAPI, HTTPException
try:
    from fastapi_cors import CORSMiddleware  # Try external CORS package
except ImportError:
    from fastapi.middleware.cors import CORSMiddleware  # Fallback to built-in CORS

import sqlite3
from google.generativeai import GenerativeModel, configure
import os
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Configure Gemini API (replace with your API key)
configure(api_key=os.getenv("GEMINI_API_KEY", "your-gemini-api-key-here"))
model = GenerativeModel('gemini-pro')

# Database setup
app.db = sqlite3.connect("leaderboard.db", check_same_thread=False)
# Create or alter table to ensure 'name' has UNIQUE constraint
app.db.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, score INTEGER)")
try:
    app.db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_name ON users (name)")
except sqlite3.IntegrityError:
    # Handle case where duplicate names exist; drop and recreate if needed
    app.db.execute("DROP TABLE users")
    app.db.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, score INTEGER)")
app.db.execute("INSERT OR REPLACE INTO users (name, score) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET score=score+?", ("user", 0, 0))

@app.post("/analyze")
async def analyze_problem(data: dict):
    problem = data.get("problem", "")
    if not problem:
        raise HTTPException(status_code=400, detail="Problem is required")
    return {
        "mathExplanation": f"Explanation for {problem}",
        "pseudoCode": f"Pseudo code for {problem}"
    }

@app.post("/execute")
async def execute_code(data: dict):
    language = data.get("language", "python")
    source = data.get("source", "")
    stdin = data.get("stdin", "")
    if not source:
        raise HTTPException(status_code=400, detail="Source code is required")
    return {"output": f"Output for {language}: {source} with {stdin}"}

@app.post("/suggest")
async def suggest_code(data: dict):
    code = data.get("code", "")
    suggestions = ["Add error handling", "Optimize loops"] if "for" in code else ["Consider adding comments"]
    return {"suggestions": suggestions}

@app.post("/generate-tutorial")
async def generate_tutorial(data: dict):
    problem = data.get("problem", "")
    if not problem:
        raise HTTPException(status_code=400, detail="Problem is required")
    try:
        response = model.generate_content(f"Generate a step-by-step tutorial for solving the coding problem: {problem}. Provide 3-5 steps with text descriptions and corresponding Python code snippets where applicable. Return as a JSON array of objects, each with 'text' and optional 'code' fields, and include the problem in the first object's 'problem' field.")
        tutorial = json.loads(response.text)
        if not isinstance(tutorial, list) or not all('text' in step for step in tutorial):
            raise ValueError("Invalid tutorial format")
        return {"steps": tutorial}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate tutorial: {str(e)}")

@app.get("/leaderboard")
async def get_leaderboard():
    cursor = app.db.execute("SELECT name, score FROM users ORDER BY score DESC LIMIT 10")
    return [{"name": row[0], "score": row[1]} for row in cursor.fetchall()]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)