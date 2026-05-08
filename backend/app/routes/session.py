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
    except HTTPException:
        raise
    except Exception:
         raise HTTPException(status_code=500, detail="Could not load session")
    
@router.get("/courses")
def read_courses():
    try:
        session = get_session()
        if "courses" not in session:
            raise HTTPException(status_code=404, detail="Courses not found")
        return session["courses"]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load session")


@router.get("/assessments")
def read_assessments():
    try:
        session = get_session()
        if "assessments" not in session:
            raise HTTPException(status_code=404, detail="Assessments not found")
        return session["assessments"]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load session")


@router.get("/calendar")
def read_calendar():
    try:
        session = get_session()
        if "calendar" not in session:
            raise HTTPException(status_code=404, detail="Calendar not found")
        calendar = session["calendar"]
        if "booked_blocks" not in calendar:
            raise HTTPException(status_code=404, detail="Booked blocks not found")
        return calendar["booked_blocks"]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load session")