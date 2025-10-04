# 🧠 AI-Tutor: An Intelligent Coding & Math Learning Platform

Welcome to **AI-Tutor**, an innovative web-based platform designed to transform the learning experience in coding and mathematics. It leverages powerful AI models to offer real-time code explanations, flowchart visualizations, intelligent code refactoring, and mathematical insight generation—all in a sleek and interactive user interface.

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/b8bd0ee6-6d62-40f5-949a-bbaaa36a9609" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/7310f67b-9d63-4b9d-876d-fff712bdd217" />



---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Installation](#-installation)
- [🧪 Usage](#-usage)
- [☁️ Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📬 Contact](#-contact)

---

## ✨ Features

### 1. 🔍 Click-to-Explain Code (Per-Line Insight)
- **Description**: Click any line in the code editor to receive AI-powered explanations tailored to that line’s function.
- **How It Works**: Uses `/chat-explain` endpoint to analyze the context and respond with a beginner-friendly explanation.
- **Ideal For**: Absolute beginners or intermediate learners who want to decode complex logic.

---

### 2. ⚙️ Algorithm Flowchart Generator
- **Description**: Converts submitted pseudocode into dynamic flowcharts using Mermaid.js or React Flow.
- **How It Works**: Analyzes your input via the `/analyze` API and visualizes the logic step-by-step.
- **Benefit**: Makes it easy to understand algorithms visually.

---

### 3. ♻️ Auto Code Refactor
- **Description**: Suggests more efficient and cleaner code using best practices.
- **How It Works**: Submits code to `/refactor` endpoint, then returns optimized alternatives.
- **Benefit**: Great for improving readability, performance, and learning best practices.

---

### 4. 🧩 Interactive DSA Learning Mode
- **Description**: A guided, gamified mode to practice DSA questions inspired by platforms like Blind 75 and LeetCode.
- **Features**:
  - Filterable tags (e.g., Graph, DP, Binary Search)
  - XP-based rewards system
  - Built-in code editor and timer
- **How It Works**: Loads curated questions from a local SQLite database and provides a complete workflow to solve and learn.

---

### 5. 🧮 AI-Based Mathematical Explanation Mode (📐 NEW)
- **Description**: Ask AI to explain any math expression, derivation, or concept in-depth.
- **How It Works**: Sends your question to the `/explain-math` route powered by LLMs trained on advanced math reasoning.
- **Use Case**:
  - *"Explain why integration by parts works."*
  - *"What is the derivative of x^2 * sin(x)?"*

---

### 6. 📄 Summarize Entire Mathematical Explanation (🧾 NEW)
- **Description**: One-click summarization of long math explanations into concise key points.
- **How It Works**: Uses AI summarization techniques via `/summarize-math` endpoint.
- **Use Case**:
  - Summarize complex derivations
  - Get revision notes for exams

---

### 7. 🚀 UX Enhancements
- **🧠 Floating "Ask AI" Button**: AI help available from any screen or route.
- **📋 Copy Buttons**: Quickly copy pseudocode, code, or output.
- **⏱️ Gamification**: XP & Timer tracks how long you take and motivates learning.
- **🌈 High-Level Styling**: TailwindCSS-based design with shadows, blur, and interactivity for a smooth experience.

---

## 🛠️ Tech Stack

### 🔙 Backend
- **Framework**: FastAPI
- **AI Engine**: DeepSeek via OpenRouter (`deepseek/deepseek-r1-0528:free`)
- **Database**: SQLite (local problem store)
- **Libs**: `uvicorn`, `httpx`, `pydantic`, `fastapi-cors`, `python-dotenv`, `requests`

### 🔜 Frontend
- **Framework**: React (Vite)
- **Code Editor**: Monaco Editor
- **Flowchart**: Mermaid.js (`react-mermaid2`)
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Forms/Tags**: React Select
- **API**: Axios

### ☁️ Deployment
- **Platform**: Render (Backend hosted using `uvicorn`)
- **Version Control**: Git

---

## 🚀 Installation

### ✅ Prerequisites
- Node.js (v18+)
- Python (3.13)
- Git

### 📦 Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/ai-tutor.git
   cd ai-tutor
   cd frontend
   npm install
   cd ../backend
   pip install -r requirements.txt
   
   Run backend
   uvicorn app.main:app --reload

   Run frontend
   npm run dev





