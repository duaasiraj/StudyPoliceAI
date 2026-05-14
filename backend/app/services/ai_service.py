import os
import json
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def build_system_prompt(session: dict, override_persona: str = None) -> str:
    persona = override_persona or session["settings"]["active_persona"]
    student = session["student"]
    courses = session["courses"]
    assessments = session["assessments"]

    persona_instructions = {
        "academic_advisor": (
            "You are a calm, professional academic advisor. "
            "Give structured, practical advice based on the student's data. "
            "Reference their actual GPA, courses, and deadlines in your responses. "
            "Keep responses concise and actionable, under 150 words."
        ),
        "crisis_planner": (
            "You are an urgent crisis planner. Deadlines are approaching fast. "
            "Be direct, prioritize ruthlessly, create action plans immediately. "
            "No fluff — only what needs to happen RIGHT NOW. Under 100 words."
        ),
        "desi_parent": (
            "You are StudyPolice — a savage desi enforcer who roasts procrastinating students. "
            "You switch randomly between: a disappointed Ammi, a furious Abbu, a judgemental Nani, "
            "and a ruthless roast comedian. Mix Urdu/English naturally. "
            "RULES: Never start with the student's name. Never open the same way twice. "
            "Rotate your opening — use a fake news headline, a disappointed sigh, a metaphor, "
            "a comparison to the neighbour's kid, or jump in mid-rant. "
            "Reference their actual GPA numbers and real deadlines. "
            "Mention izzat, chai, log kya kahenge, or shaadi season at least once when it fits. "
            "Keep it under 100 words. End with ONE specific action they must do right now."
        ),
        "roast_engine": (
            "You are StudyPolice — a savage desi enforcer who roasts procrastinating students. "
            "You switch randomly between: a disappointed Ammi, a furious Abbu, a judgemental Nani, "
            "and a ruthless roast comedian. Mix Urdu/English naturally. "
            "RULES: Never start with the student's name. Never open the same way twice. "
            "Rotate your opening — use a fake news headline, a disappointed sigh, a metaphor, "
            "a comparison to the neighbour's kid, or jump in mid-rant. "
            "Reference their actual GPA numbers and real deadlines. "
            "Mention izzat, chai, log kya kahenge, or shaadi season at least once when it fits. "
            "Keep it under 100 words. End with ONE specific action they must do right now."
        ),
    }

    instructions = persona_instructions.get(persona, persona_instructions["academic_advisor"])

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


def build_messages(message: str, session: dict, override_persona: str = None) -> list:
    system_prompt = build_system_prompt(session, override_persona)
    messages = [{"role": "system", "content": system_prompt}]
    history = session.get("chat_history", [])[-6:]
    for entry in history:
        role = "user" if entry["role"] == "user" else "assistant"
        messages.append({"role": role, "content": entry["message"]})

    messages.append({"role": "user", "content": message})
    return messages


async def call_gemini(message: str, session: dict, override_persona: str = None) -> str:
    persona = override_persona or session["settings"]["active_persona"]
    temp = 0.9 if persona in ("roast_engine", "desi_parent") else 0.7

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=build_messages(message, session, override_persona),  # <-- here
        temperature=temp,
        max_tokens=512,
    )

    return response.choices[0].message.content