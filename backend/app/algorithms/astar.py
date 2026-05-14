from datetime import date, datetime
from collections import defaultdict


def calculate_urgency(due_date_str: str, current_date: date) -> float:
    due = datetime.strptime(due_date_str, "%Y-%m-%d").date()
    days_remaining = (due - current_date).days
    if days_remaining <= 0:
        return 1.0
    elif days_remaining >= 14:
        return 0.1
    else:
        return round(1.0 - (days_remaining / 14), 2)


def calculate_gpa_risk(current_gpa: float, target_gpa: float) -> float:
    gap = target_gpa - current_gpa
    if gap <= 0:
        return 0.0
    return round(min(gap / 4.0, 1.0), 2)


def heuristic(assessment: dict, course: dict, current_date: date) -> float:
    urgency = calculate_urgency(assessment["due_date"], current_date)
    gpa_risk = calculate_gpa_risk(course["current_gpa"], course["target_gpa"])
    return round((urgency * 0.6) + (gpa_risk * 0.4), 3)


def run_astar(
    available_slots: list[dict],
    assessments: list[dict],
    courses: list[dict],
    current_date: date,
    max_hours_per_day: float = 4.0
) -> list[dict]:
    # Reset per-call — never at module level
    daily_hours_used = defaultdict(float)
    incomplete = [a for a in assessments if not a["completed"]]
    course_map = {c["course_id"]: c for c in courses}
    scored = []
    for assessment in incomplete:
        course = course_map.get(assessment["course_id"])
        if course:
            score = heuristic(assessment, course, current_date)
            scored.append((score, assessment))
    scored.sort(reverse=True, key=lambda x: (x[0], x[1]["assessment_id"]))
    schedule = []
    for score, assessment in scored:
        slots_needed = int(assessment["estimated_hours"] * 2)
        assigned = 0
        due_date_obj = datetime.strptime(assessment["due_date"], "%Y-%m-%d").date()
        # Local search pointer — skipped slots stay available for other assessments
        search_index = 0
        while assigned < slots_needed and search_index < len(available_slots):
            slot = available_slots[search_index]
            slot_date = slot["date"]
            # Don't assign slots past the due date
            slot_date_obj = date(current_date.year, current_date.month, slot_date)
            if slot_date_obj > due_date_obj:
                break
            # Skip if this day is already at the daily cap
            if daily_hours_used[slot_date] >= max_hours_per_day:
                search_index += 1
                continue
            daily_hours_used[slot_date] += 0.5
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
            search_index += 1
            assigned += 1

    return schedule