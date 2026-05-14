import json 
import os
# This finds session.json wherever the backend is running from
SESSION_FILE=os.path.join(os.path.dirname(__file__), "../../session.json")

def get_session() -> dict:
    if not os.path.exists(SESSION_FILE):
        raise FileNotFoundError("session.json missing — run setup first")
    with open(SESSION_FILE, "r") as f:
        data = json.load(f)
    # Guard against missing keys
    for key in ("settings", "assessments", "courses", "calendar", "enforcement", "chat_history"):
        if key not in data:
            raise ValueError(f"Corrupt session.json: missing key '{key}'")
    return data

def save_session(data:dict)->None:
    with open(SESSION_FILE, "w") as f:
        json.dump(data, f, indent=2)
