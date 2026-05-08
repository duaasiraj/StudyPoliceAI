# app/routes/calendar.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_service import get_session, save_session

router = APIRouter()

class NewCalendarBlock(BaseModel):
    label: str
    day: str        # "Monday", "Tuesday", etc. or "all"
    start_time: str # "HH:MM"
    end_time: str
    type: str       # "class", "lab", "personal", "sleep"
    recurring: bool

@router.post("/")
def add_block(block: NewCalendarBlock):
    session = get_session()
    count = len(session["calendar"]["booked_blocks"]) + 1
    new_block = {
        "block_id": f"CB{count:03d}",
        **block.model_dump()
    }
    session["calendar"]["booked_blocks"].append(new_block)
    save_session(session)
    return {"message": "Block added", "block": new_block}

@router.delete("/{block_id}")
def delete_block(block_id: str):
    try:
        session = get_session()
        blocks = session["calendar"]["booked_blocks"]
        filtered = [
            b for b in blocks
            if b["block_id"] != block_id
        ]
        if len(filtered) == len(blocks):
            raise HTTPException(status_code=404, detail="Block not found")
        session["calendar"]["booked_blocks"] = filtered
        save_session(session)
        return {"message": "Deleted"}

    except Exception:
        raise HTTPException(status_code=500, detail="Could not delete block")