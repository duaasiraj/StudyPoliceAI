# app/routes/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_service import get_session, save_session
from app.services.ai_service import call_gemini
from datetime import datetime

router = APIRouter()

class ChatMessage(BaseModel):
    message: str

@router.post("/")
async def chat(body: ChatMessage):
    try:
        session = get_session()
        study_mode = session["settings"]["study_mode"]
        # Determine effective persona without touching session
        effective_persona = _get_effective_persona(session, body.message, study_mode)
        # Only increment violations if actually being roasted
        if study_mode and not _is_academic_message(body.message):
            session["enforcement"]["study_mode_violations"] += 1
        ai_response = await call_gemini(body.message, session, override_persona=effective_persona)
        session["chat_history"].append({
            "role": "user",
            "message": body.message,
            "timestamp": datetime.now().isoformat()
        })
        session["chat_history"].append({
            "role": "assistant",
            "message": ai_response,
            "timestamp": datetime.now().isoformat()
        })

        session["session_meta"]["last_updated"] = datetime.now().isoformat()
        save_session(session)
        return {
            "response": ai_response,
            "persona_used": effective_persona,
            "study_mode": study_mode
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _get_effective_persona(session: dict, message: str, study_mode: bool) -> str:
    # Study mode violation: off-topic message while study mode is on
    if study_mode and not _is_academic_message(message):
        return "roast_engine"
    # Crisis mode: scheduler has loaded the student with >6 hours total
    if _is_in_crisis(session):
        return "crisis_planner"
    # Default: whatever the user has selected
    return session["settings"]["active_persona"]


def _is_in_crisis(session: dict) -> bool:
    """
    Crisis triggers when the generated schedule has more than 6 hours
    of study assigned across all incomplete assessments.
    """
    schedule = session.get("generated_schedule", [])
    if not schedule:
        return False
    # Get IDs of incomplete assessments
    incomplete_ids = {
        a["assessment_id"]
        for a in session.get("assessments", [])
        if not a["completed"]
    }
    # Count slots (each = 30 min) belonging to incomplete assessments
    total_slots = sum(
        1 for entry in schedule
        if entry["assessment_id"] in incomplete_ids
    )
    total_hours = total_slots * 0.5
    return total_hours > 6


def _is_academic_message(message: str) -> bool:
    msg = message.lower()

    off_topic_signals = [
        "netflix", "youtube", "game", "movie", "food", "hungry",
        "bored", "tired", "meme", "tiktok", "instagram",
        "don't wanna", "dont wanna", "don't want to", "dont want to"
    ]
    if any(kw in msg for kw in off_topic_signals):
        return False

    academic_keywords = [
        "study", "exam", "assignment", "deadline", "gpa", "course",
        "lecture", "quiz", "project", "schedule", "grade", "marks",
        "help", "explain", "understand", "homework", "submission",
        "error", "code", "concept", "topic", "chapter", "notes"
    ]
    return any(kw in msg for kw in academic_keywords)