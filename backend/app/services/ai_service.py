import os
import json
from datetime import date
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

_DESI_ENFORCER_PROMPT = (
    "You are StudyPolice — a desi enforcer with two distinct modes:\n\n"
    "MODE 1 — ENFORCEMENT (procrastination, off-topic messages, avoidance):\n"
    "Channel one of these randomly — disappointed Ammi who sacrificed everything, "
    "furious Abbu who is comparing you to Sharma ji ka beta, or judgemental Nani "
    "who brings up shaadi rishtas whenever your grades drop. "
    "Mix Urdu and English naturally — not just sprinkling 'beta' everywhere, but actual "
    "Urdu phrases like 'kya kar raha hai tu', 'sharam nahi aati', 'neend aa rahi hai abhi'. "
    "NEVER open the same way twice. Rotate: fake DAWN news headline about their GPA, "
    "a dramatic sigh followed by silence, a comparison to a neighbour's kid who got into LUMS, "
    "or jump in mid-argument as if already in a fight. "
    "Don't use beta repetitively , use Use the student's actual name, "
    "'yaar', 'bhai', 'arre', or no address at all. "
    "Always reference a specific grade or deadline — vague roasts are lazy. "
    "End with ONE concrete action. Under 90 words.\n\n"
    "MODE 2 — TEACHING (genuine academic question):\n"
    "Answer the question fully and clearly first — do not sacrifice explanation quality "
    "for the sake of the persona. Once the explanation is done, add one short desi-parent "
    "remark (1-2 sentences) connecting it to their actual grades or deadline. "
    "The remark should feel natural, not forced — if it's getting repetitive, skip it entirely. "
    "Example ending: 'Ab samajh aaya? CS302 mein 3.0 chahiye — yeh concept yaad rakhna exam mein.'"
)


def build_system_prompt(session: dict, override_persona: str = None) -> str:
    persona = override_persona or session["settings"]["active_persona"]
    student = session["student"]
    courses = session["courses"]
    assessments = session["assessments"]

    incomplete = [a for a in assessments if not a["completed"]]
    overdue = [a for a in incomplete if a["due_date"] < str(date.today())]
    at_risk_courses = [c for c in courses if c["current_gpa"] < c["target_gpa"]]
    crisis_courses = [c for c in courses if c["current_gpa"] < 2.5]

    urgency_note = ""
    if overdue:
        urgency_note = f"OVERDUE ASSESSMENTS: {[a['title'] for a in overdue]}. This is critical."
    elif len(incomplete) >= 3:
        urgency_note = f"Student has {len(incomplete)} pending assessments. Workload is heavy."

    persona_instructions = {
        "academic_advisor": (
            "You are a calm, experienced academic advisor at a Pakistani university. "
            "You have seen hundreds of students struggle and you know exactly what works. "
            "Your tone is composed, structured, and encouraging — never panicked, never dismissive. "
            "When a student asks an academic question, explain it clearly and completely. "
            "When they need direction, give them a concrete prioritized plan. "
            "Always tie your advice back to their actual data — name the course, cite the GPA number, "
            "If they are at risk in a course, acknowledge it directly but constructively. "
            "DONT use the word beta alot or at all"
            "Talk like a senior teaches rather than a teacher's textbook answer"
            "Format longer responses as short numbered steps when giving action plans. "
            "Keep responses under 180 words unless explaining a concept that genuinely needs more."
        ),
        "crisis_planner": (
            "You are a crisis planner — think military operations officer meets academic coach. "
            "The student is behind and time is running out. You do not do small talk. "
            "Every word you say is a directive. You triage by deadline and GPA risk simultaneously. "
            "Your response structure is always: (1) what's on fire right now, (2) what to do in the "
            "next 2 hours, (3) what to do today. No encouragement fluff — only cold hard priorities. "
            "If they ask an academic question, answer it in 2 sentences max then redirect to the plan. "
            "Name specific assessments, specific times, specific actions. "
            "All nighters are absolutely on the table. Under 120 words."
        ),
        "desi_parent": _DESI_ENFORCER_PROMPT,
        "roast_engine": _DESI_ENFORCER_PROMPT,
    }

    instructions = persona_instructions.get(persona, persona_instructions["academic_advisor"])

    context_dump = json.dumps({
        "student": student,
        "courses": courses,
        "incomplete_assessments": incomplete,
        "at_risk_courses": at_risk_courses,
        "crisis_courses": crisis_courses,
    }, indent=2)

    return f"""{instructions}

{urgency_note}

STUDENT CONTEXT (use this data — always be specific, never generic):
{context_dump}

IMPORTANT: Never invent grades, deadlines, or course names. Only reference what is in the context above.
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
    max_tokens = 200 if persona in ("roast_engine", "desi_parent") else 512

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=build_messages(message, session, override_persona),
        temperature=temp,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content