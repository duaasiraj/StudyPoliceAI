from datetime import date
from app.algorithms.csp import generate_all_slots, run_ac3
from app.algorithms.astar import run_astar
from app.services.session_service import get_session, save_session
import traceback

def generate_full_schedule() -> dict:
    try:
        session = get_session()
        settings = session["settings"]
        booked_blocks = session["calendar"]["booked_blocks"]
        assessments = session["assessments"]
        courses = session["courses"]
        today = date.today()
        # Step 1: CSP — generate all slots in study window from today to end of month
        all_slots = generate_all_slots(
            settings["preferred_study_window"]["start_time"],
            settings["preferred_study_window"]["end_time"],
            today
        )
        # Step 2: AC-3 — prune conflicting slots
        available_slots = run_ac3(all_slots, booked_blocks)
        # Step 3: A* — assign slots to assessments by priority
        schedule = run_astar(available_slots,assessments,courses,today,max_hours_per_day=settings.get("study_hours_per_day", 4))        # Step 4: Clear old linked_schedule_slots on ALL assessments
        for assessment in session["assessments"]:
            assessment["linked_schedule_slots"] = []

        # Step 5: Write new linked_schedule_slots back to each assessment
        # Group schedule entries by assessment_id first
        from collections import defaultdict
        slots_by_assessment = defaultdict(list)
        for entry in schedule:
            slots_by_assessment[entry["assessment_id"]].append({
                "date": entry["date"],
                "day_name": entry["day_name"],
                "start_time": entry["start_time"],
                "end_time": entry["end_time"]
            })
        for assessment in session["assessments"]:
            aid = assessment["assessment_id"]
            if aid in slots_by_assessment:
                assessment["linked_schedule_slots"] = slots_by_assessment[aid]
        session["generated_schedule"] = schedule
        save_session(session)
        return {
            "message": f"Schedule generated: {len(schedule)} study slots assigned",
            "total_available_slots": len(available_slots),
            "assessments_scheduled": len(slots_by_assessment),
            "schedule": schedule
        }
    except Exception as e:
        print(traceback.format_exc())  # prints full error with line number
        raise