# app/routes/calendar.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_service import get_session, save_session
import uuid
from algorithms.csp import time_to_minutes 
router = APIRouter()

class NewCalendarBlock(BaseModel):
    label: str
    date: str        # full date string "YYYY-MM-DD"
    start_time: str  # "HH:MM"
    end_time: str
    type: str        # "class", "lab", "personal", "sleep"
    recurring: bool

@router.get("/")
def get_blocks():
    session = get_session()
    return {"booked_blocks": session["calendar"]["booked_blocks"]}

@router.post("/")
def add_block(block: NewCalendarBlock):
    session = get_session()
    # Use a short uuid suffix so IDs are always unique even after deletions
    unique_id = f"CB-{uuid.uuid4().hex[:8].upper()}"
    new_block = {
        "block_id": unique_id,
        **block.model_dump()
    }
    if time_to_minutes(block.end_time) <= time_to_minutes(block.start_time):
        raise HTTPException(status_code=400, detail="end_time must be after start_time")
    session["calendar"]["booked_blocks"].append(new_block)
    save_session(session)
    return {"message": "Block added", "block": new_block}

@router.delete("/{block_id}")
def delete_block(block_id: str):
    session = get_session()
    blocks = session["calendar"]["booked_blocks"]
    filtered = [b for b in blocks if b["block_id"] != block_id]
    if len(filtered) == len(blocks):
        raise HTTPException(status_code=404, detail="Block not found")
    session["calendar"]["booked_blocks"] = filtered
    save_session(session)
    return {"message": "Deleted"}