from fastapi import APIRouter, HTTPException
from app.services.session_service import get_session
from app.services.scheduler_service import generate_full_schedule

router = APIRouter()

@router.post("/generate")
def generate_schedule():
    try:
        return generate_full_schedule()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def get_schedule():
    session = get_session()
    return session["generated_schedule"]