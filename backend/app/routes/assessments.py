# app/routes/assessments.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_service import get_session, save_session
from datetime import datetime

router = APIRouter()

# This is a Pydantic model — it defines what a new assessment must look like
class NewAssessment(BaseModel):
    course_id: str
    title: str
    type: str          # "assignment", "exam", "project"
    due_date: str      # format: "YYYY-MM-DD"
    weightage: int
    estimated_hours: int


@router.get("/")
def list_assessments():
    try:
        session = get_session()
        return session.get("assessments", [])
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not load assessments"
        )


@router.post("/")
def add_assessment(assessment: NewAssessment):
    session = get_session()
    existing_ids = {a["assessment_id"] for a in session["assessments"]}
    counter = 1
    while f"A{counter:03d}" in existing_ids:
        counter += 1
    new_id = f"A{counter:03d}"
    new_entry = {
        "assessment_id": new_id,
        "completed": False,
        "linked_schedule_slots": [],
        **assessment.model_dump()  # spreads all the fields from the Pydantic model
    }
    session["assessments"].append(new_entry)
    save_session(session)
    return {"message": "Assessment added", "assessment": new_entry}

@router.patch("/{assessment_id}/complete")
def mark_complete(assessment_id: str):
    session = get_session()
    assessments = session.get("assessments", [])
    for assessment in assessments:
        if assessment.get("assessment_id") == assessment_id:
            assessment["completed"] = True
            save_session(session)
            return {"message": "Marked complete"}
    raise HTTPException(status_code=404, detail="Assessment not found")
    

@router.delete("/{assessment_id}")
def delete_assessment(assessment_id: str):
    session = get_session()
    assessments = session.get("assessments", [])
    filtered = [a for a in assessments if a.get("assessment_id") != assessment_id]
    if len(filtered) == len(assessments):
        raise HTTPException(status_code=404, detail="Assessment not found")
    session["assessments"] = filtered
    save_session(session)
    return {"message": "Deleted"}