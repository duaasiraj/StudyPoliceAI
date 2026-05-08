import json 
import os
# This finds session.json wherever the backend is running from
SESSION_FILE=os.path.join(os.path.dirname(__file__), "../../session.json")

def get_session()->dict:
    if not os.path.exists(SESSION_FILE):
        return{}
    with open(SESSION_FILE, "r") as f:
        return json.load(f)

def save_session(data:dict)->None:
    with open(SESSION_FILE, "w") as f:
        json.dump(data, f, indent=2)
