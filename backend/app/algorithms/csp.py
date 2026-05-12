from datetime import datetime, date, timedelta
SLOT_DURATION = 30  # minutes
def time_to_minutes(time_str: str) -> int:
    #Convert "HH:MM" to total minutes since midnight.
    #like 6hrs and 30 minutes"18:30"  1110
    parts=time_str.split(":")
    return int(parts[0])*60+int(parts[1])



def is_conflicting(slot: dict, block: dict) -> bool:
    # Check if a study slot conflicts with a calendar block.
    # A conflict exists when:
    # 1. The block applies to this day (recurring=True OR same date)
    # 2. AND the times overlap
    if block["recurring"]:
        day_match = True  #if recurring 
    else:
        # block["date"] is "YYYY-MM-DD"; extract day number to compare with slot["date"]
        try:
            block_day = int(str(block["date"]).split("-")[-1]) if "-" in str(block["date"]) else int(block["date"])
        except (ValueError, TypeError):
            block_day = int(block["date"])
        day_match = block_day == slot["date"]
    if not day_match:
        return False
    #if dates match now check if times overlap too
    slot_start=time_to_minutes(slot["start_time"])
    slot_end=time_to_minutes(slot["end_time"])
    block_start=time_to_minutes(block["start_time"])
    block_end=time_to_minutes(block["end_time"])
    return slot_start < block_end and block_start < slot_end


def generate_all_slots(
    study_window_start: str,
    study_window_end: str,
    current_date: date,
    month_end_day: int = 31
) -> list[dict]:
#generate all possible slots from today till end of the month
    slots = []
    window_start = datetime.strptime(study_window_start, "%H:%M")#user ki preferred
    window_end = datetime.strptime(study_window_end, "%H:%M")
    # Loop from today's date number to end of month
    for day_num in range(current_date.day, month_end_day + 1):
        try:
            actual_date = date(current_date.year, current_date.month, day_num)
        except ValueError:
            continue  # skip invalid dates (e.g. day 31 in a 30-day month)
        day_name = actual_date.strftime("%A")  # "Monday", "Tuesday" etc
        # Generate 30-min slots within the study window for this day
        current_time = window_start
        while current_time + timedelta(minutes=SLOT_DURATION) <= window_end:
            slot_end = current_time + timedelta(minutes=SLOT_DURATION)
            slots.append({
                "date": day_num,
                "day_name": day_name,
                "start_time": current_time.strftime("%H:%M"),
                "end_time": slot_end.strftime("%H:%M"),
                "available": True
            })
            current_time += timedelta(minutes=SLOT_DURATION)
    
    return slots


def run_ac3(slots: list[dict], booked_blocks: list[dict]) -> list[dict]:
    # AC-3: Mark every slot that conflicts with any booked block as unavailable.
    # Return only the available slots.
    for slot in slots:
        for block in booked_blocks:
            if is_conflicting(slot, block):
                slot["available"] = False
                break  # already blocked, no need to check more
    
    return [s for s in slots if s["available"] ]