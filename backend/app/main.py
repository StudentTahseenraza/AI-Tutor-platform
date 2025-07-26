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

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ In-memory leaderboard
app.db = sqlite3.connect(":memory:", check_same_thread=False)
app.db.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, score INTEGER)")
app.db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_name ON users (name)")
app.db.execute("INSERT OR REPLACE INTO users (name, score) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET score=score+?", ("user", 0, 0))

# ✅ Google Gemma AI Analysis via OpenRouter
def call_gemma_api(prompt, max_tokens=800, retries=1):
    api_token = os.getenv("OPENROUTER_API_KEY")
    if not api_token:
        raise HTTPException(status_code=500, detail="Missing OpenRouter API key")

    api_url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AI-Tutor"
    }
    payload = {
        "model": "mistralai/mistral-small-3.2-24b-instruct:free",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.6,
        "top_p": 0.9
    }

    for attempt in range(retries + 1):
        try:
            print(f"🔁 Sending prompt to Google Gemma (Attempt {attempt + 1})")
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()

            if "error" in result:
                raise ValueError(result["error"]["message"])

            message = result["choices"][0]["message"]["content"]
            if not message.strip():
                raise ValueError("Empty content from Google Gemma.")
            return message

        except Exception as e:
            print(f"❌ Error: {e}")
            if attempt == retries:
                raise HTTPException(status_code=500, detail=f"Gemma failed: {e}")

# ✅ /analyze route
@app.post("/analyze")
async def analyze_problem(data: dict):
    problem = data.get("problem", "").strip()
    if not problem:
        raise HTTPException(status_code=400, detail="Problem is required")

    prompt = (
            f"You are an expert CS tutor.\n\n"
            f"Here is the coding problem:\n{problem[:700]}\n\n"
            f"1. First, write a clear and concise mathematical explanation of the solution. Include time and space complexity.\n"
            f"\n"
            f"2. Then, generate pseudocode in textbook-style format using the following rules:\n"
            f"  - Use uppercase block keywords like: FUNCTION, IF, ELSE, WHILE, RETURN, END IF, END WHILE, SET, CREATE, etc.\n"
            f"  - Indent nested blocks properly using 4 spaces.\n"
            f"  - Do not use curly braces, semicolons, or real code syntax.\n"
            f"  - Keep it clean, logical, and readable.\n\n"
            f"Example pseudocode format:\n\n"
            f"FUNCTION MergeLists(list1, list2):\n"
            f"    SET current = dummyNode\n"
            f"    WHILE list1 IS NOT NULL AND list2 IS NOT NULL:\n"
            f"        IF list1.value < list2.value:\n"
            f"            current.next = list1\n"
            f"            list1 = list1.next\n"
            f"        ELSE:\n"
            f"            current.next = list2\n"
            f"            list2 = list2.next\n"
            f"        END IF\n"
            f"        current = current.next\n"
            f"    END WHILE\n"
            f"    RETURN dummyNode.next\n"
            f"END FUNCTION\n\n"
            f"Now return both:\n\n"
            f"Math Explanation:\n...\n\nPseudocode:\n..."
        )
    try:
        response = call_gemma_api(prompt)
        print("✅ Google Gemma Response:\n", response[:500])

        math_match = re.search(r"Math Explanation:?\s*(.*?)Pseudocode:?", response, re.DOTALL | re.IGNORECASE)
        pseudo_match = re.search(r"Pseudocode:?\s*(.*)", response, re.DOTALL | re.IGNORECASE)

        math_explanation = math_match.group(1).strip() if math_match else "❌ Math explanation not found."
        pseudocode = pseudo_match.group(1).strip() if pseudo_match else "❌ Pseudocode not found."

        return {
            "mathExplanation": math_explanation,
            "pseudoCode": pseudocode
        }

    except Exception as e:
        print(f"❌ Final error in analyze: {str(e)}")
        return {
            "mathExplanation": "Unable to generate math explanation.",
            "pseudoCode": "Unable to generate pseudocode."
        }
        
@app.post("/chat-explain")
async def chat_explain(data: dict):
    question = data.get("question", "")
    context = data.get("context", "")

    if not question or not context:
        raise HTTPException(status_code=400, detail="Missing question or context.")

    prompt = (
        f"You are an expert CS tutor.\n\n"
        f"Here is a mathematical explanation:\n{context}\n\n"
        f"User question: {question}\n\n"
        f"Provide a simple, clear answer based only on the explanation."
    )

    try:
        response = call_gemma_api(prompt)
        return {"response": response.strip()}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

# ✅ /execute route
@app.post("/execute")
async def execute_code(data: dict):
    import io
    import sys
    from contextlib import redirect_stdout

    language = data.get("language", "python")
    source = data.get("source", "")
    stdin = data.get("stdin", "")

    if not source:
        raise HTTPException(status_code=400, detail="Source code is required")

    if language != "python":
        return {"output": "Only Python execution is supported."}

    try:
        buffer = io.StringIO()
        sys.stdin = io.StringIO(stdin)
        with redirect_stdout(buffer):
            exec(source, {})
        output = buffer.getvalue()
        return {"output": output or "No output."}
    except Exception as e:
        return {"output": f"Execution Error: {e}"}

# ✅ /suggest route (simple mock suggestion logic)
@app.post("/suggest")
async def suggest_code(data: dict):
    code = data.get("code", "")
    if not code:
        return {"suggestions": []}
    suggestions = []
    if "for" in code:
        suggestions.append("Consider using list comprehensions for brevity.")
    if "try" not in code and "except" not in code:
        suggestions.append("Add error handling using try-except.")
    if "input" in code:
        suggestions.append("Add prompts or validations for user input.")
    return {"suggestions": suggestions}

# ✅ /leaderboard route
@app.get("/leaderboard")
async def get_leaderboard():
    cursor = app.db.execute("SELECT name, score FROM users ORDER BY score DESC LIMIT 10")
    return [{"name": row[0], "score": row[1]} for row in cursor.fetchall()]

# ✅ /list-models route
@app.get("/list-models")
async def list_models():
    return {"models": ["mistralai/mistral-small-3.2-24b-instruct:free"]}

# ✅ Run
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
