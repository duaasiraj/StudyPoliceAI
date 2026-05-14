# app/routes/settings.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_service import get_session, save_session

router = APIRouter()
VALID_PERSONAS = {"academic_advisor", "crisis_planner" ,"roast_engine","desi_parent"}

class PersonaUpdate(BaseModel):
    persona: str

@router.patch("/study-mode")
def toggle_study_mode():
    session = get_session()
    current = session["settings"]["study_mode"]
    session["settings"]["study_mode"] = not current
    save_session(session)
    return {"study_mode": session["settings"]["study_mode"]}


@router.get("/study-mode")
def get_study_mode():
    session = get_session()
    return {
        "study_mode": session["settings"]["study_mode"],
        "violations": session["enforcement"]["study_mode_violations"]
    }


@router.patch("/persona")
def set_persona(persona: str):
    session = get_session()
    if persona not in VALID_PERSONAS:
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: {VALID_PERSONAS}")
    session["settings"]["active_persona"] = persona
    save_session(session)
    return {"active_persona": persona}

@router.get("/")
def get_settings():
    session = get_session()
    return session.get("settings", {})