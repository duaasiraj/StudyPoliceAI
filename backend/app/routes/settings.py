# app/routes/settings.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.session_service import get_session, save_session

router = APIRouter()

@router.patch("/study-mode")
def toggle_study_mode():
    session = get_session()
    # Flip it: if True → False, if False → True
    current = session["settings"]["study_mode"]
    session["settings"]["study_mode"] = not current
    save_session(session)
    return {"study_mode": session["settings"]["study_mode"]}

@router.patch("/persona")
def set_persona(persona: str):
    session = get_session()
    allowed = session["settings"]["available_personas"]
    
    if persona not in allowed:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: {allowed}")
    
    session["settings"]["active_persona"] = persona
    save_session(session)
    return {"active_persona": persona}

@router.get("/")
def get_settings():
    try:
        session = get_session()
        return session.get("settings", {})
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load settings")