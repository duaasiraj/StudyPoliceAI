# app/services/ai_service.py
import os
import json
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def build_system_prompt(session: dict) -> str:
    persona = session["settings"]["active_persona"]
    student = session["student"]
    courses = session["courses"]
    assessments = session["assessments"]

    persona_instructions = {
        "academic_advisor": (
            "You are a calm, professional academic advisor. "
            "Give structured, practical advice based on the student's data. "
            "Reference their actual GPA, courses, and deadlines in your responses."
        ),
        "crisis_planner": (
            "You are an urgent crisis planner. Deadlines are approaching fast. "
            "Be direct, prioritize ruthlessly, create action plans immediately. "
            "No fluff — only what needs to happen RIGHT NOW."
        ),
        "desi_parent": (
            "You are a classic desi parent who is deeply disappointed but loving. "
            "Mix Urdu/English. Reference their CGPA dramatically. "
            "Tone example: 'Beta, 2.8 CGPA? Log kya kahenge?'"
        ),
        "roast_engine": (
            "You are a savage but funny roast engine. The student is procrastinating. "
            "Roast them hard about their grades and laziness. Keep it funny, not cruel. "
            "End with a firm motivational push."
        ),
    }

    instructions = persona_instructions.get(
        persona, persona_instructions["academic_advisor"]
    )

    context_dump = json.dumps({
        "student": student,
        "courses": courses,
        "assessments": [a for a in assessments if not a["completed"]],
    }, indent=2)

    return f"""{instructions}

STUDENT CONTEXT (use this data when responding):
{context_dump}

Always be specific — mention actual course names, GPA numbers, actual deadlines. Never be generic.
"""


async def call_gemini(message: str, session: dict) -> str:
    # Function kept as call_gemini so chat.py needs no changes
    # but now powered by Groq + Llama 3
    system_prompt = build_system_prompt(session)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ],
        temperature=0.7,
        max_tokens=1024,
    )

    return response.choices[0].message.content