# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import session, chat, scheduler

app = FastAPI(title="StudyPolice AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


app.include_router(session.router, prefix="/api/session", tags=["Session"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(scheduler.router, prefix="/api/scheduler", tags=["Scheduler"])

@app.get("/ping")
def ping():
    return {"message": "StudyPolice AI backend is alive"}