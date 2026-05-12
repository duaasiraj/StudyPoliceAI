from datetime import date, datetime


def calculate_urgency(due_date_str: str, current_date: date) -> float:
    due = datetime.strptime(due_date_str, "%Y-%m-%d").date()
    days_remaining = (due - current_date).days
    if days_remaining <= 0:
        return 1.0        # overdue
    elif days_remaining >= 14:
        return 0.1        
    else:
        return round(1.0 - (days_remaining / 14), 2)


def calculate_gpa_risk(current_gpa: float, target_gpa: float) -> float:
    gap = target_gpa - current_gpa
    if gap <= 0:
        return 0.0        # already at or above target
    return round(min(gap / 4.0, 1.0), 2)


def heuristic(assessment: dict, course: dict, current_date: date) -> float:

    urgency = calculate_urgency(assessment["due_date"], current_date)
    gpa_risk = calculate_gpa_risk(course["current_gpa"], course["target_gpa"])
    return round((urgency * 0.6) + (gpa_risk * 0.4), 3)


def run_astar(
    available_slots: list[dict],
    assessments: list[dict],
    courses: list[dict],
    current_date: date
) -> list[dict]:
    # Only incomplete assessments
    incomplete = [a for a in assessments if not a["completed"]]
    # Build course lookup: {"CS301": {course dict}, ...}
    course_map = {c["course_id"]: c for c in courses}
    # Score every assessment
    scored = []
    for assessment in incomplete:
        course = course_map.get(assessment["course_id"])
        if course:
            score = heuristic(assessment, course, current_date)
            scored.append((score, assessment))
    # Sort highest priority first-descending
    scored.sort(reverse=True, key=lambda x: (x[0], x[1]["assessment_id"]))
    # Assign slots
    schedule = []
    slot_index = 0
    
    for score, assessment in scored:
        slots_needed = assessment["estimated_hours"] * 2  # 2 slots per hour (30 min each)
        assigned = 0    
        while assigned < slots_needed and slot_index < len(available_slots):
            slot = available_slots[slot_index]
            schedule.append({
                "assessment_id": assessment["assessment_id"],
                "course_id": assessment["course_id"],
                "title": assessment["title"],
                "due_date": assessment["due_date"],
                "date": slot["date"],
                "day_name": slot["day_name"],
                "start_time": slot["start_time"],
                "end_time": slot["end_time"],
                "priority_score": score
            })
            slot_index += 1
            assigned += 1
    
    return schedule