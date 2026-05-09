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
        if study_mode:
            is_academic = _is_academic_message(body.message)
            if not is_academic:
                session["settings"]["active_persona"] = "roast_engine"
                session["enforcement"]["study_mode_violations"] += 1
        ai_response = await call_gemini(body.message, session)
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
            "persona_used": session["settings"]["active_persona"],
            "study_mode": study_mode
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _is_academic_message(message: str) -> bool:
    """
    Simple keyword check to detect if a message is study-related.
    Not AI — just a fast keyword scan. Good enough for demo purposes.
    """
    academic_keywords = [
        "study", "exam", "assignment", "deadline", "gpa", "course",
        "lecture", "quiz", "project", "schedule", "grade", "marks",
        "help", "explain", "understand", "homework", "submission"
    ]
    message_lower = message.lower()
    return any(
        keyword in message_lower
        for keyword in academic_keywords
    )