# app/routes/session.py
from fastapi import APIRouter, HTTPException
from app.services.session_service import get_session, save_session

router = APIRouter()

@router.get("/")
def read_session():
    try:
        session=get_session()
        return session
    except Exception:
        raise HTTPException(status_code=500,detail="Could not load session")

@router.get("/student")
def read_student():
    try:
        session=get_session()
        if "student" not in session:
            raise HTTPException(status_code=404,detail="student data not found")
        return session["student"]
    except Exception:
         raise HTTPException(status_code=500, detail="Could not load session")